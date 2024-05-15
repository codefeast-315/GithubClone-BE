const axios = require("axios");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("Auth0_Users");

const userCollection = db.collection("users");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const getUserInfo = async (req, res) => {
  try {
    const auth0Token = req.oidc.accessToken;
    if (!auth0Token) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Access token not found" });
    }

    const auth0ApiUrl = "https://dev-z8tivme55voqva1b.us.auth0.com/userinfo";

    const response = await axios.get(auth0ApiUrl, {
      headers: {
        Authorization: `Bearer ${auth0Token}`,
      },
    });

    const userInfo = response.data;
    res.json(userInfo);
  } catch (error) {
    console.error("Error fetching user info from Auth0:", error);
    res.status(500).json({ error: "Failed to fetch user info from Auth0" });
  }
};
const getProfile = async (req, res) => {
  try {
    const userProfile = req.oidc.user;

    // Check if the user already exists in the database
    const userCollection = db.collection("Auth0Users"); // Assuming "users" is your collection name
    const user = await userCollection.findOne({ sub: userProfile.sub });

    if (!user) {
      const newUser = {
        ...userProfile,
      };

      await userCollection.insertOne(newUser);
      console.log("====================================");
      console.log("Inserted");
      console.log("====================================");
      console.log("====================================");
      console.log(JSON.stringify(newUser));
      console.log("====================================");
    }

    if (user != null) {
      res.send(JSON.stringify(user));
    }
  } catch (error) {
    console.error("Error saving user profile to MongoDB:", error);
    res.status(500).json({ error: "Failed to save user profile to MongoDB" });
  }
};

async function createUser(req, res) {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

async function updateUserById(req, res) {
  try {
    const { username, password } = req.body;
    const hashedPassword = password
      ? await bcrypt.hash(password, saltRounds)
      : undefined;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, password: hashedPassword },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
}

async function deleteUserById(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
}

module.exports = {
  getUserInfo,
  getProfile,
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
