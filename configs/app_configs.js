const ROUTES_PREFIX = `/selina-bookshelves-api`
const SECRET_KEY = process.env.SECRET_KEY
const APP_ENV = process.env.app_env || "local"
const REDIS_ENDPOINT_URI = process.env.REDIS_ENDPOINT_URI || "redis-18667.c8.us-east-1-2.ec2.cloud.redislabs.com:18667"
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "dVZCrABvG85l0L9JQI9izqn2SDvvTx82"
const MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb+srv://Zeta:thuan2002@cluster0.pmjo1.mongodb.net/Selina?retryWrites=true&w=majority"

module.exports = { 
    ROUTES_PREFIX,
    REDIS_ENDPOINT_URI,
    REDIS_PASSWORD,
    SECRET_KEY,
    APP_ENV,
    MONGO_DB_URL
}