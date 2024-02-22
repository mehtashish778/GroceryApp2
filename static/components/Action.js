
export default {
    template: `<div>
    <h1>Manager to be approved</h1>
    <div v-if="error"> {{error}}</div>
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Category ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Action</th>
                <th>Manager ID</th>
                <th>Approve</th>
                <th>Reject</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="request in all_request">
                <td>{{request.id}}</td>
                <td>{{request.category_id}}</td>
                <td>{{request.name}}</td>
                <td>{{request.description}}</td>
                <td>{{request.action}}</td>
                <td>{{request.manager_id}}</td>
                <td>
                    <button v-if="!request.active" class="btn btn-primary" @click="approve(request.id)">
                        Approve
                    </button>
                </td>
                <td>
                    <button v-if="!request.active" class="btn btn-primary" @click="reject(request.id)">
                        Reject
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</div>`,
    data() {
      return {
        all_request: [],
        token: localStorage.getItem('auth-token'),
        error: null,
      }
    },
    methods: {
      async approve(istId) {
        const res = await fetch(`/action_request/approve/${istId}`, {
          headers: {
            'Authentication-Token': this.token,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
        }
      },
      async reject(istId) {
        const res = await fetch(`/action_request/reject/${istId}`, {
          headers: {
            'Authentication-Token': this.token,
          },
        })
        const data = await res.json()
        if (res.ok) {
          alert(data.message)
        }
    }
    },
    async mounted() {
      const res = await fetch('/action_request', {
        headers: {
          'Authentication-Token': this.token,
        },
      })
      const data = await res.json().catch((e) => {})
      if (res.ok) {
        console.log(data)
        this.all_request = data
      } else {
        this.error = res.status
      }
    },
  }
  