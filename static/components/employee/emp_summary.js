import nav_employee from '../nav_employee.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_employee />
        <h3 class="mb-4">Employee Dashboard Summary</h3>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Service Earnings</h5>
                        <div style="width: 100%; height: 250px;">
                            <canvas ref="earningsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Booking Status</h5>
                        <div style="width: 100%; height: 250px;">
                            <canvas ref="bookingsChart"></canvas>
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
                            <th>Total Services</th>
                            <th>Earnings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Services</td>
                            <td>{{ summaryData[0]?.total || 0 }}</td>
                            <td>{{ summaryData[0]?.earnings || 0 }}</td>
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
                        <tr v-for="(count, status) in summaryData[1]?.counts" :key="status">
                            <td>{{ status }}</td>
                            <td>{{ count }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`,

    components: { nav_employee },

    data() {
        return {
            summaryData: [],
            chartInstances: {}
        };
    },

    async mounted() {
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
                const response = await fetch('/employee_summary');
                this.summaryData = await response.json();
                this.updateCharts();
            } catch (error) {
                console.error('Error fetching summary data:', error);
            }
        },

        destroyCharts() {
            Object.values(this.chartInstances).forEach(chart => {
                if (chart) chart.destroy();
            });
            this.chartInstances = {};
        },

        updateCharts() {
            if (!window.Chart) {
                console.error('Chart.js is not loaded.');
                return;
            }

            this.destroyCharts();

            const charts = [
                {
                    ref: 'earningsChart',
                    category: 'Earnings',
                    dataFn: () => ({
                        labels: ['Earnings', 'Potential'],
                        datasets: [{
                            data: [
                                this.summaryData[0]?.earnings || 0,
                                10000 - (this.summaryData[0]?.earnings || 0) // Example max earnings
                            ],
                            backgroundColor: ['#4e73df', '#ebedef'],
                            hoverBackgroundColor: ['#2e59d9', '#d1d3e2'],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    })
                },
                {
                    ref: 'bookingsChart',
                    category: 'Bookings',
                    dataFn: () => ({
                        labels: Object.keys(this.summaryData[1]?.counts || {}),
                        datasets: [{
                            data: Object.values(this.summaryData[1]?.counts || {}),
                            backgroundColor: [
                                '#4e73df', '#1cc88a', '#36b9cc', 
                                '#e74a3b', '#f6c23e'
                            ],
                            hoverBackgroundColor: [
                                '#2e59d9', '#17a673', '#2c9faf',
                                '#d62c1a', '#f4b619'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    })
                }
            ];

            charts.forEach(chart => {
                const canvas = this.$refs[chart.ref];
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                this.chartInstances[chart.category] = new Chart(ctx, {
                    type: 'pie',
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
                        }
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