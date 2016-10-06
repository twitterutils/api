module.exports = {
    isValid: (apiKey) => {
        return apiKey === process.env.TWU_API_PUBLIC_API_KEY;
    }
};
