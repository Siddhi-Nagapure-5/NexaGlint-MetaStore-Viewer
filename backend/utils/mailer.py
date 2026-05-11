"""
Mailer — sends real emails via Resend API.
No personal passwords needed. Just set RESEND_API_KEY in your .env file.
"""
import os
import logging
import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "NexaGlint <onboarding@resend.dev>")
# In Resend free tier, you can only send to your own verified email.
# Set RESEND_TEST_EMAIL to override the recipient in dev mode.
RESEND_TEST_EMAIL = os.getenv("RESEND_TEST_EMAIL", "")


def send_email(to_email: str, subject: str, html_body: str) -> str:
    """
    Sends a real email via the Resend API.
    Falls back to console logging if RESEND_API_KEY is not set.
    Returns the message ID on success.
    """
    if not RESEND_API_KEY:
        logger.warning(
            f"\n{'='*60}\n"
            f"📧 EMAIL NOT SENT (no RESEND_API_KEY configured)\n"
            f"   To: {to_email}\n"
            f"   Subject: {subject}\n"
            f"{'='*60}\n"
            f"👉 Get a FREE API key at https://resend.com and add it to\n"
            f"   backend/.env as RESEND_API_KEY=re_...\n"
            f"{'='*60}"
        )
        return ""

    try:
        resend.api_key = RESEND_API_KEY

        actual_to = RESEND_TEST_EMAIL if RESEND_TEST_EMAIL else to_email
        if RESEND_TEST_EMAIL and RESEND_TEST_EMAIL != to_email:
            logger.info(f"[DEV] Redirecting email from {to_email} → {actual_to}")

        params: resend.Emails.SendParams = {
            "from": FROM_EMAIL,
            "to": [actual_to],
            "subject": subject,
            "html": html_body,
        }

        resp = resend.Emails.send(params)
        msg_id = resp.get("id", "")
        logger.info(f"Email sent to {actual_to} — ID: {msg_id}")
        return msg_id
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return ""


# ─── Shared Components ─────────────────────────────────────────────────────────

def _base_styles() -> str:
    return """
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #05060f;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }

      .email-wrapper {
        max-width: 580px;
        margin: 0 auto;
        padding: 32px 16px 48px;
      }

      /* ── Header ── */
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 28px;
        padding-left: 4px;
      }
      .logo-mark {
        width: 44px; height: 44px;
        background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 60%, #8b5cf6 100%);
        border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
        box-shadow: 0 0 24px rgba(34,211,238,0.35);
      }
      .brand-name {
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.4px;
      }
      .brand-sub {
        font-size: 11px;
        color: #475569;
        font-weight: 500;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-top: 1px;
      }

      /* ── Card ── */
      .card {
        background: linear-gradient(160deg, #0d1023 0%, #090d1a 100%);
        border: 1px solid #1a2040;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
      }

      .card-accent-bar {
        height: 4px;
        background: linear-gradient(90deg, #22d3ee, #3b82f6, #8b5cf6);
      }

      .card-body {
        padding: 36px 40px 40px;
      }

      /* ── Typography ── */
      .greeting {
        font-size: 13px;
        font-weight: 600;
        color: #22d3ee;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      .headline {
        font-size: 26px;
        font-weight: 800;
        color: #f1f5f9;
        line-height: 1.25;
        letter-spacing: -0.5px;
        margin-bottom: 14px;
      }
      .subtext {
        font-size: 15px;
        color: #64748b;
        line-height: 1.75;
        margin-bottom: 28px;
      }
      .subtext strong {
        color: #94a3b8;
        font-weight: 600;
      }

      /* ── Divider ── */
      .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #1e2a4a, transparent);
        margin: 28px 0;
      }

      /* ── Footer ── */
      .footer {
        text-align: center;
        margin-top: 28px;
        padding: 0 8px;
      }
      .footer p {
        color: #334155;
        font-size: 12px;
        line-height: 1.8;
      }
      .footer a { color: #22d3ee; text-decoration: none; }
      .footer .footer-logo {
        font-size: 13px;
        font-weight: 700;
        color: #475569;
        margin-bottom: 6px;
        letter-spacing: -0.2px;
      }
    </style>
    """


def _header_html() -> str:
    return """
    <div class="header">
      <div class="logo-mark">✦</div>
      <div>
        <div class="brand-name">NexaGlint</div>
        <div class="brand-sub">Lakehouse Intelligence</div>
      </div>
    </div>
    """


def _footer_html() -> str:
    return """
    <div class="footer">
      <div class="footer-logo">✦ NexaGlint</div>
      <p>
        Built for Modern Data Lakes &nbsp;·&nbsp; Powered by
        <a href="https://resend.com">Resend</a>
        <br>
        You're receiving this because you signed up for NexaGlint.
        <br>
        If you have questions, reply to this email.
      </p>
    </div>
    """


# ─── OTP Email ────────────────────────────────────────────────────────────────

