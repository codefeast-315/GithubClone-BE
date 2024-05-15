const Issue = require("../models/Issue");
// Create an issue
const createIssue = async (req, res) => {
  try {
    const { issueString } = req.body;

    // Create a new issue object
    const issue = new Issue({
      issueString,
    });

    // Save the issue to MongoDB
    await issue.save();

    res.status(201).json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createIssue,
};

// Delete an issue
const deleteIssue = (req, res) => {
  // Your code to delete an issue goes here
};

module.exports = {
  createIssue,
  deleteIssue,
};
