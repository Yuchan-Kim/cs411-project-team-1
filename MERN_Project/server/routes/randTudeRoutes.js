const express = require('express');
const router = express.Router();

//import controllers
const {getTest} = require("../controllers/randTubeController");
//import middlewares for API

// api routes
router.get('/', {getTest});

router.get('/savedVideo', {getTest});



module.export = router;