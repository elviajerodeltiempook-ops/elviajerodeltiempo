const BOT_TOKEN = '8626615964:AAFq3HGRDbtc5ItvGTV-WlNWjwY_0Qo5Oco';
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SITE_URL = 'https://elviajerodeltiempook.com';

async function send(chat_id, text, reply_markup) {
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', reply_markup })
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  const { message, callback_query } = req.body;

  // ── CALLBACK (botones) ──────────────────────────────
  if (callback_query) {
    const chat_id = callback_query.message.chat.id;
    const data = callback_query.data;

    if (data === 'tirada') {
      await send(chat_id,
        `🔮 <b>Tu tirada te espera</b>\n\nEntrá a la página, elegí tu consulta y realizá tu donación. El Viajero del Tiempo ya está viendo tu destino.\n\n👉 ${SITE_URL}`,
        { inline_keyboard: [[{ text: '✦ Ir a la página', url: SITE_URL }]] }
      );
    } else if (data === 'agendar') {
      await send(chat_id,
        `📞 <b>Llamada con El Viajero</b>\n\nLa agenda se completa rápido. Ingresá a la página, realizá tu tirada y al finalizar encontrarás el botón para reservar tu lugar.\n\n👉 ${SITE_URL}`,
        { inline_keyboard: [[{ text: '✦ Reservar mi lugar', url: SITE_URL }]] }
      );
    } else if (data === 'donar') {
      await send(chat_id,
        `💛 <b>Cómo realizar tu donación</b>\n\nAceptamos:\n\n💳 <b>PayPal</b> — internacional, con o sin cuenta\n🇦🇷 <b>Pesos AR</b> — alias: ELVIAJERODELTIEMPO\n₮ <b>USDT TRC20</b> — desde cualquier país\n\nEn la página encontrás el tutorial paso a paso para cada método.\n\n👉 ${SITE_URL}/#donaciones`,
        { inline_keyboard: [[{ text: '✦ Ver métodos de donación', url: `${SITE_URL}/#donaciones` }]] }
      );
    } else if (data === 'humano') {
      await send(chat_id,
        `✦ Gracias por escribir.\n\nEl Viajero recibe cientos de consultas. En breve alguien del equipo te responderá personalmente.\n\nSi tu consulta es urgente, realizá tu tirada en la página y al finalizar podrás agendar una llamada directa.\n\n👉 ${SITE_URL}`
      );
    }

    // Responder al callback para quitar el "reloj"
    await fetch(`${API}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callback_query.id })
    });

    return res.status(200).json({ ok: true });
  }

  // ── MENSAJE DE TEXTO ────────────────────────────────
  if (message) {
    const chat_id = message.chat.id;
    const text = (message.text || '').toLowerCase();
    const nombre = message.from?.first_name || 'viajero';

    const menu = {
      inline_keyboard: [
        [{ text: '🔮 Quiero una tirada', callback_data: 'tirada' }],
        [{ text: '📞 Agendar llamada', callback_data: 'agendar' }],
        [{ text: '💳 Cómo donar', callback_data: 'donar' }],
        [{ text: '✉️ Hablar con el equipo', callback_data: 'humano' }]
      ]
    };

    if (text === '/start' || text.includes('hola') || text.includes('buenas') || text.includes('hello')) {
      await send(chat_id,
        `✦ Bienvenido, <b>${nombre}</b>.\n\nSoy el asistente de <b>El Viajero del Tiempo</b>.\n\nÉl ya sabe que llegaste. ¿Qué buscás?`,
        menu
      );
    } else {
      await send(chat_id,
        `El Viajero siente tu consulta, <b>${nombre}</b>.\n\n¿En qué puedo ayudarte?`,
        menu
      );
    }
  }

  return res.status(200).json({ ok: true });
}
