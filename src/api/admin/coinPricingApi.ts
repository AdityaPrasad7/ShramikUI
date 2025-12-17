import axios from '../../utils/axios';

export type CoinPricingCategory = 'jobSeeker' | 'recruiter';

export interface CoinPackageDto {
    id: string;
    name: string;
    coins: number;
    price: {
        amount: number;
        currency: string;
    };
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CoinRulesDto {
    coinCostPerApplication: number;
    coinCostPerJobPost: number;
}

export type UpdateCoinRulesPayload = Partial<CoinRulesDto>;

export interface CoinPricingResponse {
    packages: CoinPackageDto[];
    rules: CoinRulesDto;
}

export interface UpsertCoinPackagePayload {
    name: string;
    coins: number;
    price: number;
    isVisible?: boolean;
}

export const getCoinPricing = async (category: CoinPricingCategory) => {
    const response = await axios.get(`/api/coin-pricing/${category}`);
    const payload = response.data?.data as CoinPricingResponse | undefined;
    return (
        payload ?? {
            packages: [],
            rules: { coinCostPerApplication: 0, coinCostPerJobPost: 0 },
        }
    );
};

export const createCoinPackage = async (category: CoinPricingCategory, payload: UpsertCoinPackagePayload) => {
    const response = await axios.post(`/api/coin-pricing/${category}/packages`, payload);
    return response.data?.data?.package as CoinPackageDto;
};

export const updateCoinPackage = async (
    category: CoinPricingCategory,
    packageId: string,
    payload: Partial<UpsertCoinPackagePayload>,
) => {
    const response = await axios.put(`/api/coin-pricing/${category}/packages/${packageId}`, payload);
    return response.data?.data?.package as CoinPackageDto;
};

export const deleteCoinPackage = async (category: CoinPricingCategory, packageId: string) => {
    await axios.delete(`/api/coin-pricing/${category}/packages/${packageId}`);
};

export const updateCoinRules = async (category: CoinPricingCategory, payload: UpdateCoinRulesPayload) => {
    const response = await axios.put(`/api/coin-pricing/${category}/rules`, payload);
    return response.data?.data?.rules as CoinRulesDto;
};
