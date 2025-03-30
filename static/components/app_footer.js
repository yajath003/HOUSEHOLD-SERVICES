export default {
  template: `
    <footer class="footer mt-auto py-4 bg-dark text-white">
      <div class="container">
        <div class="row g-4">
          <div class="col-12 col-md-4">
            <h5 class="mb-3 text-primary">Household Services</h5>
            <p class="text-muted">Your trusted partner for premium home services. Connecting you with skilled professionals since 2024.</p>
          </div>
          
          <div class="col-12 col-md-4">
            <h5 class="mb-3 text-primary">Quick Links</h5>
            <ul class="list-unstyled">
              <li><a href="/#/about" class="text-white text-decoration-none">About Us</a></li>
              <li class="mt-2"><a href="/#/services" class="text-white text-decoration-none">Our Services</a></li>
              <li class="mt-2"><a href="/#/contact" class="text-white text-decoration-none">Contact</a></li>
              <li class="mt-2"><a href="/#/faq" class="text-white text-decoration-none">FAQ</a></li>
            </ul>
          </div>
          
          <div class="col-12 col-md-4">
            <h5 class="mb-3 text-primary">Contact Info</h5>
            <ul class="list-unstyled text-muted">
              <li><i class="bi bi-geo-alt me-2"></i>123 Service Street, City</li>
              <li class="mt-2"><i class="bi bi-phone me-2"></i>(555) 123-4567</li>
              <li class="mt-2"><i class="bi bi-envelope me-2"></i>info@householdservices.com</li>
            </ul>
            <div class="social-icons mt-3">
              <a href="#" class="text-white me-3"><i class="bi bi-facebook"></i></a>
              <a href="#" class="text-white me-3"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="text-white me-3"><i class="bi bi-instagram"></i></a>
              <a href="#" class="text-white"><i class="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
        <hr class="mt-4 border-secondary">
        <div class="row">
          <div class="col-12 text-center text-muted">
            <small>&copy; 2024 Household Services. All rights reserved.</small>
          </div>
        </div>
      </div>
    </footer>
  `,
  style: `
    .footer {
      border-top: 2px solid #2A4B7C;
      position: relative;
      z-index: 1000;
    }
    
    .footer a {
      transition: color 0.3s ease;
    }
    
    .footer a:hover {
      color: #FFA500 !important;
    }
    
    .social-icons i {
      font-size: 1.4rem;
      transition: color 0.3s ease;
    }
    
    .social-icons a:hover i {
      color: #FFA500 !important;
    }
  `
};