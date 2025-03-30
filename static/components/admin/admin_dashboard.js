import nav_admin from '../nav_admin.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_admin />
        <!-- Search Bar -->
        <div class="row mt-4 mb-4">
            <div class="col-md-8 mx-auto">
                <div class="input-group">
                    <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Search services, employees, or users..." 
                        v-model="searchQuery"
                        @keyup.enter="performSearch"
                    >
                    <button 
                        class="btn btn-primary" 
                        @click="performSearch"
                        :disabled="searching"
                    >
                        {{ searching ? 'Searching...' : 'Search' }}
                    </button>
                    <button 
                        class="btn btn-secondary" 
                        @click="clearSearch"
                        v-if="searchQuery"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>

        <!-- Services Section -->
        <h4 class="mt-4">Available Services</h4>
        <div v-if="loading" class="mt-3">Loading...</div>
        <div v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</div>

        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="service in services" :key="service.id">
                <div class="card h-100" style="position: relative; overflow: hidden; min-height: 200px;">
                    <div :style="{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(/static/images/' + service.image + ')',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.6)',
                        transform: 'scale(1.1)'
                    }"></div>
                    <div class="card-body text-white d-flex flex-column justify-content-center"
                         style="position: relative; z-index: 1; background-color: rgba(0, 0, 0, 0.5);">
                        <h5 class="card-title text-center">{{ service.name }}</h5>
                        <p class="card-text text-center">
                            <strong>Price:</strong>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                 class="bi bi-currency-rupee" viewBox="0 0 16 16">
                                <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"/>
                            </svg>
                            {{ service.price }}
                        </p>
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-primary" 
                                    @click="ServiceDetails(service.id)"
                                    :disabled="processingService">
                                {{ processingService ? 'Loading...' : 'View Details' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-4 mb-3">
                <div class="card h-100" style="position: relative; overflow: hidden; min-height: 200px; cursor: pointer;"
                     @click="$router.push('/new_service')">
                    <div :style="{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        filter: 'brightness(0.9)'
                    }"></div>
                    <div class="card-body text-white d-flex flex-column justify-content-center"
                         style="position: relative; z-index: 1;">
                        <h5 class="card-title text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" 
                                 class="bi bi-plus-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 0 0 8 0a8 8 0 0 0 0 16"/>
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                            </svg>
                        </h5>
                        <h3 class="text-center">Add New Service</h3>
                        <p class="text-center">Click to create a new service</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Approved Employees Section -->
        <h4 class="mt-5">Approved Employees</h4>
        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="employee in employees" :key="employee.emp_id">
                <div class="card h-100" style="position: relative; overflow: hidden; min-height: 200px;">
                    <div :style="{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(/static/images/employee_profile.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'brightness(0.9)'
                    }"></div>
                    <div class="card-body text-white d-flex flex-column justify-content-center"
                         style="position: relative; z-index: 1; background-color: rgba(0, 0, 0, 0.3);">
                        <h5 class="card-title text-center">{{ employee.name }}</h5>
                        <p class="card-text text-center">
                            <strong>Employee ID:</strong> {{ employee.emp_id }}<br>
                            <strong>Service Type:</strong> {{ employee.service }}
                        </p>
                        <div class="d-flex justify-content-center gap-2">
                            <button class="btn btn-primary" 
                                    @click="ProfileDetails(employee.emp_id)"
                                    :disabled="processingProfile">
                                {{ processingProfile ? 'Loading...' : 'Profile Details' }}
                            </button>
                            <button class="btn btn-success" 
                                    @click="exportReport(employee.emp_id)"
                                    :disabled="exporting[employee.emp_id]">
                                {{ exporting[employee.emp_id] ? 'Exporting...' : 'See Report' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Waitlisted Employees Section -->
        <h4 class="mt-5">Waitlisted Employees</h4>
        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="employee in waitlisted_employees" :key="employee.emp_id">
                <div class="card h-100" style="position: relative; overflow: hidden; min-height: 200px;">
                    <div :style="{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(/static/images/employee_profile.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'brightness(0.9)'
                    }"></div>
                    <div class="card-body text-white d-flex flex-column justify-content-center"
                         style="position: relative; z-index: 1; background-color: rgba(0, 0, 0, 0.3);">
                        <h5 class="card-title text-center">{{ employee.name }}</h5>
                        <p class="card-text text-center">
                            <strong>Employee ID:</strong> {{ employee.emp_id }}<br>
                            <strong>Service Type:</strong> {{ employee.service }}
                        </p>
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-warning" 
                                    @click="reviewEmployee(employee.emp_id)"
                                    :disabled="processingReview">
                                {{ processingReview ? 'Loading...' : 'Review Profile' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Section -->
        <h4 class="mt-5">Users</h4>
        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="user in users" :key="user.id">
                <div class="card h-100" style="position: relative; overflow: hidden; min-height: 200px;">
                    <div :style="{
                        position: 'absolute',
                        top: '0',
                        left: '25%',
                        width: '50%',
                        height: '100%',
                        backgroundImage: 'url(/static/images/user_profile.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'brightness(0.9)'
                    }"></div>
                    <div class="card-body text-white d-flex flex-column justify-content-center"
                         style="position: relative; z-index: 1; background-color: rgba(0, 0, 0, 0.3);">
                        <h5 class="card-title text-center">{{ user.name }}</h5>
                        <p class="card-text text-center">
                            <strong>User ID:</strong> {{ user.id }}<br>
                            <strong>Status:</strong>
                            <span v-if="user.active" class="badge bg-success">Active</span>
                            <span v-else class="badge bg-danger">Inactive</span>
                        </p>
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-primary" 
                                    @click="UserDetails(user.id)"
                                    :disabled="processingUser">
                                {{ processingUser ? 'Loading...' : 'User Details' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    components: { nav_admin },
    data() {
        return {
            services: [],
            employees: [],
            users: [],
            waitlisted_employees: [],
            loading: true,
            errorMessage: "",
            processingReview: false,
            processingProfile: false,
            processingService: false,
            processingUser: false,
            searchQuery: '',
            searching: false,
            originalData: null,
            exporting: {}, // Track export status per employee
            taskIds: {}   // Store task IDs per employee
        };
    },
    async created() {
        await this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                console.log(localStorage.getItem('authToken'));
                const response = await fetch("/admin_dashboard", {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to load data');
                }

                const data = await response.json();
                [this.services, this.employees, this.waitlisted_employees, this.users] = data;
                this.originalData = JSON.parse(JSON.stringify(data));

            } catch (error) {
                this.errorMessage = error.message;
                console.error("Fetch error:", error);
            } finally {
                this.loading = false;
            }
        },
        async performSearch() {
            if (!this.searchQuery.trim()) {
                this.resetData();
                return;
            }

            this.searching = true;
            try {
                const response = await fetch(`/admin_search?q=${encodeURIComponent(this.searchQuery)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Search failed');
                }

                const data = await response.json();
                [this.services, this.employees, this.waitlisted_employees, this.users] = data;

            } catch (error) {
                this.errorMessage = error.message;
                console.error("Search error:", error);
            } finally {
                this.searching = false;
            }
        },
        clearSearch() {
            this.searchQuery = '';
            this.resetData();
        },
        resetData() {
            if (this.originalData) {
                [this.services, this.employees, this.waitlisted_employees, this.users] = JSON.parse(JSON.stringify(this.originalData));
            }
        },
        async reviewEmployee(empId) {
            this.processingReview = true;
            try {
                await this.$router.push(`/review_profile/${empId}`);
            } catch (error) {
                console.error("Navigation error:", error);
                this.errorMessage = "Failed to navigate to profile";
            } finally {
                this.processingReview = false;
            }
        },
        async ProfileDetails(empId) {
            this.processingProfile = true;
            try {
                await this.$router.push(`/profile_details/${empId}`);
            } catch (error) {
                console.error("Navigation error:", error);
                this.errorMessage = "Failed to navigate to profile";
            } finally {
                this.processingProfile = false;
            }
        },
        async ServiceDetails(id) {
            this.processingService = true;
            try {
                await this.$router.push(`/service_details/${id}`);
            } catch (error) {
                console.error("Navigation error:", error);
                this.errorMessage = "Failed to navigate to service";
            } finally {
                this.processingService = false;
            }
        },
        async UserDetails(id) {
            this.processingUser = true;
            try {
                await this.$router.push(`/user_details/${id}`);
            } catch (error) {
                console.error("Navigation error:", error);
                this.errorMessage = "Failed to navigate to user";
            } finally {
                this.processingUser = false;
            }
        },
        async exportReport(empId) {
            this.$set(this.exporting, empId, true);
            try {
                // Trigger the export
                const response = await fetch(`/api/export/${empId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to initiate export');
                }
                const data = await response.json();
                const taskId = data.task_id;

                // Store task ID
                this.$set(this.taskIds, empId, taskId);

                // Poll for result
                await this.pollForResult(empId, taskId);
            } catch (error) {
                this.errorMessage = error.message;
                console.error("Export error:", error);
                this.$set(this.exporting, empId, false); // Reset on error
            }
        },
        async pollForResult(empId, taskId) {
            const checkResult = async () => {
                try {
                    const response = await fetch(`/api/csv_result/${taskId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
        
                    const contentType = response.headers.get('content-type');
                    console.log('Response status:', response.status, 'Content-Type:', contentType); // Debug
        
                    if (contentType?.includes('text/csv')) {
                        // Handle file download
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                        link.download = `closed_services_employee_${empId}_${dateStr}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
        
                        this.$set(this.exporting, empId, false);
                        this.$delete(this.taskIds, empId);
                        clearInterval(interval);
                    } else if (contentType?.includes('application/json')) {
                        const data = await response.json();
                        if (data.error) {
                            this.errorMessage = data.error;
                            this.$set(this.exporting, empId, false);
                            this.$delete(this.taskIds, empId);
                            clearInterval(interval);
                        } else if (!data.ready) {
                            console.log('Task not ready yet:', data); // Debug
                            return; // Continue polling
                        }
                    } else {
                        // Unexpected response (e.g., HTML)
                        const text = await response.text();
                        console.error('Unexpected response:', text);
                        this.errorMessage = 'Received an unexpected server response';
                        this.$set(this.exporting, empId, false);
                        this.$delete(this.taskIds, empId);
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                    this.errorMessage = "Failed to fetch report status: " + error.message;
                    this.$set(this.exporting, empId, false);
                    this.$delete(this.taskIds, empId);
                    clearInterval(interval);
                }
            };
        
            const interval = setInterval(checkResult, 2000);
        }
    }
};