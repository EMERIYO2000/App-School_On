import {
  Award,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  FlaskConical,
  LayoutDashboard,
  MessagesSquare,
  PenLine,
  Settings,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";

export const learnerNav = {
  sidebar: [
    {
      label: "nav.sectionLearner",
      items: [
        { to: "/dashboard", label: "nav.home", icon: LayoutDashboard },
        { to: "/courses", label: "nav.catalog", icon: BookOpen },
        { to: "/learning", label: "nav.myCourses", icon: PenLine },
        { to: "/quiz", label: "nav.quiz", icon: FlaskConical },
        { to: "/exams", label: "nav.examPrep", icon: Award },
        { to: "/mentors", label: "nav.mentors", icon: Users },
        { to: "/bookings", label: "nav.sessions", icon: CalendarCheck },
      ],
    },
    {
      label: "nav.sectionLearnerProgress",
      items: [
        { to: "/community", label: "nav.community", icon: MessagesSquare },
        { to: "/progress", label: "nav.progress", icon: Award },
        { to: "/certificates", label: "nav.certificates", icon: Award },
        { to: "/wallet", label: "nav.wallet", icon: Wallet },
      ],
    },
    {
      label: "nav.sectionAccount",
      items: [
        { to: "/profile", label: "nav.profile", icon: User },
        { to: "/settings", label: "nav.settings", icon: Settings },
      ],
    },
  ],
  mobile: [
    { to: "/dashboard", label: "nav.home", icon: LayoutDashboard },
    { to: "/courses", label: "nav.learn", icon: BookOpen },
    { to: "/community", label: "nav.community", icon: MessagesSquare },
    { to: "/mentors", label: "nav.mentors", icon: Users },
    { to: "/profile", label: "nav.profile", icon: User },
  ],
};

export const mentorNav = {
  sidebar: [
    {
      label: "nav.sectionMentor",
      items: [
        { to: "/mentor/dashboard", label: "nav.home", icon: LayoutDashboard },
        { to: "/mentor/courses", label: "nav.myCourses", icon: BookOpen },
        {
          to: "/mentor/courses/create",
          label: "nav.createCourse",
          icon: PenLine,
        },
        { to: "/mentor/learners", label: "nav.learners", icon: Users },
        { to: "/mentor/bookings", label: "nav.sessions", icon: CalendarCheck },
        { to: "/mentor/earnings", label: "nav.earnings", icon: Wallet },
      ],
    },
    {
      label: "nav.sectionCredibility",
      items: [
        {
          to: "/mentor/verification",
          label: "nav.verification",
          icon: ShieldCheck,
        },
        { to: "/mentor/certificates", label: "nav.certificates", icon: Award },
      ],
    },
    {
      label: "nav.sectionAccount",
      items: [
        { to: "/mentor/profile", label: "nav.myProfile", icon: User },
        { to: "/settings", label: "nav.settings", icon: Settings },
      ],
    },
  ],
  mobile: [
    { to: "/mentor/dashboard", label: "nav.home", icon: LayoutDashboard },
    { to: "/mentor/courses", label: "nav.courses", icon: BookOpen },
    { to: "/mentor/bookings", label: "nav.sessions", icon: CalendarCheck },
    { to: "/mentor/earnings", label: "nav.earnings", icon: Wallet },
    { to: "/mentor/profile", label: "nav.profile", icon: User },
  ],
};

export const adminNav = {
  sidebar: [
    {
      label: "nav.sectionAdmin",
      items: [
        {
          to: "/admin/dashboard",
          label: "nav.dashboard",
          icon: LayoutDashboard,
        },
        { to: "/admin/users", label: "nav.users", icon: Users },
        { to: "/admin/mentors", label: "nav.mentors", icon: ShieldCheck },
        { to: "/admin/courses", label: "nav.courses", icon: BookOpen },
        { to: "/admin/quizzes", label: "nav.quiz", icon: FlaskConical },
        { to: "/admin/exams", label: "Examens et archives", icon: FileText },
      ],
    },
    {
      label: "nav.sectionFinance",
      items: [
        { to: "/admin/payments", label: "nav.payments", icon: CreditCard },
        { to: "/admin/bookings", label: "nav.sessions", icon: CalendarCheck },
        { to: "/admin/certificates", label: "nav.certificates", icon: Award },
        { to: "/admin/reports", label: "nav.reports", icon: CreditCard },
        { to: "/admin/moderation", label: "nav.moderation", icon: ShieldCheck },
      ],
    },
    {
      label: "nav.sectionSystem",
      items: [{ to: "/admin/settings", label: "nav.settings", icon: Settings }],
    },
  ],
  mobile: [
    { to: "/admin/dashboard", label: "nav.home", icon: LayoutDashboard },
    { to: "/admin/users", label: "nav.users", icon: Users },
    { to: "/admin/courses", label: "nav.courses", icon: BookOpen },
    { to: "/admin/payments", label: "nav.payments", icon: CreditCard },
    { to: "/settings", label: "nav.settingsMobile", icon: Settings },
  ],
};

export const navForRole = (role) => {
  if (role === "MENTOR") return mentorNav;
  if (role === "ADMIN") return adminNav;
  return learnerNav;
};
