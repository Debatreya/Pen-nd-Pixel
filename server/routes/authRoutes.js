const express = require('express');
const router = express.Router();

const {authenticateUser}=require('../middleware/authentication')

const {register,login,logout,verifyEmail,forgotPassword,resetPassword,uploadImage}=require('../controllers/authController');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').delete(authenticateUser,logout);
router.route('/verify-email').get(verifyEmail);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/upload-image').post(uploadImage);

module.exports=router;