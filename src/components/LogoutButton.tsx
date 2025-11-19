'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro ao fazer logout:', error)
      setLoading(false)
    } else {
      // Redireciona para a página inicial ou de login após o logout
      router.push('/')
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  )
}
