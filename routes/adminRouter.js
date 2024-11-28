const router = require('express').Router();
const adminCtrl = require('../controllers/adminCtrl');
const isAuth = require('../middlewares/isAuth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/report', isAuth, isAdmin, adminCtrl.getReport);

router.get('/posts/:post_id/featured', isAuth, isAdmin, adminCtrl.setFeatured);

router.delete('/user/:user_id', isAuth, isAdmin, adminCtrl.deleteUser);

module.exports = router;