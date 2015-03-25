/**
+-------------------------------------------------------------------
* jQuery leoUi--util
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($){

    $.leoTools = $.leoTools || {};

     //返回最里层子类
    $.leoTools.findInnerMostChildren = function($box,selector,childrenArray){

        childrenArray = childrenArray || [];

        selector = selector || '*';

        $box.each(function(i,el){

             if($(el)[0].childNodes.length === 1&&!!$(el).filter(selector)[0]&&($(el).filter(selector)[0].nodeType === 1)){

                childrenArray[childrenArray.length] = $(el);

             }else{

                $.leoTools.findInnerMostChildren($(el).children(),selector,childrenArray);

             }

        });

        return childrenArray;

    };

    // 返回box范围默认屏幕可见范围
    $.leoTools.boxArea = function(position){

        var $win = $(window),$doc = $(document),areaMaxX,areaMaxY;

        if (position === 'absolute') {

            areaMaxX = $doc.width();

            areaMaxY = $doc.height();

        } else if (position === 'fixed') {

            areaMaxX = $win.width();

            areaMaxY = $win.height();


        }

        return {

            areaMaxX: areaMaxX,

            areaMaxY: areaMaxY

        };

    };

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

            return false;

        }

        boxOuterH > winH && (areaMaxY = areaMinY);

        boxOuterW > winW && (areaMaxX = areaMinX);

        return {

            areaMinX: areaMinX,

            areaMinY: areaMinY,

            areaMaxX: areaMaxX,

            areaMaxY: areaMaxY

        };

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

        };

    };

    //box在屏幕中出现的位置data：[{'PER':0.25},{'PER':0.5}]||[{'PX':100},{'PX':100}],BOX出现位置第一个为TOP第二个为LEFT,PER为百分比,PX为像素
    $.leoTools.boxPosition = function($box, position, data) {

        var $win = $(window),

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

            }

            if (iBoxLeft < iWinwdowScrollLeft) {

                iBoxLeft = iWinwdowScrollLeft;

            }

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

        return {

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

        return props;

    };

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

                        }, 0);

                    }

                });

            });


        } else {

            !! $box[0] && $box.each(function(index, el) {

                var id = $(el).data(dataId);

                !! id && $win.off('resize.' + id) && $(el).removeData(dataId);

            });

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

                    }

                }).triggerHandler('scroll.' + id);

            });

        }

    };

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

            var time,options = this.options;

            if( typeof options.delay === 'number' && options.delay >= 0 ){

                this._on( options.selector, options.events, function(){

                    !!time && clearTimeout(time);

                    time = setTimeout( function(){

                        options.handler.apply( this, arguments );

                    }, options.delay );

                });


            }else{

                this._on( options.selector, options.events, function(){

                    options.handler.apply( this, arguments );

                });

            }

        }

    });

}));