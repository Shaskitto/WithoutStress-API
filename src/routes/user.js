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
//router.get('/user/search-friend/:username', verifyToken, userController.searchFriend);
router.post('/user/friends/request/:id', verifyToken, userController.sendRequest);
router.get('/user/friends/requests/pending/:id', verifyToken, userController.getPendingRequests);
router.post('/user/friends/requests/:friendId/accept', verifyToken, userController.acceptRequest);
router.delete('/user/friends/requests/:friendId', verifyToken, userController.deleteRequest);
//router.get('/user/friends/:friendId', verifyToken, userController.getFriendById);
//router.delete('/user/friends/:friendId', verifyToken, userController.deleteFriend);

module.exports = router;