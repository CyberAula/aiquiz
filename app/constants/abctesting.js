export const ABC_Testing_List = {
    // PRG: {
    //     from_date: "2024-01-01",
    //     to_date: "2024-12-31",        
    //     models:  ["Google_Generative_Pro", "Anthropic_Claude"]
    // },
    // CORE: {
    //     from_date: "2022-01-01",
    //     to_date: "2025-12-31",        
    //     models:  ["Google_Generative_Flash"]
    // },

    /*
     * Estructura de configuración para ABCTesting:
     *
     * Cada clave dentro de ABC_Testing representa una asignatura (por ejemplo, "PRG" o "CORE").
     * Para cada asignatura, se define un objeto con las siguientes propiedades:
     *
     * 1. from_date: (string) Fecha de inicio del ABCTesting en formato "YYYY-MM-DD".
     *    Indica desde cuándo estará activo el ABCTesting para esta asignatura.
     *
     * 2. to_date: (string) Fecha de finalización del ABCTesting en formato "YYYY-MM-DD".
     *    Indica hasta cuándo estará activo el ABCTesting para esta asignatura.
     *
     * 3. models: (array) Lista de nombres de modelos a utilizar en el ABCTesting.
     *    Estos nombres deben coincidir con los modelos definidos en el archivo `models.json`.
     *    Los modelos especificados aquí serán los únicos considerados al asignar un modelo
     *    a los alumnos de esta asignatura mientras el ABCTesting esté activo.
     *
     * Ejemplo:
     * {
     *   PRG: {
     *       from_date: "2024-01-01",
     *       to_date: "2024-12-31",
     *       models: ["Google_Generative_Pro", "Anthropic_Claude"]
     *   },
     *   CORE: {
     *       from_date: "2022-01-01",
     *       to_date: "2022-12-31",
     *       models: ["OpenAI_GPT_4o_Mini", "Google_Generative_Flash"]
     *   }
     * }
     *
     * Notas:
     * - Las fechas deben ser válidas y estar en formato "YYYY-MM-DD".
     * - Los modelos deben estar previamente definidos en el archivo `models.json`.
     * - Asegúrate de mantener un formato consistente para evitar errores.
     */
};