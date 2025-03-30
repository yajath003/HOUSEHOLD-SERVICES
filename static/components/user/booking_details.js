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

        <div v-if="booking" class="card mx-auto" style="max-width: 800px;">
            <div class="card-header bg-primary text-white">
                <h4>{{ booking.service.name }}</h4>
            </div>
            <div class="card-body text-start">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label"><strong>Booking Status</strong></label>
                            <p class="form-control-static">{{ booking.status }}</p>
                        </div>
                        <div class="mb-3">
                            <label class="form-label"><strong>Service Description</strong></label>
                            <p class="form-control-static">{{ booking.service.description }}</p>
                        </div>
                        <div class="mb-3">
                            <label class="form-label"><strong>Price</strong></label>
                            <p class="form-control-static">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                     class="bi bi-currency-rupee" viewBox="0 0 16 16">
                                    <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"/>
                                </svg>
                                {{ booking.service.price }}
                            </p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <div class="image-preview mb-3">
                                <img :src="'/static/images/' + booking.service.image" 
                                     class="img-fluid rounded" 
                                     style="max-height: 200px;">
                            </div>
                            <!-- Corrected Rating Display Section -->
                            <div v-if="booking.status === 'Closed' && booking.rating" class="rating-display mt-3">
                                <h5>Service Rating:</h5>
                                <div class="d-flex align-items-center justify-content-center">
                                    <div class="star-rating">
                                        <svg v-for="star in 5" :key="star" 
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                                            fill="currentColor" class="bi me-1"
                                            :class="star <= booking.rating.stars ? 'bi-star-fill text-warning' : 'bi-star text-secondary'">
                                            <path v-if="star <= booking.rating.stars" 
                                                d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                                            <path v-else 
                                                d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
                                        </svg>
                                    </div>
                                    <span class="ms-2 badge bg-primary">
                                        {{ booking.rating.stars }} / 5
                                    </span>
                                </div>
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
                    
                    <template v-if="booking.status !== 'Closed'">
                        <button class="btn btn-danger" 
                                @click="deleteBooking"
                                :disabled="processing || !booking">
                            {{ processing ? 'Processing...' : 'Delete Request' }}
                        </button>
                        
                        <button v-if="booking.status === 'Completed'" 
                                class="btn btn-success"
                                @click="redirectToCloseService"
                                :disabled="processing">
                            Close Service
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </div>
    `,
    components: { nav_user },
    data() {
        return {
            booking: null,
            loading: true,
            processing: false,
            error: null
        };
    },
    async created() {
        await this.loadBookingData();
    },
    methods: {
        async loadBookingData() {
            const bookingId = this.$route.params.id;
            try {
                const response = await fetch(`/bookings/${bookingId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    let errorMessage = 'Failed to fetch booking data';
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } else {
                        errorMessage = await response.text() || errorMessage;
                    }
                    throw new Error(errorMessage);
                }

                this.booking = await response.json();
                // Ensure rating is a number
                if (this.booking.rating) {
                    this.booking.rating.stars = Number(this.booking.rating.stars);
                }
            } catch (error) {
                this.error = error.message;
                console.error('Booking load error:', error);
            } finally {
                this.loading = false;
            }
        },
        redirectToCloseService() {
            this.$router.push({ path: `/close_service/${this.bookingId}`, query: { bookingId: this.booking.id } });
        },
        async deleteBooking() {
            if (!this.booking) {
                this.error = 'No booking data available';
                return;
            }

            this.processing = true;
            try {
                const response = await fetch(`/bookings/${this.booking.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                let data = {};
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                }

                if (!response.ok) {
                    let errorMessage = data.error || 'Deletion failed';
                    if (response.status === 405) {
                        errorMessage = 'Delete action not allowed by server';
                    }
                    throw new Error(errorMessage);
                }

                alert('Booking deleted successfully!');
                await this.$router.go(-1);
            } catch (error) {
                this.error = error.message;
                console.error('Delete error:', error);
                alert(error.message);
            } finally {
                this.processing = false;
            }
        }
    }
};