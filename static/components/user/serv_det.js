import nav_user from '../nav_user.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_user />
        
        <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-if="service" class="card mx-auto" style="max-width: 800px;">
            <div class="card-header bg-primary text-white">
                <h4>{{ service.name }}</h4>
            </div>
            <div class="card-body text-start">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label"><strong>Service Name</strong></label>
                            <p class="form-control-static">{{ service.name }}</p>
                        </div>
                        <div class="mb-3">
                            <label class="form-label"><strong>Description</strong></label>
                            <p class="form-control-static">{{ service.description }}</p>
                        </div>
                        <div class="mb-3">
                            <label class="form-label"><strong>Price</strong></label>
                            <p class="form-control-static">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                     class="bi bi-currency-rupee" viewBox="0 0 16 16">
                                    <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"/>
                                </svg>
                                {{ service.price }}
                            </p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            
                            <div class="image-preview mb-3">
                                <img :src="'/static/images/' + service.image" 
                                     class="img-fluid rounded" 
                                     style="max-height: 200px;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" 
                            class="btn btn-secondary" 
                            @click="$router.go(-1)">
                        Back
                    </button>
                    <button class="btn btn-success" 
                            @click="bookService"
                            :disabled="processing">
                        {{ processing ? 'Processing...' : 'Book Now' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    components: { nav_user },
    data() {
        return {
            service: null,
            loading: true,
            processing: false,
            error: null
        };
    },
    async created() {
        await this.loadServiceData();
    },
    methods: {
        async loadServiceData() {
            const serviceId = this.$route.params.id;
            try {
                const response = await fetch(`/serv_det/${serviceId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch service data');
                }

                this.service = await response.json();
            } catch (error) {
                this.error = error.message;
                console.error('Service load error:', error);
            } finally {
                this.loading = false;
            }
        },
        async bookService() {
            this.processing = true;
            try {
                const response = await fetch('/bookings', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json', // Add this line
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        service_id: this.service.id
                    })
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Booking failed');
                }
        
                const data = await response.json();
                alert('Service Booked successfully!');
                this.$router.go(-1);
        
            } catch (error) {
                this.error = error.message;
                console.error('Booking error:', error);
            } finally {
                this.processing = false;
            }
        }
    }
};