export default {
  template: `
  <div class="container">
  <div class="row">
      <div class="col-md-6">
          <input type="text" class="form-control mb-2" placeholder="Name" v-model="details.name"/>
          <input type="text" class="form-control mb-2" placeholder="Description" v-model="details.description"/>
      </div>
      <div class="col-md-6">
          <button v-if="role === 'admin'" class="btn btn-primary mb-2" @click="addCategory">Create Category</button>
          <button v-if="role === 'manager'" class="btn btn-success mb-2" @click="requestCreate">Request</button>
      </div>
  </div>
</div>
  `,
  data() {
    return {
      authToken: localStorage.getItem('auth-token'),
      userID: localStorage.getItem('id'),
      role: localStorage.getItem('role'),
      details: {
        "name": null,
        "description": null,
      },
    };
  },
  methods: {
    async addCategory() {
      try {
        const res = await fetch('/api/product_category', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.details),
        });

        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          window.location.reload();
        } else {
          throw new Error(data.message || 'Failed to create category');
        }
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category');
      }
    },

    async requestCreate() {
      try {
        const res = await fetch('/category_create_request', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "name": this.details.name,
            "description": this.details.description,
            "action": "create",
            "manager_id": this.userID
          }),
        });

        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          window.location.reload();

        } else {
          throw new Error(data.message || 'Failed to create request');
        }
      } catch (error) {
        console.error('Error requesting creation:', error);
        alert('Failed to create request');
      }
    },
  },
};
