const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Ensure this path is correct

// User Registration
router.post('/register', userController.register);

// User Login
router.post('/login', userController.login);

// Delete User
router.delete('/delete', userController.delete);

router.put('/update/:email', userController.updateUser);



module.exports = router;
