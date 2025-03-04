
## Componentes Centrales: Lexer, Parser, Interpreter

Este proyecto se basa en tres componentes esenciales: el Lexer, Parser e Interpreter. Estos trabajan juntos para analizar y ejecutar código escrito en el lenguaje definido por el proyecto.

### 1. Lexer (`src/lib/lexer.ts`)

El Lexer, también conocido como tokenizador, es responsable de descomponer el código fuente de entrada en un flujo de tokens. Cada token representa una unidad significativa del lenguaje, como palabras clave, identificadores, operadores, literales y símbolos.

*   **Funcionalidad:**
    *   **Tokenización:** Itera a través del código de entrada carácter por carácter, agrupándolos en lexemas.
    *   **Clasificación:** Identifica el tipo de cada lexema (por ejemplo, `PALABRA_RESERVADA`, `IDENTIFICADOR`, `NUMERO`, `OPERADOR`) basándose en reglas predefinidas y expresiones regulares.
    *   **Creación de Tokens:** Crea objetos `Token` que contienen el tipo de lexema, el valor, el número de línea y la posición.
    *   **Manejo de Comentarios:** Ignora los comentarios en el código, omitiendo las líneas que comienzan con `#`.

*   **Ejemplo:**

    Dado el código:

    ```
    entero a = 10
    a = a + 1
    ```

    El Lexer generaría un flujo de tokens como:

    ```
    [
      { tipo: "PALABRA_RESERVADA", valor: "entero", linea: 1, posicion: ... },
      { tipo: "IDENTIFICADOR", valor: "a", linea: 1, posicion: ... },
      { tipo: "OPERADOR", valor: "=", linea: 1, posicion: ... },
      { tipo: "NUMERO", valor: "10", linea: 1, posicion: ... },
      { tipo: "IDENTIFICADOR", valor: "a", linea: 2, posicion: ... },
      { tipo: "OPERADOR", valor: "=", linea: 2, posicion: ... },
      { tipo: "IDENTIFICADOR", valor: "a", linea: 2, posicion: ... },
      { tipo: "OPERADOR", valor: "+", linea: 2, posicion: ... },
      { tipo: "NUMERO", valor: "1", linea: 2, posicion: ... }
    ]
    ```

### 2. Parser (`src/lib/parser.ts`)

El Parser toma el flujo de tokens producido por el Lexer y construye un Árbol de Sintaxis Abstracta (AST). El AST representa la estructura gramatical del código, lo que facilita su comprensión y procesamiento.

*   **Funcionalidad:**
    *   **Construcción del AST:** Organiza los tokens en una estructura de árbol jerárquica según las reglas gramaticales del lenguaje.
    *   **Cumplimiento de la Gramática:** Verifica si la secuencia de tokens se ajusta a la gramática definida. Si no es así, genera un error.
    *   **Manejo de Declaraciones:** Analiza las declaraciones de variables, las declaraciones de funciones y las sentencias.
    *   **Análisis de Expresiones:** Maneja expresiones con precedencia de operadores, llamadas a funciones y sentencias condicionales.
    *   **Manejo de Errores:** Informa los errores de sintaxis encontrados durante el análisis.

*   **Tipos de Nodos AST (definidos en `src/lib/ast.ts`):**
    *   `ProgramNode`: Representa la raíz del AST, que contiene todas las declaraciones.
    *   `VarDeclarationNode`: Representa una declaración de variable.
    *   `FunctionDeclarationNode`: Representa una definición de función.
    *   `ExpressionStatementNode`: Representa una sentencia que es una expresión.
    *   `ReturnStatementNode`: Representa una sentencia de retorno.
    *   `BinaryExpressionNode`: Representa una expresión con un operador binario.
    *   `LiteralNode`: Representa un valor literal (por ejemplo, número, cadena).
    *   `IdentifierNode`: Representa un nombre de variable o función.
    *   `FunctionCallNode`: Representa una llamada a función.
    *   `GroupingNode`: Representa una expresión entre paréntesis.
    *   `IfStatementNode`: Representa una sentencia if.

