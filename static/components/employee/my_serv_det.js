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
                                <p v-if="booking.user_details.city || booking.user_details.state">
                                    {{ booking.user_details.city }}, {{ booking.user_details.state }}
                                </p>
                                <p v-if="booking.user_details.pin">
                                    PIN: {{ booking.user_details.pin }}
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
                        
                        <div class="mb-3" v-if="booking.date_of_completion">
                            <label class="form-label"><strong>Completion Date:</strong></label>
                            <p class="form-control-static">{{ new Date(booking.date_of_completion).toLocaleDateString() }}</p>
                        </div>
                    </div>
                </div>
                
                <div v-if="booking.status === 'Pending'" class="d-flex justify-content-between mt-4">
                    <button class="btn btn-success" @click="updateStatus('Accepted')" :disabled="processing">
                        Accept Request
                    </button>
                </div>
                
                <div v-if="booking.status === 'Accepted'" class="text-center mt-4">
                    <button class="btn btn-primary" @click="completeService" :disabled="processing">
                        {{ processing ? 'Completing...' : 'Mark as Completed' }}
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
            const bookingId = this.$route.params.id;
            try {
                const response = await fetch(`/my_serv_det/${bookingId}`, {
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
            try {
                const response = await fetch(`/bookings/${this.booking.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });
                if (!response.ok) throw new Error(response.statusText);
                this.booking.status = status;
                alert('Status updated successfully!');
                await this.fetchBookingDetails();
            } catch (error) {
                this.error = error.message;
                alert(error.message);
            } finally {
                this.processing = false;
            }
        },
        async completeService() {
            this.processing = true;
            try {
                const response = await fetch(`/bookings/${this.booking.id}/complete`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to complete service');
                }
                const updatedData = await response.json();
                this.booking.status = 'Closed';
                this.booking.date_of_completion = updatedData.date_of_completion;
                alert('Service marked as completed successfully!');
            } catch (error) {
                this.error = error.message;
                alert(error.message);
            } finally {
                this.processing = false;
            }
}
    }
};