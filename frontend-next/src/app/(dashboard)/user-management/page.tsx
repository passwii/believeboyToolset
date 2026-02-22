'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2, Trash2, Plus } from 'lucide-react'
import type { User } from '@/types'

export default function UserManagementPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', chinese_name: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users')
      if (response.data.success) {
        setUsers(response.data.data.users || [])
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await api.post('/api/admin/users/add', newUser)
      if (response.data.success) {
        setShowAddForm(false)
        setNewUser({ username: '', password: '', chinese_name: '' })
        fetchUsers()
      }
    } catch (error) {
      console.error('添加用户失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('确定要删除该用户吗？')) return

    try {
      const response = await api.delete(`/api/admin/users/${userId}`)
      if (response.data.success) {
        fetchUsers()
      }
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-white/60">您没有权限访问此页面</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">用户管理</h1>
          <p className="text-white/60">管理系统用户</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4" />
          添加用户
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-white">添加新用户</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">用户名</label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="请输入用户名"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">密码</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="请输入密码"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">中文名（可选）</label>
                  <Input
                    value={newUser.chinese_name}
                    onChange={(e) => setNewUser({ ...newUser, chinese_name: e.target.value })}
                    placeholder="请输入中文名"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : '添加'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">用户名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">中文名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">角色</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">创建时间</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-white/80">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-sm text-white/60">{user.id}</td>
                    <td className="px-4 py-3 text-sm text-white">{user.username}</td>
                    <td className="px-4 py-3 text-sm text-white">{user.chinese_name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          user.role === 'admin'
                            ? 'bg-indigo-500/30 text-indigo-300'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {user.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">{user.created_at || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
