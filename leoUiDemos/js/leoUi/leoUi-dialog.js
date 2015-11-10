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

            contentSelector:'.leoDialog_content',

            titlebarSelector:'.leoDialog_titlebar',

            titleSelector:'.leoDialog_title',

            title:'标 题',//dialog标题的内容

            disabled:false,//是否禁止dialog

            titlebarDblclickMax:true,//是否支持双击标题栏最大化

            appendTo:'body',//dialog应该被appendTo到哪个元素

            showDelay:'none',//打开dialog延迟的时间

            hideDelay:'none',//关闭dialog延迟的时间

            width:400,//设置dialog的宽度（数值或者auto）

            height:'auto',//设置dialog的高度（数值或者auto）

            zIndex:1000,//设置dialog的z-index

            isMoveToTop:false,//保持当前的的dialog在最上面，一个页面2个以上dialog建议开启

            scope:'all',//用来设置MoveToTop的leoDialog对象的集合

            getScope:'all',//用来取得MoveToTop的leoDialog对象的集合

            okButtonSelector:'.send_submit',//okButton的className的selector

            cancelButtonSelector:'.send_off',//cancelButton的className的selector

            restore:false,//是否每次打开dialog还原状态（使用options中的width，height，position设置打开）

            captionButtons:['pin', 'refresh', 'toggle', 'minimize', 'maximize', 'close'],//是否使用按钮，有'pin', 'refresh', 'toggle', 'minimize', 'maximize', 'close'可选，按照顺序显示，不用按钮可用false标示

            position:{//参考jqueryUi的API（其中of和within属性设置成“window”或者“document”使用当前框架的window或者document）

                my:"center",

                at:"center",

                of:'window',

                collision:"fit",

                within:'window'

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

            maximizeContainment:'window', // Selector: 可拖动元素将被置于由选择器指定的第一个元素的起界限作用的盒模型中。如果没有找到任何元素，则不会设置界限

                                 // Element: 可拖动的元素将包含该元素的边界框。

                                // String:可选值: "document", "window"

            initCallBack:$.noop,//dialog组件初始化回调（arguments: target ）

            beforeShow:$.noop,//dialog组件显示之前回调（arguments: target ）

            beforeHide:$.noop,//dialog组件消失之前回调（arguments: target ）

            okCallBack:$.noop,//点击ok按钮回调（event, bottunDisable, bottunEnable））

            cancelCallBack:$.noop,//点击cancel按钮回调（arguments: event, bottunDisable, bottunEnable））

            pinCallBack:$.noop,//点击pin按钮回调（arguments: event, close）

            refreshCallBack:$.noop,//点击refresh按钮回调（arguments: event, close）

            toggleCallBack:$.noop,//点击toggle按钮回调（arguments: event, close）

            minimizeCallBack:$.noop,//点击minimize按钮回调（arguments: event, close）

            maximizeCallBack:$.noop,//点击maximize按钮回调（arguments: event, close）

            restoreCallBack:$.noop,//点击restore按钮回调（arguments: event, close）

            closeCallBack:$.noop,//点击close按钮回调（arguments: event, close）

            iframeLoadCallBack:$.noop,//iframe load结束回调（arguments: event, iframe）

            destroyCallBack:$.noop,//destroy回调（arguments: target）

            resize:$.noop,//dialog大小调整回调（arguments: target）

            dialogFocus:$.noop,//dialog聚焦（arguments: target）

            dialogBlur:$.noop,//dialog丢失焦点（ arguments: target）

            makeDisabledDiv:function(target){

                return $( "<div>" ).css( { position: "absolute", width: '100%', height: '100%', opacity: 0, 'backgroundColor':'#fff', 'overflow': 'hidden', 'visibility': 'visible', 'display': 'block', 'top': 0, 'left': 0, 'padding': 0, 'margin': 0, 'border': 0, 'outline': 'none' } )[0];

            },//创建disabled===true的罩盖层, appendTo->dialog,必须返回elem或者jquery对象（arguments: target）

            showAnimation:function(next) {

                this.show( { effect: "clip", duration: "slow", complete: next } );

                // this.show();

                // next();


            },//dialog显示的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: next）

            hideAnimation:function(next) {

                this.hide( { effect: "explode", duration: "slow", complete: next } );

                // this.hide();

                // next();

            },//dialog关闭的回调，可自定义动画等，在显示完毕必须调用callBack（this: $target, arguments: next）

            showCallBack:function(target){



            },//dialog显示完毕回调（arguments: target）

            hideCallBack:function(target, clickCallBackName){



            }//dialog关闭完成回调，clickCallBackName：okCallBack, cancelCallBack, closeCallBack。（arguments: target, clickCallBackName）

        },

        _init:function(){

            var op = this.options;

            this._dialogState = 'close';

            this.firstTime = true;

            this.isMaximize = false;

            this.isMaximize = false;

            this.hasResizable = false;

            this.draggableDisabled = false;

            this.hasDraggable = false;

            this.buttons = {};

            this._changePosition();

            // this._saveOriginalPositionOfWidthAndHeight();

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

            op.initCallBack( this.$target[0] );

        },

        _changePosition:function(){

            var position = this.options.position;

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

        },

        _saveOriginalPositionOfWidthAndHeight:function(){

            var $of = $(this.options.position.of);

            this._originalPositionOfWidth = $of.outerWidth();

            this._originalPositionOfHeight = $of.outerHeight();

        },

        resizeDialog:function(){

            var $target = this.$target,

            parseCss = $.leoTools.parseCss;

            $target.css({

                'left': ($target.outerWidth()*parseCss($target[0], 'left'))/this._originalPositionOfWidth,


                'top': ($target.outerWidth()*parseCss($target[0], 'top'))/this._originalPositionOfWidth

            });

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

            var okButtonSelector = this.options.okButtonSelector,

            This = this,$ok,element;

            if( okButtonSelector === false || !(element = this.$target.find( okButtonSelector )[0])){return;}

            if( !this.$ok ){

                $ok = this.$ok = {

                    element:element,

                    eventBind:false

                };

            }

            this._setButton(element);

            if( $ok.eventBind === false ){

                this._on( element, 'click.ok', function(event){

                    This.options.okCallBack( event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

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

            var cancelButtonSelector = this.options.cancelButtonSelector,

            This = this,$cancel,element;

            if( cancelButtonSelector === false || !(element = this.$target.find( cancelButtonSelector )[0])){return;}

            if( !this.$cancel ){

                $cancel = this.$cancel = {

                    element:element,

                    eventBind:false

                };

            }

            this._setButton(element);

            if( $cancel.eventBind === false ){

                this._on( element, 'click.cancel', function(event){

                    This.options.cancelCallBack( event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

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

            this.options.titleSelector !== false && this.$target.find(this.options.titleSelector).text(text || this.options.title || '');

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

                    click: 'hide',

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

            var buttonObject,This = this,

            buttonCss = 'leoDialog_' + name,

            buttons = this.buttons,

            hideClass = info.hideClass || '';

            if ( !buttons[name] ){

                buttonObject = $('<a href="###"></a>').append( $("<span></span>").addClass(' leoDialog_titlebar_button_span ' + info.iconClassOn ).text( name ) ).addClass( buttonCss + " leoDialog_titlebar_button " + hideClass ).attr("role", "button");

                this._on( buttonObject, 'click.' + name, function(event){

                    event.preventDefault();

                    event.stopPropagation();

                    if( This._dialogState === 'open' ){

                        var callbackName = name + 'CallBack';

                        This.options[callbackName]( event, this ), This.clickCallBackName = callbackName;

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

            if(!this._hasResizeMaximize && (!!this.buttons.maximize || !!this.options.titlebarDblclickMax)){

                var This = this,time;

                this._on( this.window, 'resize.maximize', function(){

                    !!time && clearTimeout(time);

                    time = setTimeout( function(){

                        This._resizeMaximize();

                    }, 100 );

                });

                this._hasResizeMaximize = true;

            }

        },

        resizeMaximize:function(){

            this._resizeMaximize();

        },

        _resizeMaximize:function(setPosition){

            if( this.isMaximize ){

                var height,width,maximizeContainment;

                this._getBorderWidths();

                !!setPosition && this._setSize('cssPosition', this._getMaximizeContainment(true));

                maximizeContainment = this._getMaximizeContainment();

                width = maximizeContainment.width - this.borderWidths.left - this.borderWidths.right;

                !!this.contentHide ? height = 'auto' : height = maximizeContainment.height - this.borderWidths.top - this.borderWidths.bottom;

                this._setSizes( { width: width, height : height,  top: maximizeContainment.top, left: maximizeContainment.left } );

            }

        },

        _destroyWinResizeMax:function(){

            if(this._hasResizeMaximize && !this.buttons.maximize && !this.options.titlebarDblclickMax){

                this._off( this.window, 'resize.maximize' );

                delete this._hasResizeMaximize;

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

                    this.disabledDiv = $(this.options.makeDisabledDiv($target));

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

                    }catch(e){}

                    ;(/msie/.test(navigator.userAgent.toLowerCase())) && window.CollectGarbage && window.CollectGarbage();

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

                    try{

                        el.contentWindow.location.reload();

                    }catch(e){}

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

            this._resizeMaximize(true);

            !!this.buttons.maximize && this._leoDialogRestoreAdd( $( this.buttons.maximize.element ) );

            this.options.resize(this.$target[0]);

        },

        _getMaximizeContainment:function(onlyPosition){

            var maximizeContainment = this.options.maximizeContainment,

            containment = {},$maximizeContainment,offset;

            if( maximizeContainment === 'document' ){

                if(onlyPosition){

                    return 'absolute';

                }

                containment.width = this.document.width();

                containment.height = this.document.height();

                containment.position = 'absolute';

                containment.top = 0;

                containment.left = 0;

            }else if( maximizeContainment === 'window' ){

                if(onlyPosition){

                    return 'fixed';

                }

                containment.width = this.window.width();

                containment.height = this.window.height();

                containment.position = 'fixed';

                containment.top = 0;

                containment.left = 0;

            }else{

                if(onlyPosition){

                    return $(maximizeContainment).css('position') === 'fixed' ? 'fixed' : 'absolute';

                }

                $maximizeContainment = $(maximizeContainment);

                offset = $maximizeContainment.offset();

                containment.width = $maximizeContainment.outerWidth();

                containment.height = $maximizeContainment.outerHeight();

                $maximizeContainment.css('position') === 'fixed' ? containment.position = 'fixed' : containment.position = 'absolute';

                containment.top = offset.top;

                containment.left = offset.left;

            }

            return containment;

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

            };

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

            this.options.resize(this.$target[0]);

            !!buttons.restore && $( buttons.restore.element ).detach();

        },

        _bottunDisable:function(el){

            var This = this;

            return function(){

                This._addElemDisableClassName(el);

            };

        },

        _bottunEnable:function(el){

            var This = this;

            return function(){

                This._removeElemDisableClassName(el);

            };

        },

        _createDialog:function(){

            var op = this.options, $uiDialogTitlebar;

            this.$content = this.$target.hide().css( 'z-index', this.options.zIndex ).find(op.contentSelector);

            op.titlebarSelector === false ? this.$uiDialogTitlebar = false : !($uiDialogTitlebar = this.$target.find(op.titlebarSelector))[0] ? this.$uiDialogTitlebar = false : this.$uiDialogTitlebar = $uiDialogTitlebar;

        },

        _setContent:function(){

            if(!this.$content){return;}

            this._destoryIframe();

            var $content = this.$content.empty().append(this.options.contentHtml),

            $iframe = $content.find('iframe'),iframeLoadCallBack;

            if( $iframe[0] ){

                iframeLoadCallBack = this.options.iframeLoadCallBack;

                this._on( $iframe, 'load', function(event){

                    !!iframeLoadCallBack && iframeLoadCallBack( event, this );

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

        restore:function(){

            this._restore(true);

        },

        _restore:function(isRestore){

            var op = this.options;

            if(this.firstTime === false && op.restore === true || isRestore){

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

        show:function(){

            if(this.options.disabled === true){return;}

            this._moveToTop(true);

            this.options.beforeShow( this.$target[0] );

            this._dialogShow();

        },

        _dialogShowCallback:function(){

            this._setDraggableDisabled(false);

            this._setResizableDisabled(false);

            this.options.showCallBack( this.$target[0] );

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

                    };

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

                };

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

                            });

                            op.resize( $target[0]);

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

                    };

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

            if( key === 'okButtonSelector' ){

                this._destroyOkButton();

                this._createOkButton();

                return;

            }

            if( key === 'cancelButtonSelector' ){

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

        _dialogHideCallback:function(){

            this.options.hideCallBack(this.$target[0], this.clickCallBackName );

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

        state:function(){

            return this._dialogState;

        },

        clearDialogTimeout:function(id){

            if(typeof id !== 'string'){return;}

            if(id === 'all'){

                this._clearDialogTimeout('show');

                this._clearDialogTimeout('hide');

                return;

            }

            var This = this;

            id.replace(/[^, ]+/g, function(name){

                This._clearDialogTimeout(name);

            });

        },

        _clearDialogTimeout:function(id){

            if(id === 'show' && this._dialogShowTimeId){

                clearTimeout(this._dialogShowTimeId);

                delete this._dialogShowTimeId;

            }else if(id === 'hide' && this._dialogHideTimeId){

                clearTimeout(this._dialogHideTimeId);

                delete this._dialogHideTimeId;

            }

        },

        _dialogShow:function(callback){

            this._dialogShowTimeId = this._delay(function(){

                delete this._dialogShowTimeId;

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

                );

            }, this.options.showDelay);

            this.options.showDelay !== 'none' && (this._dialogState = 'showDelaying');

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


        _focusDialog:function(){

            this.options.dialogFocus( this.$target[0]);

        },

        _blurDialog:function(){

            this.options.dialogBlur( this.$target[0]);

        },

        _dialogHide:function(callback){

            this._dialogHideTimeId = this._delay( function(){

                delete this._dialogHideTimeId;

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

                    }

                );

            }, this.options.hideDelay);

            this.options.hideDelay !== 'none' && (this._dialogState = 'hideDelaying');

        },

        hide:function(){

            if(this.options.disabled === true){return;}

            this.options.beforeHide( this.$target[0] );

            this._dialogHide();

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

            this._deletDialogs( this.scope );

            this.options.destroyCallBack(this.$target[0]);

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

                    target !== el && (dialog._dialogState != 'close') && arr.push(el);

                }

                return arr;

            };

            this._setDialogs = function(scope){

                _dialogs[scope] = _dialogs[scope] || [];

                _dialogs[scope].push( this );

            };

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

            };

        }

    });

    return $;

}));