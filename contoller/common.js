//for all contollers common middelware...

// Module dependencies.
const Joi = require('joi');

// Validating Id 
module.exports.validateId = async function (req, res, next) {

    // validation using joi validation
    const { error, value } = Joi.object({
        id: Joi.string().required().length(24)
    }).validate({ id: req.params.id })

    if (error) return res.status(501).json({ status: 'fail', error: error.message })

    req.id = value.id
    next() // run next middelware...
}

// validating comment Id
module.exports.validateCommentId = async function (req, res, next) {

    // validation using joi validation
    const { error, value } = Joi.object({
        commentId: Joi.string().required().length(24)
    }).validate({ commentId: req.params.commentId })

    if (error) return res.status(501).json({ status: 'fail', error: error.message })

    req.commentId = value.commentId
    next() // run next middelware...
}