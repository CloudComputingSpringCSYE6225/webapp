import UserRouter from "./user-routes.js";
import HealthRouter from "./health.js"

export default (app) => {
    app.use("/v1/user", UserRouter)
    app.use("/healthz", HealthRouter)
}