from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_token_required, auth_required, current_user, login_required, roles_required
from .models import User,Role,Cart,Order, OrderItem, Product,Category,Category_Request ,db
from .sec import datastore
from werkzeug.security import check_password_hash,generate_password_hash
from flask_restful import marshal, fields
import flask_excel as excel
from sqlalchemy.orm import joinedload
import datetime as d
from .tasks import create_product_csv
from celery.result import AsyncResult
from flask import make_response
from flask import send_file
from io import StringIO
from io import BytesIO
from .instances import cache










@app.get('/')
def home():
    return render_template("index.html")


@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Hello Admin"


@app.get('/activate/manager/<int:manager_id>')
@auth_required("token")
@roles_required("admin")
def activate_instructor(manager_id):
    manager = User.query.get(manager_id)
    if not manager or "manager" not  in manager.roles:
        return jsonify({"message":"Instructure not found"}), 404
    
    manager.active = True
    db.session.commit()
    return jsonify({"message":"User activated"})



@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "email not provided"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User Not Found"}), 404
    if user.active == False:
        return jsonify({"message": "User is not activated"}), 400

    if check_password_hash(user.password, data.get("password")):
        return jsonify({"token": user.get_auth_token(), "id":user.id, "email": user.email, "role": user.roles[0].name})
    else:
        return jsonify({"message": "Wrong Password"}), 400
    
    
@app.post('/user-register')
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    roles = data.get('roles')
    
    
    
    if not datastore.find_user(email=email):
        
        if roles == "2":
            out = datastore.create_user(username=username,email=email,password=generate_password_hash(password),roles=['manager'], active = False)
        elif roles == "3":
            out = datastore.create_user(username=username,email=email,password=generate_password_hash(password),roles=['customer'])
        else:
            out = datastore.create_user(username=username,email=email,password=generate_password_hash(password),roles=['admin'])
        db.session.commit()
        
        return jsonify({"message": "User Created"}), 201
    
    return jsonify({"message": "Email is already registered"}), 409


    
user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "username": fields.String,
    "active": fields.Boolean
}


@app.get('/users')
@auth_required("token")
@roles_required("admin")
def all_users():
    users = User.query.join(User.roles).filter(Role.name == 'manager').all()
    if len(users) == 0:
        return jsonify({"message": "No User Found"}), 404
    return marshal(users, user_fields)






    

@app.post('/cart')
@auth_required("token")
def cart():
    data = request.get_json()
    user_id = data.get('user_id')
    cart_list = (Cart.query.options(joinedload(Cart.product)).filter_by(user_id=user_id).all())
    if len(cart_list) == 0:
        return jsonify({"message": "Cart is Empty"}), 404
    
    formatted_cart_list = []
    for cart_item in cart_list:
        product_info = {
            'cart_id': cart_item.id,
            'product_id': cart_item.product.id,
            'product_name': cart_item.product.name,
            'description': cart_item.product.description,
            'price': cart_item.product.price,
            'stock': cart_item.product.stock,
            'image_link': cart_item.product.image_link,
            'category_id': cart_item.product.category_id,
            'quantity': cart_item.quantity
        }
        formatted_cart_list.append(product_info)
    return jsonify(formatted_cart_list)



    
    

@app.get('/add_to_cart/<int:user_id>/<int:product_id>')
@auth_required("token")
def add_to_cart(user_id, product_id):
    cart = Cart.query.filter_by(user_id=user_id, product_id=product_id).first()
    if cart:
        cart.quantity += 1
        db.session.commit()
        return jsonify({"message": "Product added to cart"})
    else:
        cart = Cart(user_id=user_id, product_id=product_id, quantity=1)
        db.session.add(cart)
        db.session.commit()
        return jsonify({"message": "Product added to cart"})
    
    
    


    
@app.get('/remove_from_cart/<int:user_id>/<int:product_id>')
@auth_required("token")
def remove_from_cart(user_id, product_id):
    cart = Cart.query.filter_by(user_id=user_id, product_id=product_id).first()
    if cart:
        cart.quantity -= 1
        db.session.commit()
        return jsonify({"message": "Product removed from cart"})
    else:
        return jsonify({"message": "Product not found in cart"})
    

 

