const express = require('express')
const {
    getBootCamps,
    getBootCamp,
    createBootCamp,
    updateBootCamp,
    deleteBootCamp,
    getBootcampsInRadius,
    bootCampPhotoUpload
 } = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

 //Include other resource routers
 const courseRouter = require('./courses');

const router = express.Router(); 

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(bootCampPhotoUpload);

router.route('/')
 .get(advancedResults(Bootcamp, 'courses'), getBootCamps)
 .post(createBootCamp);

router.route('/:id')
 .get(getBootCamp)
 .put(updateBootCamp)
 .delete(deleteBootCamp)
module.exports = router