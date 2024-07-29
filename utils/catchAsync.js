module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

//shorter version of previous.catch(e=> next(e))