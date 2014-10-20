/**
+-------------------------------------------------------------------
* jQuery leoUi--tools
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["jquery"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    var ap = Array.prototype,aslice = ap.slice,expandoId,oproto = Object.prototype,ohasOwn = oproto.hasOwnProperty,jQuery = $;

    $.leoTools = {};

    $.leoTools.version = '1.0.0';

    $.leoTools.uuid = 0;

    $.leoTools.getUuid = function(){

        return $.leoTools.uuid++;

    };

    $.leoTools.getId = function(name) {

        return "Leo"  + (name === undefined ? '_' : '_' + name+'_') + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    };

    $.leoTools.expando = $.leoTools.getId('leoTools');

    expandoId = $.leoTools.expando.replace(/^Leo_leoTools/g, "");

    $.leoTools.rword = /[^, ]+/g;

    $.leoTools.getExpando = function(name) {

        return 'Leo' + (name === undefined ? '' : '_' + name) + expandoId;

    };

    // 返回min<=mun<=max
    $.leoTools.range = function( mun, min, max ) {

        if( max === 'max' && min === 'min' ){

            return mun;

        }else if( max === 'max' ){

            return mun > min ? mun : min;

        }else if ( min === 'min' ){

            return mun < max ? mun : max;

        }else{

            return ( mun > min ? mun : min ) < max ? ( mun > min ? mun : min ) : max;

        }

    };

    // 返回随机数
    $.leoTools.random = function( min, max ) {

        if ( max === undefined ) {

            max = min;

            min = 0;

        }

        return min + Math.floor( Math.random() * ( max - min + 1 ) );

    };

    $.leoTools.has = function( obj, key ) {

        return hasOwnProperty.call( obj, key );

    };

    //获取object对象所有的属性名称。
    $.leoTools.keys = function(obj) {

        if (!(obj === Object(obj))) return [];

        if (Object.keys) return Object.keys(obj);

        var keys = [];

        for (var key in obj) if ($.leoTools.has(obj, key)) keys.push(key);

        return keys;

    };

    //返回object对象所有的属性值。
    $.leoTools.values = function(obj) {

        var keys = $.leoTools.keys(obj);

        var length = keys.length;

        var values = new Array(length);

        for (var i = 0; i < length; i++) {

            values[i] = obj[keys[i]];

        }

        return values;

    };

    //返回一个随机乱序的 obj 副本
    $.leoTools.shuffle = function(obj) {

        var rand,shuffled = [];

        $.each(obj, function(key,value) {

            rand = $.leoTools.random(key++);

            shuffled[key - 1] = shuffled[rand];

            shuffled[rand] = value;

        });

        return shuffled;

    };

    //从obj中产生一个随机样本。传递一个数字表示从list中返回n个随机元素。否则将返回一个单一的随机项。
    $.leoTools.sample = function(obj, n, guard) {

        if (n == null || guard) {

        if (obj.length !== +obj.length) obj = $.leoTools.values(obj);

            return obj[$.leoTools.random(obj.length - 1)];

        }

        return $.leoTools.shuffle(obj).slice(0, Math.max(0, n));

    };

    //返回最里层子类
    $.leoTools.findInnerMostChildren = function($box,selector,childrenArray){

        var childrenArray = childrenArray || [],selector = selector || '*';

        $box.each(function(i,el){

             if($(el)[0].childNodes.length === 1&&!!$(el).filter(selector)[0]&&($(el).filter(selector)[0].nodeType === 1)){

                childrenArray[childrenArray.length] = $(el);

             }else{

                $.leoTools.findInnerMostChildren($(el).children(),selector,childrenArray);

             }

        })

        return childrenArray;

    };

    // 返回box范围默认屏幕可见范围
    $.leoTools.boxArea = function(position){

        var $win = $(window),$doc = $(document);

        if (position === 'absolute') {

            areaMaxX = $doc.width();

            areaMaxY = $doc.height();

        } else if (position === 'fixed') {

            areaMaxX = $win.width();

            areaMaxY = $win.height();


        } else {
            return;
        }

        return {

            areaMaxX: areaMaxX,

            areaMaxY: areaMaxY

        }

    }

    // 返回拖拽范围默认屏幕可见范围
    $.leoTools.dragArea = function($box, position, areaMinX, areaMinY, areaMaxX, areaMaxY) {

        var $win = $(window),winW = $win.width(),winH = $win.height(),

        boxOuterW = $box.outerWidth(),boxOuterH = $box.outerHeight();

        if (position === 'absolute') {

            var winSleft = $win.scrollLeft(),winStop = $win.scrollTop();

            typeof areaMinX === 'number' ? areaMinX = winSleft + areaMinX : areaMinX = winSleft;

            typeof areaMinY === 'number' ? areaMinY = winStop + areaMinY : areaMinY = winStop;

            typeof areaMaxX === 'number' ? areaMaxX = areaMaxX + winSleft : areaMaxX = winW + winSleft - boxOuterW;

            typeof areaMaxY === 'number' ? areaMaxY = areaMaxY + winStop : areaMaxY = winH + winStop - boxOuterH;

        } else if (position === 'fixed') {

            typeof areaMinX === 'number' ? areaMinX = areaMinX : areaMinX = 0;

            typeof areaMinY === 'number' ? areaMinY = areaMinY : areaMinY = 0;

            typeof areaMaxX === 'number' ? areaMaxX = areaMaxX : areaMaxX = winW - boxOuterW;

            typeof areaMaxY === 'number' ? areaMaxY = areaMaxY : areaMaxY = winH - boxOuterH;


        } else {
            return false
        }

        boxOuterH > winH && (areaMaxY = areaMinY);

        boxOuterW > winW && (areaMaxX = areaMinX);

        return {

            areaMinX: areaMinX,

            areaMinY: areaMinY,

            areaMaxX: areaMaxX,

            areaMaxY: areaMaxY

        }

    };

    //返回btn：top、left、bottom、right
    $.leoTools.btnFollow = function($btn, position) {

        var offset = $btn.offset(),
            width = $btn.outerWidth(),
            height = $btn.outerHeight(),

            top = offset.top,
            left = offset.left,
            bottom = top + height,
            right = left + width;

        return {

            top: top,

            left: left,

            bottom: bottom,

            right: right

        };

    };

    //返回btn：top、left、bottom、right的可视范围
    $.leoTools.btnFollowArea = function($btn) {

        var $win = $(window),
            offset = $btn.offset(),
            width = $btn.outerWidth(),
            height = $btn.outerHeight(),

            winScrollTop = $win.scrollTop(),
            winScrollLeft = $win.scrollLeft(),

            top = offset.top - winScrollTop,
            left = offset.left - winScrollLeft,

            bottom = winScrollTop + $win.height() - offset.top - height,
            right = winScrollLeft + $win.width() - left - width;

        return {

            top: top,

            left: left,

            bottom: bottom,

            right: right

        }

    };

    $.leoTools.parseCss = function( element, property ) {

        return parseFloat( $.css( element, property ), 10 ) || 0;

    }

    //box在屏幕中出现的位置data：[{'PER':0.25},{'PER':0.5}]||[{'PX':100},{'PX':100}],BOX出现位置第一个为TOP第二个为LEFT,PER为百分比,PX为像素
    $.leoTools.boxPosition = function($box, position, data) {

        var Distance = {}, $win = $(window),

            iBoxWidth = $box.outerWidth(),

            iBoxHeight = $box.outerHeight(),

            iWindowWidth = $win.width(),

            iWindowHeight = $win.height(),

            iBoxMaxTop, iBoxMaxLeft, iBoxTop, iBoxLeft;

        if (position === 'absolute') {

            var $doc = $(document),
                iWindowScrollTop = $win.scrollTop(),

                iWinwdowScrollLeft = $win.scrollLeft();

            iBoxMaxTop = $doc.height() - iBoxHeight;

            iBoxMaxLeft = $doc.width() - iBoxWidth;

            if (data[0].PER !== undefined) {

                iBoxTop = iWindowScrollTop + (iWindowHeight - iBoxHeight) * data[0].PER;

            } else if (data[0].PX !== undefined) {

                iBoxTop = iWindowScrollTop + data[0].PX;

            }

            if (data[1].PER !== undefined) {

                iBoxLeft = iWinwdowScrollLeft + (iWindowWidth - iBoxWidth) * data[1].PER;

            } else if (data[1].PX !== undefined) {

                iBoxLeft = iWinwdowScrollLeft + data[1].PX;

            }

            if (iBoxTop < iWindowScrollTop) {

                iBoxTop = iWindowScrollTop;

            };

            if (iBoxLeft < iWinwdowScrollLeft) {

                iBoxLeft = iWinwdowScrollLeft;

            };

        } else if (position === 'fixed') {

            iBoxMaxTop = iWindowHeight - iBoxHeight;

            iBoxMaxLeft = iWindowWidth - iBoxWidth;

            if (data[0].PER !== undefined) {

                iBoxTop = (iWindowHeight - iBoxHeight) * data[0].PER;

            } else if (data[0].PX !== undefined) {

                iBoxTop = data[0].PX;

            }

            if (data[1].PER !== undefined) {

                iBoxLeft = (iWindowWidth - iBoxWidth) * data[1].PER;

            } else if (data[1].PX !== undefined) {

                iBoxLeft = data[1].PX;

            }

        }

        iBoxTop = $.leoTools.range(iBoxTop, 0, iBoxMaxTop);

        iBoxLeft = $.leoTools.range(iBoxLeft, 0, iBoxMaxLeft);

        return Distance = {

            top: iBoxTop,

            left: iBoxLeft

        };

    };

    //判断一个元素是否在视图窗口中
    $.leoTools.isInViewport = function(element) {

        var rect = element.getBoundingClientRect();

        var html = document.documentElement;

        return (

            rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || html.clientHeight) && rect.right <= (window.innerWidth || html.clientWidth)

        );

    };

    //返回所有滚动的父集合
    $.leoTools.scrollParents = function( $box, all ){

        var scrollParent,i=0,position = $box.css( "position" ),

        excludeStaticParent = position === "absolute",doc =  $box[ 0 ].ownerDocument || document;

        if( ( /fixed/ ).test( $box.css( "position" ) ) && !all ){

            return 'boxFixed';

        } else {

            scrollParent = $box.parents().filter(function() {

                var parent = $( this ),flag;

                if ( excludeStaticParent && parent.css( "position" ) === "static" ) {

                    return false;

                }

                if( !all ){

                    ( i > 0 ) ? flag = false : flag = ( /(auto|scroll)/ ).test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );

                    ( /fixed/ ).test( $.css( this, "position" ) ) && ( i++ );

                    return flag;

                }else{

                    return ( /(auto|scroll)/ ).test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );

                }

            });

        }

        return i === 0 ? scrollParent.add( doc ) : scrollParent;

    }

    //返回所有滚动的父集合的Top
    $.leoTools.getScrollParentsTop = function(scrollParents){

        var top = 0,i = scrollParents.length;

        if( scrollParents === 'boxFixed' || i===0 ){

            return top;

        }else if( i === 1 ){

            return $( scrollParents[0] ).scrollTop();

        }else{

            while(i--){

                top = top + $( scrollParents[i] ).scrollTop();

            }

            return top;

        }

    }

    //返回所有滚动的父集合的Left
    $.leoTools.getScrollParentsLeft = function(scrollParents){

        var left = 0,i = scrollParents.length;

        if( scrollParents === 'boxFixed' || i === 0){

            return left;

        }else if(i === 1){

            return $( scrollParents[0] ).scrollLeft();

        }else{

            while(i--){

                left = left + $( scrollParents[i] ).scrollLeft();

            }

            return left;

        }

    }

    //得到OFFSET相对的css
    $.leoTools.getOffset = function( elem, offsets ) {

        var position = jQuery.css( elem, "position" );

        if ( position === "static" ) {
            elem.style.position = "relative";
        }

        var curElem = jQuery( elem ),
            curOffset = curElem.offset(),
            curCSSTop = jQuery.css( elem, "top" ),
            curCSSLeft = jQuery.css( elem, "left" ),
            calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
            props = {}, curPosition = {}, curTop, curLeft;

        if ( calculatePosition ) {
            curPosition = curElem.position();
            curTop = curPosition.top;
            curLeft = curPosition.left;
        } else {
            curTop = parseFloat( curCSSTop ) || 0;
            curLeft = parseFloat( curCSSLeft ) || 0;
        }

        if ( offsets.top != null ) {
            props.top = ( offsets.top - curOffset.top ) + curTop;
        }
        if ( offsets.left != null ) {
            props.left = ( offsets.left - curOffset.left ) + curLeft;
        }

        return props

    }

    //box Resize时在屏幕中出现的位置data：[{'PER':0.25},{'PER':0.5}]||[{'PX':100},{'PX':100}],BOX出现位置第一个为TOP第二个为LEFT,PER为百分比,PX为像素，$.leoTools.boxResizePosition( $('#b'))卸载事件
    $.leoTools.boxResizePosition = function( $box, positionType, positionData ) {

        var $win = $(window),
            dataId = $.leoTools.getExpando('boxResizePositionId');

        if (positionType !== undefined && positionData !== undefined) {

            !! $box[0] && $box.each(function(index, el) {

                var lastTimer, id;

                !$(el).data(dataId) ? (id = $.leoTools.getId('boxResizePosition') + index) && $(el).data(dataId, id) : id = $(el).data(dataId);

                $win.off('resize.' + id).on('resize.' + id, function() {

                    if (lastTimer) clearTimeout(lastTimer);

                    lastTimer = setTimeout(fun, 200);

                    function fun() {

                        setTimeout(function() {

                            var position = $.leoTools.boxPosition($(el), positionType, positionData);

                            $(el).stop(true, false).animate({
                                left: Math.ceil(position.left),
                                top: Math.ceil(position.top)
                            }, 500);

                        }, 0)

                    };

                });

            });


        } else {

            !! $box[0] && $box.each(function(index, el) {

                var id = $(el).data(dataId);

                !! id && $win.off('resize.' + id) && $(el).removeData(dataId);

            })

        }

    };

    //box Scroll时在屏幕中出现相对上次的位置,top,left设定位置，第一次传top，left，data：[{'PER':0.25},{'PER':0.5}]||[{'PX':100},{'PX':100}],BOX出现位置第一个为TOP第二个为LEFT,PER为百分比,PX为像素;stop是否在动画中停止,$.leoTools.boxScrollPosition( $('#a'))卸载事件
    $.leoTools.boxScrollPosition = function( $box, positionData ) {

        var $win = $(window),
            $doc = $(document),
            dataId = $.leoTools.getExpando('boxScrollPositionId');

        if ($box.css("position") !== 'absolute') {
            return;
        }

        if (positionData === undefined) {

            !! $box[0] && $box.each(function(index, el) {

                var id = $(el).data(dataId);

                !! id && $win.off('scroll.' + id) && $(el).removeData(dataId);

            });

        } else {

            !! $box[0] && $box.each(function(index, el) {

                var lastTimer, id, $box = $(el),
                    positionfixed, _top, _left,

                    oldsTop = $win.scrollTop(),
                    oldsLeft = $win.scrollLeft(),
                    boxPositionData = positionData;

                !$box.data(dataId) ? (id = $.leoTools.getId('boxScrollPositionId') + index) && $box.data(dataId, id) : id = $box.data(dataId);

                if (boxPositionData) {

                    positionfixed = $.leoTools.boxPosition($(el), 'fixed', boxPositionData);

                    _top = Math.ceil(positionfixed.top);

                    _left = Math.ceil(positionfixed.left);

                }

                $win.off('scroll.' + id).on('scroll.' + id, function() {

                    if (jQuery.queue($box[0], "fx").length > 0 && !boxPositionData) {

                        $box.stop(true, false);

                        _top = $box[0].offsetTop - oldsTop;

                        _left = $box[0].offsetLeft - oldsLeft;

                    }

                    if (lastTimer) clearTimeout(lastTimer);

                    lastTimer = setTimeout(fun, 200);

                    function fun() {

                        !boxPositionData && (_top = $box[0].offsetTop - oldsTop);

                        !boxPositionData && (_left = $box[0].offsetLeft - oldsLeft);

                        oldsTop = $win.scrollTop();

                        oldsLeft = $win.scrollLeft();

                        $box.stop(true, false).animate({
                            left: $.leoTools.range(oldsLeft + _left, oldsLeft, $doc.width() - $box.outerWidth()),
                            top: $.leoTools.range(oldsTop + _top, oldsTop, $doc.height() - $box.outerHeight())
                        }, {
                            duration: 500,
                            queue: id
                        }).dequeue(id);

                        !! boxPositionData && (boxPositionData = null);

                    };

                }).triggerHandler('scroll.' + id);

            })

        };

    };

    $.leoTools.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

    $.leoTools.isSupport__proto__ = ({}).__proto__ == Object.prototype;

    $.leoTools.clone = function(obj){

        var newObj,noop = function(){};

        if (Object.create) {

            newObj = Object.create(obj);

        } else {

            noop.prototype = obj;

            newObj = new noop();

        }

        return newObj;

    };

    $.leoTools.createPrototype = function(proto, constructor) {

        var newProto = $.leoTools.clone(proto);

        newProto.constructor = constructor;

        return newProto;

    }

    $.leoTools.extend = function( target ) {

        var input = aslice.call( arguments, 1 ),inputIndex = 0,inputLength = input.length,key,value;

        for ( ; inputIndex < inputLength; inputIndex++ ) {

            for ( key in input[ inputIndex ] ) {

                value = input[ inputIndex ][ key ];

                if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

                    if ( $.isPlainObject( value ) ) {

                        target[ key ] = $.isPlainObject( target[ key ] ) ? $.leoTools.extend( {}, target[ key ], value ) : $.leoTools.extend( {}, value );

                    } else {

                        target[ key ] = value;

                    }

                }

            }

        }

        return target;

    };

    $.leoTools.bridge = function( name, isFn ) {

        if(!isFn){

            $[name] = function(options){

                function returnFn( obj ){

                    var instance = obj;

                    function inFn( options ){

                        var isMethodCall = typeof options === "string",args = aslice.call( arguments, 1 ),

                        returnValue = instance.$target;

                        if (  !isMethodCall || !instance ) {

                            return false;

                        }

                        if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {

                            return false;

                        }

                        methodValue = instance[ options ].apply( instance, args );

                        if ( methodValue !== instance && methodValue !== undefined ) {

                            returnValue = methodValue && methodValue.jquery ? returnValue.pushStack( methodValue.get() ) : methodValue;

                        }

                        return returnValue;

                    }

                    for (var key in obj ) {

                        if ( $.isFunction( obj[key] ) && key.charAt( 0 ) !== "_" && key !== 'constructor' ) {

                            inFn[key] = function(key){

                                return function(){

                                    ap.unshift.call( arguments, key );

                                    return inFn.apply( inFn,arguments );

                                }

                            }( key );

                        }

                    }

                    return inFn;

                }

                return returnFn( new $.leoTools.plugIn[name]['prototype']( options, false, false ) );

            }


        }else{

            var fullName = $.leoTools.getExpando( name + '_dataId' );

            $.fn[ name ] = function( options ) {

                var isMethodCall = typeof options === "string",args = aslice.call( arguments, 1 ),returnValue = this;

                options = !isMethodCall && args.length ? $.leoTools.extend.apply( null, [ options ].concat(args) ) : options;

                if ( isMethodCall ) {

                    this.each(function() {

                        var methodValue,instance = $.data( this, fullName );

                        if ( !instance ) {

                            return false;

                        }

                        if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {

                            return false;

                        }

                        methodValue = instance[ options ].apply( instance, args );

                        if ( methodValue !== instance && methodValue !== undefined ) {

                            returnValue = methodValue && methodValue.jquery ?returnValue.pushStack( methodValue.get() ) : methodValue;

                            return false;

                        }

                    });

                } else {

                    this.each(function() {

                        var instance = $.data( this, fullName );

                        if ( instance ) {

                            instance.option( options || {} );

                            if ( instance._init ) {

                                instance._init();

                            }

                        } else {

                            new $.leoTools.plugIn[name]['prototype']( options, this, fullName );

                        }

                    });

                }

                return returnValue;

            };

        }

    };

    $.leoTools.plugIn = function( options, methods ){

        var defaults = {

            name:'leo',

            version:'1.0',

            defaultsTarget:'target',

            inherit:false,

            disabledEvent:false,

            addJquery:false,

            addJqueryFn:true,

            _init: $.noop,

            _destroy: $.noop,

            _setOption :$.noop

        },li = $.extend( {}, defaults, options ),inherit;

        if( typeof li.name !== 'string' ){ return; }

        if( !!$.leoTools.plugIn[li.inherit] && jQuery.isFunction( inherit = $.leoTools.plugIn[li.inherit]['prototype'] ) ){

            function PlugIn( hash, target, dataId ){

                inherit.apply( this, arguments );

            }

            if ( $.leoTools.isSupport__proto__ ) {

                PlugIn.prototype.__proto__ = inherit.prototype;

            } else {

                PlugIn.prototype = $.leoTools.createPrototype( inherit.prototype, PlugIn );

            }

            li.defaults = $.extend( {}, $.leoTools.plugIn[li.inherit]['options'], li.defaults );

            $.extend( PlugIn.prototype, li );

            PlugIn.prototype[li.inherit] = {};

            $.each( PlugIn.prototype, function( prop, value ) {

                if ( !$.isFunction( value ) || !!$.leoTools.plugIn.PlugInBasePrototypeKeys[prop] || !inherit.prototype[prop] ){

                    return;

                }

                PlugIn.prototype[prop] = (function(){

                    var _super = function(){

                        return inherit.prototype[prop].apply( this, arguments );

                    },

                    _superApply = function( args ){

                        return inherit.prototype[prop].apply( this, args );

                    };

                    PlugIn.prototype[li.inherit][prop] = _super;

                    return function(){

                        var __super = this._super, __superApply = this._superApply,returnValue;

                        this._super = _super;

                        this._superApply = _superApply;

                        returnValue = value.apply( this, arguments );

                        this._super = __super;

                        this._superApply = __superApply;

                        return returnValue;

                    };

                })();

            });

        }else{

            function PlugIn( hash, target, dataId ){

                this.options = $.extend( true, {}, this.defaults, hash );

                this.$target = $( target || this.options[this.defaultsTarget] );

                this.dataId = dataId;

                this.nameSpace = $.leoTools.getId( this.name + this.version + '_nameSpace' );

                this.disableClassName = this.disableClassName || 'LeoPlugIn_' + this.name + '_disable';

                this.disableIdArr = [];

                this.offArr = [];

                this._create();

            }

            PlugIn.prototype = {

                constructor: PlugIn,

                _create:function(){

                    this.document = $( this.$target[0].style ?this.$target[0].ownerDocument :this.$target[0].document || this.$target[0] );

                    this.window = $( this.document[0].defaultView || this.document[0].parentWindow );

                    this._init();

                    this.dataId !== false && $.data( this.$target[0], this.dataId, this );

                    this._publicEvent = function(plugIn){

                        return function(eventName){

                            if(typeof eventName !== 'string' || eventName.charAt( 0 ) === "_"){ return; }

                            return plugIn[eventName].apply(plugIn, aslice.call( arguments, 1 ) );

                        }

                    }(this);

                },

                _delay: function( handler, delay ) {

                    var instance = this;

                    function handlerProxy() {

                        return ( typeof handler === "string" ? instance[ handler ] : handler ).apply( instance, arguments );

                    }

                    return setTimeout( handlerProxy, delay || 0 );

                },

                _on:function(){

                    var arg = aslice.call( arguments, 2 ),

                    $self = $(arguments[0]),self = $self[0],leoUiGuid,

                    events = arguments[1], eventStr = '',This = this,oldFn,last;

                    if( typeof events === 'string' && !!self ){

                        events.replace( $.leoTools.rword, function(name) {

                            eventStr += name + '.' + This.nameSpace + ' ';

                        });

                        if( !!self.parentNode && arg[arg.length-1] === 'supportDisabled' && arg.pop() ){

                            if( $.isFunction( oldFn = arg[last = arg.length - 1]) ){

                                arg[last] = function(event){

                                    if( This.$$disabledEvent === true || !$( event.target ).closest( "." + This.disableClassName )[0] ){

                                        if( This.options.disabledEvent === true ){ return; }

                                        oldFn.apply(this,arguments);

                                    }

                                }

                            }

                        }else if( $.isFunction( oldFn = arg[last = arg.length - 1] ) ){

                            arg[last] = function(event){

                                if( This.$$disabledEvent === true ){ return; }

                                oldFn.apply(this,arguments);

                            }

                        }

                        arg = [eventStr].concat(arg);

                        $self.on.apply($self, arg);

                        !!oldFn && typeof ( leoUiGuid = arg[arg.length - 1].guid ) === 'number' && ( oldFn.leoUiGuid = leoUiGuid );

                        $.inArray( self, this.offArr ) === -1 && this.offArr.push( self );

                    }

                },

                _off:function(){

                    var arg = aslice.call( arguments, 2 ),

                    $self = $(arguments[0]),originalFn,emptyFn,last,leoUiGuid,

                    events = arguments[1],eventStr = '',This = this;

                    if( typeof events === 'string' && !!$self[0] ){

                        events.replace( $.leoTools.rword, function(name) {

                            eventStr += name + '.' + This.nameSpace + ' ';

                        });

                        if( $.isFunction(arg[last = arg.length - 1]) && !!( leoUiGuid = arg[last].leoUiGuid ) ){

                            emptyFn = $.noop;

                            emptyFn.guid = leoUiGuid

                            arg[last] = emptyFn;

                            emptyFn = null;

                        }

                        arg = [eventStr].concat(arg);

                        $self.off.apply( $self, arg );

                    }else{

                        arg = aslice.call( arguments, 1 );

                        $self.off.apply( $self, ['.' + This.nameSpace].concat(arg) );

                    }

                },

                _hasPlugIn:function( $self, name ){

                    return !!$self.data( $.leoTools.getExpando( name + '_dataId' ) );

                },

                _trigger:function( el, event, arg ){

                    if( typeof event === 'string' && !!el ){

                        $(el).trigger( event + '.' + this.nameSpace, arg );

                    }else if( typeof event === 'object' ){

                        $(el).trigger(event);

                    }

                },

                _targetTrigger:function( name, fn, context ){

                    if( !!name && !!fn && $.isFunction(fn) ){

                        !!context ? this._on( this.$target , name, $.proxy( fn, context ) ) : this._on( this.$target, name, fn );

                    }else if( !!name ) {

                        this.$target.trigger( name + '.' + this.nameSpace, fn );

                    }

                },

                _disable:function( $box ){

                    !$box.hasClass( this.disableClassName ) && ( $box.addClass( this.disableClassName ), this.disableIdArr.push( $box[0] ) );

                },

                _enable:function( $box ){

                    $box.hasClass( this.disableClassName ) && this.disableIdArr.length > 0 && ( this.disableIdArr = $.grep( this.disableIdArr, function( val, index ) {

                        return val !== $box[0];

                    } ), $box.removeClass( this.disableClassName ) );

                },

                trigger: function(){

                    this._trigger.apply(this,arguments);

                },

                destroy: function() {

                    this._deletData();

                    this.dataId !== false && this.$target.removeData(this.dataId);

                    this._destroy();

                },

                widget: function(){

                    return this.$target || null;

                },

                _deletData:function(){

                    var This = this;

                    !!this.disableIdArr && this.disableIdArr.length>0 && $.each(this.disableIdArr,function(index,val) {

                        $(val).removeClass( This.disableClassName );

                    });

                    !!this.offArr && this.offArr.length>0 && $.each(this.offArr,function(index,val) {

                        $(val).off(  '.' + This.nameSpace );

                    });

                    delete this.disableIdArr;

                    delete this.offArr;

                    return this;

                },

                option: function( key, value ) {

                    var options = key,parts,curOption,i,oldKey;

                    if ( arguments.length === 0 ) {

                        return $.leoTools.extend( {}, this.options );

                    }

                    if ( typeof key === "string" ) {

                        options = {};

                        oldKey = key;

                        parts = key.split( "." );

                        key = parts.shift();

                        if ( parts.length ) {

                            curOption = options[ key ] = $.leoTools.extend( {}, this.options[ key ] );

                            for ( i = 0; i < parts.length - 1; i++ ) {

                                curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};

                                curOption = curOption[ parts[ i ] ];

                            }

                            key = parts.pop();

                            if ( arguments.length === 1 ) {

                                return curOption[ key ] === undefined ? null : curOption[ key ];

                            }

                            curOption[ key ] = value;

                            this.__setOption(  oldKey, value, true );

                        } else {

                            if ( arguments.length === 1 ) {

                                return this.options[ key ] === undefined ? null : this.options[ key ];

                            }

                            options[ key ] = value;

                            this.__setOptions( options );

                        }

                    }else{

                        this.__setOptions( options );

                    }

                    return this;

                },

                __setOptions: function( options ) {

                    var key;

                    for ( key in options ) {

                        if( options.hasOwnProperty( key ) ){

                            if( key.indexOf('.') !== -1 ){

                                this.__setOption(  key, options[ key ], true );

                            }else{

                                this.__setOption( key, options[ key ] );

                            }

                        }

                    }

                    return this;

                },

                __setOption: function( key, value, bParts ) {

                    if(bParts){

                        var parts = key.split( "." );

                        ( function f( options, parts, lastKey, value ){

                            var key, rKey = parts.shift();

                            if( rKey === lastKey ){

                                options[lastKey] = value

                                return options[lastKey] !== undefined;

                            }

                            for ( key in options ) {

                                if( options.hasOwnProperty( key ) ){

                                    if( key === rKey ){

                                        return f( options[key], parts,lastKey,value );

                                    }

                                }

                            }

                        })( this.options, parts, parts[parts.length-1], value ) && this._setOption( key, value );

                    }else{

                        this.options[ key ] = value;

                        this._setOption( key, value );

                    }

                    return this;

                }

            }

            if( !$.leoTools.plugIn.PlugInBasePrototypeKeys ){

                var key,val = PlugIn.prototype;

                $.leoTools.plugIn.PlugInBasePrototypeKeys = {};

                for ( key in val ) {

                    if( ohasOwn.call( val, key ) ){

                        !!key && ( key !== 'constructor' ) && ( $.leoTools.plugIn.PlugInBasePrototypeKeys[key] = true );

                    }

                };

            }

            $.extend( PlugIn.prototype, li );

        }

        function setMethods( name, methods, fn ){

            var key;

            for ( key in methods ) {

                if( ohasOwn.call( methods, key ) ){

                    if( key.charAt( 0 ) !== "_" ){

                        fn[key] = function( PlugInPrototype, fn, key ){

                            return function(){

                                return methods[key].apply( PlugInPrototype, arguments );

                            }

                        }( PlugIn.prototype, fn, key );

                    }else{

                        methods[key].call( PlugIn.prototype, fn );

                    }

                }

            }

        }

        $.leoTools.plugIn[li.name] = { prototype: PlugIn, options: li.defaults};

        if( li.addJquery === true ){

            $.leoTools.bridge( li.name );

            setMethods( li.name, methods, $[li.name] );

        }

        if( li.addJqueryFn === true ){

            $.leoTools.bridge( li.name, true );

            setMethods( li.name, methods, $.fn[li.name] );

        }

    }

    $.leoTools.plugIn({

        name:'delayScrollOrResize',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            selector:window,

            events:'scroll',

            handler:$.noop(),

            delay:100

        },

        init:function(){

            var time;

            if( typeof options.delay === 'number' && options.delay >= 0 ){

                this._on( options.selector, options.events, function(){

                    !!time && clearTimeout(time);

                    time = setTimeout( function(){

                        options.handler.apply( $box, arguments );

                    }, options.delay );

                })


            }else{

                this._on( options.selector, options.events, function(){

                    options.handler.apply( $box, arguments );

                })

            }

        }

    });

    return $;

}));