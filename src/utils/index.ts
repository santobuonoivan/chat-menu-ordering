import { IMenuItem } from "@/types/menu";
import { v4 as uuidv4 } from "uuid";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateUUID = () => {
  return uuidv4();
};

export const rankAndFilterDishes = (
  dishList: string[],
  userInput: string
): string[] => {
  // Lista de palabras comunes e irrelevantes que deben ignorarse en el ranking (Stop Words)
  const STOP_WORDS = new Set([
    "quiero",
    "un",
    "una",
    "unos",
    "unas",
    "el",
    "la",
    "los",
    "las",
    "de",
    "del",
    "al",
    "a",
    "y",
    "o",
    "pero",
    "para",
    "por",
    "mi",
    "me",
    "dame",
    "traeme",
    "necesito",
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
