var express = require("express");
var app = express();
var port = process.env.PORT || 3800;
var http = require('http');
var request = require('request');
var fs = require('fs');
var path = require('path');
var config = require("./model/config").config;
var logger = require('./model/log');
var uploader = require('./routes/upload');
var nodemailer = require("nodemailer");
var chokidar = require('chokidar');
var FormData = require('form-data');

const os = require ('os');

var mime = require('mime-types'); // mime type checking package

var numberPrints;
const numberPrintsFile = __dirname + "/numberprints.json";

var formdata;
const formdataPath = __dirname + "/formdata.json";

try {
 	numberPrints = JSON.parse( fs.readFileSync(numberPrintsFile, "utf8" ) );
}
catch (err) {
	numberPrints = {};
  	fs.writeFileSync(numberPrintsFile, JSON.stringify( {} ), "utf8");
}

try {
 	formdata = JSON.parse( fs.readFileSync(formdataPath, "utf8" ) );
}
catch (err) {
	formdata = [];
  	fs.writeFileSync(formdataPath, JSON.stringify( [] ), "utf8");
}

/**
 * Set the paths for your files
 * @type {[string]}
 */

 //Ewan: To edit here
var d = new Date();
var yyyy = d.getFullYear();
var dd = ("0" + d.getDate()).slice(-2);
var mm = ("0" + (d.getMonth() + 1)).slice(-2);;  
var finaldate = yyyy + "-" + mm + "-" + dd;
var appDir = path.dirname(require.main.filename); //this is the filepath of gifbooth app
var CurrentUserPath = os.homedir();
var desktopDir = CurrentUserPath + '\/Desktop';

var pub = __dirname + '/public',
	view = __dirname + '/views',
	photos = '/photos/',
	photosPub = '/public' + photos,
	videos = '/videos/',
	videosPub = '/public' + videos,

	/*Using paths inside gifbooth app*/
	//watchPath = './watch/', 
	//originalJpgs = './originalJpgs/', 
	//originals = './originalsMP4/',
	
	
	/*Using paths from photobooth-new folder
	watchPath = desktopDir + '/Display/',
	originalJpgs = desktopDir + '/photobooth-new/' + finaldate + '/prints/',
	originals = desktopDir + '/photobooth-new/' + finaldate + '/MP4/',
	*/

	/*For 4K Stogram/Smartphone emailing and printing*/
	watchPath = desktopDir + '/Display/',
	originalJpgs = './originalJpgs/', 
	originals = './originalsMP4/', 

	toPrint = './toPrint/';

	console.log ("Today's date is:  " + finaldate);
	console.log ("gifbooth app is located at:  " + appDir);
	console.log ("Files to be displayed for emailing is at:  " + watchPath);
	console.log ("Original files used for printing is at:  " + originalJpgs);
	console.log ("Original mp4 for emailing is at:  " + originals);
	console.log ("Desktop path is at: " + desktopDir);
/**
 * Set your app main configuration
 */
app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(pub));
	app.use(express.static(view));
	app.use(express.errorHandler());
});

app.engine('htmlx', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // this is an extremely simple template engine

    var form = "";
    if ( options.enable_form )
    { 
    	form = fs.readFileSync( view + "/" + options.form_path );
    }

    var rendered = content.toString().replace(new RegExp('##form##', 'g'), ''+ form +'').replace(new RegExp('##activeifnotform##', 'g'), (options.enable_form ? "" : "active") );
    return callback(null, rendered);
  });
});

app.get( "/", function(req, res) {
	app.set('view engine', 'htmlx'); // register the template engine
	res.render( "index", { enable_form : config.enable_form, form_path: config.form_path } );
} );
/**
 * Render your index/view "my choice was not use jade"
 */
app.get("/views", function(req, res){
	res.render("index");
});

/**
 * send email
 */
app.post('/sendMail', uploader.sendMail);

app.get('/reset', function(req, res) {
	fs.writeFileSync(numberPrintsFile, JSON.stringify( {} ), "utf8");
	numberPrints = {};

  	res.send("Print copy data cleared");
});

app.get('/resetform', function(req, res) { 
	fs.writeFileSync(formdataPath, JSON.stringify( [] ), "utf8");
  	formdata = [];

	res.send("Form data cleared");
});

