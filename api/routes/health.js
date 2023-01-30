import express from "express"
const Router = express.Router()

// Routes to check health
Router.route("/")
    .get(
        (req, res) => {
            try{
                res.status(200).send("Success")
            } catch (error) {
                res.status(500).send("Error")
            }
        }
    )

export default Router;
