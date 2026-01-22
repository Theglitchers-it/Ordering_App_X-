const { Resend } = require('resend');
const logger = require('../utils/logger');

// Initialize Resend (FREE: 3,000 emails/month)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send email using Resend
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!resend) {
      logger.warn('Resend API key not configured - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
      text
    });

    logger.info(`Email sent successfully to ${to}`);
    return { success: true, data: result };

  } catch (error) {
    logger.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Ordine Confermato!</h1>
      <p>Grazie per il tuo ordine. Ecco i dettagli:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Ordine #${order.order_number}</h2>
        <p><strong>Totale:</strong> €${parseFloat(order.total).toFixed(2)}</p>
        <p><strong>Stato:</strong> ${order.order_status}</p>
        <p><strong>Metodo Pagamento:</strong> ${order.payment_method}</p>
      </div>

      <p>Ti aggiorneremo quando il tuo ordine sarà pronto.</p>
      <p>Grazie per aver ordinato con noi!</p>
    </div>
  `;

  const text = `
Ordine Confermato!

Ordine #${order.order_number}
Totale: €${parseFloat(order.total).toFixed(2)}
Stato: ${order.order_status}

Ti aggiorneremo quando il tuo ordine sarà pronto.
  `;

  return await sendEmail({
    to: order.customer_email,
    subject: `Ordine #${order.order_number} Confermato`,
    html,
    text
  });
};

/**
 * Send order status update email
 */
const sendOrderStatusUpdate = async (order, newStatus) => {
  const statusMessages = {
    confirmed: 'Il tuo ordine è stato confermato!',
    preparing: 'Il tuo ordine è in preparazione',
    ready: 'Il tuo ordine è pronto!',
    out_for_delivery: 'Il tuo ordine è in consegna',
    delivered: 'Il tuo ordine è stato consegnato',
    completed: 'Ordine completato',
    cancelled: 'Il tuo ordine è stato annullato'
  };

  const message = statusMessages[newStatus] || 'Aggiornamento ordine';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">${message}</h1>
      <p>Ordine #${order.order_number}</p>
      <p>Stato: <strong>${newStatus}</strong></p>
    </div>
  `;

  const text = `
${message}

Ordine #${order.order_number}
Stato: ${newStatus}
  `;

  return await sendEmail({
    to: order.customer_email,
    subject: `Ordine #${order.order_number} - ${message}`,
    html,
    text
  });
};

/**
 * Send welcome email to new merchant
 */
const sendMerchantWelcome = async (merchant, user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Benvenuto su OrderHub!</h1>
      <p>Ciao ${user.first_name},</p>
      <p>Grazie per aver registrato <strong>${merchant.business_name}</strong> su OrderHub.</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Prossimi Passi:</h2>
        <ol>
          <li>Attendi l'approvazione del tuo account</li>
          <li>Configura il tuo menu</li>
          <li>Genera i QR code per i tavoli</li>
          <li>Inizia a ricevere ordini!</li>
        </ol>
      </div>

      <p>Il nostro team verificherà il tuo account a breve.</p>
      <p>A presto!</p>
    </div>
  `;

  const text = `
Benvenuto su OrderHub!

Ciao ${user.first_name},

Grazie per aver registrato ${merchant.business_name} su OrderHub.

Prossimi Passi:
1. Attendi l'approvazione del tuo account
2. Configura il tuo menu
3. Genera i QR code per i tavoli
4. Inizia a ricevere ordini!

Il nostro team verificherà il tuo account a breve.
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Benvenuto su OrderHub!',
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendMerchantWelcome
};
