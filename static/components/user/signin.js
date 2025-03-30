import navbar from '../navbar.js';
export default {
    template: `
        <div class="container text-center my-5">
            <navbar />
            <form @submit.prevent="loginUser" method="post">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" v-model="email" id="email" required>

                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" v-model="password" id="password" required>

                <button type="submit" class="btn btn-primary mt-3" :disabled="loading">
                    <span v-if="loading">Logging in...</span>
                    <span v-else>Login</span>
                </button>

                <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
                <div v-if="successMessage" class="text-success mt-2">{{ successMessage }}</div>
            </form>
        </div>
    `,
    components: {
        navbar,
    },
    data() {
        return {
            email: "",
            password: "",
            loading: false,
            errorMessage: "",
            successMessage: "",
        };
    },
    methods: {
        async loginUser() {
            this.errorMessage = "";
            this.successMessage = "";
            this.loading = true;
            const payload = {
                email: this.email,
                password: this.password,
            };
            try {
                const response = await fetch("/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();
                if (response.ok) {
                    this.successMessage = "Login successful!";
                    alert("Welcome back!");
                    localStorage.setItem("authToken", data.token);
                    localStorage.setItem("userRole", data.role);
                    this.redirectToRolePage(data.role);
                } else {
            if (data.message === "Not Authorized by Admin") {
                alert("Your account is not authorized by the admin. Please contact support.");
                this.errorMessage = "Your account is not authorized. Please contact the admin.";
            } else if (response.status === 401) {
                this.errorMessage = "Invalid credentials. Please check your email and password.";
            } else {
                this.errorMessage = data.error || "An error occurred.";
            }
        }
            } catch (error) {
                console.error("Login error:", error);
                this.errorMessage = "An unexpected error occurred. Please try again.";
            } finally {
                this.loading = false;
            }
        },
        redirectToRolePage(role){
            if (role=="admin"){
                this.$router.push("/admin_dashboard");
            }
            else if(role=="user"){
                this.$router.push("/user_dashboard");
            }
            else if (role=="employee"){
                this.$router.push("/employee_dashboard");
            }
            else{
                this.$router.push("/");
            }
        }
    },
};
