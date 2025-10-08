const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // 👈 Adicionar host
  port: 465, // 👈 Adicionar porta (465 é a porta segura)
  secure: true, // 👈 Adicionar secure
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Função de Envio Principal
exports.sendAppointmentConfirmation = async (agendamento, nomeServico) => {
  const destinatario = "jamissondasilvatico@gmail.com";

  // Formata a data e hora para exibição
  // Assume que agendamento.date é 'YYYY-MM-DD' e agendamento.time é 'HH:MM'
  const dataFormatada = new Date(
    `${agendamento.date}T00:00:00`
  ).toLocaleDateString("pt-BR");

  const mailOptions = {
    from: `"Lucas Barbearia" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: `💈 Agendamento Confirmado: ${nomeServico} - ${dataFormatada}`,
    html: `
            <div style="font-family: Arial, sans-serif; color: #EFEFEF; background-color: #1a1a1a; padding: 20px;">
                <h2 style="color: #FFC300;">Agendamento Confirmado!</h2>
                <p>Olá <strong>${agendamento.clientName}</strong>,</p>
                <p>Recebemos seu agendamento com sucesso. Aguardamos a sua visita!</p>
                <div style="background-color: #2a2a2a; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0 0 10px;"><strong>Serviço:</strong> ${nomeServico}</p>
                    <p style="margin: 0 0 10px;"><strong>Data:</strong> ${dataFormatada}</p>
                    <p style="margin: 0;"><strong>Hora:</strong> ${agendamento.time}</p>
                </div>
                <p style="margin-top: 20px;">Qualquer dúvida, entre em contato pelo telefone: ${agendamento.clientPhone}</p>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado com sucesso para: ${destinatario}`);
  } catch (error) {
    console.error("ERRO ao enviar e-mail:", error.message);
  }
};
