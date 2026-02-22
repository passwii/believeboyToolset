'use client'

import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="fixed right-0 top-0 z-30 h-16 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="flex h-full items-center justify-end gap-4 px-6">
        {user ? (
          <>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <User className="h-4 w-4" />
              <span>{user.username}</span>
              {user.role === 'admin' && (
                <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-xs text-indigo-300">
                  管理员
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>登出</span>
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="secondary" size="sm">
              登录
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
