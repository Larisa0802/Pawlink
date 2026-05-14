import { sendSubscriptionEmail, sendContactEmail } from "../services/emailService.mjs";

const suscribir = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) return res.status(400).json({ error: "Email no válido" });

  try {
    await sendSubscriptionEmail(email);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "No se pudo enviar el email" });
  }
};

const contacto = async (req, res) => {
  const { nombre, email, motivo, comentario } = req.body;
  if (!nombre?.trim() || !email?.includes("@") || !motivo)
    return res.status(400).json({ error: "Faltan campos obligatorios" });

  try {
    await sendContactEmail({ nombre: nombre.trim(), email, motivo, comentario: comentario?.trim() });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "No se pudo enviar el mensaje" });
  }
};

export default { suscribir, contacto };
