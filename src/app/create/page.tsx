import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppGeneratorForm from '@/components/AppGeneratorForm'
import LogoutButton from '@/components/LogoutButton'

export default async function CreatePage() {
  // Verifica se o usuário está logado
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Se não estiver logado, redireciona para a página de login
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Novo Projeto
          </h1>
          <LogoutButton />
        </div>
      </header>
      <main>
        <AppGeneratorForm />
      </main>
    </div>
  )
}
