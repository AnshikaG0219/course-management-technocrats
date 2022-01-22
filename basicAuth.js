const ROLE = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student'
}
function authUser(req, res, next){
    if(req.user === null)
    {
        res.status(403)
        return res.send('Sign in')
    }
    next()
}

function authRole(role){
    return (req, res, next) => {
        if(req.user.role !== role)
        {
            res.status(401)
            return res.send('Not allowed')
        }
    }
}

module.exports = {
    authRole,
    authUser,
    ROLE
}