*   **Ejemplo:**

    Dados los tokens del ejemplo anterior del Lexer, el Parser crearía un AST que representa la estructura del código, indicando las declaraciones de variables, las asignaciones y las operaciones aritméticas.

### 3. Interpreter (`src/lib/interpreter.ts`)

El Interpreter ejecuta el AST creado por el Parser. Recorre el árbol, evaluando expresiones, ejecutando sentencias y gestionando el estado del programa.

*   **Funcionalidad:**
    *   **Recorrido del AST:** Visita cada nodo en el AST.
    *   **Evaluación de Expresiones:** Calcula los valores de las expresiones, incluyendo operaciones aritméticas, búsquedas de variables y llamadas a funciones.
    *   **Ejecución de Sentencias:** Ejecuta sentencias tales como asignaciones de variables, declaraciones de funciones, sentencias de retorno y bifurcaciones condicionales.
    *   **Gestión de Alcance:** Crea y gestiona el alcance de las variables y funciones. Utiliza `this.globals` para el alcance global y gestiona el alcance de las funciones mediante variables temporales.
    *   **Llamadas a Funciones:** Evalúa las llamadas a funciones.
    *   **Manejo de Errores:** Informa errores en tiempo de ejecución, tales como división por cero o variables no definidas.
    *   **Manejo de Retorno:** Maneja las sentencias de retorno.
    *   **Manejo de Salida:** La función "imprime" añade a una cadena `output` que se devuelve al usuario.

*   **Ejemplo:**

    Dado el AST del ejemplo del Parser, el Interpreter:

    1.  Declararía la variable `a` y la inicializaría a 10.
    2.  Evaluaría la expresión `a + 1` (10 + 1 = 11).
    3.  Asignaría el resultado (11) a la variable `a`.
    4.  Devolvería el valor final de `a`, que es 11.

## Ejecutando el Proyecto

1.  **Clona el repositorio:**

    ```bash
    git clone <url_del_repositorio>
    cd jeanpzh-analizador-de-codigo
    ```

2.  **Instala las dependencias:**

    ```bash
    npm install  # o yarn install o pnpm install o bun install
    ```

3.  **Ejecuta el servidor de desarrollo:**

    ```bash
    npm run dev # o yarn dev o pnpm dev o bun dev
    ```

4.  **Abre tu navegador y navega a `http://localhost:3000`** para ver la aplicación.

## Tecnologías Clave

*   **Next.js:** Framework de React para construir aplicaciones web con renderizado del lado del servidor y enrutamiento.
*   **React:** Biblioteca de JavaScript para construir interfaces de usuario.
*   **TypeScript:** Superconjunto de JavaScript que añade tipado estático.
*   **Tailwind CSS:** Framework CSS de utilidad para el diseño de la aplicación.
*   **shadcn/ui:** Componentes de la interfaz de usuario reutilizables.
*   **Monaco Editor:** Componente de editor de código utilizado en las páginas de ejemplo.
*   **recharts:** Biblioteca de gráficos para mostrar el análisis de frecuencia de tokens.

## Características Clave
*   **Editor de Código en Vivo:** Editor Monaco integrado para escribir y editar código directamente en el navegador.
*   **Análisis en Tiempo Real:** Proporciona retroalimentación inmediata sobre la ejecución del código.
*   **Visualización de Tokens:** Muestra la frecuencia de los tokens.
*   **Ejemplos Predeterminados:** Ofrece una gama de ejemplos de código para explorar.
*   **Lenguaje Personalizado:** Analiza e interpreta el código basándose en una estructura de lenguaje definida específicamente.

## Punto de Entrada de la API del Proyecto

*   **/api/analyze**: Analiza el código dado y devuelve los resultados. Maneja errores como la división por cero. Devuelve tokens para la visualización del análisis léxico.
