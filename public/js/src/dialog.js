Dialog = function (context, socket) {
	var file_ext = context.url.split('.').pop();

	if(file_ext == 'gif' || file_ext == 'GIF'){
		context.print_btn = 'disabled="disabled"';
	}else{
		context.print_btn = '';
	}
	
	context.is_autoplay = 'autoplay';
	this._context = context;
	this._socket = socket;
	if( context.media_type == 'video' ){

		var source = $('#dialog-video-tpl').html();
		//check form data available - which means form enable
		if( source.indexOf('form-data') !== -1 ){
			context.is_autoplay = '';
		}
		var compiledTemplate = Handlebars.compile(source);
		var result = compiledTemplate(context);
		$(document.body).append(result);
	}else{
		var source = $('#dialog-tpl').html();
		var compiledTemplate = Handlebars.compile(source);
		var result = compiledTemplate(context);
		$(document.body).append(result);
	}

	if ( $( "form.form-data" ).length > 0 ) {
		this.setBehavior(new FirstBehavior(this));
	}
	else {
		this.setBehavior(new ChoosePhotoStyle(this));
	}

	this._modal = $("#myModal").modal();
	this._carousel = $("#carousel-example-generic").carousel({interval: false});

	//check video media & form data available - which means form enable
	if( context.media_type == 'video' && source.indexOf('form-data') !== -1 ){
		$('.yes-btn, .btn-next').click(function(){
			$('#active-video1')[0].play();
		});

		$('.fb-next-btn').click(function(){
			$('#active-video2')[0].play();
		});
	}

	if ( Array.isArray( context.url ) ) {
		this._behavior.detachEvent();
		
		if ( $( "form.form-data" ).length > 0 ) {
			this.NextBehaviorStep( new Printout(this), 3 );
		}
		else {
			this.NextBehaviorStep( new Printout(this), 2 );
		}
	}
	else {
		$("#commentImg").attr("src", context.url);//added this so that on click an image, a preview is shown
		$(".commentImg").attr("src", context.url);//added this so that on click an image, a preview is shown
	}

	this.attachEvent();
};

Dialog.prototype.attachEvent = function () {
	var self = this;

	this._modal.on('hidden.bs.modal', function (e) {
		self._behavior.detachEvent();
		$('#myModal').remove();
		self = null;
	});
};

Dialog.prototype.sendMail = function () {
	var self = this;
	this._context.imgtypes = this._imgType;
	this._context.amount = this._printAmount;
	
	$.ajax({
		url: '/sendMail',
		type: 'POST',
		data: this._context
	}).done(function (data) {
		self.filename = data.filename;
	});
};

Dialog.prototype.print = function() {
	var self = this;
	this._context.imgtypes = this._imgType;
	this._context.amount = this._printAmount;

	socket.emit('print', this._context);

	var npobj = this._context.obj.find( "span.numberprinted");
	npobj.attr( 'data-np', parseInt( npobj.attr('data-np') ) + parseInt( this._printAmount ) );
	npobj.text( npobj.attr('data-np') );

};

Dialog.prototype.sendMMS = function (phoneNumer) {
	var self = this;
	this._context.phoneNumer=phoneNumer;
	 $.ajax({
		url: '/sendmms',
		type: 'POST',
		data: this._context
	}).done(function (data) {
		// MMS sent
	});
};

Dialog.prototype.sendLogMail = function (mail, name, address) {
	var self = this;
	this._context.imgtypes = this._imgType;
	this._context.amount = this._printAmount;
	this._context.name=name;
	this._context.mail=mail;
	this._context.address=address;

	$.ajax({
		url: '/sendMail',
		type: 'POST',
		data: {
			mail		: mail,
			url			: this._context.url
		}
	}).done(function (data) {
		// self.filename = data.filename;
	});
};

Dialog.prototype._printPhoto = function () {
	popup = window.open();
	popup.document.write('<img src="' + this._context.url + '" />');
	popup.print();
};

Dialog.prototype.setImgType = function (type) {
	this._imgType = type;
};

Dialog.prototype.setPrintAmount = function (amount) {
	this._printAmount = amount;
};

Dialog.prototype.setBehavior = function (behavior) {
	this._behavior = behavior;
	this._behavior.attachEvent();
};

Dialog.prototype.next = function (newbehavior) {
	this._carousel.carousel('next');
	this.setBehavior(newbehavior);
};

Dialog.prototype.nextWithoutBehavior = function () {
	this._carousel.carousel('next');
};

Dialog.prototype.NextBehaviorStep = function (newbehavior, step) {
	this._carousel.carousel(step);
	this.setBehavior(newbehavior);
};

Dialog.prototype.nextMMSBehavior = function (newbehavior) {
	this._carousel.carousel(3);
	this.setBehavior(newbehavior);
};
