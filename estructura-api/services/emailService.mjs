import transporter from "../config/mailer.mjs";

const STEP_EMAILS = {
  confirmacion: {
    subject: "✅ Tu solicitud de adopción ha sido confirmada - PawLink",
    title: "¡Solicitud confirmada!",
    body: (nombre, animal) =>
      `Hola ${nombre},<br><br>
      Tu solicitud para adoptar a <strong>${animal}</strong> ha sido revisada y confirmada por la protectora.<br>
      Estamos muy contentos de que hayas dado este primer paso. Pronto te contactaremos con más novedades.`,
  },
  revision: {
    subject: "🩺 Revisión veterinaria en curso - PawLink",
    title: "Revisión veterinaria",
    body: (nombre, animal) =>
      `Hola ${nombre},<br><br>
      El veterinario está realizando una revisión final de <strong>${animal}</strong> para asegurarse de que llega en perfectas condiciones.<br>
      Te avisaremos en cuanto esté listo para el siguiente paso.`,
  },
  preparacion: {
    subject: "📄 Preparando tu documentación - PawLink",
    title: "Documentación en preparación",
    body: (nombre, animal) =>
      `Hola ${nombre},<br><br>
      Estamos preparando toda la documentación necesaria para la adopción de <strong>${animal}</strong>: cartilla sanitaria, microchip y certificados.<br>
      ¡Ya casi estáis juntos!`,
  },
  preparativo: {
    subject: "🧳 Preparando el viaje de tu nuevo compañero - PawLink",
    title: "Preparativos del viaje",
    body: (nombre, animal) =>
      `Hola ${nombre},<br><br>
      Estamos coordinando la logística del traslado de <strong>${animal}</strong> para que llegue sano y salvo hasta ti.<br>
      Te informaremos de los detalles del viaje próximamente.`,
  },
  firma: {
    subject: "✍️ ¡Es hora de firmar el contrato! - PawLink",
    title: "Firma del contrato",
    body: (nombre, animal) =>
      `Hola ${nombre},<br><br>
      Solo queda un paso: la firma del contrato de adopción de <strong>${animal}</strong>.<br>
      La protectora se pondrá en contacto contigo para coordinar la firma. ¡Enhorabuena, casi lo tenéis!`,
  },
};

const buildHtml = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#DDECF6;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#DDECF6;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#E5531C;padding:28px 32px;">
            <span style="color:white;font-size:22px;font-weight:800;">🐾 PawLink</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 32px;">
            <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;">${title}</h2>
            <p style="margin:0;color:#4B5563;font-size:15px;line-height:1.7;">${bodyHtml}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #F3F4F6;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;">
              Este correo es automático. Si tienes dudas, contacta con tu protectora.<br>
              © 2025 PawLink
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const sendSubscriptionEmail = async (email) => {
  const html = buildHtml(
    "¡Bienvenido/a a la familia PawLink! 🐾",
    `Gracias por suscribirte a nuestra newsletter.<br><br>
    A partir de ahora recibirás historias de adopción, consejos para nuevos dueños y noticias sobre los eventos de nuestras protectoras colaboradoras.<br><br>
    <strong>Juntos podemos darle una segunda oportunidad a muchos animales.</strong>`
  );

  try {
    await transporter.sendMail({
      from: `"PawLink" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🐾 ¡Bienvenido/a a PawLink! Ya eres parte de nuestra comunidad",
      html,
    });
    console.log(`Email de suscripción enviado a ${email}`);
  } catch (err) {
    console.error(`Error al enviar email de suscripción a ${email}:`, err.message);
    throw err;
  }
};

export const sendStepEmail = async (step, usuarioEmail, usuarioNombre, animalNombre) => {
  const template = STEP_EMAILS[step];
  if (!template) return;

  const bodyHtml = template.body(usuarioNombre || "usuario", animalNombre || "tu animal");

  try {
    await transporter.sendMail({
      from: `"PawLink" <${process.env.GMAIL_USER}>`,
      to: usuarioEmail,
      subject: template.subject,
      html: buildHtml(template.title, bodyHtml),
    });
    console.log(`Email [${step}] enviado a ${usuarioEmail}`);
  } catch (err) {
    console.error(`Error al enviar email [${step}] a ${usuarioEmail}:`, err.message);
  }
};
