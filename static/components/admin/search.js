import nav_admin from '../nav_admin.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_admin />

        <!-- Search Bar -->
        <div class="search-container mb-4">
            <div class="input-group mx-auto" style="max-width: 600px;">
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search by name, ID, service type..." 
                    v-model="searchQuery"
                    @input="performSearch"
                >
                <span class="input-group-text">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                         class="bi bi-search" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                </span>
            </div>
        </div>

        <div v-if="loading" class="text-center mt-4">Searching...</div>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="results && !loading">
            <!-- Services Results -->
            <div v-if="results.services.length" class="mb-5">
                <h4 class="text-start mb-4">Services</h4>
                <div class="row g-4">
                    <div class="col-md-4" v-for="service in results.services" :key="service.id">
                        <div class="card h-100 service-card">
                            <div class="card-body">
                                <h5 class="card-title">{{ service.name }}</h5>
                                <p class="card-text">
                                    <span class="badge bg-primary">ID: {{ service.id }}</span>
                                    <span class="badge bg-success ms-2">₹{{ service.price }}</span>
                                </p>
                                <button class="btn btn-sm btn-outline-primary"
                                    @click="$router.push('/service_details/' + service.id)">
                                    View Details
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Employees Results -->
            <div v-if="results.employees.length" class="mb-5">
                <h4 class="text-start mb-4">Employees</h4>
                <div class="row g-4">
                    <div class="col-md-4" v-for="employee in results.employees" :key="employee.emp_id">
                        <div class="card h-100 employee-card">
                            <div class="card-body">
                                <h5 class="card-title">{{ employee.name }}</h5>
                                <p class="card-text">
                                    <span class="badge bg-primary">ID: {{ employee.emp_id }}</span>
                                    <span class="badge bg-info ms-2">{{ employee.service }}</span>
                                </p>
                                <button class="btn btn-sm btn-outline-primary"
                                        >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users Results -->
            <div v-if="results.users.length" class="mb-5">
                <h4 class="text-start mb-4">Users</h4>
                <div class="row g-4">
                    <div class="col-md-4" v-for="user in results.users" :key="user.id">
                        <div class="card h-100 user-card">
                            <div class="card-body">
                                <h5 class="card-title">{{ user.name }}</h5>
                                <p class="card-text">
                                    <span class="badge bg-primary">ID: {{ user.id }}</span>
                                    <span :class="['badge', user.active ? 'bg-success' : 'bg-danger', 'ms-2']">
                                        {{ user.active ? 'Active' : 'Inactive' }}
                                    </span>
                                </p>
                                <button class="btn btn-sm btn-outline-primary"
                                        @click="viewUserDetails(user.id)">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="noResults" class="text-muted mt-5">
                No results found for "{{ searchQuery }}"
            </div>
        </div>

        <!-- User Details -->
        <div v-if="showUserDetails" class="card mt-5">
            <div class="card-header">
                <button class="btn btn-secondary" @click="showUserDetails = false">Back</button>
            </div>
            <div class="card-body">
                <div v-if="loadingUser" class="text-center">Loading user details...</div>
                <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-else>
                    <h2 class="mb-4">User Details</h2>
                    <dl class="row">
                        <dt class="col-sm-3">User ID:</dt>
                        <dd class="col-sm-9">{{ user.id }}</dd>

                        <dt class="col-sm-3">Name:</dt>
                        <dd class="col-sm-9">{{ user.name }}</dd>

                        <dt class="col-sm-3">Email:</dt>
                        <dd class="col-sm-9">{{ user.email }}</dd>

                        <dt class="col-sm-3">Role:</dt>
                        <dd class="col-sm-9">{{ user.role }}</dd>

                        <dt class="col-sm-3">Status:</dt>
                        <dd class="col-sm-9">
                            <span :class="['badge', user.active ? 'bg-success' : 'bg-danger']">
                                {{ user.active ? 'Active' : 'Inactive' }}
                            </span>
                        </dd>
                    </dl>

                    <div class="mt-4">
                        <button class="btn btn-primary" @click="toggleStatus" :disabled="updating">
                            {{ updating ? 'Updating...' : user.active ? 'Mark as Inactive' : 'Mark as Active' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

    components: { nav_admin },

    data() {
        return {
            searchQuery: '',
            results: { services: [], employees: [], users: [] },
            loading: false,
            error: null,
            searchTimeout: null,
            showUserDetails: false,
            user: {},
            loadingUser: false,
            updating: false
        };
    },

    computed: {
        noResults() {
            return !this.loading &&
                   this.results.services.length === 0 &&
                   this.results.employees.length === 0 &&
                   this.results.users.length === 0;
        }
    },

    methods: {
        async performSearch() {
            clearTimeout(this.searchTimeout);
            if (!this.searchQuery.trim()) return this.results = { services: [], employees: [], users: [] };

            this.loading = true;
            this.searchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`/search?q=${encodeURIComponent(this.searchQuery)}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                    });

                    if (!response.ok) throw new Error('Search failed');
                    this.results = await response.json();
                } catch (error) { this.error = error.message; }
                finally { this.loading = false; }
            }, 500);
        },

        async viewUserDetails(userId) {
            this.showUserDetails = true;
            this.loadingUser = true;
            try {
                const response = await fetch(`/user_details/${userId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                if (!response.ok) throw new Error('Failed to fetch user details');
                this.user = await response.json();
            } catch (error) { this.error = error.message; }
            finally { this.loadingUser = false; }
        },
         async toggleStatus() {
        this.updating = true;
        try {
            const response = await fetch(`/toggle_user_status/${this.user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to update status');

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
