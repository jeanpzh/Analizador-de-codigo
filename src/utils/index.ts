export const patronesTokens = [
  { tipo: "PALABRA RESERVADA", regex: /\b(entero|real|si|sinosi|sino|mientras|finsi|finmientras)\b/ },
  { tipo: "IDENTIFICADOR", regex: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
  { tipo: "NUMERO", regex: /\b\d+(\.\d+)?\b/ },
  { tipo: "OPERADOR", regex: /[=+\-*/<>]/ },
  { tipo: "PARENTESIS", regex: /[()]/ },
  { tipo: "COMA", regex: /,/ },
  { tipo: "ESPACIO EN BLANCO", regex: /\s+/, ignorar: true }
];