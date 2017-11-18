var http = require('http');
var https = require('https');
var request = require('request');
var fs = require('fs');
var path = require('path'),
	appDir = path.dirname(require.main.filename);
var config = require("../model/config").config;
var nodemailer = require("nodemailer");
var imgFolder = appDir +config.imgfoldername;
const os = require ('os');

/*Ewan's variables*/
var d = new Date();
var yyyy = d.getFullYear();
var dd = ("0" + d.getDate()).slice(-2);
var mm = ("0" + (d.getMonth() + 1)).slice(-2);;  
var finaldate = yyyy + "-" + mm + "-" + dd;
var appDir = path.dirname(require.main.filename); //this is the filepath of gifbooth app
var CurrentUserPath = os.homedir();
var desktopDir = CurrentUserPath + '\/Desktop';

/**
 * generate file with random name
 * @param url image url to get extension of file
 * @returns {String} return filename with extension
 */
function getRandomFileName(img, idx){
	var extension = "";
	if ( idx )
		extension = img.url[idx].split('.').pop();
	else 
		extension = img.url.split('.').pop();

	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz";
	var copyString = img.amount + 'copy';
	//var printString = (Math.round((img.amount)/2));
	//var printString = (Math.ceil((img.amount)/4));

	for( var i=0; i < 4; i++ ) {
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	//for wallet
	//return  [[img.username, img.created_time, text,copyString,printString].join('-'), ".", extension].join('');
	return  [[img.username, img.created_time, text, copyString,img.amount].join('-'), ".", extension].join('');
};

/*
* upload file to dropbox email  folder Email
*/
exports.sendMail = function (req, res) {
	var img = req.body;
	var email = img.mail;
	var smtpTransport = nodemailer.createTransport("SMTP", config.smtpTransport);
	var mailOptions = config.mailOptions;
	
	mailOptions.to=email;

	//Use &#39; for aprostrophe
	//Go to http://www.textfixer.com/html/compress-html-compression.php to compress
	
	/*====================
	Standard Messages
	====================*/
	//for photo only emailing (standard message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the photo you wanted</p><p style="color:#000000">If you are sharing this photo on Facebook or Instagram, do tag us at @instantly.sg or use the hashtag #instantlysg</p><p style="color:#000000">We&#39;d love to see what you&#39;ve done!</p><p style="color:#000000">Thanks and have a good day ahead!</p><p style="color:#000000">Team Instantly.sg</p><p style="color:#000000">Website: <a href="www.instantly.sg" target="_blank">www.instantly.sg</a><br>Instagram: <a href="www.instantly.sg" target="_blank">@instantly.sg</a><br>Facebook: <a href="www.instantly.sg" target="_blank">www.fb.com/instantly.sg</a></p>';
	
	//for boomerang video only emailing (standard message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the Boomerang video you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this Boomerang video into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">If you are sharing this photo on Facebook or Instagram, do tag us at @instantly.sg or use the hashtag #instantlysg</p><p style="color:#000000">We&#39;d love to see what you&#39;ve done!</p><p style="color:#000000">Thanks and have a good day ahead!</p><p style="color:#000000">Team Instantly.sg</p><p style="color:#000000">Website: <a href="www.instantly.sg" target="_blank">www.instantly.sg</a><br>Instagram: <a href="www.instantly.sg" target="_blank">@instantly.sg</a><br>Facebook: <a href="www.instantly.sg" target="_blank">www.fb.com/instantly.sg</a></p>';

	//for gif only emailing (standard message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the GIF you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this GIF into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">If you are sharing this photo on Facebook or Instagram, do tag us at @instantly.sg or use the hashtag #instantlysg</p><p style="color:#000000">We&#39;d love to see what you&#39;ve done!</p><p style="color:#000000">Thanks and have a good day ahead!</p><p style="color:#000000">Team Instantly.sg</p><p style="color:#000000">Website: <a href="www.instantly.sg" target="_blank">www.instantly.sg</a><br>Instagram: <a href="www.instantly.sg" target="_blank">@instantly.sg</a><br>Facebook: <a href="www.instantly.sg" target="_blank">www.fb.com/instantly.sg</a></p>';

	//for photo/boomerang only emailing (standard message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the photo/Boomerange video you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this file into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">If you are sharing this photo on Facebook or Instagram, do tag us at @instantly.sg or use the hashtag #instantlysg</p><p style="color:#000000">We&#39;d love to see what you&#39;ve done!</p><p style="color:#000000">Thanks and have a good day ahead!</p><p style="color:#000000">Team Instantly.sg</p><p style="color:#000000">Website: <a href="www.instantly.sg" target="_blank">www.instantly.sg</a><br>Instagram: <a href="www.instantly.sg" target="_blank">@instantly.sg</a><br>Facebook: <a href="www.instantly.sg" target="_blank">www.fb.com/instantly.sg</a></p>';

	//for photo/gif only emailing (standard message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the photo/GIF you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this file into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">If you are sharing this photo on Facebook or Instagram, do tag us at @instantly.sg or use the hashtag #instantlysg</p><p style="color:#000000">We&#39;d love to see what you&#39;ve done!</p><p style="color:#000000">Thanks and have a good day ahead!</p><p style="color:#000000">Team Instantly.sg</p><p style="color:#000000">Website: <a href="www.instantly.sg" target="_blank">www.instantly.sg</a><br>Instagram: <a href="www.instantly.sg" target="_blank">@instantly.sg</a><br>Facebook: <a href="www.instantly.sg" target="_blank">www.fb.com/instantly.sg</a></p>';

	//for video only emailing (standard message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the video you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this video into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">If you are sharing this photo on Facebook or Instagram, do tag us at @instantly.sg or use the hashtag #instantlysg</p><p style="color:#000000">We&#39;d love to see what you&#39;ve done!</p><p style="color:#000000">Thanks and have a good day ahead!</p><p style="color:#000000">Team Instantly.sg</p><p style="color:#000000">Website: <a href="www.instantly.sg" target="_blank">www.instantly.sg</a><br>Instagram: <a href="www.instantly.sg" target="_blank">@instantly.sg</a><br>Facebook: <a href="www.instantly.sg" target="_blank">www.fb.com/instantly.sg</a></p>';

	/*====================
	White labled Messages
	====================*/

	//for photo only emailing (white message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the photo you wanted</p><p style="color:#000000">Thanks and have a good day ahead!</p>';

	//for boomerang video only emailing (white message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the Boomerang video you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this Boomerang video into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">Thanks and have a good day ahead!</p>';

	//for gif only emailing (white message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the GIF you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this GIF into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">Thanks and have a good day ahead!</p>';

	//for photo/boomerang only emailing (white message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the photo/Boomerang video you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this file into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">Thanks and have a good day ahead!</p>';

	//for photo/gif only emailing (white message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the photo/GIF you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this file into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">Thanks and have a good day ahead!</p>';

	//for video only emailing (white message)
	//mailOptions.html='<p style="color:#000000">Hi There!</p><p style="color:#000000">Here&#39;s the soft copy of the video you wanted</p><p style="color:#000000">Note that we&#39;ve already converted this video into a social media friendly version already. Hence, no further conversion is required.</p><p style="color:#000000">Thanks and have a good day ahead!</p>';

	//for backup
	//mailOptions.html='';

	if ( Array.isArray( img.url ) )
	{
		mailOptions.attachments = [];

		img.url.forEach( function( val, idx ) {

			console.log ("checkpoint 1");
			console.log (img);

			var file = val.split('/').pop();
			
			console.log ("checkpoint 2");
			console.log (file);

			var fileName = file.split( '.' )[0];
			var fileExtension = file.split(".")[1].split("?")[0];

			console.log (fileName);
			console.log (fileExtension);
			//console.log (typeof(fileExtension));
			
			if ( fileExtension == "GIF" ) {
				//var locationPath = desktopDir + "/photobooth-new/" + finaldate + "/MP4/" + fileName + "." + "mp4";
				var locationPath = appDir + "/originalsMP4/" + fileName + "." + "mp4";
				var fileType = "video/quicktime";
			}

			if ( fileExtension == "gif" ) {
				//var locationPath = desktopDir + "/photobooth-new/" + finaldate + "/MP4/" + fileName + "." + "mp4";
				var locationPath = appDir + "/originalsMP4/" + fileName + "." + "mp4";
				var fileType = "video/quicktime";
			}

			//put jpg in watch find jpg
			if ( fileExtension == "jpg" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "image/jpeg";
			}

			//put JPG in watch find JPG
			if ( fileExtension == "JPG" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "image/jpeg";
			}

			//put MP4 in watch find MP4
			if ( fileExtension == "MP4" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "video/quicktime";
			}

			//put mp4 in watch find mp4
			if ( fileExtension == "mp4" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "video/quicktime";
			}

			//var locationPath = appDir + "/watch/" + file.split( '.' )[0] + ".jpg";

			console.log( "==============" );
			console.log( locationPath );
			console.log (mailOptions);
			console.log ("====success1====");

			mailOptions.attachments.push( { // utf-8 string as an attachment
				
				filename: 'yourfile' + '.' + locationPath.split(".")[1],
				streamSource: fs.createReadStream(locationPath),
				contentType: fileType
			
			});
		});
	}
	else {
		console.log ("checkpoint 3");
		console.log (img);

		var file = img.url.split('/').pop();

		console.log ("checkpoint 4");
		console.log (file);

		var fileName = file.split( '.' )[0];
		var fileExtension = file.split(".")[1].split("?")[0];

		console.log (fileName);
		console.log (fileExtension);
		//console.log (typeof(fileExtension));
			
			if ( fileExtension == "GIF" ) {
				//var locationPath = desktopDir + "/photobooth-new/" + finaldate + "/MP4/" + fileName + "." + "mp4";
				var locationPath = appDir + "/originalsMP4/" + fileName + "." + "mp4";
				var fileType = "video/quicktime";
			}

			if ( fileExtension == "gif" ) {
				//var locationPath = desktopDir + "/photobooth-new/" + finaldate + "/MP4/" + fileName + "." + "mp4";
				var locationPath = appDir + "/originalsMP4/" + fileName + "." + "mp4";
				var fileType = "video/quicktime";
			}

			//put jpg in watch find jpg
			if ( fileExtension == "jpg" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "image/jpeg";
			}

			//put JPG in watch find JPG
			if ( fileExtension == "JPG" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "image/jpeg";
			}

			//put MP4 in watch find MP4
			if ( fileExtension == "MP4" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "video/quicktime";
			}

			//put mp4 in watch find mp4
			if ( fileExtension == "mp4" ) {
				var locationPath = desktopDir + "/Display/" + fileName + "." + fileExtension;
				//var locationPath = appDir + "/watch/" + fileName + "." + fileExtension;
				var fileType = "video/quicktime";
			}

		//var locationPath = appDir + "/originalMp4s/" + fileName + "." + fileExtension;
		//var locationPath = appDir + "/watch/" + file.split( '.' )[0] + ".jpg";

		console.log( "==============" );
		console.log( locationPath );
		console.log (mailOptions);
		console.log ("====success2====");

		mailOptions.attachments =[{ // utf-8 string as an attachment
			
			filename: 'yourfile' + '.' + locationPath.split(".")[1],
			streamSource: fs.createReadStream(locationPath),
			contentType: fileType

		}];
	}

	smtpTransport.sendMail(mailOptions, function() {
		smtpTransport.close();
		res.send({ // file on disk as an attachment
			filename: ''
		});
	});
};