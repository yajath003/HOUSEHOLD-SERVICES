import nav_admin from '../nav_admin.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_admin />
<!--        <h3 class="mb-4">Service Details</h3>-->
        
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
                <form @submit.prevent="saveChanges">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Service Name</label>
                                <input type="text" class="form-control" v-model="editForm.name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="editForm.description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Price (₹)</label>
                                <input type="number" class="form-control" v-model="editForm.price" step="0.01" min="0" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Service Image</label>
                                <div class="image-preview mb-3">
                                    <img :src="'/static/images/' + editForm.image" 
                                         class="img-fluid rounded" 
                                         style="max-height: 200px;">
                                </div>
                                <input type="file" 
                                       class="form-control" 
                                       accept="image/*"
                                       @change="handleImageUpload">
                                <small class="text-muted">Upload new image (JPEG/PNG)</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <button type="button" 
                                class="btn btn-secondary" 
                                @click="$router.go(-1)">
                            Back
                        </button>
                        <div>
                            <button type="submit" 
                                    class="btn btn-success me-2"
                                    :disabled="processing">
                                {{ processing ? 'Saving...' : 'Save Changes' }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
    components: { nav_admin },
    data() {
        return {
            service: null,
            editForm: {
                name: '',
                description: '',
                price: 0,
                image: ''
            },
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
                const response = await fetch(`/get_service/${serviceId}`, {
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
                this.editForm = { ...this.service };
            } catch (error) {
                this.error = error.message;
                console.error('Service load error:', error);
            } finally {
                this.loading = false;
            }
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file && this.validateImage(file)) {
                this.uploadImage(file);
            }
        },
        validateImage(file) {
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                this.error = 'Only JPEG/PNG images are allowed';
                return false;
            }
            if (file.size > 2 * 1024 * 1024) {
                this.error = 'Image size must be less than 2MB';
                return false;
            }
            return true;
        },
        async uploadImage(file) {
            this.processing = true;
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/upload_service_image', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Image upload failed');
                }

                const result = await response.json();
                this.editForm.image = result.filename;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.processing = false;
            }
        },
        async saveChanges() {
            this.processing = true;
            try {
                const response = await fetch(`/update_service/${this.service.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(this.editForm)
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Update failed');
                }
        
                alert('Service updated successfully!');
                await this.loadServiceData();
            } catch (error) {
                this.error = error.message;
                console.error('Update error:', error);
            } finally {
                this.processing = false;
            }
        }
        
    }
};