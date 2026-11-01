import { reactive, computed } from 'vue'

export interface User {
  id: string
  email: string
}

interface UserState {
  user: User | null
  token: string | null
  loading: boolean
}

const userState = reactive<UserState>({
  user: null,
  token: null,
  loading: false,
})

export function useUserStore() {
  // 从安全的 HTTP Cookie 机制恢复登录状态 (需后端配合)
  const initAuth = () => {
    // 移除不安全的 localStorage 读取
    // 实际项目中应通过调用后端 API (如 /api/auth/me) 并依赖 HttpOnly Cookie 来恢复会话
    // 由于修改为 async 会破坏同步调用方，保持同步形式并采用 fire-and-forget 的方式调用
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          userState.user = data.user
          if (data.token) userState.token = data.token
        }
      })
      .catch(e => {
        console.error('Failed to init auth', e)
        clearAuth()
      })
  }

  // 设置认证信息
  const setAuth = (token: string, user: User) => {
    userState.token = token
    userState.user = user
    // 移除不安全的 localStorage 存储
    // 认证状态现应由后端的 HttpOnly Cookie 维护
  }

  // 清除认证信息
  const clearAuth = () => {
    userState.token = null
    userState.user = null
    // 移除不安全的 localStorage 删除
    // 实际项目中应调用后端登出 API 清除 HttpOnly Cookie
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
  }

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    userState.loading = loading
  }

  // 计算属性：是否已登录
  const isAuthenticated = computed(() => {
    return userState.token !== null && userState.user !== null
  })

  return {
    state: userState,
    user: computed(() => userState.user),
    token: computed(() => userState.token),
    loading: computed(() => userState.loading),
    isAuthenticated,
    initAuth,
    setAuth,
    clearAuth,
    setLoading,
  }
}
