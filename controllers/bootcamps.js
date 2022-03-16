const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public  
exports.getBootCamps = (req, res, next) => {
    res.status(200).json({success: true, msg: 'Show all bootcamps'});
}

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public  
exports.getBootCamp = (req, res, next) => {
    res.status(200).json({success: true, msg: `get bootcamp ${req.params.id}`});
}

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootCamp = async (req, res, next) => {
    try{
        const bootcamp = await Bootcamp.create(req.body);

        res.status(201).json({
            success: true,
            data: bootcamp
        });
    }catch(err){
        res.status(400).json({success: false});
    }
    
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamp/:id
// @access  Private
exports.updateBootCamp = (req, res, next) => {
    res.status(200).json({success: true, msg: `Update bootcamp ${req.params.id}`});
}

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootCamp = (req, res, next) => {
    res.status(200).json({success: true, msg: `Delete bootcamp ${req.params.id}`});
}