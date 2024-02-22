// export default{
//     template: `<div>Working</div>`
// }


export default {
    template: `<div>
    <h1>Manager to be approved</h1>
    <div v-if="error"> {{error}}</div>
    <table class="table">
        <thead>
            <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in allUsers">
                <td>{{user.username}}</td>
                <td>{{user.email}}</td>
                <td>
                    <button v-if="!user.active" class="btn btn-primary" @click="approve(user.id)">
                        Approve
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</div>`,
    data() {
      return {
        allUsers: [],
        token: localStorage.getItem('auth-token'),
        error: null,
      }
    },
    methods: {
      async approve(istId) {
        const res = await fetch(`/activate/manager/${istId}`, {
          headers: {
            'Authentication-Token': this.token,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
        }
      },
    },
    async mounted() {
      const res = await fetch('/users', {
        headers: {
          'Authentication-Token': this.token,
        },
      })
      const data = await res.json().catch((e) => {})
      if (res.ok) {
        console.log(data)
        this.allUsers = data
      } else {
        this.error = res.status
      }
    },
  }
  