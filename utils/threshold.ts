export interface Threshold {
    updated_at: Date | null;
    stock_level: number;
    product: {
        name: string | null;
        id: string;
    };
    region: {
        name: string;
        id: string;
        timezone: string;
    };
}

export const StockLevelThreshold = 250

export const ThresholdChannel = "threshold_products"
