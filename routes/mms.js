var config = require("../model/config").config;
var request = require('request');
exports.sendmms = function(req, res) {
    var mmsURL = config.mmsOptions.mmsurl;
    var username = config.mmsOptions.username;
    var password = config.mmsOptions.password;
    var custom = "Here%27s+Your+Photo+From+Instantly%2esg%0a%0a"
    var custom1 = "Please+visit+the+link+below+using+the+browser+on+your+smartphone.%0a%0a";
    var imgURL =  "http://"+ req.headers.host+   req.body.url;
    var custom2 = "%0a%0aThen+click+and+hold+the+image+to+save+the+photo+to+your+phone.%0a%0aIf+you+are+sharing+the+photo+on+social+media%2c%20do+tag+it+with+%23instantlysg%0a%0aThank You%21";
    var custom3 = "%0a%0aWebsite%3a%20www.instantly.sg%0aFacebook%3a%20www.fb.com%2finstantly.sg%0aInstagram%3a%20%40instantly.sg"
    var phoneNumber = req.body.phoneNumer;
    var postURL = mmsURL + "username=" + username + "&password=" + password + "&to=" + phoneNumber +
        "&from=Instantly&message=" + custom + custom1 + imgURL + custom2 + custom3;
    request(postURL, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            return res.json({
                msg: postURL
            });
        } else {
            return res.json({
                msg: postURL
            });
        }
    })
}
