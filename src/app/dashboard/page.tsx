import { redirect } from 'next/navigation'
import ProjectList from '@/components/ProjectList'
import { supabase } from '@/lib/supabase'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
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
            Dashboard do Nexcode
          </h1>
          <LogoutButton />
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <ProjectList />
          <div className="px-4 py-6 sm:px-0 hidden">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 dark:border-gray-700 p-6 hidden">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Bem-vindo(a) ao Nexcode, {session.user.email}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Esta é a sua área de trabalho. Em breve, você poderá criar e gerenciar seus projetos de aplicativos aqui.
              </p>
              <p className="mt-4 text-sm text-gray-500 hidden">
                Seu ID de usuário: {session.user.id}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
