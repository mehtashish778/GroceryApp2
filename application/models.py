from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin


db = SQLAlchemy()


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model,UserMixin):
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role',secondary='roles_users', backref=db.backref('users',lazy='dynamic'))

    
class Role(db.Model,RoleMixin):
    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

    
class Category(db.Model):
    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    
class Product(db.Model):
    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    price = db.Column(db.Float)
    stock = db.Column(db.Integer)
    image_link = db.Column(db.String, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship('Category')
    

class Cart(db.Model):
    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User')
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    product = db.relationship('Product')
    quantity = db.Column(db.Integer)

class Order(db.Model):
    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User')
    status = db.Column(db.String(20))
    date = db.Column(db.DateTime)

class OrderItem(db.Model):
    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    order = db.relationship('Order')
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    product = db.relationship('Product')
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)
    
    
class Category_Request(db.Model):
    id = db.Column(db.Integer,autoincrement=True, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship('Category')
    
    name = db.Column(db.String(80),nullable = False)
    description = db.Column(db.String(255), nullable = False)
    
    action = db.Column(db.String(20), nullable = False)
    
    status =db.Column(db.Boolean(), default = False)
    manager_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    manager = db.relationship('User')
    
