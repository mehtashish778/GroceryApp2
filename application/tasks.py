from celery import shared_task
from .models import Product
import flask_excel as excel
from flask import make_response
import csv
from io import StringIO
from jinja2 import Template
from .models import User, Role,Order, OrderItem,db
from .mail_service import send_message
import os
from datetime import datetime, timedelta
from sqlalchemy import func






@shared_task(ignore_result=False)
def create_product_csv():
    query = Product.query.with_entities(Product.name, Product.stock).all()
    csv_data = [
        ["name", "stock"],
        *[(product.name, product.stock) for product in query]
    ]

    # Using StringIO to write CSV data to an in-memory file-like object
    csv_buffer = StringIO()
    csv_writer = csv.writer(csv_buffer)
    csv_writer.writerows(csv_data)

    # Get the content of the CSV
    csv_content = csv_buffer.getvalue()

    return csv_content 



@shared_task(ignore_result=True)
def daily_reminder(to, subject):
    try:
        # Print the current working directory
        print("Current working directory:", os.getcwd())

        # Get the directory of the current file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Construct the absolute path to daily_task.html
        file_path = os.path.join(current_dir, "daily_task.html")
        
        with open(file_path, "r") as f:
            template_content = f.read()

        users = User.query.all()
        for user in users:
            # Check if the user has any orders in the last 24 hours
            twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
            recent_order = Order.query.filter(Order.user_id == user.id, Order.date >= twenty_four_hours_ago).first()
            
            # If the user hasn't made any orders in the last 24 hours, send the message
            if not recent_order:
                rendered_template = Template(template_content).render(user_name=user.username)
                send_message(user.email, subject, rendered_template)

        return "OK"
    except FileNotFoundError:
        return f"File '{file_path}' not found."
    except Exception as e:
        return str(e)
    
    

@shared_task(ignore_result=True)
def monthly_reminder(to, subject):
    try:
        # Print the current working directory
        print("Current working directory:", os.getcwd())

        # Get the directory of the current file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Construct the absolute path to daily_task.html
        file_path = os.path.join(current_dir, "monthly_task.html")
        
        with open(file_path, "r") as f:
            template_content = f.read()

        users = User.query.all()
        one_month_ago = datetime.utcnow() - timedelta(days=30)

        for user in users:
            # Check if the user has any orders in the last 30 Days
            total_expenditure = db.session.query(func.sum(OrderItem.price * OrderItem.quantity))\
                .join(Order)\
                    .filter(Order.user_id == user.id, Order.date >= one_month_ago)\
                        .scalar()
            products_purchased = OrderItem.query.join(Order)\
                .filter(Order.user_id == user.id, Order.date >= one_month_ago)
            
            
            rendered_template = Template(template_content).render(Total_Expenditure=total_expenditure,Order_List=products_purchased)
            send_message(user.email, subject, rendered_template)

        return "OK"
    except FileNotFoundError:
        return f"File '{file_path}' not found."
    except Exception as e:
        return str(e)