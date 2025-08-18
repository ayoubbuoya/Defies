/**
 * Liquidity Manager TypeScript Examples using ethers.js v6
 * 
 * Install dependencies:
 * npm install ethers
 * npm install @types/node typescript ts-node
 */

import { ethers } from 'ethers';

// SEI Mainnet Configuration
const SEI_RPC_URL = 'https://evm-rpc.sei-apis.com';
const SEI_CHAIN_ID = 1329;

// Contract Addresses on SEI Mainnet
const LIQUIDITY_MANAGER_ADDRESS = '0x...'; // Deploy your contract first
const USDC_ADDRESS = '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1';
const WSEI_ADDRESS = '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7';
const USDC_WSEI_POOL = '0x882f62fe8E9594470D1da0f70Bc85096F6c60423';

// ABI for LiquidityManager (simplified - include only functions you need)
const LIQUIDITY_MANAGER_ABI = [
  'function mintLiquidity(uint256 amount0Max, uint256 amount1Max, int24 tickLower, int24 tickUpper, address pool, address recipient) external returns (uint256 amount0, uint256 amount1)',
  'function burnLiquidity((address pool, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params) external returns (uint256 amount0, uint256 amount1)',
  'function getPoolInfo(address pool) external view returns (address token0, address token1, uint24 fee, int24 tickSpacing)',
  'function getPosition(address pool, address owner, int24 tickLower, int24 tickUpper) external view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)',
  'function collectFees(address pool, address recipient, int24 tickLower, int24 tickUpper, uint128 amount0Max, uint128 amount1Max) external returns (uint256 amount0, uint256 amount1)',
  'function multicall(bytes[] calldata data) external returns (bytes[] memory results)',
  'event LiquidityMinted(address indexed pool, address indexed recipient, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 amount0, uint256 amount1)'
];

// ERC20 ABI (simplified)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

/**
 * Setup provider and signer
 */
async function setupEthers() {
  // For read-only operations
  const provider = new ethers.JsonRpcProvider(SEI_RPC_URL);
  
  // For transactions (replace with your private key)
  const privateKey = process.env.PRIVATE_KEY || '0x...';
  const signer = new ethers.Wallet(privateKey, provider);
  
  return { provider, signer };
}

/**
 * Example 1: Get pool information
 */
async function getPoolInfo() {
  const { provider } = await setupEthers();
  
  const liquidityManager = new ethers.Contract(
    LIQUIDITY_MANAGER_ADDRESS,
    LIQUIDITY_MANAGER_ABI,
    provider
  );
  
  try {
    const [token0, token1, fee, tickSpacing] = await liquidityManager.getPoolInfo(USDC_WSEI_POOL);
    
    console.log('Pool Information:');
    console.log('Token0:', token0);
    console.log('Token1:', token1);
    console.log('Fee:', fee.toString());
    console.log('Tick Spacing:', tickSpacing.toString());
    
    return { token0, token1, fee, tickSpacing };
  } catch (error) {
    console.error('Error getting pool info:', error);
    throw error;
  }
}

/**
 * Example 2: Check token balances and allowances
 */
async function checkTokenBalances(userAddress: string) {
  const { provider } = await setupEthers();
  
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
  const wsei = new ethers.Contract(WSEI_ADDRESS, ERC20_ABI, provider);
  
  try {
    const [usdcBalance, wseiBalance, usdcDecimals, wseiDecimals] = await Promise.all([
      usdc.balanceOf(userAddress),
      wsei.balanceOf(userAddress),
      usdc.decimals(),
      wsei.decimals()
    ]);
    
    console.log('Token Balances:');
    console.log('USDC:', ethers.formatUnits(usdcBalance, usdcDecimals));
    console.log('WSEI:', ethers.formatUnits(wseiBalance, wseiDecimals));
    
    // Check allowances
    const [usdcAllowance, wseiAllowance] = await Promise.all([
      usdc.allowance(userAddress, LIQUIDITY_MANAGER_ADDRESS),
      wsei.allowance(userAddress, LIQUIDITY_MANAGER_ADDRESS)
    ]);
    
    console.log('Allowances:');
    console.log('USDC:', ethers.formatUnits(usdcAllowance, usdcDecimals));
    console.log('WSEI:', ethers.formatUnits(wseiAllowance, wseiDecimals));
    
    return {
      usdcBalance,
      wseiBalance,
      usdcAllowance,
      wseiAllowance,
      usdcDecimals,
      wseiDecimals
    };
  } catch (error) {
    console.error('Error checking balances:', error);
    throw error;
  }
}

