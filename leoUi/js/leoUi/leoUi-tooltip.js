/**
+-------------------------------------------------------------------
* jQuery leoUi--tooltip
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-position","leoUi-tools","leoUi-effects"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

	$.leoTools.plugIn({

        name:'leoTooltip',

        version:'1.0',

        addJquery:true,

        addJqueryFn:false,

        defaultsTarget:'tooltipHtml',

        defaults:{

        	tooltipHtml: '<div class="leoTooltip">'
            +                '<div class="leoTooltip_titlebar leoUi_clearfix">标 题</div>'
            +				 '<div class="leoTooltip_close">X</div>'
            +                '<div class="leoTooltip_content"></div>'
            +            '</div>',

            contentClassName: "leoTooltip_content",

            closeClassName: "leoTooltip_close",

            appendTo:'body',

            arrow:true,//是否要箭头

            arrowHeight:10,//箭头高度

            content: 'tooltip(工具提示框)的内容',//tooltip(工具提示框)的内容。

			disabled:false,//如果设置为 true，则禁用该 tooltip（工具提示框）。

			isPositionStr:true,//false使用jqueryUi的position自带的API

			position:{

				positionStr: 'random',//topLeft,topCenter,topRight,leftTop,leftCenter,leftBottom,bottomLeft,bottomCenter,bottomRight,rightTop,rightCenter,rightBottom,random;

				toCenterOffset:'-25%',//向内的偏移量

				collision: "flipfit flipfit"

			},

			distance:5,//tooltip(工具提示框)与目标的间隔

			showDelay:0,

            hideDelay:0,

            showAnimation: function( callBack,prop ) {

                this.css(prop).show( { effect: "clip", duration: "slow", complete: callBack } );

            },

            hideAnimation: function(callBack) {

                this.hide( { effect: "clip", duration: "slow", complete: callBack } );

            },

            beforeShow:$.noop

        },

        _init: function(){

            this.$target.hide();

        	this._setClose();

        	this._setPosition();

        	this._appendTo();

        	this._tooltipState = 'close';

        },

        _appendTo:function(){

            if( this.options.disabled ){ return; }

        	this.$target.appendTo( this.options.appendTo );

            this._setContent();

        },

        _destroy:function() {

           this.$target.remove();

        },

        _setClose:function(){

            !!this._close && this._off( this.$target.find( this._close ), 'click.close' );

            this._close = this.$target.find( '.' + this.options.closeClassName )[0];

            if( this._close ){

                var This = this;

                this._on( this.$target.find( this._close ), 'click.close', function(){

                    This.hide();

                } );

            }

        },

        _setContent:function(){

            if( this.options.disabled ){ return; }

            var isVisible = this.$target.is( ":visible" );

            isVisible && this.$target.hide();

            this.$target.css( { width: '', height: '' } );

            this.$content = this.$target.find( '.' + this.options.contentClassName );

        	this.$content.text( this.options.content );

        	this.prop = { width: this.$target.outerWidth(), height: this.$target.outerHeight() };

            isVisible && this.$target.show();

        },

        tooltipPosition:function(){

            if( this.options.disabled ){ return; }

        	var isVisible = this.$target.is( ":visible" );

            !isVisible && this.$target.show();

            this._getPosition();

            this.$target.position( $.extend( this.position, { elemWidth: this.prop.width, elemHeight: this.prop.height } ) );

            !isVisible && this.$target.hide();

        },

        _setOption:function( key, value ){

            if( key === 'closeClassName' ){

                this._setClose();

            }

            if( key === 'contentClassName' || key === "content" ){

                this._setContent();

            }

            if( key === 'appendTo' ){

                this._appendTo();

            }

            if( key === 'arrow' || key === 'isPositionStr' || key === 'arrowHeight' || key.indexOf( 'position' ) === 0 ){

                !this.options.arrow && this._destroyArrow();

                this._setPosition();

            }

        },

        setOfTraget:function(OfTraget){

        	this.position.of = OfTraget;

        },

        _setStrPosition:function(){

        	var options = this.options,distance = options.distance,toCenterOffset = $.trim( options.position.toCenterOffset ),percent,percentNum,num;

            if( ( percentNum = toCenterOffset.indexOf('%') ) !== -1 ){

                percent = toCenterOffset.slice(percentNum);

                num = toCenterOffset.slice( 0, percentNum );

                reverseOffset = -1 * num;

                reverseOffset < 0 ? reverseOffset = reverseOffset + percent : reverseOffset = "+" + reverseOffset + percent;

            }else{

                reverseOffset = -1 * toCenterOffset;

                reverseOffset >= 0 && ( reverseOffset = "+" + reverseOffset );

            }

        	this.strPosition = {

        		topLeft: { my: "center bottom-" + distance, at: "left" + reverseOffset + " top" },

        		topCenter: { my: "center bottom-" + distance, at: "center top" },

	            topRight: { my: "center bottom-" + distance, at: "right" + toCenterOffset + " top" },

	            leftTop: { my: "right-" + distance + " center", at: "left top" + reverseOffset },

	            leftCenter: { my: "right-" + distance + " center", at: "left center" },

	            leftBottom: { my: "right-" + distance + " center", at: "left bottom" + toCenterOffset },

	            bottomLeft: { my: "center top+" + distance, at: "left" + reverseOffset + " bottom" },

	            bottomCenter: { my: "center top+" + distance, at: "center bottom" },

	            bottomRight: { my: "center top+" + distance, at: "right" + toCenterOffset + " bottom" },

	            rightTop: { my: "left+" + distance + " center", at: "right top" + reverseOffset },

	            rightCenter: { my: "left+" + distance + " center", at: "right center" },

	            rightBottom: { my: "left+" + distance + " center", at: "right bottom" + toCenterOffset }

        	}

        },

        _setPosition:function(){

        	var options = this.options,This = this;

        	if( !options.isPositionStr ){

        		this.position = options.position;

                this._destroyArrow();

        		delete this.strPosition;

        	}else{

        		this._setStrPosition();

        		this.position = { collision: this.options.position.collision, of: this.options.position.of || window, within: this.options.position.within || window }

        		this._getPosition(true);

        		!!this.options.arrow && ( this.position.using = function( position, feedback ){

	        		This._setArrow( feedback );

	            } )

        	}

        },

        _getPosition:function(init){

        	if( !this.options.isPositionStr ){ return; }

         	if( this.options.position.positionStr === "random" ){

                !!this.options.arrow && this.$target.css( 'margin', '' );

        		$.extend( this.position, this.strPosition[ [ "topLeft", "topCenter", "topRight", "leftTop", "leftCenter", "leftBottom", "bottomLeft", "bottomCenter", "bottomRight", "rightTop", "rightCenter", "rightBottom" ][ $.leoTools.random(11) ] ]);

        	}else if(init){

        		$.extend( this.position, this.strPosition[ this.options.position.positionStr ]);

        	}

        },

        _setArrow:function( feedback ){

            var arrow = feedback.outerOffsetName,

            arrowHeight = this.options.arrowHeight,

            top = feedback.element.top,left = feedback.element.left;

        	!this.$arrow && ( this.$arrow = $('<div class="leoTooltip_arrow"></div>').appendTo( this.$target ) );

        	this.$arrow.removeClass('leoTooltip_arrow_top leoTooltip_arrow_left leoTooltip_arrow_bottom leoTooltip_arrow_right').css( {'borderColor': '', top: '', left: '' } );

        	if( arrow === 'top' ){

        		this.$arrow.addClass('leoTooltip_arrow_top').css( {'borderTopColor': this.$target.css( 'backgroundColor' ),'left': feedback.element.width/2 } );

                this.$target.css( { 'marginBottom': arrowHeight, top: top - arrowHeight, left: left } );

        	}else if( arrow === 'left' ){

        		this.$arrow.addClass('leoTooltip_arrow_left').css( { 'borderLeftColor': this.$target.css( 'backgroundColor' ), 'top': feedback.element.height/2 } );

                this.$target.css( { 'marginRight': arrowHeight, top: top, left: left - arrowHeight } );

        	}else if( arrow === 'bottom' ){

                this.$arrow.addClass('leoTooltip_arrow_bottom').css( { 'borderBottomColor': this.$target.css( 'backgroundColor' ), 'left': feedback.element.width/2 } );

                this.$target.css( { 'marginTop': arrowHeight, top: top, left: left } );

        	}else if( arrow === 'right' ){

                this.$arrow.addClass('leoTooltip_arrow_right').css( { 'borderRightColor': this.$target.css( 'backgroundColor' ), 'top': feedback.element.height/2 } );

                this.$target.css( { 'marginLeft': arrowHeight, top: top, left: left } );

        	}else{

                this.$target.css( { top: top, left: left } );

            }

        },

        _destroyArrow:function(){

            this.$target.css( 'margin', '' );

            !!this.$arrow && this.$arrow.remove();

            delete this.$arrow;

        },

        tooltipState:function(){

        	return this._tooltipState;

        },

        show:function(){

            if( this.options.disabled ){ return; }

            this.options.beforeShow.call( this.$target );

            this.tooltipPosition();

            this._tooltipShowFn();

        },

        hide:function(){

            if( this.options.disabled ){ return; }

        	this._tooltipHideFn();

        },

        _tooltipHideFn:function(){

            !!this.delayHideTime && clearTimeout( this.delayHideTime );

            this.delayHideTime = this._delay(function(){

                if( this.options.disabled ){ return; }

                var This = this;

                this._tooltipState = 'closeing';

                this.options.hideAnimation.call( this.$target, function(){

                    This._tooltipState = 'close';

                }, this.prop );

            }, this.options.hideDelay );

        },

        _tooltipShowFn:function(){

            !!this.delayShowTime && clearTimeout( this.delayShowTime );

            this.delayShowTime = this._delay(function(){

                if( this.options.disabled ){ return; }

                var This = this;

                this._tooltipState = 'opening';

                this.options.showAnimation.call( this.$target, function(){

                    This._tooltipState = 'open';

                }, this.prop );

            },this.options.showDelay);

        }

    });

	return $;

}));