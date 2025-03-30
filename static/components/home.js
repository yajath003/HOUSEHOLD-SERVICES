import navbar from './navbar.js';

export default {
  template: `
    <div class="main-container">
      <navbar />
      
      <div class="container text-center my-5 welcome-section">
        <h1 class="welcome-title mb-4">Welcome to EliteHome Services</h1>
        <p class="welcome-text lead mb-4">Experience premium home care solutions tailored to your needs</p>
        <div class="d-flex justify-content-center gap-3">
          <a class="btn btn-primary px-5 py-3 rounded-4 shadow-sm" 
             href="/signin">
            Get Started
          </a>
          <a class="btn btn-outline-primary px-5 py-3 rounded-4 shadow-sm" 
             href="/register">
            Learn More
          </a>
        </div>
      </div>
    </div>
  `,
  components: {
    navbar
  },
  style: `
    .main-container {
      background: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7)),
                  url('https://source.unsplash.com/1600x900/?luxury-interior') no-repeat center center/cover;
      min-height: 100vh;
      padding: 20px 20px 40px; /* Normal padding */
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 80px; /* Added margin-top to push content down */
    }

    .welcome-section {
      background: rgba(255, 255, 255, 0.98);
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
      max-width: 800px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      backdrop-filter: blur(8px);
      margin-top: 20px; /* Ensures spacing below the navbar */
    }

    .welcome-title {
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 2.75rem;
      color: #1a365d;
      letter-spacing: -0.75px;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .welcome-text {
      font-family: 'Inter', sans-serif;
      font-size: 1.15rem;
      color: #4a5568;
      line-height: 1.7;
      max-width: 600px;
      margin: 0 auto 2rem;
    }

    .btn-primary {
      background-color: #3B82F6;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
    }

    .btn-primary:hover {
      background-color: #2563EB;
      transform: translateY(-2px);
    }

    .btn-outline-primary {
      border-color: #3B82F6;
      color: #3B82F6;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
    }

    .btn-outline-primary:hover {
      background-color: #3B82F6;
      color: white;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .main-container {
        margin-top: 100px; /* Increase top margin for mobile */
        padding: 20px 15px 30px;
      }
      
      .welcome-section {
        margin-top: 30px;
        padding: 1.5rem;
      }
      
      .welcome-title {
        font-size: 2rem;
      }
      
      .welcome-text {
        font-size: 1rem;
      }
      
      .btn {
        width: 100%;
        padding: 0.75rem !important;
      }
    }
  `
};
