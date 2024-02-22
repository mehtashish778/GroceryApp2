

export default {
    template: `<div class="container">
    <div class="row">
        <div class="col-md-6">
            <input type="text" class="form-control mb-2" placeholder="Name" v-model="details.name"/>
            <input type="text" class="form-control mb-2" placeholder="Description" v-model="details.description"/>
            <input type="number" class="form-control mb-2" placeholder="Price" v-model="details.price"/>
        </div>
        <div class="col-md-6">
            <input type="number" class="form-control mb-2" placeholder="Stock" v-model="details.stock"/>
            <input type="text" class="form-control mb-2" placeholder="Image Link" v-model="details.image_link"/>
            <div class="mb-2">
                <label for="category" class="form-label">Category:</label>
                <select id="category" class="form-select" v-model="details.category_id" required>
                    <option v-for="category in Category_list" :key="category.id" :value="category.id">{{category.name}}</option>
                </select>
            </div>
            <button class="btn btn-primary" @click="addProduct">Create Product</button>
        </div>
    </div>
</div>
`,
    data() {
      return {
        authToken: localStorage.getItem('auth-token'),
        details: {
            
            "name":null,
            "description":null,
            "price":null,
            "stock":null,
            "image_link":null,
            "category_id":null,
        
        },
        Category_list:[],
      }
    },
    methods: {
        async addProduct() {
          const res = await fetch('/api/product_item', {
            method: 'POST',
            headers: {
              'Authentication-Token': this.authToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.details),
          })
    
          const data = await res.json()
          if (res.ok) {
            alert(data.message)
          }
        },
      },
      async mounted(){
        const res_category = await fetch('/api/product_category', {
          headers: {
            'Authentication-Token': this.authToken,
          },
        })
    
        const data_category = await res_category.json()
        if (res_category.ok) {
          this.Category_list = data_category
        } else {
          alert(data_category.message)
        }
      }
    }