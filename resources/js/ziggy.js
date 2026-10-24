const Ziggy = {
    url: "http:\/\/localhost:8000",
    port: 8000,
    defaults: {},
    routes: {
        "boost.browser-logs": {
            uri: "_boost\/browser-logs",
            methods: ["POST"],
        },
        "sanctum.csrf-cookie": {
            uri: "sanctum\/csrf-cookie",
            methods: ["GET", "HEAD"],
        },
        buy: { uri: "buy", methods: ["GET", "HEAD"] },
        rent: { uri: "rent", methods: ["GET", "HEAD"] },
        "rent.reserve": {
            uri: "rent\/reserve\/{id}",
            methods: ["GET", "HEAD"],
            parameters: ["id"],
        },
        "rent.reserve.store": { uri: "rent\/reserve", methods: ["POST"] },
        "vehicles.show": {
            uri: "vehicles\/{id}",
            methods: ["GET", "HEAD"],
            parameters: ["id"],
        },
        contact: { uri: "contact", methods: ["GET", "HEAD"] },
        "contact.submit": { uri: "contact", methods: ["POST"] },
        dashboard: { uri: "dashboard", methods: ["GET", "HEAD"] },
        "admin.cars.index": { uri: "admin\/cars", methods: ["GET", "HEAD"] },
        "admin.rent.index": {
            uri: "admin\/rent-cars",
            methods: ["GET", "HEAD"],
        },
        "admin.cars.create": {
            uri: "admin\/cars\/create",
            methods: ["GET", "HEAD"],
        },
        "admin.cars.edit": {
            uri: "admin\/cars\/{id}\/edit",
            methods: ["GET", "HEAD"],
            parameters: ["id"],
        },
        "admin.cars.show": {
            uri: "admin\/cars\/{id}",
            methods: ["GET", "HEAD"],
            parameters: ["id"],
        },
        "admin.cars.store": { uri: "admin\/cars", methods: ["POST"] },
        "admin.cars.destroy": {
            uri: "admin\/cars\/{id}",
            methods: ["DELETE"],
            parameters: ["id"],
        },
        "profile.edit": { uri: "profile", methods: ["GET", "HEAD"] },
        "profile.update": { uri: "profile", methods: ["PATCH"] },
        "profile.destroy": { uri: "profile", methods: ["DELETE"] },
        login: { uri: "login", methods: ["GET", "HEAD"] },
        "password.request": {
            uri: "forgot-password",
            methods: ["GET", "HEAD"],
        },
        "password.email": { uri: "forgot-password", methods: ["POST"] },
        "password.reset": {
            uri: "reset-password\/{token}",
            methods: ["GET", "HEAD"],
            parameters: ["token"],
        },
        "password.store": { uri: "reset-password", methods: ["POST"] },
        "verification.notice": {
            uri: "verify-email",
            methods: ["GET", "HEAD"],
        },
        "verification.verify": {
            uri: "verify-email\/{id}\/{hash}",
            methods: ["GET", "HEAD"],
            parameters: ["id", "hash"],
        },
        "verification.send": {
            uri: "email\/verification-notification",
            methods: ["POST"],
        },
        "password.confirm": {
            uri: "confirm-password",
            methods: ["GET", "HEAD"],
        },
        "password.update": { uri: "password", methods: ["PUT"] },
        logout: { uri: "logout", methods: ["POST"] },
        "storage.local": {
            uri: "storage\/{path}",
            methods: ["GET", "HEAD"],
            wheres: { path: ".*" },
            parameters: ["path"],
        },
        "storage.local.upload": {
            uri: "storage\/{path}",
            methods: ["PUT"],
            wheres: { path: ".*" },
            parameters: ["path"],
        },
    },
};
if (typeof window !== "undefined" && typeof window.Ziggy !== "undefined") {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
