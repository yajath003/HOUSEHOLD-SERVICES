import nav_admin from '../nav_admin.js'
export default {
    template:
    `<div class="container text-center my-5">
            <nav_admin />
            <form @submit.prevent="AddService">
                <label for="service_name" class="form-label">Service Name</label>
                <input type="text" class="form-control" v-model="service_name" id="service_name" required>

                <label for="description" class="form-label">Description</label>
                <input type="text" class="form-control" v-model="description" id="description" required>

                <label for="price" class="form-label">Price</label>
                <input type="number" class="form-control" v-model="price" id="price" required min="0.01" step="0.01">
                
                <label for="type" class="form-label">Type</label>
                <input type="text" class="form-control" v-model="type" id="type" required>
                
                 <label for="image" class="form-label">Upload any Image</label>
                 <input type="file" class="form-control" ref="image" id="image" required>

                <button type="submit" class="btn btn-primary mt-3" :disabled="loading">
                    <span v-if="loading">Creating...</span>
                    <span v-else>Create</span>
                </button>

                <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
            </form>
        </div>`,
    components: {
        nav_admin
    },
    data() {
        return {
            service_name: "",
            description: "",
            price: "",
            type: "",
            loading: false,
            errorMessage: "",
            image: "",
            role: localStorage.getItem("userRole"),
            token: localStorage.getItem("authToken"),
        };
    },
    methods: {
        async AddService() {
            this.errorMessage = "";
            const formData = new FormData();
            formData.append("service_name", this.service_name);
            formData.append("description", this.description);
            formData.append("price", this.price);
            formData.append("type", this.type);
            formData.append("image", this.$refs.image.files[0])
            console.log(formData)
            this.loading = true;
            try {
                const response = await fetch("/new_service", {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Accept': 'application/json'
                    },
                    body: formData,
                });
                const data = await response.json();

                if (response.ok) {
                    alert("New service created successfully!!");
                    this.service_name = "";
                    this.description = "";
                    this.price = "";
                    this.type = "";
                    this.$router.push("/admin_dashboard");
                } else {
                    this.errorMessage = data.error || "An error occurred";
                }
            } catch (error) {
                console.error("Error:", error);
                this.errorMessage = "An unexpected error occurred. Please try again.";
            } finally {
                this.loading = false;
            }
        }
    }
};