app.post( '/saveform', function(req, res) {
	var data = req.body;
	data.time = (new Date()).toString();
	formdata.push( data );

	fs.writeFileSync(formdataPath, JSON.stringify( formdata ), "utf8");

	res.send( 'success' );
});

app.get( '/downloadform', function(req, res) {
	res.setHeader('Content-disposition', 'attachment; filename=form.csv');
 	res.setHeader('Content-type', "binary");

	var csv = "";

	for ( var outerIdx in formdata ) {
		for ( var innerIdx in formdata[outerIdx] ) {
			csv += '"' + formdata[outerIdx][innerIdx] + '",';
		}

		csv = csv.slice(0, -1);
		csv += "\n";
	}

  	res.send( csv );
});

app.post( '/uploadMedia', function(req, res) {
	var data = req.body;
	
	let url = config.fbServerUrl; //'https://instantly.sg/fb_api.php';

	var file_data = fs.createReadStream(__dirname + '/public' + data.filePath);;
	var formData = {
		'sid': data.sid,
		'action': data.action,
		'caption': data.caption,
		'media_file': {
			value: file_data,
			options: {
				filename: data.filePath,
				contentType: 'multipart/form-data',
			},
		},
	}

	request.post({url:url, formData: formData}, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }
	  //console.log(body);
	  res.send(body);
	});
});

function startWatchers(socket) {
	var gifwatcher = chokidar.watch(watchPath + '*.gif', {
		ignored: /[\/\\]\./,
		persistent: true
	});

	var GIFwatcher = chokidar.watch(watchPath + '*.GIF', {
		ignored: /[\/\\]\./,
		persistent: true
	});
	
	var jpgwatcher = chokidar.watch(watchPath + '*.jpg', {
		ignored: /[\/\\]\./,
		persistent: true
	});

	var JPGwatcher = chokidar.watch(watchPath + '*.JPG', {
		ignored: /[\/\\]\./,
		persistent: true
	});

	var mp4watcher = chokidar.watch(watchPath + '*.mp4', {
		ignored: /[\/\\]\./,
		persistent: true
	});

	var MP4watcher = chokidar.watch(watchPath + '*.MP4', {
		ignored: /[\/\\]\./,
		persistent: true
	});

	// image added
	var addCB = function(filePath) {
		moveFile(filePath, function(err, filename) {
			if(!err) {
				var filestats = fs.statSync( filePath );

				filename = filename.replace('public/', '');
				filename = filename.replace('public\\', '');

				var np = (numberPrints[filename])?numberPrints[filename]:0;
				if(mime.lookup(filePath) == 'video/mp4'){
					var data = { url: filename, ctime: filestats.mtime.getTime(), np: np, type: 'video' }
				}else{
					var data = { url: filename, ctime: filestats.mtime.getTime(), np: np, type: 'image' }
				}
				socket.emit('addImage', data);
			}
		});

		var fileName = filePath.replace('watch/', '');
		fileName = fileName.replace('watch\\', '');
		console.log('File', fileName, 'has been added');
	};

	// image changed
	var changeCB = function(filePath) {
		moveFile(filePath, function(err, filename) {
			if(!err) {
				console.log('socket sent');
				filename = filename.replace('public/', '');
				filename = filename.replace('public\\', '');

				if(mime.lookup(filePath) == 'video/mp4'){
					var data = { url: filename, type: 'video' }
				}else{
					var data = { url: filename, type: 'image' }
				}
				socket.emit('updateImage', data);
			}
		});

		filePath = filePath.replace('watch/', '');
		filePath = filePath.replace('watch\\', '');
		console.log('File', filePath, 'has been changed');
	};

	// image removed
	var unlinkCB = function(filePath) {
		deleteFile(filePath, function(err, filename) {
			filename = filename.replace('public/', '');
			filename = filename.replace('public\\', '');

			if(mime.lookup(filePath) == 'video/mp4'){
				var data = { url: filename, type: 'video' }
			}else{
				var data = { url: filename, type: 'image' }
			}
			socket.emit('removeImage', data);
		});

		filePath = filePath.replace('watch/', '');
		filePath = filePath.replace('watch\\', '');
		console.log('File', filePath, 'has been removed');
	};

	gifwatcher.on('add', addCB);
	gifwatcher.on('change', changeCB);
	gifwatcher.on('unlink', unlinkCB);

	GIFwatcher.on('add', addCB);
	GIFwatcher.on('change', changeCB);
	GIFwatcher.on('unlink', unlinkCB);
	
	jpgwatcher.on('add', addCB);
	jpgwatcher.on('change', changeCB);
	jpgwatcher.on('unlink', unlinkCB);

	JPGwatcher.on('add', addCB);
	JPGwatcher.on('change', changeCB);
	JPGwatcher.on('unlink', unlinkCB);

	mp4watcher.on('add', addCB);
	mp4watcher.on('change', changeCB);
	mp4watcher.on('unlink', unlinkCB);

	MP4watcher.on('add', addCB);
	MP4watcher.on('change', changeCB);
	MP4watcher.on('unlink', unlinkCB);
}

