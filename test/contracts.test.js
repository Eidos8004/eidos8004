import hre from "hardhat";
import { expect } from "chai";

describe("DesignRegistry", function () {
  let registry;
  let owner, artist1, artist2, user1;
  let ethers;

  before(async function () {
    ({ ethers } = await hre.network.connect());
  });

  beforeEach(async function () {
    [owner, artist1, artist2, user1] = await ethers.getSigners();
    const DesignRegistry = await ethers.getContractFactory("DesignRegistry");
    registry = await DesignRegistry.deploy();
  });

  describe("Minting", function () {
    it("should mint a design and assign ownership", async function () {
      const tx = await registry
        .connect(artist1)
        .mintDesign(
          "Minimal UI Kit",
          "A clean minimalist UI kit",
          "UI Design",
          "QmTest123",
          ["minimal", "ui", "clean"],
          "ipfs://QmTest123/metadata.json"
        );

      await tx.wait();
      expect(await registry.ownerOf(1)).to.equal(artist1.address);
      expect(await registry.totalDesigns()).to.equal(1);
    });

    it("should store design metadata correctly", async function () {
      await registry
        .connect(artist1)
        .mintDesign(
          "Cyberpunk Dashboard",
          "Neon-styled dashboard",
          "Dashboard",
          "QmCyberpunk",
          ["cyberpunk", "neon"],
          "ipfs://QmCyberpunk/metadata.json"
        );

      const design = await registry.getDesign(1);
      expect(design.title).to.equal("Cyberpunk Dashboard");
      expect(design.description).to.equal("Neon-styled dashboard");
      expect(design.category).to.equal("Dashboard");
      expect(design.ipfsCid).to.equal("QmCyberpunk");
      expect(design.artist).to.equal(artist1.address);
      expect(design.isPublic).to.equal(true);
    });

    it("should track artist designs", async function () {
      await registry.connect(artist1).mintDesign("Design1", "Desc1", "Cat1", "Cid1", [], "uri1");
      await registry.connect(artist1).mintDesign("Design2", "Desc2", "Cat2", "Cid2", [], "uri2");
      await registry.connect(artist2).mintDesign("Design3", "Desc3", "Cat3", "Cid3", [], "uri3");

      const artist1Designs = await registry.getArtistDesigns(artist1.address);
      expect(artist1Designs.length).to.equal(2);

      const artist2Designs = await registry.getArtistDesigns(artist2.address);
      expect(artist2Designs.length).to.equal(1);
    });
  });

  describe("Artifacts", function () {
    beforeEach(async function () {
      await registry.connect(artist1).mintDesign("Test Design", "Desc", "Cat", "Cid", [], "uri");
    });

    it("should allow artist to add artifacts", async function () {
      await registry.connect(artist1).addArtifact(1, "Color Palette", "8-color system", ethers.parseEther("0.03"));
      await registry.connect(artist1).addArtifact(1, "Typography", "Inter-based scale", ethers.parseEther("0.03"));

      const artifacts = await registry.getDesignArtifacts(1);
      expect(artifacts.length).to.equal(2);
      expect(artifacts[0].name).to.equal("Color Palette");
      expect(artifacts[0].priceInWei).to.equal(ethers.parseEther("0.03"));
    });

    it("should update threshold price when artifacts are added", async function () {
      await registry.connect(artist1).addArtifact(1, "Palette", "Colors", ethers.parseEther("0.03"));
      await registry.connect(artist1).addArtifact(1, "Typography", "Fonts", ethers.parseEther("0.05"));

      const design = await registry.getDesign(1);
      expect(design.thresholdPrice).to.equal(ethers.parseEther("0.08"));
    });

    it("should reject non-owner adding artifacts", async function () {
      await expect(
        registry.connect(artist2).addArtifact(1, "Hack", "Unauthorized", ethers.parseEther("1"))
      ).to.be.revertedWith("Not the design owner");
    });

    it("should calculate artifact costs correctly", async function () {
      await registry.connect(artist1).addArtifact(1, "A1", "D1", ethers.parseEther("0.03"));
      await registry.connect(artist1).addArtifact(1, "A2", "D2", ethers.parseEther("0.05"));
      await registry.connect(artist1).addArtifact(1, "A3", "D3", ethers.parseEther("0.02"));

      const cost = await registry.calculateArtifactsCost(1, [0, 2]);
      expect(cost).to.equal(ethers.parseEther("0.05"));
    });
  });
});

