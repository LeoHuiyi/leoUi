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

            dialogHtml:'<div class="leoDialog">'
            +               '<div class="leoDialog_titlebar leoUi_clearfix">'
            +                   '<span class="leoDialog_title"></span>'
            +               '</div>'
            +               '<div class="leoDialog_content">'
            +               '</div>'
            +           '</div>',//dialog的基础html标签，其中leoDialog_titlebar为标题栏className，leoDialog_title为标题className，leoDialog_content为内容contentHtml的className，这几个className是必须的。

            contentHtml:'<div id="delete_image">'
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
            +   '</div>',//leoDialog_content中的html标签

            modal:true,//是否使用遮罩层

            title:'标 题',//dialog标题的内容

            quickClose: false,// 是否支持快捷关闭（点击遮罩层自动关闭）

            disabled:false,//是否禁止dialog

            titlebarDblclickMax:true,//是否支持双击标题栏最大化

            appendTo:'body',//dialog应该被appendTo到哪个元素

            modalShowDelay:0,//打开遮罩层延迟的时间

            modalHideDelay:0,//关闭遮罩层延迟的时间

            showDelay:0,//打开dialog延迟的时间

            hideDelay:0,//关闭dialog延迟的时间

            width:400,//设置dialog的宽度（数值或者auto）

            height:'auto',//设置dialog的高度（数值或者auto）

            zIndex:1000,//设置dialog的z-index

            isMoveToTop:false,//保持当前的的dialog在最上面，一个页面2个以上dialog建议开启

            scope:'all',//用来设置MoveToTop的leoDialog对象的集合

            getScope:'all',//用来取得MoveToTop的leoDialog对象的集合

            okButtonClassName:'.send_submit',//okButton的className的selector

            cancelButtonClassName:'.send_off',//cancelButton的className的selector

            restore:false,//是否每次打开dialog还原状态（使用options中的width，height，position设置打开）

            captionButtons:['pin', 'refresh', 'toggle', 'minimize', 'maximize', 'close'],//是否使用按钮，有'pin', 'refresh', 'toggle', 'minimize', 'maximize', 'close'可选，按照顺序显示，不用按钮可用false标示

            position:{//参考jqueryUi的API（其中of属性设置成“window”或者“document”使用当前框架的window或者document）

                my:"center",

                at:"center",

                of:'window',

                collision:"fit"

            },

            initDraggable: true,//是否使用拖拽组件(leoDraggable)

            draggableOption:{//拖拽组件的options（参考leoDraggable）

                distance:1,

                bClone:false,

                handle:'.leoDialog_titlebar',

                containment:'document',

                iframeFix:false,

                stopMouseWheel:false

            },

            initResizable:true,//是否使用缩放组件(leoResizable)

            resizableOption:{//缩放组件的options（参考leoResizable）

                distance:0,

                edge:4,

                handles:'all',

                containment:'document',

                minWidth:220,

                minHeight:190,

                maxWidth:'max',

                maxHeight:'max',

                iframeFix:false,

                stopMouseWheel:false

            },

            initCallBack:$.noop,//dialog组件初始化回调（ this: publicMethods, arguments: target ）

            beforeShow:$.noop,//dialog组件显示之前回调（ this: publicMethods, arguments: target ）

            okCallBack:$.noop,//点击ok按钮回调（ this: publicMethods, arguments: event, bottunDisable, bottunEnable））

            cancelCallBack:$.noop,//点击cancel按钮回调（ this: publicMethods, arguments: event, bottunDisable, bottunEnable））

            closeCallBack:$.noop,//点击close按钮回调（this: publicMethods, arguments: event, close）

            quickCloseCallBack:$.noop,//点击罩盖层按钮回调（this: publicMethods, arguments: event, modal）

            iframeLoadCallBack:$.noop,//iframe load结束回调（this: publicMethods, arguments: event, iframe）

            resize:$.noop,//dialog大小调整回调（this: publicMethods, arguments: target）

            dialogFocus:$.noop,//dialog聚焦（this: publicMethods, arguments: target）

            dialogBlur:$.noop,//dialog丢失焦点（this: publicMethods, arguments: target）

            makeModel:function(target){

                var zIndex = $(target).css('zIndex');

                zIndex > 1 && ( zIndex = zIndex -1 );

                return $('<div style = "position: fixed;top: 0px; left: 0px;width:100%;height:100%;background-color:black;overflow:hidden;z-index: '+ zIndex +';"></div>').hide().appendTo('body')[0];

            },//创建罩盖层,必须返回elem或者jquery对象（this: publicMethods, arguments: target）

            makeDisabledDiv:function(target){

                return $( "<div>" ).css( { position: "absolute", width: '100%', height: '100%', opacity: 0, 'backgroundColor':'#fff', 'overflow': 'hidden', 'visibility': 'visible', 'display': 'block', 'top': 0, 'left': 0, 'padding': 0, 'margin': 0, 'border': 0, 'outline': 'none' } )[0];

            },//创建disabled===true的罩盖层, appendTo->dialog,必须返回elem或者jquery对象（this: publicMethods, arguments: target）

            modalShowAnimation:function(callBack, publicEvent)  {

                this.css({
                    "display": 'block',
                    "position": "fixed",
                    "opacity": 0
                }).animate({
                    "opacity": 0.8
                }, 500, callBack);

                // this.css("opacity", 0.8).show();

                // callBack();

            },//modal显示的回调，可自定义动画等，在显示完毕必须调用callBack（this: $modal, arguments: callBack, publicEvent）

            modalHideAnimation:function(callBack, publicEvent) {

                this.animate({
                    "opacity": 0
                }, 500, callBack);

                // this.hide();

                // callBack();

            },//modal关闭的回调，可自定义动画等，在显示完毕必须调用callBack（this: $modal, arguments: callBack, publicEvent）

            showAnimation:function(callBack, publicEvent) {

                this.show( { effect: "clip", duration: "slow", complete: callBack } );

                // this.show();

                // callBack();


            },//dialog显示的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: callBack, publicEvent）

            hideAnimation:function(callBack, publicEvent) {

                this.hide( { effect: "explode", duration: "slow", complete: callBack } );

                // this.hide();

                // callBack();

            },//dialog关闭的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: callBack, publicEvent）

            makeModelDialogShow:function( modelShowFn, dialogShowFn ){

                modelShowFn(dialogShowFn);

            },//调整modal，dialog显示调用顺序（this: publicMethods, arguments: modelShowFn, dialogShowFn）

            makeModelDialogHide:function( modelHideFn, dialogHideFn ){

                dialogHideFn(modelHideFn);

            },//调整modal，dialog关闭调用顺序（this: publicMethods, arguments: modelHideFn, dialogHideFn）

            dialogShowCallBack:function(target){

                // this.dialogHide();

            },//dialog显示完毕回调（this: publicMethods, arguments: target）

            dialogHideCallBack:function(clickCallBackName){

                // this.modalHide();

            },//dialog关闭完成回调，clickCallBackName：okCallBack, cancelCallBack, closeCallBack, quickCloseCallBack。（this: publicMethods, arguments: clickCallBackName）

            modalDialogHideCallBack:function(clickCallBackName){

                // console.log(this)

            }//dialog和Model关闭完成回调，clickCallBackName：okCallBack, cancelCallBack, closeCallBack, quickCloseCallBack。（this: publicMethods, arguments: clickCallBackName）

        },

        _init:function(){

            var op = this.options;

            this._dialogState = 'close';

            this.$modal = false;

            this.firstTime = true;

            this.isMaximize = false;

            this.isMaximize = false;

            this.hasResizable = false;

            this.draggableDisabled = false;

            this.hasDraggable = false;

            this.buttons = {};

            this._changePosition();

            this._createDialog();

            this._setContent();

            this.setDialogTitle();

            this._createCaptionButtons();

            this._createOkButton();

            this._createCancelButton();

            this._dialogToTopEvent();

            this._createDblclick();

            this._setDialogs( this.scope = op.scope );

            this._appentTo();

            this._makeDraggable(true);

            this._makeResizable(true);

            this._handleDisabledOption();

            op.initCallBack.call( this._publicMethods, this.$target[0] );

        },

        _changePosition:function(){

            var position = this.options.position;

            if(position.of === 'window'){

                position.of = this.window;

            }else if(position.of === 'document'){

                position.of = this.document;

            }

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

                    }else if( !This.isMinimize ){

                        This.hasResizable && This.$target[This.dependsFnName.resizable]( 'trigger', This.$target, 'mouseleave' );

                        This._leoDialogMaximize();

                    }

                }

            });

            this._createWinResizeMax();

        },

        _destroyDblclick:function(){

            this._off( this.$uiDialogTitlebar, 'dblclick.max' );

            this._destroyWinResizeMax();

        },

        _setButton:function(element){

            $(element).attr( 'role', 'button' );

        },

        _createOkButton:function(){

            var okButtonClassName = this.options.okButtonClassName,

            This = this,$ok,element;

            if( okButtonClassName === false || !(element = this.$target.find( okButtonClassName )[0])){return;}

            if( !this.$ok ){

                $ok = this.$ok = {

                    element:element,

                    eventBind:false

                };

            }

            this._setButton(element);

            if( $ok.eventBind === false ){

                this._on( element, 'click.ok', function(event){

                    This.options.okCallBack.call( This._publicMethods, event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

                    This.clickCallBackName = 'okCallBack';

                }, 'supportDisabled' );

                $ok.eventBind = true;

            }

        },

        _destroyOkButton:function(){

            var $ok = this.$ok;

            if( $ok && $ok.element && $ok.eventBind === true ){

                this._off( $ok.element, 'click.ok' );

                delete this.$ok;

            }

        },

        _createCancelButton:function(){

            var cancelButtonClassName = this.options.cancelButtonClassName,

            This = this,$cancel,element;

            if( cancelButtonClassName === false || !(element = this.$target.find( cancelButtonClassName )[0])){return;}

            if( !this.$cancel ){

                $cancel = this.$cancel = {

                    element:element,

                    eventBind:false

                };

            }

            this._setButton(element);

            if( $cancel.eventBind === false ){

                this._on( element, 'click.cancel', function(event){

                    This.options.cancelCallBack.call( This._publicMethods, event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

                    This.clickCallBackName = 'cancelCallBack';

                }, 'supportDisabled' );

                $cancel.eventBind = true;

            }

        },

        _destroyCancelButton:function(){

            var $cancel = this.$cancel;

            if( $cancel && $cancel.element && $cancel.eventBind === true ){

                this._off( this.$cancel.element, 'click.cancel' );

                delete this.$cancel;

            }

        },

        setDialogTitle:function(text){

            !!this.$uiDialogTitlebar && this.$uiDialogTitlebar.find('.leoDialog_title').text(text || this.options.title || '');

        },

        _createCaptionButtons:function(){

            if(!this.$uiDialogTitlebar || !this.options.captionButtons || !this.options.captionButtons.length){return;}

            var i,$uiDialogTitlebar = this.$uiDialogTitlebar,

            captionButtons = $.extend([], this.options.captionButtons),

            captionButtonsLength,

            buttons = {

                pin: {

                    click: '_leoDialogPin',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOn: "leoDialog_pin_span_on",

                    iconClassOff: "leoDialog_pin_span_off"

                },

                refresh: {

                    click: '_leoDialogRefresh',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOn: "leoDialog_refresh_span"

                },

                toggle: {

                    click: '_leoDialogToggle',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOff: "leoDialog_toggle_span_hide",

                    iconClassOn: "leoDialog_toggle_span_show"

                },

                minimize: {

                    click: '_leoDialogMinimize',

                    hideClass:'leoDialog_titlebar_button_hide',

                    iconClassOn: "leoDialog_minimize_span"

                },

                maximize: {

                    click: '_leoDialogMaximize',

                    iconClassOn: "leoDialog_maximize_span"

                },

                close: {

                    click: 'modalDialogHide',

                    iconClassOn: "leoDialog_close_span"

                },

                restore:{

                    deps:['minimize', 'maximize'],

                    notAppendToHeader:true,

                    click: '_leoDialogRestor',

                    iconClassOn: "leoDialog_restore_span"

                }

            };

            this.buttons = {};

            if(this._namesInArray(buttons.restore.deps, captionButtons)){

                captionButtons.push('restore');

            }

            for ( i = 0, captionButtonsLength = captionButtons.length; i < captionButtonsLength; i++ ){

                this._createCaptionButton( buttons[captionButtons[i]], $uiDialogTitlebar, captionButtons[i] );

            }

            this._createWinResizeMax();

        },

        _namesInArray:function(names, arr){

            if($.type(names) !== 'array' || $.type(arr) !== 'array'){

                return false;

            }

            var re = new RegExp("(?:" + names.join("|") + ")");

            return re.test(arr.join(""));

        },

        _createCaptionButton:function( info, $uiDialogTitlebar, name ){

            if(!info){return;}

            var buttonObject,deps = info.deps,This = this,

            buttonCss = 'leoDialog_' + name,

            buttons = this.buttons,

            hideClass = info.hideClass || '';

            if ( !buttons[name] ){

                buttonObject = $('<a href="###"></a>').append( $("<span></span>").addClass(' leoDialog_titlebar_button_span ' + info.iconClassOn ).text( name ) ).addClass( buttonCss + " leoDialog_titlebar_button " + hideClass ).attr("role", "button");

                this._on( buttonObject, 'click.' + name, function(event){

                    event.preventDefault();

                    event.stopPropagation();

                    if( This._dialogState === 'open' ){

                        name === 'close' && ( This.options.closeCallBack.call( This._publicMethods, event, this ), This.clickCallBackName = 'closeCallBack' );

                        This[info.click]();

                    }

                });

                if( !info.notAppendToHeader ){

                    buttonObject.appendTo( $uiDialogTitlebar );

                }

                buttons[name] = $.extend( { element: buttonObject[0] }, info );

            }

        },

        _createWinResizeMax:function(){

            if(!this.resizeMaximize && (!!this.buttons.maximize || !!this.options.titlebarDblclickMax)){

                var $window = this.window,This = this,time;

                this._on( $window, 'resize.maximize', function(){

                    !!time && clearTimeout(time);

                    time = setTimeout( function(){

                        if( This.isMaximize ){

                            This._getBorderWidths();

                            var height,

                            width = $window.width() - This.borderWidths.left - This.borderWidths.right;

                            !!This.contentHide ? height = 'auto' : height = $window.height() - This.borderWidths.top - This.borderWidths.bottom;

                            This._setSizes( { width: width, height : height,  top: 0, left: 0 } );

                        }

                    }, 100 );

                });

                this.resizeMaximize = true;

            }

        },

        _destroyWinResizeMax:function(){

            if(this.resizeMaximize && !this.buttons.maximize && !this.options.titlebarDblclickMax){

                this._off( this.window, 'resize.maximize' );

                delete this.resizeMaximize;

            }

        },

        _destroyCaptionButton:function(){

            var buttons = this.buttons,prop;

            if(buttons){

                for(prop in buttons){

                    if(Object.prototype.hasOwnProperty.call(buttons, prop)){

                        $(buttons[prop].element).remove();

                        buttons[prop] = null;

                    }

                }

                this.buttons = {};

            }

            this._destroyWinResizeMax();

        },

        _dialogToTopEvent:function(){

            var This = this;

            this._on( this.$target, 'mousedown.ToTop', function(event){

                This._moveToTop();

            });

        },

        _handleDisabledOption:function(){

            var $target = this.$target;

            if ( this.options.disabled ){

                if ( !this.disabledDiv ){

                    this.disabledDiv = $(this.options.makeDisabledDiv.call(this._publicMethods, $target));

                }

                if(this.isMinimize){

                    if ( !this.disabledMinDiv ){

                        this.disabledMinDiv = this.disabledDiv.clone();

                    }

                    this.$minimizeBar.append(this.disabledMinDiv);

                }

                this.disabledDiv.appendTo( $target );

                this.hasResizable && $target[this.dependsFnName.resizable]( 'option','disabled', true );

                this.hasDraggable && $target[this.dependsFnName.draggable]( 'option','disabled', true );


            }else if( this.disabledDiv ){

                this.disabledDiv.detach();

                this._setResizableDisabled(false);

                this._setDraggableDisabled(false);

                if(this.disabledMinDiv && this.isMinimize){

                    this.disabledMinDiv.remove();

                    delete this.disabledMinDiv;

                }

            }

        },

        _destoryDisabledDiv:function(){

            if( this.disabledDiv ){

                this._setResizableDisabled(false);

                this._setDraggableDisabled(false);

                this.disabledDiv.remove();

                this.disabledDiv = null;

            }

        },

        _handleIframeMask:function(flag) {

            if( !this.$innerIframe ){return;}

            if ( flag === true ) {

                !this.mask && ( this.mask = $( "<div>" ).css( { position: "absolute", width: '100%', height: '100%', opacity: 0, 'backgroundColor':'#fff', 'overflow': 'hidden', 'visibility': 'visible', 'display': 'block', 'top': 0, 'left': 0, 'padding': 0, 'margin': 0, 'border': 0, 'outline': 'none' } ) );

                this.mask.css('z-index', this._maxIframeZindex()).appendTo( this.$content );

            }else if( flag === false ){

                !!this.mask && this.mask.detach();

            }

        },

        _maxIframeZindex:function(){

            if( !this.$innerIframe ){return 1;}

            var $innerIframe = this.$innerIframe, i = $innerIframe.length,

            zIndex = 0,iframeZindex;

            while(i--){

                iframeZindex = +$($innerIframe[i]).css('z-index');

                if(typeof iframeZindex === 'number'){

                    iframeZindex > zIndex && (zIndex = iframeZindex);

                }

            }

            return zIndex + 1;

        },

        _destoryIframe:function(){

            if( this.$innerIframe ){

                this.$innerIframe.each(function(index, el) {

                    var $iframe = $(el);

                    $iframe.attr('src', 'about:blank');

                    try{

                        el.contentWindow.document.write('');

                        el.contentWindow.document.close();

                    }catch(e){};

                    (/msie/.test(navigator.userAgent.toLowerCase())) && CollectGarbage();

                    $iframe.remove();

                });

                delete this.$innerIframe;

            }

        },

        _destoryIframeMask: function() {

            if ( this.mask ) {

                this.mask.remove();

                this.mask = null;

            }

        },

        _leoDialogRefresh:function(){

            if ( this.$innerIframe ) {

                this.$innerIframe.each(function(index, el) {

                    var $el = $(el);

                    $el.attr( "src", $el.attr("src") );

                });

            }

        },

        _leoDialogMinimize:function(){

            var buttons = this.buttons;

            !this.$minimizeBar && ( this.$minimizeBar = $('<div style="position:fixed;bottom:0;left:0;padding:0;margin:0;white-space:nowrap">') );

            if( this.isMaximize ){

                !!buttons.maximize && $( buttons.maximize.element ).show();

                this.isMaximize = false;

            }else{

                !this.contentHide ? this._saveOldSize() : this._saveOldSize('offset');

                this._setDraggableDisabled(true);

                this._setResizableDisabled(true);

            }

            this.isMinimize = true;

            this._leoDialogRestoreAdd( $( buttons.minimize.element ) );

            this._wrapMinimize();

        },

        _wrapMinimize:function(){

            this.$minimizeBar.css( 'zIndex', this.$target.hide().find('.leoDialog_titlebar_button_hide').hide().end().css('z-index') ).append( this.$uiDialogTitlebar.clone( true ).css({'cursor': 'default', 'display': 'flex'}) ).insertAfter(this.$target);

        },

        _unWrapMinimize:function(){

            var $target = this.$target;

            this._moveToTop();

            $target.find('.leoDialog_titlebar_button_hide').show();

            this._dialogState === 'open' && $target.show();

            this.$minimizeBar.remove();

            delete this.$minimizeBar;

            if(this.disabledMinDiv){

                delete this.disabledMinDiv;

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

            this._setSize('cssPosition', 'fixed');

            var $window = this.window,height,

            width = $window.width() - this.borderWidths.left - this.borderWidths.right;

            !!this.contentHide ? height = 'auto' : height = $window.height() - this.borderWidths.top - this.borderWidths.bottom;

            this._setSizes( { width: width, height : height, top: 0, left: 0 } );

            !!this.buttons.maximize && this._leoDialogRestoreAdd( $( this.buttons.maximize.element ) );

            this.options.resize.call(this._publicMethods, this.$target[0]);

        },

        _leoDialogToggle:function(){

            var $span = $( this.buttons.toggle.element ).find('.leoDialog_titlebar_button_span'),

            classOff = this.buttons.toggle.iconClassOff,

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

        _leoDialogPin:function(on){

            if(!this.buttons.pin){return;}

            var $span = $( this.buttons.pin.element ).find('.leoDialog_titlebar_button_span'),

            classOff = this.buttons.pin.iconClassOff,

            hasOff = $span.hasClass(classOff);

            if(on && !hasOff){return;}

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

            var $target = this.$target;

            this.borderWidths = {

                left: $target.leftBorderWidth(),

                top: $target.topBorderWidth(),

                right: $target.rightBorderWidth(),

                bottom: $target.bottomBorderWidth()

            };

        },

        _saveOldSize:function(key){

            var $target = this.$target,

            offset = $target.offset();

            if( key === 'offset' ){

                this.oldSize.offset = { top:offset.top, left:offset.left };

                this.oldSize.postion = $target.css('position');

                return;

            }

            this.oldSize = {

                width: $target.width(),

                height: $target.height(),

                cssPosition: $target.css('position'),

                offset:{ top: offset.top, left: offset.left }

            }

        },

        _leoDialogRestoreAdd:function(btn){

            !!this.buttons.restore && $( this.buttons.restore.element ).insertBefore(btn);

            btn.hide();

        },

        _leoDialogRestor:function(){

            var size = $.extend( {}, this.oldSize ),

            buttons = this.buttons;

            if( this.isMinimize ){

                this._unWrapMinimize();

                this.isMinimize = false;

            }

            if( this.isMaximize ){

                !!buttons.maximize && $( buttons.maximize.element ).show();

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

            this.options.resize.call(this._publicMethods, this.$target[0]);

            !!buttons.restore && $( buttons.restore.element ).detach();

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

            var $uiDialogTitlebar = this.$target.find('.leoDialog_titlebar');

            this.$content = this.$target.hide().css( 'z-index', this.options.zIndex ).find( '.leoDialog_content' );

            !$uiDialogTitlebar[0] ? this.$uiDialogTitlebar = false : this.$uiDialogTitlebar = $uiDialogTitlebar;

        },

        _setContent:function(){

            if(!this.$content){return;}

            this._destoryIframe();

            var $content = this.$content.empty().append(this.options.contentHtml),

            $iframe = $content.find('iframe'),This,iframeLoadCallBack;

            if( $iframe[0] ){

                This = this;

                iframeLoadCallBack = this.options.iframeLoadCallBack;

                this._on( $iframe, 'load', function(event){

                    !!iframeLoadCallBack && iframeLoadCallBack.call( This._publicMethods, event, this );

                } );

                this.$innerIframe = $iframe;

            }

        },

        _appentTo:function(){

            this.$target.appendTo( this.options.appendTo );

        },

        _setFirstGialogSize:function(){

            if( this.firstTime === true ){

                var op = this.options,

                width = op.width,height = op.height,

                $content = this.$content.css( 'width', 'auto' ),

                $target = this.$target.css({  height: 'auto', width: width, top: -1999, left: -1999 }).show();

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

            var $target = this.$target,$content = this.$content,

            isVisible = this._dialogState === 'open';

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

        _restore:function(){

            var op = this.options;

            if(this.firstTime === false && op.restore === true){

                if(this.isMaximize || this.isMinimize){

                    this._leoDialogRestor();

                }

                if( this.contentHide === true ){

                    this._leoDialogToggle();

                }

                this._setSizes( {

                    width:op.width,

                    height:op.height,

                    position:op.position

                } );

            }

        },

        dialogShow:function(){

            if( this.options.disabled === false && this._dialogState === 'close' && !this.$modal ){

                this._moveToTop(true);

                this._createOverlay();

                this.options.beforeShow.call( this._publicMethods, this.$target[0] );

                !this.$modal ? this._dialogShow() : this.options.makeModelDialogShow.call( this._publicMethods, this._modalShowFn(), this._dialogShowFn() );

            }

        },

        _dialogShowCallback:function(){

            this._setDraggableDisabled(false);

            this._setResizableDisabled(false);

            this.options.dialogShowCallBack.call( this._publicMethods, this.$target[0] );

        },

        _makeDraggable:function(init){

            var op = this.options,dependsFnName = this.dependsFnName,This,$target;

            if( !$.fn[dependsFnName.draggable] ){

                return;

            }

            $target = this.$target;

            if ( op.initDraggable === true ) {

                if( init === true && this.hasDraggable === false ){

                    This = this;

                    this.draggableDefault = {

                        cancel:'[ role = "button" ]',

                        mouseDownSelector:false,

                        onStartDrag:function(){

                            This._handleIframeMask(true);

                            This.hasResizable && $target[dependsFnName.resizable].setCursorChange(false);

                        },

                        onBeforeStopDrag:function(){

                            This._handleIframeMask(false);

                            This.hasResizable && $target[dependsFnName.resizable].setCursorChange(true);

                        }

                    }

                    this._setDraggableIframeFix();

                    $target[dependsFnName.draggable]( $.extend({}, op.draggableOption, this.draggableDefault ) );

                    this.hasDraggable = true;

                    this._leoDialogPin(true);

                }else{

                    this._setDraggableIframeFix();

                    $target[dependsFnName.draggable]( 'option', $.extend({}, op.draggableOption, this.draggableDefault ) );

                }

            }else if( op.initDraggable === false && init === false && this.hasDraggable === true ){

                $target[dependsFnName.draggable]('destroy');

                this.hasResizable && $target[dependsFnName.resizable].setCursorChange(true);

                this.hasDraggable = false;

            }

        },

        _setDraggableIframeFix:function(){

            var draggableOption = this.options.draggableOption;

            if(draggableOption.iframeFix === true){

                draggableOption.iframeFix = function(drag, doc){

                    return $(doc).find('iframe').map( function() {

                        var $iframe = $( this );

                        if( $.contains( drag, this ) || $iframe.is(':hidden') ){ return null; }

                        return $( "<div>" ).css( { position: "absolute", width: $iframe.outerWidth(), height: $iframe.outerHeight(), opacity: 0,'backgroundColor':'#fff', 'overflow': 'hidden', 'z-index': $iframe.css('z-index'), 'visibility': 'visible', 'display': 'block', 'padding': 0, 'margin': 0, 'border': 0, 'outline': 'none' } ).insertAfter( this ).offset( $iframe.offset() )[0];

                    });

                }

            }

        },

        _setDraggableDisabled:function(flag){

            this.hasDraggable && !this.options.disabled && !this.draggableDisabled && !this.isMinimize && !this.isMaximize && this.$target[this.dependsFnName.draggable]( 'option','disabled', flag );

        },

        _makeResizable:function(init){

            var op = this.options,dependsFnName = this.dependsFnName,This,$target;

            if( !$.fn[dependsFnName.resizable] ){

                return;

            }

            $target = this.$target;

            if ( op.initResizable === true ) {

                if( init === true && this.hasResizable === false ){

                    This = this;

                    this.resizableDefault = {

                        bClone:false,

                        cancel:'[ role = "button" ]',

                        mouseDownSelector:false,

                        onStartResize:function(){

                            This._handleIframeMask(true);

                        },

                        onResize:function( event, $dragBox, width, height ){

                            This.$content.css({

                                width:width - This.reWidth,

                                height:height - This.reHeight

                            })

                            op.resize.call(This._publicMethods, $target[0]);

                        },

                        onStopResize:function(){

                            This._handleIframeMask(false);

                        },

                        mouseMoveCurIn:function(cur){

                            if( !( cur === 'S-resize' || cur === 'SW-resize' || cur === 'SE-resize' ) ){

                                $(this).addClass('leoDialog_inherit');

                            }

                            This.hasDraggable && $target[dependsFnName.draggable]( 'setLockDrag', true );

                        },

                        mouseMoveCurOut:function(cur){

                            $(this).removeClass('leoDialog_inherit');

                            This.hasDraggable && $target[dependsFnName.draggable]( 'setLockDrag', false );

                        }

                    }

                    $target[dependsFnName.resizable]( $.extend({}, op.resizableOption, this.resizableDefault ) );

                    this.hasResizable = true;

                }else{

                    $target[dependsFnName.resizable]( 'option', $.extend({}, op.resizableOption, this.resizableDefault ) );

                }

            }else if( op.initResizable === false && init === false && this.hasResizable === true ){

                $target[dependsFnName.resizable]('destroy');

                this.hasDraggable && $target[dependsFnName.draggable]( 'setLockDrag', false );

                this.hasResizable = false;

            }

        },

        _setResizableDisabled:function(flag){

            this.hasResizable && !this.options.disabled && !this.isMinimize && !this.isMaximize && !this.contentHide && this.$target[this.dependsFnName.resizable]( 'option','disabled', flag );

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

            if( key === 'title' ){

                this.setDialogTitle();

                return;

            }

            if( key === 'disabled' ){

               this._handleDisabledOption();

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

            if( key === 'contentHtml') {

                this._setContent();

                return;

            }

            if( key === 'okButtonClassName' ){

                this._destroyOkButton();

                this._createOkButton();

                return;

            }

            if( key === 'cancelButtonClassName' ){

                this._destroyCancelButton();

                this._createCancelButton();

                return;

            }

            if( key === 'width' || key === 'height' ) {

                this._setSize( key, value );

                return;

            }

            if( key === 'initDraggable') {

                this._makeDraggable(value);

            }

            if( key === 'zIndex') {

                this._setZindex();

                return;

            }

            if( key === 'appendTo') {

                this._appentTo();

                return;

            }

            if( key === 'scope') {

                this._deletDialogs( this.scope );

                this._setDialogs(value);

                this.scope = value;

                return;

            }

            if( key === 'initResizable' ){

                this._makeResizable(value);

                return;

            }

            if ( key.indexOf('position') === 0 ) {

                this._changePosition();

                this._setSize( 'position', this.options.position );

                return;

            }

            if ( key.indexOf('captionButtons') === 0 ) {

                this._destroyCaptionButton();

                this._createCaptionButtons();

                return;

            }

        },

        modalDialogHide:function(){

            if(this.options.disabled === true){return;}

            !this.$modal ? this._dialogHide() : this.options.makeModelDialogHide.call( this._publicMethods, this._modalHideFn(), this._dialogHideFn() );

        },

        _createOverlay:function(){

            var op = this.options, This;

            if( op.modal && !this.$modal ){

                This = this;

                this.$modal = $(op.makeModel.call( this._publicMethods, this.$target[0] ));

                this._modalState = 'close';

                !!op.quickClose && this._on( this.$modal, 'click.quickClose', function(event){

                    if( This._modalState === 'open' && This._dialogState === 'open' ){

                        op.quickCloseCallBack.call( This._publicMethods, event, this );

                        This.clickCallBackName = 'quickCloseCallBack';

                        This.modalDialogHide();

                        This._off( This.$modal, 'click.quickClose' );

                    }

                } );

            }

        },

        _destroyOverlay:function(){

            if( this.$modal ){

                this.$modal.remove();

                this.$modal = false;

                delete this._modalState;

            }

        },

        _dialogHideCallback:function(){

            this.options.dialogHideCallBack.call( this._publicMethods, this.clickCallBackName );

        },

        _moveToTop:function(notFocus) {

            if( this.options.isMoveToTop === false || (this.options.disabled && !notFocus) ){ return; }

            var arr = this._getDialogTarget( this.options.getScope ),

            arrLength = arr.length,$target = this.$target,

            zIndicies = [],zIndexMax,i;

            if( arrLength > 0 ){

                for ( i = 0; i < arrLength; i++ ) {

                    zIndicies.push( $( arr[i] ).css( "z-index" ) );

                }

                if((zIndexMax = Math.max.apply( null, zIndicies )) >= + $target.css( "z-index" )){

                    $target.css( "z-index", zIndexMax + 1 );

                    !!this.$minimizeBar && this.$minimizeBar.css( "z-index", zIndexMax + 1 );

                    !notFocus && this._focusDialog();

                }

            }

        },

        moveToTop: function() {

            this._moveToTop();

        },

        dialogState:function(){

            return this._dialogState;

        },

        modalState:function(){

            return this._modalState;

        },

        _modalShowFn:function(){

            var This = this;

            return function(callback){

                This._modalShow(callback);

            }

        },

        clearDialogTimeout:function(id){

            if(typeof id !== 'string'){return;}

            if(id === 'all'){

                this._clearDialogTimeout('modalShow');

                this._clearDialogTimeout('modalHide');

                this._clearDialogTimeout('dialogShow');

                this._clearDialogTimeout('dialogHide');

                return;

            }

            var This = this;

            id.replace(/[^, ]+/g, function(name){

                This._clearDialogTimeout(name);

            });

        },

        _clearDialogTimeout:function(id){

            if(id === 'modalShow' && this._modalShowTimeId){

                clearTimeout(this._modalShowTimeId);

                delete this._modalShowTimeId;

            }else if(id === 'modalHide' && this._modalHideTimeId){

                clearTimeout(this._modalHideTimeId);

                delete this._modalHideTimeId;

            }else if(id === 'dialogShow' && this._dialogShowTimeId){

                clearTimeout(this._dialogShowTimeId);

                delete this._dialogShowTimeId;

            }else if(id === 'dialogHide' && this._dialogHideTimeId){

                clearTimeout(this._dialogHideTimeId);

                delete this._dialogHideTimeId;

            }

        },

        _modalShow:function(callback){

            if( !this.$modal ){ return; }

            this._modalShowTimeId = this._delay(function(){

                delete this._modalShowTimeId;

                if( !this.$modal || this._modalState === 'opening' ){ return; }

                if( this._modalState === 'open' ){

                    !!callback && callback.call(this);

                    return;

                }

                var This = this;

                this._modalState = 'opening';

                this.options.modalShowAnimation.call(this.$modal,

                    function(){

                        This._modalState = 'open';

                        !!callback && callback.call(This);

                    }

                , this._publicEvent );

            },this.options.modalShowDelay);

        },

        _dialogShowFn:function(){

            var This = this;

            return function(callback){

                This._dialogShow(callback)

            }

        },

        _dialogShow:function(callback){

            this._dialogShowTimeId = this._delay(function(){

                delete this._dialogShowTimeId;

                if( this._dialogState === 'closeing' ){return;}

                if( this._dialogState === 'open' ){

                    !!callback && callback.call(this);

                    return;

                }

                var This = this,$target = this.$target;

                !!this.$minimizeBar && !!this.isMinimize && ( $target = this.$minimizeBar );

                this._beforeDialogShowCallback(this);

                this._dialogState = 'opening';

                this.options.showAnimation.call( $target,

                    function(){

                        This._dialogState = 'open';

                        This._focusDialog();

                        !!callback && callback.call(This);

                        This._dialogShowCallback.call(This);

                    }

                , this._publicEvent );

            },this.options.showDelay);

        },

        _beforeDialogShowCallback:function(){

            this.hasDraggable && this.$target[this.dependsFnName.draggable]( 'option','disabled', false );

            this.hasResizable && this.$target[this.dependsFnName.resizable]( 'option','disabled', false );

            this._restore();

            this._setFirstGialogSize();

        },

        _beforeDialogHideCallback:function(){

            this.hasDraggable && this.$target[this.dependsFnName.draggable]( 'option','disabled', true );

            this.hasResizable && this.$target[this.dependsFnName.resizable]( 'option','disabled', true );

        },

        _modalDialogHideCallback:function(){

            if( !this.$modal && this._dialogState === 'close' ){

                this.options.modalDialogHideCallBack.call( this._publicMethods, this.clickCallBackName );

            }

        },

        _modalHideFn:function(){

            var This = this;

            return function(callback){

                This._modalHide(callback);

            }

        },

        destroyOverlay:function(){

            this._destroyOverlay();

            this._modalDialogHideCallback.call(this);

        },

        _modalHide:function(callback){

            if( !this.$modal ){ return; }

            this._modalHideTimeId = this._delay(function(){

                delete this._modalHideTimeId;

                if( !this.$modal || this._modalState === 'closeing' ){ return; }

                if( this._modalState === 'close' ){

                    this._destroyOverlay();

                    !!callback && callback.call(this);

                    this._modalDialogHideCallback.call(this);

                    return;

                }

                var This = this;

                this._modalState = 'closeing';

                this.options.modalHideAnimation.call( this.$modal,

                    function(){

                        This._modalState = 'close';

                        This._destroyOverlay();

                        !!callback && callback.call(This);

                        This._modalDialogHideCallback.call(This);

                    }

                , this._publicEvent );

            }, this.options.modalHideDelay );

        },

        modalHide:function(){

            if(this.options.disabled === true){return;}

            this._modalHide();

        },

        _focusDialog:function(){

            this.options.dialogFocus.call(this._publicMethods, this.$target[0]);

        },

        _blurDialog:function(){

            this.options.dialogBlur(this._publicMethods, this.$target[0]);

        },

        _dialogHide:function(callback){

            this._dialogHideTimeId = this._delay( function(){

                delete this._dialogHideTimeId;

                if( this._dialogState === 'closeing' ){return;}

                if( this._dialogState === 'close' ){

                    !!callback && callback.call(this);

                    return;

                }

                var This = this,$target = this.$target;

                !!this.$minimizeBar && !!this.isMinimize && ( $target = this.$minimizeBar );

                this._beforeDialogHideCallback(this);

                this._dialogState = 'closeing';

                this.options.hideAnimation.call( $target,

                    function(){

                        This._dialogState = 'close';

                        This._blurDialog();

                        !!callback && callback.call(This);

                        This._dialogHideCallback.call(This);

                        This._modalDialogHideCallback.call(This);

                    }

                , this._publicEvent );

            }, this.options.hideDelay );

        },

        dialogHide:function(){

            if(this.options.disabled === true){return;}

            this._dialogHide();

        },

        _dialogHideFn:function(){

            var This = this;

            return function(callback){

                This._dialogHide(callback);

            }

        },

        _destroy:function(){

            this._blurDialog();

            this.hasDraggable && this.$target[this.dependsFnName.draggable]('destroy');

            this.hasResizable && this.$target[this.dependsFnName.resizable]('destroy');

            this.clearDialogTimeout('all');

            this._destoryIframe();

            this.$target.remove();

            !!this.buttons && !!this.buttons.restore && $( this.buttons.restore.element ).remove();

            !!this.$minimizeBar && this.$minimizeBar.remove();

            this._destoryIframeMask();

            this._destoryDisabledDiv();

            this._destroyOverlay();

            this._deletDialogs( this.scope );

        }

    },{

        _initElements:function(fn){

            var _dialogs = {};

            this._getDialogTarget = function( scope ){

                if(!_dialogs[scope]){

                    return [];

                }

                var arr = [],dialogs = _dialogs[scope],dialog,

                i = dialogs.length,el,target = this.$target[0];

                 while( i-- ){

                    dialog = dialogs[i];

                    el = dialog.$target[0];

                    target !== el && (dialog._dialogState === 'open' || dialog._dialogState === 'opening') && arr.push(el);

                }

                return arr;

            }

            this._setDialogs = function(scope){

                _dialogs[scope] = _dialogs[scope] || [];

                _dialogs[scope].push( this );

            }

            this._deletDialogs = function(scope){

                if( _dialogs[scope] === undefined ){

                    return;

                }

                var dialogs = _dialogs[scope] ,i = dialogs.length,

                target = this.$target[0];

                while(i--){

                    if(dialogs[i].$target[0] === target){

                        dialogs.splice( i, 1 );

                    }

                }

                if(dialogs.length === 0){

                    delete _dialogs[scope];

                }

            }

        }

    });

    return $;

}));