function moveFile(filePath, cb) {
	var name = path.basename(filePath);

	if(mime.lookup(filePath) == 'video/mp4'){
		var filename = videosPub + name;
	}else{
		var filename = photosPub + name;
	}

	var source = fs.createReadStream(filePath);
	var dest = fs.createWriteStream(__dirname + filename);

	source.pipe(dest);
	source.on('end', function() { /* copied */
		cb(null, filename);
	});

	source.on('error', function(err) { /* error */
		cb(err, filename);
	})
}

function deleteFile(filePath, cb) {
	var name = path.basename(filePath);
	if(mime.lookup(filePath) == 'video/mp4'){
		var filename = videosPub + name;
	}else{
		var filename = photosPub + name;
	}
	var filenameDir = path.join(__dirname, filename);

	fs.unlink(filenameDir, function (err) {
		cb(err, filename);
	});
}

var io = require('socket.io').listen(app.listen(port));

io.configure(function () {
	io.set("transports", ["xhr-polling"]);
	io.set("polling duration", 10);
});

function initializeFilter( socket ) {
	var timefilter = [];

	for ( var p = config.filter_time_from; p<config.filter_time_to; p++) {
		for ( var mm = 0; mm<60; mm+=config.filter_interval) {
			timefilter.push( leadingZero( p ) + ":" + leadingZero( mm ) );
		}
	}
	timefilter.push( config.filter_time_to + ":00");

	socket.emit( 'initFilter', timefilter );
}

function leadingZero( val ) {
	if ( parseInt( val ) < 10 ) 
		return "0" + parseInt(val);
	else 
		return val;
}

io.sockets.on('connection', function (socket) {
	// starting watcher
	startWatchers(socket);

	initializeFilter( socket );

	// events
	socket.on('print', function(data) {
		var url = data.url;
		var amount = data.amount;
		var copyString = amount + 'copy';
		//var printString = (Math.round((amount)/2)); /*Bookmark or Half 4R or Wallet Double Side*/
		//var printString = (Math.ceil((amount)/4)); /*Wallet Single Side*/
		var printString = amount; /*4R*/
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz";
		var appDir = path.dirname(require.main.filename);
		var imgFolder = appDir + config.imgfoldername;
		var basename = path.basename(url, path.extname(url));
		var filename = basename + path.extname(url);

		for( var i=0; i < 11; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		if(data.media_type == 'video'){
			var printTempFilename =	[basename, "-", text, "-", copyString,"-",printString, ".mp4"].join('');
			fs.readdir(originals, function (err, files) {
				for(var i=0; i< files.length; i++) {
					if(files[i].indexOf(basename) != -1) {
						fs.createReadStream(originals + files[i])
							.pipe(
								fs.createWriteStream(toPrint + printTempFilename)
							);
					}
				}
			});
		}else{
			var printTempFilename =	[basename, "-", text, "-", copyString,"-",printString, ".jpg"].join('');

			fs.readdir(originalJpgs, function (err, files) {
				for(var i=0; i< files.length; i++) {
					if(files[i].indexOf(basename) != -1) {
						fs.createReadStream(originalJpgs + files[i])
							.pipe(
								fs.createWriteStream(toPrint + printTempFilename)
							);
					}
				}
			});
		}

		if ( numberPrints[url] )
			numberPrints[url] = parseInt( numberPrints[url] ) + parseInt( amount );
		else 
			numberPrints[url] = amount;

		fs.writeFile( numberPrintsFile, 
			JSON.stringify( numberPrints ), 
			function (err) {
				if ( err ) { 
					console.log( err );
				}
			}
		);
	});
});

function pr( $mixed ) {
	console.log ( "/////////////////////////////////");
	console.log( $mixed );
	console.log ( "=================================");
}