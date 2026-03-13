// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReputationForum
 * @notice A Moltbook-style on-chain forum for the Eidos8004 design community.
 *         Supports threaded posts, replies, and real-time event emission
 *         for the Submolt Live feed.
 * @dev Deploy on Base Sepolia via Remix IDE.
 */

contract ReputationForum {

    // --- Structs ---

    struct Post {
        uint256 id;
        address author;
        string content;
        string[] tags;
        uint256 parentId; // 0 if top-level post, else reply to parentId
        uint256 createdAt;
        uint256 upvotes;
        uint256 downvotes;
        bool isActive;
    }

    struct LiveEvent {
        uint256 id;
        string eventType; // "post", "reply", "attribution", "agent_register", "design_mint"
        address actor;
        string data;      // JSON-encoded event data
        uint256 timestamp;
    }

    // --- Storage ---

    Post[] public posts;
    LiveEvent[] public liveEvents;

    mapping(address => uint256[]) public userPosts;
    mapping(uint256 => uint256[]) public postReplies; // parentId => child post IDs
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public totalPosts;
    uint256 public totalEvents;

    // --- Events (for Submolt Live real-time feed) ---

    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string content,
        string[] tags,
        uint256 parentId,
        uint256 timestamp
    );

    event PostVoted(
        uint256 indexed postId,
        address indexed voter,
        bool isUpvote,
        uint256 timestamp
    );

    event LiveEventEmitted(
        uint256 indexed eventId,
        string eventType,
        address indexed actor,
        string data,
        uint256 timestamp
    );

    event PostRemoved(
        uint256 indexed postId,
        address indexed author,
        uint256 timestamp
    );

    // --- Core Functions ---

    /**
     * @notice Create a new top-level post.
     * @param _content Post content (Markdown supported)
     * @param _tags Categorization tags
     */
    function createPost(
        string memory _content,
        string[] memory _tags
    ) external returns (uint256) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 10000, "Content too long");

        uint256 postId = posts.length;
        posts.push(Post({
            id: postId,
            author: msg.sender,
            content: _content,
            tags: _tags,
            parentId: 0,
            createdAt: block.timestamp,
            upvotes: 0,
            downvotes: 0,
            isActive: true
        }));

        userPosts[msg.sender].push(postId);
        totalPosts++;

        emit PostCreated(postId, msg.sender, _content, _tags, 0, block.timestamp);
        _emitLiveEvent("post", msg.sender, _content);

        return postId;
    }

    /**
     * @notice Reply to an existing post.
     * @param _parentId ID of the parent post
     * @param _content Reply content
     */
    function reply(
        uint256 _parentId,
        string memory _content
    ) external returns (uint256) {
        require(_parentId < posts.length, "Invalid parent post");
        require(posts[_parentId].isActive, "Parent post is inactive");
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 5000, "Content too long");

        uint256 replyId = posts.length;
        string[] memory emptyTags = new string[](0);

        posts.push(Post({
            id: replyId,
            author: msg.sender,
            content: _content,
            tags: emptyTags,
            parentId: _parentId,
            createdAt: block.timestamp,
            upvotes: 0,
            downvotes: 0,
            isActive: true
        }));

        postReplies[_parentId].push(replyId);
        userPosts[msg.sender].push(replyId);
        totalPosts++;

        emit PostCreated(replyId, msg.sender, _content, emptyTags, _parentId, block.timestamp);
        _emitLiveEvent("reply", msg.sender, _content);

        return replyId;
    }

    /**
     * @notice Upvote or downvote a post.
     */
    function vote(uint256 _postId, bool _isUpvote) external {
        require(_postId < posts.length, "Invalid post");
        require(posts[_postId].isActive, "Post is inactive");
        require(!hasVoted[_postId][msg.sender], "Already voted");
        require(posts[_postId].author != msg.sender, "Cannot vote own post");

        hasVoted[_postId][msg.sender] = true;

        if (_isUpvote) {
            posts[_postId].upvotes++;
        } else {
            posts[_postId].downvotes++;
        }

        emit PostVoted(_postId, msg.sender, _isUpvote, block.timestamp);
    }

    /**
     * @notice Remove a post (soft delete). Only author can remove.
     */
    function removePost(uint256 _postId) external {
        require(_postId < posts.length, "Invalid post");
        require(posts[_postId].author == msg.sender, "Not the author");
        posts[_postId].isActive = false;
        emit PostRemoved(_postId, msg.sender, block.timestamp);
    }

    /**
     * @notice Emit a custom live event for the Submolt feed.
     *         Can be called by any contract or external account
     *         to broadcast platform activity.
     */
    function emitPlatformEvent(
        string memory _eventType,
        string memory _data
    ) external {
        _emitLiveEvent(_eventType, msg.sender, _data);
    }

    // --- View Functions ---

    function getPost(uint256 _postId) external view returns (Post memory) {
        require(_postId < posts.length, "Invalid post");
        return posts[_postId];
    }

    function getPostReplies(uint256 _postId) external view returns (uint256[] memory) {
        return postReplies[_postId];
    }

    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }

    function getRecentPosts(uint256 _count) external view returns (Post[] memory) {
        uint256 total = posts.length;
        uint256 count = _count > total ? total : _count;
        Post[] memory recent = new Post[](count);

        for (uint256 i = 0; i < count; i++) {
            recent[i] = posts[total - 1 - i];
        }
        return recent;
    }

    function getRecentEvents(uint256 _count) external view returns (LiveEvent[] memory) {
        uint256 total = liveEvents.length;
        uint256 count = _count > total ? total : _count;
        LiveEvent[] memory recent = new LiveEvent[](count);

        for (uint256 i = 0; i < count; i++) {
            recent[i] = liveEvents[total - 1 - i];
        }
        return recent;
    }

    // --- Internal ---

    function _emitLiveEvent(
        string memory _eventType,
        address _actor,
        string memory _data
    ) internal {
        uint256 eventId = liveEvents.length;
        liveEvents.push(LiveEvent({
            id: eventId,
            eventType: _eventType,
            actor: _actor,
            data: _data,
            timestamp: block.timestamp
        }));

        totalEvents++;
        emit LiveEventEmitted(eventId, _eventType, _actor, _data, block.timestamp);
    }
}
