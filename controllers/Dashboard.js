const User = require("../models/userModel"); // Adjust the path as necessary
const Repository = require("../models/repoModel");
const Issue = require("../models/issues");

async function fetchUserDetailsAndRelatedData(userId) {
  try {
    const user = await User.findById(userId)
      .populate("repositories")
      .populate("followedUsers")
      .populate("starRepos");

    const repositories = await Repository.find({ owner: userId }).populate(
      "issues"
    );

    const issues = await Issue.find({
      repository: { $in: repositories.map((repo) => repo._id) },
    });

    // Return the user details, repositories, and issues
    return {
      user,
      repositories,
      issues,
    };
  } catch (error) {
    console.error("Error fetching user details and related data:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

async function fetchRepositoriesOfFollowedUsers(userId) {
  try {
    // Fetch the current user's details to get the list of followed users
    const user = await User.findById(userId).populate("followedUsers");

    // Extract the IDs of the followed users
    const followedUserIds = user.followedUsers.map((user) => user._id);

    // Fetch repositories owned by the followed users
    const repositories = await Repository.find({
      owner: { $in: followedUserIds },
    }).populate("issues");

    // Return the repositories
    return repositories;
  } catch (error) {
    console.error("Error fetching repositories of followed users:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

async function fetchRepositoriesOfLoggedInUser(userId) {
  try {
    // Fetch repositories owned by the logged-in user
    const repositories = await Repository.find({ owner: userId }).populate(
      "issues"
    );

    // Return the repositories
    return repositories;
  } catch (error) {
    console.error("Error fetching repositories of logged-in user:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}
async function fetchUserDetailsAndRelatedDataFromGoogleId(googleId) {
  // Find the user by their Google ID
  const user = await User.findOne({ googleId: googleId })
    .populate("repositories")
    .populate("followedUsers")
    .populate("starRepos");

  if (!user) {
    return {
      user,
    };
  }

  // Fetch repositories owned by the user
  const repositories = await Repository.find({ owner: user._id }).populate(
    "issues"
  );

  // Fetch issues related to the user's repositories
  const issues = await Issue.find({
    repository: { $in: repositories.map((repo) => repo._id) },
  });

  // Return the user details, repositories, and issues
  return {
    user,
    repositories,
    issues,
  };
}

module.exports = {
  fetchUserDetailsAndRelatedData,
  fetchRepositoriesOfFollowedUsers,
  fetchRepositoriesOfLoggedInUser,
  fetchUserDetailsAndRelatedDataFromGoogleId,
};
