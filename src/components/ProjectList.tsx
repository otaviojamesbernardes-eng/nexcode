'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowDownTrayIcon, CodeBracketIcon, PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string
  created_at: string
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Usuário não autenticado.')
      setLoading(false)
      return
    }

    // Busca os projetos do usuário logado na tabela 'projects'
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id) // Filtra apenas os projetos do usuário
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setProjects(data as Project[])
    }
    setLoading(false)
  }

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Carregando projetos...</p>
  }

  if (error) {
    return <p className="text-red-500">Erro ao carregar projetos: {error}</p>
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Meus Projetos ({projects.length})
        </h2>
        <Link
          href="/create"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Novo Projeto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <CodeBracketIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Nenhum projeto gerado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece a criar seu primeiro aplicativo full-stack com IA.
          </p>
          <div className="mt-6">
            <Link
              href="/create"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Criar Agora
            </Link>
          </div>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {projects.map((project) => (
            <li key={project.id} className="flex justify-between gap-x-6 py-5">
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">{project.name}</p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-400">{project.description}</p>
              </div>
              <div className="flex items-center gap-x-4">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm leading-6 text-gray-900 dark:text-white">
                    Gerado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <a
                  href={`/api/download/${project.id}`} // Rota que criaremos na Fase 6
                  className="flex items-center rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500"
                  title="Baixar Código"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
