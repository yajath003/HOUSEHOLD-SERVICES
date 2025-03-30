import nav_admin from '../nav_admin.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_admin />
<!--        <h3 class="mb-4">Employee Profile Details</h3>-->
        
        <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-if="employee" class="card mx-auto" style="max-width: 600px;">
            <div class="card-header bg-info text-white">
                <h4>{{ employee.name }}</h4>
            </div>
            <div class="card-body text-start">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <p><strong>Employee ID:</strong> {{ employee.emp_id }}</p>
                        <p><strong>Service Type:</strong> {{ employee.service }}</p>
                        <p><strong>Status:</strong> <span class="badge bg-success">Active</span></p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Email:</strong> {{ employee.email }}</p>
                        <p><strong>Experience:</strong> {{ employee.experience }} years</p>
                    </div>
                </div>
                <div class="mb-3">
                    <h5>Documents</h5>
                    <div v-if="employee.documents && employee.documents.length" class="document-preview">
                        <img v-for="(doc, index) in employee.documents" 
                             :key="index"
                             :src="'/static/uploads/' + doc" 
                             alt="Document"
                             class="img-thumbnail m-2"
                             style="max-width: 200px; cursor: pointer"
                             @click="openDocument(doc)">
                    </div>
                    <div v-else class="alert alert-warning">
                        No documents uploaded
                    </div>
                </div>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-secondary" 
                            @click="$router.go(-1)"
                            :disabled="processing">
                        Back
                    </button>
                    <button class="btn btn-warning" 
                            @click="moveToWaitlist"
                            :disabled="processing">
                        {{ processing ? 'Processing...' : 'Move to Waitlist' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    components: { nav_admin },
    data() {
        return {
            employee: null,
            loading: true,
            processing: false,
            error: null
        };
    },
    async created() {
        await this.loadEmployeeData();
    },
    methods: {
        async loadEmployeeData() {
            const empId = this.$route.params.emp_id;
            if (!empId) {
                this.error = "Invalid employee ID";
                this.loading = false;
                return;
            }

            try {
                const response = await fetch(`/get_employee/${empId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch employee data');
                }

                this.employee = await response.json();
            } catch (error) {
                this.error = error.message;
                console.error('Employee load error:', error);
            } finally {
                this.loading = false;
            }
        },
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        },
        openDocument(docPath) {
            window.open(`/static/uploads/${docPath}`, '_blank');
        },
        async moveToWaitlist() {
            if (!confirm('Are you sure you want to move this employee to waitlist?')) return;

            this.processing = true;
            try {
                const response = await fetch(`/deactivate_employee/${this.employee.emp_id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Operation failed');
                }

                alert('Employee moved to waitlist successfully!');
                this.$router.push('/admin_dashboard');
            } catch (error) {
                this.error = error.message;
                console.error('Operation error:', error);
            } finally {
                this.processing = false;
            }
        }
    }
};