// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AttributionPayment
 * @notice Handles artifact-based attribution payments between client agents
 *         and artist agents on the Eidos8004 platform.
 *         Integrates with x402 payment protocol pattern.
 * @dev Deploy on Base Sepolia via Remix IDE.
 */

interface IDesignRegistry {
    struct Artifact {
        string name;
        string description;
        uint256 priceInWei;
        bool active;
    }

    struct Design {
        address artist;
        string title;
        string description;
        string category;
        string ipfsCid;
        string[] tags;
        uint256 thresholdPrice;
        uint256 createdAt;
        bool isPublic;
    }

    function getDesign(uint256 _designId) external view returns (Design memory);
    function getDesignArtifacts(uint256 _designId) external view returns (Artifact[] memory);
    function calculateArtifactsCost(uint256 _designId, uint256[] calldata _artifactIds) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IAgentRegistry {
    function isRegisteredAgent(address _wallet) external view returns (bool);
    function walletToAgentId(address _wallet) external view returns (uint256);
}

contract AttributionPayment {

    // --- Structs ---

    struct Attribution {
        uint256 designId;
        address clientAgent;
        address artistAgent;
        address artist;
        uint256[] artifactIds;
        uint256 totalPaid;
        bytes32 x402ProofHash; // Hash of x402 payment proof
        uint256 timestamp;
    }

    // --- Storage ---

    IDesignRegistry public designRegistry;
    IAgentRegistry public agentRegistry;

    Attribution[] public attributions;
    mapping(address => uint256[]) public artistAttributions;   // artist => attribution indices
    mapping(address => uint256[]) public clientAttributions;   // client => attribution indices
    mapping(uint256 => uint256[]) public designAttributions;   // designId => attribution indices

    uint256 public totalPayments;
    uint256 public totalVolume;

    // --- Events ---

    event AttributionPaid(
        uint256 indexed attributionId,
        uint256 indexed designId,
        address indexed artist,
        address clientAgent,
        uint256[] artifactIds,
        uint256 totalPaid,
        bytes32 x402ProofHash,
        uint256 timestamp
    );

    event PaymentReceived(
        address indexed artist,
        uint256 amount,
        uint256 indexed designId,
        uint256 timestamp
    );

    // --- Constructor ---

    constructor(address _designRegistry, address _agentRegistry) {
        designRegistry = IDesignRegistry(_designRegistry);
        agentRegistry = IAgentRegistry(_agentRegistry);
    }

    // --- Core Payment Function ---

    /**
     * @notice Pay for specific artifacts of a design. The client agent sends ETH
     *         equal to the sum of selected artifact prices. The payment goes
     *         directly to the artist.
     * @param _designId The design token ID
     * @param _artifactIds Array of artifact indices being paid for
     * @param _x402ProofHash Hash of the x402 payment proof (off-chain verification)
     */
    function payForArtifacts(
        uint256 _designId,
        uint256[] calldata _artifactIds,
        bytes32 _x402ProofHash
    ) external payable returns (uint256 attributionId) {
        require(_artifactIds.length > 0, "Must specify artifacts");

        // Verify the design exists and get the artist
        IDesignRegistry.Design memory design = designRegistry.getDesign(_designId);
        address artist = design.artist;
        require(artist != address(0), "Design not found");

        // Calculate expected cost
        uint256 expectedCost = designRegistry.calculateArtifactsCost(_designId, _artifactIds);
        require(msg.value >= expectedCost, "Insufficient payment");

        // Transfer payment to artist
        (bool sent, ) = payable(artist).call{value: expectedCost}("");
        require(sent, "Payment transfer failed");

        // Refund excess
        if (msg.value > expectedCost) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - expectedCost}("");
            require(refunded, "Refund failed");
        }

        // Record attribution
        attributionId = attributions.length;
        attributions.push(Attribution({
            designId: _designId,
            clientAgent: msg.sender,
            artistAgent: address(0), // Can be set by artist agent later
            artist: artist,
            artifactIds: _artifactIds,
            totalPaid: expectedCost,
            x402ProofHash: _x402ProofHash,
            timestamp: block.timestamp
        }));

        artistAttributions[artist].push(attributionId);
        clientAttributions[msg.sender].push(attributionId);
        designAttributions[_designId].push(attributionId);

        totalPayments++;
        totalVolume += expectedCost;

        emit AttributionPaid(
            attributionId,
            _designId,
            artist,
            msg.sender,
            _artifactIds,
            expectedCost,
            _x402ProofHash,
            block.timestamp
        );

        emit PaymentReceived(artist, expectedCost, _designId, block.timestamp);

        return attributionId;
    }

    // --- View Functions ---

    function getAttribution(uint256 _id) external view returns (Attribution memory) {
        require(_id < attributions.length, "Invalid attribution ID");
        return attributions[_id];
    }

    function getArtistAttributions(address _artist) external view returns (uint256[] memory) {
        return artistAttributions[_artist];
    }

    function getClientAttributions(address _client) external view returns (uint256[] memory) {
        return clientAttributions[_client];
    }

    function getDesignAttributionHistory(uint256 _designId) external view returns (uint256[] memory) {
        return designAttributions[_designId];
    }

    function getAttributionCount() external view returns (uint256) {
        return attributions.length;
    }

    /**
     * @notice Get platform statistics.
     */
    function getStats() external view returns (
        uint256 _totalPayments,
        uint256 _totalVolume,
        uint256 _totalAttributions
    ) {
        return (totalPayments, totalVolume, attributions.length);
    }
}
