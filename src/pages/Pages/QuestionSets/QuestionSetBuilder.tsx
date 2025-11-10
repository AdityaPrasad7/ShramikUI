import { useCallback, useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconPlus from '../../../components/Icon/IconPlus';
import IconX from '../../../components/Icon/IconX';
import IconChevronDown from '../../../components/Icon/IconCaretDown';
import { useNavigate } from 'react-router-dom';

type BuilderQuestion = {
    id: number;
    text: string;
    options: { id: number; label: string; correct: boolean }[];
};

const defaultQuestions: BuilderQuestion[] = [
    {
        id: 1,
        text: 'Which of the following is NOT a principle of RESTful API design?',
        options: [
            { id: 1, label: 'Statelessness', correct: false },
            { id: 2, label: 'Client-Server Architecture', correct: false },
            { id: 3, label: 'Cacheability', correct: false },
            { id: 4, label: 'Session Affinity', correct: true },
        ],
    },
    {
        id: 2,
        text: 'Which HTTP method is typically used to update an existing resource completely?',
        options: [
            { id: 5, label: 'PATCH', correct: false },
            { id: 6, label: 'POST', correct: false },
            { id: 7, label: 'PUT', correct: true },
            { id: 8, label: 'GET', correct: false },
        ],
    },
];

const QuestionSetBuilder = () => {
    const dispatch = useDispatch();
    const [questions, setQuestions] = useState<BuilderQuestion[]>(defaultQuestions);
    const [specializationOpen, setSpecializationOpen] = useState(false);
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(['Java Development']);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(setPageTitle('Question Set Builder'));
    }, [dispatch]);

    const addQuestion = useCallback(() => {
        setQuestions((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                text: '',
                options: [
                    { id: Date.now(), label: '', correct: false },
                    { id: Date.now() + 1, label: '', correct: false },
                ],
            },
        ]);
    }, []);

    const addOption = useCallback((questionId: number) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          options: [
                              ...question.options,
                              { id: Date.now(), label: '', correct: false },
                          ],
                      }
                    : question,
            ),
        );
    }, []);

    const removeOption = useCallback((questionId: number, optionId: number) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          options: question.options.filter((option) => option.id !== optionId),
                      }
                    : question,
            ),
        );
    }, []);

    const toggleCorrect = useCallback((questionId: number, optionId: number) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          options: question.options.map((option) =>
                              option.id === optionId ? { ...option, correct: !option.correct } : option,
                          ),
                      }
                    : question,
            ),
        );
    }, []);

    const removeQuestion = useCallback((questionId: number) => {
        setQuestions((prev) => prev.filter((question) => question.id !== questionId));
    }, []);

    const questionCount = useMemo(() => questions.length, [questions]);

    const specializationOptions = useMemo(
        () => [
            'Java Development',
            'Python Programming',
            'Data Structures',
            'Algorithms Analysis',
            'Web Development',
            'Database Systems',
            'Computer Networks',
            'Operating Systems',
            'Machine Learning',
            'Artificial Intelligence',
            'Cybersecurity Fundamentals',
            'Cloud Computing',
            'DevOps Practices',
            'Mobile App Development',
            'Software Testing & QA',
            'Big Data Engineering',
            'UI/UX Engineering',
            'Embedded Systems',
        ],
        [],
    );

    const toggleSpecialization = useCallback((spec: string) => {
        setSelectedSpecializations((prev) => (prev.includes(spec) ? prev.filter((item) => item !== spec) : [...prev, spec]));
    }, []);

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Question Set Builder</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Craft custom assessments tailored to each specialization.</p>
            </header>

            <section className="panel space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Question Set Metadata</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Assign to Specializations</label>
                            <div className="relative mt-2">
                                <button
                                    type="button"
                                    onClick={() => setSpecializationOpen((open) => !open)}
                                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <span>{selectedSpecializations.length ? selectedSpecializations.join(', ') : 'Select specializations'}</span>
                                    <IconChevronDown className={`h-4 w-4 transition ${specializationOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {specializationOpen && (
                                    <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                        <ul className="max-h-56 overflow-y-auto text-sm">
                                            {specializationOptions.map((spec) => (
                                                <li key={spec}>
                                                    <label className="flex cursor-pointer items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                            checked={selectedSpecializations.includes(spec)}
                                                            onChange={() => toggleSpecialization(spec)}
                                                        />
                                                        <span>{spec}</span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Select one or more specializations for this question set.</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Question Builder</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{questionCount} questions in this set</p>
                    </div>

                    <div className="space-y-5">
                        {questions.map((question, index) => (
                            <article key={question.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                            Question {index + 1}
                                        </h3>
                                        <label className="mt-3 block text-sm font-medium text-slate-600 dark:text-slate-300">Question Text</label>
                                        <textarea
                                            defaultValue={question.text}
                                            className="mt-2 block w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 min-h-[112px]"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(question.id)}
                                        className="rounded-full bg-slate-100 p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                                    >
                                        <IconX className="h-4 w-4" />
                                    </button>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Options</h4>
                                    <div className="mt-3 space-y-3">
                                        {question.options.map((option) => (
                                            <div key={option.id} className="flex items-center gap-3">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={option.correct}
                                                        onChange={() => toggleCorrect(question.id, option.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="sr-only">Correct</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    defaultValue={option.label}
                                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(question.id, option.id)}
                                                    className="rounded-full bg-slate-100 p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                                                >
                                                    <IconX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addOption(question.id)}
                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        <IconPlus className="h-4 w-4" />
                                        <span>Add Option</span>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                        >
                            <IconPlus className="h-4 w-4" />
                            <span>Add Question</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/question-sets')}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                    >
                        Save Question Set
                    </button>
                </div>
            </section>
        </div>
    );
};

export default QuestionSetBuilder;

