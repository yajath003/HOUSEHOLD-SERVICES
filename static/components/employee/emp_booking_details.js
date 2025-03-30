import nav_employee from '../nav_employee.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_employee />
        
        <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-if="booking" class="card mx-auto" style="max-width: 800px;">
            <div class="card-header bg-primary text-white">
                <h4>{{ booking.service.name }}</h4>
            </div>
            <div class="card-body text-start">
                <div class="row">
                    <div class="col-md-6">
                        <img :src="'/static/images/' + booking.service.image" 
                             class="img-fluid rounded mb-3" 
                             style="max-height: 200px;">
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label"><strong>Requested By:</strong></label>
                            <p class="form-control-static">User #{{ booking.u_id }}</p>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label"><strong>User Address:</strong></label>
                            <div class="form-control-static">
                                <p v-if="booking.user_details.address">{{ booking.user_details.address }}</p>
                                <p v-if="booking.user_details.pin">
                                    PIN Code: {{ booking.user_details.pin }}
                                </p>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>Status:</strong></label>
                            <span :class="{
                                'badge bg-warning': booking.status === 'Pending',
                                'badge bg-success': booking.status === 'Accepted',
                                'badge bg-secondary': booking.status === 'Closed'
                            }">{{ booking.status }}</span>
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label"><strong>Request Date:</strong></label>
                            <p class="form-control-static">{{ new Date(booking.date).toLocaleDateString() }}</p>
                        </div>
                    </div>
                </div>
                
                <div v-if="booking.status === 'Pending'" class="d-flex justify-content-between mt-4">
                    <button class="btn btn-success" @click="updateStatus('Accepted')" :disabled="processing">
                        Accept Request
                    </button>
                </div>
                
                <div class="text-end mt-3">
                    <button class="btn btn-secondary" @click="$router.go(-1)" :disabled="processing">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    components: { nav_employee },
    data() {
        return {
            booking: null,
            loading: true,
            error: null,
            processing: false
        };
    },
    async created() {
        await this.fetchBookingDetails();
    },
    methods: {
        async fetchBookingDetails() {
            this.error = null; // Clear previous errors before fetching
            const bookingId = this.$route.params.id;
            try {
                const response = await fetch(`/emp_request_details/${bookingId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch booking details');

                this.booking = await response.json();
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async updateStatus(status) {
            this.processing = true;
            this.error = null; // Clear previous errors
            try {
                const response = await fetch(`/bookings/${this.booking.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update status');
                }

                const result = await response.json();
                this.booking.status = status;
                alert(result.message || 'Status updated successfully!');
            } catch (error) {
                this.error = error.message;
                console.error('Update error:', error);
            } finally {
                this.processing = false;
            }
        }
    }
};
