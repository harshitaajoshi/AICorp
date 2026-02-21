// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AgentRegistry
 * @notice ERC-8004 compliant Identity Registry for AI agents on Kite testnet.
 *         Each registered agent receives an ERC-721 NFT (agentId) and a URI
 *         pointing to its registration file (name, description, service endpoints).
 * @dev Deployed on Kite L1 Testnet (chainId: 2368) for AICorp @ ETHDenver 2026.
 *      Spec: https://eips.ethereum.org/EIPS/eip-8004
 */
contract AgentRegistry is ERC721URIStorage {
    using Strings for uint256;

    uint256 private _nextAgentId;

    // agentId => metadataKey => metadataValue
    mapping(uint256 => mapping(string => bytes)) private _metadata;

    // agentId => payment wallet (defaults to owner)
    mapping(uint256 => address) private _agentWallet;

    // EIP-712 domain separator for setAgentWallet
    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 private constant SET_WALLET_TYPEHASH =
        keccak256("SetAgentWallet(uint256 agentId,address newWallet,uint256 deadline)");

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string agentURI);
    event AgentURIUpdated(uint256 indexed agentId, string newAgentURI);
    event MetadataSet(
        uint256 indexed agentId,
        string indexed indexedMetadataKey,
        string metadataKey,
        bytes metadataValue
    );
    event AgentWalletUpdated(uint256 indexed agentId, address indexed newWallet);

    error NotAgentOwner();
    error InvalidSignature();
    error DeadlineExpired();
    error ReservedMetadataKey();

    constructor() ERC721("ERC-8004 Agent Registry", "AGENT8004") {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("ERC-8004 Agent Registry"),
                keccak256("1"),
                block.chainid,
                address(this)
            )
        );
    }

    /**
     * @notice Register a new agent. Mints an ERC-721 NFT to msg.sender.
     * @param agentURI URI resolving to the agent's registration JSON file.
     * @return agentId The unique ID assigned to this agent.
     */
    function register(string calldata agentURI) external returns (uint256 agentId) {
        agentId = _nextAgentId++;
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);
        _agentWallet[agentId] = msg.sender;
        emit AgentRegistered(agentId, msg.sender, agentURI);
    }

    /**
     * @notice Update the agent URI (only agent owner).
     */
    function setAgentURI(uint256 agentId, string calldata newAgentURI) external {
        if (ownerOf(agentId) != msg.sender) revert NotAgentOwner();
        _setTokenURI(agentId, newAgentURI);
        emit AgentURIUpdated(agentId, newAgentURI);
    }

    /**
     * @notice Get on-chain metadata for an agent.
     */
    function getMetadata(uint256 agentId, string calldata metadataKey)
        external
        view
        returns (bytes memory)
    {
        return _metadata[agentId][metadataKey];
    }

    /**
     * @notice Set on-chain metadata for an agent (only agent owner).
     *         The key "agentWallet" is reserved.
     */
    function setMetadata(uint256 agentId, string calldata metadataKey, bytes calldata metadataValue)
        external
    {
        if (ownerOf(agentId) != msg.sender) revert NotAgentOwner();
        if (keccak256(bytes(metadataKey)) == keccak256("agentWallet")) revert ReservedMetadataKey();
        _metadata[agentId][metadataKey] = metadataValue;
        emit MetadataSet(agentId, metadataKey, metadataKey, metadataValue);
    }

    /**
     * @notice Get the payment wallet for an agent.
     */
    function getAgentWallet(uint256 agentId) external view returns (address) {
        return _agentWallet[agentId];
    }

    /**
     * @notice Update agent payment wallet using EIP-712 signed authorization.
     */
    function setAgentWallet(
        uint256 agentId,
        address newWallet,
        uint256 deadline,
        bytes calldata signature
    ) external {
        if (ownerOf(agentId) != msg.sender) revert NotAgentOwner();
        if (block.timestamp > deadline) revert DeadlineExpired();

        bytes32 structHash = keccak256(abi.encode(SET_WALLET_TYPEHASH, agentId, newWallet, deadline));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));

        address signer = _recoverSigner(digest, signature);
        if (signer != newWallet) revert InvalidSignature();

        _agentWallet[agentId] = newWallet;
        emit AgentWalletUpdated(agentId, newWallet);
    }

    function _recoverSigner(bytes32 digest, bytes calldata sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
        return ecrecover(digest, v, r, s);
    }
}
