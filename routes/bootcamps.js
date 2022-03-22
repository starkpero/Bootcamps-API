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

const {protect, authorize} = require('../middleware/auth');

 //Include other resource routers
 const courseRouter = require('./courses');

const router = express.Router(); 

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootCampPhotoUpload);

router.route('/')
 .get(advancedResults(Bootcamp, 'courses'), getBootCamps)
 .post(protect, authorize('publisher', 'admin'), createBootCamp);

router.route('/:id')
 .get(getBootCamp)
 .put(protect, authorize('publisher', 'admin'), updateBootCamp)
 .delete(protect, authorize('publisher', 'admin'), deleteBootCamp)

 
module.exports = router;