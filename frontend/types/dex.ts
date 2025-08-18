import { Token } from "./token";

export interface DEXConfig {
    name: string;
    contracts: {
        [chainId: string]: {
            positionManager: string;
            quoter: string;
            multicall?: string;
        };
    };
}


export interface PositionParams {
    token0: Token;
    token1: Token;
    fee: number;
    tickLower: number;
    tickUpper: number;
    amount0Desired: string;
    amount1Desired: string;
    slippagePercent: number;
    deadline?: number;
}