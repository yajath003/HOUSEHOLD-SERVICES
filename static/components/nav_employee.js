export default {
  template: `
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">
        <span style="color: #2A4B7C;">🏠 Household</span>
        <span style="color: #FFA500;">Services</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#empNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="empNav">
        <ul class="navbar-nav align-items-center">
          <li class="nav-item mx-2">
            <router-link class="nav-link text-dark" to="/employee_dashboard">Home</router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link text-dark" to="/emp_summary">Summary</router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link btn px-4 py-2 rounded-pill" 
              style="background-color: #2196F3; border: none; color: white;"
              to="/">
              Logout
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>`
};