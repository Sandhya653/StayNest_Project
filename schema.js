// listing ka validaton Schema
const Joi = require("joi");
const review = require("./models/review");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        price: Joi.number().min(2).required(),
        image: Joi.object({
            url: Joi.string().allow("", null)
        }),
        category: Joi.string().required()
    }).required()
});


// reviews ka validation schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating : Joi.number().min(1).max(5).required(),
        comment: Joi.string().trim().required(),
    }).required()
})



