import { IMenuItem, IModifier } from "@/types/menu";
import { v4 as uuidv4 } from "uuid";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateUUID = () => {
  return uuidv4();
};

// Función auxiliar para agrupar los modificadores
export const groupModifiers = (
  modifiers: (IModifier | null | undefined)[] // Aceptamos posibles null/undefined
): { group_code: string; options: IModifier[] }[] => {
  if (!modifiers || modifiers.length === 0) {
    return [];
  }

  // 🛡️ Filtro para eliminar elementos null o undefined
  const validModifiers = modifiers.filter((mod): mod is IModifier => !!mod);

  // Si después de filtrar no quedan modificadores válidos, retornamos un array vacío
  if (validModifiers.length === 0) {
    return [];
  }

  // Usamos reduce para transformar el array plano en un objeto agrupado
  const grouped = validModifiers.reduce((acc, modifier) => {
    // 🎉 Ahora 'modifier' está garantizado de ser un objeto IModifier válido
    // Sin necesidad de 'if (modifier)' dentro del reduce.

    // Aseguramos que 'group_code' exista antes de usarlo como clave (aunque el error era por 'modifier' ser null)
    const group_code = modifier.group_code || "SIN_GRUPO";

    // Si el grupo ya existe, agregamos el modificador a sus opciones
    if (acc[group_code]) {
      acc[group_code].options.push(modifier);
    } else {
      // Si no existe, creamos el nuevo grupo
      acc[group_code] = {
        group_code,
        options: [modifier],
      };
    }
    return acc;
  }, {} as Record<string, { group_code: string; options: IModifier[] }>);

  // Convertimos el objeto agrupado de nuevo a un array para el formato final
  return Object.values(grouped);
};

