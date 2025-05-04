const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Ensure this path is correct

// User Registration
router.post('/register', userController.register); // שליחת קוד למייל
// router.post('/register-with-code', userController.registerWithCode); // הרשמה עם קוד

// User Login
router.post('/login', userController.login);

// Delete User
router.delete('/delete', userController.delete);

router.put('/update/:email', userController.updateUser);

router.post('/google-login', userController.googleLogin);


module.exports = router;
