import router from './routes.js'

new Vue({
    el: '#app',
    template: `
    <div>
    <router-view/>
</div>
    `,
    router,
    data(){
        return {
            userRole: localStorage.getItem('role')
        };
    }
});