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
# Once you verify a domain at resend.com/domains, remove this override.
RESEND_TEST_EMAIL = os.getenv("RESEND_TEST_EMAIL", "")


def send_email(to_email: str, subject: str, body: str) -> str:
    """
    Sends a real email via the Resend API.
    Falls back to console logging if RESEND_API_KEY is not set.
    Returns the message ID on success.
    """
    if not RESEND_API_KEY:
        # Dev fallback — print to terminal
        logger.warning(
            f"\n{'='*60}\n"
            f"📧 EMAIL NOT SENT (no RESEND_API_KEY configured)\n"
            f"   To: {to_email}\n"
            f"   Subject: {subject}\n"
            f"   Body: {body}\n"
            f"{'='*60}\n"
            f"👉 Get a FREE API key at https://resend.com and add it to\n"
            f"   backend/.env as RESEND_API_KEY=re_...\n"
            f"{'='*60}"
        )
        return ""

    try:
        resend.api_key = RESEND_API_KEY

        # Dev override: Resend free tier only allows sending to your own email
        actual_to = RESEND_TEST_EMAIL if RESEND_TEST_EMAIL else to_email
        if RESEND_TEST_EMAIL and RESEND_TEST_EMAIL != to_email:
            logger.info(f"[DEV] Redirecting email from {to_email} → {actual_to}")

        params: resend.Emails.SendParams = {
            "from": FROM_EMAIL,
            "to": [actual_to],
            "subject": subject,
            "html": _wrap_html(subject, body),
        }

        resp = resend.Emails.send(params)
        msg_id = resp.get("id", "")
        logger.info(f"Email sent to {actual_to} — ID: {msg_id}")
        return msg_id
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return ""


def _wrap_html(subject: str, body: str) -> str:
    """Wraps plain text body in a beautiful NexaGlint HTML email template."""
    lines = body.replace("\n", "<br>")
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #05050a; margin: 0; padding: 0; }}
    .wrapper {{ max-width: 520px; margin: 40px auto; }}
    .card {{ background: #0f111a; border: 1px solid #1e2030; border-radius: 24px; padding: 40px; }}
    .logo {{ display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }}
    .logo-icon {{ width: 40px; height: 40px; background: linear-gradient(135deg, #22d3ee, #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }}
    .logo-text {{ font-size: 20px; font-weight: 800; color: #fff; }}
    h2 {{ color: #fff; font-size: 22px; margin: 0 0 12px; }}
    p {{ color: #94a3b8; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }}
    .otp-box {{ background: #060609; border: 1px solid #22d3ee30; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }}
    .otp {{ font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #22d3ee; font-family: monospace; }}
    .footer {{ color: #475569; font-size: 12px; margin-top: 24px; text-align: center; }}
    a {{ color: #22d3ee; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">✦</div>
        <span class="logo-text">NexaGlint</span>
      </div>
      <h2>{subject}</h2>
      <p>{lines}</p>
    </div>
    <div class="footer">NexaGlint · Built for Modern Data Lakes · <a href="https://resend.com">Powered by Resend</a></div>
  </div>
</body>
</html>
"""
