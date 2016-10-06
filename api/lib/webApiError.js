module.exports = {
    unexpected: (response, message, error) => {
        if (error){
            console.error(error, error.stack);
        }
        return response.status(500).send({error: message});
    },
    unauthorized: (response, message) => {
        console.error(message);
        return response.status(401).send({error: message});
    },
    notFound: (response, message) => {
        console.error(message);
        return response.status(404).send({error: message});
    },
    logError: (error) => {
        console.error(error, error.stack);
    }
};