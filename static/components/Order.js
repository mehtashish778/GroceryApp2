export default {
    template: `<div>
    <h1>My Order</h1>
    <div v-if="error"> {{error}}</div>
    <table class="table">
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Order Status</th>
                <th>Order Date</th>

            </tr>
        </thead>
        <tbody>
            <tr v-for="order in my_order">
                <td>{{order.id}}</td>
                <td>{{order.status}}</td>
                <td>{{order.date}}</td>
            </tr>
        </tbody>
    </table>
</div>`,
    data() {
      return {
        my_order: [],
        token: localStorage.getItem('auth-token'),
        userRole: localStorage.getItem('role'),
        userId: localStorage.getItem('id'),
        error: null,
      }
    },
    methods: {
    },
    async mounted() {
      const res = await fetch('/order/' + this.userId, {
        headers: {
          'Authentication-Token': this.token,
        },
      })
      const data = await res.json().catch((e) => {})
      if (res.ok) {
        console.log(data)
        this.my_order = data
      } else {
        this.error = res.status
      }
    },
  }
  