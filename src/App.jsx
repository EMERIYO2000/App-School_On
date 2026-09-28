import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import { LearnerLayout, MentorLayout, AdminLayout } from "./layouts/AppLayouts";

import { PublicRoute, ProtectedRoute, RoleRoute } from "./routes/guards";

import HomePage from "./pages/public/Home";
import VerifyCertificatePage from "./pages/public/VerifyCertificate";
import {
  AboutPage,
  PrivacyPage,
  TermsPage,
  NotFoundPage,
  ForbiddenPage,
} from "./pages/public/StaticPages";

import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import ChooseJourneyPage from "./pages/auth/ChooseJourney";

import LearnerDashboard from "./pages/learner/Dashboard";
import CoursesPage from "./pages/learner/Courses";
import CourseDetailPage from "./pages/learner/CourseDetail";
import LearningPage from "./pages/learner/Learning";
import { QuizListPage, QuizPlayerPage } from "./pages/learner/QuizPages";
import ExamsPage from "./pages/learner/Exams";
import MentorsPage from "./pages/learner/Mentors";
import MentorDetailPage from "./pages/learner/MentorDetail";
import BookingsPage from "./pages/learner/Bookings";
import {
  CommunityPage,
  CommunityCreatePage,
  CommunityPostPage,
} from "./pages/learner/Community";
import ProgressPage from "./pages/learner/Progress";
import CertificatesPage from "./pages/learner/Certificates";
import WalletPage from "./pages/learner/Wallet";
import ProfilePage from "./pages/learner/Profile";
import SettingsPage from "./pages/learner/Settings";
import NotificationsPage from "./pages/learner/Notifications";
import CourseLearnPage from "./pages/learner/CourseLearn";

import MentorDashboard from "./pages/mentor/Dashboard";
import MentorCoursesPage, {
  MentorCourseDetailPage,
} from "./pages/mentor/Courses";
import CourseCreatePage from "./pages/mentor/CourseCreate";
import MentorLearnersPage from "./pages/mentor/Learners";
import MentorBookingsPage from "./pages/mentor/Bookings";
import MentorEarningsPage from "./pages/mentor/Earnings";
import MentorVerificationPage from "./pages/mentor/Verification";
import MentorCertificatesPage from "./pages/mentor/Certificates";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsersPage from "./pages/admin/Users";
import AdminMentorsPage from "./pages/admin/Mentors";
import AdminExamsPage from "./pages/admin/Exams";
import AdminCoursesPage from "./pages/admin/Courses";
import AdminPaymentsPage from "./pages/admin/Payments";
import AdminSettingsPage from "./pages/admin/Settings";
import { useAuth, homePathForRole } from "./context/AuthContext";
import PwaSupport from "./components/pwa/PwaSupport";

function NavigateHome() {
  const { role } = useAuth();
  return <Navigate to={homePathForRole(role)} replace />;
}

function ContentLayout() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <LearnerLayout /> : <PublicLayout />;
}

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<ContentLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="mentors" element={<MentorsPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="community/create" element={<CommunityCreatePage />} />
            <Route path="community/:postId" element={<CommunityPostPage />} />
            <Route path="verify" element={<VerifyCertificatePage />} />
            <Route
              path="certificate/:certificateId"
              element={<VerifyCertificatePage />}
            />
          </Route>
        </Route>

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="choose-journey" element={<ChooseJourneyPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<LearnerLayout />}>
            <Route index element={<NavigateHome />} />
            <Route path="dashboard" element={<LearnerDashboard />} />
            <Route path="learning" element={<LearningPage />} />
            <Route
              path="course/:courseId/learn"
              element={<CourseLearnPage />}
            />
            <Route path="quiz" element={<QuizListPage />} />
            <Route path="quiz/:quizId" element={<QuizPlayerPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId" element={<CourseDetailPage />} />
            <Route path="mentors" element={<MentorsPage />} />
            <Route path="mentors/:mentorId" element={<MentorDetailPage />} />
            <Route path="mentor/apply" element={<MentorVerificationPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={["MENTOR"]} />}>
          <Route element={<MentorLayout />}>
            <Route path="mentor/dashboard" element={<MentorDashboard />} />
            <Route path="mentor/courses" element={<MentorCoursesPage />} />
            <Route
              path="mentor/courses/:id"
              element={<MentorCourseDetailPage />}
            />
            <Route
              path="mentor/courses/create"
              element={<CourseCreatePage />}
            />
            <Route path="mentor/learners" element={<MentorLearnersPage />} />
            <Route path="mentor/bookings" element={<MentorBookingsPage />} />
            <Route path="mentor/earnings" element={<MentorEarningsPage />} />
            <Route
              path="mentor/verification"
              element={<MentorVerificationPage />}
            />
            <Route
              path="mentor/certificates"
              element={<MentorCertificatesPage />}
            />
            <Route path="mentor/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/mentors" element={<AdminMentorsPage />} />
            <Route path="admin/courses" element={<AdminCoursesPage />} />
            <Route
              path="admin/quizzes"
              element={<AdminCoursesPage tab="quizzes" />}
            />
            <Route path="admin/exams" element={<AdminExamsPage />} />
            <Route path="admin/payments" element={<AdminPaymentsPage />} />
            <Route
              path="admin/bookings"
              element={<AdminPaymentsPage tab="bookings" />}
            />
            <Route
              path="admin/certificates"
              element={<AdminCoursesPage tab="certificates" />}
            />
            <Route
              path="admin/reports"
              element={<AdminDashboard tab="reports" />}
            />
            <Route
              path="admin/moderation"
              element={<AdminPaymentsPage tab="moderation" />}
            />
            <Route path="admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <PwaSupport />
    </>
  );
}

export default App;
