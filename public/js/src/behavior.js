Behavior = function(dialog) {
	this._dialog = dialog;
};

Behavior.prototype.attachEvent = function() {};

Behavior.prototype.detachEvent = function() {};

NullBehavior = function(dialog) {
	Behavior.call(this, dialog);
};

NullBehavior.contructor = NullBehavior;
NullBehavior.prototype = new Behavior();

FirstBehavior = function(dialog) {
	Behavior.call(this, dialog);
};

FirstBehavior.contructor = FirstBehavior;
FirstBehavior.prototype = new Behavior();

FirstBehavior.prototype.attachEvent = function() {
	var self = this;
	$(document).on('click', '.yes-btn', function(e) {
		// validation 

		var form = $( "form.form-data" );
		var formdata = [];
		var fields = [];

		form.find(":input").each( function( idx, val ) {
			var _name = $(val).attr("name");

			if ( $(val).is( "button" ) || $(val).is("input[type=button]" ) )
				return true;

			if ( fields.indexOf( _name ) == -1 )
				fields.push( _name );
		} );

		form.find( ".message" ).remove();

		var messages = {
			required : "This field is required",
			email : "Please input valid email address",
			phone : "Please input valid phone number",
			number : "Please input numbers",
			min : "Minimum charactors for this field is invalid",
			max : "Maximum charactors for this field is invalid",
			atleast : "Select at least minimum required checkboxes",
			atmost : "Select at most maximum required checkboxes"
		};

		fields.forEach( function(field) {
			var ipt = form.find( "[name=" + field + "]" );
			var val = ipt.val();

			var flag = "";
			var pattern;

			if ( ipt.is("[type=checkbox]") || ipt.is("[type=radio]") ) {
				var tpt = ipt.parent();
				var cvals = [];

				form.find( "[name=" + field + "]:checked" ).each( function( idx, cobj ) {
					cvals.push( $(cobj).val() );
				} );

				if ( tpt.data( 'required' ) ) {
					if ( cvals.length === 0 ) {
						flag = "required";
					}
				}
				if ( flag.length === 0 && tpt.data( 'at-least' ) ) {
					if ( cvals.length < tpt.data( 'at-least' ) ) {
						flag = "atleast";
					}
				}
				if ( flag.length === 0 && tpt.data( 'at-most' ) ) {
					if ( cvals.length > tpt.data( 'at-most' ) ) {
						flag = "atmost";
					}
				}
				if ( flag.length > 0 ) { 
					if ( tpt.find( ".message").length === 0 ) {
						tpt.append( '<div class="message">' + messages[flag] + '</div>' );
					}
				}

				val = cvals.join( ',' );
			}
			else {

				if ( ipt.data('required') ) {
					if ( val.length === 0 ) {
						flag = "required";
					}
				}

				if ( flag.length === 0 && ipt.data( 'valid-email' ) ) {
					pattern = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

					if(val.indexOf(',') > -1){ //check if multiple email

						  var emailArr = val.split(",");
						  var emailErrMsg = '<br/> "';
						  for (var i = emailArr.length - 1; i >= 0; i--) {
						  	//check email is valid or not
						  	emailItem = $.trim(emailArr[i]);
						  	
						  	if(emailItem != '' &&  !pattern.test( emailItem )){
						  		emailErrMsg += emailItem + ","
						  		flag = 'email';
						  	}
						  }

						  if(flag == 'email'){
						  		emailErrMsg = emailErrMsg.replace(/,$/, '');
						  		messages.email += emailErrMsg + '"';
						  }

					}else{
						if ( ! pattern.test( val ) ) {
							flag = "email";
						}
					}
				}
				
				if ( flag.length === 0 && ipt.data( 'valid-phone' ) ) {
					pattern = /^(8|9)\d{7}$/;
					if ( ! pattern.test( val ) ) {
						flag = "phone";
					}
				}
				
				if ( flag.length === 0 && ipt.data( 'valid-number' ) ) {
					pattern = /^(\d+)$/;
					if ( ! pattern.test( val ) ) {
						flag = "number";
					}
				}

				if ( ipt.data( 'valid-min' ) || ipt.data( 'valid-max' ) ) {
					if ( flag.length === 0 ) {
						if ( val.length < ipt.data( 'valid-min' ) ) {
							flag = "min";
						}
						else if ( val.length > ipt.data( 'valid-max' ) ) {
							flag = "max";
						}
					}
				}
	 
				if ( flag.length > 0 ) { 
					ipt.after( '<div class="message">' + messages[flag] + '</div>' );
				}
			}

			formdata.push( { name:field, value:val } );
		} );

		if ( form.find( ".message" ).length > 0 ) {
			e.preventDefault();
			e.stopPropagation();
			return;
		}
		else {
			$.ajax({
				url: '/saveform',
				type: 'POST',
				data: formdata
			}).done(function (data) {
				// self.filename = data.filename;
				// $('.yes-btn').prop('disabled', false).text("Yes");
			});
		}

		// end of validation

		self.detachEvent();
		self._dialog.next(new ChoosePhotoStyle(self._dialog));
	});

	$(document).on('click', '.btn-next', function(e) {
		self.detachEvent();
		self._dialog.next(new ChoosePhotoStyle(self._dialog));
	});

	keyboard_interface();

};

