import { Token } from "./types/Token";

export class Lexer {
  private linea = 1;
  private posicion = 0;

  constructor(private codigo: string) {
    this.codigo = codigo;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    let lexema = "";
    while (this.posicion < this.codigo.length) {
      const ch = this.codigo[this.posicion]; 

      // Ignorar comentarios
      if (ch === "#") {
        while (this.posicion < this.codigo.length && this.codigo[this.posicion] !== "\n") {
          this.posicion++;
        }
      }

      // Si el caracter actual es un salto de línea
      if (ch === "\n") {
        if (lexema.length > 0) {
          tokens.push(this.clasificar(lexema));
          lexema = "";
        }
        this.linea++;
      }
      // Si el caracter actual es un espacio en blanco
      else if (ch.match(/\s/)) {
        if (lexema.length > 0) {
          tokens.push(this.clasificar(lexema));
          lexema = "";
        }
      }
      // Si es una letra o guion bajo
      else if (ch.match(/[a-zA-Z_]/)) {
        lexema += ch;
      }
      // Si es un símbolo (excepto paréntesis, llaves o punto y coma)
      else if (ch.match(/[,+\-*/%=!^<>]/)) {
        if (lexema.length > 0) {
          tokens.push(this.clasificar(lexema));
          lexema = "";
        }
        tokens.push(this.clasificar(ch));
      }
      // Si es un dígito
      else if (ch.match(/\d/)) {
        lexema += ch;
      }
      // Si es un punto y el lexema es un número entero
      else if (ch === "." && lexema.match(/^\d+$/)) {
        lexema += ch;
      }
      // Si es el inicio de una cadena
      else if (ch === '"') {
        lexema += ch; // Agrega la comilla de apertura
        this.posicion++; // Mueve el puntero para procesar el contenido
        // Recorrer hasta encontrar la comilla de cierre o el fin del código
        while (this.posicion < this.codigo.length && this.codigo[this.posicion] !== '"') {
          lexema += this.codigo[this.posicion];
          this.posicion++;
        }
        // Agregar la comilla de cierre, si existe
        if (this.posicion < this.codigo.length && this.codigo[this.posicion] === '"') {
          lexema += this.codigo[this.posicion];
        }
        tokens.push(this.clasificar(lexema));
        lexema = "";
      }
      // Si es un paréntesis, llave o punto y coma
      else if (ch.match(/[(){};]/)) {
        if (lexema.length > 0) {
          tokens.push(this.clasificar(lexema));
          lexema = "";
        }
        tokens.push(this.clasificar(ch));
      }
      this.posicion++;
    }
    // Agregar el último lexema si no está vacío
    if (lexema.length > 0) {
      tokens.push(this.clasificar(lexema));
    }
    return tokens;
  }

  private clasificar(lexema: string): Token {
    // Reconocimiento de cadena literal (literal con comillas)
    if (lexema.startsWith('"') && lexema.endsWith('"')) {
      // Se remueven las comillas
      const texto = lexema.substring(1, lexema.length - 1);
      return {
        tipo: "CADENA",
        valor: texto,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/\b(entero|real|si|sinosi|sino|mientras|finsi|finmientras|funcion|finfuncion|retornar)\b/)) {
      return {
        tipo: "PALABRA_RESERVADA",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/)) {
      return {
        tipo: "IDENTIFICADOR",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/[=+\-*/<>^]/)) {
      return {
        tipo: "OPERADOR",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/\b\d+(\.\d+)?\b/)) {
      return {
        tipo: "NUMERO",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/^[{};]$/)) {
      return {
        tipo: "SIMBOLO",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/[()]/)) {
      return {
        tipo: "PARENTESIS",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/,/)) {
      return {
        tipo: "COMA",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    if (lexema.match(/^$/)) {
      return {
        tipo: "EOF",
        valor: lexema,
        linea: this.linea,
        posicion: this.posicion,
      };
    }
    return {
      tipo: "DESCONOCIDO",
      valor: lexema,
      linea: this.linea,
      posicion: this.posicion,
    };
  }
}