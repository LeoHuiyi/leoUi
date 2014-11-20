/**
 +-------------------------------------------------------------------
 * jQuery leoUi--dialog
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-position","leoUi-draggable","leoUi-resizable","leoUi-effects"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoDialog',

        version:'1.0',

        dependsFnName:{

            draggable:'leoDraggable',

            resizable:'leoResizable'

        },//依赖函数名

        disableClassName:'leoDialog-disable',//禁止使用CLASSNAME

        defaultsTarget:'dialogHtml',

        addJquery:true,

        addJqueryFn:false,

        defaults:{

            dialogHtml: '<div class="leoDialog">'
            +               '<div class="leoDialog_titlebar leoUi_clearfix">'
            +                   '<span class="leoDialog_title">标 题</span>'
            +               '</div>'
            +               '<div class="leoDialog_content">'
            +               '</div>'
            +           '</div>',

            contentHtml :'<div id="delete_image">'
            +       '<div class="send_content clearfix">'
            +           '<div class="text">'
            +               '<span class="icon"></span>'
            +               '<span class="title">标题内容</span>'
            +           '</div>'
            +           '<div class="send_bottom clearfix">'
            +               '<input class="send_submit" type="submit" value="确定" name="submit" />'
            +               '<input class="send_off" type="submit" value="取消" name="submit" />'
            +           '</div>'
            +       '</div>'
            +   '</div>',

            modal:true,

            quickClose: false,// 是否支持快捷关闭（点击遮罩层自动关闭）

            disable:false,

            titlebarDblclickMax:true,//双击标题栏最大化

            appendTo: 'body',

            modalShowDelay: 0,

            modalHideDelay: 0,

            showDelay:0,

            hideDelay:0,

            width:400,

            height:'auto',

            zIndex:1000,

            isMoveToTop:false,//是否在最上面

            scope:'all',//用来设置leoDialog对象的集合

            getScope:'all',//用来取得leoDialog对象的集合

            okHandle:'.send_submit',

            cancelHandle:'.send_off',

            restore:false,//是否每次都回到初始值

            okCallBack:$.noop,

            cancelCallBack:$.noop,

            captionButtons:{

                pin: true,

                refresh:false,

                toggle: true,

                minimize: true,

                maximize: true,

                close: true

            },

            position: {

                my: "center",

                at: "center",

                of: window,

                collision: "fit",

                using: function(pos) {

                    var topOffset = $(this).css(pos).offset().top;

                    if (topOffset < 0) {

                        $(this).css("top", pos.top - topOffset);

                    }

                }

            },

            initDraggable: true,

            draggableOption:{

                distance:1,

                bClone:false,

                handle:'.leoDialog_titlebar',

                containment:'document',

                iframeFix:false,

                stopMouseWheel:false

            },

            fixIframeMask:false,

            initResizable:true,

            resizableOption:{

                distance:0,

                edge:4,

                bClone:false,

                handles:'all',

                containment:'document',

                minWidth:210,

                minHeight:190,

                maxWidth:'max',

                maxHeight:'max',

                iframeFix:false,

                stopMouseWheel:false

            },

            makeModel:function(target){

                var zIndex = $(target).css('zIndex');

                zIndex > 1 && ( zIndex = zIndex -1 );

                return $('<div class="a" style = "position: fixed;top: 0px; left: 0px;width:100%;height:100%;background-color:black;overflow:hidden;z-index: '+ zIndex +';"></div>').hide().appendTo('body');

            },

            modalShowAnimation: function(callback)  {

                this.css({
                    "display": 'block',
                    "position": "fixed",
                    "opacity": 0
                }).animate({
                    "opacity": 0.8
                }, 500, callback);

            },

            modalHideAnimation: function(callback) {

                this.css({
                    "display": 'block',
                    "position": "fixed",
                    "opacity": 0.8
                }).animate({
                    "opacity": 0
                }, 500, callback);

            },

            showAnimation: function(callBack) {

                this.show( { effect: "clip", duration: "slow", complete: callBack } );

            },

            hideAnimation: function(callBack) {

                this.hide( { effect: "explode", duration: "slow", complete: callBack } );

            },

            makeModelDialogShow:function( modelShowFn, dialogShowFn ){

                modelShowFn(dialogShowFn);

            },

            makeModelDialogHide:function( modelHideFn, dialogHideFn ){

                dialogHideFn(modelHideFn);

            },

            initCallBack: $.noop,

            beforeShow:$.noop,

            closeCallBack:$.noop,

            quickCloseCallBack:$.noop,

            iframeLoadCallBack:$.noop,

            resize: $.noop,

            dialogShowCallBack: function(clickCallBackName){

                // this.dialogHide();

            },

            dialogHideCallBack: function(clickCallBackName){

                // this.modalHide();

            },

            modalDialogHideCallBack:function(clickCallBackName){

                // console.log(this)

            }

        },

        _init:function(){

            var op = this.options;

            this._createDialog();

            this._appentTo();

            this._createCaptionButtons();

            this._createOkButton();

            this._createCancelButton();

            this._setButton();

            this._dialogEventBind();

            this._setInnerIframe();

            this.originalSize = {

                width:op.width,

                height:op.height,

                position:$.extend( {}, op.position )

            }

            this._dialogState = 'close';

            this.$modal = false;

            this.firstTime = true;

            this.isMaximize = false;

            this.isMaximize = false;

            this.hasResizable = false;

            this.draggableDisabled = false;

            this.hasDraggable = false;

            this._makeDraggable(true);

            this._makeResizable(true);

            this._setElements( this.scope = op.scope );

            this._createDblclick();

            op.initCallBack.call( this.$target );

        },

        _setZindex:function(){

            this.$target.css( 'z-index', this.options.zIndex );

        },

        _getHandle:function(event, handle) {

            return $( event.target ).closest( this.$target.find(handle) )[0];

        },

        _createDblclick:function(){

            if( this.options.titlebarDblclickMax === false || !this.$uiDialogTitlebar ){ return; }

            var This = this;

            this._on( this.$uiDialogTitlebar, 'dblclick.max', function(event){

                event.preventDefault();

                event.stopPropagation();

                if( This._dialogState === 'open' && !$(event.target).closest('a.leoDialog_titlebar_button')[0] ){

                    if( This.isMaximize ){

                        This._leoDialogRestor();

                    }else{

                        This.$target[This.dependsFnName.resizable]( 'trigger', This.$target, 'mouseleave' );

                        This._leoDialogMaximize();

                    }

                }

            });

        },

        _destroyDblclick:function(){

            this._off( this.$uiDialogTitlebar, 'dblclick.max' );

        },

        _createOkButton:function(){

            var okHandle = this.options.okHandle,This = this;

            if( okHandle === false ){return;}

            if( !this.$ok ){

                this.$ok = {

                    element:this.$target.find( okHandle ),

                    eventBind:false

                };

            }else{

                this.$ok.element = this.$target.find( okHandle );

            }

            if( this.$ok.element && this.$ok.eventBind === false ){

                this._on( this.$ok.element, 'click.ok', function(event){

                    This.options.okCallBack.call( this, event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

                    This.clickCallBackName = 'okCallBack';

                }, 'supportDisabled' );

                this.$ok.eventBind = true;

            }

        },

        _destroyOkButton:function(){

            if( this.$ok.element && this.$ok.eventBind === true ){

                this._off( this.$ok.element, 'click.ok' );

                this.$ok.eventBind = false;

                this.$ok.element = null;

            }

        },

        _createCancelButton:function(){

            var cancelHandle = this.options.cancelHandle,This = this;

            if( cancelHandle === false ){return;}

            if( !this.$cancel ){

                this.$cancel = {

                    element:this.$target.find( cancelHandle ),

                    eventBind:false

                };

            }else{

                this.$cancel.element = this.$target.find( cancelHandle );

            }

            if( this.$cancel.element && this.$cancel.eventBind === false ){

                this._on( this.$cancel.element, 'click.cancel', function(event){

                    This.options.cancelCallBack.call( this, event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

                    This.clickCallBackName = 'cancelCallBack';

                }, 'supportDisabled' );

                this.$cancel.eventBind = true;

                this.$cancel.element = null;

            }

        },

        _destroyCancelButton:function(){

            if( this.$cancel.element && this.$cancel.eventBind === true ){

                this._off( this.$cancel.element, 'click.cancel' );

                this.$cancel.eventBind = false;

            }

        },

        _createCaptionButtons:function(){

            var o = this.options,i,buttonArrLength,This = this,buttonArr = [],

            buttons = {

                pin: {

                    visible: !!o.captionButtons.pin,

                    click: '_leoDialogPin',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOn: "leoDialog_pin_span_on",

                    iconClassOff: "leoDialog_pin_span_off"

                },

                refresh: {

                    visible: !!o.captionButtons.refresh,

                    click: '_leoDialogRefresh',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOn: "leoDialog_refresh_span"

                },

                toggle: {

                    visible: !!o.captionButtons.toggle,

                    click: '_leoDialogToggle',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOff: "leoDialog_toggle_span_hide",

                    iconClassOn: "leoDialog_toggle_span_show"

                },

                minimize: {

                    visible: !!o.captionButtons.minimize,

                    click: '_leoDialogMinimize',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOn: "leoDialog_minimize_span"

                },

                maximize: {

                    visible: !!o.captionButtons.maximize,

                    click: '_leoDialogMaximize',

                    floatClass:'leoDialog_titlebar_button_float',

                    iconClassOn: "leoDialog_maximize_span"

                },

                close: {

                    visible: !!o.captionButtons.close,

                    click: 'modalDialogHide',

                    floatClass:'leoDialog_titlebar_button_float',

                    iconClassOn: "leoDialog_close_span"

                },

                restore:{

                    visible:true,

                    notAppendToHeader:true,

                    click: '_leoDialogRestor',

                    floatClass:'leoDialog_titlebar_button_float',

                    iconClassOn: "leoDialog_restore_span"

                }

            },

            uiDialogTitlebar = this.$uiDialogTitlebar = this.$target.find('div.leoDialog_titlebar');

            !this.buttons && ( this.buttons = {} );

            this.index = [];

            $.each( buttons, function ( name, value ) {

                buttonArr.push( { button: name, info: value } );

            });

            for ( i = 0, buttonArrLength = buttonArr.length; i < buttonArrLength; i++ ) {

                this._createCaptionButton( buttonArr[i], uiDialogTitlebar );

            }

            delete this.index;

        },

        _createCaptionButton:function( buttonHash, uiDialogTitlebar ){

            var buttonObject,beforeElement,length,index,

            info = buttonHash.info,name = buttonHash.button,createNotAppendToHeader = false,

            buttonCss = 'leoDialog_' + name,This = this,deleteNotAppendToHeader = false,

            button = uiDialogTitlebar.find( 'a.' + buttonCss ),

            floatHideClass = info.floatClass || info.hideClass;

            !!info.notAppendToHeader && ( !!this.buttons[name] ? deleteNotAppendToHeader = ( !this.buttons.minimize && !this.buttons.maximize ) : createNotAppendToHeader = ( !!this.buttons.minimize || !!this.buttons.maximize ) );

            if( info.visible ){

                if( deleteNotAppendToHeader ){

                    delete this.buttons[name];

                    return;

                }

                if ( !button[0] || createNotAppendToHeader ){

                    buttonObject = $('<a href="###"></a>').append( $("<span></span>").addClass(' leoDialog_titlebar_button_span ' + info.iconClassOn ).text( buttonHash.button ) ).addClass( buttonCss + " leoDialog_titlebar_button " + floatHideClass ).attr("role", "button");

                    this._on( buttonObject, 'click.' + name, function(event){

                        event.preventDefault();

                        event.stopPropagation();

                        if( This._dialogState === 'open' ){

                            name === 'close' && ( This.options.closeCallBack.call( This, this ), This.clickCallBackName = 'closeCallBack' );

                            This[info.click]();

                        }

                    });

                    if( name === 'maximize' ){

                        var time = null;

                        this._on( this.window, 'resize.maximize', function(){

                            !!time && clearTimeout(time);

                            time = setTimeout( function(){

                                if( This.isMaximize ){

                                    This._getBorderWidths();

                                    var window = This.window,height,

                                    width = window.width() - This.borderWidths.left - This.borderWidths.right;

                                    !!This.contentHide ? height = 'auto' : height = window.height() - This.borderWidths.top - This.borderWidths.bottom;

                                    This._setSizes( { width: width, height : height, cssPosition: 'fixed', top: 0, left: 0 } );

                                }

                            }, 100 );

                        })

                    }

                    if( !info.notAppendToHeader ){

                        index = this.index;

                        length = index.length;

                        if( length === 0 ){

                            buttonObject.appendTo( uiDialogTitlebar );

                        }else{

                            beforeElement = this.buttons[index[length-1]].element;

                            !!beforeElement && buttonObject.insertAfter(beforeElement);

                        }

                        index.push( name );

                    }

                    this.buttons[name] = $.extend( { element: buttonObject[0] }, info );

                }

            }else if( !!button[0] ){

                button.remove();

                name === 'maximize' && this._off( this.window, 'resize.maximize' );

                delete this.buttons[name];

            }

        },

        _dialogEventBind:function(){

            var This = this;

            this._on( this.$target, 'mousedown.ToTop', function(event){

                This._moveToTop();

            });

        },

        _handleDisabledOption:function( disabled ){

            if ( disabled ){

                if ( !this.disabledDiv ){

                    this.disabledDiv = $('<div style = " width: 100%; height: 100%; position: absolute;top: 0; left: 0; z-index: 1 " ></div>')

                }

                this.disabledDiv.show().prependTo( this.$target );

                this._setResizableDisabled(true);

            }else if( this.disabledDiv ){

                this.disabledDiv.detach();

                this._setResizableDisabled(false);

            }

        },

        _destoryDisabledDiv:function(){

            if( this.disabledDiv ){

                this.disabledDiv.remove();

                this.disabledDiv = null;

            }

        },

        _handleIframeMask: function(flag) {

            if( !this.innerIframe ){return;}

            if ( flag === true ) {

                !this.mask && ( this.mask = $('<div style = " width: 100%; height: 100%; position: absolute;top: 0; left: 0; z-index: 1 " ></div>') );

                this.mask.show().prependTo( this.$content );

            }else if( flag === false ){

                !!this.mask && this.mask.detach();

            }

        },

        _setInnerIframe:function(){

            if( this.options.fixIframeMask ){

                var $content = this.$content,$iframe = $content.find('iframe'),

                iframeLoadCallBack = this.options.iframeLoadCallBack;

                if( $iframe[0] ){

                    this.innerIframe = $iframe[0];

                    this._on( $iframe, 'load', function(event){

                        !!iframeLoadCallBack && iframeLoadCallBack.call( $content, event );

                    } );

                }else{

                    this.innerIframe = false;
                }

            }else{

                this.innerIframe = false;

            }

        },

        _destoryIframe:function(){

            if( this.innerIframe ){

                var iframe = this.innerIframe,$iframe = $( this.innerIframe );

                this._off( $iframe, 'load' );

                $iframe.attr('src', 'about:blank');

                try{

                    iframe.contentWindow.document.write('');

                    iframe.contentWindow.document.close();

                }catch(e){};

                (/msie/.test(navigator.userAgent.toLowerCase())) && CollectGarbage();

                $iframe.remove();

            }

        },

        _destoryIframeMask: function() {

            if ( this.innerIframe && this.mask ) {

                this.mask.remove();

                this.mask = null;

            }

        },

        _leoDialogRefresh:function(){

            if ( this.innerIframe ) {

                var $fr = $( this.innerIframe );

                $fr.attr( "src", $fr.attr("src") );

            }

        },

        _leoDialogMinimize:function(){

            !this.$minimizeBar && ( this.$minimizeBar = $('<div style="position:fixed;bottom:0;left:0;padding:0;margin:0">') );

            if( this.isMaximize ){

                !!this.buttons.maximize && $( this.buttons.maximize.element ).show();

                this.isMaximize = false;

            }else{

                !this.contentHide ? this._saveOldSize() : this._saveOldSize('offset');

                this._setDraggableDisabled(true);

                this._setResizableDisabled(true);

            }

            this.isMinimize = true;

            this._leoDialogRestoreAdd( $( this.buttons.minimize.element ) );

            this._wrapMinimize();

        },

        _wrapMinimize:function(){

            this.$target.find('.leoDialog_titlebar_button_float').css( 'float', 'left' ).end().find('.leoDialog_titlebar_button_hide').hide();

            var zIndex;

            !this.$modal ? zIndex = this.options.zIndex : zIndex = this.$modal.css('zIndex') + 1;

            if( this.innerIframe ){

                this.$target.hide();

                this.$minimizeBar.css( 'zIndex', zIndex ).append( this.$uiDialogTitlebar.clone( true ) ).appendTo('body');

            }else{

                this.$content.hide();

                this.$target.css( { width: 'auto', height: 'auto', position: 'static', float: 'left'} ).wrap( this.$minimizeBar.css( 'zIndex', zIndex ) );

            }

        },

        _unWrapMinimize:function(){

            this.$target.find('.leoDialog_titlebar_button_float').css( 'float', '' ).end().find('.leoDialog_titlebar_button_hide').show();

            if( this.innerIframe ){

                this.$target.show();

                this.$minimizeBar.empty();

            }else{

                !this.contentHide && this.$content.show();

                this.$target.unwrap();

            }

        },

        _leoDialogMaximize:function(){

            if( this.isMinimize ){

                this._unWrapMinimize();

                this.isMinimize = false;

            }else{

                this._setDraggableDisabled(true);

                this._setResizableDisabled(true);

                !this.contentHide ? this._saveOldSize() : this._saveOldSize('offset');

            }

            this.isMaximize = true;

            this._getBorderWidths();

            var window = this.window,height,

            width = window.width() - this.borderWidths.left - this.borderWidths.right;

            !!this.contentHide ? height = 'auto' : height = window.height() - this.borderWidths.top - this.borderWidths.bottom;

            this._setSizes( { width: width, height : height, cssPosition: 'fixed', top: 0, left: 0 } );

            this._leoDialogRestoreAdd( $( this.buttons.maximize.element ) );

            this.options.resize.call(this.$target[0]);

        },

        _leoDialogToggle:function(){

            var $span = $( this.buttons.toggle.element ).find('.leoDialog_titlebar_button_span'),

            classOff = this.buttons.toggle.iconClassOff ,

            isOff = $span.hasClass(classOff);

            if(isOff){

                $span.removeClass(classOff);

                this.contentHide = false;

                this.$content.show();

                if( this.isMaximize ){

                    this._getBorderWidths();

                    this._setSize( 'height', this.window.height() - this.borderWidths.top - this.borderWidths.bottom );

                }else{

                    this._setSize( 'height', this.oldSize.height );

                    this._setResizableDisabled(false);

                }

            }else{

                !this.isMaximize && ( this._saveOldSize(),  this._setResizableDisabled(true) );

                this.$target.css( 'height', 'auto' );

                this.$content.hide();

                $span.addClass(classOff);

                this.contentHide = true;

            }

        },

        _leoDialogPin:function(){

            var $span = $( this.buttons.pin.element ).find('.leoDialog_titlebar_button_span'),

            classOff = this.buttons.pin.iconClassOff,

            hasOff = $span.hasClass(classOff);

            if(hasOff){

                $span.removeClass(classOff);

                this.draggableDisabled = false;

                this._setDraggableDisabled(false);

            }else{

                $span.addClass(classOff);

                this._setDraggableDisabled(true);

                this.draggableDisabled = true;

            }

        },

        _getBorderWidths:function() {

            this.borderWidths = {

                left: $.leoTools.parseCss(  this.$target[0] ,'borderLeftWidth' ),

                top: $.leoTools.parseCss(  this.$target[0] ,'borderTopWidth' ),

                right: $.leoTools.parseCss(  this.$target[0] ,'borderRightWidth' ),

                bottom: $.leoTools.parseCss(  this.$target[0] ,'borderBottomWidth' )

            };

        },

        _saveOldSize:function(key){

            var offset = this.$target.offset();

            if( key === 'offset' ){

                this.oldSize.offset = { top:offset.top, left:offset.left };

                this.oldSize.postion = this.$target.css('position');

                return;

            }

            this.oldSize = {

                width:this.$target.width(),

                height:this.$target.height(),

                cssPosition:this.$target.css('position'),

                offset:{ top:offset.top, left:offset.left }

            }

        },

        _leoDialogRestoreAdd:function(btn){

            !!this.buttons.restore && $( this.buttons.restore.element ).insertBefore(btn);

            btn.hide();

        },

        _leoDialogRestor:function(){

            var size = $.extend( {}, this.oldSize );

            if( this.isMinimize ){

                this._unWrapMinimize();

                this.isMinimize = false;

            }

            if( this.isMaximize ){

                !!this.buttons.maximize && $( this.buttons.maximize.element ).show();

                this.isMaximize = false;

            }

            this._setDraggableDisabled(false);

            this._setResizableDisabled(false);

            if( this.contentHide ){

                size.height = 'auto';

                this.$content.hide();

            }

            this._setSizes( size );

            this.$target.offset( size.offset );

            this.options.resize.call(this.$target[0]);

            $( this.buttons.restore.element ).detach();

        },

        _bottunDisable:function(el){

            var This = this;

            return function(){

                This._addElemDisableClassName(el);

            }

        },

        _bottunEnable:function(el){

            var This = this;

            return function(){

                This._removeElemDisableClassName(el);

            }

        },

        _createDialog:function(){

            this.$content = this.$target.hide().css( 'z-index', this.options.zIndex ).find( '.leoDialog_content' ).append( this.options.contentHtml );

        },

        _appentTo:function(){

            this.$target.appendTo(  this.options.appendTo );

        },

        _setFirstGialogSize:function(){

            if( this.firstTime === true ){

                var op = this.options,

                width = op.width,height = op.height,

                $target = this.$target,$content = this.$content;

                $content.css( 'width', 'auto' );

                $target.css({  height: 'auto', width: width, top: -1999, left: -1999 }).show();

                this.reHeight = $target.height() - $content.height();

                this.reWidth = $target.width() - $content.width();

                $target.css({height: height}).position(op.position).hide();

                $content.width( width === 'auto' ? 'auto' : width - this.reWidth ).height( height === 'auto' ? 'auto' : height - this.reHeight );

                this.firstTime = false;

            }

        },

        _setSizes:function(option){

            var key;

            for ( key in option ) {

                if( option.hasOwnProperty( key ) ){

                    this._setSize( key, option[key] );

                }

            }

        },

        _setSize:function( key, value ){

            var $target = this.$target,This = this,$content = this.$content,

            isVisible = $target.is( ":visible" );

            !isVisible && $target.show();

            if( key === 'width' ){

               $target.width(value);

               $content.width( value === 'auto' ? 'auto' : value - this.reWidth );

            }

            if( key === 'height' ){

               $target.height(value);

               $content.height( value === 'auto' ? 'auto' : value - this.reHeight );

            }

            if( key === 'position' ){

                $target.position(value);

            }

            if( key === 'offset' ){

                $target.offset(value);

            }

            if( key === 'top' ){

                $target.css( 'top' , value );

            }

            if( key === 'cssPosition' ){

                $target.css( 'position' , value );

            }

            if( key === 'left' ){

                $target.css( 'left' , value );

            }

            !isVisible && $target.hide();

        },

        _setButton:function(){

            this.$target.find( this.options.cancelHandle + ',' + this.options.okHandle ).attr( 'role','button' );

        },

        _restore:function(){

            this.firstTime === false && this.options.restore === true && this._setSizes( this.originalSize );

        },

        dialogShow:function(){

            if( this._dialogState === 'close' && !this.$modal ){

                this._restore();

                this._setFirstGialogSize();

                this._moveToTop();

                this._createOverlay();

                this._setDraggableDisabled(true);

                this._setResizableDisabled(true);

                this.options.beforeShow.call( this.$target );

                !this.$modal ? this._dialogShow() : this.options.makeModelDialogShow.call( this, this._modalShowFn(), this._dialogShowFn() );

            }

        },

        _dialogShowCallback:function(){

            this._setDraggableDisabled(false);

            this._setResizableDisabled(false);

            this.options.dialogShowCallBack.call( this, this.clickCallBackName );

        },

        _makeDraggable:function(init){

            var op = this.options,dependsFnName = this.dependsFnName;

            if( !$.fn[dependsFnName.draggable] ){

                return;

            }

            if ( op.initDraggable ) {

                if( init === true && this.hasDraggable === false ){

                    var This = this;

                    this.draggableDefault = {

                        cancel:'[ role = "button" ]',

                        onStartDrag:function(){

                            This._handleIframeMask(true);

                            This.hasResizable && This.$target[dependsFnName.resizable].setCursorChange(false);

                        },

                        onBeforeStopDrag:function(){

                            This._handleIframeMask(false);

                            This.hasResizable && This.$target[dependsFnName.resizable].setCursorChange(true);

                        }

                    }

                    this.$target[dependsFnName.draggable]( $.extend( op.draggableOption, this.draggableDefault ) );

                    this.hasDraggable = true;

                }

                this.$target[dependsFnName.draggable]( 'option', $.extend( op.draggableOption, this.draggableDefault ) );

            }else if( !op.initDraggable && init === false && this.hasDraggable === true ){

                this.$target[dependsFnName.draggable]('destroy');

                this.hasDraggable = false;

            }

        },

        _setDraggableDisabled:function(flag){

            this.hasDraggable && !this.draggableDisabled && !this.isMinimize && !this.isMaximize && this.$target[this.dependsFnName.draggable]( 'option','disabled', flag );

        },

        _makeResizable:function(init){

            var op = this.options,dependsFnName = this.dependsFnName;

            if( !$.fn[dependsFnName.resizable] ){

                return;

            }

            if ( op.initResizable ) {

                if( init === true && this.hasResizable === false ){

                    var This = this;

                    this.resizableDefault = {

                        onStartResize:function(){

                            This._handleIframeMask(true);

                        },

                        onResize:function( event, $dragBox, width, height ){

                            This.$content.css({

                                width:width - This.reWidth,

                                height:height - This.reHeight

                            })

                            op.resize.call(this, event);

                        },

                        onStopResize:function(){

                            This._handleIframeMask(false);

                        },

                        mouseMoveCurIn:function(cur){

                            if( !This.hasDraggable ){ return; }

                            if( !( cur === 'S-resize' || cur === 'SW-resize' || cur === 'SE-resize' ) ){

                                this.addClass('leoDialog_inherit');

                            }

                            this[dependsFnName.draggable]( 'setLockDrag', true );

                        },

                        mouseMoveCurOut:function(cur){

                            if( !This.hasDraggable ){ return; }

                            this.removeClass('leoDialog_inherit')[dependsFnName.draggable]( 'setLockDrag', false );

                        }

                    }

                    this.$target[dependsFnName.resizable]( $.extend( op.resizableOption, this.resizableDefault ) );

                    this.hasResizable = true;

                }

                this.$target[dependsFnName.resizable]( 'option', $.extend( op.resizableOption, this.resizableDefault ) );

            }else if( !op.initResizable && init === false && this.hasResizable === true ){

                this.$target[dependsFnName.resizable]('destroy');

                this.hasResizable = false;

            }

        },

        _setResizableDisabled:function(flag){

            this.hasResizable && !this.isMinimize && !this.isMaximize && !this.contentHide && this.$target[this.dependsFnName.resizable]( 'option','disabled', flag );

        },

        _setOption:function( key, value ){

            if( key.indexOf('draggableOption') === 0 ){

                this._makeDraggable();

                return;

            }

            if( key.indexOf('resizableOption') === 0 ){

                this._makeResizable();

                return;

            }

            if( key === 'disable' ){

               this._handleDisabledOption(value);

               return;

            }

            if( key === 'titlebarDblclickMax' ){

                if( value === false ){

                    this._destroyDblclick();

                }else{

                    this._destroyDblclick();

                    this._createDblclick();

                }

                return;

            }

            if( key === 'fixIframeMask' ){

                this._setInnerIframe();

                return;

            }

            if( key === 'okHandle' ){

                if( value === false ){

                    this._destroyOkButton();

                }else{

                    this._destroyOkButton();

                    this._createOkButton();

                }

                return;

            }

            if( key === 'cancelHandle' ){

                if( value === false ){

                    this._destroyCancelButton();

                }else{

                    this._destroyCancelButton();

                    this._createCancelButton();

                }

                return;

            }

            if( key === 'width' || key === 'height' ) {

                this._setSize( key, value );

                return;

            }

            if( key === 'cancelHandle' || key === 'okHandle' ) {

                this._setButton();

                return;

            }

            if( key === 'initDraggable') {

                this._makeDraggable(value);

            }

            if( key === 'zIndex') {

                this._setZindex();

                return;

            }

            if( key === 'contentHtml') {

                this._setContent();

                return;

            }

            if( key === 'appendTo') {

                this._appentTo();

                return;

            }

            if( key === 'scope') {

                this._deletElements( this.scope );

                this._setElements(value);

                this.scope = value;

                return;

            }

            if( key === 'initResizable' ){

                this._makeResizable(value);

                return;

            }

            if ( key.indexOf('position') === 0 ) {

                this._setSize( 'position', this.options.position );

                return;

            }

            if ( key.indexOf('captionButtons') === 0 ) {

                this._createCaptionButtons();

                return;

            }


        },

        modalDialogHide:function(){

            !this.$modal ? this._dialogHide() : this.options.makeModelDialogHide.call( this,this._modalHideFn(),this._dialogHideFn() );

        },

        _createOverlay:function(){

            if( this.options.modal && !this.$modal ){

                var This = this;

                this.$modal = this.options.makeModel.call( null, this.$target[0] );

                this.modalState = 'close';

                !!this.options.quickClose && this._on( this.$modal, 'click', function(){

                    This.modalState === 'open' && This._dialogState === 'open' && ( This.options.quickCloseCallBack.call( This, this ), This.clickCallBackName = 'quickCloseCallBack', This.modalDialogHide() );

                } );

            }

        },

        _destroyOverlay:function(){

            if( this.$modal ){

                this.$modal.remove();

                this.$modal = false;

                delete this.modalState;

            }

        },

        _dialogHideCallback:function(){

            this.options.dialogHideCallBack.call( this, this.clickCallBackName );

        },

        _moveToTop:function() {

            if( this.options.isMoveToTop === false ){ return; }

            var arr = this._getElements( this.options.getScope, true ),arrLength = arr.length,

            zIndicies = [],zIndexMax,i;

            if( arrLength > 1 ){

                for ( i = 0; i < arrLength; i++ ) {

                    zIndicies.push( $( arr[i] ).css( "z-index" ) );

                }

                zIndexMax = Math.max.apply( null, zIndicies );

                zIndexMax >= + this.$target.css( "z-index" ) && this.$target.css( "z-index", zIndexMax + 1 );

            }

        },

        moveToTop: function() {

            this._moveToTop();

        },

        dialogState:function(){

            return this._dialogState;

        },

        _modalShowFn:function(){

            var This = this;

            return function(callback){

                This._modalShow(callback);

            }

        },

        _modalShow:function(callback){

            if( !this.$modal ){ return; }

            this._delay(function(){

                if( this.modalState === 'open' && this.modalState === 'opening' ){

                    return;

                }

                var This = this;

                this.modalState = 'opening';

                this.options.modalShowAnimation.call(this.$modal,

                    function(){

                        This.modalState = 'open';

                        !!callback && callback.call(This);

                    }

                );

            },this.options.modalShowDelay);

        },

        _dialogShowFn:function(){

            var This = this;

            return function(callback){

                This._dialogShow(callback)

            }

        },

        _dialogShow:function(callback){

            this._delay(function(){

                 if( this._dialogState === 'open' || this._dialogState === 'opening' ){

                    return;

                }

                var This = this,$target = this.$target;

                !!this.innerIframe && !!this.isMinimize && ( $target = this.$minimizeBar );

                this._dialogState = 'opening';

                this.options.showAnimation.call( $target,

                    function(){

                        This._dialogState = 'open'

                        !!callback && callback.call(This);

                        This._dialogShowCallback.call(This);

                    }

                );

            },this.options.showDelay);

        },

        _beforeDialogHideCallback:function(){

            this.hasDraggable && this.$target[this.dependsFnName.draggable]( 'option','disabled', true );

            this.hasResizable && this.$target[this.dependsFnName.resizable]( 'option','disabled', true );

        },

        _modalDialogHideCallback:function(){

            if( !this.$modal && this._dialogState === 'close' ){

                this.options.modalDialogHideCallBack.call( this, this.clickCallBackName );

            }

        },

        _modalHideFn:function(){

            var This = this;

            return function(callback){

                This._modalHide(callback);

            }

        },

        _modalHide:function(callback){

            if( !this.$modal ){ return; }

            this._delay(function(){

                if( this.modalState === 'close' && this.modalState === 'closeing' ){

                    return;

                }

                var This = this;

                this.modalState = 'closeing';

                this.options.modalHideAnimation.call( this.$modal,

                    function(){

                        This.modalState = 'close';

                        This._destroyOverlay();

                        !!callback && callback.call(This);

                        This._modalDialogHideCallback.call(This);

                    }

                );

            }, this.options.modalHideDelay );

        },

        modalHide:function(){

            this._modalHide();

        },

        _dialogHide:function(callback){

            this._delay( function(){

                if( this._dialogState === 'close' || this._dialogState === 'closeing' ){

                    return;

                }

                var This = this,$target = this.$target;

                !!this.innerIframe && !!this.isMinimize && ( $target = this.$minimizeBar );

                this._beforeDialogHideCallback.call(this);

                this._dialogState = 'closeing';

                this.options.hideAnimation.call( $target,

                    function(){

                        This._dialogState = 'close';

                        !!callback && callback.call(This);

                        This._dialogHideCallback.call(This);

                        This._modalDialogHideCallback.call(This);

                    }

                );

            }, this.options.hideDelay );

        },

        dialogHide:function(){

            this._dialogHide();

        },

        _dialogHideFn:function(){

            var This = this;

            return function(callback){

                This._dialogHide(callback);

            }

        },

        _destroy:function(){

            this.$target[this.dependsFnName.draggable]('destroy');

            this.$target[this.dependsFnName.resizable]('destroy');

            this._destoryIframe();

            this.$target.remove();

            !!this.buttons.restore && $( this.buttons.restore.element ).remove();

            !!this.$minimizeBar && this.$minimizeBar.remove();

            this._destoryIframeMask();

            this._destoryDisabledDiv();

            this._destroyOverlay();

            this._deletElements( this.scope );

        }

    },{

        _initElements:function(fn){

            var _elements = {};

            this._getElements = function( scope, isVisible ){

                if( !_elements[scope] || !isVisible ){ return _elements[scope] || []; }

                var arr = [],i = _elements[scope].length,el;

                 while( i-- ){

                    el = _elements[scope][i];

                    $(el).is(':visible') === true && arr.push(el)

                }

                return arr;

            }

            this._setElements = function(scope){

                _elements[scope] = _elements[scope] || [];

                _elements[scope].push( this.$target[0] );

            }

            this._deletElements = function(scope){

                if( _elements[scope] === undefined ){

                    return;

                }

                var elements = _elements[scope] ,length = elements.length,element = this.$target[0];

                for (var i = 0; i < length; i++) {

                    if(elements[i] === element){

                        elements.splice(i,1);

                    }

                };

            }

        }

    });

    return $;

}));