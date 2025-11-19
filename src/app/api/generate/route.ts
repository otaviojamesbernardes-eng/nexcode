import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import JSZip from 'jszip'
import { supabase } from '@/lib/supabase'

// Inicializa o cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define o modelo a ser usado
const MODEL = 'gpt-4o-mini' // Modelo rápido e capaz para geração de código

// Função auxiliar para criar o prompt mestre
function createMasterPrompt(description: string, tables: any[]): string {
  // 1. Formatação da Estrutura do Banco de Dados
  const dbSchema = tables.map(table => {
    const fields = table.fields.map((field: any) => `  - ${field.name}: ${field.type}`).join('\\n')
    return `Tabela: ${table.name}\\n${fields}`
  }).join('\\n\\n')

  // 2. O Prompt Mestre de Engenharia
  return `
    Você é um Engenheiro de Software Full-Stack de nível sênior, especializado em Next.js (App Router), React, Tailwind CSS e Supabase.
    Sua tarefa é gerar o código-fonte COMPLETO para um aplicativo web full-stack baseado na descrição do usuário e na estrutura do banco de dados fornecida.

    **REGRAS CRUCIAIS:**
    1.  O código deve ser modular, limpo, moderno e seguir as melhores práticas.
    2.  O aplicativo DEVE ser full-stack, com front-end (Next.js/React/Tailwind) e back-end (Next.js API Routes ou lógica de Supabase).
    3.  A persistência de dados DEVE ser feita usando o **Supabase**. O código deve usar a biblioteca '@supabase/supabase-js' para todas as operações de banco de dados (CRUD).
    4.  O aplicativo DEVE incluir autenticação básica (login/cadastro) usando o Supabase Auth.
    5.  O resultado final DEVE ser uma estrutura de arquivos JSON que representa o projeto COMPLETO.

    **DESCRIÇÃO DO APLICATIVO:**
    "${description}"

    **ESTRUTURA DO BANCO DE DADOS (Supabase):**
    ${dbSchema}

    **FORMATO DE SAÍDA:**
    O resultado DEVE ser um objeto JSON que mapeia o caminho do arquivo para o seu conteúdo.
    O JSON deve ter a seguinte estrutura:
    {
      "caminho/do/arquivo.ext": "conteúdo do arquivo...",
      "src/app/page.tsx": "import React from 'react';\\n// Conteúdo do componente React...",
      "package.json": "{ \\"name\\": \\"app-gerado\\", ... }",
      // ... todos os arquivos necessários para rodar o projeto
    }

    O JSON deve ser válido e completo. NÃO inclua nenhum texto explicativo, introdução ou conclusão fora do objeto JSON.
    Comece a resposta com o caractere '{' e termine com '}'.
  `
}

export async function POST(request: Request) {
  try {
    const { description, tables } = await request.json()
    const userId = request.headers.get('x-user-id') // ID do usuário logado (será injetado no front-end)

    if (!description || !tables || tables.length === 0) {
      return NextResponse.json({ error: 'Descrição e estrutura do banco de dados são obrigatórias.' }, { status: 400 })
    }

    // 1. Geração do Prompt
    const masterPrompt = createMasterPrompt(description, tables)

    // 2. Chamada à API da OpenAI
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: masterPrompt },
        { role: 'user', content: 'Gere o código-fonte completo para o aplicativo.' }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const jsonString = completion.choices[0].message.content
    if (!jsonString) {
      throw new Error('A IA não retornou o código JSON.')
    }

    // 3. Processamento e Compactação do Código
    const generatedFiles = JSON.parse(jsonString)
    const zip = new JSZip()

    for (const path in generatedFiles) {
      if (Object.prototype.hasOwnProperty.call(generatedFiles, path)) {
        zip.file(path, generatedFiles[path])
      }
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })

    // 4. Salvar Metadados do Projeto no Supabase
    const { data: project, error: dbError } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          name: description.substring(0, 50), // Nome curto
          description: description,
          code_path: 'temp_path_placeholder', // O caminho real será o link de download
          // O arquivo ZIP será enviado diretamente como resposta, não salvo no storage do Supabase neste MVP
        },
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Erro ao salvar projeto no DB:', dbError)
      // Continua, mas informa o erro
    }

    // 5. Retornar o ZIP para o cliente
    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="nexcode_app_${project?.id || Date.now()}.zip"`,
      },
    })

  } catch (error) {
    console.error('Erro na geração de código:', error)
    return NextResponse.json({ error: 'Erro interno na geração de código.' }, { status: 500 })
  }
}