describe("AgentRegistry", function () {
  let registry;
  let owner, agent1, agent2, validator;
  let ethers;

  before(async function () {
    ({ ethers } = await hre.network.connect());
  });

  beforeEach(async function () {
    [owner, agent1, agent2, validator] = await ethers.getSigners();
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    registry = await AgentRegistry.deploy();
  });

  describe("Registration", function () {
    it("should register a client agent", async function () {
      await registry
        .connect(agent1)
        .registerAgent(0, "DesignSeeker", "Client agent for finding designs", "ipfs://caps", "ipfs://tokenUri");

      const agent = await registry.getAgent(1);
      expect(agent.name).to.equal("DesignSeeker");
      expect(agent.agentType).to.equal(0);
      expect(agent.wallet).to.equal(agent1.address);
      expect(agent.active).to.equal(true);
    });

    it("should register an artist agent", async function () {
      await registry
        .connect(agent2)
        .registerAgent(1, "Aurora.AI", "Artist representation agent", "ipfs://caps2", "ipfs://tokenUri2");

      const agent = await registry.getAgent(1);
      expect(agent.agentType).to.equal(1);
    });

    it("should prevent duplicate wallet registration", async function () {
      await registry.connect(agent1).registerAgent(0, "Agent1", "Desc", "uri", "tUri");
      await expect(
        registry.connect(agent1).registerAgent(1, "Agent2", "Desc", "uri", "tUri")
      ).to.be.revertedWith("Agent already registered");
    });

    it("should lookup agent by wallet", async function () {
      await registry.connect(agent1).registerAgent(0, "Seeker", "Desc", "uri", "tUri");
      const agent = await registry.getAgentByWallet(agent1.address);
      expect(agent.name).to.equal("Seeker");
    });
  });

  describe("Feedback & Reputation", function () {
    beforeEach(async function () {
      await registry.connect(agent1).registerAgent(0, "Agent", "Desc", "uri", "tUri");
    });

    it("should accept feedback and update reputation", async function () {
      await registry.connect(agent2).submitFeedback(1, 5, "quality", "ipfs://feedback");
      const score = await registry.getReputationScore(1);
      expect(score).to.be.gt(0);
    });

    it("should reject invalid feedback scores", async function () {
      await expect(
        registry.connect(agent2).submitFeedback(1, 101, "quality", "uri")
      ).to.be.revertedWith("Score must be 0-100");
    });
  });
});

