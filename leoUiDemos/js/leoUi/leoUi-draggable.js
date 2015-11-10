/**
+-------------------------------------------------------------------
* jQuery leoUi--draggable
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

        name:'leoDraggable',

        version:'1.0',

        inherit:'leoMouse',

        relevanceFnName:{

            droppable:'leoDroppable'

        },//相关函数名

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            handle:false, //只有在特定的元素上触发鼠标按下事件时，才可以拖动

            cursor:'move',//拖拽动作时，鼠标的CSS样式

            bClone:true, //是否使用克隆拖拽

            bCloneAnimate:true, //克隆拖拽是否有动画

            dragBoxReturnToTarget:false,//拖拽结束时候，是否回到Target的位置

            refreshPositions:false,//配合droppable使用，move时候时刻调用leoDroppable进行碰撞检测（耗性能）

            duration:400,//动画时间

            stopMouseWheel:false, //拖拽时候是否关闭滚轮事件

            revert:false, //如果设置为true, 当拖动停止时元素将返回它的初始位置

            revertAnimate:true, //还原是否动画

            axis:false,//可用值为x只能在x方向拖动，设置为y只能在Y方向拖动

            cursorAt:false,//设置拖动帮手相对于鼠标光标的偏移量。坐标可被指定为一个散列 使用的组合中的一个或两个键：{ top, left, right, bottom }

            containment:false,  //可以限制draggable只能在指定的元素或区域的边界以内进行拖动

                                // Selector: 可拖动元素将被置于由选择器指定的第一个元素的起界限作用的盒模型中。如果没有找到任何元素，则不会设置界限

                                 // Element: 可拖动的元素将包含该元素的边界框。

                                // String:可选值: "parent", "document", "window"

                                // Array: 以 [ x1, y1, x2, y2 ] 数组形式定义一个限制区域

            scroll: true,//如果设置为true, 当拖动时，div盒模型将自动翻滚

            scrollSensitivity: 20,//离开可视区域边缘多少距离开始滚动。距离是相对指针进行计算的，而不是被拖到元素本身。如果scroll 选项设置为false，则不滚动。

            scrollSpeed: 20,//当鼠标指针的值小于scrollSensitivity的值时，窗口滚动的速度。如果scroll选项设置为false，则该参数无效

            closestScrollParent:false,//从最近的可滚动的祖先开始，在DOM 树上逐级向上的可滚动的祖先匹配，如果匹配到了break，没匹配到则默认到document，如果scroll选项设置为false，则该参数无效（document不算在内,false为不匹配）

            useLeoDroppable:false,//是否使用leoDroppable插件

            droppableScope:'all',//用来设置拖动（leoDraggable）元素和放置（leoDroppable）对象的集合,配合leoDroppable使用

            disabled:false,//当设置为true时禁止拖动

            grid:false,//拖拽元素时，只能以指定大小的方格进行拖动。数组形式为[ x, y ]

            iframeFix:false,//在拖动期间阻止iframe捕捉鼠标移过事件。与cursorAt选项搭配使用时或者当鼠标指针可能不在拖动助手元素之上时，该参数非常有用

                            // 支持多种类型:

                            // Boolean: 当设置为true, 透明层将被放置于页面上的所有iframe之上

                            // Selector: 任何由选择器匹配的iframe将被透明层覆盖

                            // function: 返回所有透明层jquery对象（arguments: darg, this.document[0]）

            proxy:function(source) { //source

                return $(source).clone().removeAttr('id').css({'opacity': '0.5'}).insertAfter(source);

            },//克隆拖拽返回的克隆对象（必须为jquery对象）

            onBeforeDrag:$.noop, //开始拖拽之前回调，返回false，取消拖拽。（this: target, arguments: event）

            onStartDrag:$.noop, //开始拖拽回调（this: target, arguments: event, dragBox）

            onDrag:$.noop, //拖拽中回调（this: target, arguments: event, dragBox）

            onBeforeStopDrag:$.noop, // 拖拽结束前回调（this: target, arguments: event, dragBox）

            onStopDrag:$.noop//拖拽结束回调（this: target, arguments: event）

        },

        _init:function(){

            this.$body = this.document.find('body');

            this.hasClone = false;

            this._super();

            this._getContainment(true);

            this._changeStatic();

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

        _setOption:function( key, value ){

            if( key === 'containment' ){

                this._getContainment(true);

                return;

            }

            if( key === 'droppableScope' || key === 'useLeoDroppable' ){

                this.setDropsProp();

                return;

            }

            if( key === 'mouseDownSelector' ){

                this._super( key, value );

                this._getContainment(true);

                return;

            }

        },

        _getHandle:function(event) {

            return this.options.handle ? !!$( event.target ).closest( this.$target.find( this.options.handle ) ).length : true;

        },

        _blockFrames:function() {

            var iframeFix = this.options.iframeFix,drag = this.$dragBox[0];

            if($.type(iframeFix) === 'function'){

                this.iframeBlocks = iframeFix(drag, this.document[0]);

            }else{

                this.iframeBlocks = this.document.find( iframeFix === true ? "iframe" : iframeFix ).map( function() {

                    var $iframe = $( this );

                    if( drag === this || $iframe.is(':hidden') ){ return null; }

                    return $( "<div>" ).css( { position: "absolute", width: $iframe.outerWidth(), height: $iframe.outerHeight(), opacity: 0,'backgroundColor':'#fff', 'overflow': 'hidden', 'z-index': $iframe.css('z-index'), 'visibility': 'visible', 'display': 'block', 'padding': 0, 'margin': 0, 'border': 0, 'outline': 'none' } ).insertAfter( this ).offset( $iframe.offset() )[0];

                });

            }

        },

        _unblockFrames:function() {

            if ( this.iframeBlocks ) {

                this.iframeBlocks.remove();

                delete this.iframeBlocks;

            }

        },

        _mouseCapture:function(event){

            var op = this.options;

            if( this.hasClone === true || op.disabled === true || op.onBeforeDrag.call( this.$target[0], event ) === false || this._getHandle(event) === false ){

                return false;

            }

            return true;

        },

        _getContainment:function(init){

            if( !init === !this.isDelegatSelector ){ return; }

            var op = this.options,oc = op.containment,

            ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( oc === 'parent' ) ? this.$target.parent().get( 0 ) : oc;

            if(!ce){

                this.dragMaxX = this.dragMaxY = 'max';

                this.dragMinX = this.dragMinY = 'min';

                op.containment = false;

                return;

            }

            this.$containment = $(ce);

        },

        _getContainmentInfo:function(){

            var oc = this.options.containment;

            if( oc === false ){

                this._setAxis();

                return;

            }

            if( oc.constructor === Array ){

                this.dragMinX = oc[0];

                this.dragMinY = oc[1];

                this.dragMaxX = oc[2] - this.dragBoxouterW;

                this.dragMaxY = oc[3] - this.dragBoxouterH;

                this._setAxis();

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

        },

        _setAxis:function(){

            if( this.options.axis === 'x' ){

                this.dragMinY = this.dragMaxY = this.top;

            }else if( this.options.axis === 'y' ){

                this.dragMinX = this.dragMaxX = this.left;

            }

        },

        _getContainmentRange:function(){

            if( this.options.containment === false || this.options.containment.constructor === Array ){

                return;

            }

            var fnPosition = $.position,borderWidths = this.borderWidths,

            within = fnPosition.getWithinInfo( this.$containment[0] ),

            scrollInfo = fnPosition.getScrollInfo( within ),maxX,maxY,

            outerH = this.dragBoxouterH,outerW = this.dragBoxouterW,

            withinOffset = within.isDocument ? { left: 0, top: 0 } : within.isWindow ? { left: within.scrollLeft, top: within.scrollTop } : within.offset;

            this.dragMinY = withinOffset.top + borderWidths.top;

            this.dragMinX = withinOffset.left + borderWidths.left;

            this.dragMaxY = withinOffset.top + within.height - scrollInfo.height - borderWidths.bottom - outerH;

            this.dragMaxX = withinOffset.left + within.width - scrollInfo.width - borderWidths.right - outerW;

            this._setAxis();

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

            var offset,op = this.options,$target = this.$target,

            parseCss = $.leoTools.parseCss;

            this.$dragBox = $target;

            op.cursor !== false && ( this.oldCur = this.$body.css('cursor') );

            this.revertBoxTop = parseCss($target[0],'top');

            this.revertBoxLeft = parseCss($target[0],'left');

            offset = $target.offset();

            this.left = offset.left;

            this.top = offset.top;

            if ( op.bClone ) {

                !! op.bCloneAnimate && $target.stop(true, false);

                this.$dragBox = op.proxy( $target[0] ).offset( { left: this.left, top: this.top } );

                this.hasClone = true;

            }

            this.dragBoxouterH = this.$dragBox.outerHeight();

            this.dragBoxouterW = this.$dragBox.outerWidth();

            this.revertBoxTop = this.top;

            this.revertBoxLeft = this.left;

            !!op.mouseDownSelector && this._getContainment();

            this._getContainmentInfo();

            this._makecursorAt(event);

            this._stopOnMouseWheel();

            !!op.scroll && this.setScrollParents();

            this.startLeft = event.pageX - this.left;

            this.startTop  = event.pageY - this.top;

            this._blockFrames();

            !!this.oldCur && this.$body.css( 'cursor', op.cursor );

            this.setDropsProp();

            this._checkPosition( event, this.top, this.left, true );

            op.onStartDrag.call( $target[0], event, this.$dragBox[0] );

        },

        _makecursorAt:function(event){

            var obj = this.options.cursorAt;

            if( obj !== false ){

                if ( "left" in obj ) {

                    this.left = event.pageX + obj.left;

                }
                if ( "right" in obj ) {

                    this.left = event.pageX - ( this.dragBoxouterW + obj.right );

                }

                if ( "top" in obj ) {

                    this.top = event.pageY + obj.top;

                }

                if ( "bottom" in obj ) {

                    this.top = event.pageY - ( this.dragBoxouterH + obj.bottom );

                }

                this.$dragBox.offset( { left: this.left, top: this.top } );

            }

        },

        setScrollParents:function(){

            this.scrollParents = $.leoTools.scrollParents( this.$dragBox, true );

        },

        setDropsProp:function(){

            var fnFroppable = $.fn[this.relevanceFnName.droppable],op = this.options;

            if( op.useLeoDroppable === false && !fnFroppable ){

                return;

            }

            fnFroppable.setDropsProp( op.droppableScope, this.$target );

        },

        _checkPosition:function( event, top, left, first ){

            var fnDroppable = $.fn[this.relevanceFnName.droppable],op = this.options;

            if( op.useLeoDroppable === false && !fnDroppable  ){

                return;

            }

            fnDroppable.checkPosition( event, {

                scope: op.droppableScope,

                box: this.$target,

                dragBox: this.$dragBox,

                dragBoxTop: top,

                dragBoxLeft: left,

                pageX: event.pageX,

                pageY: event.pageY

            }, first );

        },

        _drop:function( event, top, left ){

            var fnDroppable = $.fn[this.relevanceFnName.droppable],op = this.options;

            if( op.useLeoDroppable === false && !fnDroppable ){

                return;

            }

            return fnDroppable.drop( event, {

                scope: op.droppableScope,

                box: this.$target,

                dragBox: this.$dragBox,

                dragBoxTop: top,

                dragBoxLeft: left,

                pageX: event.pageX,

                pageY: event.pageY

            });

        },

        _scroll:function( event, scrollParent, op, $doc , $win ){

            var axis = op.axis,scrolled = false,

            pageX = event.pageX,pageY = event.pageY,

            overflowOffset,docScrollTop,docScrollLeft;

            if ( scrollParent !== $doc[0] && scrollParent.tagName !== "HTML" ) {

                overflowOffset = $(scrollParent).offset();

                if ( !axis || axis !== "x" ) {

                    if ( ( overflowOffset.top + scrollParent.offsetHeight ) - pageY < op.scrollSensitivity ) {

                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop + op.scrollSpeed;

                    } else if ( pageY - overflowOffset.top < op.scrollSensitivity ) {

                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop - op.scrollSpeed;

                    }

                }

                if ( !axis || axis !== "y" ) {

                    if ( ( overflowOffset.left + scrollParent.offsetWidth) - pageX < op.scrollSensitivity ) {

                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + op.scrollSpeed;

                    } else if ( pageX - overflowOffset.left < op.scrollSensitivity ) {

                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - op.scrollSpeed;

                    }

                }

            } else {

                if ( !axis || axis !== "x" ) {

                    docScrollTop = $doc.scrollTop();

                    if ( pageY - docScrollTop < op.scrollSensitivity ) {

                        this.isWinScrollToplockMin = true;

                        this.winScrollToplockMin === true && ( scrolled = $doc.scrollTop( docScrollTop - op.scrollSpeed ) );

                        this.winScrollToplockMax = false;

                    } else if ( $win.height() - ( pageY - docScrollTop ) < op.scrollSensitivity ) {

                        this.isWinScrollToplockMax = true;

                        this.winScrollToplockMax === true && ( scrolled = $doc.scrollTop( docScrollTop + op.scrollSpeed ) );

                        this.winScrollToplockMin = false;

                    }else{

                        this.winScrollToplockMin = false;

                        this.winScrollToplockMax = false;

                    }

                }

                if ( !axis || axis !== "y" ) {

                    docScrollLeft = $doc.scrollLeft();

                    if ( pageX - docScrollLeft < op.scrollSensitivity ) {

                        this.isWinScrollLeftlockMin = true;

                        this.winScrollLeftlockMin === true && ( scrolled = $doc.scrollLeft( docScrollLeft - op.scrollSpeed ) );

                        this.winScrollLeftlockMax = false;

                    } else if ( $win.width() - ( pageX - docScrollLeft ) < op.scrollSensitivity ) {

                        this.isWinScrollLeftlockMax = true;

                        this.winScrollLeftlockMax === true && ( scrolled = $doc.scrollLeft( docScrollLeft + op.scrollSpeed ) );

                        this.winScrollLeftlockMin = false;

                    }else{

                        this.winScrollLeftlockMin = false;

                        this.winScrollLeftlockMax = false;

                    }

                }

            }

            scrolled !== false && this._checkPosition( event, this.top, this.left );

        },

        _dragScroll:function(event){

            if( this.options.scroll === false ){

                return

            }

            var scrollParents = this.scrollParents,i = scrollParents.length,

            $doc = this.document,$win = this.window,op = this.options,

            scrollParent,closestScrollParent = op.closestScrollParent;

            this.isWinScrollLeftlockMin = false;

            this.isWinScrollLeftlockMax = false;

            this.isWinScrollToplockMin = false;

            this.isWinScrollToplockMax = false;

            while( i-- ){

                this._scroll( event, scrollParent = scrollParents[i], op, $doc, $win );

                if(closestScrollParent !== false && scrollParent !== $doc[0] && $(scrollParent).is(closestScrollParent)){

                    break;

                }

            }

        },

        _setGrid:function( val, LR ){

            var grid = this.options.grid;

            if( grid ){

                if( LR === 'top' ){

                    return grid[1] ? Math.round( val / grid[1] ) * grid[1] : val

                }else if( LR === 'left' ){

                    return grid[0] ? Math.round( val / grid[0] ) * grid[0] : val;

                }

            }else{

                return val;

            }

        },

        _mouseDrag:function(event) {

            var range = $.leoTools.range,op,$win = this.window,top,left,pageX,pageY;

            this._dragScroll(event);

            this._getContainmentRange();

            op = this.options;

            pageX = event.pageX;

            pageY = event.pageY;

            if( + this.dragMinX > + this.dragMaxX ){

                if( this.firstPageX ){

                    left = this.firstLeft - pageX + this.firstPageX;

                }else{

                    this.firstLeft = left = pageX - this.startLeft;

                    this.firstPageX = pageX;

                }

                left = this._setGrid( left, 'left' );

                if( this.isWinScrollLeftlockMin === true ){

                    left = this.dragMinX;

                    this.winScrollLeftlockMin = true;

                }else if( this.isWinScrollLeftlockMax === true ){

                    left = this.dragMaxX;

                    this.winScrollLeftlockMax = true;

                }

                left = range( left, this.dragMaxX, this.dragMinX );

            }else{

                left = range( this._setGrid( pageX - this.startLeft, 'left' ), this.dragMinX, this.dragMaxX );

                this.isWinScrollLeftlockMin === true && ( this.winScrollLeftlockMin = true );

                this.isWinScrollLeftlockMax === true && ( this.winScrollLeftlockMax = true );

            }

            if( + this.dragMinY > + this.dragMaxY ){

                if( this.firstPageY ){

                    top = this.firstTop - pageY + this.firstPageY;

                }else{

                    this.firstTop = top = pageY - this.startTop;

                    this.firstPageY = pageY;

                }

                top = this._setGrid( top, 'top' );

                if( this.isWinScrollToplockMin === true ){

                    top = this.dragMinY;

                    this.winScrollToplockMin = true;

                }else if( this.isWinScrollToplockMax === true ){

                    top = this.dragMaxY;

                    this.winScrollToplockMax = true;

                }

                top = range( top, this.dragMaxY, this.dragMinY );

            }else{

                top = range( this._setGrid( pageY - this.startTop, 'top' ), this.dragMinY, this.dragMaxY );

                this.isWinScrollToplockMin === true && ( this.winScrollToplockMin = true );

                this.isWinScrollToplockMax === true && ( this.winScrollToplockMax = true );

            }

            this.$dragBox.offset( { left: this.left = left, top: this.top = top } );

            op.refreshPositions === true && this.setDropsProp();

            this._checkPosition( event, this.top, this.left );

            op.onDrag.call( this.$target[0], event, this.$dragBox[0] );

        },

        _mouseStop:function(event) {

            var This = this,boxOffset,op = this.options,droped,

            $target = this.$target,$dragBox = this.$dragBox,

            onStopDrag = op.onStopDrag;

            !!this.oldCur && this.$body.css( 'cursor', this.oldCur );

            op.onBeforeStopDrag.call( $target[0], event, $dragBox[0] );

            this.firstPageX = false;

            this.firstPageY = false;

            this._stopOffMouseWheel();

            droped = this._drop( event, this.top, this.left );

            this._unblockFrames();

            if( droped === true ){

                if( op.bClone ){

                    $dragBox.remove();

                    this.hasClone = false;

                }

            }else{

                if( op.bClone ){

                    if( op.revert ){

                        if( op.revertAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                            $.offset.setOffset( $dragBox[0], { top: this.revertBoxTop, left: this.revertBoxLeft, using: function(prop){

                                $dragBox.animate( { left: prop.left, top: prop.top }, { duration: op.duration, complete:function(){

                                    $dragBox.remove();

                                    This.hasClone = false;

                                    onStopDrag.call( $target[0], event );

                                }});

                            }})

                        }else{

                            $dragBox.remove();

                            this.hasClone = false;

                            onStopDrag.call( $target[0], event );

                        }

                    }else{

                        if( op.dragBoxReturnToTarget ){

                            boxOffset = $target.offset();

                            if( op.bCloneAnimate && this._isMove( boxOffset.left, boxOffset.top, this.left, this.top ) ){

                                $.offset.setOffset( $dragBox[0], { top: boxOffset.top, left: boxOffset.left, using: function(prop){

                                    $dragBox.animate( { left: prop.left, top: prop.top }, { duration: op.duration, complete:function(){

                                        $dragBox.remove();

                                        This.hasClone = false;

                                        onStopDrag.call( $target[0], event );

                                    }});

                                }})

                            }else{

                                $dragBox.remove();

                                !op.bCloneAnimate && $target.offset( { left: boxOffset.left, top: boxOffset.top } );

                                this.hasClone = false;

                                onStopDrag.call( $target[0], event );

                            }

                        }else{

                            $dragBox.remove();

                            this.hasClone = false;

                            if( op.bCloneAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                                $.offset.setOffset( $target[0], { top: this.top,left: this.left, using: function(prop){

                                    $target.animate( { left: prop.left, top: prop.top}, { duration: op.duration, complete:function(){

                                        onStopDrag.call( $target[0], event );

                                    }});

                                }})

                            }else{

                                !op.bCloneAnimate && $target.offset( { left: this.left, top: this.top } );

                                onStopDrag.call( $target[0], event );

                            }

                        }

                    }

                }else{

                    if( op.revert ){

                        if( op.revertAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                            $.offset.setOffset( $target[0], { top: this.revertBoxTop, left: this.revertBoxLeft, using: function(prop){

                                $target.animate( { left: prop.left, top: prop.top }, { duration: op.duration, complete:function(){

                                    onStopDrag.call( $target[0], event );

                                }});

                            }})

                        }else{

                            onStopDrag.call( $target[0], event );

                        }

                    }else{

                        onStopDrag.call( $target[0], event );

                    }

                }

            }

        },

        _isMove:function( oldsLeft, oldTop, left, top ){

            return ( oldsLeft !== left || ( oldTop !== top ) );

        },

        _destroy:function(){

            !!this.oldCur && this.$body.css( 'cursor', this.oldCur );

        }

    });

    return $;

}));