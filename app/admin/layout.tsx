"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
// ThemeProvider import removed
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import {
  LayoutDashboard,
  Menu,
  Table,
  Settings,
  BarChart,
  LogOut,
} from "lucide-react"
// useTheme import removed
import { PhoneCall } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  // Theme variables removed
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin/login")
      return
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["admin", "staff", "kitchen"].includes(userData.role)) {
      await supabase.auth.signOut()
      router.push("/admin/login")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  // toggleTheme function removed

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isClient) {
    return null;
  }

  // Check if we're on the login page
  const isLoginPage = pathname === "/admin/login"

  return (
    <div className="flex h-screen">
      {/* Mobile Sidebar Toggle Button */}
      {!isLoginPage && (
        <button
          className="sm:hidden fixed top-4 left-4 z-30 p-2 bg-background rounded-md border border-border shadow-md"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      {/* Sidebar - Hidden on mobile, visible on sm+ */}
      {!isLoginPage && (
        <div className="hidden sm:flex w-64 bg-background border-r border-border flex-col h-full">
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin/dashboard">
              <Button
                variant={pathname === "/admin/dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/tables">
              <Button
                variant={pathname === "/admin/tables" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Table className="mr-2 h-4 w-4" />
                Tables
              </Button>
            </Link>
            <Link href="/admin/menu">
              <Button
                variant={pathname === "/admin/menu" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Menu className="mr-2 h-4 w-4" />
                Menu
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button
                variant={pathname === "/admin/analytics" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button
                variant={pathname === "/admin/settings" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link href="/admin/calling">
              <Button
                variant={pathname === "/admin/calling" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Calling
              </Button>
            </Link>
          </nav>
          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
      {/* Mobile Sidebar Drawer */}
      {!isLoginPage && sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          {/* Drawer */}
          <div className="relative w-64 bg-background border-r border-border flex flex-col h-full animate-slide-in-left">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h1 className="text-xl font-bold">Resmana Admin</h1>
              <button
                className="ml-2 p-1 rounded hover:bg-muted"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
                <Button
                  variant={pathname === "/admin/dashboard" ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/tables" onClick={() => setSidebarOpen(false)}>
                <Button
                  variant={pathname === "/admin/tables" ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Table className="mr-2 h-4 w-4" />
                  Tables
                </Button>
              </Link>
              <Link href="/admin/menu" onClick={() => setSidebarOpen(false)}>
                <Button
                  variant={pathname === "/admin/menu" ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Menu className="mr-2 h-4 w-4" />
                  Menu
                </Button>
              </Link>
              <Link href="/admin/analytics" onClick={() => setSidebarOpen(false)}>
                <Button
                  variant={pathname === "/admin/analytics" ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/admin/settings" onClick={() => setSidebarOpen(false)}>
                <Button
                  variant={pathname === "/admin/settings" ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </nav>
            <div className="p-4 border-t border-border space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={() => { setSidebarOpen(false); handleLogout(); }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className={`${isLoginPage ? 'w-full' : 'w-full min-w-0 flex-1'} overflow-auto bg-background p-2 sm:p-6`}>  
        {children}
        <Toaster />
      </div>
    </div>
  );
}