@app.post('/place_order')
@auth_required("token")
def place_order():
    
    data = request.get_json()
    user_id = data.get('user_id')

    # Fetch user's cart items
    # cart_items = Cart.query.filter_by(user_id=user_id).all()
    cart_items = Cart.query.options(joinedload(Cart.product)).filter_by(user_id=user_id).all()

    # Check if quantities in the cart are valid
    for cart_item in cart_items:
        if cart_item.quantity > cart_item.product.stock:
            return jsonify({"message": f"Quantity for '{cart_item.product.name}' exceeds available stock"}), 400

    # Create an order
    new_order = Order(user_id=user_id, status='Placed',date=d.datetime.now())
    db.session.add(new_order)
    db.session.commit()

    # Create order items and update product stock
    for cart_item in cart_items:
        new_order_item = OrderItem(
            order_id=new_order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        db.session.add(new_order_item)

        # Update product stock
        cart_item.product.stock -= cart_item.quantity

        # Remove cart item after placing order
        db.session.delete(cart_item)

    db.session.commit()

    return jsonify({"message": "Order placed successfully"}), 200



@app.post('/category_create_request')
@auth_required("token")
@roles_required("manager")
def category_create_request():
    data = request.get_json()
    action_info = {
    'name':data.get('name'),
    'description':data.get('description'),
    'action':data.get('action'),
    'manager_id':data.get('manager_id'),
    }
    
    new_action = Category_Request(**action_info)
    db.session.add(new_action)
    db.session.commit()
    
    return {'message':'Action Request Submitted'},201


@app.post('/category_action_request')
@auth_required("token")
@roles_required("manager")
def category_action_request():
    data = request.get_json()
    action_info = {
    'category_id':data.get('category_id'),
    'name':data.get('name'),
    'description':data.get('description'),
    'action':data.get('action'),
    'manager_id':data.get('manager_id'),
    }
    
    new_action = Category_Request(**action_info)
    db.session.add(new_action)
    db.session.commit()
    
    return {'message':'Action Request Submitted'},201


    






@app.get('/action_request')
@auth_required("token")
@roles_required("admin")
def action_request():
    action_request = category_requests = Category_Request.query.filter(Category_Request.status == False).all()
    if len(action_request) == 0:
        return jsonify({"message": "No Action Request Found"}), 404
    return marshal(action_request, {
    "id": fields.Integer,
    "category_id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "action": fields.String,
    "manager_id": fields.Integer,
    })


@app.get('/action_request/approve/<int:action_id>')
@auth_required("token")
@roles_required("admin")
def approve_action_request(action_id):
    action_request = Category_Request.query.filter(Category_Request.id == action_id).first()
    if not action_request:
        return jsonify({"message": "No Action Request Found"}), 404
    
    
    # Update the status to True for approval
    action_request.status = True
    
    # Check the action type and perform actions accordingly
    if action_request.action == 'delete':
        # Delete the category
        Category.query.filter(Category.id == action_request.category_id).delete()
        db.session.commit()
        cache.clear()
        
        return jsonify({"message": "Category Deleted Successfully"})
    elif action_request.action == 'update':
        # Update the category details
        category = Category.query.get(action_request.category_id)
        category.name = action_request.name
        category.description = action_request.description
        db.session.commit()
        cache.clear()

        return jsonify({"message": "Category Updated Successfully"})
    
    elif action_request.action == 'create':
        # Create a new category
        new_category = Category(name=action_request.name, description=action_request.description)
        db.session.add(new_category)
        db.session.commit()
        cache.clear()
        
        return jsonify({"message": "Category Created Successfully"})

    
    return jsonify({"message": "Invalid Action"})



@app.get('/action_request/reject/<int:action_id>')
@auth_required("token")
@roles_required("admin")
def reject_action_request(action_id):
    action_request = Category_Request.query.get(action_id)
    if not action_request:
        return jsonify({"message": "No Action Request Found"}), 404
    
    # Delete the action request
    db.session.delete(action_request)
    db.session.commit()
    
    return jsonify({"message": "Action Request Rejected and Deleted"})

@app.get('/order/<int:user_id>')
@auth_required("token")
def order(user_id):
    order = Order.query.filter_by(user_id=user_id).all()
    if len(order) == 0:
        return jsonify({"message": "No Order Found"}), 404
    return marshal(order, {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "status": fields.String,
    "date": fields.DateTime
    })
    
    


@app.get('/search/<string:search_by>/<string:seach_q>')
def search(search_by,seach_q):
    if search_by == 'name':
        product = Product.query.filter(Product.name.ilike(f'%{seach_q}%')).all()
        if len(product) == 0:
            return jsonify({"message": "No Product Found"}), 404
        return marshal(product, {
        "id": fields.Integer,
        "name": fields.String,
        "description": fields.String,
        "price": fields.Integer,
        "stock": fields.Integer,
        "image_link": fields.String,
        "category_id": fields.Integer
        })
        
    
        
    elif search_by == 'description':
        product = Product.query.filter(Product.description.ilike(f'%{seach_q}%')).all()
        if len(product) == 0:
            return jsonify({"message": "No Product Found"}), 404
        return marshal(product, {
        "name": fields.String,
        "description": fields.String,
        "price": fields.Integer,
        "stock": fields.Integer,
        "image_link": fields.String,
        "category_id": fields.Integer
        })
        
    elif search_by == 'price':
        product = Product.query.filter(Product.price == seach_q).all()
        if len(product) == 0:
            return jsonify({"message": "No Product Found"}), 404
        return marshal(product, {
        "name": fields.String,
        "description": fields.String,
        "price": fields.Integer,
        "stock": fields.Integer,
        "image_link": fields.String,
        "category_id": fields.Integer
        })
    elif search_by == 'product_id':
        product = Product.query.filter(Product.id == seach_q).all()
        if len(product) == 0:
            return jsonify({"message": "No Product Found"}), 404
        return marshal(product, {
        "name": fields.String,
        "description": fields.String,
        "price": fields.Integer,
        "stock": fields.Integer,
        "image_link": fields.String,
        "category_id": fields.Integer
        })
    elif search_by == 'category_id':
        product = Product.query.filter(Product.category_id == seach_q).all()
        if len(product) == 0:
            return jsonify({"message": "No Product Found"}), 404
        return marshal(product, {
        "name": fields.String,
        "description": fields.String,
        "price": fields.Integer,
        "stock": fields.Integer,
        "image_link": fields.String,
        "category_id": fields.Integer
        })
    


@app.get('/download-csv')
def download_csv():
    task = create_product_csv.delay()
    return jsonify({"task_id": task.id})

        

@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        csv_content = res.result
        # Use BytesIO instead of StringIO
        csv_bytes = csv_content.encode('utf-8')  # Convert string to bytes
        return send_file(
            BytesIO(csv_bytes),  # Use BytesIO
            as_attachment=True,
            download_name='test1.csv',  # Use download_name instead of attachment_filename
            mimetype='text/csv'
        )
    else:
        return jsonify({"message": "Task is pending"})
    
    
