import { BackendLiquidityResponse, LiquidityData, LiquidityResponse } from "@/types/liquidity"

export class LiquidityDataAdapter {

    static pricesFromTick(tick: number, dec0: number, dec1: number): { price0: number; price1: number } {
        const rawPrice = Math.pow(1.0001, tick);
        const price0 = rawPrice * Math.pow(10, dec0 - dec1);
        const price1 = 1 / price0;
        return { price0, price1 };
    }

    static transformBackendResponse(
        backendData: BackendLiquidityResponse,
        dec0: number,
        dec1: number,
        priceField: 'price0' | 'price1' = 'price0'
    ): LiquidityResponse {
        const transformedData: LiquidityData[] = backendData.data
            .filter(item => Math.abs(Number(item.liquidity_net)) > 0)
            .map(item => {
                const tickNum = Number(item.tick_idx);
                const { price0, price1 } = this.pricesFromTick(tickNum, dec0, dec1);
                const price = priceField === 'price0' ? price0 : price1;

                return {
                    tick: item.tick_idx,
                    price,
                    liquidity: Math.abs(Number(item.liquidity_net)).toString()
                };
            })
            .sort((a, b) => Number(a.tick) - Number(b.tick));

        return {
            status: backendData.status,
            active_liquidity: transformedData
        };
    }
    static transformTopLiquidity(
        backendData: BackendLiquidityResponse,
        dec0: number,
        dec1: number,
        topN: number = 10,
        priceField: 'price0' | 'price1' = 'price0'
    ): LiquidityResponse {
        const baseData = this.transformBackendResponse(backendData, dec0, dec1, priceField);

        const sortedByLiquidity = baseData.active_liquidity
            .sort((a, b) => Number(b.liquidity) - Number(a.liquidity));

        const topLiquidityTicks = sortedByLiquidity.slice(0, topN);

        return {
            status: baseData.status,
            active_liquidity: topLiquidityTicks
        };
    }


    static transformForHistogram(
        backendData: BackendLiquidityResponse,
        dec0: number,
        dec1: number,
        numBins: number = 20,
        priceField: 'price0' | 'price1' = 'price0'
    ): LiquidityResponse {
        const baseData = this.transformBackendResponse(backendData, dec0, dec1, priceField);

        if (baseData.active_liquidity.length === 0) {
            return baseData;
        }

        const allPrices = baseData.active_liquidity.map(d => d.price);
        const prices = allPrices.sort((a, b) => a - b);
        const minPrice = prices[0];
        const maxPrice = prices[prices.length - 1];
        const priceSpread = maxPrice - minPrice;

        const useLogScale = (maxPrice / minPrice) > 10;

        const bins: LiquidityData[] = [];
        let totalLiquidityProcessed = 0;
        let totalItemsProcessed = 0;

        if (useLogScale) {
            const logMin = Math.log10(minPrice);
            const logMax = Math.log10(maxPrice);
            const step = (logMax - logMin) / numBins;

            for (let i = 0; i < numBins; i++) {
                const binStart = Math.pow(10, logMin + i * step);
                const binEnd = Math.pow(10, logMin + (i + 1) * step);
                const binCenter = Math.sqrt(binStart * binEnd);

                const itemsInBin = baseData.active_liquidity.filter(d => {
                    if (i === numBins - 1) {
                        return d.price >= binStart && d.price <= binEnd;
                    } else {
                        return d.price >= binStart && d.price < binEnd;
                    }
                });

                const binLiquidity = itemsInBin.reduce((sum, d) => sum + Number(d.liquidity), 0);

                if (binLiquidity > 0) {
                    bins.push({
                        tick: `bin_${i}`,
                        price: binCenter,
                        liquidity: binLiquidity.toString()
                    });
                    totalLiquidityProcessed += binLiquidity;
                    totalItemsProcessed += itemsInBin.length;
                }
            }
        } else {
            const step = priceSpread / numBins;

            for (let i = 0; i < numBins; i++) {
                const binStart = minPrice + i * step;
                const binEnd = minPrice + (i + 1) * step;
                const binCenter = (binStart + binEnd) / 2;

                const itemsInBin = baseData.active_liquidity.filter(d => {
                    if (i === numBins - 1) {
                        return d.price >= binStart && d.price <= binEnd;
                    } else {
                        return d.price >= binStart && d.price < binEnd;
                    }
                });

                const binLiquidity = itemsInBin.reduce((sum, d) => sum + Number(d.liquidity), 0);

                if (binLiquidity > 0) {
                    bins.push({
                        tick: `bin_${i}`,
                        price: binCenter,
                        liquidity: binLiquidity.toString()
                    });
                    totalLiquidityProcessed += binLiquidity;
                    totalItemsProcessed += itemsInBin.length;
                }
            }
        }

        return {
            status: baseData.status,
            active_liquidity: bins
        };
    }
}
