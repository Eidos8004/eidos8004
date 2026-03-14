// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentRegistry
 * @notice ERC-8004 compliant Agent Identity, Reputation, and Validation registry.
 *         Supports two agent types: Client agents (find + negotiate designs)
 *         and Artist agents (compete to sell design inspiration).
 * @dev Deploy on Base Sepolia via Remix IDE.
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistry is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextAgentId;

    // --- Enums ---

    enum AgentType { CLIENT, ARTIST }

    // --- Structs ---

    struct Agent {
        address wallet;
        AgentType agentType;
        string name;
        string ensName; // e.g. "alpha.eidos8004.eth"
        string description;
        string capabilitiesURI; // IPFS URI to agent card JSON
        uint256 registeredAt;
        bool active;
    }

    struct Feedback {
        address submitter;
        uint256 agentId;
        uint8 score;       // 0-100
        string tag;        // e.g. "attribution_quality", "negotiation_skill"
        string uri;        // IPFS URI to detailed feedback
        uint256 timestamp;
    }

    struct ValidationRequest {
        uint256 agentId;
        address requester;
        string requestURI;
        bool fulfilled;
        string responseURI;
        uint8 result; // 0-100
        uint256 timestamp;
    }

    // --- Storage ---

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public walletToAgentId;
    mapping(string => address) public ensToWallet; // Ensure ENS sub-name uniqueness
    mapping(uint256 => Feedback[]) public agentFeedbacks;
    mapping(uint256 => uint256) public agentReputationSum;
    mapping(uint256 => uint256) public agentFeedbackCount;
    mapping(uint256 => ValidationRequest[]) public agentValidations;

    uint256 public totalAgents;

    // --- Events ---

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed wallet,
        AgentType agentType,
        string name,
        uint256 timestamp
    );

    event FeedbackSubmitted(
        uint256 indexed agentId,
        address indexed submitter,
        uint8 score,
        string tag,
        uint256 timestamp
    );

    event ValidationRequested(
        uint256 indexed agentId,
        address indexed requester,
        uint256 validationIndex,
        uint256 timestamp
    );

    event ValidationFulfilled(
        uint256 indexed agentId,
        uint256 validationIndex,
        uint8 result,
        uint256 timestamp
    );

    event AgentDeactivated(uint256 indexed agentId, uint256 timestamp);

    // --- Constructor ---

    constructor() ERC721("Eidos8004 Agent", "EAGENT") Ownable(msg.sender) {}

    // --- Identity Registry ---

    /**
     * @notice Register a new agent with an on-chain identity (ERC-721 NFT).
     * @param _agentType CLIENT or ARTIST
     * @param _name Human-readable agent name
     * @param _description Agent description
     * @param _capabilitiesURI IPFS URI to agent card JSON (A2A/MCP compatible)
     * @param _tokenURI Metadata URI for the NFT
     */
    function registerAgent(
        AgentType _agentType,
        string memory _name,
        string memory _ensName,
        string memory _description,
        string memory _capabilitiesURI,
        string memory _tokenURI
    ) external returns (uint256) {
        require(walletToAgentId[msg.sender] == 0, "Agent already registered");
        require(ensToWallet[_ensName] == address(0), "ENS name already taken");

        _nextAgentId++;
        uint256 newAgentId = _nextAgentId;

        _safeMint(msg.sender, newAgentId);
        _setTokenURI(newAgentId, _tokenURI);

        agents[newAgentId] = Agent({
            wallet: msg.sender,
            agentType: _agentType,
            name: _name,
            ensName: _ensName,
            description: _description,
            capabilitiesURI: _capabilitiesURI,
            registeredAt: block.timestamp,
            active: true
        });

        walletToAgentId[msg.sender] = newAgentId;
        ensToWallet[_ensName] = msg.sender;
        totalAgents++;

        emit AgentRegistered(newAgentId, msg.sender, _agentType, _name, block.timestamp);
        return newAgentId;
    }

    /**
     * @notice Deactivate an agent. Only the agent owner can do this.
     */
    function deactivateAgent(uint256 _agentId) external {
        require(ownerOf(_agentId) == msg.sender, "Not agent owner");
        agents[_agentId].active = false;
        emit AgentDeactivated(_agentId, block.timestamp);
    }

    // --- Reputation Registry ---

    /**
     * @notice Submit feedback/reputation score for an agent.
     * @param _agentId The agent to rate
     * @param _score Score from 0 to 100
     * @param _tag Category tag for the feedback
     * @param _uri IPFS URI to detailed review
     */
    function submitFeedback(
        uint256 _agentId,
        uint8 _score,
        string memory _tag,
        string memory _uri
    ) external {
        require(_agentId <= _nextAgentId && _agentId > 0, "Invalid agent");
        require(_score <= 100, "Score must be 0-100");
        require(agents[_agentId].active, "Agent is not active");

        Feedback memory fb = Feedback({
            submitter: msg.sender,
            agentId: _agentId,
            score: _score,
            tag: _tag,
            uri: _uri,
            timestamp: block.timestamp
        });

        agentFeedbacks[_agentId].push(fb);
        agentReputationSum[_agentId] += _score;
        agentFeedbackCount[_agentId]++;

        emit FeedbackSubmitted(_agentId, msg.sender, _score, _tag, block.timestamp);
    }

    /**
     * @notice Get the average reputation score for an agent.
     */
    function getReputationScore(uint256 _agentId) external view returns (uint256) {
        if (agentFeedbackCount[_agentId] == 0) return 0;
        return agentReputationSum[_agentId] / agentFeedbackCount[_agentId];
    }

    /**
     * @notice Get all feedback for an agent.
     */
    function getAgentFeedbacks(uint256 _agentId) external view returns (Feedback[] memory) {
        return agentFeedbacks[_agentId];
    }

    // --- Validation Registry ---

    /**
     * @notice Request a validation check for an agent.
     */
    function requestValidation(
        uint256 _agentId,
        string memory _requestURI
    ) external returns (uint256) {
        require(_agentId <= _nextAgentId && _agentId > 0, "Invalid agent");

        agentValidations[_agentId].push(ValidationRequest({
            agentId: _agentId,
            requester: msg.sender,
            requestURI: _requestURI,
            fulfilled: false,
            responseURI: "",
            result: 0,
            timestamp: block.timestamp
        }));

        uint256 validationIndex = agentValidations[_agentId].length - 1;
        emit ValidationRequested(_agentId, msg.sender, validationIndex, block.timestamp);
        return validationIndex;
    }

    /**
     * @notice Fulfill a validation request. Only the contract owner can fulfill.
     */
    function fulfillValidation(
        uint256 _agentId,
        uint256 _validationIndex,
        string memory _responseURI,
        uint8 _result
    ) external onlyOwner {
        require(_validationIndex < agentValidations[_agentId].length, "Invalid index");
        ValidationRequest storage vr = agentValidations[_agentId][_validationIndex];
        require(!vr.fulfilled, "Already fulfilled");

        vr.fulfilled = true;
        vr.responseURI = _responseURI;
        vr.result = _result;

        emit ValidationFulfilled(_agentId, _validationIndex, _result, block.timestamp);
    }

    // --- View Functions ---

    function getAgent(uint256 _agentId) external view returns (Agent memory) {
        require(_agentId <= _nextAgentId && _agentId > 0, "Invalid agent");
        return agents[_agentId];
    }

    function getAgentByWallet(address _wallet) external view returns (Agent memory) {
        uint256 agentId = walletToAgentId[_wallet];
        require(agentId > 0, "Agent not found");
        return agents[agentId];
    }

    function isRegisteredAgent(address _wallet) external view returns (bool) {
        uint256 agentId = walletToAgentId[_wallet];
        return agentId > 0 && agents[agentId].active;
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
        return super.supportsInterface(interfaceId);
    }
}
