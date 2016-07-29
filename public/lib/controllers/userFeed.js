module.exports = function (dbConnectionFactory) {
    return {
        read: (userName, response) => {
            dbConnectionFactory(response, "FEEDBUILDER_DB_CONNECTION_STRING");
        }
    }
}