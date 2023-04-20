import mongoose from "mongoose";
import configs from "@root/env.config";

mongoose.set("strictQuery", true);

export default async function () {
    mongoose.connect(configs.DB_URL, { useNewUrlParser: true, useUnifiedTopology: false }).then(
        function () {
            console.log("Connect to mongoDB successfully!");
        },
        function (error) {
            console.log("Failed to connect to MongoDB!");
            console.log("🚀 ~ file: db.js:12 ~ error:" + error);
            console.error(error);
        }
    );
}
