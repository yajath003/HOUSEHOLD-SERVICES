import nav_admin from '../nav_admin.js';

export default {
    template: `
    <div class="container text-center my-5">
        <nav_admin />
        <h3 class="mb-4">Admin Dashboard Summary</h3>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Employees</h5>
                        <div style="width: 100%; height: 250px;">
                            <canvas ref="employeesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Users</h5>
                        <div style="width: 100%; height: 250px;">
                            <canvas ref="usersChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Services</h5>
                        <div style="width: 100%; height: 250px;">
                            <canvas ref="servicesChart"></canvas>
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
                            <th>Total Count</th>
                            <th>Active</th>
                            <th>Inactive</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in summaryData" :key="index">
                            <td>{{ item.category }}</td>
                            <td>{{ item.total }}</td>
                            <td>{{ item.active }}</td>
                            <td>{{ item.inactive }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`,

    components: { nav_admin },

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
                const response = await fetch('/admin_summary');
                this.summaryData = await response.json();
                this.updateCharts();
            } catch (error) {
                console.error('Error fetching summary data:', error);
            }
        },

        destroyCharts() {
            Object.values(this.chartInstances).forEach(chart => {
                if (chart) {
                    chart.destroy();
                }
            });
            this.chartInstances = {};
        },

        updateCharts() {
            if (!window.Chart) {
                console.error('Chart.js is not loaded.');
                return;
            }

            this.destroyCharts(); // Ensure all old charts are destroyed

            const categories = ['Employees', 'Users', 'Services'];
            const refs = ['employeesChart', 'usersChart', 'servicesChart'];

            categories.forEach((category, index) => {
                const chartData = this.getChartData(category);
                if (!chartData) return;

                const canvas = this.$refs[refs[index]];
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                this.chartInstances[category] = new Chart(ctx, {
                    type: 'pie',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1000, // Only animate on initial render
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
                if (chart) {
                    chart.resize();
                }
            });
        },

        getChartData(category) {
            const item = this.summaryData.find(i => i.category === category);
            if (!item) return null;

            return {
                labels: ['Active', 'Inactive'],
                datasets: [{
                    data: [item.active, item.inactive],
                    backgroundColor: ['#4e73df', '#e74a3b'],
                    hoverBackgroundColor: ['#2e59d9', '#d62c1a'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            };
        }
    }
};