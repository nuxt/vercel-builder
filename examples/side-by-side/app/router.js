import Vue from "vue";
import Router from "vue-router";

const interopDefault = promise => () => promise.then(m => m.default || m);

// import MyPage from "~/pages/index";
const MyPage = interopDefault(
  import("~/pages/index" /* webpackChunkName: "pages/MyPage" */)
);

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: "history",
    routes: [
      {
        path: "/",
        component: MyPage
      }
    ]
  });
}
