// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DesignRegistry
 * @notice ERC-721 + ERC-4906 Dynamic NFT for artist design portfolios on Eidos8004.
 *         Each token represents a design. Artists attach Artifacts (visual elements)
 *         with individual prices. The threshold price = sum of all artifact prices.
 * @dev Deploy on Base Sepolia via Remix IDE (Chain ID 84532).
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DesignRegistry is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // --- Structs ---

    struct Artifact {
        string name;
        string description;
        uint256 priceInWei; // Price denominated in wei (or stablecoin smallest unit)
        bool active;
    }

    struct Design {
        address artist;
        string title;
        string description;
        string category;
        string ipfsCid;        // IPFS CID for visual assets
        string[] tags;
        uint256 thresholdPrice; // Auto-calculated: sum of artifact prices
        uint256 createdAt;
        bool isPublic;
    }

    // --- Storage ---

    mapping(uint256 => Design) public designs;
    mapping(uint256 => Artifact[]) public designArtifacts;
    mapping(address => uint256[]) public artistDesigns;

    uint256 public totalDesigns;

    // --- Events ---

    event DesignMinted(
        uint256 indexed tokenId,
        address indexed artist,
        string title,
        string ipfsCid,
        uint256 timestamp
    );

    event ArtifactAdded(
        uint256 indexed designId,
        uint256 artifactIndex,
        string name,
        uint256 priceInWei
    );

    event ArtifactUpdated(
        uint256 indexed designId,
        uint256 artifactIndex,
        uint256 newPrice
    );

    event ThresholdPriceUpdated(
        uint256 indexed designId,
        uint256 newThreshold
    );

    // --- Constructor ---

    constructor() ERC721("Eidos8004 Design", "EIDOS") Ownable(msg.sender) {}

    // --- Core Functions ---

    /**
     * @notice Mint a new design NFT.
     * @param _title Design title
     * @param _description Design description
     * @param _category Design category (e.g. "UI Kit", "Logo", "Illustration")
     * @param _ipfsCid IPFS content identifier for the design assets
     * @param _tags Searchable tags
     * @param _tokenURI Metadata URI (IPFS JSON)
     */
    function mintDesign(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _ipfsCid,
        string[] memory _tags,
        string memory _tokenURI
    ) external returns (uint256) {
        _nextTokenId++;
        uint256 newTokenId = _nextTokenId;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        designs[newTokenId] = Design({
            artist: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            ipfsCid: _ipfsCid,
            tags: _tags,
            thresholdPrice: 0,
            createdAt: block.timestamp,
            isPublic: true
        });

        artistDesigns[msg.sender].push(newTokenId);
        totalDesigns++;

        emit DesignMinted(newTokenId, msg.sender, _title, _ipfsCid, block.timestamp);
        return newTokenId;
    }

    /**
     * @notice Add an artifact to a design. Only the artist (token owner) can add.
     * @param _designId Token ID of the design
     * @param _name Artifact name (e.g. "Color palette", "Typography style")
     * @param _description Artifact description
     * @param _priceInWei Price for this specific artifact
     */
    function addArtifact(
        uint256 _designId,
        string memory _name,
        string memory _description,
        uint256 _priceInWei
    ) external {
        require(ownerOf(_designId) == msg.sender, "Not the design owner");
        require(_priceInWei > 0, "Price must be positive");

        designArtifacts[_designId].push(Artifact({
            name: _name,
            description: _description,
            priceInWei: _priceInWei,
            active: true
        }));

        uint256 artifactIndex = designArtifacts[_designId].length - 1;

        // Recalculate threshold price
        _recalculateThreshold(_designId);

        emit ArtifactAdded(_designId, artifactIndex, _name, _priceInWei);
        emit MetadataUpdate(_designId);
    }

    /**
     * @notice Update an artifact's price.
     */
    function updateArtifactPrice(
        uint256 _designId,
        uint256 _artifactIndex,
        uint256 _newPrice
    ) external {
        require(ownerOf(_designId) == msg.sender, "Not the design owner");
        require(_artifactIndex < designArtifacts[_designId].length, "Invalid artifact");
        require(_newPrice > 0, "Price must be positive");

        designArtifacts[_designId][_artifactIndex].priceInWei = _newPrice;

        _recalculateThreshold(_designId);

        emit ArtifactUpdated(_designId, _artifactIndex, _newPrice);
        emit MetadataUpdate(_designId);
    }

    /**
     * @notice Toggle artifact active status.
     */
    function toggleArtifact(uint256 _designId, uint256 _artifactIndex) external {
        require(ownerOf(_designId) == msg.sender, "Not the design owner");
        require(_artifactIndex < designArtifacts[_designId].length, "Invalid artifact");

        designArtifacts[_designId][_artifactIndex].active =
            !designArtifacts[_designId][_artifactIndex].active;

        _recalculateThreshold(_designId);
        emit MetadataUpdate(_designId);
    }

    // --- View Functions ---

    function getDesign(uint256 _designId) external view returns (Design memory) {
        require(_exists(_designId), "Design does not exist");
        return designs[_designId];
    }

    function getDesignArtifacts(uint256 _designId) external view returns (Artifact[] memory) {
        return designArtifacts[_designId];
    }

    function getArtistDesigns(address _artist) external view returns (uint256[] memory) {
        return artistDesigns[_artist];
    }

    function getArtifactCount(uint256 _designId) external view returns (uint256) {
        return designArtifacts[_designId].length;
    }

    /**
     * @notice Calculate the total price for a set of specific artifacts.
     */
    function calculateArtifactsCost(
        uint256 _designId,
        uint256[] calldata _artifactIds
    ) external view returns (uint256 totalCost) {
        for (uint256 i = 0; i < _artifactIds.length; i++) {
            require(_artifactIds[i] < designArtifacts[_designId].length, "Invalid artifact ID");
            Artifact storage art = designArtifacts[_designId][_artifactIds[i]];
            require(art.active, "Artifact is inactive");
            totalCost += art.priceInWei;
        }
    }

    // --- Internal ---

    function _recalculateThreshold(uint256 _designId) internal {
        uint256 total = 0;
        Artifact[] storage artifacts = designArtifacts[_designId];
        for (uint256 i = 0; i < artifacts.length; i++) {
            if (artifacts[i].active) {
                total += artifacts[i].priceInWei;
            }
        }
        designs[_designId].thresholdPrice = total;
        emit ThresholdPriceUpdated(_designId, total);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // --- Overrides ---

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return
            interfaceId == bytes4(0x49064906) || // ERC-4906
            super.supportsInterface(interfaceId);
    }
}
