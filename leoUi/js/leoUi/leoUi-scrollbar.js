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

			showBarBtn: true,


		},

		_init: function() {

			this._render();


		},

		_render:function(){

			var $target = this.$target,

			$children = this.$children = $target.addClass('leoUi_helper_reset leoScrollbar').css({'overflow': 'hidden', 'position': 'relative'}).children().addClass('leoScrollbar_scroller leoUi_helper_reset');

			console.log($target.width())

			this.vWidth = parseInt($target.width(), 10);

			this.vHeight = parseInt($target.height(), 10);

			this.cWidth = parseInt($children.width(), 10);

			this.cHeight = parseInt($children.height(), 10);

			this._renderScrollbar();

		},

		_createScrollbar:function(direction){

			var $str;

			if(this.options.showBarBtn){

				$str = $('<div class="leoScrollbar_scrollbar leoUi_helper_reset leoUi_clearfix"><div class="leoScrollbar_arrow leoScrollbar_arrow_up"><b></b></div><div class="leoScrollbar_draggerpar"><div class="leoScrollbar_dragger"></div></div><div class="leoScrollbar_arrow leoScrollbar_arrow_down"><b></b></div></div>').hide();

			}else{

				$str = $('<div class="leoScrollbar_scrollbar leoUi_helper_reset leoUi_clearfix"><div class="leoScrollbar_draggerpar"><div class="leoScrollbar_dragger"></div></div></div>').hide()


			}

			if(direction === 'v'){

				this.$vScrollbar = $str.appendTo(this.$target);

			}else{

				this.$hScrollbar = $str.addClass('leoScrollbar_scrollbar_bottom').appendTo(this.$target);

			}

		},

		_renderScrollbar:function(){

			var showLeft = this.vHeight <= this.cHeight,

			showRight = this.vWidth <= this.cWidth,

			$target = this.$target;

			!!this.$vScrollbar && (this.$vScrollbar.remove(), this.$vScrollbar = null);

			!!this.$hScrollbar && (this.$hScrollbar.remove(), this.$hScrollbar = null);

			this.scrollbarWidth = 0;

			if(showLeft && showRight){

				this._createScrollbar('v');

				this._createScrollbar();

				this.scrollbarWidth = this.$vScrollbar.outerWidth();

				this._setScrollbarSize();




			}else if(showLeft){




			}else if(showRight){




			}


		},

		_setScrollbarSize:function(){

			var $vScrollbar, $hScrollbar, vScrollbarH, hScrollbarW,

			showBarBtn = this.options.showBarBtn;

			if(($vScrollbar = this.$vScrollbar) && ($hScrollbar = this.$hScrollbar)){

				this.$vScrollbarDraggerpar = this.$vScrollbar.find('.leoScrollbar_draggerpar');

				showBarBtn ? this.$vScrollbarDraggerpar.height(vScrollbarH - $vScrollbar.find('.leoScrollbar_arrow_up').outerHeight() - $vScrollbar.find('.leoScrollbar_arrow_down').outerHeight()) : this.$vScrollbarDraggerpar.height(vScrollbarH);

				$vScrollbar.height((vScrollbarH = this.vHeight - this.scrollbarWidth)).show();

				this.$hScrollbarDraggerpar = $hScrollbar.find('.leoScrollbar_draggerpar');

				showBarBtn ? this.$hScrollbarDraggerpar.width(hScrollbarW - $hScrollbar.find('.leoScrollbar_arrow_up').outerWidth() - $hScrollbar.find('.leoScrollbar_arrow_down').outerWidth()) : this.$hScrollbarDraggerpar.width(hScrollbarW);

				$hScrollbar.width((hScrollbarW = this.vWidth - this.scrollbarWidth)).show();

				this.$children.width(hScrollbarW).height(vScrollbarH);


			}else if(($vScrollbar = this.$vScrollbar)){




			}else if(($hScrollbar = this.$hScrollbar)){




			}





		}


	});

	return $;

}));