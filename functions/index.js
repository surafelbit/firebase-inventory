const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");


const isLocalEmulator = !process.env.K_SERVICE;

if (isLocalEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  console.log("[init] Using local Firestore emulator at 127.0.0.1:8080 and Auth emulator at 127.0.0.1:9099");
}

admin.initializeApp({ projectId: "inventory-app-19292" });

// Belt-and-suspenders: explicitly configure the Firestore singleton
// BEFORE routes are required (services call admin.firestore() on load)
if (isLocalEmulator) {
  admin.firestore().settings({ host: "127.0.0.1:8080", ssl: false });
}

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const { exportInventoryCSVHandler } = require("./services/exportService");

const app = express();

const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Express 5 requires named wildcards — "/*path" instead of "*"
app.options("/*path", cors(corsOptions));

// Apply CORS and JSON body parsing to all routes
app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Inventory API is running" });
});

app.use("/products", productRoutes);
app.use("/users", userRoutes);

// 1. Primary REST API (Monolithic Express Cloud Function)
exports.api = onRequest(app);

// 2. Standalone Cloud Function: Inventory CSV Export Microservice
exports.exportInventoryCSV = onRequest({ cors: true }, exportInventoryCSVHandler);

