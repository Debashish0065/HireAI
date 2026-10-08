import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function Interview() {

    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [interview, setInterview] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");

    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [completing, setCompleting] = useState(false);

    const [error, setError] = useState("");

    // =========================================================
    // LOAD APPLICATION + INTERVIEW
    // =========================================================

    useEffect(() => {

        const loadInterview = async () => {

            try {

                setLoading(true);
                setError("");

                // Get application
                const applicationResponse =
                    await api.get(
                        `/applications/${applicationId}`
                    );

                const app =
                    applicationResponse.data;

                setApplication(app);

                // Make sure candidate is allowed to interview
                if (app.status !== "INTERVIEW") {

                    setError(
                        "This application is not currently scheduled for an interview."
                    );

                    return;
                }

                // Get candidate interviews
                const interviewResponse =
                    await api.get(
                        "/interviews/my"
                    );

                const interviews =
                    interviewResponse.data || [];

                // Find existing active interview for this job
                const activeInterview =
                    interviews.find(
                        item =>
                            item.jobId === app.jobId &&
                            item.status === "IN_PROGRESS"
                    );

                if (activeInterview) {

                    setInterview(activeInterview);

                    const firstUnanswered =
                        activeInterview.questions?.findIndex(
                            question =>
                                !question.candidateAnswer
                        );

                    if (
                        firstUnanswered !== undefined &&
                        firstUnanswered >= 0
                    ) {
                        setCurrentQuestion(
                            firstUnanswered
                        );
                    }

                    return;
                }

                // Check if already completed
                const completedInterview =
                    interviews.find(
                        item =>
                            item.jobId === app.jobId &&
                            item.status === "COMPLETED"
                    );

                if (completedInterview) {

                    setInterview(
                        completedInterview
                    );

                    return;
                }

            } catch (err) {

                console.error(
                    "Failed to load interview:",
                    err
                );

                if (
                    err.response?.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    navigate("/login");

                    return;
                }

                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to load interview."
                );

            } finally {

                setLoading(false);
            }
        };

        loadInterview();

    }, [applicationId, navigate]);


    // =========================================================
    // START INTERVIEW
    // =========================================================

    const handleStartInterview = async () => {

        if (!application) {
            return;
        }

        try {

            setStarting(true);
            setError("");

            const response =
                await api.post(
                    "/interviews",
                    {
                        jobId: application.jobId,
                        totalQuestions: 5
                    }
                );

            setInterview(
                response.data
            );

            setCurrentQuestion(0);

        } catch (err) {

            console.error(
                "Failed to start interview:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to start interview."
            );

        } finally {

            setStarting(false);
        }
    };


    // =========================================================
    // SUBMIT ANSWER
    // =========================================================

    const handleSubmitAnswer = async () => {

        if (!interview) {
            return;
        }

        const question =
            interview.questions?.[currentQuestion];

        if (!question) {
            return;
        }

        if (!answer.trim()) {

            setError(
                "Please enter your answer before continuing."
            );

            return;
        }

        try {

            setSubmitting(true);
            setError("");

            const response =
                await api.put(
                    "/interviews/answer",
                    {
                        questionId: question.id,
                        answer: answer.trim()
                    }
                );

            const updatedInterview =
                response.data;

            setInterview(
                updatedInterview
            );

            // Move to next question
            if (
                currentQuestion <
                updatedInterview.questions.length - 1
            ) {

                setCurrentQuestion(
                    currentQuestion + 1
                );

                setAnswer("");

            } else {

                // Last question answered
                setAnswer("");
            }

        } catch (err) {

            console.error(
                "Failed to submit answer:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to submit answer."
            );

        } finally {

            setSubmitting(false);
        }
    };


    // =========================================================
    // COMPLETE INTERVIEW
    // =========================================================

    const handleCompleteInterview = async () => {

        if (!interview) {
            return;
        }

        const unanswered =
            interview.questions?.filter(
                question =>
                    !question.candidateAnswer
            );

        if (
            unanswered &&
            unanswered.length > 0
        ) {

            setError(
                "Please answer all questions before finishing the interview."
            );

            return;
        }

        try {

            setCompleting(true);
            setError("");

            const response =
                await api.put(
                    `/interviews/${interview.id}/complete`
                );

            setInterview(
                response.data
            );

        } catch (err) {

            console.error(
                "Failed to complete interview:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to complete interview."
            );

        } finally {

            setCompleting(false);
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div style={styles.page}>

                <header style={styles.header}>

                    <div>
                        <h1 style={styles.logo}>
                            HireAI 🚀
                        </h1>

                        <p style={styles.subtitle}>
                            AI Interview
                        </p>
                    </div>

                </header>

                <main style={styles.container}>

                    <div style={styles.message}>
                        Loading interview...
                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // ERROR WITHOUT APPLICATION
    // =========================================================

    if (error && !application) {

        return (
            <div style={styles.page}>

                <header style={styles.header}>

                    <div>

                        <h1 style={styles.logo}>
                            HireAI 🚀
                        </h1>

                        <p style={styles.subtitle}>
                            AI Interview
                        </p>

                    </div>

                    <div style={styles.headerButtons}>

                        <button
                            style={styles.profileButton}
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            My Profile
                        </button>

                        <button
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>

                <main style={styles.container}>

                    <div style={styles.error}>
                        {error}
                    </div>

                    <button
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/applications")
                        }
                    >
                        ← My Applications
                    </button>

                </main>

            </div>
        );
    }


    // =========================================================
    // COMPLETED INTERVIEW
    // =========================================================

    if (
        interview &&
        interview.status === "COMPLETED"
    ) {

        return (
            <div style={styles.page}>

                <header style={styles.header}>

                    <div>

                        <h1 style={styles.logo}>
                            HireAI 🚀
                        </h1>

                        <p style={styles.subtitle}>
                            Interview Result
                        </p>

                    </div>

                    <div style={styles.headerButtons}>

                        <button
                            style={styles.profileButton}
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            My Profile
                        </button>

                        <button
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>


                <main style={styles.container}>

                    <button
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/applications")
                        }
                    >
                        ← My Applications
                    </button>


                    <div style={styles.resultCard}>

                        <h2 style={styles.resultTitle}>
                            Interview Completed 🎉
                        </h2>

                        <p style={styles.jobTitle}>
                            {interview.jobTitle}
                        </p>


                        <div style={styles.scoreCircle}>

                            <span style={styles.score}>
                                {interview.score ?? 0}
                            </span>

                            <span style={styles.scoreText}>
                                / 100
                            </span>

                        </div>


                        <div style={styles.resultBox}>

                            <h3>
                                Overall AI Feedback
                            </h3>

                            <p style={styles.feedback}>
                                {interview.overallFeedback ||
                                    "No overall feedback available."}
                            </p>

                        </div>


                        <h3 style={styles.sectionTitle}>
                            Question Results
                        </h3>


                        {interview.questions?.map(
                            (question) => (

                                <div
                                    key={question.id}
                                    style={styles.questionResult}
                                >

                                    <div style={styles.questionHeader}>

                                        <strong>
                                            Question{" "}
                                            {question.questionNumber}
                                        </strong>

                                        <span style={styles.questionScore}>
                                            {question.score ?? 0}/100
                                        </span>

                                    </div>

                                    <p style={styles.questionText}>
                                        {question.question}
                                    </p>

                                    <div style={styles.answerBox}>

                                        <strong>
                                            Your Answer:
                                        </strong>

                                        <p>
                                            {question.candidateAnswer}
                                        </p>

                                    </div>

                                    <div style={styles.feedbackBox}>

                                        <strong>
                                            AI Feedback:
                                        </strong>

                                        <p>
                                            {question.feedback ||
                                                "No feedback available."}
                                        </p>

                                    </div>

                                </div>

                            )
                        )}


                        <button
                            style={styles.primaryButton}
                            onClick={() =>
                                navigate("/applications")
                            }
                        >
                            Back to Applications
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // NOT STARTED
    // =========================================================

    if (!interview) {

        return (
            <div style={styles.page}>

                <header style={styles.header}>

                    <div>

                        <h1 style={styles.logo}>
                            HireAI 🚀
                        </h1>

                        <p style={styles.subtitle}>
                            AI Interview
                        </p>

                    </div>

                    <div style={styles.headerButtons}>

                        <button
                            style={styles.profileButton}
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            My Profile
                        </button>

                        <button
                            style={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>


                <main style={styles.container}>

                    <button
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/applications")
                        }
                    >
                        ← My Applications
                    </button>


                    <div style={styles.startCard}>

                        <h2>
                            AI Interview
                        </h2>

                        <p style={styles.jobTitle}>
                            {application?.jobTitle}
                        </p>

                        <p style={styles.description}>
                            You have been selected for an
                            interview for this position.
                        </p>

                        <div style={styles.instructions}>

                            <h3>
                                Before you start
                            </h3>

                            <ul>
                                <li>
                                    You will answer 5 AI-generated questions.
                                </li>

                                <li>
                                    Questions may be technical,
                                    behavioral, HR, or situational.
                                </li>

                                <li>
                                    Each answer will be evaluated by AI.
                                </li>

                                <li>
                                    Answer all questions before finishing.
                                </li>

                                <li>
                                    Your final score will be generated
                                    automatically.
                                </li>
                            </ul>

                        </div>


                        {error && (
                            <div style={styles.error}>
                                {error}
                            </div>
                        )}


                        <button
                            style={styles.primaryButton}
                            onClick={handleStartInterview}
                            disabled={starting}
                        >
                            {starting
                                ? "Starting Interview..."
                                : "Start Interview →"}
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // ACTIVE INTERVIEW
    // =========================================================

    const question =
        interview.questions?.[currentQuestion];

    const totalQuestions =
        interview.questions?.length ||
        interview.totalQuestions ||
        5;

    const answeredQuestions =
        interview.questions?.filter(
            q =>
                q.candidateAnswer &&
                q.candidateAnswer.trim()
        ).length || 0;

    const isLastQuestion =
        currentQuestion ===
        totalQuestions - 1;


    return (
        <div style={styles.page}>

            <header style={styles.header}>

                <div>

                    <h1 style={styles.logo}>
                        HireAI 🚀
                    </h1>

                    <p style={styles.subtitle}>
                        AI Interview
                    </p>

                </div>

                <div style={styles.headerButtons}>

                    <button
                        style={styles.profileButton}
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        My Profile
                    </button>

                    <button
                        style={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main style={styles.container}>

                <button
                    style={styles.backButton}
                    onClick={() =>
                        navigate("/applications")
                    }
                >
                    ← My Applications
                </button>


                <div style={styles.interviewCard}>

                    <div style={styles.interviewHeader}>

                        <div>

                            <h2 style={styles.jobTitle}>
                                {interview.jobTitle}
                            </h2>

                            <p style={styles.subtitle}>
                                AI Technical Interview
                            </p>

                        </div>

                        <span style={styles.status}>
                            IN PROGRESS
                        </span>

                    </div>


                    {/* PROGRESS */}

                    <div style={styles.progressSection}>

                        <div style={styles.progressTop}>

                            <span>
                                Question{" "}
                                {currentQuestion + 1}
                                {" "}of{" "}
                                {totalQuestions}
                            </span>

                            <span>
                                {answeredQuestions}/
                                {totalQuestions}
                                {" "}answered
                            </span>

                        </div>

                        <div style={styles.progressBarBackground}>

                            <div
                                style={{
                                    ...styles.progressBar,
                                    width:
                                        `${(
                                            (currentQuestion + 1)
                                            / totalQuestions
                                        ) * 100}%`
                                }}
                            />

                        </div>

                    </div>


                    {error && (

                        <div style={styles.error}>
                            {error}
                        </div>

                    )}


                    {/* QUESTION */}

                    {question && (

                        <div style={styles.questionCard}>

                            <div style={styles.questionType}>
                                {question.questionType}
                            </div>

                            <h3 style={styles.questionTextLarge}>
                                {question.question}
                            </h3>


                            <textarea
                                value={answer}
                                onChange={(e) =>
                                    setAnswer(
                                        e.target.value
                                    )
                                }
                                placeholder="Type your answer here..."
                                style={styles.textarea}
                                rows={8}
                                disabled={submitting}
                            />


                            <div style={styles.actionRow}>

                                {isLastQuestion ? (

                                    <>

                                        <button
                                            style={styles.secondaryButton}
                                            onClick={() =>
                                                navigate(
                                                    "/applications"
                                                )
                                            }
                                        >
                                            Exit
                                        </button>

                                        {!question.candidateAnswer ? (

                                            <button
                                                style={styles.primaryButton}
                                                onClick={
                                                    handleSubmitAnswer
                                                }
                                                disabled={submitting}
                                            >
                                                {submitting
                                                    ? "Evaluating..."
                                                    : "Submit Answer"}
                                            </button>

                                        ) : (

                                            <button
                                                style={styles.completeButton}
                                                onClick={
                                                    handleCompleteInterview
                                                }
                                                disabled={completing}
                                            >
                                                {completing
                                                    ? "Completing..."
                                                    : "Finish Interview ✓"}
                                            </button>

                                        )}

                                    </>

                                ) : (

                                    <button
                                        style={styles.primaryButton}
                                        onClick={
                                            handleSubmitAnswer
                                        }
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? "Evaluating..."
                                            : "Submit & Next →"}
                                    </button>

                                )}

                            </div>

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}


/* =============================================================
   STYLES
============================================================= */

const styles = {

    page: {
        minHeight: "100vh",
        backgroundColor: "#111827",
        color: "#f9fafb",
        fontFamily: "Arial, sans-serif"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        backgroundColor: "#1f2937",
        borderBottom: "1px solid #374151"
    },

    logo: {
        margin: 0,
        fontSize: "28px"
    },

    subtitle: {
        margin: "5px 0 0",
        color: "#9ca3af",
        fontSize: "14px"
    },

    headerButtons: {
        display: "flex",
        gap: "10px"
    },

    profileButton: {
        padding: "9px 16px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    logoutButton: {
        padding: "9px 16px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#dc2626",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    container: {
        maxWidth: "900px",
        margin: "0 auto",
        padding: "35px 25px"
    },

    backButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#374151",
        color: "white",
        cursor: "pointer",
        marginBottom: "25px",
        fontWeight: "bold"
    },

    startCard: {
        backgroundColor: "#1f2937",
        border: "1px solid #374151",
        borderRadius: "10px",
        padding: "35px",
        textAlign: "center"
    },

    interviewCard: {
        backgroundColor: "#1f2937",
        border: "1px solid #374151",
        borderRadius: "10px",
        padding: "30px"
    },

    resultCard: {
        backgroundColor: "#1f2937",
        border: "1px solid #374151",
        borderRadius: "10px",
        padding: "30px"
    },

    interviewHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        marginBottom: "25px"
    },

    jobTitle: {
        margin: 0,
        fontSize: "24px",
        color: "#f9fafb"
    },

    status: {
        padding: "8px 14px",
        borderRadius: "20px",
        backgroundColor: "#78350f",
        color: "#fde68a",
        fontSize: "12px",
        fontWeight: "bold",
        whiteSpace: "nowrap"
    },

    progressSection: {
        marginBottom: "25px"
    },

    progressTop: {
        display: "flex",
        justifyContent: "space-between",
        color: "#9ca3af",
        fontSize: "13px",
        marginBottom: "8px"
    },

    progressBarBackground: {
        width: "100%",
        height: "8px",
        backgroundColor: "#374151",
        borderRadius: "10px",
        overflow: "hidden"
    },

    progressBar: {
        height: "100%",
        backgroundColor: "#2563eb",
        borderRadius: "10px",
        transition: "width 0.3s ease"
    },

    questionCard: {
        backgroundColor: "#111827",
        border: "1px solid #374151",
        borderRadius: "10px",
        padding: "25px"
    },

    questionType: {
        display: "inline-block",
        backgroundColor: "#312e81",
        color: "#c7d2fe",
        padding: "6px 10px",
        borderRadius: "5px",
        fontSize: "11px",
        fontWeight: "bold",
        marginBottom: "15px"
    },

    questionTextLarge: {
        fontSize: "20px",
        lineHeight: "1.5",
        marginTop: 0,
        marginBottom: "20px"
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "15px",
        borderRadius: "7px",
        border: "1px solid #374151",
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        fontSize: "15px",
        resize: "vertical",
        outline: "none"
    },

    actionRow: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "20px",
        flexWrap: "wrap"
    },

    primaryButton: {
        padding: "11px 20px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    secondaryButton: {
        padding: "11px 20px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#374151",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    completeButton: {
        padding: "11px 20px",
        border: "none",
        borderRadius: "6px",
        backgroundColor: "#16a34a",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    instructions: {
        textAlign: "left",
        backgroundColor: "#111827",
        border: "1px solid #374151",
        borderRadius: "8px",
        padding: "20px",
        margin: "25px 0"
    },

    description: {
        color: "#d1d5db",
        lineHeight: "1.6"
    },

    error: {
        padding: "14px",
        backgroundColor: "#7f1d1d",
        color: "#fecaca",
        borderRadius: "7px",
        border: "1px solid #991b1b",
        marginBottom: "20px"
    },

    message: {
        textAlign: "center",
        padding: "60px",
        color: "#9ca3af",
        fontSize: "16px"
    },

    resultTitle: {
        textAlign: "center",
        fontSize: "28px"
    },

    scoreCircle: {
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        backgroundColor: "#111827",
        border: "6px solid #2563eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        margin: "30px auto"
    },

    score: {
        fontSize: "42px",
        fontWeight: "bold"
    },

    scoreText: {
        color: "#9ca3af",
        fontSize: "14px"
    },

    resultBox: {
        backgroundColor: "#111827",
        border: "1px solid #374151",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "25px"
    },

    feedback: {
        color: "#d1d5db",
        lineHeight: "1.6"
    },

    sectionTitle: {
        marginTop: "25px",
        marginBottom: "15px"
    },

    questionResult: {
        backgroundColor: "#111827",
        border: "1px solid #374151",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "15px"
    },

    questionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },

    questionScore: {
        backgroundColor: "#14532d",
        color: "#bbf7d0",
        padding: "5px 10px",
        borderRadius: "5px",
        fontWeight: "bold"
    },

    questionText: {
        color: "#e5e7eb",
        lineHeight: "1.5"
    },

    answerBox: {
        backgroundColor: "#1f2937",
        padding: "12px",
        borderRadius: "6px",
        marginTop: "10px"
    },

    feedbackBox: {
        backgroundColor: "#1f2937",
        padding: "12px",
        borderRadius: "6px",
        marginTop: "10px",
        color: "#d1d5db"
    }

};

export default Interview;