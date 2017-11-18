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
var mms = require("./routes/mms");
var nodemailer = require("nodemailer");
var chokidar = require('chokidar');

var lastCursor = null;

/**
 * Initialization of data 
 *
 */

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

var d = new Date ();
var year = d.getFullYear();
var month = ("0" + (d.getMonth() + 1)).slice(-2);
var day = ("0" + d.getDate()).slice(-2);

var finaldate = year + "-" + month + "-" + day;

var pub = __dirname + '/public',
	view = __dirname + '/views',
	photos = '/photos/',
	photosPub = '/public' + photos,
	watchPath = './watchGifs/',
	originalJpgs = './originalJpgs/',
	originalMovs = './originalMp4s/',
	//watchPath = '//169.254.74.120/Users/ewans/Desktop/photobooth-new/2016-09-25/GIF/',
	//originalJpgs = '//169.254.74.120/Users/ewans/Desktop/photobooth-new/2016-09-25/prints/',
	//originalMovs = '//169.254.74.120/Users/ewans/Desktop/photobooth-new/2016-09-25/MP4/',
	
	toPrint = './toPrint/';

console.log(finaldate);
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

    var rendered = content.toString().replace('##form##', ''+ form +'').replace('##activeifnotform##', (options.enable_form ? "" : "active") );

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
	
/**
 * send mms
 */
app.post('/sendmms',mms.sendmms);

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

function startWatchers(socket) {
	
	var jpgwatcher = chokidar.watch(watchPath + '*.jpg', {
		ignored: /[\/\\]\./,
		persistent: true
	});

	var JPGwatcher = chokidar.watch(watchPath + '*.JPG', {
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
				socket.emit('addImage', { url: filename, ctime: filestats.mtime.getTime(), np: np });
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
				socket.emit('updateImage', { url: filename });
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
			socket.emit('removeImage', { url: filename });
		});

		filePath = filePath.replace('watch/', '');
		filePath = filePath.replace('watch\\', '');
		console.log('File', filePath, 'has been removed');
	};

	
	jpgwatcher.on('add', addCB);
	jpgwatcher.on('change', changeCB);
	jpgwatcher.on('unlink', unlinkCB);

	JPGwatcher.on('add', addCB);
	JPGwatcher.on('change', changeCB);
	JPGwatcher.on('unlink', unlinkCB);
}

function moveFile(filePath, cb) {
	var name = path.basename(filePath);
	var filename = photosPub + name;

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
	var filename = photosPub + name;
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
	startWatchers(socket);
	initializeFilter( socket );

	// events
	socket.on('print', function(data) {
		var url = data.url;
		var amount = data.amount;
		var copyString = amount + 'copy';
		var printString = (Math.round((amount)/2));
		//var printString = amount;
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz";
		var appDir = path.dirname(require.main.filename);
		var imgFolder = appDir + config.imgfoldername;
		var basename = path.basename(url, path.extname(url));
		var filename = basename + path.extname(url);

		for( var i=0; i < 11; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		//var printTempFilename =	[basename, "-", text, "-", copyString,"-",printString, path.extname(url)].join('');
		var printTempFilename =	[basename, "-", text, "-", copyString,"-",printString, ".jpg"].join('');

		/*
		fs.exists('./originalPics/' + filename, function (exists) {
			if(exists) fs.createReadStream(originalPics + filename).pipe(fs.createWriteStream(newToPrint + printTempFilename));
		});*/

		var newToPrint = '';

		var oip = socket.handshake.address.address.split( ":" ).pop();
		
		if ( oip == '127.0.0.1' ) {
			newToPrint = ifLocal;
		}
		else {
			newToPrint = toPrint.replace("##PCNAME##", oip );
		}

		fs.readdir(originalPics, function (err, files) {
			for(var i=0; i< files.length; i++) {
				if(files[i].indexOf(basename) != -1) {
					fs.createReadStream(originalPics + files[i]).pipe(fs.createWriteStream(newToPrint + printTempFilename));
				}
			}
		});

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
