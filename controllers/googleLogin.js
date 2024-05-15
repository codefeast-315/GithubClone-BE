const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const {
  fetchUserDetailsAndRelatedData,
  fetchUserDetailsAndRelatedDataFromGoogleId,
} = require("./Dashboard");
const { error } = require("console");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function googleLogin(req, res) {
  const { googleId } = req.body;

  try {
    await client.connect();

    const db = client.db("test");
    const usersCollection = db.collection("users");

    let user = await usersCollection.findOne({ googleId: googleId });

    if (!user) {
      throw error("User does not exist");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, userId: user._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  } finally {
    await client.close();
  }
}

async function googleSignup(req, res) {
  const { username, email, googleId } = req.body;

  try {
    await client.connect();

    const db = client.db("test");
    const usersCollection = db.collection("users");

    let user = await usersCollection.findOne({ googleId });

    if (!user) {
      const newUser = {
        username,
        password: "",
        email,
        googleId,
        repositories: [],
        followedUsers: [],
        starRepos: [],
      };

      const result = await usersCollection.insertOne(newUser);

      user = result;
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Respond with the token and user ID
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  } finally {
    await client.close();
  }
}

module.exports = {
  googleLogin,
  googleSignup,
};
