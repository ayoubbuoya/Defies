
export const LIQUIDITY_MANAGER_ABI = [
    'function mintLiquidity(uint256 amount0Max, uint256 amount1Max, int24 tickLower, int24 tickUpper, address pool, address recipient) external returns (uint256 amount0, uint256 amount1)',
    'function mintLiquidityUsingNFPM(uint256 amount0Max, uint256 amount1Max, int24 tickLower, int24 tickUpper, address pool, address recipient, address nfpm, uint256 deadline) external returns ( uint256 tokenId,uint128 liquidity,uint256 amount0, uint256 amount1)',
    'function getPoolInfo(address pool) external view returns (address token0, address token1, uint24 fee, int24 tickSpacing)',
    'function calculateLiquidity(address pool, int24 tickLower, int24 tickUpper, uint256 amount0, uint256 amount1) external view returns (uint128 liquidity)',
    'function getPosition(address pool, address owner, int24 tickLower, int24 tickUpper) external view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
    'function collectFees(address pool, address recipient, int24 tickLower, int24 tickUpper, uint128 amount0Max, uint128 amount1Max) external returns (uint256 amount0, uint256 amount1)',
    'event LiquidityMinted(address indexed pool, address indexed recipient, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 amount0, uint256 amount1)'
]

export const ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)'
]

export const LIQUIDITY_MANAGER_ADDRESS = process.env.LIQUIDITY_MANAGER_ADDRESS || '0x36BcE29839Db8DC5cbA2dC64200A729558baB8FD'

