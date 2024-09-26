const express = require('express');
const router = express.Router();
const { upload } = require('../config/db');
const verifyToken = require('../middlewares/authJwt');
const userController = require('../controllers/userController');

// Rutas relacionadas con los usuarios
router.get('/users', userController.getAllUsers);
router.get('/user/:id', verifyToken, userController.getUserById);
router.patch('/user/:id', verifyToken, upload.single('profileImage'), userController.updateUserById);
router.get('/user/:id/profile-image', userController.getProfileImage);
router.post('/upload', upload.single('profileImage'), userController.uploadImage);
router.get('/user/search-friends/:username', verifyToken, userController.searchFriend);
router.post('/user/friends/request/:id', verifyToken, userController.sendRequest);
router.get('/user/friends/request/pending/:id', verifyToken, userController.getPendingRequests);
router.post('/user/friends/request/accept/:id', verifyToken, userController.acceptRequest);
router.post('/user/friends/request/decline/:id', verifyToken, userController.declineRequest);
router.get('/users/friends/:id', verifyToken, userController.getFriends);
//router.delete('/user/friends/:friendId', verifyToken, userController.deleteFriend);

module.exports = router;