(function() {
	window.socket = io.connect('/');

	/**
	 * [Namespacing]
	 */
	var Insta = Insta || {};

	Insta.App = {
		/**
		 * [Application initialization method / call for the methods being initializated in order]
		 */
		init: function() {
			this.attachImageClicked();
			this.contextMenu();
			this.attachSocketEvents();

			this.initToolbar(); 
		},

		attachSocketEvents: function() {
			var self = this;
			var imgWrap = $('#imgContent');
			var source = $('#addImage-tpl').html();
			var sourceVideo = $('#addVideo-tpl').html();

			socket.on('addImage', function(data) {
				data.localtime = ( new Date(data.ctime) ).toString();
				
				if(data.type == 'video'){
					var compiledTemplate = Handlebars.compile(sourceVideo);
					result = compiledTemplate(data);	
				}else{
					var compiledTemplate = Handlebars.compile(source);
					result = compiledTemplate(data);
				}

				var images = imgWrap.find("a[data-ctime]");

				if ( images.length > 0 ) {
					var added = false;
					images.each( function ( idx, val ) {
						var obj = $(val);

						if ( obj.data('ctime') < data.ctime ) {
							obj.before( result );
							added = true;

							return false;
						}

						return true;
					});

					if ( ! added ) {
						imgWrap.append(result);
					}
				}
				else
					imgWrap.append(result);
			});

			socket.on('updateImage', function(data) {
				var url = data.url;

				if(data.type == 'video'){
					var compiledTemplate = Handlebars.compile(sourceVideo);
					result = compiledTemplate(data);	
				}else{
					var compiledTemplate = Handlebars.compile(source);
					result = compiledTemplate(data);
				}

				imgWrap.children().each(function(index, el) {
					var first = $(this).find('img').eq(0);
					var src = first.attr('src').split('?')[0];
					if(src == url) {
						var newURL = url + "?" + new Date().getTime();
						first.attr('src', newURL);
					}
				});
			});

			socket.on('removeImage', function(data) {
				var url = data.url;

				if(data.type == 'video'){
					var compiledTemplate = Handlebars.compile(sourceVideo);
					result = compiledTemplate(data);	
				}else{
					var compiledTemplate = Handlebars.compile(source);
					result = compiledTemplate(data);
				}

				imgWrap.children().each(function(index, el) {
					var first = $(this).find('img').eq(0);
					var src = first.attr('src').split('?')[0];
					if(src == url) {
						$(this).remove();
					}
				});
			});

			socket.on('initFilter', function(data) {
				var selectFrom = $("#select-from");
				var selectTo = $("#select-to");
				for( var p in data ) {
					selectFrom.append($("<option></option>")
         						.attr("value", data[p])
         						.text(data[p])); 

					selectTo.append($("<option></option>")
         						.attr("value", data[p])
         						.text(data[p])); 
				}

				selectFrom.attr( "data-min", data[0] );
				selectFrom.attr( "data-max", data[ data.length - 1 ] );

				selectTo.attr( "data-min", data[0] );
				selectTo.attr( "data-max", data[ data.length - 1 ] );

				selectFrom.change( function() {
					selectTo.find( "option" ).show();
					var val = this.value;

					selectTo.find( "option" ).each( function(idx, obj) {
						if ( val >= $(obj).val() )
						{
							$(obj).hide();
						}
					});
				} );
			});
		},

		/**
		 *
		 */
		contextMenu: function() {
			var $contextMenu = $("#contextMenu");

			var target;

			$("body").on("contextmenu", "a", function(e) {
				target = $(e.target).parent();
				$contextMenu.css({
					display: "block",
					left: e.pageX,
					top: e.pageY
				});
				return false;
			});

			$contextMenu.on("click", "a", function() {
				if (target) {
					target.parent().hide("slow");
				}
			});

			$(document).on("click", function() {
				$contextMenu.hide();
				target = null;
			});
		},

		/**
		 * []
		 */
		attachImageClicked: function(e) {  
			var self = this,
				context = {};
				context.fb_user_connect = false;
				context.fb_user_name = '';
			$("#imgContent").on('click', 'a', function(e) { /*default is img*/

				e.preventDefault();
				/*
				if($('input[name="share-confirm"]').prop('checked')){
					$('.share-btn').prop('disabled', false);
				}else{
					$('.share-btn').prop('disabled', true);
				}*/

				if ( $("#header-bar .btn-start-select").hasClass('toggle') ) {
					$(this).toggleClass('selected');
					return false;
				}

				if($(this).attr('data-cmedia-type') == 'video'){
					context.media_type = 'video';
					context.url = $(this).children('video').children('source').attr("src"); /*default is $(this).attr("src")*/
					context.caption = $(this).children('video').children('source').attr("alt"); /*default is $(this).attr("alt")*/
					context.username = $(this).children('video').children('source').attr("data-photo-username"); /*default is $(this).attr("data-photo-username")*/
					context.created_time = $(this).children('video').children('source').attr("data-created-time"); /*default is $(this).attr("data-created-time")*/

					context.obj = $(this);
				}else{
					context.media_type = 'image';
					context.url = $(this).children('img').attr("src"); /*default is $(this).attr("src")*/
					context.caption = $(this).children('img').attr("alt"); /*default is $(this).attr("alt")*/
					context.username = $(this).children('img').attr("data-photo-username"); /*default is $(this).attr("data-photo-username")*/
					context.created_time = $(this).children('img').attr("data-created-time"); /*default is $(this).attr("data-created-time")*/

					context.obj = $(this);
				}

				var systemId = readCookie('systemId');

				if(systemId == '' || systemId == null){
					var uid = guidGenerator();
					systemId = createCookie('systemId', uid, 10);
				}

				if(context.fb_user_connect == false){
					var request = $.ajax({
			          url: "https://instantly.sg/fb_api.php",
			          //url: "upload.php",
			          type: "POST",
			          data: {sid : systemId, action: 'fb_check_connection'},
			        });

				    request.done(function(data) {
				    	var userData = JSON.parse(data);
				    	//console.log(userData);
				    	if( userData.data != '' && userData.data.fb_name != ''){

				    		context.fb_user_connect = true;
				    		context.fb_user_name = userData.data.fb_name;
				    		//console.log(context);
				    	}else{
				    		//console.log('Pass ', context);
				    	}
				      	// console.log(userData);
				      	// console.log(userData.data.fb_name);
				    });

				    request.fail(function(jqXHR, textStatus) {
				      alert( "Request failed: " + textStatus );
				    });
				}

				new Dialog(context, socket);

			});
		},

		/**
		 * [Render the images on the page and check for layout resize]
		 */
		renderTemplate: function(data) {
			var lastAnimate, lastSrc, nextSrc, last,
				// current = data.data[0].images.standard_resolution.url,
				w = $(document).width();
			var query = data,
				source = $('#mostRecent-tpl').html(),
				compiledTemplate = Handlebars.compile(source),
				result = compiledTemplate(query),
				imgWrap = $('#imgContent');

			var img = $("<img/>").attr("src", data.url);
			img.load(function() {
				setTimeout(function() {
					imgWrap.prepend(result);
					imgWrap.find("a:first-child").append(img);
					noofphoto = $('#imgContent div.photoslide').size();
					//console.log(noofphoto);
					last = $('#imgContent div:first-child');
					lastSrc = $('#imgContent div:first-child').find('img').attr('src');
					nextSrc = $('#imgContent div:nth-child(2)').find('img').attr('src');
					if (lastSrc === nextSrc) {
						last.remove();
					}
					last = $('#imgContent').find('div:first-child').removeClass('Hvh');
					if (w >= 900) {
						lastAnimate = $('#imgContent').find('div:nth-child(2)').addClass('animated rotateInDownLeft'); /*change here for animation*/
						$('#imgContent').find('div.photoslide').removeClass('animated rotateInDownLeft');
					}
				}, 500);
			});
		},

		initToolbar: function() {

			$("#header-bar .btn-filter").on('click', function() {
				var imgWrap = $('#imgContent');
				var images = imgWrap.find("a[data-ctime]");

				var filter_to = $("#select-to").val();
				var filter_from = $("#select-from").val();

				if ( filter_from >= filter_to ) {
					return;
				}

				images.removeClass('filtered');

				var filter_from_arr = filter_from.split(":");
				var filter_to_arr = filter_to.split(":");

				var _from = parseInt( filter_from_arr[0] )*60+ parseInt( filter_from_arr[1] );
				var _to = parseInt( filter_to_arr[0] )*60+ parseInt( filter_to_arr[1] );

				images.each( function( idx, val ) {
					var obj = $( val );

					var timestamp = obj.data('ctime');
					var time = new Date(timestamp);

					var hr = time.getHours(),
						min = time.getMinutes();

					if ( _from > ( hr * 60 + min ) ||
						( hr * 60 + min ) >= _to ) {
						obj.addClass('filtered');
					}
				} );
			});

			$("#header-bar .btn-reset").on('click', function() {
				$("#select-to").val('0');
				$("#select-from").val('0');

				var imgWrap = $('#imgContent');
				imgWrap.find("a").removeClass('filtered');

				var selectedImages = imgWrap.find("a");
				selectedImages.removeClass('selected');

				$("#select-to").find("option").show();
			});

			$("#header-bar .btn-start-select").on('click', function() {
				$(this).toggleClass('toggle');
				$("#footer-bar").toggleClass('toggle');

				if ( ! $(this).hasClass('toggle') ) {
					var imgWrap = $('#imgContent');
					imgWrap.find("a").removeClass('selected');
				}
			});

			$("#footer-bar .select-done-btn").on('click', function() {
				var imgWrap = $('#imgContent');
				var selectedImages = imgWrap.find("a.selected");

				var urlArr = [];
				selectedImages.each( function( idx, val ) { 
					urlArr.push( $(val).children('img').attr("src") );
				} );

				var context = {};
				context.url = urlArr;
				
				var dialog = new Dialog(context, socket);

				$("#header-bar .btn-start-select").removeClass('toggle');
				selectedImages.removeClass('selected');
				$("#footer-bar").removeClass('toggle');
			});

			$(document).ready( function() {
				keyboard_interface(); //define in behavior.js

				$(window).on('load',function(){
				    delete_cookie('copy_data');
				});
				$("video[0]").on('click',function(){
					// alert();
					video.pause();
					video.currentTime = 0;
					video.play();
				});
				
			})
		}
	};

	Insta.App.init();
})(this);