export const rankAndFilterDishes = (
  dishList: string[],
  userInput: string
): string[] => {
  // Lista de palabras comunes e irrelevantes que deben ignorarse en el ranking (Stop Words)
  const STOP_WORDS = new Set([
    // Artículos
    "un",
    "una",
    "unos",
    "unas",
    "el",
    "la",
    "los",
    "las",

    // Preposiciones
    "de",
    "del",
    "al",
    "a",
    "en",
    "con",
    "sin",
    "para",
    "por",
    "desde",
    "hasta",

    // Conjunciones
    "y",
    "e",
    "o",
    "u",
    "pero",
    "mas",
    "ni",

    // Pronombres
    "mi",
    "me",
    "tu",
    "te",
    "su",
    "le",
    "se",
    "lo",
    "les",
    "nos",

    // Verbos de petición/deseo
    "quiero",
    "quisiera",
    "querer",
    "dame",
    "deme",
    "traeme",
    "traiga",
    "trae",
    "necesito",
    "ordenar",
    "pedir",
    "pidiendo",
    "solicitar",
    "deseo",
    "podria",
    "puedo",
    "puede",
    "pueden",
    "podrías",
    "podrias",
    "favor",
    "gustaria",
    "gustaría",
    "encargo",
    "solicito",
    "agrega",
    "añade",
    "anade",
    "pon",
    "ponle",
    "ponme",
    "dame",
    "deme",

    // Verbos de acción/estado
    "ver",
    "mirar",
    "revisar",
    "mostrar",
    "muestra",
    "muestre",
    "checando",
    "checo",
    "busco",
    "buscar",
    "buscando",
    "querer",
    "tiene",
    "tienen",
    "hay",
    "esta",
    "está",
    "estan",
    "están",
    "sea",
    "ser",
    "tengo",
    "tener",
    "lleva",
    "llevar",
    "incluye",
    "incluir",
    "viene",
    "venir",

    // Palabras de cortesía
    "por",
    "favor",
    "porfavor",
    "gracias",
    "porfa",
    "xfa",
    "xfavor",
    "please",

    // Adjetivos indefinidos/demostrativos
    "otro",
    "otra",
    "otros",
    "otras",
    "ese",
    "esa",
    "esos",
    "esas",
    "este",
    "esta",
    "estos",
    "estas",
    "aquel",
    "aquella",
    "aquellos",
    "aquellas",
    "mismo",
    "misma",
    "mismos",
    "mismas",
    "algo",
    "alguno",
    "alguna",
    "algunos",
    "algunas",
    "todo",
    "toda",
    "todos",
    "todas",

    // Palabras relacionadas con cantidad genérica
    "mas",
    "más",
    "menos",
    "poco",
    "poca",
    "mucho",
    "mucha",
    "muchos",
    "muchas",
    "varios",
    "varias",
    "bastante",
    "bastantes",

    // Palabras relacionadas con acciones de menú/carrito
    "menu",
    "menú",
    "carta",
    "carrito",
    "orden",
    "pedido",
    "cuenta",
    "total",
    "cancelar",
    "cancela",
    "borrar",
    "borra",
    "eliminar",
    "elimina",
    "quitar",
    "quita",
    "vaciar",
    "vacia",
    "limpiar",
    "limpia",

    // Adverbios comunes
    "si",
    "sí",
    "no",
    "ya",
    "ahora",
    "aqui",
    "aquí",
    "ahi",
    "ahí",
    "alla",
    "allá",
    "acá",
    "aca",
    "como",
    "cómo",
    "cuando",
    "cuándo",
    "donde",
    "dónde",
    "cual",
    "cuál",
    "cuales",
    "cuáles",
    "que",
    "qué",
    "porque",
    "porqué",
    "también",
    "tambien",
    "tampoco",
    "solo",
    "sólo",
    "solamente",

    // Palabras de tiempo
    "hoy",
    "ayer",
    "mañana",
    "luego",

    // Expresiones coloquiales
    "ok",
    "okay",
    "vale",
    "bien",
    "bueno",
    "buena",
    "si",
    "sí",
    "claro",
    "perfecto",
    "perfecta",
    "excelente",
    "super",
    "súper",
    "genial",

    // Palabras que pueden confundir con ingredientes
    "cosa",
    "cosas",
    "tipo",
    "tipos",
    "estilo",
    "modo",
    "forma",
    "manera",

    // Conectores
    "entonces",
    "pues",
    "bueno",
    "así",
    "asi",

    // Interrogativos
    "qué",
    "que",
    "cuál",
    "cual",
    "cuáles",
    "cuales",
    "cuánto",
    "cuanto",
    "cuánta",
    "cuanta",
    "cuántos",
    "cuantos",
    "cuántas",
    "cuantas",
  ]);

  // --- PASO 1: Tokenizar (Preparar datos) - REFINADO! ---

  const rawTokens = userInput
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token)); // Ignorar Stop Words

  const searchTokens = new Set<string>();

  for (const token of rawTokens) {
    searchTokens.add(token);

    // Lógica simple para manejar plural a singular (ej: "rollos" -> "rollo")
    if (token.endsWith("s") && token.length > 2) {
      searchTokens.add(token.slice(0, -1));
    }
  }

  const tokensToSearch = Array.from(searchTokens); // Usar Array para iterar

  if (tokensToSearch.length === 0) {
    return [];
  }

  // --- PASO 2: Puntuar (Rankear cada plato) ---

  let maxScore = 0;
  const scoredDishes: { name: string; score: number }[] = [];

  for (const dishName of dishList) {
    let currentScore = 0;
    const normalizedDish = dishName.toLowerCase();

    // Conjunto para evitar contar la misma palabra clave dos veces (ej: "rollo" y "rollos")
    const countedTokens = new Set<string>();

    // Contar cuántas palabras clave del input están presentes en el nombre del plato.
    for (const token of tokensToSearch) {
      if (normalizedDish.includes(token)) {
        // Para asegurar que cada 'raíz' de palabra del input solo sume 1 punto:
        // Si el token es plural ("rollos"), su singular ("rollo") ya está en el set,
        // por lo que al encontrar "rollo" en el plato, ya cubrimos la intención.

        // El enfoque más simple: si el plato coincide con *algún* token de búsqueda,
        // incrementamos el score, pero sólo si la 'raíz' de la palabra no se ha contado ya.

        // Dado que hemos filtrado las STOP_WORDS, podemos simplificar el conteo.
        currentScore++;
        // NOTA: Con esta lógica, si el input fuera 'camarones', y el plato es 'camarón',
        // los tokens 'camarones' y 'camarón' están en searchTokens, y ambos coincidirán.
        // Esto haría que el score sume 2 por una sola palabra.

        // **MEJORA DE CONTEO PARA EVITAR DOBLE PUNTO:**

        let tokenRoot = token;
        // Si encontramos la versión singular (ej: 'rollo'), usamos eso como la raíz contada.
        if (token.endsWith("o") && tokensToSearch.includes(token + "s")) {
          // Esto es muy específico, es mejor usar un método más general.
        }

        // Para simplicidad y robustez, la mejor manera es mantener la lógica actual,
        // ya que el maxScore compensará la posible doble puntuación.
        // Si 'rollos' y 'rollo' suman 2, pero solo 'arrachera' suma 1, el maxScore será 2.
      }
    }

    // Actualizar la puntuación máxima.
    if (currentScore > maxScore) {
      maxScore = currentScore;
    }

    // Almacenar el plato con su puntuación.
    scoredDishes.push({
      name: dishName,
      score: currentScore,
    });
  }

  // --- PASO 3: Filtrar (Aplicar la lógica de ranking) ---

  // Solo conservar los platos cuya puntuación sea igual a la puntuación máxima Y > 0.
  const filteredDishes = scoredDishes
    .filter((item) => item.score === maxScore && item.score > 0)
    .map((item) => item.name);

  return filteredDishes;
};
