const router = require('express').Router();
const artistCtrl = require('../controllers/artistCtrl');

router.route('/artists')
	.get(artistCtrl.getArtists);

router.route('/artists/:artist_id')
	.get(artistCtrl.getById);

module.exports = router;