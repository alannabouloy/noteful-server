function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if(!authToken || authToken.split(' ')[1] !== apiToken){
        return res
            .status(401)
            .json({error: {message: 'Unauthorized request'}})
    }
    next()
}

module.exports = {validateBearerToken}