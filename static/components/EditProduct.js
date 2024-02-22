

export default {
    template: `<div>
    <input type="text" placeholder="name" v-model="details.name"/>
    <input type="text" placeholder="description" v-model="details.description"/>
    <input type="float" placeholder="price" v-model="details.price"/>

    <input type="integer" placeholder="stock" v-model="details.stock" />
    <input type="text" placeholder="image_link" v-model="details.image_link" />
    <input type="integer" placeholder="category_id" v-model="details.category_id" />

    <button @click="addProduct"> Create Product</button>
    </div>`,
    props: ['resource'],
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
      }
    },
    methods: {
        async addProduct() {
          const res = await fetch('/api/product_item', {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
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
    }