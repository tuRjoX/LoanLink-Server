require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const dns = require("dns");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://loanlink-3d15f.web.app",
  "https://loanlink-api.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("LoanLink Server is running!"));
app.get("/api/health", (req, res) =>
  res.send({ status: "OK", timestamp: new Date() }),
);

const uri = process.env.MONGODB_URI;
let client;
if (!global.mongoClient) {
  global.mongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}
client = global.mongoClient;

const verifyToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }
  if (!token) return res.status(401).send({ message: "Unauthorized access" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Unauthorized access" });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const email = req.user?.email;
  const user = await client
    .db(process.env.DB_NAME)
    .collection("users")
    .findOne({ email });
  if (user?.role !== "admin")
    return res.status(403).send({ message: "Forbidden access" });
  next();
};

const verifyManager = async (req, res, next) => {
  const email = req.user?.email;
  const user = await client
    .db(process.env.DB_NAME)
    .collection("users")
    .findOne({ email });
  if (user?.role !== "manager" && user?.role !== "admin")
    return res.status(403).send({ message: "Forbidden access" });
  next();
};

async function run() {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    const loansCollection = database.collection("loans");
    const applicationsCollection = database.collection("applications");
    const paymentsCollection = database.collection("payments");

    app.post("/api/auth/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.send({ success: true, token });
    });
    app.post("/api/auth/logout", (req, res) => {
      res.send({ success: true });
    });

    app.post("/api/users", async (req, res) => {
      try {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await usersCollection.findOne(query);
        if (existingUser)
          return res.send({ message: "User already exists", insertedId: null });
        const newUser = {
          ...user,
          role: user.role || "borrower",
          status: "active",
          createdAt: new Date(),
        };
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).send({ message: "Failed to create user" });
      }
    });

    app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { search } = req.query;
        let query = {};
        if (search) {
          query = {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          };
        }
        const result = await usersCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch users" });
      }
    });

    app.get("/api/users/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.user.email)
        return res.status(403).send({ message: "Forbidden access" });
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const { role, status, suspendReason } = req.body;
      const updateDoc = {
        $set: {
          ...(role && { role }),
          ...(status && { status }),
          ...(suspendReason && { suspendReason }),
          updatedAt: new Date(),
        },
      };
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        updateDoc,
      );
      res.send(result);
    });

    app.get("/api/loans", async (req, res) => {
      try {
        const { page = 1, limit = 6, showOnHome, search, category } = req.query;
        let query = {};
        if (showOnHome === "true") query.showOnHome = true;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ];
        }
        if (category) query.category = category;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const loans = await loansCollection
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .toArray();
        const total = await loansCollection.countDocuments(query);
        res.send({
          loans,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          total,
        });
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch loans" });
      }
    });

    app.get("/api/loans/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await loansCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(400).send({ message: "Invalid loan ID" });
      }
    });

    app.post("/api/loans", verifyToken, verifyManager, async (req, res) => {
      try {
        const loan = {
          ...req.body,
          createdBy: req.user.email,
          createdAt: new Date(),
          showOnHome: req.body.showOnHome || false,
        };
        const result = await loansCollection.insertOne(loan);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to create loan" });
      }
    });

    app.patch(
      "/api/loans/:id",
      verifyToken,
      verifyManager,
      async (req, res) => {
        try {
          const id = req.params.id;
          const updateDoc = {
            $set: {
              ...req.body,
              updatedAt: new Date(),
            },
          };
          const result = await loansCollection.updateOne(
            { _id: new ObjectId(id) },
            updateDoc,
