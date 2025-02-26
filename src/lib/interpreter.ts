export class ExcepcionRetorno {
  valor: any;
  constructor(valor: any) {
    this.valor = valor;
  }
}

export class Interprete {
  // Ambiente global y tabla de funciones
  private globales: { [clave: string]: any } = {};
  private funciones: { [clave: string]: any } = {};
  // Se acumula la salida de la función "imprime"
  private salida: string = "";

  /**
   * Interpreta el AST y retorna el resultado de la última sentencia evaluada.
   * Si se ha llamado a "imprime" dentro de una función, se devuelve esa salida.
   */
  public interpretar(ast: any): any {
    let resultado: any = undefined;
    try {
      // Se recorre cada declaración del programa
      for (const stmt of ast.body) {
        resultado = this.ejecutar(stmt);
      }
    } catch (e) {
      if (e instanceof ExcepcionRetorno) {
        return e.valor;
      }
      console.error(e);
      throw e;
    }
    // Se devuelve la salida acumulada o el último resultado
    return this.salida !== "" ? this.salida : resultado;
  }

  /**
   * Ejecuta una lista de declaraciones y retorna el resultado de la última.
   */
  private ejecutarBloque(declaraciones: any[]): any {
    let resultado: any = undefined;
    for (const stmt of declaraciones) {
      resultado = this.ejecutar(stmt);
    }
    return resultado;
  }

  /**
   * Ejecuta una declaración según su tipo.
   */
  private ejecutar(stmt: any): any {
    switch (stmt.type) {
      case "VarDeclaration":
        return this.ejecutarDeclaracionVariable(stmt);
      case "FunctionDeclaration":
        return this.ejecutarDeclaracionFunción(stmt);
      case "ExpressionStatement":
        return this.evaluar(stmt.expression);
      case "ReturnStatement":
        const valorRetorno = this.evaluar(stmt.expression);
        throw new ExcepcionRetorno(valorRetorno);
      case "IfStatement":
        return this.ejecutarSentenciaSi(stmt);
      default:
        throw new Error("Declaración desconocida: " + JSON.stringify(stmt, null, 2));
    }
  }

  /**
   * Declara una variable y la inicializa (o la fija en 0 si no hubiera valor).
   */
  private ejecutarDeclaracionVariable(stmt: any): void {
    const valor = stmt.initializer ? this.evaluar(stmt.initializer) : 0;
    this.globales[stmt.identifier] = valor;
  }

  /**
   * Almacena la definición de una función en la tabla de funciones.
   */
  private ejecutarDeclaracionFunción(stmt: any): void {
    this.funciones[stmt.name] = stmt;
  }

  /**
   * Ejecuta una sentencia If y retorna el resultado del bloque correspondiente.
   */
  private ejecutarSentenciaSi(stmt: any): any {
    const condición = this.evaluar(stmt.condition);
    if (condición) {
      return this.ejecutarBloque(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      return this.ejecutarBloque(stmt.elseBranch);
    }
    return null;
  }

  /**
   * Evalúa una expresión según su tipo.
   */
  private evaluar(expr: any): any {
    switch (expr.type) {
      case "Literal":
        return expr.value;
      case "Identifier":
        if (this.globales.hasOwnProperty(expr.name)) {
          return this.globales[expr.name];
        } else {
          throw new Error(`Variable ${expr.name} no definida`);
        }
      case "BinaryExpression":
        return this.evaluarBinario(expr);
      case "Grouping":
        return this.evaluar(expr.expression);
      case "FunctionCall":
        return this.ejecutarLlamadaFunción(expr);
      default:
        throw new Error("Expresión desconocida: " + JSON.stringify(expr, null, 2));
    }
  }

  /**
   * Evalúa una expresión binaria.
   */
  private evaluarBinario(expr: any): any {
    const izquierda = this.evaluar(expr.left);
    const derecha = this.evaluar(expr.right);
    switch (expr.operator) {
      case "+":
        return izquierda + derecha;
      case "-":
        return izquierda - derecha;
      case "*":
        return izquierda * derecha;
      case "/":
        if (derecha === 0) {
          throw new Error("División por cero");
        }
        return izquierda / derecha;
      case "==":
        return izquierda === derecha;
      case "!=":
        return izquierda !== derecha;
      case "<":
        return izquierda < derecha;
      case ">":
        return izquierda > derecha;
      case "<=":
        return izquierda <= derecha;
      case ">=":
        return izquierda >= derecha;
      case "^":
        return Math.pow(izquierda, derecha);
      default:
        throw new Error("Operador desconocido: " + expr.operator);
    }
  }

  /**
   * Ejecuta una llamada a función.
   * Soporta "imprime" como función incorporada y funciones definidas por el usuario.
   */
  private ejecutarLlamadaFunción(expr: any): any {
    // Función incorporada "imprime"
    if (expr.callee === "imprime") {
      const args = expr.arguments.map((arg: any) => this.evaluar(arg));
      const mensaje = args.join(" ");
      // Se acumula la salida en lugar de solo imprimir en consola
      this.salida += mensaje;
      return mensaje;
    }
    // Función definida por el usuario
    const func = this.funciones[expr.callee];
    if (!func) {
      throw new Error("Función no definida: " + expr.callee);
    }
    const args = expr.arguments.map((arg: any) => this.evaluar(arg));

    // Se guarda el ambiente actual y la salida global
    const globalesPrevias = { ...this.globales };
    const salidaPrevia = this.salida;
    // Reiniciamos la salida local para capturar la salida propia de la función
    this.salida = "";

    if (func.params.length !== args.length) {
      throw new Error(`Número incorrecto de argumentos para la función ${func.name}`);
    }
    // Asigna los parámetros de la función a los argumentos evaluados
    for (let i = 0; i < func.params.length; i++) {
      this.globales[func.params[i]] = args[i];
    }

    let resultado = null;
    try {
      resultado = this.ejecutarBloque(func.body);
    } catch (e) {
      if (e instanceof ExcepcionRetorno) {
        resultado = e.valor;
      } else {
        throw e;
      }
    }
    // Se obtiene la salida generada durante la ejecución de la función
    const salidaImpreso = this.salida;
    // Se restaura el ambiente y la salida global previa
    this.globales = globalesPrevias;
    this.salida = salidaPrevia;

    // Se retorna la salida impresa o el resultado
    return salidaImpreso !== "" ? salidaImpreso : resultado;
  }
}

export default Interprete;
