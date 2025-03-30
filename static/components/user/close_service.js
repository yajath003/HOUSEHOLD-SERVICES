import nav_user from '../nav_user.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_user />
        
        <div class="card mx-auto" style="max-width: 600px;">
            <div class="card-header bg-success text-white">
                <h4>Service Completion</h4>
            </div>
            <div class="card-body">
                <div v-if="loading" class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                
                <div v-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <div v-if="booking" class="rating-form">
                    <h5 class="mb-4">How would you rate this service?</h5>
                    
                    <div class="star-rating mb-4">
                        <button 
                            v-for="star in 5" 
                            :key="star"
                            @click="setRating(star)"
                            class="btn btn-star"
                            :class="{
                                'text-warning': star <= currentRating,
                                'text-muted': star > currentRating
                            }"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" 
                                 class="bi bi-star-fill" viewBox="0 0 16 16">
                                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                            </svg>
                        </button>
                    </div>

                    <div class="mb-4">
                        <label class="form-label">Additional Comments</label>
                        <textarea 
                            v-model="comments"
                            class="form-control"
                            rows="4"
                            placeholder="Share your experience..."
                        ></textarea>
                    </div>

                    <button 
                        @click="submitRating"
                        :disabled="processing || !currentRating"
                        class="btn btn-success btn-lg"
                    >
                        {{ processing ? 'Submitting...' : 'Submit Rating' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    components: { nav_user },
    data() {
        return {
            booking: null,
            currentRating: 0,
            comments: '',
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
            const bookingId = this.$route.query.bookingId;
            if (!bookingId) {
                this.error = 'No booking specified';
                this.loading = false;
                return;
            }

            try {
                const response = await fetch(`/bookings/${bookingId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch booking details');
                }

                this.booking = await response.json();
            } catch (error) {
                this.error = error.message;
                console.error('Loading error:', error);
            } finally {
                this.loading = false;
            }
        },
        setRating(rating) {
            this.currentRating = rating;
        },
        async submitRating() {
            this.processing = true;
            this.error = null;

            try {
                const response = await fetch(`/ratings/${this.booking.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        rating: this.currentRating,
                        comments: this.comments
                    })
                });

                const contentType = response.headers.get('content-type');
                const data = contentType?.includes('application/json') 
                    ? await response.json()
                    : null;

                if (!response.ok) {
                    throw new Error(data?.error || `HTTP error! status: ${response.status}`);
                }

                alert('Thank you for your feedback!');
                this.$router.push('/user_dashboard');
            } catch (error) {
                this.error = error.message;
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    this.error = 'Network error - please check your connection';
                }
                console.error('Rating submission error:', error);
            } finally {
                this.processing = false;
            }
        }
    }
};