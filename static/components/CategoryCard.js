
  export default {
    template: `<div class="card">
    <div class="card-body">
        <h5 class="card-title">{{ category.name }}</h5>
        <p class="card-text">Category Id: {{ category.id }}</p>
        
        <div>
            <button v-if="role === 'manager'" class="btn btn-primary me-2" @click="request_delete_category">Request Delete</button>
            <button v-if="role === 'admin'" class="btn btn-danger me-2" @click="delete_category">Delete</button>
            <button v-if="['manager', 'admin'].includes(role)" class="btn btn-primary me-2" @click="toggleExpand">Update</button>
        </div>

        <div v-if="showExpandableContent">
            <form>
                <div class="mb-3">
                    <label for="category_name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="category_name" placeholder="Category Name" v-model="category_data.name">
                </div>
                <div class="mb-3">
                    <label for="category_description" class="form-label">Description</label>
                    <textarea class="form-control" id="category_description" placeholder="Category Description" v-model="category_data.description"></textarea>
                </div>
                <div class = "container style="background-color:red">
                <div>
                    <button v-if="role === 'manager'" class="btn btn-primary me-2" @click="request_update_category">Request Update</button>
                    <button v-if="role === 'admin'" class="btn btn-primary me-2" @click="update_category">Update</button>
                </div>
                </div>
            </form>
        </div>
    </div>
</div>
`,
    props: ['category'],
    data() {
      return {
        role: localStorage.getItem('role'),
        authToken: localStorage.getItem('auth-token'),
        userID: localStorage.getItem('id'),
        showExpandableContent: false,

        category_data:{
          "id":this.category.id,
          "name":this.category.name,
          "description":this.category.description
        },
        category_action_details:{
          "category_id":this.category.id,
          "name":this.category.name,
          "description":this.category.description,
          "action":"delete",
          "manager_id":this.userID
        }
      }
    },
    methods: {
      async update_category() {
        const res = await fetch(`/api/product_category`, {
          method: 'PUT',
          headers: {
            'Authentication-Token': this.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.category_data),
        })
        const data = await res.json()
        if (res.ok) {
        alert(data.message)
        window.location.reload();

      }
      
      },
      async request_update_category() {
      
        try {
          const res = await fetch(`/category_action_request`, {
            method: 'POST',
            headers: {
              'Authentication-Token': this.authToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "category_id":this.category_data.id,
              "name":this.category_data.name,
              "description":this.category_data.description,
              "action":"update",
              "manager_id":this.userID
            }),
          });
      
          const data = await res.json();
      
          if (res.ok) {
            alert(data.message);
            window.location.reload();
          } else {
            // Handle non-OK response (errors)
            alert('Failed to update category');
            // Additional error handling or logging can be added here
          }
        } catch (error) {
          // Handle fetch errors (e.g., network issues)
          console.error('Fetch error:', error);
          alert('Failed to update category: network error');
        }
      },


      async delete_category() {
        const res = await fetch(`/api/product_category`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "id":this.category.id,
            "name":this.category.name,
            "description":this.category.description
          })
        })
        const data = await res.json()
        if (res.ok) {
        alert(data.message)
        window.location.reload();

      }

        
      },
      async request_delete_category() {

        const res = await fetch(`/category_action_request`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "category_id":this.category.id,
            "name":this.category.name,
            "description":this.category.description,
            "action":"delete",
            "manager_id":this.userID
          }),
        })
        const data = await res.json()
        if (res.ok) {
        alert(data.message)
        window.location.reload();
      }
      },
      toggleExpand() {
        this.showExpandableContent = !this.showExpandableContent;
      },
    }
}

  