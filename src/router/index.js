import { createRouter, createWebHashHistory } from "vue-router";
import ViewHome from "@src/views/ViewHome.vue";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: { name: "home" },
        },
        {
            path: "/inicio",
            name: "home",
            component: ViewHome,
        },
    ],
});

export default router;
