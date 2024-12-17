const userModel = require("../models/userModels");
const useravatarModel = require("../models/useravatarModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const uploadAvatarController = async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ success: false, message: 'No file uploaded' });
    }
    
    try {
    const avatarUrl = `/uploads/${req.file.filename}`;
    const userId = req.body.userId;
    await useravatarModel.findOneAndUpdate(
        { userId },
        { avatarUrl, uploadedAt: new Date() },
        { upsert: true, new: true }
    );

    res.send({
        success: true,
        avatarUrl
    });
    } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).send({ success: false, message: 'Error updating avatar' });
    }
};


const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already exists",
      });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `  Register Controller ${error.message}`,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.status(200).send({
      success: true,
      message: "Login Successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Login Controller ${error.message}`,
    });
  }
};

const authUserController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "User not found",
      });
    } else
      res.status(200).send({
        success: true,
        message: "User fetched successfully",
        data: user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Auth User Controller ${error.message}`,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  authUserController,
  uploadAvatarController
};
