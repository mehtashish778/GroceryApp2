from flask import Flask
from flask_security import SQLAlchemyUserDatastore, Security
from application.models import db, User, Role
from config import DevelopmentConfig
from application.resources import api
from application.sec import datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import daily_reminder,monthly_reminder
from application.instances import cache

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    app.security = Security(app, datastore)
    cache.init_app(app)
    with app.app_context():
        import application.views
        # import application.models
        
    return app

app = create_app()
celery_app = celery_init_app(app)


@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=16, minute=9),
        daily_reminder.s('mehtashish778@email.com','Daily Reminder'),
    )
    sender.add_periodic_task(
        crontab(hour=16, minute=9),
        monthly_reminder.s('narendra@email.com','Monthly Reminder'),
    )



if __name__ == "__main__":
    app.run(debug=True)