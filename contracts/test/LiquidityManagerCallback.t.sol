// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "src/LiquidityManager.sol";
import "src/interfaces/IPool.sol";
import "src/interfaces/IERC20.sol";

/**
 * @title LiquidityManagerCallbackTest
 * @dev Tests for the Uniswap V3 mint callback functionality
 */
contract LiquidityManagerCallbackTest is Test {
    LiquidityManager public liquidityManager;
    MockPool public mockPool;
    MockERC20 public token0;
    MockERC20 public token1;
    
    address constant USER = 0x1234567890123456789012345678901234567890;
    
    function setUp() public {
        // Deploy contracts
        liquidityManager = new LiquidityManager();
        token0 = new MockERC20("Token0", "TK0", 18);
        token1 = new MockERC20("Token1", "TK1", 18);
        mockPool = new MockPool(address(token0), address(token1));
        
        // Setup tokens
        token0.mint(USER, 1000 ether);
        token1.mint(USER, 1000 ether);
        
        // Setup approvals
        vm.startPrank(USER);
        token0.approve(address(liquidityManager), type(uint256).max);
        token1.approve(address(liquidityManager), type(uint256).max);
        vm.stopPrank();
    }
    
    function testMintCallbackFlow() public {
        vm.startPrank(USER);
        
        uint256 amount0Max = 10 ether;
        uint256 amount1Max = 10 ether;
        
        uint256 balanceBefore0 = token0.balanceOf(USER);
        uint256 balanceBefore1 = token1.balanceOf(USER);
        
        // This should trigger the callback
        (uint256 amount0Used, uint256 amount1Used) = liquidityManager.mintLiquidity(
            amount0Max,
            amount1Max,
            -60,
            60,
            address(mockPool),
            USER
        );
        
        uint256 balanceAfter0 = token0.balanceOf(USER);
        uint256 balanceAfter1 = token1.balanceOf(USER);
        
        // Verify tokens were transferred
        assertEq(balanceBefore0 - balanceAfter0, amount0Used, "Token0 balance should decrease by amount used");
        assertEq(balanceBefore1 - balanceAfter1, amount1Used, "Token1 balance should decrease by amount used");
        
        // Verify pool received tokens
        assertEq(token0.balanceOf(address(mockPool)), amount0Used, "Pool should receive token0");
        assertEq(token1.balanceOf(address(mockPool)), amount1Used, "Pool should receive token1");
        
        vm.stopPrank();
    }
    
    function testCallbackWithInvalidPool() public {
        // Create a malicious contract that tries to call the callback
        MaliciousContract malicious = new MaliciousContract(address(liquidityManager));
        
        vm.expectRevert();
        malicious.callMintCallback();
    }
    
    function testCallbackDataDecoding() public {
        // Test that callback data is properly encoded and decoded
        LiquidityManager.MintCallbackData memory originalData = LiquidityManager.MintCallbackData({
            token0: address(token0),
            token1: address(token1),
            payer: USER,
            amount0Max: 10 ether,
            amount1Max: 5 ether
        });
        
        bytes memory encoded = abi.encode(originalData);
        LiquidityManager.MintCallbackData memory decoded = abi.decode(encoded, (LiquidityManager.MintCallbackData));
        
        assertEq(decoded.token0, originalData.token0, "Token0 should match");
        assertEq(decoded.token1, originalData.token1, "Token1 should match");
        assertEq(decoded.payer, originalData.payer, "Payer should match");
        assertEq(decoded.amount0Max, originalData.amount0Max, "Amount0Max should match");
        assertEq(decoded.amount1Max, originalData.amount1Max, "Amount1Max should match");
    }
}

/**
 * @title MockPool
 * @dev Mock pool contract for testing callback functionality
 */
contract MockPool is IPool {
    address public override token0;
    address public override token1;
    uint24 public override fee = 3000;
    int24 public override tickSpacing = 60;
    
    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
    }
    
    function slot0()
        external
        pure
        override
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        )
    {
        // Return mock values
        sqrtPriceX96 = 79228162514264337593543950336; // sqrt(1) in Q64.96
        tick = 0;
        observationIndex = 0;
        observationCardinality = 1;
        observationCardinalityNext = 1;
        feeProtocol = 0;
        unlocked = true;
    }
    
    function positions(bytes32)
        external
        pure
        override
        returns (
            uint128 _liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        )
    {
        return (0, 0, 0, 0, 0);
    }
    
    function mint(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        bytes calldata data
    ) external override returns (uint256 amount0, uint256 amount1) {
        // Mock amounts - in real pool these would be calculated
        amount0 = 1 ether;
        amount1 = 1 ether;
        
        // Call the callback
        IUniswapV3MintCallback(msg.sender).uniswapV3MintCallback(amount0, amount1, data);
        
        return (amount0, amount1);
    }
    
    function burn(
        int24 tickLower,
        int24 tickUpper,
        uint128 amount
    ) external pure override returns (uint256 amount0, uint256 amount1) {
        return (0, 0);
    }
    
    function collect(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount0Requested,
        uint128 amount1Requested
    ) external pure override returns (uint128 amount0, uint128 amount1) {
        return (0, 0);
    }
}

/**
 * @title MockERC20
 * @dev Mock ERC20 token for testing
 */
contract MockERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    
    constructor(string memory name_, string memory symbol_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }
    
    function name() external view override returns (string memory) {
        return _name;
    }
    
    function symbol() external view override returns (string memory) {
        return _symbol;
    }
    
    function decimals() external view override returns (uint8) {
        return _decimals;
    }
    
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        
        _transfer(from, to, amount);
        _approve(from, msg.sender, currentAllowance - amount);
        
        return true;
    }
    
    function mint(address to, uint256 amount) external {
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}

/**
 * @title MaliciousContract
 * @dev Contract that tries to call the callback maliciously
 */
contract MaliciousContract {
    LiquidityManager liquidityManager;
    
    constructor(address _liquidityManager) {
        liquidityManager = LiquidityManager(_liquidityManager);
    }
    
    function callMintCallback() external {
        LiquidityManager.MintCallbackData memory fakeData = LiquidityManager.MintCallbackData({
            token0: address(0x1),
            token1: address(0x2),
            payer: msg.sender,
            amount0Max: 1 ether,
            amount1Max: 1 ether
        });
        
        // This should fail because this contract is not a valid pool
        liquidityManager.uniswapV3MintCallback(1 ether, 1 ether, abi.encode(fakeData));
    }
}
