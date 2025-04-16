import __nuxt_page_meta from "../pages/confirm.vue2.mjs";
import __nuxt_page_meta$1 from "../pages/profile.vue2.mjs";
import __nuxt_page_meta$2 from "../pages/admin/books.vue2.mjs";
import __nuxt_page_meta$3 from "../pages/admin/index.vue2.mjs";
import __nuxt_page_meta$4 from "../pages/admin/lessons.vue2.mjs";
import __nuxt_page_meta$5 from "../pages/admin/comments.vue2.mjs";
import __nuxt_page_meta$6 from "../pages/reset-password.vue2.mjs";
import __nuxt_page_meta$7 from "../pages/admin/ask-sheikh.vue2.mjs";
import __nuxt_page_meta$8 from "../pages/admin/categories.vue2.mjs";
import __nuxt_page_meta$9 from "../pages/admin/users/_id_.vue2.mjs";
import __nuxt_page_meta$a from "../pages/admin/users/index.vue2.mjs";
import __nuxt_page_meta$b from "../pages/admin/about-sheikh.vue2.mjs";
import __nuxt_page_meta$c from "../pages/admin/grading/index.vue2.mjs";
import __nuxt_page_meta$d from "../pages/admin/quizzes/index.vue2.mjs";
import __nuxt_page_meta$e from "../pages/admin/study-courses.vue2.mjs";
import __nuxt_page_meta$f from "../pages/admin/announcements/index.vue2.mjs";
import __nuxt_page_meta$g from "../pages/admin/grading/_attemptId_.vue2.mjs";
import __nuxt_page_meta$h from "../pages/admin/quizzes/_quizId_/questions.vue2.mjs";
function handleHotUpdate(_router, _generateRoutes) {
}
const _routes = [
  {
    name: "about",
    path: "/about",
    component: () => import("../pages/about.vue.mjs")
  },
  {
    name: "index",
    path: "/",
    component: () => import("../pages/index.vue.mjs")
  },
  {
    name: "login",
    path: "/login",
    component: () => import("../pages/login.vue.mjs")
  },
  {
    name: "signup",
    path: "/signup",
    component: () => import("../pages/signup.vue.mjs")
  },
  {
    name: "confirm",
    path: "/confirm",
    meta: __nuxt_page_meta || {},
    component: () => import("../pages/confirm.vue.mjs")
  },
  {
    name: "profile",
    path: "/profile",
    meta: __nuxt_page_meta$1 || {},
    component: () => import("../pages/profile.vue.mjs")
  },
  {
    name: "ask",
    path: "/ask",
    component: () => import("../pages/ask/index.vue.mjs")
  },
  {
    name: "books-id",
    path: "/books/:id()",
    component: () => import("../pages/books/_id_.vue.mjs")
  },
  {
    name: "admin-books",
    path: "/admin/books",
    meta: __nuxt_page_meta$2 || {},
    component: () => import("../pages/admin/books.vue.mjs")
  },
  {
    name: "admin",
    path: "/admin",
    meta: __nuxt_page_meta$3 || {},
    component: () => import("../pages/admin/index.vue.mjs")
  },
  {
    name: "books",
    path: "/books",
    component: () => import("../pages/books/index.vue.mjs")
  },
  {
    name: "leaderboard",
    path: "/leaderboard",
    component: () => import("../pages/leaderboard.vue.mjs")
  },
  {
    name: "study",
    path: "/study",
    component: () => import("../pages/study/index.vue.mjs")
  },
  {
    name: "lessons-id",
    path: "/lessons/:id()",
    component: () => import("../pages/lessons/_id_.vue.mjs")
  },
  {
    name: "quizzes-id",
    path: "/quizzes/:id()",
    component: () => import("../pages/quizzes/_id_.vue.mjs")
  },
  {
    name: "admin-lessons",
    path: "/admin/lessons",
    meta: __nuxt_page_meta$4 || {},
    component: () => import("../pages/admin/lessons.vue.mjs")
  },
  {
    name: "lessons",
    path: "/lessons",
    component: () => import("../pages/lessons/index.vue.mjs")
  },
  {
    name: "notifications",
    path: "/notifications",
    component: () => import("../pages/notifications.vue.mjs")
  },
  {
    name: "admin-comments",
    path: "/admin/comments",
    meta: __nuxt_page_meta$5 || {},
    component: () => import("../pages/admin/comments.vue.mjs")
  },
  {
    name: "admin-settings",
    path: "/admin/settings",
    component: () => import("../pages/admin/settings.vue.mjs")
  },
  {
    name: "reset-password",
    path: "/reset-password",
    meta: __nuxt_page_meta$6 || {},
    component: () => import("../pages/reset-password.vue.mjs")
  },
  {
    name: "forgot-password",
    path: "/forgot-password",
    component: () => import("../pages/forgot-password.vue.mjs")
  },
  {
    name: "admin-ask-sheikh",
    path: "/admin/ask-sheikh",
    meta: __nuxt_page_meta$7 || {},
    component: () => import("../pages/admin/ask-sheikh.vue.mjs")
  },
  {
    name: "admin-categories",
    path: "/admin/categories",
    meta: __nuxt_page_meta$8 || {},
    component: () => import("../pages/admin/categories.vue.mjs")
  },
  {
    name: "admin-users-id",
    path: "/admin/users/:id()",
    meta: __nuxt_page_meta$9 || {},
    component: () => import("../pages/admin/users/_id_.vue.mjs")
  },
  {
    name: "admin-users",
    path: "/admin/users",
    meta: __nuxt_page_meta$a || {},
    component: () => import("../pages/admin/users/index.vue.mjs")
  },
  {
    name: "admin-about-sheikh",
    path: "/admin/about-sheikh",
    meta: __nuxt_page_meta$b || {},
    component: () => import("../pages/admin/about-sheikh.vue.mjs")
  },
  {
    name: "admin-grading",
    path: "/admin/grading",
    meta: __nuxt_page_meta$c || {},
    component: () => import("../pages/admin/grading/index.vue.mjs")
  },
  {
    name: "admin-quizzes",
    path: "/admin/quizzes",
    meta: __nuxt_page_meta$d || {},
    component: () => import("../pages/admin/quizzes/index.vue.mjs")
  },
  {
    name: "admin-study-courses",
    path: "/admin/study-courses",
    meta: __nuxt_page_meta$e || {},
    component: () => import("../pages/admin/study-courses.vue.mjs")
  },
  {
    name: "admin-announcements",
    path: "/admin/announcements",
    meta: __nuxt_page_meta$f || {},
    component: () => import("../pages/admin/announcements/index.vue.mjs")
  },
  {
    name: "admin-grading-attemptId",
    path: "/admin/grading/:attemptId()",
    meta: __nuxt_page_meta$g || {},
    component: () => import("../pages/admin/grading/_attemptId_.vue.mjs")
  },
  {
    name: "study-courses-courseId",
    path: "/study/courses/:courseId()",
    component: () => import("../pages/study/courses/_courseId_/index.vue.mjs")
  },
  {
    name: "admin-quizzes-quizId-questions",
    path: "/admin/quizzes/:quizId()/questions",
    meta: __nuxt_page_meta$h || {},
    component: () => import("../pages/admin/quizzes/_quizId_/questions.vue.mjs")
  },
  {
    name: "study-courses-courseId-lessons-lessonId",
    path: "/study/courses/:courseId()/lessons/:lessonId()",
    component: () => import("../pages/study/courses/_courseId_/lessons/_lessonId_.vue.mjs")
  }
];
export {
  _routes as default,
  handleHotUpdate
};
//# sourceMappingURL=virtual_nuxt_D__programing_ibrahim-bashandy_.nuxt_routes.mjs.map
