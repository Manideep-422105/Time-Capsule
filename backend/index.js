const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require("path");
const routes = require('./routes');
const database = require('./config/database');
const dotenv = require("dotenv");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
cloudinaryConnect();
dotenv.config();
const PORT = process.env.PORT || 5454;

database.connect();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is running....."
    });
});

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
});
