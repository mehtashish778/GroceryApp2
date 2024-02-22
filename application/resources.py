from flask_restful import Resource,Api,reqparse,marshal_with,fields
from .models import Category,Product, db
from flask_security import current_user,roles_required,login_required,auth_required
from .instances import cache
from flask import request


api = Api(prefix='/api')


parser_category = reqparse.RequestParser()
parser_category.add_argument('name',type=str,help='name should be a string')
parser_category.add_argument('description',type=str,help='description should be a string')

parser_category_del_up = reqparse.RequestParser()

parser_category_del_up.add_argument('id',type=int,help='id should be an integer')
parser_category_del_up.add_argument('name',type=str,help='name should be a string')
parser_category_del_up.add_argument('description',type=str,help='description should be a string')

product_category_fields = {
    'id':fields.Integer,
    'name':fields.String,
    'description':fields.String
    }

class Product_Category(Resource):
    
    @marshal_with(product_category_fields)
    @cache.cached(timeout=50, key_prefix='product_category_list')
    def get(self):
        # Generate a unique cache key based on query parameters
        cache_key = f"product_category_list_{hash(frozenset(request.args.items()))}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result

        all_category = Category.query.all()
        if len(all_category) == 0:
            result = {'message': 'No category found'}, 404
        else:
            # Construct the serialized categories directly from object attributes
            serialized_categories = [
                {
                    'id': category.id,
                    'name': category.name,
                    'description': category.description
                }
                for category in all_category
            ]
            result = serialized_categories

        cache.set(cache_key, result)
        return result
    
    
    @auth_required("token")
    @roles_required("admin")
    def post(self):
        args_category = parser_category.parse_args()
        cate = Category(**args_category)
        db.session.add(cate)
        db.session.commit()
        cache.clear()
        return {'message':'Category added'},201
    
    
    @auth_required("token")
    @roles_required("admin")
    def delete(self):
        args_category = parser_category_del_up.parse_args()
        category_id = args_category.get('id')
        category_to_delete = Category.query.get(category_id)
        
        if category_to_delete:
            db.session.delete(category_to_delete)
            db.session.commit()
            cache.clear()

            
            return {'message': 'Category deleted'}, 200
        else:
            return {'message': 'Category not found'}, 404
    
    
    @auth_required("token")
    @roles_required("admin")
    def put(self):
        args_category = parser_category_del_up.parse_args()
        category_id = args_category.get('id')
        category_to_update = Category.query.get(category_id)
        
        if category_to_update:
            category_to_update.name = args_category.get('name')
            category_to_update.description = args_category.get('description')
            db.session.commit()
            cache.clear()

            
            return {'message': 'Category updated'}, 200
        else:
            return {'message': 'Category not found'}, 404

    
api.add_resource(Product_Category,'/product_category')






parser_item_product = reqparse.RequestParser()
parser_item_product.add_argument('name',type=str,help='name should be a string')
parser_item_product.add_argument('description',type=str,help='description should be a string')
parser_item_product.add_argument('price',type=float,help='price should be a float')  
parser_item_product.add_argument('stock',type=int,help='stock should be a integer')
parser_item_product.add_argument('image_link',type=str,help='image_link should be a string')
parser_item_product.add_argument('category_id',type=int,help='category_id should be a integer')


parser_item_product_del_up = reqparse.RequestParser()

parser_item_product_del_up.add_argument('id',type=int,help='id should be an integer')
parser_item_product_del_up.add_argument('name',type=str,help='name should be a string')
parser_item_product_del_up.add_argument('description',type=str,help='description should be a string')
parser_item_product_del_up.add_argument('price',type=float,help='price should be a float')  
parser_item_product_del_up.add_argument('stock',type=int,help='stock should be a integer')
parser_item_product_del_up.add_argument('image_link',type=str,help='image_link should be a string')
parser_item_product_del_up.add_argument('category_id',type=int,help='category_id should be a integer')

product_item_fields = {
    'id':fields.Integer,
    'name':fields.String,
    'description':fields.String,
    'price':fields.Float,
    'stock':fields.Integer,
    'image_link':fields.String,
    'category_id':fields.Integer
}


class Product_Item(Resource):
    @marshal_with(product_item_fields)
    @cache.cached(timeout=50, key_prefix='product_list')
    def get(self):
        # Generate a unique cache key based on query parameters
        cache_key = f"product_list_{hash(frozenset(request.args.items()))}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result

        all_product = Product.query.all()
        if len(all_product) == 0:
            result = {'message': 'No product found'}, 404
        else:
            result = all_product

        cache.set(cache_key, result)
        return result
    
    


    @auth_required("token")
    def post(self):
        args_product = parser_item_product.parse_args()
        prod = Product(**args_product)
        db.session.add(prod)
        db.session.commit()
        cache.clear()
        return {'message':'Product added'},201
    
    @auth_required("token")
    def delete(self):
        args_product = parser_item_product_del_up.parse_args()
        product_id = args_product.get('id')
        product_to_delete = Product.query.get(product_id)
        
        if product_to_delete:
            db.session.delete(product_to_delete)
            db.session.commit()
            cache.clear()
            return {'message': 'Product deleted'}, 200
        else:
            return {'message': 'Product not found'}, 404
    
    
    @auth_required("token")
    def put(self):
        args_product = parser_item_product_del_up.parse_args()
        product_id = args_product.get('id')
        product_to_update = Product.query.get(product_id)
        
        if product_to_update:
            product_to_update.name = args_product.get('name')
            product_to_update.description = args_product.get('description')
            product_to_update.price = args_product.get('price')
            product_to_update.stock = args_product.get('stock')
            product_to_update.image_link = args_product.get('image_link')
            product_to_update.category_id = args_product.get('category_id')
            db.session.commit()
            cache.clear()
            return {'message': 'Product updated'}, 200
        else:
            return {'message': 'Product not found'}, 404
    
    
    
    
api.add_resource(Product_Item,'/product_item')