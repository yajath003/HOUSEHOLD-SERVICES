export default {
  template: `
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="/">
        <span style="color: #2A4B7C;">🏠 Household</span>
        <span style="color: #FFA500;">Services</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#userNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="userNav">
        <ul class="navbar-nav align-items-center">
          <li class="nav-item mx-2">
            <router-link class="nav-link text-dark" to="/user_dashboard">Home</router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link text-dark" to="/user_summary">Summary</router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link btn px-4 py-2 rounded-pill" 
              style="background-color: #4CAF50; border: none; color: white;"
              to="/">
              Logout
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>`
};