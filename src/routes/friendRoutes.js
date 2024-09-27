const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authJwt');
const friendController = require('../controllers/friendController');

//Rutas relacionasdas con los amigos de usuarios
router.get('/friend/search-friends/:username', verifyToken, friendController.searchFriend);
router.post('/friend/request/:id', verifyToken, friendController.sendRequest);
router.post('/friend/request/accept/:id', verifyToken, friendController.acceptRequest);
router.post('/friend/request/decline/:id', verifyToken, friendController.declineRequest);
router.get('/friend/request/pending/:id', verifyToken, friendController.getPendingRequests);
router.get('/friend/:id', verifyToken, friendController.getFriends);
router.post('/friend/:id', verifyToken, friendController.deleteFriend);

module.exports = router;