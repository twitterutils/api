module.exports = (response, callbackUrl) => {
    return {
        success: function(userId){
            var url = getUrl(`user_id=${userId}`);
            return response.redirect(url);
        },
        error: function(message, error){
            if (error){
                console.error(error, error.stack);
            }

            var url = getUrl(`error=${message}`);
            return response.redirect(url);
        }
    };

    function getUrl(suffix){
        var url = getBaseUrl() + suffix;
        console.log(url);
        return url;
    }

    function getBaseUrl(){
        var separator = "?";
        if(callbackUrl.includes("?")){
            separator = "&";
        }
        return callbackUrl + separator;
    }
};
