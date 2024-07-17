const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { hashPin } = require("./utils");
const bcrypt = require("bcryptjs");

const app = express();
const port = process.env.PORT || 5000;

// ! middlewares
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fxbdhbr.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let userCollection;

async function run() {
  try {
    await client.connect();
    userCollection = client.db("quickCashDB").collection("users");
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Start Express server after successful connection to the database
    app.listen(port, () => {
      console.log(`QuickCash Server Running on Port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

run();

app.patch("/login", async (req, res) => {
  const email = req.query.email;
  const phone = req.query.phone;
  const pin = req.query.pin;

  let query;
  if (email === undefined) {
    query = { phone };
  }
  if (phone === undefined) {
    query = { email };
  }
  const user = await userCollection.findOne(query);
  console.log(user);
  if (!user) {
    res.send({ message: "user not found" });
    return;
  } else {
    const match = await bcrypt.compare(pin, user.pin);
    console.log(match);

    if (match) {
      res.send({ message: "Login successful" });
    } else {
      res.send({ message: "Invalid PIN" });
    }
  }
});

// ! Register route
app.post("/register", async (req, res) => {
  const { name, email, phone, pin } = req.body;

  try {
    let userByEmail = await userCollection.findOne({ email });
    let userByPhone = await userCollection.findOne({ phone });

    if (userByEmail) {
      res.send({ message: "This Email Already Exist" });
      return;
    }
    if (userByPhone) {
      res.send({ message: "This Number Already Exist" });
      return;
    }

    const hashedPin = await hashPin(pin);
    const newUser = {
      name,
      email,
      phone,
      pin: hashedPin,
      status: "pending",
      isActive: false,
    };

    console.log(newUser);
    const result = await userCollection.insertOne(newUser);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// ! Root route
app.get("/", (req, res) => {
  res.send("Server Is Running");
});