FirstBehavior.prototype.detachEvent = function() {
	$(document).off('click', '.yes-btn');
	$(document).off('click', '.btn-next');
};

ChoosePhotoStyle = function(dialog) {
	Behavior.call(this, dialog);
};

ChoosePhotoStyle.contructor = ChoosePhotoStyle;
ChoosePhotoStyle.prototype = new Behavior();


ChoosePhotoStyle.prototype.attachEvent = function() {
	var self = this;
	var fbServerUrl = 'https://instantly.sg/fb_api.php';
	var systemId = readCookie('systemId');

	if(systemId == '' || systemId == null){
		var uid = guidGenerator();
		systemId = createCookie('systemId', uid, 10);
	}

	//$(document).off('click', 'input[name="share-confirm"]');
	$(document).off('click', '.share-btn');
	$(document).off('click', '.fb-login-btn');
	$(document).off('click', '.fb-log-out-btn');
	$(document).off('click', '.fb-next-btn');
	$(document).off('click', '.email-btn');
	$(document).off('click', '.fb-post-btn');
	//$(document).off('.fb-post-btn');
	/*
	$(document).on('click', 'input[name="share-confirm"]', function(){
		if($(this).prop('checked')){
			$('.share-btn').prop('disabled', false);
		}else{
			$('.share-btn').prop('disabled', true);
		}
	});*/

	$(document).on('click', '.share-btn', function(e) {
		e.preventDefault();
		//console.log(self, self._dialog);
		if(self._dialog._context.media_type == 'video'){
			$('#active-video1')[0].pause();
		}

	    if(self._dialog._context.fb_user_connect == true){
	    	$('#fb-user-name').html(self._dialog._context.fb_user_name);
	    	self._dialog.NextBehaviorStep(new Printout(self._dialog), 5 );
	    }else{
	    	self._dialog.NextBehaviorStep(new Printout(self._dialog), 4 );
	    }
		//self._dialog.nextWithoutBehavior();
	});

	$(document).on('click', '.fb-login-btn', function() {
		var fb_con_win = window.open(fbServerUrl + "?action=fb_connect&id=" + systemId, "fb-connect", "height=400,width=500");
        
        var fb_con_win_tick = setInterval(function() {
            if (fb_con_win.closed) {

              	var systemId = readCookie('systemId');
              	clearInterval(fb_con_win_tick);
				if(systemId == '' || systemId == null){
					var uid = guidGenerator();
					systemId = createCookie('systemId', uid, 10);
				}

				var request = $.ajax({
		          url: fbServerUrl,
		          //url: "upload.php",
		          type: "POST",
		          data: {sid : systemId, action: 'fb_check_connection'},
		        });

			    request.done(function(data) {
			    	var userData = JSON.parse(data);
			    	//console.log(userData);
			    	if( userData.data != '' && userData.data.fb_name != ''){

			    		self._dialog._context.fb_user_connect = true;
			    		self._dialog._context.fb_user_name = userData.data.fb_name;
			    		//console.log(self._dialog._context);
			    		self._dialog.NextBehaviorStep(new Printout(self._dialog), 6 );
			    	}
			    });

			    request.fail(function(jqXHR, textStatus) {
			      alert( "Request failed: " + textStatus );
			    });

	            //alert('Connected Successfully!');
	            //window.location.reload();
            }
        }, 500);
		//self._dialog.NextBehaviorStep(new Printout(self._dialog), 6 );
		//self._dialog.nextWithoutBehavior();
	});

	$(document).on('click', '.fb-log-out-btn', function() {
		var cbtn = $(this);
		var request = $.ajax({
          url: fbServerUrl,
          //url: "upload.php",
          type: "POST",
          data: {sid : systemId, action: 'remove_fb_user'},
        });

	    request.done(function(data) {
	    	self._dialog._context.fb_user_connect = false;
	    	self._dialog._context.fb_user_name = '';

	    	var JsonData = JSON.parse(data);

	    	var fbLogoutUrl = 'https://www.facebook.com/logout.php?access_token=' + JsonData.data.access_token;
	    	fbLogoutUrl += '&next=' + JsonData.data.redirect_url;
	    	var fb_close_win = window.open(fbLogoutUrl, "height=400,width=500");

	    	var fb_close_win_tick = setInterval(function() {
	            if (fb_close_win.closed) {

	              	var systemId = readCookie('systemId');
	              	clearInterval(fb_close_win_tick);
	            }
	        }, 500);
	        
	    	if(cbtn.hasClass('logout-full')){
	    		$("#myModal").modal("hide");
	    	}else{
	    		self._dialog.NextBehaviorStep(new Printout(self._dialog), 4 );
	    	}
	    	$(document).off('click', '.fb-log-out-btn');
	    });
	    $(document).off('click', '.fb-log-out-btn');
	    request.fail(function(jqXHR, textStatus) {
	      alert( "Request failed: " + textStatus );
	    });
	});

	$(document).on('click', '.fb-next-btn', function() {
		if(self._dialog._context.media_type == 'video'){
			$('#active-video2')[0].play();
		}
		self._dialog.NextBehaviorStep(new Printout(self._dialog), 6 );
		//self._dialog.nextWithoutBehavior();
	});

	$(document).on('click', '.fb-post-btn', function() {
		var pub_action = 'fb_share_photo';
		$('.fb-post-btn').prop('disabled', true);
		if(self._dialog._context.media_type == 'video'){
			pub_action = 'fb_share_video';			
		}
		$('.loader').show();
		var user_caption = $('.media-caption').val() + 'By #instantlysg';
		var file_path_before = $('.commentImg').attr('src');
		var file_path = file_path_before.toString().split("#")[0];
		var request = $.ajax({
          url: "uploadMedia",
          //url: "upload.php",
          type: "POST",
          
          data: {sid : systemId, action: pub_action, caption: user_caption, filePath: file_path},
        });

	    request.done(function(data) {
	    	//console.log(data);
	    	$('.fb-post-btn').prop('disabled', false);
	    	$(document).off('click', '.fb-post-btn');
	    	self._dialog.NextBehaviorStep(new Printout(self._dialog), 7 );
	    	$('.loader').hide();
	    });

	    request.fail(function(jqXHR, textStatus) {
	    	$('.fb-post-btn').prop('disabled', false);
	      	alert( "Request failed: " + textStatus );
	      	$('.loader').hide();
	    });
	});

	$(document).on('click', '.print-btn', function() {
		self._dialog.nextWithoutBehavior();
	});

	$(document).on('click', '.mms-btn', function() {
		self.detachEvent();
		self._dialog.nextMMSBehavior(new Printout(self._dialog));
	});

	$(document).on('click', '.email-btn', function() {
		var img_style = [];
		var print_amount = $("select.print-amount").val() || 1;

		$(":checkbox.image-type").each(function() {
			if (this.checked) {
				img_style.push($(this).val());
			}
		});

		if (img_style.length) {

			self.detachEvent();

			self._dialog.setImgType(img_style.join(","));
			self._dialog.setPrintAmount(print_amount);
			
			if ( $( "form.form-data" ).length > 0 ) {
				self._dialog.NextBehaviorStep(new Printout(self._dialog), 3 );
			}
			else {
				self._dialog.NextBehaviorStep(new Printout(self._dialog), 2 );
			}
		}


		keyboard_interface();


	});

	$(document).on('click', '.next-image-style', function() {
		var img_style = [];
		var print_amount = $("select.print-amount").val() || 1;

		$(":checkbox.image-type").each(function() {
			if (this.checked) img_style.push($(this).val());
		});

		if (img_style.length) {
			self.detachEvent();

			self._dialog.setImgType(img_style.join(","));
			self._dialog.setPrintAmount(print_amount);
			self._dialog.print();
			$("#myModal").modal("hide");
			//self._dialog.next(new Printout(self._dialog));

		}
		else $(".err-msg").removeClass("hide");
	});
};
ChoosePhotoStyle.prototype.detachEvent = function() {
		$(document).off('click', '.next-image-style');
		$(document).off('click', '.email-btn');
		$(document).off('click', '.share-btn');
		$(document).off('click', '.fb-login-btn');
		$(document).off('click', '.fb-log-out-btn');
		$(document).off('click', '.fb-next-btn');
		$(document).off('.fb-post-btn');
		$(document).off('click', '.print-btn');
		$(document).off('click', '.mms-btn');
		$(".err-msg").addClass("hide");
	};
	/**
	 * print out action
	 */
