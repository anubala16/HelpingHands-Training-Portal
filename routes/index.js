var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', function(req, res){
	res.render('LandingHome', {pageTitle: "Welcome!"});
});

// Get Homepage
router.get('/LandingHome', function(req, res){
	res.render('LandingHome', {pageTitle: "Welcome!"});
});
module.exports = router;