import nodemailer from "nodemailer";

function safeFormatINR(amount?: number) {
  return "₹" + (amount ?? 0).toLocaleString("en-IN");
}

function safeFormatDate(value?: string | null) {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Unknown date";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export interface DonationEmailData {
  donorName: string;
  email: string;
  amount: number;
  causeTitle: string;
  receiptNumber: string;
  donatedAt: string;
  message?: string | null;
}

export async function sendDonationConfirmation(data: DonationEmailData): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email");
    return false;
  }

  const fromEmail = process.env.GMAIL_USER!;
  const amountFormatted = safeFormatINR(data.amount);
  const dateFormatted = safeFormatDate(data.donatedAt);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#e05a00,#f5a623);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">IKSHANA CHARITABLE TRUST</p>
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-style:italic;">Manava Seve, Madhava Seva</h1>
            <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Service to Man is Service to God</p>
          </td>
        </tr>
        <!-- Thank you -->
        <tr>
          <td style="padding:40px 40px 0;text-align:center;">
            <p style="margin:0 0 8px;font-size:15px;color:#888;">Dear ${data.donorName},</p>
            <h2 style="margin:0 0 12px;font-size:26px;color:#e05a00;">Thank You for Your Generous Donation!</h2>
            <p style="margin:0;color:#666;font-size:15px;line-height:1.6;">Your contribution is a blessing. Together, we are creating lasting change across India.</p>
          </td>
        </tr>
        <!-- Amount box -->
        <tr>
          <td style="padding:28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:2px solid #f5a623;border-radius:12px;">
              <tr>
                <td style="padding:24px;text-align:center;">
                  <p style="margin:0 0 4px;color:#888;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Donation Amount</p>
                  <p style="margin:0;font-size:42px;font-weight:bold;color:#e05a00;">${amountFormatted}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Details -->
        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:10px;overflow:hidden;">
              ${[
                ["Receipt No.", data.receiptNumber],
                ["Cause", data.causeTitle],
                ["Date", dateFormatted],
                ...(data.message ? [["Your Message", data.message]] : []),
              ].map(([label, value], i) => `
              <tr style="background:${i % 2 === 0 ? "#fafafa" : "#fff"};">
                <td style="padding:12px 20px;font-size:13px;color:#999;width:40%;border-bottom:1px solid #f0f0f0;">${label}</td>
                <td style="padding:12px 20px;font-size:13px;color:#333;font-weight:600;border-bottom:1px solid #f0f0f0;">${value}</td>
              </tr>`).join("")}
            </table>
          </td>
        </tr>
        <!-- 80G note -->
        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #f5a623;border-radius:10px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                  <strong>80G Tax Exemption:</strong> Our application for 80G tax exemption is currently in progress with the Income Tax Department. An updated receipt with 80G details will be issued once approved.<br>
                  <strong>Trust Reg. No. 242/2023</strong> · Telangana · NGO Darpan Registered
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f5f0;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0 0 4px;font-size:13px;color:#999;">IKSHANA CHARITABLE TRUST</p>
            <p style="margin:0;font-size:12px;color:#bbb;">Telangana, India · Trust Reg. No. 242/2023</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"IKSHANA CHARITABLE TRUST" <${fromEmail}>`,
      to: data.email,
      subject: `🙏 Thank You, ${data.donorName}! Your donation receipt — ${data.receiptNumber}`,
      html,
    });
    console.log(`[email] Confirmation sent to ${data.email}`);
    return true;
  } catch (err) {
    console.error("[email] Failed to send confirmation:", err);
    return false;
  }
}

export async function sendMonthlyReminder(opts: {
  donorName: string;
  email: string;
  causeTitle: string;
  causeDescription: string;
  goalAmount: number;
  raisedAmount: number;
  siteUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const fromEmail = process.env.GMAIL_USER!;
  const pct = Math.min((opts.raisedAmount / opts.goalAmount) * 100, 100).toFixed(0);
  const goal = safeFormatINR(opts.goalAmount);
  const raised = safeFormatINR(opts.raisedAmount);

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#e05a00,#f5a623);padding:32px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:2px;text-transform:uppercase;">IKSHANA CHARITABLE TRUST</p>
            <h1 style="margin:0;color:#fff;font-size:22px;">This Month's Cause Needs You</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 20px;">
            <p style="margin:0 0 16px;color:#555;font-size:15px;">Dear ${opts.donorName},</p>
            <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
              A new month means a new chance to make a difference. This month, IKSHANA CHARITABLE TRUST is rallying our community around one powerful cause — and we'd love your support again.
            </p>
            <h2 style="margin:0 0 8px;font-size:20px;color:#e05a00;">${opts.causeTitle}</h2>
            <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.6;">${opts.causeDescription}</p>
            <!-- Progress -->
            <table width="100%" style="background:#fff8f0;border-radius:10px;border:1px solid #f5a623;" cellpadding="0" cellspacing="0">
              <tr><td style="padding:20px 24px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-size:13px;color:#e05a00;font-weight:bold;">${raised} raised</span>
                  <span style="font-size:13px;color:#888;">Goal: ${goal}</span>
                </div>
                <div style="background:#f0e6da;border-radius:99px;height:10px;width:100%;overflow:hidden;">
                  <div style="background:#e05a00;height:10px;width:${pct}%;border-radius:99px;"></div>
                </div>
                <p style="margin:8px 0 0;font-size:12px;color:#999;text-align:right;">${pct}% of goal reached</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <a href="${opts.siteUrl}/donate" style="display:inline-block;background:#e05a00;color:#fff;text-decoration:none;padding:16px 48px;border-radius:99px;font-size:16px;font-weight:bold;">Donate Now →</a>
            <p style="margin:20px 0 0;font-size:12px;color:#bbb;">Trust Reg. No. 242/2023 · Telangana · Manava Seve, Madhava Seva</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"IKSHANA CHARITABLE TRUST" <${fromEmail}>`,
      to: opts.email,
      subject: `🙏 This month's cause: ${opts.causeTitle} — IKSHANA CHARITABLE TRUST`,
      html,
    });
    return true;
  } catch (err) {
    console.error(`[email] Reminder failed for ${opts.email}:`, err);
    return false;
  }
}
