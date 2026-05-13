const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";
const TWILIO_SMS_FROM = process.env.TWILIO_SMS_FROM;

function isConfigured() {
  return !!(TWILIO_SID && TWILIO_TOKEN);
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

async function sendTwilioMessage(to: string, body: string, channel: "whatsapp" | "sms"): Promise<boolean> {
  if (!isConfigured()) {
    console.warn(`[twilio] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set — skipping ${channel}`);
    return false;
  }

  const toFormatted = channel === "whatsapp" ? `whatsapp:${formatPhone(to)}` : formatPhone(to);
  const from = channel === "whatsapp" ? TWILIO_WHATSAPP_FROM : TWILIO_SMS_FROM;

  if (!from) {
    console.warn(`[twilio] No sender number configured for ${channel}`);
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const params = new URLSearchParams({ To: toFormatted, From: from, Body: body });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
      },
      body: params.toString(),
    });

    const data = await res.json() as { sid?: string; message?: string; status?: string };
    if (!res.ok) {
      console.error(`[twilio] ${channel} failed:`, data.message);
      return false;
    }
    console.log(`[twilio] ${channel} sent to ${toFormatted}, SID: ${data.sid}`);
    return true;
  } catch (err) {
    console.error(`[twilio] ${channel} error:`, err);
    return false;
  }
}

export async function sendDonationWhatsApp(opts: {
  phone: string;
  donorName: string;
  amount: number;
  causeTitle: string;
  receiptNumber: string;
}): Promise<boolean> {
  const amount = "₹" + opts.amount.toLocaleString("en-IN");
  const body =
    `🙏 *IKSHANA CHARITABLE TRUST*\n` +
    `_Manava Seve, Madhava Seva_\n\n` +
    `Dear *${opts.donorName}*,\n\n` +
    `Thank you for your generous donation of *${amount}* towards *${opts.causeTitle}*.\n\n` +
    `📄 Receipt No: ${opts.receiptNumber}\n\n` +
    `Your kindness is making a real difference across India. May God bless you! 🕊\n\n` +
    `_Trust Reg. No. 242/2023 · Telangana_`;

  return sendTwilioMessage(opts.phone, body, "whatsapp");
}

export async function sendDonationSMS(opts: {
  phone: string;
  donorName: string;
  amount: number;
  receiptNumber: string;
}): Promise<boolean> {
  const amount = "₹" + opts.amount.toLocaleString("en-IN");
  const body =
    `IKSHANA CHARITABLE TRUST: Dear ${opts.donorName}, thank you for donating ${amount}. ` +
    `Receipt: ${opts.receiptNumber}. Manava Seve, Madhava Seva. Trust Reg. 242/2023 Telangana.`;

  return sendTwilioMessage(opts.phone, body, "sms");
}

export async function sendReminderWhatsApp(opts: {
  phone: string;
  donorName: string;
  causeTitle: string;
  goalAmount: number;
  raisedAmount: number;
  siteUrl: string;
}): Promise<boolean> {
  const pct = Math.min((opts.raisedAmount / opts.goalAmount) * 100, 100).toFixed(0);
  const raised = "₹" + opts.raisedAmount.toLocaleString("en-IN");
  const goal = "₹" + opts.goalAmount.toLocaleString("en-IN");

  const body =
    `🙏 *IKSHANA CHARITABLE TRUST*\n\n` +
    `Dear *${opts.donorName}*,\n\n` +
    `This month we are supporting: *${opts.causeTitle}*\n\n` +
    `📊 Progress: ${raised} raised of ${goal} (${pct}%)\n\n` +
    `Your support can help us reach the goal. Every rupee counts! 💛\n\n` +
    `👉 Donate now: ${opts.siteUrl}/donate\n\n` +
    `_Trust Reg. No. 242/2023 · Telangana_`;

  return sendTwilioMessage(opts.phone, body, "whatsapp");
}

export async function sendReminderSMS(opts: {
  phone: string;
  donorName: string;
  causeTitle: string;
  siteUrl: string;
}): Promise<boolean> {
  const body =
    `IKSHANA TRUST: Dear ${opts.donorName}, support this month's cause: ${opts.causeTitle}. ` +
    `Donate at ${opts.siteUrl}/donate. Trust Reg. 242/2023.`;

  return sendTwilioMessage(opts.phone, body, "sms");
}
