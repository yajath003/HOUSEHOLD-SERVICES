import nav_admin from '../nav_admin.js';

export default {
  template: `<div class="container text-center my-5">
    <nav_admin />
    <div class="card">
      <div class="card-header">
        <button class="btn btn-secondary" @click="goBack">Back</button>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center">Loading user details...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else>
          <h2 class="mb-4">{{ user.name }} Details</h2>
          <dl class="row">
            <dt class="col-sm-3">User ID:</dt>
            <dd class="col-sm-9">{{ user.id }}</dd>

            <dt class="col-sm-3">Name:</dt>
            <dd class="col-sm-9">{{ user.name }}</dd>

            <dt class="col-sm-3">Email:</dt>
            <dd class="col-sm-9">{{ user.email }}</dd>

            <dt class="col-sm-3">Status:</dt>
            <dd class="col-sm-9">
              <span :class="['badge', user.active ? 'bg-success' : 'bg-danger']">
                {{ user.active ? 'Active' : 'Inactive' }}
              </span>
            </dd>
            
            <dt class="col-sm-3">Address:</dt>
            <dd class="col-sm-9">{{ user.address }}</dd>
            
            <dt class="col-sm-3">Pin</dt>
            <dd class="col-sm-9">{{ user.pin }}</dd>
          </dl>

          <div class="mt-4">
            <button
              class="btn btn-primary"
              @click="toggleStatus"
              :disabled="updating"
            >
              {{ updating ? 'Updating...' : user.active ? 'Mark as Inactive' : 'Mark as Active' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`,
components: { nav_admin },
  data() {
    return {
      user: {},
      loading: true,
      error: null,
      updating: false
    };
  },

  async created() {
    try {
      const response = await fetch(`/user_details/${this.$route.params.id}`, {
        headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');
      this.user = await response.json();
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },

  methods: {
    goBack() {
      this.$router.push('/admin_dashboard');
    },

    async toggleStatus() {
      this.updating = true;
      try {
        const response = await fetch(`/toggle_user_status/${this.user.id}`, {
          method: 'PUT',
          headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
        });

        if (!response.ok) throw new Error('Failed to update user status');
        const result = await response.json();
        this.user.active = result.new_status;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.updating = false;
      }
    }
  }
};