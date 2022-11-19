const ROUTES_PREFIX = `/selina-bookshelves-api`
const SECRET_KEY = process.env.SECRET_KEY
const APP_ENV = process.env.app_env || "staging"
const REDIS_ENDPOINT_URI = process.env.REDIS_ENDPOINT_URI || "redis-16376.c52.us-east-1-4.ec2.cloud.redislabs.com:16376"
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "eHiU1tMrweOCs6qjEzhoDN4FYa0wvqwD"
const MONGO_DB_URL = process.env.MONGO_DB_URL || "mongodb+srv://Zeta:thuan2002@cluster0.pmjo1.mongodb.net/Selina-Staging?retryWrites=true&w=majority"

module.exports = { 
    ROUTES_PREFIX,
    REDIS_ENDPOINT_URI,
    REDIS_PASSWORD,
    SECRET_KEY,
    APP_ENV,
    MONGO_DB_URL
}