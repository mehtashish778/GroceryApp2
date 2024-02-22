import CartProduct from './CartProduct.js'

export default {
  template: `
    <div>
      <CartProduct v-for="(resource, index) in resources" :key="index" :resource="resource" />
      <h3>Total Price: INR {{ calculateTotalPrice }}</h3>
      <button class="btn btn-success" @click="placeOrder">Place Order</button>
    </div>
  `,
  data() {
    return {
      userRole: localStorage.getItem('role'),
      userId: localStorage.getItem('id'),
      authToken: localStorage.getItem('auth-token'),
      resources: [],
      details: {
        "user_id": localStorage.getItem('id'),
      }
    }
  },
  components: {
    CartProduct,
  },
  mounted() {
    // Fetch data upon component mounting
    this.fetchData();
  },
  computed: {
    calculateTotalPrice() {
      if (!Array.isArray(this.resources)) {
        return 0; // Or any default value when resources is not an array
      }
      return this.resources.reduce((total, resource) => total + (resource.price * resource.quantity), 0);
    }
  },
  methods: {
    async fetchData() {
      try {
        const res = await fetch('/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.authToken,
          },
          body: JSON.stringify(this.details),
        });
        
        if (res.ok) {
          const data = await res.json();
          // Update the resources array with the fetched data
          this.resources = data;
        } else {
          // Handle errors or non-OK response statuses
          console.error('Failed to fetch data:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },

    async placeOrder() {
      try {
        const res = await fetch('/place_order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.authToken,
          },
          body: JSON.stringify(this.details),
        });
        
        if (res.ok) {
          // Process the successful response as needed
          alert(res.json())
          window.location.reload();

        } else {
          // Handle errors or non-OK response statuses
          console.error('Failed to place order:', res.statusText);
        }
      } catch (error) {
        console.error('Error placing order:', error);
      }
    }
  }
}
