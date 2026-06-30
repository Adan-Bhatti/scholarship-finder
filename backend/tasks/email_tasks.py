import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from backend.database import SessionLocal
from backend.models.user import User
from backend.models.scholarship import Scholarship
from backend.models.saved import SavedScholarship

logger = logging.getLogger(__name__)


def send_deadline_reminders():
    """
    Checks for saved scholarships with deadlines within the next 7 days
    and simulates sending an email reminder to the user.
    Runs daily via APScheduler (no longer a Celery task).
    """
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        seven_days_later = now + timedelta(days=7)

        saved_items = db.query(SavedScholarship).join(Scholarship).all()

        emails_sent = 0
        for item in saved_items:
            s = item.scholarship
            # FIX: field is `deadline`, not `deadline_date`
            if not s.deadline:
                continue

            # Improved: reminder window = within the next 7 days (not exactly 7 days)
            if now <= s.deadline <= seven_days_later:
                user = db.query(User).filter(User.id == item.user_id).first()
                if user:
                    days_left = (s.deadline.date() - now.date()).days
                    logger.info(
                        f"[EMAIL REMINDER] To: {user.email} | "
                        f"Subject: Scholarship Deadline in {days_left} day(s)! | "
                        f"Scholarship: '{s.title}' | Deadline: {s.deadline.strftime('%B %d, %Y')}"
                    )
                    emails_sent += 1

        logger.info(f"[Reminders] Sent {emails_sent} deadline reminder(s).")
        return f"Sent {emails_sent} reminder emails."
    except Exception as e:
        logger.error(f"Error in send_deadline_reminders: {str(e)}")
        return "Failed"
    finally:
        db.close()
