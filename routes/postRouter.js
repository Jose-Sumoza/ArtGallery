const router = require('express').Router();
const postsCtrl = require('../controllers/postCtrl');
const auth = require('../middlewares/auth');
const fileParser = require('../middlewares/fileParser');

router.route('/posts')
	.get(postsCtrl.getPosts)
	.post(auth, fileParser, postsCtrl.createPost);

router.route('/posts/:post_id')
	.get(postsCtrl.getById)
	.delete(auth, postsCtrl.deletePost)
	.patch(auth, fileParser, postsCtrl.editPost);

router.patch('/posts/:post_id/ratings', auth, postsCtrl.ratePost);

module.exports = router;