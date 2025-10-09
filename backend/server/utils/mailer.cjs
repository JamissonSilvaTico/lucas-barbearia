const sgMail = require("@sendgrid/mail");

// 1. Configurar o SendGrid com a chave API
// A chave é lida da variável de ambiente SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 2. Função de Envio Principal
exports.sendAppointmentConfirmation = async (agendamento, nomeServico) => {
  // 🚨 Usar a variável de ambiente para o e-mail de envio
  const sender = process.env.EMAIL_SENDER;
  const destinatario = "jamissondasilvatico@gmail.com";

  // Formatações
  const dataFormatada = new Date(
    `${agendamento.date}T00:00:00`
  ).toLocaleDateString("pt-BR");
  const horaFormatada = agendamento.time.substring(0, 5);

  // 3. Montagem do Objeto de E-mail
  const msg = {
    to: destinatario,
    from: `Lucas Barbearia <${sender}>`, // Deve ser um e-mail verificado no SendGrid
    subject: `💈 Agendamento Confirmado: ${nomeServico} - ${dataFormatada}`,
    html: `
            <div style="font-family: Arial, sans-serif; color: #EFEFEF; background-color: #1a1a1a; padding: 20px;">
                <h2 style="color: #FFC300;">Agendamento Confirmado!</h2>
                <p>Olá <strong>!</strong>,</p>
                <p>O agendamento de ${agendamento.clientName} na Lucas Barbearia foi confirmado com sucesso. Abaixo os detalhes:</p>
                <div style="background-color: #2a2a2a; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0 0 10px;"><strong>Serviço:</strong> ${nomeServico}</p>
                    <p style="margin: 0 0 10px;"><strong>Data:</strong> ${dataFormatada}</p>
                    <p style="margin: 0;"><strong>Hora:</strong> ${horaFormatada}</p>
                </div>
                <p style="margin-top: 20px;">Qualquer dúvida, entre em contato pelo telefone: ${agendamento.clientPhone}</p>
            </div>
        `,
  };

  try {
    await sgMail.send(msg);
    console.log(`E-mail enviado via SendGrid para: ${destinatario}`);
  } catch (error) {
    // O SendGrid retorna um objeto de erro detalhado, que é mais fácil de depurar.
    console.error("ERRO FATAL NO ENVIO SENDGRID:");
    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }
  }
};
