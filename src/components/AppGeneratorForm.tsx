'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid'

interface Field {
  name: string
  type: string
}

interface Table {
  name: string
  fields: Field[]
}

export default function AppGeneratorForm() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [tables, setTables] = useState<Table[]>([{ name: 'exemplo', fields: [{ name: 'nome', type: 'text' }] }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- Lógica de Gerenciamento de Tabelas e Campos ---

  const addTable = () => {
    setTables([...tables, { name: '', fields: [{ name: '', type: 'text' }] }])
  }

  const removeTable = (index: number) => {
    setTables(tables.filter((_, i) => i !== index))
  }

  const updateTableName = (index: number, name: string) => {
    const newTables = [...tables]
    newTables[index].name = name
    setTables(newTables)
  }

  const addField = (tableIndex: number) => {
    const newTables = [...tables]
    newTables[tableIndex].fields.push({ name: '', type: 'text' })
    setTables(newTables)
  }

  const removeField = (tableIndex: number, fieldIndex: number) => {
    const newTables = [...tables]
    newTables[tableIndex].fields = newTables[tableIndex].fields.filter((_, i) => i !== fieldIndex)
    setTables(newTables)
  }

  const updateFieldName = (tableIndex: number, fieldIndex: number, name: string) => {
    const newTables = [...tables]
    newTables[tableIndex].fields[fieldIndex].name = name
    setTables(newTables)
  }

  const updateFieldType = (tableIndex: number, fieldIndex: number, type: string) => {
    const newTables = [...tables]
    newTables[tableIndex].fields[fieldIndex].type = type
    setTables(newTables)
  }

  // --- Lógica de Submissão ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validação básica
    if (!description.trim()) {
      setError('A descrição do aplicativo é obrigatória.')
      setLoading(false)
      return
    }

    // A lógica de chamada à API de geração de código será implementada na Fase 5
    // Por enquanto, apenas simulamos o envio
    console.log('Descrição:', description)
    console.log('Estrutura do DB:', tables)

    // --- Lógica de Submissão ---
    try {
      // 1. Obter o ID do usuário logado para enviar no header
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Sessão expirada. Por favor, faça login novamente.')
        router.push('/login')
        return
      }

      // 2. Chamar a API de Geração de Código
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id, // Envia o ID do usuário para a API Route
        },
        body: JSON.stringify({ description, tables }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro desconhecido na geração de código.')
      }

      // 3. Iniciar o Download do Arquivo ZIP
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'nexcode_app.zip'

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      // 4. Redirecionar para o dashboard após o download
      router.push('/dashboard')

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado durante a geração.')
    } finally {
      setLoading(false)
    }
  }

  const fieldTypes = ['text', 'number', 'boolean', 'date', 'email', 'password']

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
        Crie seu App com IA
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Seção 1: Descrição do Aplicativo */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            1. Descreva o que você quer
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Seja o mais detalhado possível. Ex: "Quero um blog simples com uma página inicial que liste os posts e uma página de administração para criar e editar posts."
          </p>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Descreva seu aplicativo..."
            required
          />
        </div>

        {/* Seção 2: Estrutura do Banco de Dados */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            2. Defina a Estrutura do Banco de Dados
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Quais tabelas e campos seu aplicativo precisa? (Ex: Tabela: posts, Campos: titulo, conteudo, data)
          </p>

          <div className="space-y-6">
            {tables.map((table, tableIndex) => (
              <div key={tableIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={table.name}
                    onChange={(e) => updateTableName(tableIndex, e.target.value)}
                    className="text-lg font-medium text-gray-900 dark:text-white bg-transparent border-b border-indigo-500 focus:outline-none"
                    placeholder="Nome da Tabela (ex: posts)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeTable(tableIndex)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    disabled={tables.length === 1}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Campos da Tabela */}
                <div className="space-y-2 pl-4 border-l border-gray-300 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Campos:</h4>
                  {table.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex space-x-2 items-center">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateFieldName(tableIndex, fieldIndex, e.target.value)}
                        className="w-1/3 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Nome do Campo (ex: titulo)"
                        required
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateFieldType(tableIndex, fieldIndex, e.target.value)}
                        className="w-1/3 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {fieldTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeField(tableIndex, fieldIndex)}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"
                        disabled={table.fields.length === 1}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addField(tableIndex)}
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mt-2"
                  >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                    Adicionar Campo
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTable}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Adicionar Tabela
            </button>
          </div>
        </div>

        {/* Seção 3: Botão de Geração */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro:</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-green-600 px-3 py-3 text-lg font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
          >
            {loading ? 'Gerando Código... (Pode levar até 60 segundos)' : 'Gerar Aplicativo Full-Stack com IA'}
          </button>
        </div>
      </form>
    </div>
  )
}
