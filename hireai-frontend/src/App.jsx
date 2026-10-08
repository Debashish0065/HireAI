import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Register
import Register from "./pages/auth/Register";

// Authentication
import Login from "./pages/auth/Login";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Profile
import Profile from "./pages/profile/Profile";

// Jobs
import Jobs from "./pages/jobs/Jobs";
import JobDetails from "./pages/jobs/JobDetails";

// Resume
import Resume from "./pages/resume/Resume";

// Applications
import MyApplications from "./pages/applications/MyApplications";
import ApplicationDetails from "./pages/applications/ApplicationDetails";

// HR
import HRDashboard from "./pages/hr/HRDashboard";
import HRJobs from "./pages/hr/HRJobs";
import CreateJob from "./pages/hr/CreateJob";
import HRApplicants from "./pages/hr/HRApplicants";
import EditJob from "./pages/hr/EditJob";
import HRInterviews from "./pages/hr/HRInterviews";
import HRInterviewDetails from "./pages/hr/HRInterviewDetails";

// Notification
import Notifications from "./pages/Notifications";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminInterviews from "./pages/admin/AdminInterviews";

// Interview
import Interview from "./pages/interview/Interview";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* ROOT */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* AUTH */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* REGISTER */}
                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* DASHBOARD */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* JOBS */}
                <Route
                    path="/jobs"
                    element={<Jobs />}
                />

                <Route
                    path="/jobs/:id"
                    element={<JobDetails />}
                />

                {/* HR JOB DETAILS */}
                <Route
                    path="/hr/jobs/:id"
                    element={<JobDetails />}
                />

                {/* PROFILE */}
                <Route
                    path="/profile"
                    element={<Profile />}
                />

                {/* RESUME */}
                <Route
                    path="/resume"
                    element={<Resume />}
                />

                {/* APPLICATIONS */}
                <Route
                    path="/applications"
                    element={<MyApplications />}
                />

                <Route
                    path="/applications/:id"
                    element={<ApplicationDetails />}
                />

                {/* =========================================
                    HR ROUTES
                ========================================= */}

                <Route
                    path="/hr/dashboard"
                    element={<HRDashboard />}
                />

                <Route
                    path="/hr/jobs"
                    element={<HRJobs />}
                />

                <Route
                    path="/hr/jobs/create"
                    element={<CreateJob />}
                />

                <Route
                    path="/hr/jobs/:jobId/applicants"
                    element={<HRApplicants />}
                />

                <Route
                    path="/hr/jobs/:jobId/edit"
                    element={<EditJob />}
                />

                <Route
                    path="/hr/applicants"
                    element={<HRApplicants />}
                />

                {/* HR INTERVIEWS */}
                <Route
                    path="/hr/interviews"
                    element={<HRInterviews />}
                />

                {/* HR INTERVIEW DETAILS */}
                <Route
                    path="/hr/interviews/:id"
                    element={<HRInterviewDetails />}
                />

                {/* =========================================
                    Notification routes
                ========================================= */}

                {/* NOTIFICATIONS */}
                <Route
                    path="/notifications"
                    element={<Notifications />}
                />

                {/* =========================================
                    ADMIN ROUTES
                ========================================= */}

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/users"
                    element={<AdminUsers />}
                />

                <Route
                    path="/admin/jobs"
                    element={<AdminJobs />}
                />

                <Route
                    path="/admin/applications"
                    element={<AdminApplications />}
                />

                <Route
                    path="/admin/interviews"
                    element={<AdminInterviews />}
                />

                <Route
                    path="/admin/analytics"
                    element={<AdminAnalytics />}
                />

                {/* =========================================
                    Interview
                ========================================= */}

                <Route
                    path="/interview/:applicationId"
                    element={<Interview />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;