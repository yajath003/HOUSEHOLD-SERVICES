import nav_user from '../nav_user.js';

export default {
  template: `
    <div class="container text-center my-5">
      <nav_user />
      <h3 class="mb-4">User Dashboard Summary</h3>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Booking Status</h5>
              <div style="width: 100%; height: 250px;">
                <canvas ref="bookingStatusChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Spending by Service</h5>
              <div style="width: 100%; height: 250px;">
                <canvas ref="spendingChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Booking Trends (Last 30 Days)</h5>
              <div style="width: 100%; height: 300px;">
                <canvas ref="bookingTrendChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Quick Statistics</h5>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Bookings</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>All Bookings</td>
                <td>{{ summaryData.totalBookings || 0 }}</td>
                <td>₹{{ summaryData.totalSpent || 0 }}</td>
              </tr>
            </tbody>
          </table>
          <h5 class="mt-4 mb-3">Booking Status Breakdown</h5>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(count, status) in summaryData.statusCounts" :key="status">
                <td>{{ status }}</td>
                <td>{{ count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  components: { nav_user },
  data() {
    return {
      summaryData: {
        totalBookings: 0,
        totalSpent: 0,
        statusCounts: {},
        bookings: [],
        services: []
      },
      chartInstances: {}
    };
  },
  async mounted() {
    if (!window.Chart) {
      console.error('Chart.js is not available. Please ensure it is included in your project.');
      return;
    }
    await this.fetchSummaryData();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    this.destroyCharts();
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async fetchSummaryData() {
      try {
        const response = await fetch('/user_summary', {
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched summary data:', data); // Debug: Check the data structure
        this.summaryData = {
          totalBookings: data.totalBookings || 0,
          totalSpent: data.totalSpent || 0,
          statusCounts: data.statusCounts || {},
          bookings: data.bookings || [],
          services: data.services || []
        };
        this.updateCharts();
      } catch (error) {
        console.error('Error fetching summary data:', error);
        // Fallback data to ensure charts render even with no data
        this.summaryData = {
          totalBookings: 0,
          totalSpent: 0,
          statusCounts: { 'Pending': 0, 'Completed': 0, 'Closed': 0 },
          bookings: [],
          services: []
        };
        this.updateCharts();
      }
    },
    destroyCharts() {
      Object.values(this.chartInstances).forEach(chart => {
        if (chart) chart.destroy();
      });
      this.chartInstances = {};
    },
    updateCharts() {
      console.log('Updating charts with summaryData:', this.summaryData); // Debug: Check data before rendering

      this.destroyCharts();

      const charts = [
        {
          ref: 'bookingStatusChart',
          category: 'BookingStatus',
          type: 'pie',
          dataFn: () => {
            const statusCounts = this.summaryData.statusCounts;
            console.log('Booking Status Data:', statusCounts); // Debug
            return {
              labels: Object.keys(statusCounts).length ? Object.keys(statusCounts) : ['No Data'],
              datasets: [{
                data: Object.keys(statusCounts).length ? Object.values(statusCounts) : [1],
                backgroundColor: Object.keys(statusCounts).length
                  ? ['#4e73df', '#1cc88a', '#36b9cc', '#e74a3b']
                  : ['#d3d3d3'],
                hoverBackgroundColor: Object.keys(statusCounts).length
                  ? ['#2e59d9', '#17a673', '#2c9faf', '#d62c1a']
                  : ['#a9a9a9'],
                borderWidth: 2,
                borderColor: '#fff'
              }]
            };
          }
        },
        {
          ref: 'spendingChart',
          category: 'Spending',
          type: 'pie',
          dataFn: () => {
            const spending = this.summaryData.bookings.reduce((acc, booking) => {
              const serviceName = booking.service.name;
              acc[serviceName] = (acc[serviceName] || 0) + (booking.service.price || 0);
              return acc;
            }, {});
            console.log('Spending Data:', spending); // Debug
            return {
              labels: Object.keys(spending).length ? Object.keys(spending) : ['No Spending'],
              datasets: [{
                data: Object.keys(spending).length ? Object.values(spending) : [1],
                backgroundColor: Object.keys(spending).length
                  ? ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
                  : ['#d3d3d3'],
                hoverBackgroundColor: Object.keys(spending).length
                  ? ['#2e59d9', '#17a673', '#2c9faf', '#f4b619', '#d62c1a']
                  : ['#a9a9a9'],
                borderWidth: 2,
                borderColor: '#fff'
              }]
            };
          }
        },
        {
          ref: 'bookingTrendChart',
          category: 'BookingTrend',
          type: 'bar',
          dataFn: () => {
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);
            const bookingsByDate = this.summaryData.bookings.reduce((acc, booking) => {
              const date = new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              if (new Date(booking.date) >= last30Days) {
                acc[date] = (acc[date] || 0) + 1;
              }
              return acc;
            }, {});
            console.log('Booking Trend Data:', bookingsByDate); // Debug
            return {
              labels: Object.keys(bookingsByDate).length ? Object.keys(bookingsByDate) : ['No Data'],
              datasets: [{
                label: 'Bookings',
                data: Object.keys(bookingsByDate).length ? Object.values(bookingsByDate) : [0],
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                borderWidth: 1
              }]
            };
          }
        }
      ];

      charts.forEach(chart => {
        const canvas = this.$refs[chart.ref];
        if (!canvas) {
          console.error(`Canvas ref "${chart.ref}" not found.`);
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error(`Failed to get 2D context for "${chart.ref}".`);
          return;
        }

        this.chartInstances[chart.category] = new window.Chart(ctx, {
          type: chart.type,
          data: chart.dataFn(),
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            },
            layout: {
              padding: 20
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: { boxWidth: 12 }
              },
              tooltip: { enabled: true }
            },
            ...(chart.type === 'bar' ? {
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Number of Bookings' }
                },
                x: {
                  title: { display: true, text: 'Date' }
                }
              }
            } : {})
          }
        });
      });
    },
    handleResize() {
      Object.values(this.chartInstances).forEach(chart => {
        if (chart) chart.resize();
      });
    }
  }
};