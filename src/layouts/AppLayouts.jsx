import { Outlet } from 'react-router-dom'
import { AppShell } from '../components/navigation/AppShell'
import { learnerNav, mentorNav, adminNav } from '../components/navigation/navConfig'
import { useAuth } from '../context/AuthContext'

export function LearnerLayout() {
  return <AppShell navSections={learnerNav.sidebar} mobileItems={learnerNav.mobile} title="Espace apprenant"><Outlet /></AppShell>
}

export function MentorLayout() {
  return <AppShell navSections={mentorNav.sidebar} mobileItems={mentorNav.mobile} accent="terracotta" title="Espace mentor"><Outlet /></AppShell>
}

export function AdminLayout() {
  return <AppShell navSections={adminNav.sidebar} mobileItems={adminNav.mobile} accent="blue" title="Administration"><Outlet /></AppShell>
}

export function useSpaceNav() {
  const { role } = useAuth()
  if (role === 'MENTOR') return mentorNav
  if (role === 'ADMIN') return adminNav
  return learnerNav
}