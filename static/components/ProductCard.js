export default {
    template: `<div class="card">
    <div class="card-body">
    <div class="col-md">
                <img :src="product.image_link" class="img-fluid" :alt="product.name">
          </div>

        <h4 class="card-title"> {{product.name}}</h4>
        <p class="card-text">Product Id: {{product.id}}</p>
        <p class="card-text">Category Id: {{product.category_id}}</p>
        <p class="card-text">Stock: {{product.stock}}</p>

        <h4 class="card-title">Price: {{product.price}}</h4>
        <p class="card-text">Description: {{product.description}}</p>

        <button v-if="['customer', 'manager', 'admin'].includes(role) && product.stock > 0" class="btn btn-success" @click='add_to_cart'> Add To Cart </button>
        <p v-if="['customer', 'manager', 'admin'].includes(role) && product.stock <= 0" style="color: red;">Out of Stock</p>

        <button v-if="['manager', 'admin'].includes(role)" class="btn btn-danger" @click='delete_product'>Delete</button>

        <button v-if="['manager', 'admin'].includes(role)" class="btn btn-primary" @click="toggleExpand">Edit</button>
        <div v-if="showExpandableContent">
            <!-- Your expandable content goes here -->
            <!-- For example, a form or additional details -->
            <form>
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" placeholder="Product Name" v-model="product_data.name">
                </div>
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" placeholder="Product Description" v-model="product_data.description"></textarea>
                </div>
                <div class="mb-3">
                    <label for="price" class="form-label">Price</label>
                    <input type="number" class="form-control" id="price" placeholder="Product Price" v-model="product_data.price">
                </div>
                <div class="mb-3">
                    <label for="stock" class="form-label">Stock</label>
                    <input type="number" class="form-control" id="stock" placeholder="Product Stock" v-model="product_data.stock">
                </div>
                <div class="mb-3">
                    <label for="image_link" class="form-label">Image Link</label>
                    <input type="text" class="form-control" id="image_link" placeholder="Image Link" v-model="product_data.image_link">
                </div>

                <div class="mb-3">
                <div>
                    <label for="roles" class="form-label">Category:</label>
                      <select id="roles" v-model="product_data.category_id" required>
                      <option v-for="category in Category_list" :key="category.id" :value="category.id">{{category.name}}</option>
                    </select>
                </div>
                
                </div>
                <button type="button" class="btn btn-primary" @click="update_product">Update</button>
            </form>
        </div>
    </div>
</div>
`,
    props: ['product'],
    data() {
      return {
        role: localStorage.getItem('role'),
        authToken: localStorage.getItem('auth-token'),
        userID: localStorage.getItem('id'),
        showExpandableContent: false,

        product_data:{
          "id":this.product.id,
          "name":this.product.name,
          "description":this.product.description,
          "price":this.product.price,
          "stock":this.product.stock,
          "image_link":this.product.image_link,
          "category_id":this.product.category_id,
        },
        Category_list:[]



      }
    },
    methods: {
      async add_to_cart() {
        const res = await fetch(`/add_to_cart/${this.userID}/${this.product.id}`, {
          headers: {
            'Authentication-Token': this.authToken,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
        }
      },

      async delete_product() {
        const res = await fetch(`/api/product_item`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.product),
        })

        const data = await res.json()
        if (res.ok) {
          alert(data.message)
          window.location.reload();
  
        }
        

    },

    async update_product() {
      const res = await fetch('/api/product_item', {
        method: 'PUT',
        headers: {
          'Authentication-Token': this.authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.product_data),
      })

      const data = await res.json()
      if (res.ok) {
        alert(data.message)
        window.location.reload();

      }
    },



    toggleExpand() {
      this.showExpandableContent = !this.showExpandableContent;},
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
  