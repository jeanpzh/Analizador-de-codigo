import Layout from '@/components/layout'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-primary">Bienvenido al Analizador de Código</h1>
        <p className="text-lg mb-8 text-muted-foreground">
          Explora diferentes ejemplos de código y analiza su estructura léxica.
          Selecciona un ejemplo del menú de la izquierda para comenzar.
        </p>
        <div className="p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Características principales</h2>
          <ul className="text-left space-y-2 text-card-foreground">
            <li>• Análisis léxico detallado</li>
            <li>• Ejecución de código en tiempo real</li>
            <li>• Visualización de tokens</li>
            <li>• Ejemplos predefinidos para explorar</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
