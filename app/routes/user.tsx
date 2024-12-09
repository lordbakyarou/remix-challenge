import { useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import useQuizStore from "~/components/utilis/store";

export const loader = async () => {
    const response = await fetch(
        "https://672f956866e42ceaf15e27ec.mockapi.io/postQuiz/POSTQUIZ"
    );

    if (!response.ok) {
        return {
            success: false,
            statusCode: response.status,
            message: response.statusText,
        };
    } else {
        const quizzes = await response.json();
        return {
            success: true,
            data: quizzes,
        };
    }
};

const User = () => {
    const loaderData = useLoaderData();
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState(null);

    const reformattedData = useMemo(() => {
        if (loaderData.success) {
            return loaderData.data.reduce((acc, item) => {
                Object.keys(item).forEach((key) => {
                    if (!isNaN(key)) {
                        acc.push(item[key]);
                    }
                });
                return acc;
            }, []);
        }
        return [];
    }, [loaderData]);

    const currentQuestionIndex = useQuizStore(
        (state) => state.currentQuestionIndex
    );
    const timeLeft = useQuizStore((state) => state.timeLeft);
    const selectedAnswers = useQuizStore((state) => state.selectedAnswers);

    const setCurrentQuestionIndex = useQuizStore(
        (state) => state.setCurrentQuestionIndex
    );
    const setSelectedAnswers = useQuizStore(
        (state) => state.setSelectedAnswers
    );
    const setTimeLeft = useQuizStore((state) => state.setTimeLeft);

    useEffect(() => {
        if (loaderData.success) {
            setQuizzes(reformattedData); // Now, reformattedData doesn't change unnecessarily
        } else {
            setError(loaderData);
        }
    }, [loaderData.success, reformattedData, loaderData]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prevTimeLeft) => Math.max(prevTimeLeft - 1, 0));
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timeLeft, setTimeLeft]);

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < quizzes.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleOptionSelect = (option) => {
        if (timeLeft === 0) {
            return;
        }
        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[currentQuestionIndex] = option;
        setSelectedAnswers(updatedAnswers);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleResetExam = () => {
        setTimeLeft(600);
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
    };

    const totalQuestions = quizzes.length;
    const answeredQuestions = selectedAnswers.filter(
        (answer) => answer !== undefined && answer !== null
    ).length;
    const progressPercentage = (answeredQuestions / totalQuestions) * 100;

    const isEvaluateEnabled = answeredQuestions >= 1;

    const evaluateResults = () => {
        const correctAnswers = quizzes.map((quiz) => quiz.answer);
        let score = 0;

        selectedAnswers.forEach((answer, index) => {
            if (answer === correctAnswers[index]) {
                score++;
            }
        });

        alert(`You scored ${score} out of ${totalQuestions}`);
    };

    const handleQuestionClick = (index) => {
        setCurrentQuestionIndex(index);
    };

    return (
        <div className="bg-gray-800 text-gray-100 p-6 min-h-screen">
            {error ? (
                <p className="text-red-500 mt-4">Error: {error.message}</p>
            ) : (
                <>
                    <header className="mb-8 text-center">
                        <h1 className="text-4xl font-bold mb-4">
                            Interactive Quiz
                        </h1>
                        <p className="text-sm text-gray-400">
                            Test your knowledge and improve!
                        </p>
                    </header>

                    {timeLeft === 0 && (
                        <div className="text-center text-2xl font-bold text-red-400">
                            Time is up!
                        </div>
                    )}

                    <div className="mb-6">
                        <h2 className="text-xl mb-4">
                            {quizzes[currentQuestionIndex]?.title ||
                                "Loading question..."}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quizzes[currentQuestionIndex]?.options.map(
                                (option, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleOptionSelect(option)
                                        }
                                        className={`p-4 rounded-lg font-medium transition ${
                                            selectedAnswers[
                                                currentQuestionIndex
                                            ] === option
                                                ? "bg-green-500 hover:bg-green-600"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-4">
                        <button
                            onClick={handleResetExam}
                            className="bg-red-500 px-6 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
                        >
                            Reset Quiz
                        </button>
                    </div>

                    {isEvaluateEnabled && (
                        <div className="text-center">
                            <button
                                onClick={evaluateResults}
                                className="bg-green-500 px-6 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition"
                            >
                                Evaluate Results
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="bg-gray-500 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition disabled:bg-gray-600"
                        >
                            Previous
                        </button>
                        <span className="text-lg font-medium">
                            Question {currentQuestionIndex + 1} of{" "}
                            {quizzes.length}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={
                                currentQuestionIndex === quizzes.length - 1
                            }
                            className="bg-gray-500 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition disabled:bg-gray-600"
                        >
                            Next
                        </button>
                    </div>

                    <div className="relative w-full bg-gray-700 h-3 rounded-md overflow-hidden mb-8">
                        <div
                            className="absolute bg-green-500 h-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>

                    <section className="mt-8">
                        <h3 className="text-xl mb-4 font-medium">
                            All Questions
                        </h3>
                        <div className="grid grid-cols-5 md:grid-cols-8 gap-4">
                            {quizzes.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuestionClick(index)}
                                    className={`p-4 rounded-full text-sm ${
                                        selectedAnswers[index]
                                            ? "bg-green-500"
                                            : "bg-gray-500"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default User;
