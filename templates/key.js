require('dotenv').config()

module.exports = {
    env: process.env.NODE_ENV,
    debug: process.env.DEBUG,
    port: process.env.PORT,
    salt: process.env.SALT,
    alg_jwt: process.env.ALG_JWT,
    sign_jwt: process.env.SIGN_JWT,
    maxsize: process.env.MAXSIZE,
    maxfile: process.env.MAXFILES,
    interval: process.env.INTERVAL,
    size: process.env.SIZE,    
    limit_json: process.env.LIMIT_JSON,
    limit_urlencode: process.env.LIMIT_URLENCODE,
}