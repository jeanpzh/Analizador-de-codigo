export const examples = [
  {
      name: "Función con argumentos y operación aritmética",
      code: `
entero a = 10
entero b = 7

funcion exponencial(a, b)
  retornar b + a * 2
finfuncion

exponencial(b, a)
# Resultado esperado: 24
      `
  },
  {
      name: "Sentencia condicional (if-else)",
      code: `
entero a = 5

si (a > 3)
  retornar 1
sino
  retornar 0
finsi
# Resultado esperado: 1
      `
  },
  {
      name: "Error por división entre cero",
      code: `
entero a = 10
entero b = 0

retornar a / b
# Error esperado: División por cero
      `
  },
  {
      name: "Función sin parámetros",
      code: `
funcion saludo()
  retornar "Hola Mundo"
finfuncion

saludo()
# Resultado esperado: "Hola Mundo"
      `
  },
  {
      name: "Funciones anidadas y llamadas con resultados compuestos",
      code: `
entero a = 3

funcion duplicar(x)
  retornar x * 2
finfuncion

funcion sumar(a, b)
  retornar a + b
finfuncion

sumar(duplicar(a), 4)
# Duplicar: 3*2 = 6, luego sumar: 6+4 = 10
# Resultado esperado: 10
      `
  }
];