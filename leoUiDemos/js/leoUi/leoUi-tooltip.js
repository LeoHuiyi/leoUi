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
            +                '<div class="leoTooltip_close">X</div>'
            +                '<div class="leoTooltip_content"></div>'
            +            '</div>',//tooltip的基础html标签

            contentClassName: "leoTooltip_content",//leoTooltip_content的className，如果没有不能设置内容

            closeClassName: "leoTooltip_close",//leoTooltip_close的className。（false或者找不到元素，无关闭按钮事件）

            appendTo:'body',//leoTooltip应该被appendTo到哪个元素

            arrow:true,//是否要箭头

            arrowHeight:10,//箭头高度

            content: function(content, target){

                $(content).text('tooltip(工具提示框)');

            },//tooltip(工具提示框)的内容（ this: null, arguments: content, target ）

            disabled:false,//如果设置为 true，则禁用该 tooltip（工具提示框）

            position:{//设置tooltip的位置（其中of和within属性设置成“window”或者“document”使用当前框架的window或者document）

                orientation:'random',//tooltip相对于position.of的位置（topLeft,topCenter,topRight,leftTop,leftCenter,leftBottom,bottomLeft,bottomCenter,bottomRight,rightTop,rightCenter,rightBottom,random;）

                toCenterOffset:'-25%',//tooltip向中间的偏移量（可用百分比和数字表示）

                collision:"flipfit flipfit",

                of:'window',

                within:'window'

            },

            distance:5,//tooltip(工具提示框)与目标的间隔

            showDelay:'none',//打开tooltip延迟的时间

            hideDelay:'none',//关闭tooltip延迟的时间

            showAnimation: function(next, state) {

                this.show( { effect: "explode", duration: "slow", complete: next } );

                // this.show();

                // next();

            },//tooltip显示的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: next, state）

            hideAnimation: function(next, state) {

                this.hide( { effect: "clip", duration: "slow", complete: next } );

                // this.hide();

                // next();

            },//tooltip关闭的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: next, state）

            beforeShow:$.noop//dialog组件显示之前回调（arguments: target ）

        },

        _init: function(){

            this.$target.hide();

            this._tooltipState = 'close';

            this._setClose();

            this._setPosition();

            this._appendTo();

        },

        _changePosition:function(position){

            var This = this;

            position = $.extend({}, position);

            if(position.of === 'window'){

                position.of = this.window;

            }else if(position.of === 'document'){

                position.of = this.document;

            }

            if(position.within === 'window'){

                position.within = this.window;

            }else if(position.within === 'document'){

                position.within = this.document;

            }

            position.using = function( position, feedback ){

                This._setArrow( feedback );

            };

            return position;

        },

        _appendTo:function(){

            if( this.options.disabled ){ return; }

            this.$target.appendTo( this.options.appendTo );

            this._setContent();

        },

        _destroy:function() {

            this.clearTooltipTimeout('show,hide');

            this.$target.remove();

        },

        _setClose:function(){

            if( this.options.disabled ){return;}

            var This,closeClassName = this.options.closeClassName;

            if( this._close ){

                this._off( this.$target.find( this._close ), 'click.close' );

                delete this._close;

            }

            !!closeClassName && (this._close = this.$target.find( '.' + closeClassName )[0]);

            if( this._close ){

                This = this;

                this._on( this.$target.find( this._close ), 'click.close', function(){

                    This.hide();

                } );

            }

        },

        _setContent:function(){

            var options = this.options,isVisible,$target = this.$target,content,

            $content = this.$content = $target.find( '.' + options.contentClassName );

            if( options.disabled || !$content[0] ){ return; }

            content = options.content;

            isVisible = this._tooltipState === 'open';

            isVisible && $target.hide();

            $.type(content) === 'function' ? content($content[0], $target[0]) : $content.text( options.content );

            isVisible && $target.show();

        },

        tooltipPosition:function(notRandom){

            if( this.options.disabled ){ return; }

            var isVisible = this._tooltipState === 'open',$target = this.$target;

            !!this.options.arrow && $target.css( 'margin', '' );

            this._randomPosition(notRandom);

            !isVisible && $target.show();

            $target.position( this.position );

            !isVisible && $target.hide();

        },

        _setOption:function( key, value ){

            if( key === 'closeClassName' ){

                this._setClose();

                return;

            }

            if( key === 'contentClassName' || key === "content" ){

                this._setContent();

                this.tooltipPosition(true);

                return;

            }

            if( key === 'appendTo' ){

                this._appendTo();

                this.tooltipPosition(true);

                return;

            }

            if( key === 'arrow' ){

                this._destroyArrow();

                this.tooltipPosition(true);

                return;

            }

            if( key === 'arrowHeight' ){

                this.tooltipPosition(true);

                return;

            }

            if( key.indexOf( 'position' ) === 0 || key === 'distance' ){

                this._setPosition();

                this.tooltipPosition(true);

                return;

            }

        },

        _setStrPosition:function(){

            var options = this.options,distance = +options.distance,toCenterOffset = $.trim( options.position.toCenterOffset ),percent,percentNum,num,reverseOffset;

            if( ( percentNum = toCenterOffset.indexOf('%') ) !== -1 ){

                percent = toCenterOffset.slice(percentNum);

                num = toCenterOffset.slice( 0, percentNum );

                reverseOffset = -1 * num;

                reverseOffset < 0 ? reverseOffset = reverseOffset + percent : reverseOffset = "+" + reverseOffset + percent;

            }else{

                toCenterOffset = parseInt(toCenterOffset, 10) || 0;

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

            };

        },

        _setPosition:function(){

            var options = this.options;

            this.position = this._changePosition(options.position);

            this._setStrPosition();

            this._getPosition();

        },

        _getPosition:function(){

            var orientation = this.options.position.orientation;

            if(orientation === 'random'){

                orientation = this.randomPosition || "topLeft";

            }else if(this.randomPosition){

                delete this.randomPosition;

            }

            $.extend( this.position, this.strPosition[orientation] );

        },

        _randomPosition:function(notRandom){

            if( this.options.position.orientation === "random" && !notRandom ){

                this.randomPosition = [ "topLeft", "topCenter", "topRight", "leftTop", "leftCenter", "leftBottom", "bottomLeft", "bottomCenter", "bottomRight", "rightTop", "rightCenter", "rightBottom" ][ $.leoTools.random(11) ];

                $.extend( this.position, this.strPosition[ this.randomPosition ]);

            }

        },

        _setArrow:function( feedback ){

            var arrow = feedback.outerOffsetName,

            arrowHeight = +this.options.arrowHeight,element = feedback.element,

            top = element.top,left = element.left,

            $arrow = this.$arrow,$target = this.$target;

            if(!this.options.arrow){

                $target.css( { top: top, left: left } );

                return;

            }

            !$arrow && ( $arrow = this.$arrow = $('<div class="leoTooltip_arrow"></div>').appendTo( $target ) );

            $arrow.removeClass('leoTooltip_arrow_top leoTooltip_arrow_left leoTooltip_arrow_bottom leoTooltip_arrow_right').css( {'borderColor': '', top: '', left: '' } );

            if( arrow === 'top' ){

                $arrow.addClass('leoTooltip_arrow_top').css( {'borderTopColor': $target.css( 'backgroundColor' ),'left': this._getArrowPosition('horizontal', feedback.target, element, element.width/2) } );

                $target.css( { 'marginBottom': arrowHeight, top: top - arrowHeight, left: left } );

            }else if( arrow === 'left' ){

                $arrow.addClass('leoTooltip_arrow_left').css( { 'borderLeftColor': $target.css( 'backgroundColor' ), 'top': this._getArrowPosition('vertical', feedback.target, element, element.height/2) } );

                $target.css( { 'marginRight': arrowHeight, top: top, left: left - arrowHeight } );

            }else if( arrow === 'bottom' ){

                $arrow.addClass('leoTooltip_arrow_bottom').css( { 'borderBottomColor': $target.css( 'backgroundColor' ), 'left': this._getArrowPosition('horizontal', feedback.target, element, element.width/2) } );

                $target.css( { 'marginTop': arrowHeight, top: top, left: left } );

            }else if( arrow === 'right' ){

                $arrow.addClass('leoTooltip_arrow_right').css( { 'borderRightColor': $target.css( 'backgroundColor' ), 'top': this._getArrowPosition('horizontal', feedback.target, element, element.width/2) } );

                $target.css( { 'marginLeft': arrowHeight, top: top, left: left } );

            }else{

                $target.css( { top: top, left: left } );

            }

        },

        _getArrowPosition:function(important, target, element, val){

            var range = this._arrowRange(important, target, element);

            if(val < range.L){

                val = range.L;

            }else if(val > range.R){

                val = range.R;

            }

            return val;

        },

        _arrowRange:function(important, target, element){

            var L,R;

            if(important === 'vertical'){

                L = target.top - element.top;

                R = target.top + target.height - element.top;

                L < 0 && (L = 0);

                R > element.height && (R = element.height);

            }else if(important === 'horizontal'){

                L = target.left - element.left;

                R = target.left + target.width - element.left;

                L < 0 && (L = 0);

                R > element.width && (R = element.width);

            }

            return{L: L, R: R};

        },

        _destroyArrow:function(){

            if(this.options.arrow === true){return;}

            this.$target.css( 'margin', '' );

            !!this.$arrow && this.$arrow.remove();

            delete this.$arrow;

        },

        tooltipState:function(){

            return this._tooltipState;

        },

        show:function(){

            if( this.options.disabled ){ return; }

            this.options.beforeShow( this.$target[0] );

            this.tooltipPosition();

            this._tooltipShowFn();

        },

        hide:function(){

            if( this.options.disabled ){ return; }

            this._tooltipHideFn();

        },

        _tooltipHideFn:function(){

            this.delayHideTimeId = this._delay(function(){

                delete this.delayHideTimeId;

                if( this.options.disabled ){ return; }

                var This = this;

                this._tooltipState = 'closeing';

                this.options.hideAnimation.call( this.$target, function(){

                    This._tooltipState = 'close';

                }, this._tooltipState);

            }, this.options.hideDelay );

            this.options.hideDelay !== 'none' && (this._tooltipState = 'hideDelaying');

        },

        _tooltipShowFn:function(){

            this.delayShowTimeId = this._delay(function(){

                delete this.delayShowTimeId;

                if( this.options.disabled ){ return; }

                var This = this;

                this._tooltipState = 'opening';

                this.options.showAnimation.call( this.$target, function(){

                    This._tooltipState = 'open';

                }, this._tooltipState);

            },this.options.showDelay);

            this.options.showDelay !== 'none' && (this._tooltipState = 'showDelaying');

        },

        _clearTooltipTimeout:function(id){

            if(id === 'show' && this.delayShowTimeId){

                clearTimeout(this.delayShowTimeId);

                delete this.delayShowTimeId;

            }else if(id === 'hide' && this.delayHideTimeId){

                clearTimeout(this.delayHideTimeId);

                delete this.delayHideTimeId;

            }

        },

        clearTooltipTimeout:function(id){

            if(typeof id !== 'string'){return;}

            if(id === 'all'){

                this._clearTooltipTimeout('show');

                this._clearTooltipTimeout('hide');

                return;

            }

            var This = this;

            id.replace(/[^, ]+/g, function(name){

                This._clearTooltipTimeout(name);

            });

        }

    });

    return $;

}));