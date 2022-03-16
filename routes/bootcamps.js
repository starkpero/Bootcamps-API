const express = require('express')
const {
    getBootCamps,
    getBootCamp,
    createBootCamp,
    updateBootCamp,
    deleteBootCamp,
    getBootcampsInRadius
 } = require('../controllers/bootcamps')

const router = express.Router(); 

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/')
 .get(getBootCamps)
 .post(createBootCamp);

router.route('/:id')
 .get(getBootCamp)
 .put(updateBootCamp)
 .delete(deleteBootCamp)
module.exports = router