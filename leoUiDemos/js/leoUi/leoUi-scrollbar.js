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

		name:'leoScrollbar',

		version:'1.0',

		addJquery:false,

		addJqueryFn:true,

		defaults:{

			showBarBtn:true,

			limitRateV:1.5,//竖直方向，拖动头最小高度和拖动头宽度比率

			limitRateH:1.5//水平方向，拖动头最小宽度和高度的比率

		},

		_init:function() {

			this._render();


		},

		_render:function(){

			var $target = this.$target,

			$children = $target.addClass('leoUi_helper_reset leoScrollbar').css({'overflow': 'hidden', 'position': 'relative'}).children();

			this.$content = $('<div class="leoScrollbar_scroller leoUi_helper_reset"></div>').appendTo($target).append($children);

			this.vWidth = $target.width();

			this.vHeight = $target.height();

			this.cWidth = $children.width();

			this.cHeight = $children.height();

			this._renderScrollbar();

		},

		_createScrollbar:function(direction){

			var $str;

			if(this.options.showBarBtn){

				$str = $('<div class="leoScrollbar_scrollbar leoUi_helper_reset leoUi_clearfix"><div class="leoScrollbar_arrow leoScrollbar_arrow_up"><b class="leoScrollbar_scrollbar_trangle_up"></b></div><div class="leoScrollbar_draggerpar"><div class="leoScrollbar_dragger"></div></div><div class="leoScrollbar_arrow leoScrollbar_arrow_down"><b class="leoScrollbar_scrollbar_trangle_down"></b></div></div>').hide();

			}else{

				$str = $('<div class="leoScrollbar_scrollbar leoUi_helper_reset leoUi_clearfix"><div class="leoScrollbar_draggerpar"><div class="leoScrollbar_dragger"></div></div></div>').hide();

			}

			if(direction === 'v'){

				this.$vScrollbar = $str.addClass('leoScrollbar_scrollbar_right').appendTo(this.$target);

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

			showBarBtn = this.options.showBarBtn,

			vScrollbarDraggerparLen, hScrollbarDraggerparLen,

			vScrollbarArrowUpH, hScrollbarArrowUpW,

			vScrollbarDraggerparH, hScrollbarDraggerparW,

			vDraggerLen, hDraggerLen;

			if(($vScrollbar = this.$vScrollbar) && ($hScrollbar = this.$hScrollbar)){

				this.$vScrollbarDraggerpar = $vScrollbar.find('.leoScrollbar_draggerpar');

				this.$vScrollbarDragger = this.$vScrollbarDraggerpar.find('.leoScrollbar_dragger');

				this.$hScrollbarDraggerpar = $hScrollbar.find('.leoScrollbar_draggerpar');

				this.$hScrollbarDragger = this.$hScrollbarDraggerpar.find('.leoScrollbar_dragger');

				vScrollbarH = this.vHeight - this.scrollbarWidth;

				hScrollbarW = this.vWidth - this.scrollbarWidth;

				if(showBarBtn){

					vScrollbarArrowUpH = $vScrollbar.find('.leoScrollbar_arrow_up').outerHeight();

					hScrollbarArrowUpW = $hScrollbar.find('.leoScrollbar_arrow_up').outerWidth();

					vScrollbarDraggerparH = vScrollbarH - vScrollbarArrowUpH - $vScrollbar.find('.leoScrollbar_arrow_down').outerHeight();

					hScrollbarDraggerparW = hScrollbarW - $vScrollbar.find('.leoScrollbar_arrow_down').outerHeight() - hScrollbarArrowUpW;

					this.$vScrollbarDraggerpar.css({top: vScrollbarArrowUpH, height: vScrollbarDraggerparH});

					this.$hScrollbarDraggerpar.css({left: hScrollbarArrowUpW, width: hScrollbarDraggerparW});

				}else{

					this.$vScrollbarDraggerpar.css({top: 0, height: (vScrollbarDraggerparH = vScrollbarH)});

					this.$hScrollbarDraggerpar.css({left: 0, width: (hScrollbarDraggerparW = hScrollbarW)});

				}

				this.$content.css({height: vScrollbarH, width: hScrollbarW});

				$vScrollbar.css({height: vScrollbarH, 'visibility': 'hidden'}).height(vScrollbarH).show();

				$hScrollbar.css({width: hScrollbarW, 'visibility': 'hidden'}).show();

				vDraggerLen = this._getDraggerLen(vScrollbarDraggerparH, 'v');

				hDraggerLen = this._getDraggerLen(hScrollbarDraggerparW, 'h');

				this.vDraggerparLen = vScrollbarDraggerparH - vDraggerLen;

				this.hDraggerparLen = hScrollbarDraggerparW - hDraggerLen;

				console.log(this.vDraggerparLen)

				console.log(this.hDraggerparLen)

				this.$vScrollbarDragger.css({top:0, height: vDraggerLen, width: '100%'});

				this.$hScrollbarDragger.css({left:0, width: hDraggerLen, height: '100%'});


			}else if(($vScrollbar = this.$vScrollbar)){




			}else if(($hScrollbar = this.$hScrollbar)){




			}





		},

		_getDraggerLen:function(draggerparLen, direction){

			var draggerLen = 0, minLen;

			if(direction === 'v'){

				draggerLen = draggerparLen*this.vHeight/this.cHeight;

				minLen = this.options.limitRateV*this.$vScrollbarDraggerpar.outerWidth();

				if(minLen > draggerLen){

					return Math.round(minLen);

				}else if(draggerLen > draggerparLen){

					return Math.round(draggerparLen);

				}else{

					return Math.round(draggerLen);

				}

			}else if(direction === 'h'){

				draggerLen = draggerparLen*this.vWidth/this.cWidth;

				minLen = this.options.limitRateH*this.$vScrollbarDraggerpar.outerHeight();

				if(minLen > draggerLen){

					return Math.round(minLen);

				}else if(draggerLen > draggerparLen){

					return Math.round(draggerparLen);

				}else{

					return Math.round(draggerLen);

				}

			}

		},

		_getVScrollVal:function(){

			



		}


	});

	return $;

}));