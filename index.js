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
