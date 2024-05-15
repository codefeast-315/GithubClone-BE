const mongoose = require("mongoose");
const Repository = require("../models/repoModel"); // Adjust the path as necessary

async function createRepo(req, res) {
  try {
    const {
      userId,
      repositoryName,
      description = "",
      visibility = true, // Default to true for public repositories
      content = [],
      issues = [],
    } = req.body;

    // Check for required fields
    if (!repositoryName) {
      return res.status(400).json({ error: "Repository name is required." });
    }

    // Ensure owner is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid owner ID." });
    }

    // Ensure issues, if provided, are valid ObjectIds
    if (issues.some((issue) => !mongoose.Types.ObjectId.isValid(issue))) {
      return res.status(400).json({ error: "Invalid issue ID(s)." });
    }

    const newRepository = new Repository({
      name: repositoryName,
      description,
      visibility,
      owner: userId,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created successfully.",
      repositoryId: result._id,
    });
  } catch (error) {
    console.error("Error creating repository:", error);
    res.status(500).json({ error: "Failed to create repository." });
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
}

async function getAllRepositoriesbyId(req, res) {
  try {
    const { id } = req.params;
    const repositories = await Repository.find({ owner: id })
      .populate("owner")
      .populate("issues");
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
}

async function getRepositoryIdByName(req, res) {
  try {
    const { repositoryName } = req.body;
    console.log("====================================");
    console.log(repositoryName);
    console.log("====================================");
    const repository = await Repository.findOne({ name: repositoryName });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    res.json(repository._id);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repository name by id" });
  }
}

async function getRepositoryById(req, res) {
  try {
    const repository = await Repository.findById(req.params.id);
    // .populate("owner")
    // .populate("issues");
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    res.json(repository);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repository by id" });
  }
}

async function updateRepositoryById(req, res) {
  try {
    const { name, description, visibility, content, owner } = req.body;
    const repository = await Repository.findByIdAndUpdate(
      req.params.id,
      { name, description, visibility, content, owner },
      { new: true }
    );
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    res.json({ message: "Repository updated successfully", repository });
  } catch (error) {
    res.status(500).json({ error: "Failed to update repository" });
  }
}

async function updateRepositoryFileById(req, res) {
  try {
    const { content } = req.body;
    console.log("====================================");
    console.log(content);
    console.log("====================================");
    console.log(req.params.id);
    const repository = await Repository.findById(req.params.id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    repository.content.push(content);
    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update repository" });
  }
}

async function deleteRepositoryFileById(req, res) {
  try {
    const { id } = req.params;
    console.log("====================================");
    console.log(`Deleting file with ID: ${id}`);
    console.log("====================================");

    const repository = await Repository.findById(id);
    console.log(repository);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    await repository.remove();

    res.json({
      message: "Repository deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete repository" });
  }
}

async function deleteRepositoryById(req, res) {
  try {
    const repository = await Repository.findByIdAndDelete(req.params.id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    res.json({ message: "Repository deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete repository" });
  }
}

async function getRepositoryContent(req, res) {
  try {
    const repository = await Repository.findById(req.params.id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    res.json({ content: repository.content });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repository content" });
  }
}

async function toggleRepositoryVisibility(req, res) {
  try {
    const repositoryId = req.params.id;
    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    repository.visibility = !repository.visibility;

    await repository.save();

    res.json({
      message: "Repository visibility updated successfully",
      visibility: repository.visibility,
    });
  } catch (error) {
    console.error("Error toggling repository visibility:", error);
    res.status(500).json({ error: "Failed to toggle repository visibility" });
  }
}

async function renameRepositoryById(req, res) {
  try {
    const repositoryId = req.params.id;
    const { newTitle } = req.body;

    // Check if newTitle is provided
    if (!newTitle) {
      return res.status(400).json({ error: "New title is required" });
    }

    const repository = await Repository.findById(repositoryId);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // Update the repository title
    repository.name = newTitle;

    // Save the updated repository
    const updatedRepository = await repository.save();

    res.json({
      message: "Repository title updated successfully",
      repository: updatedRepository,
    });
  } catch (error) {
    console.error("Error renaming repository:", error);
    res.status(500).json({ error: "Failed to rename repository" });
  }
}

async function searchRepositoriesByName(req, res) {
  try {
    const { searchTerm } = req.body;
    // Check if searchTerm is provided
    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    // Perform case-insensitive search using regular expression
    const regex = new RegExp(searchTerm, "i");
    const repositories = await Repository.find({ name: regex });

    res.json({ message: "Repository found successfully", repositories });
  } catch (error) {
    console.log("Error searching repositories by name:");
    res.status(500).json({ error: "Failed to search repositories by name" });
  }
}

async function userRepo(req, res) {
  try {
    const userId = req.user;
    console.log(userId);

    const repositories = await Repository.find({ owner: userId });
    if (!repositories) {
      return res.status(404).json({ error: "User repo not found" });
    }
    res.json({ message: "User repos fetched sucessfully", repositories });
  } catch (error) {
    console.error("Error fetching repositories by logged-in user:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
}

module.exports = {
  createRepo,
  getAllRepositoriesbyId,
  getAllRepositories,
  getRepositoryById,
  updateRepositoryFileById,
  updateRepositoryById,
  deleteRepositoryById,
  getRepositoryIdByName,
  getRepositoryContent,
  toggleRepositoryVisibility,
  renameRepositoryById,
  searchRepositoriesByName,
  deleteRepositoryFileById,
  userRepo,
};
