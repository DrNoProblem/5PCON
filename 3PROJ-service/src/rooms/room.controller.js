const Room = require("./room.model");
const { promisify } = require("util");
const AppError = require("../utils/appError");

exports.AddRoom = async (req, res, next) => {
  try {
    const { name, owner, co_owner, users, tasks } = req.body;

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new AppError("You are not logged in! Please log in to get access.", 401));
    }

    let existingRoom;
    try {
      existingRoom = await Room.findOne({ name });
    } catch (err) {
      return next(err);
    }

    if (existingRoom) throw new AppError("name already in use", 400);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "fail", message: "Validation error", errors: errors.array() });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const newRoom = await Room.create({ name, owner: decoded.id, co_owner, users, tasks: "" });

    res.status(201).json({
      status: "success",
      data: {
        user: newRoom,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.GetAllRoom = async (req, res, next) => {
  try {
    const room = await Room.find();
    res.json(room);
  } catch (err) {
    next(err);
  }
};

exports.GetRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.room._id);
    res.json(room);
  } catch (err) {
    next(err);
  }
};

exports.updateRoomById = async (req, res, next) => {
  try {
    const room = "";
    res.json(room);
  } catch (err) {
    next(err);
  }
};

exports.deleteRoomById = async (req, res, next) => {
  try {
    const room = "";
    res.json(room);
  } catch (err) {
    next(err);
  }
};
