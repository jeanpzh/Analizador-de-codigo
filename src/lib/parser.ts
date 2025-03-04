import {
  ASTNode, ProgramNode, VarDeclarationNode, FunctionDeclarationNode, IfStatementNode,
  ReturnStatementNode, ExpressionStatementNode, BinaryExpressionNode, IdentifierNode,
  LiteralNode, GroupingNode, FunctionCallNode
} from "@/lib/ast"

export class Parser {
  private tokens: any[];
  private pos: number = 0;

  constructor(tokens: any[]) {
    this.tokens = tokens;
  }

  // Devuelve el token actual
  private get current() {
    return this.tokens[this.pos];
  }

  // Consume el token actual si coincide con el tipo indicado
  private consume(tipo: string, mensaje: string) {
    if (this.pos < this.tokens.length && this.current.tipo === tipo) {
      return this.tokens[this.pos++];
    }
    throw new Error(mensaje);
  }

  // Inicia el parseo y devuelve el nodo raíz (programa)
  public parse(): ProgramNode {
    const declarations: ASTNode[] = [];
    while (this.pos < this.tokens.length) {
      declarations.push(this.declaration());
    }
    return { type: "Program", body: declarations };
  }

  // Analiza una declaración: variable, función o sentencia.
  private declaration(): ASTNode {
    // Declaración de variable (por ejemplo, "entero" o "real")
    if (this.current.tipo === "PALABRA_RESERVADA" &&
        (this.current.valor === "entero" || this.current.valor === "real")) {
      return this.varDeclaration();
    }
    // Declaración de función
    else if (this.current.tipo === "PALABRA_RESERVADA" && this.current.valor === "funcion") {
      return this.functionDeclaration();
    }
    // En otros casos se interpreta como sentencia
    return this.statement();
  }

  private varDeclaration(): VarDeclarationNode {
    const varType = this.consume("PALABRA_RESERVADA", "Se esperaba tipo de variable").valor;
    const idToken = this.consume("IDENTIFICADOR", "Se esperaba identificador de variable");
    let initializer: ASTNode | null = null;
    // Si existe el operador "=" se parsea la expresión de inicialización
    if (this.current && this.current.tipo === "OPERADOR" && this.current.valor === "=") {
      this.consume("OPERADOR", "Se esperaba '='");
      initializer = this.expression();
    }
    return { type: "VarDeclaration", varType, identifier: idToken.valor, initializer };
  }

  private functionDeclaration(): FunctionDeclarationNode {
    this.consume("PALABRA_RESERVADA", "Se esperaba 'funcion'");
    const nameToken = this.consume("IDENTIFICADOR", "Se esperaba el nombre de la función");
    this.consume("PARENTESIS", "Se esperaba '(' al inicio de parámetros");
    const params: string[] = [];
    // Si el siguiente token no es ")" se asume que existen parámetros
    if (!(this.current && this.current.tipo === "PARENTESIS" && this.current.valor === ")")) {
      do {
        const paramToken = this.consume("IDENTIFICADOR", "Se esperaba parámetro");
        params.push(paramToken.valor);
        if (this.current && this.current.tipo === "COMA") {
          this.consume("COMA", "Se esperaba ',' entre parámetros");
        } else {
          break;
        }
      } while (true);
    }
    this.consume("PARENTESIS", "Se esperaba ')' al final de parámetros");
    // Se parsea el cuerpo de la función como secuencia de sentencias hasta encontrar "finfuncion"
    const body: ASTNode[] = [];
    while (this.pos < this.tokens.length &&
           !(this.current.tipo === "PALABRA_RESERVADA" && this.current.valor === "finfuncion")) {
      body.push(this.statement());
    }
    this.consume("PALABRA_RESERVADA", "Se esperaba 'finfuncion' al final de la función");
    return { type: "FunctionDeclaration", name: nameToken.valor, params, body };
  }

  private statement(): ASTNode {
    // Soporte para sentencias condicionales
    if (this.current.tipo === "PALABRA_RESERVADA" && this.current.valor === "si") {
      return this.ifStatement();
    }
    // Sentencia de retorno
    if (this.current.tipo === "PALABRA_RESERVADA" && this.current.valor === "retornar") {
      return this.returnStatement();
    }
    // Caso por defecto: sentencia de expresión
    return this.expressionStatement();
  }

  private ifStatement(): IfStatementNode {
    this.consume("PALABRA_RESERVADA", "Se esperaba 'si'");
    this.consume("PARENTESIS", "Se esperaba '(' en la condición del if");
    const condition = this.expression();
    this.consume("PARENTESIS", "Se esperaba ')' al finalizar la condición del if");

    const thenBranch: ASTNode[] = [];
    // Se asume que las sentencias del bloque then se leen hasta encontrar "sino" o "finsi"
    while (this.current && !(this.current.tipo === "PALABRA_RESERVADA" && (this.current.valor === "sino" || this.current.valor === "finsi"))) {
      thenBranch.push(this.statement());
    }

    let elseBranch: ASTNode[] | undefined;
    if (this.current && this.current.tipo === "PALABRA_RESERVADA" && this.current.valor === "sino") {
      this.consume("PALABRA_RESERVADA", "Se esperaba 'sino'");
      elseBranch = [];
      while (this.current && !(this.current.tipo === "PALABRA_RESERVADA" && this.current.valor === "finsi")) {
        elseBranch.push(this.statement());
      }
    }
    this.consume("PALABRA_RESERVADA", "Se esperaba 'finsi' al final del if");
    return { type: "IfStatement", condition, thenBranch, elseBranch };
  }

