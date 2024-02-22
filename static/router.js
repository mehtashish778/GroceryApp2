import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Cart from './components/Cart.js'
import AddCategory from './components/AddCategory.js'
import AddProduct  from './components/AddProduct.js'
import EditProduct  from './components/EditProduct.js'
import EditCategory  from './components/EditCategory.js'
import Users from './components/Users.js'
import Action from './components/Action.js'
import Order from './components/Order.js'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/users', component: Users},
    { path: '/action', component: Action },
    { path: '/userCart', component: Cart },
    { path: '/addcategory', component: AddCategory },
    { path: '/addproduct', component: AddProduct  },
    { path: '/editproduct', component: EditProduct  },
    { path: '/editproduct', component: EditProduct  },
    { path: '/order', component: Order  },
    

]

export default new VueRouter({
    routes,
})