export default {
    template: `<div class="card p-3">
    <div class="card-body">
        <h5 class="card-title">Product Details</h5>
        <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <strong>Product ID:</strong>
                <span>{{ resource.product_id }}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <strong>Name:</strong>
                <span>{{ resource.product_name }}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <strong>Price:</strong>
                <span>INR {{ resource.price }}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <strong>Quantity:</strong>
                <span>{{ resource.quantity }}</span>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <strong>Available Stock:</strong>
                <span>{{ resource.stock }}</span>
            </li>
            <li class="list-group-item" v-if="resource.quantity < resource.stock">
                <button class="btn btn-success" @click="add_to_cart">Add</button>
            </li>
            <li class="list-group-item" v-if="resource.quantity > 0">
                <button class="btn btn-danger" @click="remove_from_cart">Remove</button>
            </li>
        </ul>
    </div>
</div>

  `,
    props: ['resource'],
    data() {
      return {
        role: localStorage.getItem('role'),
        authToken: localStorage.getItem('auth-token'),
        userID: localStorage.getItem('id'),

      }
    },
    methods: {
      async add_to_cart() {
        const res = await fetch(`/add_to_cart/${this.userID}/${this.resource.product_id}`, {
          headers: {
            'Authentication-Token': this.authToken,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
          window.location.reload();
        }
      },
      async remove_from_cart() {
        const res = await fetch(`/remove_from_cart/${this.userID}/${this.resource.product_id}`, {
          headers: {
            'Authentication-Token': this.authToken,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
          window.location.reload();
        }
      },

  }
}
  