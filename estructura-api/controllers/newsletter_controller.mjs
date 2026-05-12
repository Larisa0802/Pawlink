import { sendSubscriptionEmail } from "../services/emailService.mjs";

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

export default { suscribir };
