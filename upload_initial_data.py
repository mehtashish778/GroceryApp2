from main import app
from application.sec import datastore
from application.models import db, Role
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    datastore.find_or_create_role('admin', description='user is administrator')
    datastore.find_or_create_role('manager', description='user is manager')
    datastore.find_or_create_role('customer', description='user is customer')
    db.session.commit()

    
    if not datastore.find_user(email='admin@email.com'):
        datastore.create_user(username='user1',email='admin@email.com',password=generate_password_hash("admin"),roles=['admin'])
    if not datastore.find_user(email='manager@email.com'):
        datastore.create_user(username='user2',email='manager@email.com',password=generate_password_hash("manager"),roles=['manager'], active = False)
    if not datastore.find_user(email='customer1@email.com'):
        datastore.create_user(username='user3', email='customer1@email.com',password=generate_password_hash("customer1"),roles=['customer'])
    if not datastore.find_user(email='customer2@email.com'):
        datastore.create_user(username='user4', email='customer2@email.com',password=generate_password_hash("customer2"),roles=['customer'])
      
    db.session.commit()