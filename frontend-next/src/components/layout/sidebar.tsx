'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/config/navigation'
import { useAuthStore } from '@/stores/auth-store'
import {
  Compass,
  TrendingUp,
  FileText,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  TrendingUp,
  FileText,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(NAVIGATION_ITEMS.map((item) => item.id))
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
          <h1 className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
            BelieveBoy
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {NAVIGATION_ITEMS.map((category) => {
              const IconComponent = iconMap[category.icon] || Compass
              const isExpanded = expandedCategories.has(category.id)

              return (
                <li key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-4 w-4" />
                      <span>{category.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {isExpanded && category.children && (
                    <ul className="mt-1 space-y-1 pl-4">
                      {category.children.map((item) => {
                        // 检查权限
                        if (item.adminOnly && user?.role !== 'admin') {
                          return null
                        }

                        const itemPath = `/${item.id}`
                        const isActive = pathname === itemPath
                        const ItemIcon = item.icon ? iconMap[item.icon] : null

                        return (
                          <li key={item.id}>
                            <Link
                              href={itemPath}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive
                                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-white/10'
                                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              {ItemIcon && <ItemIcon className="h-4 w-4" />}
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
