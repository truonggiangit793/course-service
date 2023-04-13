import mongoose from "mongoose";
import configs from "@root/env.config";

mongoose.set("strictQuery", true);

export default async function () {
    mongoose.connect(configs.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(
        function () {
            console.log("\x1b[36m%s\x1b[0m", ">>>>>> Connect to mongoDB successfully!");
        },
        function (error) {
            console.log("\x1b[31m%s\x1b[0m", ">>>>>> Failed to connect to MongoDB!");
            console.log("🚀 ~ file: db.js:12 ~ error:", error);
        }
    );
}
