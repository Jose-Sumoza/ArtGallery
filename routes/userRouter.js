const router = require("express").Router();
const userCtrl = require('../controllers/userCtrl');
const isAuth = require('../middlewares/isAuth');
const fileParser = require('../middlewares/fileParser');

router.post('/register', userCtrl.register);

router.post('/login', userCtrl.login);

router.get('/logout', isAuth, userCtrl.logout);

router.get('/e229146b1984cd62e322005c53468c', userCtrl.refreshToken);

router.get('/info', isAuth, userCtrl.getInfo);

router.patch('/edit', isAuth, fileParser, userCtrl.edit);

router.patch('/updateEmail', isAuth, userCtrl.updateEmail);

module.exports = router;