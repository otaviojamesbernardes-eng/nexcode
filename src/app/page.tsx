import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function HomePage() {
  // Verifica se o usuário está logado
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    // Se estiver logado, redireciona para o dashboard
    redirect('/dashboard')
  } else {
    // Se não estiver logado, redireciona para a página de login
    redirect('/login')
  }
}
