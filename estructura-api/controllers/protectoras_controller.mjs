import db from "../config/database.mjs";

export const getProtectorasConAnimales = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, 
                p.nombre, 
                p.direccion,
                p.pagina_web,
                COUNT(a.id) AS numero_animales_web
            FROM 
                protectoras p
            LEFT JOIN 
                animales a ON p.id = a.protectora_id
            GROUP BY 
                p.id;
        `;

        const result = await db.query(query);

        // Devolvemos el array de objetos en forma de JSON
        return res.json(result.rows);
    } catch (error) {
        console.error("Error al buscar protectoras:", error);
        return res.status(500).json({ error: "Error de la base de datos" });
    }
};
