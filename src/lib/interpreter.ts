export class ReturnException {
  value: any;
  constructor(value: any) {
    this.value = value;
  }
}

export class Interpreter {
  // Ambiente global y tabla de funciones
  private globals: { [key: string]: any } = {};
  private functions: { [key: string]: any } = {};
  // Se acumula la salida de la función "imprime"
  private output: string = "";

  /**
   * Interpreta el AST y retorna el resultado de la última sentencia evaluada.
   * Si se ha llamado a "imprime" dentro de una función, se devuelve esa salida.
   */
  public interpret(ast: any): any {
    let result: any = undefined;
    try {
      // Se recorre cada declaración del programa
      for (const stmt of ast.body) {
        result = this.execute(stmt);
      }
    } catch (e) {
      if (e instanceof ReturnException) {
        return e.value;
      }
      console.error(e);
      throw e;
    }
    // Se devuelve la salida acumulada o el último resultado
    return this.output !== "" ? this.output : result;
  }

  /**
   * Ejecuta una lista de declaraciones y retorna el resultado de la última.
   */
  private executeBlock(statements: any[]): any {
    let result: any = undefined;
    for (const stmt of statements) {
      result = this.execute(stmt);
    }
    return result;
  }

  /**
   * Ejecuta una declaración según su tipo.
   */
  private execute(stmt: any): any {
    switch (stmt.type) {
      case "VarDeclaration":
        return this.executeVarDeclaration(stmt);
      case "FunctionDeclaration":
        return this.executeFunctionDeclaration(stmt);
      case "ExpressionStatement":
        return this.evaluate(stmt.expression);
      case "ReturnStatement":
        const retValue = this.evaluate(stmt.expression);
        throw new ReturnException(retValue);
      case "IfStatement":
        return this.executeIfStatement(stmt);
      default:
        throw new Error("Declaración desconocida: " + JSON.stringify(stmt, null, 2));
    }
  }

  /**
   * Declara una variable y la inicializa (o la fija en 0 si no hubiera valor).
   */
  private executeVarDeclaration(stmt: any): void {
    const value = stmt.initializer ? this.evaluate(stmt.initializer) : 0;
    this.globals[stmt.identifier] = value;
  }

  /**
   * Almacena la definición de una función en la tabla de funciones.
   */
  private executeFunctionDeclaration(stmt: any): void {
    this.functions[stmt.name] = stmt;
  }

  /**
   * Ejecuta una sentencia If y retorna el resultado del bloque correspondiente.
   */
  private executeIfStatement(stmt: any): any {
    const condition = this.evaluate(stmt.condition);
    if (condition) {
      return this.executeBlock(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      return this.executeBlock(stmt.elseBranch);
    }
    return null;
  }

  /**
   * Evalúa una expresión según su tipo.
   */
  private evaluate(expr: any): any {
    switch (expr.type) {
      case "Literal":
        return expr.value;
      case "Identifier":
        if (this.globals.hasOwnProperty(expr.name)) {
          return this.globals[expr.name];
        } else {
          throw new Error(`Variable ${expr.name} no definida`);
        }
      case "BinaryExpression":
        return this.evaluateBinary(expr);
      case "Grouping":
        return this.evaluate(expr.expression);
      case "FunctionCall":
        return this.executeFunctionCall(expr);
      default:
        throw new Error("Expresión desconocida: " + JSON.stringify(expr, null, 2));
    }
  }

  /**
   * Evalúa una expresión binaria.
   */
  private evaluateBinary(expr: any): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);
    switch (expr.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          throw new Error("División por cero");
        }
        return left / right;
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case "<":
        return left < right;
      case ">":
        return left > right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      case "^":
        return Math.pow(left, right);
      default:
        throw new Error("Operador desconocido: " + expr.operator);
    }
  }

  /**
   * Ejecuta una llamada a función.
   * Soporta "imprime" como función incorporada y funciones definidas por el usuario.
   */
  private executeFunctionCall(expr: any): any {
    // Funcion incorporada "imprime"
    if (expr.callee === "imprime") {
      const args = expr.arguments.map((arg: any) => this.evaluate(arg));
      const message = args.join(" ");
      // Se acumula la salida en lugar de solo imprimir en consola
      this.output += message;
      return message;
    }
    // Función definida por el usuario
    const func = this.functions[expr.callee];
    if (!func) {
      throw new Error("Función no definida: " + expr.callee);
    }
    const args = expr.arguments.map((arg: any) => this.evaluate(arg));
    
    // Se guarda el ambiente actual y la salida global
    const previousGlobals = { ...this.globals };
    const previousOutput = this.output;
    // Reiniciamos la salida local para capturar la salida propia de la función
    this.output = "";

    if (func.params.length !== args.length) {
      throw new Error(`Número incorrecto de argumentos para la función ${func.name}`);
    }
    // Asigna los parámetros de la función a los argumentos evaluados
    for (let i = 0; i < func.params.length; i++) {
      this.globals[func.params[i]] = args[i];
    }
    
    let result = null;
    try {
      result = this.executeBlock(func.body);
    } catch (e) {
      if (e instanceof ReturnException) {
        result = e.value;
      } else {
        throw e;
      }
    }
    // Se obtiene la salida generada durante la ejecución de la función
    const printedOutput = this.output;
    // Se restaura el ambiente y la salida global previa
    this.globals = previousGlobals;
    this.output = previousOutput;
    
    // Se retorna la salida impresa o el resultado; puedes optar por devolver un JSON
    return printedOutput !== "" ? printedOutput : result;
  }
}

export default Interpreter;