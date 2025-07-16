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

  if (!isClient) {
    return null
  }
  
  // Check if we're on the login page
  const isLoginPage = pathname === "/admin/login"

  return (
    <div className="flex h-screen">
        {/* Vertical Navbar - hidden on login page */}
        {!isLoginPage && (
          <div className="w-64 bg-background border-r border-border flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold">Resmana Admin</h1>
            </div>
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
            </nav>
            <div className="p-4 border-t border-border space-y-2">
              {/* Theme toggle button removed */}
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
        {/* Main Content */}
        <div className={`${isLoginPage ? 'w-full' : 'flex-1'} overflow-auto`}>
          {children}
          <Toaster />
        </div>
      </div>
  )
}