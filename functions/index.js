const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Inventory API is running",
  });
});

app.use("/api/products", productRoutes);

exports.api = onRequest(app);
