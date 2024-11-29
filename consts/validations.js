const VALIDATIONS = {
	instagram: {
		url: /^(?:(?:https|http):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)/,
		urlValid: /^(?:(?:https|http):\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/([0-9a-zA-Z_.]+)$/i,
		username: /^[0-9a-zA-Z_.]+$/
	},
	tiktok: {
		url: /^(?:(?:https|http):\/\/)?(?:www\.)?tiktok\.com/,
		urlValid: /^(?:(?:https|http):\/\/)?(?:www\.)?tiktok\.com\/@([0-9a-zA-Z_.]+)$/i,
		username: /^[0-9a-zA-Z_.]+$/
	},
	facebook: {
		url: /^(?:(?:https|http):\/\/)?(?:(?:www|m|mobile|touch|mbasic).)?(?:facebook\.com|fb(?:\.me|\.com))/,
		urlValid: /^(?:(?:https|http):\/\/)?(?:(?:www|m|mobile|touch|mbasic).)?(?:facebook\.com|fb(?:\.me|\.com))\/(?!$)(?:(?:\w)*#!\/)?(?:pages\/|pg\/)?(?:photo\.php\?fbid=)?(?:[\w\-]*\/)*?(?:\/)?(profile\.php\?id=[^\/?&\s]*|[0-9a-zA-Z.]*)?(?:\/|&|\?)?(?:mibextid=[a-zA-Z]+)?$/,
		username: /^[0-9a-zA-Z.]+$/
	},
	twitter: {
		url: /^(?:(?:https|http):\/\/)?(?:www\.)?twitter\.com/,
		urlValid: /^(?:(?:https|http):\/\/)?(?:www\.)?twitter\.com\/([0-9a-zA-Z_]+)$/i,
		username: /^[0-9a-zA-Z_]+$/
	}
};

module.exports = VALIDATIONS;