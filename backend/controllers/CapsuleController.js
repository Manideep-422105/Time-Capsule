const { cloudinary } = require("../config/cloudinary");
const fs = require("fs");
const Capsule = require("../models/capsule");

exports.CreateCapsule = async (req, res) => {
  try {
    const { title, message, unlockAt } = req.body;
    let mediaUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Time Capsule",
      });
      mediaUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }
    const capsule = new Capsule({
      user: req.user.userId,
      title,
      message,
      unlockAt,
      media: mediaUrl,
    });

    await capsule.save();
    res.status(201).json({ success: true, data: capsule });
  } catch (err) {
    console.error("CAPSULE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

exports.UsersCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({ user: req.user.userId });
    res.json(capsules);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.ViewCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: "Capsule Not found",
      });
    }
    const now = new Date();
    if (now < capsule.unlockAt) {
      return res.status(403).json({
        locked: true,
        message: `Capsule is locked until ${capsule.unlockAt.toISOString()}`,
      });
    }
    res.json({
      success: true,
      locked: false,
      capsule,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.DeleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res
        .status(404)
        .json({ success: false, message: "Capsule not found" });
    }

    if (capsule.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await capsule.deleteOne();
    res.json({ success: true, message: "Capsule deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.EditCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res
        .status(404)
        .json({ success: false, message: "Capsule not found" });
    }

    if (capsule.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();
    if (now >= new Date(capsule.unlockAt)) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot edit unlocked capsule" });
    }

    const { title, message, unlockAt } = req.body;
    if (title) capsule.title = title;
    if (message) capsule.message = message;
    if (unlockAt) capsule.unlockAt = unlockAt;

    await capsule.save();
    res.json({
      success: true,
      message: "Capsule updated successfully",
      capsule,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