  private returnStatement(): ReturnStatementNode {
    this.consume("PALABRA_RESERVADA", "Se esperaba 'retornar'");
    const expr = this.expression();
    return { type: "ReturnStatement", expression: expr };
  }

  private expressionStatement(): ExpressionStatementNode {
    const expr = this.expression();
    return { type: "ExpressionStatement", expression: expr };
  }

  // ====================================================
  // Análisis de expresiones (precedencia de operadores)
  // ====================================================

  private expression(): ASTNode {
    return this.assignment();
  }

  private assignment(): ASTNode {
    // Para este lenguaje, asumimos que la asignación se realiza en la declaración,
    // así que se sigue parseando una expresión de igualdad.
    return this.equality();
  }

  private equality(): ASTNode {
    let expr = this.comparison();
    while (this.current && this.current.tipo === "OPERADOR" &&
          (this.current.valor === "==" || this.current.valor === "!=")) {
      const op = this.consume("OPERADOR", "Se esperaba operador de igualdad").valor;
      const right = this.comparison();
      expr = { type: "BinaryExpression", operator: op, left: expr, right } as BinaryExpressionNode;
    }
    return expr;
  }

  private comparison(): ASTNode {
    let expr = this.term();
    while (this.current && this.current.tipo === "OPERADOR" &&
          (this.current.valor === "<" || this.current.valor === ">" ||
           this.current.valor === "<=" || this.current.valor === ">=")) {
      const op = this.consume("OPERADOR", "Se esperaba operador de comparación").valor;
      const right = this.term();
      expr = { type: "BinaryExpression", operator: op, left: expr, right } as BinaryExpressionNode;
    }
    return expr;
  }

  private term(): ASTNode {
    let expr = this.factor();
    while (this.current && this.current.tipo === "OPERADOR" &&
          (this.current.valor === "+" || this.current.valor === "-")) {
      const op = this.consume("OPERADOR", "Se esperaba operador de suma/resta").valor;
      const right = this.factor();
      expr = { type: "BinaryExpression", operator: op, left: expr, right } as BinaryExpressionNode;
    }
    return expr;
  }

  private factor(): ASTNode {
    let expr = this.unary();
    while (this.current && this.current.tipo === "OPERADOR" &&
          (this.current.valor === "*" || this.current.valor === "/"
            || this.current.valor === "%" || this.current.valor === "^"
            || this.current.valor === "&&" || this.current.valor === "||" 
          )) {
      const op = this.consume("OPERADOR", "Se esperaba operador de multiplicación/división").valor;
      const right = this.unary();
      expr = { type: "BinaryExpression", operator: op, left: expr, right } as BinaryExpressionNode;
    }
    return expr;
  }

  private unary(): ASTNode {
    return this.call();
  }

  // Soporta llamadas a función, por ejemplo: suma(a, b)
  private call(): ASTNode {
    let expr = this.primary();
    while (this.current && this.current.tipo === "PARENTESIS" && this.current.valor === "(") {
      expr = this.finishCall(expr);
    }
    return expr;
  }

  private finishCall(callee: ASTNode): ASTNode {
    let functionName = "";
    if (callee.type === "Identifier") {
      functionName = (callee as IdentifierNode).name;
    } else {
      throw new Error("Se esperaba un identificador para llamada de función");
    }
    this.consume("PARENTESIS", "Se esperaba '(' en llamada de función");
    const args: ASTNode[] = [];
    if (!(this.current && this.current.tipo === "PARENTESIS" && this.current.valor === ")")) {
      do {
        args.push(this.expression());
        if (this.current && this.current.tipo === "COMA") {
          this.consume("COMA", "Se esperaba ',' entre argumentos");
        } else {
          break;
        }
      } while (true);
    }
    this.consume("PARENTESIS", "Se esperaba ')' al finalizar llamada de función");
    return { type: "FunctionCall", callee: functionName, arguments: args } as FunctionCallNode;
  }

  private primary(): ASTNode {
    const token = this.current;
    if (!token) {
      throw new Error("Fin inesperado de tokens");
    }
    if (token.tipo === "NUMERO") {
      this.pos++;
      return { type: "Literal", value: parseFloat(token.valor) } as LiteralNode;
    }
    if (token.tipo === "CADENA") {
      this.pos++;
      return { type: "Literal", value: token.valor } as LiteralNode;
    }
    if (token.tipo === "IDENTIFICADOR") {
      this.pos++;
      return { type: "Identifier", name: token.valor } as IdentifierNode;
    }
    if (token.tipo === "PARENTESIS" && token.valor === "(") {
      this.consume("PARENTESIS", "Se esperaba '('");
      const expr = this.expression();
      this.consume("PARENTESIS", "Se esperaba ')' después de la expresión");
      return { type: "Grouping", expression: expr } as GroupingNode;
    }
    throw new Error("Token inesperado en primary: " + token.valor);
  }
}

export default Parser;
