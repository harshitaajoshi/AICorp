// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AACTreasury
 * @notice On-chain P&L ledger for the Autonomous AI Corporation.
 *         Tracks revenue (x402 payments), worker payroll, and compute
 *         expenses (0G inference), enforcing corporate solvency.
 * @dev Deployed on Base Sepolia for ETHDenver 2026.
 */
contract AACTreasury {
    address public immutable manager;

    // All amounts stored in USDC units (6 decimals). 1 USDC = 1_000_000.
    uint256 public totalRevenue;
    uint256 public totalPayroll;
    uint256 public totalComputeCost;

    struct LedgerEntry {
        uint256 timestamp;
        string  entryType;  // "REVENUE" | "PAYROLL" | "COMPUTE"
        uint256 amount;     // in USDC micro-units (6 decimals)
        address agent;
        string  note;
    }

    LedgerEntry[] public ledger;

    event Revenue(uint256 indexed id, address indexed payer, uint256 amount, string note);
    event Payroll(uint256 indexed id, address indexed worker, uint256 amount);
    event ComputeCost(uint256 indexed id, address indexed worker, uint256 usdEquiv, string note);
    event SolvencyAlert(int256 netMargin);

    error OnlyManager();
    error Insolvent(int256 margin);

    modifier onlyManager() {
        if (msg.sender != manager) revert OnlyManager();
        _;
    }

    constructor() {
        manager = msg.sender;
    }

    function recordRevenue(uint256 amount, address payer, string calldata note)
        external onlyManager
    {
        totalRevenue += amount;
        uint256 id = ledger.length;
        ledger.push(LedgerEntry(block.timestamp, "REVENUE", amount, payer, note));
        emit Revenue(id, payer, amount, note);
    }

    function recordPayroll(uint256 amount, address worker)
        external onlyManager
    {
        totalPayroll += amount;
        uint256 id = ledger.length;
        ledger.push(LedgerEntry(block.timestamp, "PAYROLL", amount, worker, ""));
        emit Payroll(id, worker, amount);
    }

    function recordComputeCost(uint256 usdEquiv, address worker, string calldata note)
        external onlyManager
    {
        totalComputeCost += usdEquiv;
        uint256 id = ledger.length;
        ledger.push(LedgerEntry(block.timestamp, "COMPUTE", usdEquiv, worker, note));
        emit ComputeCost(id, worker, usdEquiv, note);
        if (netMargin() < 0) emit SolvencyAlert(netMargin());
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function netMargin() public view returns (int256) {
        return int256(totalRevenue) - int256(totalPayroll) - int256(totalComputeCost);
    }

    function isSolvent() public view returns (bool) {
        return netMargin() >= 0;
    }

    function getStats() external view returns (
        uint256 revenue,
        uint256 payroll,
        uint256 compute,
        int256  margin,
        bool    solvent,
        uint256 txCount
    ) {
        return (totalRevenue, totalPayroll, totalComputeCost, netMargin(), isSolvent(), ledger.length);
    }

    function getLedger() external view returns (LedgerEntry[] memory) {
        return ledger;
    }

    function getLedgerLength() external view returns (uint256) {
        return ledger.length;
    }
}
