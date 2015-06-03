/**
+-------------------------------------------------------------------
* jQuery leoUi--mouse//参考jqueryUi
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
/*!
 * jQuery UI Mouse @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    var mouseHandled = false;

    $( document ).on( "mouseup", function() {

        mouseHandled = false;

    });

    $.leoTools.plugIn({

        name:'leoMouse',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            cancel:'input,textarea,button,select,option',//防止在指定元素上开始拖动

            delay:0,//时间（以毫秒为单位），当鼠标按下后延迟多少秒激活拖动

            distance:0,//当鼠标按下后移动多少px激活拖动

            isSetCapture:false,//是否使用setCapture

            mouseDownSelector:false//是否使用事件代理

        },

        _init: function(){

            this.isSetCapture = this.options.isSetCapture ? 'setCapture' in this.document[0].documentElement : false;

            this.userSelect = $.leoTools.getPrefixProperty('user-select');

            this._lockDrag = false;

            this._setMouseDownEvent();

            this.started = false;

        },

        _setOption:function( key, value ){

            if( key === 'mouseDownSelector' ){

                this._setMouseDownEvent(true);

            }

        },

        _setMouseDownEvent:function(change){

            var This = this,selector = this.options.mouseDownSelector;

            if( !this._$target ){

                this._$target = this.$target;

            }else{

                this.$target = this._$target;

            }

            if( change === true ){

                this._off( this.$target, 'mousedown.mouse' );

                this._off( this.$target, 'click.mouse' );

            }

            if( selector === false ){

                selector = '';

                delete this.isDelegatSelector;

                delete this._$target;

            }else{

                this.isDelegatSelector = true;

            }

            this._on( this.$target, 'click.mouse', selector, function(event) {

                if( true === $.data( event.target, This.dataId + ".preventClickEvent" ) ){

                    $.removeData( event.target, This.dataId + ".preventClickEvent" );

                    event.stopImmediatePropagation();

                    return false;

                }

            });

            this._on( this.$target, 'mousedown.mouse', selector, function(event) {

                if( !This._lockDrag ){

                    event.delegateTarget !== this && ( This.$target = $(this) );

                    return This._mouseDown(event);

                }

            });

        },

        _textselect:function(bool) {

            this.userSelect ? this.document.css(this.userSelect, bool ? "none" : "") : this.document[0].unselectable = bool ? "off" : "on";

        },

        setLockDrag:function(flag){

            this._lockDrag = !!flag;

        },

        _destroy: function(){},

        _mouseDown: function(event){

            if ( mouseHandled ) {

                return;

            }

            this._mouseMoved = false;

            ( this._mouseStarted && this._mouseUp(event) );

            this._mouseDownEvent = event;

            var This = this, btnIsLeft = ( event.which === 1 ),

            options = this.options,

            elIsCancel = ( typeof options.cancel === "string" && event.target.nodeName ? $( event.target ).closest( options.cancel ).length : false );

            if( !btnIsLeft || elIsCancel || !this._mouseCapture(event) ){

                return true;

            }

            this.mouseDelayMet = !options.delay;

            if( !this.mouseDelayMet ){

                this._mouseDelayTimer = setTimeout(function() {

                    This.mouseDelayMet = true;

                }, options.delay);

            }

            if( this._mouseDistanceMet(event) && this._mouseDelayMet(event) ){

                this._mouseStarted = ( this._mouseStart(event) !== false);

                if ( !this._mouseStarted ) {

                    event.preventDefault();

                    return true;

                }

            }

            if( true === $.data( event.target, this.dataId + ".preventClickEvent" ) ){

                $.removeData( event.target, this.dataId + ".preventClickEvent" );

            }

            this._mouseMoveDelegate = function(event) {

                return This._mouseMove(event);

            };

            this._mouseUpDelegate = function(event) {

                return This._mouseUp(event);

            };

            this._on( this.document, 'mousemove.mouse', this._mouseMoveDelegate );

            this._on( this.document, 'mouseup.mouse', this._mouseUpDelegate );

            this._textselect(true);

            this.isSetCapture && this._mouseDownEvent.target.setCapture();

            event.preventDefault();

            mouseHandled = true;

            return true;

        },

        _mouseMove: function(event) {

            if (this._mouseMoved) {

                if ($.leoTools.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {

                    return this._mouseUp(event);

                } else if (!event.which) {

                    return this._mouseUp(event);

                }

            }

            if (event.which || event.button) {

                this._mouseMoved = true;

            }

            if(this._mouseStarted){

                this._mouseDrag(event);

                return event.preventDefault();

            }

            if( this._mouseDistanceMet(event) && this._mouseDelayMet(event) ){

                this._mouseStarted = (this._mouseStart(this._mouseDownEvent, event) !== false);

                (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));

            }

            return !this._mouseStarted;

        },

        _mouseUp: function(event) {

            this._off( this.document, 'mousemove.mouse', this._mouseMoveDelegate );

            this._off( this.document, 'mouseup.mouse', this._mouseUpDelegate );

            this._textselect(false);

            this.isSetCapture && this._mouseDownEvent.target.releaseCapture();

            if (this._mouseStarted) {

                this._mouseStarted = false;

                if (event.target === this._mouseDownEvent.target) {

                    $.data( event.target, this.dataId + ".preventClickEvent", true );

                }

                this._mouseStop(event);

            }

            mouseHandled = false;

            return false;

        },

        _mouseDistanceMet: function(event) {

            return ( Math.max( Math.abs( this._mouseDownEvent.pageX - event.pageX), Math.abs( this._mouseDownEvent.pageY - event.pageY ) ) >= this.options.distance );

        },

        _mouseDelayMet: function(/* event */) {

            return this.mouseDelayMet;

        },

        _mouseStart: function(/* event */) {},

        _mouseDrag: function(/* event */) {},

        _mouseStop: function(/* event */) {},

        _mouseCapture: function(/* event */) { return true; }

    });

    return $;

}));