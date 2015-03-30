/**
+-------------------------------------------------------------------
* jQuery leoUi--scrollbar
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
*
+-------------------------------------------------------------------
*/
;
(function(factory) {

	if (typeof define === "function" && define.amd) {

		// AMD. Register as an anonymous module.
		define(["leoUi-tools", "jqueryMousewheel"], factory);

	} else {

		// Browser globals
		factory(jQuery);

	}

}(function($) {

	$.leoTools.plugIn({

		name: 'leoScrollbar',

		version: '1.0',

		addJquery: false,

		addJqueryFn: true,

		defaults: {



		},

		_init: function() {
			


		}


	});

	return $;

}));