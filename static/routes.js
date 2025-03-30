import home from './components/home.js'
import register from './components/user/register.js'
import signin from './components/user/signin.js'
import navbar from './components/navbar.js'
import admin_dashboard from './components/admin/admin_dashboard.js'
import user_dashboard from './components/user/user_dashboard.js'
import employee_dashboard from './components/employee/employee_dashboard.js'
import new_service from './components/admin/new_service.js'
import nav_admin from './components/nav_admin.js'
import search from './components/admin/search.js'
import summary from './components/admin/summary.js'
import nav_employee from './components/nav_employee.js'
import emp_search from './components/employee/emp_search.js'
import emp_summary from './components/employee/emp_summary.js'
import nav_user from './components/nav_user.js'
import user_search from './components/user/user_search.js'
import user_summary from './components/user/user_summary.js'
import unflag_users from './components/admin/unflag_users.js'
import emp_profile from './components/employee/emp_profile.js'
import user_profile from './components/user/user_profile.js'
import review_profile from './components/admin/review_profile.js'
import profile_details from './components/admin/profile_details.js'
import servive_details from './components/admin/service_details.js'
import user_details from './components/admin/user_details.js'
import serv_det from './components/user/serv_det.js'
import booking_details from './components/user/booking_details.js'
import close_service from './components/user/close_service.js'
import emp_booking_details from './components/employee/emp_booking_details.js'
import my_serv_det from './components/employee/my_serv_det.js'
import app_footer from'./components/app_footer.js'
const routes = [
    {path: '/', component: home},
    {path: '/register', component: register},
    {path: '/signin', component: signin},
    {path: '/navbar', component: navbar},
    {path: '/admin_dashboard', component: admin_dashboard},
    {path: '/user_dashboard', component: user_dashboard},
    {path: '/employee_dashboard', component: employee_dashboard},
    {path: '/new_service', component: new_service},
    {path: '/nav_admin', component: nav_admin},
    {path: '/search', component: search},
    {path: '/summary', component: summary},
    {path: '/nav_employee', component: nav_employee},
    {path: '/emp_search', component: emp_search},
    {path: '/emp_summary', component: emp_summary},
    {path: '/nav_user', component: nav_user},
    {path: '/user_search', component: user_search},
    {path: '/user_summary', component: user_summary},
    {path: '/unflag_users', component: unflag_users},
    {path: '/emp_profile', component: emp_profile},
    {path: '/admin_dashboard', component: admin_dashboard, meta: { requiresAdmin: true }},
    {path: '/review_profile/:emp_id', component: review_profile, meta: { requiresAdmin: true }},
    {path: '/profile_details/:emp_id', component: profile_details, meta: {requiresAdmin: true}},
    {path: '/service_details/:id', component: servive_details, meta: { requiresAdmin: true}},
    {path: '/user_details/:id', component: user_details, meta: {requiresAdmin: true}},
    {path: '/serv_det/:id', component: serv_det},
    {path: '/booking_details/:id', component: booking_details},
    {path: '/close_service/:id', component: close_service},
    {path: '/emp_booking_details/:id', component: emp_booking_details},
    {path: '/my_serv_det/:id', component: my_serv_det},
    {path: '/app_footer', component: app_footer},
]
const router = new VueRouter({
    routes,
    mode: 'history'
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('authToken');
    const isAdmin = localStorage.getItem('userRole') === 'admin';

    if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!isAuthenticated || !isAdmin) {
            next('/signin');
            return;
        }
    }

    next();
});

export default router;