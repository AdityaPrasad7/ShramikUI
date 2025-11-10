import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconPlus from '../../../components/Icon/IconPlus';
import IconEdit from '../../../components/Icon/IconEdit';
import IconTrash from '../../../components/Icon/IconTrash';

type CoinPackage = {
    name: string;
    coins: number;
    price: string;
    visible: boolean;
};

const coinPackages: CoinPackage[] = [
    { name: 'Starter Pack', coins: 100, price: '₹99.00', visible: true },
    { name: 'Pro Bundle', coins: 500, price: '₹399.00', visible: true },
    { name: 'Mega Coins', coins: 1000, price: '₹699.00', visible: false },
    { name: 'Ultimate Pack', coins: 2500, price: '₹1499.00', visible: true },
];

const CoinPricing = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Coin Pricing'));
    }, [dispatch]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Coin Pricing</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage coin packages and rules for your marketplace.</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                    <IconPlus className="h-4 w-4" />
                    <span>Add Package</span>
                </button>
            </header>

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
                                {coinPackages.map((pkg) => (
                                    <tr key={pkg.name} className="text-slate-700 dark:text-slate-200">
                                        <td className="px-6 py-4 font-medium">{pkg.name}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{pkg.coins}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{pkg.price}</td>
                                        <td className="px-6 py-4">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input type="checkbox" className="peer sr-only" defaultChecked={pkg.visible} />
                                                <div className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-primary"></div>
                                                <div className="absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition peer-checked:translate-x-4 peer-checked:bg-white"></div>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-400">
                                            <div className="inline-flex items-center gap-3">
                                                <button type="button" className="transition hover:text-primary">
                                                    <IconEdit className="h-4 w-4" />
                                                </button>
                                                <button type="button" className="transition hover:text-rose-500">
                                                    <IconTrash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="panel space-y-6">
                <header className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Rules</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Configure the base coin costs for various actions in the application.
                    </p>
                </header>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Coin Cost Per Job Application</label>
                        <input
                            type="text"
                            placeholder="Enter cost"
                            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Coin Per Employee Count</label>
                        <input
                            type="text"
                            placeholder="Enter count"
                            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        />
                    </div>
                    <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
                        Save Rules
                    </button>
                </form>
            </section>
        </div>
    );
};

export default CoinPricing;