Printout = function(dialog) {
	Behavior.call(this, dialog);
};

Printout.contructor = Printout;
Printout.prototype = new Behavior();

Printout.prototype.attachEvent = function() {
	var self = this;
	$(".submit-email").click(function(e) {
		e.preventDefault();

		$('.email-error').html('Please enter a valid email address');

		var email = $("#emailInput").val();
		var name = $("#nameInput").val();
		var address = $("#addressInput").val();
		var emailValidCheck = true;
		var emailErrMsg = '';
		if (email.indexOf(',') > -1){ //check if multiple email
		  var emailArr = email.split(",");
		  for (var i = emailArr.length - 1; i >= 0; i--) {
		  	//check email is valid or not
		  	emailItem = $.trim(emailArr[i]);
		  	
		  	if(emailItem != '' && !self._isValidEmail(emailItem)){
		  		emailValidCheck = false; // set flag false
		  		emailErrMsg += emailItem + ',';
		  	}
		  }

		  //In case of multiple emails, check invalid email error message set or not
		  if(emailErrMsg != ''){
		  	emailErrMsg = emailErrMsg.replace(/,$/, '');
		  	$('.email-error').append(' <br/>"' + emailErrMsg + '"');
		  }

		}else{ // for single email
			emailValidCheck = self._isValidEmail(email);
		}

		if (!emailValidCheck) { //got error, show error message,
			$("#emailInput").focus().parent().addClass("has-error");
			$(".err-msg").removeClass("hide");

		} else {
			self.detachEvent();
			$('.email-error').html('Please enter a valid email address.');
			self._dialog.sendLogMail(email, name, address);

			self._dialog.next(new NullBehavior(self._dialog));
			$("#myModal").modal("hide");
		}
		return false;
	});

	$(".submit-mms").click(function(e) {
		var phone = $("#phoneInput").val();
		if (!self._isValidPhone(phone)) { //got error, show error message,
			$("#phoneInput").focus().parent().addClass("has-error");
			$(".err-msg").removeClass("hide");
		} else {
			self.detachEvent();
			self._dialog.next(new NullBehavior(self._dialog));
			self._dialog.sendMMS(phone);
			$("#myModal").modal("hide");
		}
	});

	this._t = setInterval(function() {
		var email = $("#emailInput").val();
		var mms = $("#phoneInput").val();

		if (email) {
			if (email.length) { //something is in email field. submit button is active
				//$(".modal-btn-grp-3 button").addClass("disabled");
				$(".submit-email").removeClass("disabled");
			} else {
				//$(".modal-btn-grp-3 button").removeClass("disabled");
				$(".submit-email").addClass("disabled");
			}
		}

		if (mms) {
			if (mms.length) {
				//$(".modal-btn-grp-3 button").addClass("disabled");
				$(".submit-mms").removeClass("disabled");
			} else {
				//$(".modal-btn-grp-3 button").removeClass("disabled");
				$(".submit-mms").addClass("disabled");
			}
		}
	}, 500);
};

