import db from "../config/database.mjs";

export const getProtectorasConAnimales = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, 
                p.nombre, 
                p.direccion,
                p.telefono,
                p.descripcion,
                p.email,
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

export const createProtectora = async (req, res) => {
    try {
        const { nombre, direccion, telefono, descripcion, email, pagina_web } = req.body;

        if (!nombre || !email) {
            return res.status(400).json({ ok: false, message: "Nombre y email son obligatorios" });
        }

        await db.query(
            `INSERT INTO protectoras (nombre, direccion, telefono, descripcion, email, pagina_web)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [nombre, direccion, telefono, descripcion, email, pagina_web]
        );

        return res.json({ ok: true });
    } catch (error) {
        console.error("Error al crear protectora:", error);
        return res.status(500).json({ ok: false, message: "Error de la base de datos" });
    }
};

export const updateProtectora = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono, descripcion, email, pagina_web } = req.body;

        await db.query(
            `UPDATE protectoras 
             SET nombre=$1, direccion=$2, telefono=$3, descripcion=$4, email=$5, pagina_web=$6
             WHERE id=$7`,
            [nombre, direccion, telefono, descripcion, email, pagina_web, id]
        );

        return res.json({ ok: true });
    } catch (error) {
        console.error("Error al actualizar protectora:", error);
        return res.status(500).json({ ok: false, message: "Error de la base de datos" });
    }
};

export const deleteProtectora = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`DELETE FROM protectoras WHERE id=$1`, [id]);

        return res.json({ ok: true });
    } catch (error) {
        console.error("Error al eliminar protectora:", error);
        return res.status(500).json({ ok: false, message: "Error de la base de datos" });
    }
};
