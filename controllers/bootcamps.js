const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public  
exports.getBootCamps = asyncHandler(async (req, res, next) => {
        let query;

        // Copy req.query
        const reqQuery = {...req.query};

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        //console.log(queryStr);
        
        // Finding resource
        query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

        // Select Fields
        if(req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // sort
        if(req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }else{
            query = query.sort('-createdAt');
        }

        //Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page-1) * limit;
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const bootcamps = await query;

        //pagination result
        const pagination = {};

        if(endIndex < total){
            pagination.next = {
                page: page+1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page: page-1,
                limit
            }
        }

        res.status(200).json({
            success: true,
            count: bootcamps.length,
            pagination,
            data: bootcamps
        });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public  
exports.getBootCamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        });
});

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootCamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data: bootcamp
        });
    
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamp/:id
// @access  Private
exports.updateBootCamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
        }
    
        res.status(200).json({success: true, data: bootcamp});
    
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootCamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
        }
        
        bootcamp.remove();
        res.status(200).json({success: true, data: {}});
});

// @desc    Get bootcamp within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // Get lat/lon from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    //Calc radius using radians 
    //Divide dist by radius of the earth
    //Earth radius = 3963 miles
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {$geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }}
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
});


// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootCampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with the id ${req.params.id}`, 404));
    }
    
    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;
    console.log(file);
    //Make sure the image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    //check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}B size`, 400));
    }

    // Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    //console.log(file.name);

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
        if(err){
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
    
    
});