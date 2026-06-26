from celery import shared_task
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from backend.database import SessionLocal
from backend.models.user import User
from backend.models.scholarship import Scholarship
from backend.models.saved import SavedScholarship

logger = logging.getLogger(__name__)

@shared_task
def send_deadline_reminders():
    """
    Checks for saved scholarships with deadlines in exactly 7 days
    and simulates sending an email reminder to the user.
    """
    db: Session = SessionLocal()
    try:
        # Calculate target date (7 days from now)
        target_date = datetime.utcnow() + timedelta(days=7)
        target_date_str = target_date.strftime('%Y-%m-%d')
        
        # In a real app we would parse string dates into datetime objects,
        # but for now we'll do a simple string matching or fetch all and filter in Python
        # since deadline_date is sometimes stored as a string or Date.
        # Assuming deadline_date is a DateTime or Date object
        # Alternatively, we can just grab all saved scholarships and filter
        
        saved_items = db.query(SavedScholarship).join(Scholarship).all()
        
        emails_sent = 0
        for item in saved_items:
            s = item.scholarship
            if not s.deadline_date:
                continue
                
            # Check if deadline is exactly 7 days away (matching the date part)
            if s.deadline_date.date() == target_date.date():
                user = db.query(User).filter(User.id == item.user_id).first()
                if user:
                    # Mock sending email
                    logger.info(f"[EMAIL MOCK] To: {user.email} | Subject: Scholarship Deadline Approaching!")
                    logger.info(f"Hello, the deadline for '{s.title}' is on {s.deadline_date.strftime('%B %d, %Y')}. Don't forget to apply!")
                    emails_sent += 1
                    
        return f"Sent {emails_sent} reminder emails."
    except Exception as e:
        logger.error(f"Error in send_deadline_reminders: {str(e)}")
        return "Failed"
    finally:
        db.close()
