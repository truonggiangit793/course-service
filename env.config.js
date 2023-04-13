require("dotenv").config();
const ip = require("ip");

module.exports = {
    SALT: 2023,
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    BASE_URL: `http://${ip.address()}:${process.env.PORT || 3000}`,
    SERVICE_KEY: ["wGlWnNDcrU0K4zOF8ywGl", "iCkXIeYOYsIOrGGla92Sr", "WnNDcrU0okPhTVA27BLe3IJ8y"],
};
