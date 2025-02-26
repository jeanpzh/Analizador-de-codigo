import {
  ASTNode, ProgramNode, VarDeclarationNode, FunctionDeclarationNode, IfStatementNode,
  ReturnStatementNode, ExpressionStatementNode, BinaryExpressionNode, IdentifierNode,
  LiteralNode, GroupingNode, FunctionCallNode
} from "@/lib/ats"

export class Parser {
  private tokens: any[];
  private pos: number = 0;

  constructor(tokens: any[]) {
    this.tokens = tokens;
  }

  // Devuelve el token actual
  private get actual() {
    return this.tokens[this.pos];
  }

  // Consume el token actual si coincide con el tipo indicado
  private consumir(tipo: string, mensaje: string) {
    if (this.pos < this.tokens.length && this.actual.tipo === tipo) {
      return this.tokens[this.pos++];
    }
    throw new Error(mensaje);
  }

  // Inicia el análisis y devuelve el nodo raíz (programa)
  public analizar(): ProgramNode {
    const declaraciones: ASTNode[] = [];
    while (this.pos < this.tokens.length) {
      declaraciones.push(this.declaracion());
    }
    return { type: "Program", body: declaraciones };
  }

  // Analiza una declaración: variable, función o sentencia.
  private declaracion(): ASTNode {
    // Declaración de variable (por ejemplo, "entero" o "real")
    if (
      this.actual.tipo === "PALABRA_RESERVADA" &&
      (this.actual.valor === "entero" || this.actual.valor === "real")
    ) {
      return this.declaracionVariable();
    }
    // Declaración de función
    else if (this.actual.tipo === "PALABRA_RESERVADA" && this.actual.valor === "funcion") {
      return this.declaracionFuncion();
    }
    // En otros casos se interpreta como sentencia
    return this.sentencia();
  }

  private declaracionVariable(): VarDeclarationNode {

    const tipoVariable = this.consumir("PALABRA_RESERVADA", "Se esperaba tipo de variable").valor;

    const tokenIdentificador = this.consumir("IDENTIFICADOR", "Se esperaba identificador de variable");

    let inicializador: ASTNode | null = null;
    // Si existe el operador "=" se analiza la expresión de inicialización

    if (this.actual && this.actual.tipo === "OPERADOR" && this.actual.valor === "=") {
      this.consumir("OPERADOR", "Se esperaba '='");
      inicializador = this.expresion();
    }

    return { type: "VarDeclaration", varType: tipoVariable, identifier: tokenIdentificador.valor, initializer: inicializador };
  }

  private declaracionFuncion(): FunctionDeclarationNode {

    this.consumir("PALABRA_RESERVADA", "Se esperaba 'funcion'");

    const tokenNombre = this.consumir("IDENTIFICADOR", "Se esperaba el nombre de la función");

    this.consumir("PARENTESIS", "Se esperaba '(' al inicio de parámetros");
    const parametros: string[] = [];

    // Si el siguiente token no es ")" se asume que existen parámetros
    if (!(this.actual && this.actual.tipo === "PARENTESIS" && this.actual.valor === ")")) {

      do {
        const tokenParametro = this.consumir("IDENTIFICADOR", "Se esperaba parámetro");
        parametros.push(tokenParametro.valor);

        if (this.actual && this.actual.tipo === "COMA") 
          this.consumir("COMA", "Se esperaba ',' entre parámetros");
         else break;
        
      } while (true);
    }
    this.consumir("PARENTESIS", "Se esperaba ')' al final de parámetros");
    // Se analiza el cuerpo de la función como secuencia de sentencias hasta encontrar "finfuncion"
    const cuerpo: ASTNode[] = [];
    while (
      this.pos < this.tokens.length &&
      !(this.actual.tipo === "PALABRA_RESERVADA" && this.actual.valor === "finfuncion")
    ) {
      cuerpo.push(this.sentencia());
    }
    this.consumir("PALABRA_RESERVADA", "Se esperaba 'finfuncion' al final de la función");
    return { type: "FunctionDeclaration", name: tokenNombre.valor, params: parametros, body: cuerpo };
  }

  private sentencia(): ASTNode {
    // Soporte para sentencias condicionales
    if (this.actual.tipo === "PALABRA_RESERVADA" && this.actual.valor === "si") {
      return this.sentenciaSi();
    }
    // Sentencia de retorno
    if (this.actual.tipo === "PALABRA_RESERVADA" && this.actual.valor === "retornar") {
      return this.sentenciaRetorno();
    }
    // Caso por defecto: sentencia de expresión
    return this.sentenciaExpresion();
  }

  private sentenciaSi(): IfStatementNode {
    this.consumir("PALABRA_RESERVADA", "Se esperaba 'si'");
    
    this.consumir("PARENTESIS", "Se esperaba '(' en la condición del if");

    const condicion = this.expresion();

    this.consumir("PARENTESIS", "Se esperaba ')' al finalizar la condición del if");

    const ramaEntonces: ASTNode[] = [];
    // Se asume que las sentencias del bloque "si" se leen hasta encontrar "sino" o "finsi"
    while (
      this.actual &&
      !(this.actual.tipo === "PALABRA_RESERVADA" && (this.actual.valor === "sino" || this.actual.valor === "finsi"))
    ) {
      ramaEntonces.push(this.sentencia());
    }

    let ramaSino: ASTNode[] | undefined;

    if (this.actual && this.actual.tipo === "PALABRA_RESERVADA" && this.actual.valor === "sino") {

      this.consumir("PALABRA_RESERVADA", "Se esperaba 'sino'");
      ramaSino = [];

      while (
        this.actual &&
        !(this.actual.tipo === "PALABRA_RESERVADA" && this.actual.valor === "finsi")
      ) {
        ramaSino.push(this.sentencia());
      }
    }

    this.consumir("PALABRA_RESERVADA", "Se esperaba 'finsi' al final del if");
    
    return { type: "IfStatement", condition: condicion, thenBranch: ramaEntonces, elseBranch: ramaSino };
  }

