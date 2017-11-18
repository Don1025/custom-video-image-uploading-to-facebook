config = {
		imgfoldername: "/imageupload/",
		smtpTransport: {
			service: "Gmail",
			auth: {
				user: "email@instantly.sg",
				pass: "wb8rw9fge1504",
			}
		},
		fbServerUrl: 'https://instantly.sg/fb_api.php',
		mailOptions: {
			from: "Instantly.sg <email@instantly.sg>",
			subject: "Here's Your Photo"
		},

		filter_time_from: 12,
		filter_time_to: 18,
		filter_interval: 30,

		enable_form: 0,
		form_path: "form.htmlx"
};
exports.config = config;