Printout.prototype.detachEvent = function() {
	$(".submit-email").off('click');
	$(".submit-mms").off('click');
	clearInterval(this._t);
};

Printout.prototype._isValidEmail = function(mail) {
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return filter.test(mail);
};

Printout.prototype._isValidPhone = function(phone) {
	var filter = /^[9|8][0-9]{7}$/;
	return filter.test(phone);
};

var clipData = ''; //hold clip board value in variable 
function keyboard_interface(){
	//Keyboard integration start
	
	//custom copy action
	$.keyboard.keyaction.copy = function(kb,a,b,c) {
		$(".ui-keyboard-input-current").focus();
		clipData = $(".ui-keyboard-input-current").val();
		clipData = createCookie('copy_data', clipData);
		try {
		    var successful = document.execCommand('copy');
		    var msg = successful ? 'successful' : 'unsuccessful';
		    //console.log('Copying text command was ' + msg);
		} catch (err) {
		    //console.log('Oops, unable to copy');
		}
	};

	//custom paste action
	$.keyboard.keyaction.paste = function(kb) {
		clipData = readCookie('copy_data');
		if(clipData != null && clipData != '')
			kb.insertText(clipData);
	};

	var tempEmail = "";
	$(".field-keyboard-tool").keyboard({ 
        layout: 'qwerty',
        usePreview: false, 
        restrictInput: false, 
        preventPaste: true,
        layout: 'custom',
	    customLayout: {
            'normal': [
                '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
                '{tab} q w e r t y u i o p [ ] \\',
                'a s d f g h j k l ; \' {enter}',
                '{shift} z x c v b n m @ , . / {shift}',
                '@ gmail hotmail yahoo .com .sg .com.sg',
                '{copy} {paste} {space} {accept}  {cancel}'
            ],
            'shift': [
                '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
                '{tab} Q W E R T Y U I O P { } |',
                'A S D F G H J K L : " {enter}',
                '{shift} Z X C V B N M < > ? {shift}',
                '@ gmail hotmail yahoo .com .sg .com.sg',
                '{copy} {paste} {space} {accept}  {cancel}'
            ]
	    }
    }).on('beforeVisible', function(){ 
    		tempEmail = ""; 
    		
    		//set keyboard position
    		var inputTopOffset = $(this).offset().top;
    		var inputLeftOffset = $(this).offset().left;
    		var height = $(this).height();

    		var extra_height = 8 ;
    		if($(this).hasClass('add-extra-height-offset')){
    			extra_height = 17;
    		}
    		var offsetTop = (parseInt(inputTopOffset) + parseInt(height) + extra_height);

    		var offsetLeft = (parseInt(inputLeftOffset) - 30);
    		$('.ui-keyboard').css('top', offsetTop);
    		$('.ui-keyboard').css('left', -120);
    });

    $('.field-keyboard-tool').bind('keyboardChange', function(e, keyboard, el) {
        if ( keyboard.last.key == 'enter' || keyboard.last.event.keyCode == 13 ) {
            keyboard.accept();
        }
        tempEmail = keyboard.$preview.val();
    });

    $('.field-keyboard-tool').bind('canceled', function(e, keyboard, el) {
        $(this).val( tempEmail );
    });

    //Keyboard integration end
}

function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function delete_cookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}