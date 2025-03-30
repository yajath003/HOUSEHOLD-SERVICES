import nav_employee from '../nav_employee.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_employee />
        <!-- Search Bar -->
        <div class="row mt-4 mb-4">
            <div class="col-md-8 mx-auto">
                <div class="input-group">
                    <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Search service requests or my services..." 
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

        
        
        <div v-if="loading" class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <h2>Service Requests</h2>
        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="booking in bookings" :key="booking.id">
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
                            <strong>Status:</strong> 
                            <span :class="{
                                'badge bg-warning': booking.status === 'Pending',
                                'badge bg-success': booking.status === 'Accepted',
                                'badge bg-secondary': booking.status === 'Closed'
                            }">{{ booking.status }}</span>
                        </p>
                        <button class="btn btn-info" 
                            @click="viewDetails(booking.id)"
                            :disabled="processing"
                            :style="{ marginTop: '10px' }">
                            {{ processing ? 'Loading...' : 'View Details' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="bookings.length === 0 && !loading" class="alert alert-info">
            No service requests found for your expertise
        </div>

        <h2 class="mt-5">My Services</h2>
        <div class="row mt-3">
            <div class="col-md-4 mb-3" v-for="service in myServices" :key="service.id">
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
                        backgroundImage: 'url(/static/images/' + service.service.image + ')',
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
                        padding: '65px',
                        textAlign: 'center'
                    }">
                        <h5 :style="{
                            fontWeight: '600',
                            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
                        }">{{ service.service.name }}</h5>
                        <p :style="{ fontSize: '0.95rem' }">
                            <strong>Status:</strong> 
                            <span :class="{
                                'badge bg-success': service.status === 'Accepted',
                                'badge bg-secondary': service.status === 'Closed'
                            }">{{ service.status }}</span>
                        </p>
                        <p v-if="service.completion_date" :style="{ fontSize: '0.9rem' }">
                            <strong>Completed on:</strong><br>
                            {{ new Date(service.completion_date).toLocaleDateString() }}
                        </p>
                        <button class="btn btn-info mt-2" 
                            @click="viewServiceDetails(service.id)"
                            :disabled="processing">
                            {{ processing ? 'Loading...' : 'View Details' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="myServices.length === 0 && !loading" class="alert alert-info">
            No completed services found
        </div>
    </div>
    `,
    components: { nav_employee },
    data() {
        return {
            employee: null,
            bookings: [],
            myServices: [],
            loading: true,
            error: null,
            processing: false,
            searchQuery: '',
            searching: false,
            originalBookings: null,
            originalMyServices: null
        };
    },
    async created() {
        await this.fetchEmployeeData();
        if (this.employee) {
            await Promise.all([
                this.fetchBookings(),
                this.fetchMyServices()
            ]);
            // Store original data for reset
            this.originalBookings = JSON.parse(JSON.stringify(this.bookings));
            this.originalMyServices = JSON.parse(JSON.stringify(this.myServices));
        }
    },
    methods: {
        async fetchEmployeeData() {
            try {
                console.log(localStorage.getItem('authToken'));

                const response = await fetch('/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch employee data');
                this.employee = await response.json();
            } catch (error) {
                this.error = error.message;
                console.error('Employee fetch error:', error);
            }
        },
        async fetchBookings() {
            try {
                const response = await fetch('/emp_bookings', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch bookings');
                this.bookings = await response.json();
            } catch (error) {
                this.error = error.message;
                console.error('Bookings fetch error:', error);
            }
        },
        async fetchMyServices() {
            try {
                const response = await fetch('/emp_my_services', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch your services');
                this.myServices = await response.json();
            } catch (error) {
                console.error('My services fetch error:', error);
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
                const response = await fetch(`/emp_search?q=${encodeURIComponent(this.searchQuery)}`, {
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
                this.bookings = data.bookings;
                this.myServices = data.my_services;

            } catch (error) {
                this.error = error.message;
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
            if (this.originalBookings && this.originalMyServices) {
                this.bookings = JSON.parse(JSON.stringify(this.originalBookings));
                this.myServices = JSON.parse(JSON.stringify(this.originalMyServices));
            }
        },
        viewDetails(bookingId) {
            this.processing = true;
            this.$router.push(`/emp_booking_details/${bookingId}`)
                .finally(() => this.processing = false);
        },
        viewServiceDetails(serviceId) {
            this.processing = true;
            this.$router.push(`/my_serv_det/${serviceId}`)
                .finally(() => this.processing = false);
        }
    }
};