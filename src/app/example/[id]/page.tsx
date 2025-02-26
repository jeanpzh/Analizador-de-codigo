"use client"

import { use, useState } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Layout from '@/components/layout'
import { examples } from '@/lib/examples'
import Link from 'next/link'

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
})

export default function ExamplePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const exampleId = parseInt(resolvedParams.id)
  const example = examples[exampleId]
  const [code, setCode] = useState<string>(example.code)
  const [output, setOutput] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)

  const runCode = async () => {
    setIsRunning(true)
    setOutput("Ejecutando...")
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.error) {
        setOutput(
          `Error: ${data.error} ${data.line ? `(línea ${data.line})` : ""}`
        )
      } else {
        setOutput(`Resultado: ${data.result}`)
      }
    } catch (err: any) {
      console.error(err)
      setOutput("Error al conectar con el servidor.")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6 text-primary">{example.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <MonacoEditor
              height="400px"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
          <Button onClick={runCode} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              "Ejecutar Código"
            )}
          </Button>
        </div>
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-card-foreground">Salida:</h2>
            <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-muted-foreground">
              {output}
            </pre>
          </div>
          <Link 
            href={`/tokens/${exampleId}`} 
            className="block w-full text-center py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors duration-200"
          >
            Ver análisis léxico detallado
          </Link>
        </div>
      </div>
    </Layout>
  )
}
