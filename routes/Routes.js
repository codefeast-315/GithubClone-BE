const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const login = require("../controllers/Login.js");
const {
  createRepo,
  getAllRepositories,
  getRepositoryById,
  updateRepositoryById,
  deleteRepositoryById,
  getRepositoryIdByName,
  updateRepositoryFileById,
  getRepositoryContent,
  toggleRepositoryVisibility,
  renameRepositoryById,
  searchRepositoriesByName,
  userRepo,
  getAllRepositoriesbyId,
  deleteRepositoryFileById,
} = require("../controllers/createRepo.js");
const {
  fetchRepositoriesOfFollowedUsers,
  fetchRepositoriesOfLoggedInUser,
} = require("../controllers/Dashboard.js");
const { googleLogin, googleSignup } = require("../controllers/googleLogin.js");
const {
  createIssue,
  updateIssue,
  fetchIssueById,
  fetchAllIssues,
  fetchAllUserIssues,
  deleteIssueById,
  fetchAllIssuesByUserId,
} = require("../controllers/issueControllers.js");
const upload = require("../controllers/multerConfig.js");
const { uploadFile } = require("../controllers/fileUploadController.js");

// Check for authentication status
router.get("/", (req, res) => {
  res.send("Welcome");
});

// Auth routes
router.post("/login", login.login);
router.post("/signup", login.signup);
router.post("/oauth/google", googleLogin);
router.post("/oauth/google/signup", googleSignup);

// User-related routes
router.get("/userinfo", userController.getAllUsers);
router.post("/users/create", userController.createUser);
router.get("/profile", userController.getProfile);
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUserById);
router.delete("/users/:id", userController.deleteUserById);

// Repository-related routes
router.post("/repos/create", createRepo);
router.get("/repos", getAllRepositories);
router.get("/repos/getAll/:id", getAllRepositoriesbyId);
// router.get("/repos/:id", getRepositoryById);
router.get("/repos/getRepositoryById/:id", getRepositoryById);
router.post("/repos/repoid", getRepositoryIdByName);
router.put("/repos/:id", updateRepositoryById);
router.delete("/repos/:id", deleteRepositoryById);
router.post("/repos/filechange/:id", updateRepositoryFileById);
router.delete("/repos/filechange/:id", deleteRepositoryFileById);
router.get("/repos/content/:id", getRepositoryContent);
router.get("/repos/toggleVisibility/:id", toggleRepositoryVisibility);
router.post("/repos/renameRepository/:id", renameRepositoryById);
router.get("/repos/searchRepositoriesByName", searchRepositoriesByName);
router.get("/repos/userRepo", userRepo);

// Dashboard routes
router.get("/user/followed-repositories", fetchRepositoriesOfFollowedUsers);
router.get("/user/repositories", fetchRepositoriesOfLoggedInUser);

// Issue-related routes
router.get("/repo/issues", fetchAllUserIssues);
router.get("/repo/issues/user/:UserId", fetchAllIssuesByUserId);
router.get("/repo/issues/:id", fetchAllIssues);
router.get("/repo/issue/:id", fetchIssueById);
router.post("/repo/issue/:id", createIssue);
router.put("/repo/issue/:id", updateIssue);
router.delete("/repo/issue/deleteIssue/:id", deleteIssueById);

// AWS routes
router.post("/repo/file", upload.single("file"), uploadFile);

module.exports = router;
