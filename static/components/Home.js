import CustomerHome from './CustomerHome.js'
import ManagerHome from './ManagerHome.js'
import AdminHome from './AdminHome.js'
import ProductCard from './ProductCard.js'
import CategoryCard from './CategoryCard.js'




export default {
  template: `
  <div class="container" style="background-color:red">
  <form class="form-inline mt-3 mb-3">
    <div class="input-group">
      <input type="text" class="form-control" id="search" placeholder="Search" v-model="search_query">
      <select id="roles" class="form-select" v-model="search_query_by" required>
        <option value="name">By Name</option>
        <option value="product_id">By Product ID</option>
        <option value="category_id">By Category</option>
        <option value="description">By Description</option>
      </select>
      <button type="button" class="btn btn-primary" @click="search">Search</button>
    </div>
  </form>

  <div>
    <CustomerHome v-if="userRole === 'customer'" />
    <AdminHome v-if="userRole === 'admin'" />
    <ManagerHome v-if="userRole === 'manager'" />
  </div>

  <div>
    <h1>Category</h1>
    <div class="container-fluid">
    <div class="row flex-nowrap overflow-auto">
        <CategoryCard v-for="(category, index) in Category_List" :key="'cat' + index" :category="category" class="col-md-4 mb-3" />
    </div>
    </div>
  

    <h1>Products</h1>
    <div class="row">
      <ProductCard v-for="(product, index) in Product_List" :key="'prod' + index" :product="product" class="col-md-4 mb-3" />
    </div>
  </div>
</div>
`,

  data() {
    return {
      userRole: localStorage.getItem('role'),
      userID: localStorage.getItem('id'),
      authToken: localStorage.getItem('auth-token'),
      Product_List: [],
      Category_List: [],
      search_query:null,
      search_query_by: null,
    }
  },

  components: {
    CustomerHome,
    ManagerHome,
    AdminHome,
    ProductCard,
    CategoryCard,

  },
  methods: {
    async search() {
      const res = await fetch(`/search/${this.search_query_by}/${this.search_query}`)
      const search_data = await res.json()
        if (res.ok) {
          this.Product_List = search_data
          console.log(this.Product_List)
        
        }
        else{
          alert(search_data.message)
        }
    }
  },
  async mounted() {
    const res_product = await fetch('/api/product_item', {
      headers: {
        'Authentication-Token': this.authToken,
      },
    })


    const data_product = await res_product.json()
    if (res_product.ok) {
      this.Product_List = data_product
    } else {
      alert(data_product.message)
    }




    const res_category = await fetch('/api/product_category', {
      headers: {
        'Authentication-Token': this.authToken,
      },
    })

    const data_category = await res_category.json()
    if (res_category.ok) {
      this.Category_List = data_category
    } else {
      alert(data_category.message)
    }
  },
}