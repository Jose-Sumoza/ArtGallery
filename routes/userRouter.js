const router = require("express").Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middlewares/auth');
const fileParser = require('../middlewares/fileParser');

router.post('/register', userCtrl.register);

router.post('/login', userCtrl.login);

router.get('/logout', auth, userCtrl.logout);

router.get('/e229146b1984cd62e322005c53468c', userCtrl.refreshToken);

router.get('/info', auth, userCtrl.getInfo);

router.patch('/edit', auth, fileParser, userCtrl.edit);

router.patch('/updateEmail', auth, userCtrl.updateEmail);

module.exports = router;