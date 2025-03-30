import nav_user from '../nav_user.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_user/>
        <!-- Search Bar -->
        <div class="row mt-4 mb-4">
            <div class="col-md-8 mx-auto">
                <div class="input-group">
                    <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Search services or my bookings..." 
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

        <!-- Available Services Section -->
        <h4 class="mt-4">Available Services</h4>
        <div v-if="loading" class="mt-3">Loading...</div>
        <div v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</div>

        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="service in services" :key="service.id">
                <div class="card h-100" :style="{
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '200px',
                    borderRadius: '15px',
                    border: 'none'
                }">
                    <div :style="{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(/static/images/' + service.image + ')',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.9)',
                        transform: 'scale(1)',
                        zIndex: '0',
                        transition: 'transform 0.3s ease'
                    }"></div>
                    <div :style="{
                        position: 'relative',
                        zIndex: '1',
                        background: 'rgba(0, 0, 0, 0.4)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '45px',
                        textAlign: 'center'
                    }">
                        <h5 :style="{
                            fontWeight: '600',
                            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
                        }">{{ service.name }}</h5>
                        <p :style="{ fontSize: '0.95rem' }">
                            <strong>Price:</strong>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                 class="bi bi-currency-rupee" viewBox="0 0 16 16">
                                <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"/>
                            </svg>
                            {{ service.price }}
                        </p>
                        <button class="btn btn-primary" 
                            @click="ServiceDetails(service.id)"
                            :disabled="processingService"
                            :style="{ marginTop: '10px' }">
                            {{ processingService ? 'Loading...' : 'View Details' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- My Booked Services Section -->
        <h4 class="mt-5 mb-4">My Services</h4>
        <div v-if="loadingMyServices" class="mt-3">Loading your bookings...</div>
        <div v-if="errorMyServices" class="text-danger mt-3">{{ errorMyServices }}</div>
        
        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="booking in myServices" :key="booking.id">
                <div class="card h-100" :style="{
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '200px',
                    borderRadius: '15px',
                    border: 'none'
                }">
                    <div :style="{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(/static/images/' + booking.service.image + ')',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.9)',
                        transform: 'scale(1)',
                        zIndex: '0',
                        transition: 'transform 0.3s ease'
                    }"></div>
                    <div :style="{
                        position: 'relative',
                        zIndex: '1',
                        background: 'rgba(0, 0, 0, 0.4)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '45px',
                        textAlign: 'center'
                    }">
                        <h5 :style="{
                            fontWeight: '600',
                            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
                        }">{{ booking.service.name }}</h5>
                        <p :style="{ fontSize: '0.95rem' }">
                            <strong>Status:</strong> {{ booking.status }}<br>
                            <strong>Booked on:</strong> {{ formatDate(booking.date) }}
                        </p>
                        <button class="btn btn-info" 
                            @click="BookingDetails(booking.id)"
                            :disabled="processingBooking"
                            :style="{ marginTop: '10px' }">
                            {{ processingBooking ? 'Loading...' : 'View Details' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

    components: { nav_user },

    data() {
        return {
            // Available Services Data
            services: [],
            loading: true,
            errorMessage: "",
            processingService: false,

            // My Services Data
            myServices: [],
            loadingMyServices: true,
            errorMyServices: "",
            processingBooking: false,

            // Search Data
            searchQuery: '',
            searching: false,
            originalServices: null,
            originalMyServices: null
        };
    },

    async created() {
        await this.fetchData();
        await this.fetchMyServices();
        // Store original data for reset
        this.originalServices = JSON.parse(JSON.stringify(this.services));
        this.originalMyServices = JSON.parse(JSON.stringify(this.myServices));
    },

    methods: {
        // Fetch available services
        async fetchData() {
            try {
                const response = await fetch("/user_dashboard", {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to load services');
                const data = await response.json();

                if (!Array.isArray(data)) throw new Error('Invalid data format');
                this.services = data;

            } catch (error) {
                this.errorMessage = error.message;
                console.error("Fetch error:", error);
            } finally {
                this.loading = false;
            }
        },

        // Fetch user's booked services
        async fetchMyServices() {
            try {
                const response = await fetch("/my_services", {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to load bookings');
                const data = await response.json();

                this.myServices = data;

            } catch (error) {
                this.errorMyServices = error.message;
                console.error("Booking fetch error:", error);
            } finally {
                this.loadingMyServices = false;
            }
        },

        // Search functionality
        async performSearch() {
            if (!this.searchQuery.trim()) {
                this.resetData();
                return;
            }

            this.searching = true;
            try {
                const response = await fetch(`/user_search?q=${encodeURIComponent(this.searchQuery)}`, {
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
                this.services = data.services;
                this.myServices = data.my_services;

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
            if (this.originalServices && this.originalMyServices) {
                this.services = JSON.parse(JSON.stringify(this.originalServices));
                this.myServices = JSON.parse(JSON.stringify(this.originalMyServices));
            }
        },

        // Format booking date
        formatDate(dateString) {
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        },

        // Navigate to service details
        ServiceDetails(id) {
            this.processingService = true;
            this.$router.push(`/serv_det/${id}`)
                .finally(() => this.processingService = false);
        },

        BookingDetails(id) {
            this.processingBooking = true;
            this.$router.push(`/booking_details/${id}`)
                .finally(() => this.processingBooking = false);
        }
    }
};