const bcrypt = require("bcryptjs");
const User = require("./user.model");

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getUserbyId = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { email, name, password, draws } = req.body;
    if (email) user.email = email;
    if (name) user.name = name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (draws) user.draws = draws;
    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (err) {
    next(err);
  }
};
exports.updateDrawsCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { draws } = req.body;
    if (draws) {
      user.draws = draws;
    }
    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.updateNoteUsers = async (req, res, next) => {
  try {
    const users = req.body;

    for (const { notes, userId } of users) {
      const user = await User.findById(userId);
      if (user) {
        const noteIndex = user.notes.findIndex((note) => note.taskId === notes.taskId);
        if (noteIndex !== -1) {
          // Remplacer la note existante par la nouvelle note
          user.notes[noteIndex] = notes;
        } else {
          // Ajouter la nouvelle note si taskId n'existe pas
          user.notes.push(notes);
        }
        await user.save();
      }
    }

    res.json({ message: "Users updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteCurrentUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};
exports.getAllMiniUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("_id name");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) user.email = email;
    if (name) user.name = name;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (role) user.role = role;
    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};