  private sentenciaRetorno(): ReturnStatementNode {
    this.consumir("PALABRA_RESERVADA", "Se esperaba 'retornar'");
    const expr = this.expresion();
    return { type: "ReturnStatement", expression: expr };
  }

  private sentenciaExpresion(): ExpressionStatementNode {
    const expr = this.expresion();
    return { type: "ExpressionStatement", expression: expr };
  }

  // ====================================================
  // Análisis de expresiones (precedencia de operadores)
  // ====================================================

  private expresion(): ASTNode {
    return this.asignacion();
  }

  private asignacion(): ASTNode {
    // Para este lenguaje, asumimos que la asignación se realiza en la declaración,
    // así que se sigue analizando una expresión de igualdad.
    return this.igualdad();
  }

  private igualdad(): ASTNode {
    let expr = this.comparacion();
    while (
      this.actual &&
      this.actual.tipo === "OPERADOR" &&
      (this.actual.valor === "==" || this.actual.valor === "!=")
    ) {
      const operador = this.consumir("OPERADOR", "Se esperaba operador de igualdad").valor;
      const derecha = this.comparacion();
      expr = { type: "BinaryExpression", operator: operador, left: expr, right: derecha } as BinaryExpressionNode;
    }
    return expr;
  }

  private comparacion(): ASTNode {
    let expr = this.termino();
    while (
      this.actual &&
      this.actual.tipo === "OPERADOR" &&
      (this.actual.valor === "<" || this.actual.valor === ">" ||
       this.actual.valor === "<=" || this.actual.valor === ">=")
    ) {
      const operador = this.consumir("OPERADOR", "Se esperaba operador de comparación").valor;
      const derecha = this.termino();
      expr = { type: "BinaryExpression", operator: operador, left: expr, right: derecha } as BinaryExpressionNode;
    }
    return expr;
  }

  private termino(): ASTNode {
    let expr = this.factor();
    while (
      this.actual &&
      this.actual.tipo === "OPERADOR" &&
      (this.actual.valor === "+" || this.actual.valor === "-")
    ) {
      const operador = this.consumir("OPERADOR", "Se esperaba operador de suma/resta").valor;
      const derecha = this.factor();
      expr = { type: "BinaryExpression", operator: operador, left: expr, right: derecha } as BinaryExpressionNode;
    }
    return expr;
  }

  private factor(): ASTNode {
    let expr = this.llamada();
    while (
      this.actual &&
      this.actual.tipo === "OPERADOR" &&
      (
        this.actual.valor === "*" || this.actual.valor === "/" ||
        this.actual.valor === "%" || this.actual.valor === "^" 
      )
    ) {
      const operador = this.consumir("OPERADOR", "Se esperaba operador de multiplicación/división/potencia/divisor").valor;
      const derecha = this.llamada();
      expr = { type: "BinaryExpression", operator: operador, left: expr, right: derecha } as BinaryExpressionNode;
    }
    return expr;
  }

  // Soporta llamadas a función, por ejemplo: suma(a, b)
  private llamada(): ASTNode {
    let expr = this.primario();
    while (this.actual && this.actual.tipo === "PARENTESIS" && this.actual.valor === "(") {
      expr = this.finalizarLlamada(expr);
    }
    return expr;
  }

  private finalizarLlamada(callee: ASTNode): ASTNode {
    let nombreFuncion = "";
    if (callee.type === "Identifier") 
      nombreFuncion = (callee as IdentifierNode).name;
     else throw new Error("Se esperaba un identificador para llamada de función");
    
    this.consumir("PARENTESIS", "Se esperaba '(' en llamada de función");
    const argumentos: ASTNode[] = [];

    if (!(this.actual && this.actual.tipo === "PARENTESIS" && this.actual.valor === ")")) {
     // Mientras no se encuentre el token de cierre de paréntesis, se siguen leyendo argumentos.
      while (!(this.actual && this.actual.tipo === "PARENTESIS" && this.actual.valor === ")")) {
        // Se parsea la expresión y se agrega a la lista de argumentos.
        argumentos.push(this.expresion());

        // Si el siguiente token es una coma, se consume; de lo contrario, se termina el ciclo.
        if (this.actual && this.actual.tipo === "COMA") {
          this.consumir("COMA", "Se esperaba ',' entre argumentos");
        } else 
          break;
        
      }
    }
    this.consumir("PARENTESIS", "Se esperaba ')' al finalizar llamada de función");
    return { type: "FunctionCall", callee: nombreFuncion, arguments: argumentos } as FunctionCallNode;
  }

  private primario(): ASTNode {
    const token = this.actual;
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
      this.consumir("PARENTESIS", "Se esperaba '('");
      const expr = this.expresion();
      this.consumir("PARENTESIS", "Se esperaba ')' después de la expresión");
      return { type: "Grouping", expression: expr } as GroupingNode;
    }
    throw new Error("Token inesperado en primario: " + token.valor);
  }
}

export default Parser;
