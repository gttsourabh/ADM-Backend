const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendOtpSms } = require('../utils/sms');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const findUser = identifier =>
  User.findOne({
    $or: [
      { username: identifier.toLowerCase() },
      { email: identifier.toLowerCase() },
      { phone: identifier },
    ],
  });

exports.sendOTP = async (req, res, next) => {

  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ message: 'Identifier and password are required' });

    const user = await findUser(identifier).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials. Please check your username/email/phone and password.' });

    if (!user.isEnabled)
      return res.status(403).json({ message: 'Your account has been disabled. Contact admin.' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

    const smsSent = await sendOtpSms(user.phone, otp);

    const maskedPhone = user.phone.replace(/(\d{2})\d+(\d{2})/, '$1******$2');
    const maskedEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    const response = {
      message: smsSent ? `OTP sent to ${maskedPhone}` : 'OTP generated (SMS delivery failed)',
      userId: user._id,
      maskedEmail,
    };

    if (process.env.NODE_ENV === 'development' || !smsSent) {
      response.otp = otp;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, identifier, otp } = req.body;
    const lookupKey = userId || identifier;
    if (!lookupKey || !otp)
      return res.status(400).json({ message: 'User ID and OTP are required' });

    let user;
    if (mongoose.Types.ObjectId.isValid(lookupKey)) {
      user = await User.findById(lookupKey).select('+otp +otpExpiry');
    }
    if (!user) {
      user = await findUser(lookupKey).select('+otp +otpExpiry');
    }
    if (!user)
      return res.status(404).json({ message: 'User not found. Please provide the userId returned by send-otp (or your username/email/phone).' });

    if (!user.otp || user.otp !== otp)
      return res.status(401).json({ message: 'Invalid OTP. Please check and try again.' });

    if (user.otpExpiry < new Date())
      return res.status(401).json({ message: 'OTP has expired. Please login again.' });

    await User.findByIdAndUpdate(user._id, { otp: null, otpExpiry: null });

    const token = signToken(user._id);
    res.json({ token, role: user.role, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { userId, identifier } = req.body;
    const lookupKey = userId || identifier;
    if (!lookupKey)
      return res.status(400).json({ message: 'User ID is required' });

    let user;
    if (mongoose.Types.ObjectId.isValid(lookupKey)) {
      user = await User.findById(lookupKey);
    }
    if (!user) {
      user = await findUser(lookupKey);
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isEnabled) return res.status(403).json({ message: 'Account disabled.' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

    const smsSent = await sendOtpSms(user.phone, otp);

    const maskedPhone = user.phone.replace(/(\d{2})\d+(\d{2})/, '$1******$2');
    const response = {
      message: smsSent ? `OTP resent to ${maskedPhone}` : 'OTP generated (SMS delivery failed)',
    };

    if (process.env.NODE_ENV === 'development' || !smsSent) {
      response.otp = otp;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Current and new password are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id).select('+password');
    if (!await user.comparePassword(currentPassword))
      return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

exports.saveFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken is required' });
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ message: 'FCM token saved' });
  } catch (err) {
    next(err);
  }
};
