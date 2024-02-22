export default{
    template: 

  `  <div class='d-flex justify-content-center' style="margin-top: 25vh">
     <div class="mb-3 p-5 bg-light">
      <div class='text-danger'>*{{error}}</div>
      <label for="user-email" class="form-label">Email address</label>
      <input type="username" class="form-control" id="user-name" placeholder="name@example.com" v-model="cred.email">
      <label for="user-name" class="form-label">Username</label>
      <input type="email" class="form-control" id="user-email" placeholder="abc" v-model="cred.username">
      <label for="user-password" class="form-label">Password</label>
      <input type="password" class="form-control" id="user-password" v-model="cred.password">
      <div>
        <label for="roles" class="form-label">Role:</label>
        <select id="roles" v-model="cred.roles" required>
          <option value=3>Customer</option>
          <option value=2>Manager</option>
          <option value=1>Admin</option>
        </select>
      </div>
      <button class="btn btn-primary mt-2" @click='register' > Register </button>
  </div>
</div>`
,
    data() {
      return {
        cred: {
          email: null,
          username: null,
          password: null,
          roles:null,
        },
        error: null,
      }
    },
    methods: {
      async register() {
        const res = await fetch('/user-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.cred),
        })
        const data = await res.json()
        if (res.ok) {
            alert(data.message)
        } else {
          this.error = data.message
        }
      },
    },
}