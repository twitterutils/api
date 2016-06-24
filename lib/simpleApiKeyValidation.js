module.exports = {
    isValid: (apiKey) => {
        return apiKey === process.env.PUBLIC_API_KEY;
    }
};
