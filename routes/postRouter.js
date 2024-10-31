const router = require('express').Router();
const postsCtrl = require('../controllers/postCtrl');
const isAuth = require('../middlewares/isAuth');
const fileParser = require('../middlewares/fileParser');

router.route('/posts')
	.get(postsCtrl.getPosts)
	.post(isAuth, fileParser, postsCtrl.createPost);

router.route('/posts/:post_id')
	.get(postsCtrl.getById)
	.delete(isAuth, postsCtrl.deletePost)
	.patch(isAuth, fileParser, postsCtrl.editPost);

router.patch('/posts/:post_id/ratings', isAuth, postsCtrl.ratePost);

module.exports = router;