describe("AttributionPayment", function () {
  let designRegistry, agentRegistry, payment;
  let owner, artist, client;
  let ethers;

  before(async function () {
    ({ ethers } = await hre.network.connect());
  });

  beforeEach(async function () {
    [owner, artist, client] = await ethers.getSigners();

    const DesignRegistry = await ethers.getContractFactory("DesignRegistry");
    designRegistry = await DesignRegistry.deploy();

    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();

    const AttributionPayment = await ethers.getContractFactory("AttributionPayment");
    payment = await AttributionPayment.deploy(
      await designRegistry.getAddress(),
      await agentRegistry.getAddress()
    );

    // Setup: mint a design and add artifacts
    await designRegistry.connect(artist).mintDesign("TestDesign", "Desc", "Cat", "Cid", [], "uri");
    await designRegistry.connect(artist).addArtifact(1, "Palette", "Colors", ethers.parseEther("0.03"));
    await designRegistry.connect(artist).addArtifact(1, "Typo", "Fonts", ethers.parseEther("0.05"));

    // Register client as agent
    await agentRegistry.connect(client).registerAgent(0, "ClientBot", "Desc", "uri", "tUri");
  });

  describe("Payments", function () {
    it("should accept payment for artifacts and transfer to artist", async function () {
      const artistBalanceBefore = await ethers.provider.getBalance(artist.address);

      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("x402-proof"));
      await payment
        .connect(client)
        .payForArtifacts(1, [0, 1], proofHash, {
          value: ethers.parseEther("0.08"),
        });

      const artistBalanceAfter = await ethers.provider.getBalance(artist.address);
      expect(artistBalanceAfter).to.be.gt(artistBalanceBefore);
      expect(await payment.totalPayments()).to.equal(1);
    });

    it("should record attribution correctly", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
      await payment.connect(client).payForArtifacts(1, [0], proofHash, {
        value: ethers.parseEther("0.03"),
      });

      const attr = await payment.getAttribution(0);
      expect(attr.designId).to.equal(1);
      expect(attr.artist).to.equal(artist.address);
      expect(attr.clientAgent).to.equal(client.address);
      expect(attr.totalPaid).to.equal(ethers.parseEther("0.03"));
    });

    it("should reject underpayment", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
      await expect(
        payment.connect(client).payForArtifacts(1, [0, 1], proofHash, {
          value: ethers.parseEther("0.01"),
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("should track payment stats", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof"));
      await payment.connect(client).payForArtifacts(1, [0], proofHash, {
        value: ethers.parseEther("0.03"),
      });
      await payment.connect(client).payForArtifacts(1, [1], proofHash, {
        value: ethers.parseEther("0.05"),
      });

      const [total, volume] = await payment.getStats();
      expect(total).to.equal(2);
      expect(volume).to.equal(ethers.parseEther("0.08"));
    });
  });
});

describe("ReputationForum", function () {
  let forum;
  let owner, user1, user2;
  let ethers;

  before(async function () {
    ({ ethers } = await hre.network.connect());
  });

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const ReputationForum = await ethers.getContractFactory("ReputationForum");
    forum = await ReputationForum.deploy();
  });

  describe("Posts", function () {
    it("should create a post", async function () {
      await forum.connect(user1).createPost("Hello World", ["general"]);
      const post = await forum.getPost(0);
      expect(post.content).to.equal("Hello World");
      expect(post.author).to.equal(user1.address);
      expect(post.isActive).to.equal(true);
    });

    it("should create threaded replies", async function () {
      await forum.connect(user1).createPost("Original post", ["discussion"]);
      await forum.connect(user2).reply(0, "Great point!");

      const replies = await forum.getPostReplies(0);
      expect(replies.length).to.equal(1);

      const replyPost = await forum.getPost(replies[0]);
      expect(replyPost.content).to.equal("Great point!");
      expect(replyPost.parentId).to.equal(0);
    });

    it("should support voting", async function () {
      await forum.connect(user1).createPost("Vote on this", []);
      await forum.connect(user2).vote(0, true);

      const post = await forum.getPost(0);
      expect(post.upvotes).to.equal(1);
    });
  });

  describe("Live Events", function () {
    it("should emit platform events", async function () {
      await forum.connect(owner).emitPlatformEvent("attribution", "0x123 paid 0.05 ETH");
      expect(await forum.totalEvents()).to.equal(1);

      const events = await forum.getRecentEvents(5);
      expect(events.length).to.equal(1);
      expect(events[0].eventType).to.equal("attribution");
    });
  });

  describe("Recent Posts", function () {
    it("should retrieve recent posts", async function () {
      await forum.connect(user1).createPost("Post 1", ["tag1"]);
      await forum.connect(user2).createPost("Post 2", ["tag2"]);
      await forum.connect(user1).createPost("Post 3", ["tag3"]);

      const recent = await forum.getRecentPosts(2);
      expect(recent.length).to.equal(2);
    });
  });
});
