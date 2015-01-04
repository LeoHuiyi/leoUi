/**
+-------------------------------------------------------------------
* jQuery leoUi--resizable
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-mouse","jqueryMousewheel","leoUi-position"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoResizable',

        version:'1.0',

        inherit:'leoMouse',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            disabled:false,//如果设置为true将禁止缩放

            bClone:true,//是否使用克隆缩放

            bCloneAnimate:true, //克隆缩放是否有动画

            duration:400,//动画时间

            containment:false,//使用指定的元素强制性限制大小调整的界限

                              //Selector:resizable元素将被限制在该选择器匹配的第一个元素的边界内。 如果没有匹配的元素，那么设置将不起作用。

                              //Element: resizable元素将被限制在这个元素的边界内。

                              //String: 可能的值： "parent", "document", "window"

            stopMouseWheel: false, //拖拽时候是否关闭滚轮事件

            handles:'all',//n, e, s, w, ne, se, sw, nw, all

            edge:4,//mouse的cursor的变化宽度

            grid:false,//缩放元素时，只能以指定大小的方格进行拖动。数组形式为[ x, y ]

            iframeFix:false,//在拖动期间阻止iframe捕捉鼠标移过事件。

                            // 支持多种类型:

                            // Boolean: 当设置为true, 透明层将被放置于页面上的所有iframe之上。

                            // Selector: 任何由选择器匹配的iframe将被透明层覆盖。

                            // function: 返回所有透明层jquery对象（arguments: darg, this.document[0]）

            aspectRatio:false,//强制元素调整大小时保持一个特定的宽高比

            minWidth:0,//缩放的最小宽度（大于0的数）

            minHeight:0,//缩放的最小高度（大于0的数）

            maxWidth:'max',//缩放的最大宽度，如果有containment限制哪个更小取哪个（大于0的数，"max": 无限大）

            maxHeight:'max',//缩放的最大高度，如果有containment限制哪个更小取哪个（大于0的数，"max": 无限大）

            proxy:function(source){

                return $(source).clone().removeAttr('id').css({'opacity': '0.5'}).insertAfter(source);

            },//克隆缩放返回的克隆对象（必须为jquery对象）（ arguments: target）

            initCallback: $.noop, //构建leoResizable完成后回调。（this: target）

            mouseMoveCurIn:$.noop,//mouse进去能缩放区域的回调。（this: target, arguments: cursor）

            mouseMoveCurOut:$.noop,//mouse离开能缩放区域的回调。（this: target, arguments: cursor）

            onBeforeResize:$.noop,//开始缩放之前回调，返回false，取消拖拽。（this: target, arguments: event）

            onStartResize: $.noop, //开始缩放回调（this: target, arguments: event, dragBox, width, height）

            onResize: $.noop, //缩放中回调（this: target, arguments: event, dragBox, width, height）

            onBeforeStopResize: $.noop,//缩放结束前回调（this: target, arguments: event, dragBox, width, height）

            onStopResize: $.noop,//缩放结束回调（this: target, arguments: event, width, height）

            onAnimateStepResize:$.noop//缩放克隆动画中step回调（this: target, arguments: event, fx）

        },

        _init:function(){

            this.$body = this.document.find('body');

            this._handleInit();

            this._dragArea();

            this.hasClone = false;

            this.cur = '';

            this._super();

            this._getContainment(true);

            this._changeStatic();

            this._boxEventBind(true);

            this.options.initCallback.call(this.$target[0]);

        },

        _changeStatic:function(){

            var $target = this.$target,

            mouseDownSelector = this.options.mouseDownSelector;

            if(mouseDownSelector === false){

                $target.css('position') === "static" && $target.css('position', 'relative') ;

            }else{

                $target.find(mouseDownSelector).each(function(index, el) {

                    var $el = $(el);

                    $el.css('position') === "static" && $el.css('position', 'relative') ;

                });

            }

        },

        _handleInit:function(){

            var This = this,op = this.options;

            if(typeof op.handles ==='string'){

                if( $.trim( op.handles ).toUpperCase() === 'ALL'){

                    this.handles = true;

                }else{

                    this.handles = {};

                    op.handles.replace($.leoTools.rword, function(name) {

                        This.handles[name.toUpperCase()] = true;

                    });

                }

            }else{

                this.handles = true;

            }

        },

        _dragArea:function(){

            var op = this.options;

            this.opMaxWidth = op.maxWidth;

            this.opMaxHeight = op.maxHeight;

            this.opMinWidth = $.leoTools.range( op.minWidth, 0, this.opMaxWidth );

            this.opMinHeight = $.leoTools.range( op.minHeight, 0, this.opMaxHeight );

        },

        _mouseCur:function( event, node ){

            if( this._getCursorChange() === true && this.options.disabled === false ){

                event.preventDefault();

                var $this = $(node),offset = $this.offset(),top = offset.top,

                left = offset.left,op = this.options,

                outerW = $this.outerWidth(),outerH = $this.outerHeight();

                if( event.pageY <= top + op.edge ){

                    this.flag_NS = 'N';

                }else if( event.pageY >= top + outerH - op.edge ){

                    this.flag_NS = 'S';

                }else{

                    this.flag_NS = '';

                }

                if( event.pageX >= left + outerW - op.edge ){

                    this.flag_EW = 'E';

                }else if( event.pageX <= left + op.edge ){

                    this.flag_EW = 'W';

                }else{

                    this.flag_EW = '';

                }

                this.oldCur = this.cur;

                this.cur = this.flag_NS + this.flag_EW;

                this.handles !== true && ( this.handles[this.cur] !== true ) && ( this.cur = '' );

                if( this.oldCur !== this.cur ){

                    if(!this.cur){

                        this.cursor = this.boxCur;

                        op.mouseMoveCurOut.call( $this[0], this.cursor );

                    }else{

                        this.cursor = this.cur+'-resize';

                        op.mouseMoveCurIn.call( $this[0], this.cursor );

                    }

                    $this.css( 'cursor', this.cursor );

                }

            }

        },

        _blockFrames:function(){

            var iframeFix = this.options.iframeFix,drag = this.$dragBox[0];

            if($.type(iframeFix) === 'function'){

                this.iframeBlocks = iframeFix(drag, this.document[0]);

            }else{

                this.iframeBlocks = this.document.find( iframeFix === true ? "iframe" : iframeFix ).map( function() {

                    var $iframe = $( this );

                    if( drag === this || $.contains( drag, this ) || $iframe.is(':hidden') ){ return null; }

                    return $( "<div>" ).css( { position: "absolute", width: $iframe.outerWidth(), height: $iframe.outerHeight(), opacity: 0,'backgroundColor':'#fff','overflow': 'hidden','z-index': $iframe.css('z-index'), 'visibility': 'visible', 'display': 'block', 'padding': 0, 'margin': 0, 'border': 0, 'outline': 'none' } ).insertAfter( this ).offset( $iframe.offset() )[0];

                });

            }

        },

        _unblockFrames:function(){

            if ( this.iframeBlocks ) {

                this.iframeBlocks.remove();

                delete this.iframeBlocks;

            }

        },

        _boxEventBind:function(init){

            var This = this,$target = this.$target,

            boxCur = this.boxCur = $target.css('cursor'),

            op = this.options,

            selector = op.mouseDownSelector;

            selector === false && ( selector = '' );

            if(!init){

                $target = this._$target;

                this._off( $target, 'mouseenter.resize' )._off( $target, 'mousemove.resize' )._off( $target, 'mouseleave.resize' );

            }

            this._on( $target, 'mouseenter.resize', selector, function(event){

                This._mouseCur( event, this );

            })._on( $target, 'mousemove.resize', selector, function(event){

                This._mouseCur( event, this );

            })._on( $target, 'mouseleave.resize', selector, function(event){

                if( This._getCursorChange() === true && op.disabled === false ){

                    event.preventDefault();

                    op.mouseMoveCurOut.call( this , boxCur );

                    $(this).css( 'cursor', boxCur );

                    This.cur = '';

                }

            });

        },

        _mouseCapture:function(event){

            if( this.hasClone === true || !this.cur || this.options.disabled === true || this.options.onBeforeResize.call( this.$target[0], event ) === false ){

                return false;

            }

            return true;

        },

        _getContainment:function(init){

            if( !init === !this.isDelegatSelector ){ return; }

            var oc = this.options.containment,

            ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( oc === 'parent' ) ? this.$target.parent().get( 0 ) : oc;

            if(!ce){

                this.SEMaxWidth = this.NWMaxWidth =  this.opMaxWidth;

                this.SEMaxHeight = this.NWMaxHeight =  this.opMaxHeight;

                this.SEMinWidth = this.NWMinWidth =  this.opMinWidth;

                this.SEMinHeight = this.NWMinHeight =  this.opMinHeight;

                this.options.containment = false;

                return;

            }

            this.$containment = $(ce);

        },

        _getContainmentInfo:function(){

            var oc = this.options.containment

            if( oc === false ){

                return;

            }

            if( oc === 'document' ){

                this.$containment = this.document;

                this._getBorderWidths(true);

            }else if( oc === 'window' ){

                this.$containment = this.window;

                this._getBorderWidths(true);

            }else{

                this._getBorderWidths();

            }

            this.reW = this.$dragBox.outerWidth() - this.startWidth;

            this.reH = this.$dragBox.outerHeight() - this.startHeight;

        },

        _getContainmentRange:function(){

            if( this.options.containment === false ){

                return;

            }

            var within = $.position.getWithinInfo( this.$containment[0] ),

            scrollInfo = $.position.getScrollInfo( within ),

            difT,difL,dragBoxOffset = this.$dragBox.offset(),cur = this.cur,

            withinOffset = within.isDocument ? { left: 0, top: 0 } : within.isWindow ? { left: within.scrollLeft, top: within.scrollTop } : within.offset,

            containmentDifT,containmentDifL,containmentDifB,containmentDifR,

            range = $.leoTools.range,mathMin = Math.min;

            difT = dragBoxOffset.top - withinOffset.top;

            difL = dragBoxOffset.left - withinOffset.left;

            containmentDifB = within.height - scrollInfo.height - this.reH - difT - this.borderWidths.bottom;

            containmentDifR = within.width - scrollInfo.width - this.reW - difL - this.borderWidths.right;

            containmentDifT = difT + this.height - this.borderWidths.top;

            containmentDifL = difL + this.width - this.borderWidths.left;

            this.SEMaxWidth = this.opMaxWidth === 'max' ? containmentDifR : range( this.opMaxWidth, 0, containmentDifR );

            this.SEMinWidth = mathMin( this.SEMaxWidth, this.opMinWidth );

            this.SEMaxHeight = this.opMaxHeight === 'max' ? containmentDifB : range( this.opMaxHeight, 0, containmentDifB );

            this.SEMinHeight = mathMin( this.SEMaxHeight, this.opMinHeight );

            this.NWMaxWidth = this.opMaxWidth === 'max' ? containmentDifL : containmentDifL > 0 ? range( this.opMaxWidth, 0, containmentDifL ) : 0;

            this.NWMinWidth = mathMin( this.NWMaxWidth, this.opMinWidth );

            this.NWMaxHeight = this.opMaxHeight === 'max' ? containmentDifT : containmentDifT > 0 ? range( this.opMaxHeight, 0, containmentDifT ) : 0;

            this.NWMinHeight = mathMin( this.NWMaxHeight, this.opMinHeight );

        },

        _getBorderWidths:function(no) {

            var $containment;

            if(no){

                this.borderWidths = {

                    left:0,

                    top:0,

                    right:0,

                    bottom:0

                }

            }else{

                $containment = this.$containment;

                this.borderWidths = {

                    left: $containment.leftBorderWidth(),

                    top: $containment.topBorderWidth(),

                    right: $containment.rightBorderWidth(),

                    bottom: $containment.bottomBorderWidth()

                };

            }

        },

        _stopOnMouseWheel:function(){

           !!this.options.stopMouseWheel && this._on( this.document,'mousewheel', false );

        },

        _stopOffMouseWheel:function(){

            !!this.options.stopMouseWheel && this._off( this.document,'mousewheel', false );

        },

        _mouseStart:function(event) {

            var offset,op = this.options,$target = this.$target;

            this.$dragBox = $target;

            offset = $target.offset();

            if ( op.bClone ) {

                this.$dragBox = op.proxy( $target[0] ).offset({ left: offset.left,top: offset.top});

                this.hasClone = true;

            }

            this.isFixed = this.$dragBox.css('position') === 'fixed';

            !op.stopMouseWheel && ( this.scrollParents = $.leoTools.scrollParents( this.$dragBox ) );

            this._stopOnMouseWheel();

            this.startLeft = this.left = $.leoTools.parseCss( this.$dragBox[0], 'left' );

            this.startTop = this.top = $.leoTools.parseCss( this.$dragBox[0], 'top' );

            this.startWidth = this.width = $target.width();

            this.startHeight = this.height = $target.height();

            this._getContainment();

            this._getContainmentInfo();

            this._getContainmentRange();

            this.startX =  this.isFixed ? event.clientX : event.pageX;

            this.startY = !op.stopMouseWheel ? event.clientY + $.leoTools.getScrollParentsTop( this.scrollParents ) : this.isFixed ? event.clientY : event.pageY;

            this.$body.css( 'cursor', this.cursor );

            this._blockFrames();

            op.onStartResize.call(this.$target[0], event, this.$dragBox, this.startWidth, this.startHeight);

            this._setCursorChange(false);

        },

        _getAspectRatio:function( moveX, moveY ){

            var width,height,cur = this.cur,aspectRatio = this.options.aspectRatio,

            SEMinScaleWH =  this.SEMinWidth / this.SEMinHeight,

            SNMinScaleWH =  this.SEMinWidth / this.NWMinHeight,

            NSMinScaleWH =  this.NWMinWidth / this.SEMinHeight,

            NWMinScaleWH =  this.NWMinWidth / this.NWMinHeight,

            SEMaxScaleWH =  this.SEMaxWidth / this.SEMaxHeight,

            SNMaxScaleWH =  this.SEMaxWidth / this.NWMaxHeight,

            NSMaxScaleWH =  this.NWMaxWidth / this.SEMaxHeight,

            NWMaxScaleWH =  this.NWMaxWidth / this.NWMaxHeight;

            if( cur === 'E' ){

                width = this.startWidth + moveX;

                height = width / aspectRatio;

                if( width >= this.SEMaxWidth || height >= this.SEMaxHeight ){

                    if( SEMaxScaleWH < aspectRatio ){

                        this.width = this.SEMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.SEMinWidth || height <= this.SEMinHeight ){

                    if( SEMinScaleWH > aspectRatio ){

                        this.width = this.SEMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

            }

            if( cur === 'S'  || cur === 'SE' ){

                height = this.startHeight + moveY;

                width = height * aspectRatio;

                if( width >= this.SEMaxWidth || height >= this.SEMaxHeight ){

                    if( SEMaxScaleWH < aspectRatio ){

                        this.width = this.SEMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.SEMinWidth || height <= this.SEMinHeight ){

                    if( SEMinScaleWH > aspectRatio ){

                        this.width = this.SEMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

            }

            if( cur === 'N' ||  cur === 'NE' ){

                moveY >= this.startHeight && ( moveY = this.startHeight );

                height = this.startHeight - moveY;

                width = height * aspectRatio;

                if( width >= this.SEMaxWidth || height >= this.NWMaxHeight ){

                    if( SNMaxScaleWH < aspectRatio ){

                        this.width = this.SEMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.SEMinWidth || height <= this.NWMinHeight ){

                    if( SNMinScaleWH > aspectRatio ){

                        this.width = this.SEMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

                this.top = this.startTop + this.startHeight - this.height;

            }

            if( cur === 'W' ||  cur === 'SW' ){

                moveX >= this.startWidth && ( moveX = this.startWidth );

                width = this.startWidth - moveX;

                height = width / aspectRatio;

                if( width >= this.NWMaxWidth || height >= this.SEMaxHeight ){

                    if( NSMaxScaleWH < aspectRatio ){

                        this.width = this.NWMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.NWMinWidth || height <= this.SEMinHeight ){

                    if( NSMinScaleWH > aspectRatio ){

                        this.width = this.NWMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.SEMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

                this.left = this.startLeft + this.startWidth - this.width;

            }

            if( cur === 'NW'  ){

                moveY >= this.startHeight && ( moveY = this.startHeight );

                height = this.startHeight - moveY;

                width = height * aspectRatio;

                if( width >= this.NWMaxWidth || height >= this.NWMaxHeight ){

                    if( NWMaxScaleWH < aspectRatio ){

                        this.width = this.NWMaxWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMaxHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else if( width <= this.NWMinWidth || height <= this.NWMinHeight ){

                    if( NWMinScaleWH > aspectRatio ){

                        this.width = this.NWMinWidth;

                        this.height = this.width / aspectRatio;

                    }else{

                        this.height = this.NWMinHeight;

                        this.width = this.height * aspectRatio;

                    }

                }else{

                    this.width = width;

                    this.height = height;

                }

                this.left = this.startLeft + this.startWidth - this.width;

                this.top = this.startTop + this.startHeight - this.height;

            }

        },

        _setGrid:function( moveX, moveY ){

            var op = this.options;

            if( op.grid ){

                moveY = op.grid[1] ? Math.round( moveY / op.grid[1] ) * op.grid[1] : moveY;

                moveX = op.grid[0] ? Math.round( moveX / op.grid[0] ) * op.grid[0] : moveX;

            }

            return { moveX: moveX, moveY: moveY};

        },

        _mouseDrag:function(event) {

            var cur = this.cur,op = this.options,

            moveX = ( this.isFixed ? event.clientX : event.pageX ) - this.startX,

            moveY = !op.stopMouseWheel ? event.clientY - this.startY + $.leoTools.getScrollParentsTop( this.scrollParents ) : ( this.isFixed ? event.clientY : event.pageY ) - this.startY,

            grid = this._setGrid( moveX, moveY );

            this._getContainmentRange();

            moveX = grid.moveX;

            moveY = grid.moveY;

            if( !!op.aspectRatio ){

                this._getAspectRatio( moveX, moveY );

            }else{

                if ( cur.indexOf("E") !== -1 ) {

                    this.width = $.leoTools.range( ( this.startWidth + moveX ), this.SEMinWidth, this.SEMaxWidth );

                }

                if ( cur.indexOf("S") !== -1 ) {

                    this.height = $.leoTools.range( ( this.startHeight + moveY ), this.SEMinHeight, this.SEMaxHeight );

                }

                if ( cur.indexOf("W") !== -1 ) {

                    moveX >= this.startWidth && ( moveX = this.startWidth );

                    this.width = this.startWidth - moveX;

                    this.left = this.startLeft + moveX;

                    if( this.NWMaxWidth <= this.width ){

                        this.width = this.NWMaxWidth;

                        this.left = this.startLeft + this.startWidth - this.width;

                    }else if( this.NWMinWidth >= this.width ){

                        this.width = this.NWMinWidth;

                        this.left = this.startLeft + this.startWidth - this.width;

                    }

                }

                if ( cur.indexOf("N") !== -1 ) {

                    moveY >= this.startHeight && ( moveY = this.startHeight );

                    this.height = this.startHeight - moveY;

                    this.top = this.startTop + moveY;

                    if( this.NWMaxHeight <= this.height ){

                        this.height = this.NWMaxHeight;

                        this.top = this.startTop + this.startHeight - this.height;

                    }else if( this.NWMinHeight >= this.height ){

                        this.height = this.NWMinHeight;

                        this.top = this.startTop + this.startHeight - this.height;

                    }

                }

            }

            this.$dragBox.css( { height: this.height, width: this.width, top: this.top, left: this.left } );

            op.onResize.call( this.$target[0], event, this.$dragBox, this.width, this.height );

        },

        _mouseStop:function(event) {

            var dragBoxOffset = this.$dragBox.offset(),

            op = this.options,$target = this.$target,

            width = this.width,height = this.height;

            this._stopOffMouseWheel();

            op.onBeforeStopResize.call( $target[0], event, width, height );

            if( this.hasClone ){

                this.$dragBox.remove();

                $.offset.setOffset( $target[0], { top: dragBoxOffset.top,left: dragBoxOffset.left, using: function(prop){

                    if( !op.bCloneAnimate ){

                        $target.css( { height: height, width: width, top: prop.top, left: prop.left } );

                        op.onStopResize.call( $target[0], event, width, height );

                    }else{

                        $target.animate( { height: height, width: width, top: prop.top, left: prop.left}, { duration: op.duration, step: function(now, fx){

                            op.onAnimateStepResize.call( $target[0], event, fx );

                        },complete:function(){

                            op.onStopResize.call( $target[0], event, width, height );

                        }});

                    }

                }});

            }else{

                op.onStopResize.call( $target[0], event, width, height );

            }

            this.$body.css('cursor','');

            this._unblockFrames();

            this.hasClone = false;

            this._setCursorChange(true);

        },

        _setOption:function( key,value ){

            if( key === 'handles'){

                this._handleInit();

                return;

            }

            if( key === 'containment'){

                this._getContainment(true);

                return;

            }

            if( key === 'maxWidth' || key === 'maxHeight' || key === 'minWidth' || key === 'minHeight'){

                this._dragArea();

                return;

            }

            if( key === 'mouseDownSelector'){

                this._boxEventBind();

                this._super( key, value );

                this._getContainment(true);

                return;

            }

        },

        _destroy:function(){

            this.$target.css('cursor',this.boxCur);

        }

    },{

        _initElements:function(fn){

            var _cursorChange = true;

            fn.getCursorChange = this._getCursorChange = function(){

                return _cursorChange;

            };

            fn.setCursorChange = this._setCursorChange = function(flag){

                _cursorChange = !!flag;

            };

        }

    });

    return $;

}));