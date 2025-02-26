"use client"

import { useState, useEffect, use } from "react"
import Layout from "@/components/layout"
import { examples } from "@/lib/examples"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Token } from "@/lib/types/Token"



export default function TokensPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const exampleId = Number.parseInt(resolvedParams.id)
  const example = examples[exampleId]
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const analyzeCode = async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: example.code }),
        })
        const data = await res.json()
        setTokens(data.filteredTokens)
      } catch (err) {
        console.error(err)
      }
      finally {
        setLoading(false)
      }
    }
    analyzeCode()
  }, [example.code])

  const tokenFrequency = tokens.reduce(
    (acc, token) => {
      acc[token.tipo] = (acc[token.tipo] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(tokenFrequency).map(([tipo, count]) => ({
    tipo,
    count,
  }))
  chartData.sort((a, b) => b.count - a.count)

  if (loading) return <Layout>
    <Loader2 className="text-center flex justify-center animate-spin h-12 w-12 text-primary" />
  </Layout>

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary">Análisis Léxico: {example.name}</h1>
        <Link href={`/example/${exampleId}`}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al ejemplo
          </Button>
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Tokens</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Línea</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token, i) => (
                    <TableRow key={i}>
                      <TableCell>{token.tipo}</TableCell>
                      <TableCell>{token.valor}</TableCell>
                      <TableCell>{token.linea}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="bg-card p-6 h-fit rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Frecuencia de Tokens</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  )
}