/**
 * Example 3: Approve tokens for spending
 */
async function approveTokens(amount0: string, amount1: string) {
  const { signer } = await setupEthers();
  
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  const wsei = new ethers.Contract(WSEI_ADDRESS, ERC20_ABI, signer);
  
  try {
    console.log('Approving tokens...');
    
    // Approve USDC
    const usdcTx = await usdc.approve(
      LIQUIDITY_MANAGER_ADDRESS,
      ethers.parseUnits(amount0, 6) // USDC has 6 decimals
    );
    console.log('USDC approval tx:', usdcTx.hash);
    await usdcTx.wait();
    
    // Approve WSEI
    const wseiTx = await wsei.approve(
      LIQUIDITY_MANAGER_ADDRESS,
      ethers.parseUnits(amount1, 18) // WSEI has 18 decimals
    );
    console.log('WSEI approval tx:', wseiTx.hash);
    await wseiTx.wait();
    
    console.log('✅ Tokens approved successfully');
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
}

/**
 * Example 4: Mint full-range liquidity
 */
async function mintFullRangeLiquidity(usdcAmount: string, wseiAmount: string) {
  const { signer } = await setupEthers();
  
  const liquidityManager = new ethers.Contract(
    LIQUIDITY_MANAGER_ADDRESS,
    LIQUIDITY_MANAGER_ABI,
    signer
  );
  
  try {
    console.log('Minting full-range liquidity...');
    
    const tx = await liquidityManager.mintLiquidity(
      ethers.parseUnits(usdcAmount, 6),  // amount0Max (USDC)
      ethers.parseUnits(wseiAmount, 18), // amount1Max (WSEI)
      -887220,                           // tickLower (full range)
      887220,                            // tickUpper (full range)
      USDC_WSEI_POOL,                    // pool
      await signer.getAddress()          // recipient
    );
    
    console.log('Transaction hash:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Liquidity minted successfully!');
    console.log('Gas used:', receipt?.gasUsed.toString());
    
    // Parse events
    const liquidityMintedEvent = receipt?.logs.find(log => {
      try {
        const parsed = liquidityManager.interface.parseLog(log);
        return parsed?.name === 'LiquidityMinted';
      } catch {
        return false;
      }
    });
    
    if (liquidityMintedEvent) {
      const parsed = liquidityManager.interface.parseLog(liquidityMintedEvent);
      console.log('Liquidity minted:', parsed?.args.liquidity.toString());
      console.log('Amount0 used:', ethers.formatUnits(parsed?.args.amount0, 6));
      console.log('Amount1 used:', ethers.formatUnits(parsed?.args.amount1, 18));
    }
    
    return receipt;
  } catch (error) {
    console.error('Error minting liquidity:', error);
    throw error;
  }
}

/**
 * Example 5: Mint concentrated liquidity
 */
async function mintConcentratedLiquidity(usdcAmount: string, wseiAmount: string) {
  const { signer } = await setupEthers();
  
  const liquidityManager = new ethers.Contract(
    LIQUIDITY_MANAGER_ADDRESS,
    LIQUIDITY_MANAGER_ABI,
    signer
  );
  
  try {
    console.log('Minting concentrated liquidity...');
    
    const tx = await liquidityManager.mintLiquidity(
      ethers.parseUnits(usdcAmount, 6),  // amount0Max
      ethers.parseUnits(wseiAmount, 18), // amount1Max
      -60,                               // tickLower (tight range)
      60,                                // tickUpper (tight range)
      USDC_WSEI_POOL,                    // pool
      await signer.getAddress()          // recipient
    );
    
    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Concentrated liquidity minted successfully!');
    
    return receipt;
  } catch (error) {
    console.error('Error minting concentrated liquidity:', error);
    throw error;
  }
}

/**
 * Example 6: Get position information
 */
async function getPositionInfo(tickLower: number, tickUpper: number) {
  const { provider, signer } = await setupEthers();
  
  const liquidityManager = new ethers.Contract(
    LIQUIDITY_MANAGER_ADDRESS,
    LIQUIDITY_MANAGER_ABI,
    provider
  );
  
  try {
    const userAddress = await signer.getAddress();
    
    const [liquidity, feeGrowthInside0LastX128, feeGrowthInside1LastX128, tokensOwed0, tokensOwed1] = 
      await liquidityManager.getPosition(
        USDC_WSEI_POOL,
        userAddress,
        tickLower,
        tickUpper
      );
    
    console.log('Position Information:');
    console.log('Liquidity:', liquidity.toString());
    console.log('Tokens Owed 0:', ethers.formatUnits(tokensOwed0, 6));
    console.log('Tokens Owed 1:', ethers.formatUnits(tokensOwed1, 18));
    
    return {
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1
    };
  } catch (error) {
    console.error('Error getting position info:', error);
    throw error;
  }
}

/**
 * Example 7: Collect fees from position
 */
async function collectFees(tickLower: number, tickUpper: number) {
  const { signer } = await setupEthers();
  
  const liquidityManager = new ethers.Contract(
    LIQUIDITY_MANAGER_ADDRESS,
    LIQUIDITY_MANAGER_ABI,
    signer
  );
  
  try {
    console.log('Collecting fees...');
    
    const tx = await liquidityManager.collectFees(
      USDC_WSEI_POOL,                    // pool
      await signer.getAddress(),         // recipient
      tickLower,                         // tickLower
      tickUpper,                         // tickUpper
      ethers.MaxUint256,                 // amount0Max (collect all)
      ethers.MaxUint256                  // amount1Max (collect all)
    );
    
    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Fees collected successfully!');
    
    return receipt;
  } catch (error) {
    console.error('Error collecting fees:', error);
    throw error;
  }
}

/**
 * Example 8: Multicall - mint in multiple pools
 */
async function multicallMint() {
  const { signer } = await setupEthers();
  
  const liquidityManager = new ethers.Contract(
    LIQUIDITY_MANAGER_ADDRESS,
    LIQUIDITY_MANAGER_ABI,
    signer
  );
  
  try {
    console.log('Preparing multicall...');
    
    const userAddress = await signer.getAddress();
    
    // Encode multiple mint calls
    const calls = [
      liquidityManager.interface.encodeFunctionData('mintLiquidity', [
        ethers.parseUnits('100', 6),   // 100 USDC
        ethers.parseUnits('100', 18),  // 100 WSEI
        -887220,                       // Full range
        887220,
        USDC_WSEI_POOL,
        userAddress
      ]),
      liquidityManager.interface.encodeFunctionData('mintLiquidity', [
        ethers.parseUnits('50', 6),    // 50 USDC
        ethers.parseUnits('50', 18),   // 50 WSEI
        -60,                           // Concentrated range
        60,
        USDC_WSEI_POOL,
        userAddress
      ])
    ];
    
    const tx = await liquidityManager.multicall(calls);
    console.log('Multicall transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Multicall executed successfully!');
    
    return receipt;
  } catch (error) {
    console.error('Error executing multicall:', error);
    throw error;
  }
}

/**
 * Main example function
 */
async function main() {
  try {
    console.log('🚀 Liquidity Manager Examples with ethers.js');
    console.log('==========================================');
    
    // Example usage
    await getPoolInfo();
    
    const userAddress = '0x...'; // Replace with actual address
    await checkTokenBalances(userAddress);
    
    // Uncomment to run other examples:
    // await approveTokens('100', '100');
    // await mintFullRangeLiquidity('10', '10');
    // await mintConcentratedLiquidity('5', '5');
    // await getPositionInfo(-887220, 887220);
    // await collectFees(-887220, 887220);
    // await multicallMint();
    
  } catch (error) {
    console.error('Error in main:', error);
  }
}

// Export functions for use in other files
export {
  setupEthers,
  getPoolInfo,
  checkTokenBalances,
  approveTokens,
  mintFullRangeLiquidity,
  mintConcentratedLiquidity,
  getPositionInfo,
  collectFees,
  multicallMint
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}
