import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import IconPlus from '../../../../components/Icon/IconPlus';
import IconEdit from '../../../../components/Icon/IconEdit';
import IconTrash from '../../../../components/Icon/IconTrash';
import {
    CoinPackageDto,
    CoinPricingCategory,
    CoinRulesDto,
    UpsertCoinPackagePayload,
    UpdateCoinRulesPayload,
    createCoinPackage,
    deleteCoinPackage,
    getCoinPricing,
    updateCoinPackage,
    updateCoinRules,
} from '../../../../api/admin/coinPricingApi';

const defaultRules: CoinRulesDto = {
    baseAmount: 100,
    baseCoins: 100,
    coinCostPerApplication: 0,
    coinCostPerJobPost: 0,
    referralSettings: {
        isEnabled: true,
        referrerCoins: 50,
        refereeCoins: 20,
        maxReferralsPerUser: 0,
    },
};

const defaultPackage: UpsertCoinPackagePayload & { id?: string } = {
    name: '',
    coins: 0,
    price: 0,
    isVisible: true,
};

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const categories: { label: string; value: CoinPricingCategory }[] = [
    { label: 'Job Seekers', value: 'jobSeeker' },
    { label: 'Recruiters', value: 'recruiter' },
];

const CoinPricing = () => {
    const dispatch = useDispatch();
    const [activeCategory, setActiveCategory] = useState<CoinPricingCategory>('jobSeeker');
    const [packages, setPackages] = useState<CoinPackageDto[]>([]);
    const [rules, setRules] = useState<CoinRulesDto>(defaultRules);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; data: typeof defaultPackage } | null>(null);
    const [isSavingPackage, setIsSavingPackage] = useState(false);
    const [isSavingRules, setIsSavingRules] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle('Coin Pricing'));
    }, [dispatch]);

    const fetchData = useCallback(
        async (category: CoinPricingCategory) => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getCoinPricing(category);
                const sortedPackages = [...(data.packages ?? [])].sort(
                    (a: CoinPackageDto, b: CoinPackageDto) => a.coins - b.coins,
                );
                setPackages(sortedPackages);
                setRules(data.rules ?? defaultRules);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unable to load coin pricing data.';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchData(activeCategory);
    }, [activeCategory, fetchData]);

    const ruleSummaryText = useMemo(() => {
        if (activeCategory === 'jobSeeker') {
            return `${rules.coinCostPerApplication ?? 0} coins per application`;
        }
        return `${rules.coinCostPerJobPost ?? 0} coins per employee`;
    }, [activeCategory, rules.coinCostPerApplication, rules.coinCostPerJobPost]);

    const handleSavePackage = async () => {
        if (!formState) return;
        if (!formState.data.name.trim()) {
            setError('Package name is required.');
            return;
        }
        if (Number.isNaN(formState.data.coins) || formState.data.coins <= 0) {
            setError('Coins must be greater than 0.');
            return;
        }
        if (Number.isNaN(formState.data.price) || formState.data.price <= 0) {
            setError('Price must be greater than 0.');
            return;
        }

        setIsSavingPackage(true);
        setError(null);
        try {
            if (formState.mode === 'create') {
                const created = await createCoinPackage(activeCategory, {
                    name: formState.data.name.trim(),
                    coins: formState.data.coins,
                    price: formState.data.price,
                    isVisible: formState.data.isVisible,
                });
                setPackages((prev) =>
                    [...prev, created].sort((a: CoinPackageDto, b: CoinPackageDto) => a.coins - b.coins),
                );
            } else if (formState.mode === 'edit' && formState.data.id) {
                const updated = await updateCoinPackage(activeCategory, formState.data.id, {
                    name: formState.data.name.trim(),
                    coins: formState.data.coins,
                    price: formState.data.price,
                    isVisible: formState.data.isVisible,
                });
                setPackages((prev) =>
                    prev
                        .map((item) => (item.id === updated.id ? updated : item))
                        .sort((a: CoinPackageDto, b: CoinPackageDto) => a.coins - b.coins),
                );
            }
            setFormState(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save package.';
            setError(message);
        } finally {
            setIsSavingPackage(false);
        }
    };

    const handleDeletePackage = async (pkg: CoinPackageDto) => {
        if (!window.confirm(`Delete package "${pkg.name}"?`)) return;
        try {
            await deleteCoinPackage(activeCategory, pkg.id);
            setPackages((prev) => prev.filter((item) => item.id !== pkg.id));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete package.';
            setError(message);
        }
    };

    const handleToggleVisibility = async (pkg: CoinPackageDto) => {
        try {
            const updated = await updateCoinPackage(activeCategory, pkg.id, { isVisible: !pkg.isVisible });
            setPackages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update visibility.';
            setError(message);
        }
    };

    const handleSaveRules = async () => {
        setIsSavingRules(true);
        setError(null);
        try {
            let payload: UpdateCoinRulesPayload = {
                baseAmount: rules.baseAmount,
                baseCoins: rules.baseCoins,
            };
            if (activeCategory === 'jobSeeker') {
                payload.coinCostPerApplication = rules.coinCostPerApplication;
            } else {
                payload.coinCostPerJobPost = rules.coinCostPerJobPost;
            }

            // Include referral settings
            if (rules.referralSettings) {
                payload.referralSettings = rules.referralSettings;
            }

            console.log('[FRONTEND] Sending payload:', payload);
            console.log('[FRONTEND] Current rules state:', rules);

            const updated = await updateCoinRules(activeCategory, payload);
            setRules(updated);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update rules.';
            setError(message);
        } finally {
            setIsSavingRules(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Coin Pricing</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage coin packages and rules for your marketplace.</p>
                </div>
                <div className="flex items-center gap-3">
                    {categories.map((category) => (
                        <button
                            key={category.value}
                            type="button"
                            onClick={() => setActiveCategory(category.value)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCategory === category.value
                                ? 'border-primary bg-primary text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setFormState({ mode: 'create', data: { ...defaultPackage } })}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    >
                        <IconPlus className="h-4 w-4" />
                        <span>Add Package</span>
                    </button>
                </div>
            </header>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            <section className="panel space-y-6">
                <header className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Coin Packages</h2>
                </header>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Coins</th>
                                    <th className="px-6 py-3">Price (₹)</th>
                                    <th className="px-6 py-3">Visibility</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-300">
                                            Loading packages...
                                        </td>
                                    </tr>
                                ) : packages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-300">
                                            No coin packages found for this category.
                                        </td>
                                    </tr>
                                ) : (
                                    packages.map((pkg) => (
                                        <tr key={pkg.id} className="text-slate-700 dark:text-slate-200">
                                            <td className="px-6 py-4 font-medium">{pkg.name}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{pkg.coins}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                                                {currencyFormatter.format(pkg.price.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <label className="relative inline-flex cursor-pointer items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer sr-only"
                                                        checked={pkg.isVisible}
                                                        onChange={() => handleToggleVisibility(pkg)}
                                                    />
                                                    <div className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-primary"></div>
                                                    <div className="absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition peer-checked:translate-x-4 peer-checked:bg-white"></div>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-400">
                                                <div className="inline-flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormState({
                                                                mode: 'edit',
                                                                data: {
                                                                    id: pkg.id,
                                                                    name: pkg.name,
                                                                    coins: pkg.coins,
                                                                    price: pkg.price.amount,
                                                                    isVisible: pkg.isVisible,
                                                                },
                                                            })
                                                        }
                                                        className="transition hover:text-primary"
                                                    >
                                                        <IconEdit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePackage(pkg)}
                                                        className="transition hover:text-rose-500"
                                                    >
                                                        <IconTrash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Custom Amount Pricing - Separate Section */}
            <section className="panel space-y-6">
                <header className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Custom Amount Pricing</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Set the coin conversion rate for custom amount purchases.
                    </p>
                </header>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={rules.baseAmount}
                            onChange={(event) =>
                                setRules((prev) => ({
                                    ...prev,
                                    baseAmount: Number(event.target.value),
                                }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                            Coins
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={rules.baseCoins}
                            onChange={(event) =>
                                setRules((prev) => ({
                                    ...prev,
                                    baseCoins: Number(event.target.value),
                                }))
                            }
                            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    For ₹{rules.baseAmount}, user gets <span className="font-semibold text-primary">{rules.baseCoins} coins</span>
                </p>
                <button
                    type="button"
                    onClick={handleSaveRules}
                    disabled={isSavingRules}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
                >
                    {isSavingRules ? 'Saving...' : 'Save Pricing'}
                </button>
            </section>

            {/* Rules Section */}
            <section className="panel space-y-6">
                <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Rules</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Configure the coin cost for actions in the application.
                        </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary dark:border-primary/40 dark:bg-primary/20">
                        {ruleSummaryText}
                    </span>
                </header>
                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSaveRules();
                    }}
                >
                    {/* Action Cost Rules */}
                    {activeCategory === 'jobSeeker' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Coin Cost Per Job Application
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={rules.coinCostPerApplication}
                                onChange={(event) =>
                                    setRules((prev) => ({
                                        ...prev,
                                        coinCostPerApplication: Number(event.target.value),
                                    }))
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>
                    )}
                    {activeCategory === 'recruiter' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Coin cost per job post
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={rules.coinCostPerJobPost}
                                onChange={(event) =>
                                    setRules((prev) => ({
                                        ...prev,
                                        coinCostPerJobPost: Number(event.target.value),
                                    }))
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSavingRules}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
                    >
                        {isSavingRules ? 'Saving...' : 'Save Rules'}
                    </button>
                </form>
            </section>

            {/* Referral Settings Section */}
            <section className="panel space-y-6">
                <header className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Referral Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Configure how many coins referrers get when someone signs up using their code.
                    </p>
                </header>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Enable Referral Rewards
                        </label>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={rules.referralSettings?.isEnabled ?? true}
                                onChange={(event) =>
                                    setRules((prev) => ({
                                        ...prev,
                                        referralSettings: {
                                            ...prev.referralSettings!,
                                            isEnabled: event.target.checked,
                                        },
                                    }))
                                }
                            />
                            <div className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-primary"></div>
                            <div className="absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition peer-checked:translate-x-4 peer-checked:bg-white"></div>
                        </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Coins for Referrer
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={rules.referralSettings?.referrerCoins ?? 50}
                                onChange={(event) =>
                                    setRules((prev) => ({
                                        ...prev,
                                        referralSettings: {
                                            ...prev.referralSettings!,
                                            referrerCoins: Number(event.target.value),
                                        },
                                    }))
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                            <p className="mt-1 text-xs text-slate-500">Coins given to the person who shared the referral code</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Max Referrals Per User (0 = Unlimited)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={rules.referralSettings?.maxReferralsPerUser ?? 0}
                                onChange={(event) =>
                                    setRules((prev) => ({
                                        ...prev,
                                        referralSettings: {
                                            ...prev.referralSettings!,
                                            maxReferralsPerUser: Number(event.target.value),
                                        },
                                    }))
                                }
                                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            />
                            <p className="mt-1 text-xs text-slate-500">Maximum number of successful referrals per user</p>
                        </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            <span className="font-semibold">Current Setting:</span> When someone signs up using a referral code, the referrer gets{' '}
                            <span className="font-semibold text-primary">{rules.referralSettings?.referrerCoins ?? 50} coins</span>.
                            {(rules.referralSettings?.maxReferralsPerUser ?? 0) > 0 ? (
                                <> (max {rules.referralSettings?.maxReferralsPerUser} referrals per user)</>
                            ) : (
                                <> (unlimited referrals)</>
                            )}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveRules}
                        disabled={isSavingRules}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
                    >
                        {isSavingRules ? 'Saving...' : 'Save Referral Settings'}
                    </button>
                </div>
            </section>

            {formState && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            {formState.mode === 'create' ? 'Add Package' : 'Edit Package'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Name</label>
                                <input
                                    type="text"
                                    value={formState.data.name}
                                    onChange={(event) =>
                                        setFormState((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    data: { ...prev.data, name: event.target.value },
                                                }
                                                : prev,
                                        )
                                    }
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Coins</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formState.data.coins}
                                        onChange={(event) =>
                                            setFormState((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        data: { ...prev.data, coins: Number(event.target.value) },
                                                    }
                                                    : prev,
                                            )
                                        }
                                        className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Price (₹)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formState.data.price}
                                        onChange={(event) =>
                                            setFormState((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        data: { ...prev.data, price: Number(event.target.value) },
                                                    }
                                                    : prev,
                                            )
                                        }
                                        className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Visible</label>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={formState.data.isVisible}
                                        onChange={(event) =>
                                            setFormState((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        data: { ...prev.data, isVisible: event.target.checked },
                                                    }
                                                    : prev,
                                            )
                                        }
                                    />
                                    <div className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-primary"></div>
                                    <div className="absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition peer-checked:translate-x-4 peer-checked:bg-white"></div>
                                </label>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setFormState(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePackage}
                                disabled={isSavingPackage}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
                            >
                                {isSavingPackage ? 'Saving...' : 'Save Package'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoinPricing;

