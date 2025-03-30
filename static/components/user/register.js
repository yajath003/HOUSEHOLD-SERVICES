import navbar from '../navbar.js'

export default {
    template: `
        <div class="container text-center my-5">
            <navbar />
            <form @submit.prevent="registerUser">
                <label for="user_name" class="form-label">User Name</label>
                <input type="text" class="form-control" v-model="user_name" id="user_name" required>

                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" v-model="email" id="email" required>

                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" v-model="password" id="password" required>

                <label for="confirm_password" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" v-model="confirm_password" id="confirm_password" required>

                <label for="role" class="form-label">Role</label>
                <select class="form-control" v-model="formrole" id="role" required>
                    <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                </select>
                
                <div v-if="formrole === 'employee'">
                    <label for="service" class="form-label">Select Service</label>
                    <select class="form-control" v-model="service" id="service" required>
                        <option v-for="serviceOption in services" :key="serviceOption.id" :value="serviceOption.name">
                            {{ serviceOption.name }}
                        </option>
                    </select>
                    
                    <label for="experience" class="form-label">Experience</label>
                    <input type="number" class="form-control" v-model="experience" id="experience" required>
                    
                    <label for="proof" class="form-label">Upload any Proof</label>
                    <input type="file" class="form-control" ref="proof" id="proof" required>

                </div>
                
                <label for="address" class="form-label">Address</label>
                <input type="text" class="form-control" v-model="address" id="address" required>

                <label for="pin" class="form-label">Pincode</label>
                <input type="text" class="form-control" v-model="pin" id="pin" pattern="\\d{6}" title="Enter a valid 6-digit pincode" required>

                    
                <button type="submit" class="btn btn-primary mt-3" :disabled="loading">
                    <span v-if="loading">Registering...</span>
                    <span v-else>Register</span>
                </button>

                <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
            </form>
        </div>
    `,
    components: {
        navbar
    },
    data() {
        return {
            user_name: "",
            email: "",
            password: "",
            confirm_password: "",
            formrole: "",
            roles: ["employee", "user"],
            services: [],
            service: "",
            experience: "",
            proof: "",
            address: "",
            pin: "",
            loading: false,
            errorMessage: "",
        };
    },
    methods: {
        async fetchServices() {
            try {
                const response = await fetch("/services"); // Adjust endpoint if needed
                const data = await response.json();
                if (response.ok) {
                    this.services = data.services; // Expecting a JSON response like { services: [{ id, name }, ...] }
                } else {
                    console.error("Failed to load services:", data.error);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },
        async registerUser() {
            this.errorMessage = "";
            if (this.password !== this.confirm_password) {
                this.errorMessage = "Passwords do not match!";
                return;
            }

            const formData = new FormData();
            formData.append("name", this.user_name);
            formData.append("email", this.email);
            formData.append("password", this.password);
            formData.append("role", this.formrole);
            formData.append("service", this.service);
            formData.append("experience", this.experience);
            if (this.formrole == "employee") {
                formData.append("proof", this.$refs.proof.files[0]);
            }
            formData.append("address", this.address);
            formData.append("pin", this.pin);

            this.loading = true;

            try {
                const response = await fetch("/register", {
                    method: "POST",
                    body: formData,

                });

                const data = await response.json();
                if (response.ok) {
                    if (this.role=="employee"){
                        alert("Employee regestered. Wait until admin aproves you");
                    }
                    else{
                        alert("User registered successfully");
                    }
                    this.$router.push("/signin");
                } else {
                    this.errorMessage = data.error || "An error occurred";
                }
            } catch (error) {
                console.error("Registration error:", error);
                this.errorMessage = "An unexpected error occurred. Please try again.";
            } finally {
                this.loading = false;
            }
        }
    },
    created() {
        this.fetchServices();
    }
};