def build_otp_email(to_name: str, otp_code: str) -> str:
    """Returns a rich HTML email body for OTP verification."""
    digits = "".join(
        f'<span style="display:inline-block;background:#0a0f20;border:1px solid #1e3a5f;'
        f'border-radius:10px;width:52px;height:64px;line-height:64px;text-align:center;'
        f'font-size:34px;font-weight:900;color:#22d3ee;margin:0 4px;'
        f'box-shadow:0 0 16px rgba(34,211,238,0.2);">{d}</span>'
        for d in otp_code
    )

    name_label = to_name if to_name else "there"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your NexaGlint account</title>
  {_base_styles()}
  <style>
    .otp-container {{
      background: linear-gradient(135deg, #06091a 0%, #080d1f 100%);
      border: 1px solid #1e3358;
      border-radius: 20px;
      padding: 32px 24px;
      text-align: center;
      margin: 28px 0;
      position: relative;
      overflow: hidden;
    }}
    .otp-container::before {{
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(34,211,238,0.07) 0%, transparent 65%);
      pointer-events: none;
    }}
    .otp-label {{
      font-size: 11px;
      font-weight: 700;
      color: #3b82f6;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }}
    .otp-digits {{
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0;
      margin-bottom: 20px;
    }}
    .otp-expiry {{
      font-size: 12px;
      color: #475569;
      margin-top: 4px;
    }}
    .otp-expiry span {{
      color: #f59e0b;
      font-weight: 600;
    }}
    .info-box {{
      background: #0a0f20;
      border: 1px solid #1a2540;
      border-left: 3px solid #3b82f6;
      border-radius: 10px;
      padding: 14px 18px;
      margin-top: 4px;
    }}
    .info-box p {{
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }}
    .info-box p + p {{ margin-top: 6px; }}
    .info-box .icon {{ margin-right: 6px; }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    {_header_html()}
    <div class="card">
      <div class="card-accent-bar"></div>
      <div class="card-body">

        <div class="greeting">Verification Code</div>
        <div class="headline">Confirm your<br>NexaGlint account</div>
        <div class="subtext">
          Hey <strong>{name_label}</strong>, you're almost there!
          Use the one-time code below to verify your email address
          and complete your registration.
        </div>

        <div class="otp-container">
          <div class="otp-label">🔐 &nbsp; One-Time Password</div>
          <div class="otp-digits">
            {digits}
          </div>
          <div class="otp-expiry">
            Expires in <span>10 minutes</span> &nbsp;·&nbsp; Single use only
          </div>
        </div>

        <div class="info-box">
          <p><span class="icon">🛡️</span><strong style="color:#94a3b8;">Security tip:</strong> NexaGlint will never ask for this code via phone or chat.</p>
          <p><span class="icon">⚠️</span>If you didn't request this, you can safely ignore this email — your account is secure.</p>
        </div>

      </div>
    </div>
    {_footer_html()}
  </div>
</body>
</html>"""


# ─── Welcome Email ────────────────────────────────────────────────────────────

def build_welcome_email(to_name: str, to_email: str) -> str:
    """Returns a rich HTML welcome email after successful registration."""
    name_label = to_name if to_name else "there"

    features = [
        ("🗄️", "Iceberg & Delta Lake Support", "Scan, browse and query open table formats natively."),
        ("📊", "Real-Time Metrics", "Monitor table health, snapshot history and partition stats."),
        ("🔐", "Secure by Default", "JWT auth, OTP verification and login alerts built-in."),
        ("☁️", "AWS Integration", "Connect via IAM credentials and explore S3-backed tables."),
    ]

    feature_cards = ""
    for icon, title, desc in features:
        feature_cards += f"""
        <tr>
          <td style="padding:10px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48" valign="top">
                  <div style="width:40px;height:40px;background:linear-gradient(135deg,#0f1a2e,#0d1528);
                       border:1px solid #1e3050;border-radius:12px;text-align:center;
                       line-height:40px;font-size:18px;">{icon}</div>
                </td>
                <td style="padding-left:14px;" valign="top">
                  <div style="font-size:14px;font-weight:700;color:#e2e8f0;margin-bottom:3px;">{title}</div>
                  <div style="font-size:13px;color:#64748b;line-height:1.5;">{desc}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NexaGlint</title>
  {_base_styles()}
  <style>
    .welcome-banner {{
      background: linear-gradient(135deg, #060e24 0%, #0a1228 100%);
      border: 1px solid #1a2a4a;
      border-radius: 20px;
      padding: 28px;
      text-align: center;
      margin-bottom: 28px;
    }}
    .welcome-emoji {{
      font-size: 48px;
      margin-bottom: 12px;
      display: block;
    }}
    .welcome-banner h3 {{
      font-size: 20px;
      font-weight: 800;
      color: #f1f5f9;
      margin-bottom: 6px;
    }}
    .welcome-banner p {{
      font-size: 13px;
      color: #64748b;
    }}
    .cta-button {{
      display: block;
      width: fit-content;
      margin: 28px auto 0;
      background: linear-gradient(135deg, #22d3ee, #3b82f6);
      color: #fff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
      padding: 14px 36px;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(34,211,238,0.3);
    }}
    .account-pill {{
      display: inline-block;
      background: #0a0f20;
      border: 1px solid #1e3050;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      color: #94a3b8;
      font-family: monospace;
      margin-top: 10px;
    }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    {_header_html()}
    <div class="card">
      <div class="card-accent-bar"></div>
      <div class="card-body">

        <div class="greeting">Account Created ✓</div>
        <div class="headline">Welcome aboard,<br>{name_label}! 🎉</div>
        <div class="subtext">
          Your NexaGlint account is ready. You now have access to a
          <strong>powerful Lakehouse metadata explorer</strong> — scan tables,
          track snapshots, and gain deep visibility into your data lake.
        </div>

        <div class="welcome-banner">
          <span class="welcome-emoji">✦</span>
          <h3>Your account is live</h3>
          <p>Signed in as</p>
          <div class="account-pill">{to_email}</div>
        </div>

        <div style="font-size:12px;font-weight:700;color:#3b82f6;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px;">
          What you can do now
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          {feature_cards}
        </table>

        <a class="cta-button" href="http://localhost:5173">
          Open NexaGlint Dashboard →
        </a>

        <div class="divider"></div>
        <div style="font-size:13px;color:#475569;text-align:center;">
          Need help? Reply to this email and we'll get back to you.
        </div>

      </div>
    </div>
    {_footer_html()}
  </div>
</body>
</html>"""


# ─── Login Alert Email ────────────────────────────────────────────────────────

def build_login_alert_email(to_name: str, login_time: str) -> str:
    """Returns a rich HTML login alert email."""
    name_label = to_name if to_name else "there"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Login Detected — NexaGlint</title>
  {_base_styles()}
  <style>
    .alert-badge {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.25);
      border-radius: 999px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 700;
      color: #f59e0b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }}
    .details-card {{
      background: #06091a;
      border: 1px solid #1a2540;
      border-radius: 16px;
      overflow: hidden;
      margin: 24px 0;
    }}
    .details-header {{
      background: linear-gradient(90deg, #0d1528, #0a1020);
      padding: 14px 20px;
      border-bottom: 1px solid #1a2540;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }}
    .detail-row {{
      display: flex;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid #111827;
    }}
    .detail-row:last-child {{ border-bottom: none; }}
    .detail-icon {{
      width: 32px;
      font-size: 16px;
    }}
    .detail-label {{
      font-size: 12px;
      color: #475569;
      font-weight: 500;
      min-width: 90px;
    }}
    .detail-value {{
      font-size: 13px;
      color: #e2e8f0;
      font-weight: 600;
      flex: 1;
    }}
    .secure-box {{
      background: rgba(34,211,238,0.05);
      border: 1px solid rgba(34,211,238,0.15);
      border-radius: 14px;
      padding: 18px 20px;
    }}
    .secure-box p {{
      font-size: 13px;
      color: #64748b;
      line-height: 1.65;
      margin: 0;
    }}
    .secure-box strong {{ color: #94a3b8; }}
    .cta-danger {{
      display: block;
      width: fit-content;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      padding: 12px 28px;
      border-radius: 10px;
      margin-top: 16px;
      box-shadow: 0 4px 16px rgba(239,68,68,0.25);
    }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    {_header_html()}
    <div class="card">
      <div class="card-accent-bar" style="background:linear-gradient(90deg,#f59e0b,#ef4444,#ec4899);"></div>
      <div class="card-body">

        <div class="alert-badge">⚠️ &nbsp; Security Alert</div>
        <div class="headline">New sign-in to<br>your account</div>
        <div class="subtext">
          Hey <strong>{name_label}</strong>, we noticed a new login to your
          NexaGlint account. Review the details below to make sure it was you.
        </div>

        <div class="details-card">
          <div class="details-header">Login Details</div>
          <div class="detail-row">
            <div class="detail-icon">🕐</div>
            <div class="detail-label">Time</div>
            <div class="detail-value">{login_time}</div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">🌐</div>
            <div class="detail-label">Platform</div>
            <div class="detail-value">NexaGlint Web App</div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">✅</div>
            <div class="detail-label">Auth method</div>
            <div class="detail-value">Email &amp; Password</div>
          </div>
        </div>

        <div class="secure-box">
          <p>
            ✅ &nbsp;<strong>This was you?</strong> No action needed — you're all set.
          </p>
          <p style="margin-top:10px;">
            🚨 &nbsp;<strong>This wasn't you?</strong> Your account may be compromised.
            Change your password immediately.
          </p>
          <a class="cta-danger" href="http://localhost:5173/auth">
            🔒 &nbsp;Secure My Account
          </a>
        </div>

        <div class="divider"></div>
        <div style="font-size:13px;color:#475569;text-align:center;line-height:1.7;">
          This alert is sent every time a new session is created.<br>
          For security settings, visit your account dashboard.
        </div>

      </div>
    </div>
    {_footer_html()}
  </div>
</body>
</html>"""
