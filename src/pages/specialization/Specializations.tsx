import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

const specializationSummary = [
    { label: 'Total Specializations', value: '126', helper: '+8 added this month' },
    { label: 'Active Certifications', value: '72', helper: 'Mapped to 14 job sectors' },
    { label: 'Assessments Available', value: '54', helper: '+12 under development' },
    { label: 'Recently Updated', value: '18', helper: 'Modified in last 14 days' },
];

const specializationCatalog = [
    {
        name: 'Java Development',
        category: 'Software Engineering',
        certifications: ['Oracle Java SE 11', 'Spring Boot Professional'],
        assessments: 7,
        updatedAt: '2024-07-28',
        status: 'Active',
    },
    {
        name: 'Python Programming',
        category: 'Software Engineering',
        certifications: ['Python Developer', 'Data Science with Python'],
        assessments: 6,
        updatedAt: '2024-07-27',
        status: 'Active',
    },
    {
        name: 'Data Structures',
        category: 'Computer Science Foundations',
        certifications: ['Algorithms & DS Specialist'],
        assessments: 5,
        updatedAt: '2024-07-26',
        status: 'Reviewing',
    },
    {
        name: 'Algorithms Analysis',
        category: 'Computer Science Foundations',
        certifications: ['Algorithmic Problem Solver'],
        assessments: 4,
        updatedAt: '2024-07-25',
        status: 'Active',
    },
    {
        name: 'Web Development',
        category: 'Frontend & Backend',
        certifications: ['React Expert', 'Node.js Specialist'],
        assessments: 8,
        updatedAt: '2024-07-24',
        status: 'Active',
    },
    {
        name: 'Database Systems',
        category: 'Data Management',
        certifications: ['SQL Administrator', 'MongoDB Developer'],
        assessments: 5,
        updatedAt: '2024-07-23',
        status: 'Active',
    },
    {
        name: 'Computer Networks',
        category: 'Infrastructure & Security',
        certifications: ['CCNA Associate', 'Network Troubleshooting'],
        assessments: 4,
        updatedAt: '2024-07-22',
        status: 'Active',
    },
    {
        name: 'Operating Systems',
        category: 'Infrastructure & Security',
        certifications: ['Linux Administration', 'Windows Server Management'],
        assessments: 3,
        updatedAt: '2024-07-21',
        status: 'Draft',
    },
    {
        name: 'Machine Learning',
        category: 'Artificial Intelligence',
        certifications: ['ML Engineer Foundations', 'TensorFlow Practitioner'],
        assessments: 6,
        updatedAt: '2024-07-20',
        status: 'Active',
    },
    {
        name: 'Artificial Intelligence',
        category: 'Artificial Intelligence',
        certifications: ['AI Specialist', 'Generative AI Developer'],
        assessments: 7,
        updatedAt: '2024-07-19',
        status: 'Reviewing',
    },
    {
        name: 'Cybersecurity Fundamentals',
        category: 'Infrastructure & Security',
        certifications: ['Ethical Hacking Associate', 'SOC Analyst'],
        assessments: 5,
        updatedAt: '2024-07-18',
        status: 'Active',
    },
    {
        name: 'Cloud Computing',
        category: 'Cloud & DevOps',
        certifications: ['AWS Solutions Architect', 'Azure Administrator'],
        assessments: 6,
        updatedAt: '2024-07-17',
        status: 'Active',
    },
    {
        name: 'DevOps Practices',
        category: 'Cloud & DevOps',
        certifications: ['CI/CD Engineer', 'Kubernetes Operator'],
        assessments: 4,
        updatedAt: '2024-07-16',
        status: 'Active',
    },
    {
        name: 'Mobile App Development',
        category: 'Frontend & Backend',
        certifications: ['Android Developer', 'iOS Swift Developer'],
        assessments: 5,
        updatedAt: '2024-07-15',
        status: 'Active',
    },
    {
        name: 'Software Testing & QA',
        category: 'Quality Assurance',
        certifications: ['Manual QA Specialist', 'Automation Tester'],
        assessments: 4,
        updatedAt: '2024-07-14',
        status: 'Active',
    },
    {
        name: 'Big Data Engineering',
        category: 'Data Management',
        certifications: ['Hadoop Engineer', 'Spark Developer'],
        assessments: 5,
        updatedAt: '2024-07-13',
        status: 'Reviewing',
    },
    {
        name: 'UI/UX Engineering',
        category: 'Design & Product',
        certifications: ['UX Designer', 'Product Prototyping'],
        assessments: 3,
        updatedAt: '2024-07-12',
        status: 'Active',
    },
    {
        name: 'Embedded Systems',
        category: 'Hardware & Electronics',
        certifications: ['Embedded C Developer', 'IoT Device Engineer'],
        assessments: 4,
        updatedAt: '2024-07-11',
        status: 'Draft',
    },
];

const statusStyles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    Reviewing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200',
    Draft: 'bg-slate-200 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200',
};

const Specializations = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Specializations'));
    }, [dispatch]);

    const cards = useMemo(() => specializationSummary, []);

    return (
        <div className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Specializations</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage specialization categories, certifications, and assessments across your platform.
                </p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{card.helper}</span>
                    </article>
                ))}
            </section>

            <section className="panel space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Specialization Catalog</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Overview of specialization clusters, associated certifications, and assessment availability.
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                <tr>
                                    <th className="px-6 py-3">Specialization</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Certifications</th>
                                    <th className="px-6 py-3">Assessments</th>
                                    <th className="px-6 py-3">Last Updated</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                {specializationCatalog.map((item) => (
                                    <tr key={item.name} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.category}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {item.certifications.map((cert) => (
                                                    <span key={`${item.name}-${cert}`} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                                        {cert}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.assessments}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-300">{item.updatedAt}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Specializations;

