var apicache = require("apicache");

function configureCache(duration) {
    var disableCache = false;
    if (process.env.DISABLE_CACHE === "true"){
        disableCache = true;
    }

    return apicache
        .options({ 
            debug: true,
            enabled: !disableCache
        })
        .middleware(duration);
}

module.exports = {
    shortLived: () => {
        return configureCache("30 seconds");
    },
    longLived: () => {
        return configureCache("5 minutes");
    }
};
