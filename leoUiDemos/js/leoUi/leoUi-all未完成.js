/**
+-------------------------------------------------------------------
* jQuery leoUi
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function (factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["jquery"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function ($) {

    /*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
     * Licensed under the MIT License (LICENSE.txt).
     *
     * Version: 3.1.11
     *
     * Requires: jQuery 1.2.2+
     */

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.11',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $parent = $(elem)['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10);
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

    /*!
     * jQuery UI Position 1.11.0-beta.1
     * http://jqueryui.com
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/position/
     *
     * leoUI：修改getDimensions()，加上borders；
     *
     */

    (function($) {

        $.ui = $.ui || {};

        var cachedScrollbarWidth, supportsOffsetFractions,
            max = Math.max,
            abs = Math.abs,
            round = Math.round,
            rhorizontal = /left|center|right/,
            rvertical = /top|center|bottom/,
            roffset = /[\+\-]\d+(\.[\d]+)?%?/,
            rposition = /^\w+/,
            rpercent = /%$/,
            _position = $.fn.position;

        function getOffsets(offsets, width, height) {
            return [
                parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1),
                parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)
            ];
        }

        function parseCss(element, property) {
            return parseInt($.css(element, property), 10) || 0;
        }

        function getDimensions(elem) {
            var raw = elem[0];
            if (raw.nodeType === 9) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: {
                        top: 0,
                        left: 0
                    },
                    borders:{
                        borderLeft: 0,
                        borderTop: 0,
                        borderRight: 0,
                        borderBottom: 0
                    }
                };
            }
            if ($.isWindow(raw)) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: {
                        top: elem.scrollTop(),
                        left: elem.scrollLeft()
                    },
                    borders:{
                        borderLeft: 0,
                        borderTop: 0,
                        borderRight: 0,
                        borderBottom: 0
                    }
                };
            }
            if (raw.preventDefault) {
                return {
                    width: 0,
                    height: 0,
                    offset: {
                        top: raw.pageY,
                        left: raw.pageX
                    },
                    borders:{
                        borderLeft: 0,
                        borderTop: 0,
                        borderRight: 0,
                        borderBottom: 0
                    }
                };
            }
            return {
                width: elem.outerWidth(),
                height: elem.outerHeight(),
                offset: elem.offset(),
                borders:{
                    borderLeft: parseCss(raw, "borderLeftWidth"),
                    borderTop: parseCss(raw, "borderTopWidth"),
                    borderRight: parseCss(raw, "borderRightWidth"),
                    borderBottom: parseCss(raw, "borderBottomWidth")
                }
            };
        }

        $.position = {
            scrollbarWidth: function() {
                if (cachedScrollbarWidth !== undefined) {
                    return cachedScrollbarWidth;
                }
                var w1, w2,
                    div = $("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
                    innerDiv = div.children()[0];

                $("body").append(div);
                w1 = innerDiv.offsetWidth;
                div.css("overflow", "scroll");

                w2 = innerDiv.offsetWidth;

                if (w1 === w2) {
                    w2 = div[0].clientWidth;
                }

                div.remove();

                return (cachedScrollbarWidth = w1 - w2);
            },
            getScrollInfo: function(within) {
                var overflowX = within.isWindow || within.isDocument ? "" :
                    within.element.css("overflow-x"),
                    overflowY = within.isWindow || within.isDocument ? "" :
                        within.element.css("overflow-y"),
                    hasOverflowX = overflowX === "scroll" ||
                        (overflowX === "auto" && within.width < within.element[0].scrollWidth),
                    hasOverflowY = overflowY === "scroll" ||
                        (overflowY === "auto" && within.height < within.element[0].scrollHeight);
                return {
                    width: hasOverflowY ? $.position.scrollbarWidth() : 0,
                    height: hasOverflowX ? $.position.scrollbarWidth() : 0
                };
            },
            getWithinInfo: function(element) {
                var withinElement = $(element || window),
                    isWindow = $.isWindow(withinElement[0]),
                    isDocument = !! withinElement[0] && withinElement[0].nodeType === 9;
                return {
                    element: withinElement,
                    isWindow: isWindow,
                    isDocument: isDocument,
                    offset: withinElement.offset() || {
                        left: 0,
                        top: 0
                    },
                    scrollLeft: withinElement.scrollLeft(),
                    scrollTop: withinElement.scrollTop(),
                    width: isWindow ? withinElement.width() : withinElement.outerWidth(),
                    height: isWindow ? withinElement.height() : withinElement.outerHeight()
                };
            }
        };

        $.fn.position = function(options) {
            if (!options || !options.of) {
                return _position.apply(this, arguments);
            }

            // make a copy, we don't want to modify arguments
            options = $.extend({}, options);

            var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
                target = $(options.of),
                within = $.position.getWithinInfo(options.within),
                scrollInfo = $.position.getScrollInfo(within),
                collision = (options.collision || "flip").split(" "),
                offsets = {};

            dimensions = getDimensions(target);
            if (target[0].preventDefault) {
                // force left top to allow flipping
                options.at = "left top";
            }
            targetWidth = dimensions.width;
            targetHeight = dimensions.height;
            targetOffset = dimensions.offset;
            targetborders = dimensions.borders;
            // clone to reuse original targetOffset later
            basePosition = $.extend({}, targetOffset);

            // force my and at to have valid horizontal and vertical positions
            // if a value is missing or invalid, it will be converted to center
            $.each(["my", "at"], function() {
                var pos = (options[this] || "").split(" "),
                    horizontalOffset,
                    verticalOffset;

                if (pos.length === 1) {
                    pos = rhorizontal.test(pos[0]) ?
                        pos.concat(["center"]) :
                        rvertical.test(pos[0]) ? ["center"].concat(pos) : ["center", "center"];
                }
                pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
                pos[1] = rvertical.test(pos[1]) ? pos[1] : "center";

                // calculate offsets
                horizontalOffset = roffset.exec(pos[0]);
                verticalOffset = roffset.exec(pos[1]);
                offsets[this] = [
                    horizontalOffset ? horizontalOffset[0] : 0,
                    verticalOffset ? verticalOffset[0] : 0
                ];

                // reduce to just the positions without the offsets
                options[this] = [
                    rposition.exec(pos[0])[0],
                    rposition.exec(pos[1])[0]
                ];
            });

            // normalize collision option
            if (collision.length === 1) {
                collision[1] = collision[0];
            }

            if (options.at[0] === "left") {
                basePosition.left += targetborders.borderLeft;
            }else if (options.at[0] === "right") {
                basePosition.left += targetWidth - targetborders.borderRight;
            } else if (options.at[0] === "center") {
                basePosition.left += targetWidth / 2;
            }

            if (options.at[1] === "top") {
                basePosition.top += targetborders.borderTop;
            }else if (options.at[1] === "bottom") {
                basePosition.top += targetHeight - targetborders.borderBottom;
            } else if (options.at[1] === "center") {
                basePosition.top += targetHeight / 2;
            }

            atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
            basePosition.left += atOffset[0];
            basePosition.top += atOffset[1];

            return this.each(function() {
                var collisionPosition, using,
                    elem = $(this),
                    elemWidth = elem.outerWidth(),
                    elemHeight = elem.outerHeight(),
                    marginLeft = parseCss(this, "marginLeft"),
                    marginTop = parseCss(this, "marginTop"),
                    collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width,
                    collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height,
                    position = $.extend({}, basePosition),
                    myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());

                if (options.my[0] === "right") {
                    position.left -= elemWidth;
                } else if (options.my[0] === "center") {
                    position.left -= elemWidth / 2;
                }

                if (options.my[1] === "bottom") {
                    position.top -= elemHeight;
                } else if (options.my[1] === "center") {
                    position.top -= elemHeight / 2;
                }

                position.left += myOffset[0];
                position.top += myOffset[1];

                // if the browser doesn't support fractions, then round for consistent results
                if (!supportsOffsetFractions) {
                    position.left = round(position.left);
                    position.top = round(position.top);
                }

                collisionPosition = {
                    marginLeft: marginLeft,
                    marginTop: marginTop
                };

                $.each(["left", "top"], function(i, dir) {
                    if ($.ui.position[collision[i]]) {
                        $.ui.position[collision[i]][dir](position, {
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            elemWidth: elemWidth,
                            elemHeight: elemHeight,
                            collisionPosition: collisionPosition,
                            collisionWidth: collisionWidth,
                            collisionHeight: collisionHeight,
                            offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
                            my: options.my,
                            at: options.at,
                            within: within,
                            elem: elem
                        });
                    }
                });

                if (options.using) {
                    // adds feedback as second argument to using callback, if present
                    using = function(props) {
                        var left = targetOffset.left - position.left,
                            right = left + targetWidth - elemWidth,
                            top = targetOffset.top - position.top,
                            bottom = top + targetHeight - elemHeight,
                            feedback = {
                                target: {
                                    element: target,
                                    left: targetOffset.left,
                                    top: targetOffset.top,
                                    width: targetWidth,
                                    height: targetHeight
                                },
                                element: {
                                    element: elem,
                                    left: position.left,
                                    top: position.top,
                                    width: elemWidth,
                                    height: elemHeight
                                },
                                horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                                vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                            };
                        if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
                            feedback.horizontal = "center";
                        }
                        if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
                            feedback.vertical = "middle";
                        }
                        if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
                            feedback.important = "horizontal";
                        } else {
                            feedback.important = "vertical";
                        }
                        options.using.call(this, props, feedback);
                    };
                }

                elem.offset($.extend(position, {
                    using: using
                }));
            });
        };

        $.ui.position = {
            fit: {
                left: function(position, data) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                        outerWidth = within.width,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = withinOffset - collisionPosLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                        newOverRight;

                    // element is wider than within
                    if (data.collisionWidth > outerWidth) {
                        // element is initially over the left side of within
                        if (overLeft > 0 && overRight <= 0) {
                            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                            position.left += overLeft - newOverRight;
                            // element is initially over right side of within
                        } else if (overRight > 0 && overLeft <= 0) {
                            position.left = withinOffset;
                            // element is initially over both left and right sides of within
                        } else {
                            if (overLeft > overRight) {
                                position.left = withinOffset + outerWidth - data.collisionWidth;
                            } else {
                                position.left = withinOffset;
                            }
                        }
                        // too far left -> align with left edge
                    } else if (overLeft > 0) {
                        position.left += overLeft;
                        // too far right -> align with right edge
                    } else if (overRight > 0) {
                        position.left -= overRight;
                        // adjust based on position and margin
                    } else {
                        position.left = max(position.left - collisionPosLeft, position.left);
                    }
                },
                top: function(position, data) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                        outerHeight = data.within.height,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = withinOffset - collisionPosTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                        newOverBottom;

                    // element is taller than within
                    if (data.collisionHeight > outerHeight) {
                        // element is initially over the top of within
                        if (overTop > 0 && overBottom <= 0) {
                            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                            position.top += overTop - newOverBottom;
                            // element is initially over bottom of within
                        } else if (overBottom > 0 && overTop <= 0) {
                            position.top = withinOffset;
                            // element is initially over both top and bottom of within
                        } else {
                            if (overTop > overBottom) {
                                position.top = withinOffset + outerHeight - data.collisionHeight;
                            } else {
                                position.top = withinOffset;
                            }
                        }
                        // too far up -> align with top
                    } else if (overTop > 0) {
                        position.top += overTop;
                        // too far down -> align with bottom edge
                    } else if (overBottom > 0) {
                        position.top -= overBottom;
                        // adjust based on position and margin
                    } else {
                        position.top = max(position.top - collisionPosTop, position.top);
                    }
                }
            },
            flip: {
                left: function(position, data) {
                    var within = data.within,
                        withinOffset = within.offset.left + within.scrollLeft,
                        outerWidth = within.width,
                        offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = collisionPosLeft - offsetLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                        myOffset = data.my[0] === "left" ? -data.elemWidth :
                            data.my[0] === "right" ?
                            data.elemWidth :
                            0,
                        atOffset = data.at[0] === "left" ?
                            data.targetWidth :
                            data.at[0] === "right" ? -data.targetWidth :
                            0,
                        offset = -2 * data.offset[0],
                        newOverRight,
                        newOverLeft;

                    if (overLeft < 0) {
                        newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                        if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                            position.left += myOffset + atOffset + offset;
                        }
                    } else if (overRight > 0) {
                        newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                        if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                            position.left += myOffset + atOffset + offset;
                        }
                    }
                },
                top: function(position, data) {
                    var within = data.within,
                        withinOffset = within.offset.top + within.scrollTop,
                        outerHeight = within.height,
                        offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = collisionPosTop - offsetTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                        top = data.my[1] === "top",
                        myOffset = top ? -data.elemHeight :
                            data.my[1] === "bottom" ?
                            data.elemHeight :
                            0,
                        atOffset = data.at[1] === "top" ?
                            data.targetHeight :
                            data.at[1] === "bottom" ? -data.targetHeight :
                            0,
                        offset = -2 * data.offset[1],
                        newOverTop,
                        newOverBottom;
                    if (overTop < 0) {
                        newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                        if ((position.top + myOffset + atOffset + offset) > overTop && (newOverBottom < 0 || newOverBottom < abs(overTop))) {
                            position.top += myOffset + atOffset + offset;
                        }
                    } else if (overBottom > 0) {
                        newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                        if ((position.top + myOffset + atOffset + offset) > overBottom && (newOverTop > 0 || abs(newOverTop) < overBottom)) {
                            position.top += myOffset + atOffset + offset;
                        }
                    }
                }
            },
            flipfit: {
                left: function() {
                    $.ui.position.flip.left.apply(this, arguments);
                    $.ui.position.fit.left.apply(this, arguments);
                },
                top: function() {
                    $.ui.position.flip.top.apply(this, arguments);
                    $.ui.position.fit.top.apply(this, arguments);
                }
            }
        };

        // fraction support test
        (function() {
            var testElement, testElementParent, testElementStyle, offsetLeft, i,
                body = document.getElementsByTagName("body")[0],
                div = document.createElement("div");

            //Create a "fake body" for testing based on method used in jQuery.support
            testElement = document.createElement(body ? "div" : "body");
            testElementStyle = {
                visibility: "hidden",
                width: 0,
                height: 0,
                border: 0,
                margin: 0,
                background: "none"
            };
            if (body) {
                $.extend(testElementStyle, {
                    position: "absolute",
                    left: "-1000px",
                    top: "-1000px"
                });
            }
            for (i in testElementStyle) {
                testElement.style[i] = testElementStyle[i];
            }
            testElement.appendChild(div);
            testElementParent = body || document.documentElement;
            testElementParent.insertBefore(testElement, testElementParent.firstChild);

            div.style.cssText = "position: absolute; left: 10.7432222px;";

            offsetLeft = $(div).offset().left;
            supportsOffsetFractions = offsetLeft > 10 && offsetLeft < 11;

            testElement.innerHTML = "";
            testElementParent.removeChild(testElement);
        })();

    })(jQuery);

    /**
    +-------------------------------------------------------------------
    * jQuery leoUi--leoTools
    +-------------------------------------------------------------------
    * @version    1.0.0 beta
    * @author     leo
    +-------------------------------------------------------------------
    */
    ;(function($) {

        var ap = Array.prototype,aslice = ap.slice,expandoId,oproto = Object.prototype,ohasOwn = oproto.hasOwnProperty;

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
        $.leoTools.random = function(min, max) {

            if (max == null) {

                max = min;

                min = 0;

            }

            return min + Math.floor(Math.random() * (max - min + 1));

        };

        $.leoTools.has = function(obj, key) {
            return hasOwnProperty.call(obj, key);
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

                        return inFn

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

                addJquery:false,

                addJqueryFn:true,

                _init: $.noop,

                _destroy: $.noop,

                _setOption :$.noop

            },li = $.extend( {}, defaults, options ),inherit;

            if( typeof li.name !== 'string' ){ return; }

            if( typeof li.inherit === 'string' && jQuery.isFunction( inherit = $.leoTools.plugIn[li.inherit]['prototype'] ) ){

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

                    this.nameSpace = $.leoTools.getId( li.name + li.version + '_nameSpace' );

                    this.disableClassName = this.disableClassName || 'LeoPlugIn_' + li.name + '_disable';

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

                    },

                    _delay: function( handler, delay ) {

                        !!this._delayTime && clearTimeout( this._delayTime );

                        var instance = this;

                        function handlerProxy() {

                            return ( typeof handler === "string" ? instance[ handler ] : handler ).apply( instance, arguments );

                        }

                        return this._delayTime = setTimeout( handlerProxy, delay || 0 );

                    },

                    _on:function(){

                        var arg = aslice.call( arguments, 2 ),sef = $( arguments[0] ),

                        events = arguments[1], eventStr = '',This = this;

                        if( typeof events === 'string' && !!sef.length>0 ){

                            events.replace( $.leoTools.rword, function(name) {

                                eventStr += name + '.' + This.nameSpace + ' ';

                            });

                            if( !!sef[0].parentNode && arg[arg.length-1] === 'supportDisabled' && arg.pop() ){

                                var oldFn = arg[arg.length-1];

                                arg[arg.length-1] = function(event){

                                    if( !!$( event.target ).closest( "." + This.disableClassName )[0] ){

                                        return;

                                    }

                                    oldFn.apply(sef,arguments);

                                }

                            }

                            arg = [eventStr].concat(arg);

                            sef.on.apply(sef,arg);

                            $.inArray( sef[0], this.offArr ) && this.offArr.push( sef[0] );

                        }

                    },

                    _off:function(){

                        var arg = aslice.call( arguments, 2 ),sef = $( arguments[0] ),

                        events = arguments[1],eventStr = '',This = this;

                        if( typeof events === 'string' ){

                            events.replace($.leoTools.rword, function(name) {

                                eventStr += name + '.' + This.nameSpace + ' ';

                            });

                            arg = [eventStr].concat(arg);

                            sef.off.apply( sef, arg );

                        }else{

                            arg = aslice.call( arguments, 1 );

                            sef.off.apply( sef, ['.' + This.nameSpace].concat(arg) );

                        }

                    },

                    _hasPlugIn:function( $sef, name ){

                        return !!$sef.data( $.leoTools.getExpando( name + '_dataId' ) );

                    },

                    _trigger:function( name, fn, context ){

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

                    trigger :function( name, fn, context ){

                        this._trigger( name, fn, context );

                    },

                    destroy: function() {

                        this._deletData();

                        this.dataId !== false && this.$target.removeData(this.dataId);

                        this._destroy();

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

                            fn[key] = methods[key]

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

        })

    })(jQuery);

    /**
    +-------------------------------------------------------------------
    * jQuery leoUi--拖拽相关
    +-------------------------------------------------------------------
    * @version    1.0.0 beta
    * @author     leo
    +-------------------------------------------------------------------
    */
    ;(function($) {

        $.leoTools.plugIn({

            name:'leoMouse',

            version:'1.0',

            addJquery:false,

            addJqueryFn:true,

            defaults:{

                cancel:'input,textarea,button,select,option',//防止在指定元素上开始拖动

                delay:0,//时间（以毫秒为单位），当鼠标按下后直到的互动（interactions）激活。此选项可用来阻止当点击一个元素时可能发生的非期望互动（interactions）行为。

                distance:0,

                isSetCapture:false

            },

            _init: function(){

                var that = this;

                this.isSetCapture = this.options.isSetCapture ? 'setCapture' in this.document[0].documentElement : false;

                this._lockDrag = false;

                this._on( this.$target, 'mousedown', function(event) {

                    if( !that._lockDrag ){

                        return that._mouseDown(event);

                    }

                })

                this._on( this.$target, 'click', function(event) {

                    if( true === $.data( event.target, that.dataId + ".preventClickEvent" ) ){

                        $.removeData( event.target, that.dataId + ".preventClickEvent" );

                        event.stopImmediatePropagation();

                        return false;

                    }

                })

                this.started = false;

            },

            _textselect:function(bool) {

                this[bool ? "_on" : "_off"]( this.document, 'selectstart.darg', false )

                this.document.css("-moz-user-select", bool ? "none" : "");

                this.document[0].unselectable = bool ? "off" : "on";

            },

            setLockDrag:function(flag){

                this._lockDrag = !!flag;

            },

            _destroy: function(){},

            _mouseDown: function(event){

                ( this._mouseStarted && this._mouseUp(event) );

                this._mouseDownEvent = event;

                var that = this,btnIsLeft = ( event.which === 1 ),

                elIsCancel = ( typeof this.options.cancel === "string" && event.target.nodeName ? $( event.target ).closest( this.options.cancel ).length : false );

                if( !btnIsLeft || elIsCancel || !this._mouseCapture(event) ){

                    return true;

                }

                this.mouseDelayMet = !this.options.delay;

                if( !this.mouseDelayMet ){

                    this._mouseDelayTimer = setTimeout(function() {

                        that.mouseDelayMet = true;

                    }, this.options.delay);

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

                    return that._mouseMove(event);

                };

                this._mouseUpDelegate = function(event) {

                    return that._mouseUp(event);

                };

                this._on( this.document, 'mousemove', this._mouseMoveDelegate );

                this._on( this.document, 'mouseup', this._mouseUpDelegate );

                this._textselect(true);

                this.isSetCapture && this._mouseDownEvent.target.setCapture();

                event.preventDefault();

                return true;

            },

            _mouseMove: function(event) {

                if( $.leoTools.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button ){

                    return this._mouseUp(event);

                }else if( !event.which ){

                    return this._mouseUp( event );

                }

                if( this._mouseStarted ){

                    this._mouseDrag(event);

                    return event.preventDefault();

                }

                if( this._mouseDistanceMet(event) && this._mouseDelayMet(event) ){

                    this._mouseStarted = (this._mouseStart(this._mouseDownEvent, event) !== false);

                    ( this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event) );

                }

                return !this._mouseStarted;

            },

            _mouseUp: function(event) {

                this._off( this.document, 'mousemove', this._mouseMoveDelegate );

                this._off( this.document, 'mouseup', this._mouseUpDelegate );

                this._textselect(false);

                this.isSetCapture && this._mouseDownEvent.target.releaseCapture();

                if ( this._mouseStarted ) {

                    this._mouseStarted = false;

                    if ( event.target === this._mouseDownEvent.target ) {

                        $.data( event.target, this.dataId + ".preventClickEvent", true );

                    }

                    this._mouseStop(event);

                }

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

                handle:false, //点击拖拽地区

                cancel:'a',

                cursor:'move',//拖动时的CSS指针。

                bClone:true, //是否使用克隆拖拽

                bCloneAnimate:true, //克隆拖拽是否动画

                dragBoxReturnToTarget:false,//是否回到target位置

                duration:400,//动画时间

                stopMouseWheel:false, //拖拽时候是否关闭滚轮事件

                revert:false, //如果设置为true, 当拖动停止时元素将返回它的初始位置。

                revertAnimate:true, //还原是否动画

                axis:false,//可用值为'x'只能在x方向拖动，设置为y只能在Y方向拖动，为空没有限制

                cursorAt:false,//设置拖动帮手相对于鼠标光标的偏移量。坐标可被指定为一个散列 使用的组合中的一个或两个键：{ top, left, right, bottom } 。

                containment:false,  //可以限制draggable只能在指定的元素或区域的边界以内进行拖动。
                                    // Selector: 可拖动元素将被置于由选择器指定的第一个元素的起界限作用的盒模型中。如果没有找到任何元素，则不会设置界限。
                                     // Element: 可拖动的元素将包含该元素的边界框。
                                    // String:可选值: "parent", "document", "window".
                                    // Array: 以 [ x1, y1, x2, y2 ] 数组形式定义一个限制区域

                scroll: true,//如果设置为true, 当拖动时，div盒模型将自动翻滚。

                scrollSensitivity: 20,//离开可视区域边缘多少距离开始滚动。距离是相对指针进行计算的，而不是被拖到元素本身。如果scroll 选项设置为false，则不滚动。

                scrollSpeed: 20,//当鼠标指针的值小于scrollSensitivity的值时，窗口滚动的速度。如果scroll选项设置为false，则该参数无效。

                useDroppable:false,//是否使用Droppable

                droppableScope:'all',//用来设置拖动（draggle）元素和放置（droppable）对象的集合

                disabled:false,//当设置为true时停止拖动。

                grid:false,//拖拽元素时，只能以指定大小的方格进行拖动。数组形式为[ x, y ]。

                iframeFix:false,//在拖动期间阻止iframe捕捉鼠标移过事件。与cursorAt选项搭配使用时或者当鼠标指针可能不在拖动助手元素之上时，该参数非常有用。

                                // 支持多种类型:

                                // Boolean: 当设置为true, 透明层将被放置于页面上的所有iframe之上。

                                // Selector: 任何由选择器匹配的iframe将被透明层覆盖。

                proxy:function(source) { //source

                    return $(source).clone().removeAttr('id').css({'opacity': '0.5'}).insertAfter(source);

                },

                onBeforeDrag:$.noop, //source

                onStartDrag:$.noop, //source,event,dragBox

                onDrag:$.noop, //source,event,dragBox

                onBeforeStopDrag:$.noop, //source,event,dragBox

                onStopDrag:$.noop//source,event

            },

            _init:function(){

                this.$body = this.document.find('body');

                this.$target.css('position') === "static" && ( this.$target[0].style.position = "relative" );

                this.hasClone = false;

                this._getContainment();

                this._super();

            },

            _setOption:function( key, value ){

                if( key === 'handle' ){

                    this.options.handle = value;

                }

                if( key === 'containment'){

                    this._getContainment();

                }

                if( key === 'droppableScope' || key === 'useDroppable' ){

                    this._getDroppableBoxs();

                }

            },

            _getHandle:function(event) {

                return this.options.handle ? !!$( event.target ).closest( this.$target.find( this.options.handle ) ).length : true;

            },

            _blockFrames:function() {

                var iframeFix = this.options.iframeFix,drag = this.$dragBox[0];

                this.iframeBlocks = this.document.find( iframeFix === true ? "iframe" : iframeFix ).map( function() {

                    var iframe = $( this );

                    if( drag === this ){ return null; }

                    return $( "<div>" ).css( { position: "absolute", width: iframe.outerWidth(), height: iframe.outerHeight(), opacity: 0,'backgroundColor':'#fff'} ).insertBefore( this ).offset( iframe.offset() )[0];

                });

            },

            _unblockFrames:function() {

                if ( this.iframeBlocks ) {

                    this.iframeBlocks.remove();

                    delete this.iframeBlocks;

                }

            },

            _mouseCapture:function(event){

                if( this.options.disabled === true || this.options.onBeforeDrag.call( this.$target[0] ) === false || this._getHandle(event) === false ){

                    return false;

                }

                return true;

            },

            _getContainment:function(){

                var oc = this.options.containment,el = this.$target,

                ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( oc === 'parent' ) ? el.parent().get( 0 ) : oc;

                if(!ce){

                    this.$dragMaxX = this.$dragMaxY = 'max';

                    this.$dragMinX = this.$dragMinY = 'min';

                    this.options.containment = false;

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

                    this.$dragMinX = oc[0];

                    this.$dragMinY = oc[1];

                    this.$dragMaxX = oc[2] - this.dragBoxouterW;

                    this.$dragMaxY = oc[3] - this.dragBoxouterH;

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

                    this.$dragMinY = this.$dragMaxY = this.top;

                }else if( this.options.axis === 'y' ){

                    this.$dragMinX = this.$dragMaxX = this.left;

                }

            },

            _getContainmentRange:function(){

                if( this.options.containment === false || this.options.containment.constructor === Array ){

                    return;

                }

                var within = $.position.getWithinInfo( this.$containment[0] ),

                scrollInfo = $.position.getScrollInfo( within ),maxX,maxY

                outerH = this.dragBoxouterH,outerW = this.dragBoxouterW,

                withinOffset = within.isDocument ? { left: 0, top: 0 } : within.isWindow ? { left: within.scrollLeft, top: within.scrollTop } : within.offset;

                this.$dragMinY = withinOffset.top + this.borderWidths.top;

                this.$dragMinX = withinOffset.left + this.borderWidths.left;

                this.$dragMaxY = withinOffset.top + within.height - scrollInfo.height - this.borderWidths.bottom - outerH;

                this.$dragMaxX = withinOffset.left + within.width - scrollInfo.width - this.borderWidths.right - outerW;

                if( this.$dragMinX > this.$dragMaxX ){

                    maxX = this.$dragMinX;

                    this.$dragMinX = this.$dragMaxX;

                    this.$dragMaxX = maxX;

                }

                if( this.$dragMinY > this.$dragMaxY ){

                    maxY = this.$dragMinY;

                    this.$dragMinY = this.$dragMaxY;

                    this.$dragMaxY = maxY;

                }

                this._setAxis();

            },

            _getBorderWidths:function(no) {

                if(no){

                    this.borderWidths = {

                        left:0,

                        top:0,

                        right:0,

                        bottom:0

                    }

                }else{

                    this.borderWidths = {

                        left: $.leoTools.parseCss(  this.$containment[0] ,'borderLeftWidth' ),

                        top: $.leoTools.parseCss(  this.$containment[0] ,'borderTopWidth' ),

                        right: $.leoTools.parseCss(  this.$containment[0] ,'borderRightWidth' ),

                        bottom: $.leoTools.parseCss(  this.$containment[0] ,'borderBottomWidth' )

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

                var offset,o = this.options;

                if( this.hasClone === true ){

                    return;

                }

                this.$dragBox = this.$target;

                this.oldCur = this.$body.css('cursor');

                this.revertBoxTop = $.leoTools.parseCss(this.$target[0],'top');

                this.revertBoxLeft = $.leoTools.parseCss(this.$target[0],'left');

                offset = this.$target.offset();

                this.left = offset.left;

                this.top = offset.top;

                if ( o.bClone ) {

                    !! o.bCloneAnimate && this.$target.stop(true, false);

                    this.$dragBox = o.proxy.call( null, this.$target[0] ).offset( { left: this.left, top: this.top } );

                    this.hasClone = true;

                }

                this.dragBoxouterH = this.$dragBox.outerHeight();

                this.dragBoxouterW = this.$dragBox.outerWidth();

                this.revertBoxTop = this.top;

                this.revertBoxLeft = this.left;

                this._getContainmentInfo();

                this._makecursorAt(event);

                this._stopOnMouseWheel();

                !!o.scroll && ( this.scrollParents = $.leoTools.scrollParents( this.$dragBox, true ) );

                this.startLeft = event.pageX - this.left;

                this.startTop  = event.pageY - this.top;

                this._blockFrames();

                o.onStartDrag.call( this.$target[0], event, this.$dragBox[0] );

                this.$body.css( 'cursor', o.cursor );

                this._getDroppableBoxs();

                this._triggerLeoDroppable( event, 'leoDroppableStar', this.top, this.left );

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

                    this.$dragBox.offset( { left: this.left,top: this.top } );

                }

            },

            getScrollParents:function(){

                this.scrollParents = $.leoTools.scrollParents( this.$dragBox, true );

            },

            _getDroppableBoxs:function(){

                if( !this.options.useDroppable ){

                    return;

                }

                this.droppableBox = !!$.fn[this.relevanceFnName.droppable] && $.fn[this.relevanceFnName.droppable].getElements( this.options.droppableScope );

                this.droppableBoxLen = !!this.droppableBox && this.droppableBox.length || 0;

            },

            _triggerLeoDroppable:function( event, name, top, left ){

                if( this.options.useDroppable && this.droppableBoxLen > 0 ){

                    for ( var i = 0; i < this.droppableBoxLen; i++ ) {

                        $( this.droppableBox[i] ).leoDroppable( 'trigger', name,

                        [{

                            box : this.$target,

                            dragBox :this.$dragBox,

                            dragBoxTop : top,

                            dragBoxLeft : left,

                            pageX : event.pageX,

                            pageY : event.pageY

                        }] );

                    }

                }

            },

            _scroll:function( event, scrollParent, o, scrolled, doc , win ){

                if ( scrollParent !== doc && scrollParent.tagName !== "HTML" ) {

                    var overflowOffset = $(scrollParent).offset();

                    if ( !o.axis || o.axis !== "x" ) {

                        if ( ( overflowOffset.top + scrollParent.offsetHeight) - event.pageY < o.scrollSensitivity ) {

                            scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;

                        } else if ( event.pageY - overflowOffset.top < o.scrollSensitivity ) {

                            scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;

                        }

                    }

                    if ( !o.axis || o.axis !== "y" ) {

                        if ( ( overflowOffset.left + scrollParent.offsetWidth) - event.pageX < o.scrollSensitivity ) {

                            scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;

                        } else if ( event.pageX - overflowOffset.left < o.scrollSensitivity ) {

                            scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;

                        }

                    }

                } else {

                    if ( !o.axis || o.axis !== "x" ) {

                        if ( event.pageY - $(doc).scrollTop() < o.scrollSensitivity ) {

                            scrolled = $(doc).scrollTop( $(doc).scrollTop() - o.scrollSpeed );

                        } else if ( $(win).height() - ( event.pageY - $(doc).scrollTop() ) < o.scrollSensitivity ) {

                            scrolled = $(doc).scrollTop( $(doc).scrollTop() + o.scrollSpeed );

                        }

                    }

                    if ( !o.axis || o.axis !== "y" ) {

                        if ( event.pageX - $(doc).scrollLeft() < o.scrollSensitivity ) {

                            scrolled = $(doc).scrollLeft( $(doc).scrollLeft() - o.scrollSpeed );

                        } else if ( $(win).width() - ( event.pageX - $(doc).scrollLeft() ) < o.scrollSensitivity) {

                            scrolled = $(doc).scrollLeft( $(doc).scrollLeft() + o.scrollSpeed );

                        }

                    }

                }

                if( this.droppableBoxLen > 0 && scrolled !== false ){

                    for (var i = 0; i < this.droppableBoxLen; i++) {

                        $(this.droppableBox[i]).leoDroppable('trigger','leoDroppableOver',

                        [{

                            box : this.$target,

                            dragBox :this.$dragBox,

                            dragBoxTop : this.top,

                            dragBoxLeft : this.left,

                            pageX : event.pageX,

                            pageY : event.pageY

                        }]);

                    }

                }

            },

            _dragScroll:function(event){

                if( this.options.scroll === false ){

                    return

                }

                var scrollParents = this.scrollParents,length =  scrollParents.length;

                if( length > 1 ){

                    for ( i = length - 1; i >= 0; i--) {

                        this._scroll( event, scrollParents[i], this.options, false, this.document[0], this.window );

                    };

                }else{

                    this._scroll( event, scrollParents[0], this.options, false, this.document[0], this.window );

                }

            },

            _setGrid:function(){

                var o = this.options;

                if( o.grid ){

                    this.top = o.grid[1] ? Math.round( this.top / o.grid[1] ) * o.grid[1] : this.top;

                    this.left = o.grid[0] ? Math.round( this.left / o.grid[1] ) * o.grid[1] : this.left;

                }

            },

            _mouseDrag:function(event) {

                var outerH = this.$dragBox.outerHeight(),outerW = this.$dragBox.outerWidth();

                this._dragScroll(event);

                this._getContainmentRange();

                this.left = event.pageX - this.startLeft;

                this.top = event.pageY - this.startTop;

                this._setGrid();

                this.options.onDrag.call( this.$target[0], event, this.$dragBox[0] );

                this.left = $.leoTools.range( this.left, this.$dragMinX, this.$dragMaxX );

                this.top = $.leoTools.range( this.top, this.$dragMinY, this.$dragMaxY );

                this.$dragBox.offset({left:this.left,top:this.top});

                this._triggerLeoDroppable( event, 'leoDroppableOver', this.top, this.left );

            },

            _mouseStop:function(event) {

                var This = this,boxOffset,o = this.options;

                this.$body.css( 'cursor', this.oldCur );

                o.onBeforeStopDrag.call( this.$target[0], event, this.$dragBox[0] );

                this._stopOffMouseWheel();

                this._dragEndStop = false;

                this._triggerLeoDroppable( event, 'leoDroppableEnd', this.top, this.left );

                this._unblockFrames();

                if( this._dragEndStop ){

                    if( o.bClone ){

                        this.$dragBox.remove();

                        this.hasClone = false;

                    }

                }else{

                    if( o.bClone ){

                        if( o.revert ){

                            if( o.revertAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                                jQuery.offset.setOffset( this.$dragBox[0], { top: this.revertBoxTop, left: this.revertBoxLeft, using: function(prop){

                                    This.$dragBox.animate( { left: prop.left, top: prop.top }, { duration: o.duration, complete:function(){

                                        This.$dragBox.remove();

                                        o.onStopDrag.call(This.$target[0], event);

                                        This.hasClone = false;

                                    }});

                                }})

                            }else{

                                this.$dragBox.remove();

                                this.hasClone = false;

                                o.onStopDrag.call( this.$target[0], event );

                            }

                        }else{

                            if( o.dragBoxReturnToTarget ){

                                boxOffset = this.$target.offset();

                                if( o.bCloneAnimate && this._isMove( boxOffset.left, boxOffset.top, this.left, this.top ) ){

                                    jQuery.offset.setOffset( this.$dragBox[0], { top: boxOffset.top, left: boxOffset.left, using: function(prop){

                                        This.$dragBox.animate( { left: prop.left, top: prop.top }, { duration: o.duration, complete:function(){

                                            This.$dragBox.remove();

                                            o.onStopDrag.call(This.$target[0], event);

                                            This.hasClone = false;

                                        }});

                                    }})

                                }else{

                                    this.$dragBox.remove();

                                    this.$target.offset( { left: boxOffset.left, top: boxOffset.top } );

                                    this.hasClone = false;

                                    o.onStopDrag.call( this.$target[0], event );

                                }

                            }else{

                                this.$dragBox.remove();

                                if( o.bCloneAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                                    jQuery.offset.setOffset( this.$target[0], { top: this.top,left: this.left, using: function(prop){

                                        This.$target.animate( { left: prop.left, top: prop.top}, { duration: o.duration, complete:function(){

                                            o.onStopDrag.call(This.$target[0], event);

                                        }});

                                    }})

                                }else{

                                    this.$target.offset( { left: this.left, top: this.top } );

                                    o.onStopDrag.call( this.$target[0], event );

                                }

                                this.hasClone = false;

                            }

                        }

                    }else{

                        if( o.revert ){

                            if( o.revertAnimate && this._isMove( this.revertBoxLeft, this.revertBoxTop, this.left, this.top ) ){

                                jQuery.offset.setOffset( this.$target[0], { top: this.revertBoxTop, left: this.revertBoxLeft, using: function(prop){

                                    This.$target.animate( { left: prop.left, top: prop.top }, { duration: o.duration, complete:function(){

                                        o.onStopDrag.call(This.$target[0], event);

                                    }});

                                }})

                            }else{

                                o.onStopDrag.call( this.$target[0], event );

                            }

                        }else{

                            o.onStopDrag.call( this.$target[0], event );

                        }

                    }

                }

            },

            _isMove:function( oldsLeft, oldTop, left, top ){

                return ( oldsLeft !== left || ( oldTop !== top ) );

            },

            setDragEndStop:function(flag){

                this._dragEndStop = !!flag;

            },

            _destroy:function(){

                this.$body.css( 'cursor', this.oldCur );

            }

        });

        $.leoTools.plugIn({

            name:'leoResizable',

            version:'1.0',

            inherit:'leoMouse',

            addJquery:false,

            addJqueryFn:true,

            defaults:{

                disabled:false,//如果设置为true将禁止缩放。

                bClone:true,//克隆对象

                bCloneAnimate:true, //克隆拖拽是否动画

                duration:400,//动画时间

                containment:false,//使用指定的元素强制性限制大小调整的界限.

                stopMouseWheel: false, //拖拽时候是否关闭滚轮事件

                handles:'all',//n, e, s, w, ne, se, sw, nw, all

                edge:4,//mouse的cursor的变化宽度

                grid:false,//拖拽元素时，只能以指定大小的方格进行拖动。数组形式为[ x, y ]。

                iframeFix:true,//在拖动期间阻止iframe捕捉鼠标移过事件。与cursorAt选项搭配使用时或者当鼠标指针可能不在拖动助手元素之上时，该参数非常有用。

                                // 支持多种类型:

                                // Boolean: 当设置为true, 透明层将被放置于页面上的所有iframe之上。

                                // Selector: 任何由选择器匹配的iframe将被透明层覆盖。

                aspectRatio:false,//等比例缩放,为长与高之比

                minWidth:0,

                minHeight:0,

                maxWidth:'max',

                maxHeight:'max',

                proxy:function(source){//source

                    return $(source).clone().removeAttr('id').css({'opacity': '0.5'}).insertAfter(source);

                },

                initCallback: $.noop, //source

                mouseMoveCurIn:$.noop,

                mouseMoveCurOut:$.noop,

                onStartResize: $.noop, //source,event

                onResize: $.noop, //source,event

                onStopResize: $.noop,//source,event

                onStopAnimateResize:$.noop

            },

            _init:function(){

                this.$body = this.document.find('body');

                this._handleInit();

                this.$target.css('position') === "static" && ( this.$target[0].style.position = "relative" );

                this._dragArea();

                this._getContainment();

                this.bClone = false;

                this.cur = '';

                !! this.options.initCallback && this.options.initCallback.call(this.$target[0]);

                this._boxEventBind();

            },

            _handleInit:function(){

                var This = this;

                if(typeof this.options.handles ==='string'){

                    if( $.trim( this.options.handles ).toUpperCase() === 'ALL'){

                        this.handles = true;

                    }else{

                        this.handles = {};

                        this.options.handles.replace($.leoTools.rword, function(name) {

                            This.handles[name.toUpperCase()] = true;

                        });

                    }

                }else{

                    this.handles = true;

                }

            },

            _dragArea:function(){

                this.opMaxWidth = this.options.maxWidth;

                this.opMaxHeight = this.options.maxHeight;

                this.opMinWidth = $.leoTools.range( this.options.minWidth, 0, this.opMaxWidth )

                this.opMinHeight = $.leoTools.range( this.options.minHeight, 0, this.opMaxHeight );

            },

            _mouseCur:function(event){

                if( this._getCursorChange() === true && this.options.disabled === false ){

                    event.preventDefault();

                    var offset = this.$target.offset(),top = offset.top,left = offset.left,

                    outerW = this.$target.outerWidth(),outerH = this.$target.outerHeight();

                    if( event.pageY <= top + this.options.edge ){

                        this.flag_NS = 'N';

                    }else if( event.pageY >= top+outerH - this.options.edge ){

                        this.flag_NS = 'S';

                    }else{

                        this.flag_NS = '';

                    };

                    if( event.pageX >= left+outerW - this.options.edge ){

                        this.flag_EW = 'E';

                    }else if( event.pageX <= left + this.options.edge ){

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

                            !!this.options.mouseMoveCurOut && this.options.mouseMoveCurOut.call( this.$target, this.cursor );

                        }else{

                            this.cursor = this.cur+'-resize';

                            !!this.options.mouseMoveCurIn && this.options.mouseMoveCurIn.call( this.$target, this.cursor );

                        }

                        this.$target.css('cursor',this.cursor);

                    }

                }

            },

            _blockFrames:function(){

                var iframeFix = this.options.iframeFix,drag = this.$dragBox[0];

                this.iframeBlocks = this.document.find( iframeFix === true ? "iframe" : iframeFix ).map( function() {

                    var iframe = $( this );

                    if( drag === this || $.contains( drag, this ) ){ return null; }

                    return $( "<div>" ).css( { position: "absolute", width: iframe.outerWidth(), height: iframe.outerHeight(), opacity: 0,'backgroundColor':'#fff'} ).insertBefore( this ).offset( iframe.offset() )[0];

                });

            },

            _unblockFrames:function(){

                if ( this.iframeBlocks ) {

                    this.iframeBlocks.remove();

                    delete this.iframeBlocks;

                }

            },

            _boxEventBind:function(){

                var This = this,$box = this.$target,boxCur = this.$target.css('cursor');

                this.boxCur = boxCur;

                this._on($box,'mouseenter',function(event){

                    This._mouseCur(event);

                })

                this._on($box,'mousemove',function(event){

                    This._mouseCur(event);

                });

                this._on($box,'mouseleave',function(event){

                    if( This._getCursorChange() === true && This.options.disabled === false ){

                        event.preventDefault();

                        !!This.options.mouseMoveCurOut && This.options.mouseMoveCurOut.call( This.$target, boxCur );

                        $box.css('cursor',boxCur);

                        This.cur = '';

                    }

                });

                this[this.inherit]._init.call(this);

            },

            _mouseCapture:function(event){

                if( event.which!==1 || !this.cur || this.options.disabled === true ){

                    return false;

                }

                return true;

            },

            _getContainment:function(){

                var oc = this.options.containment,el = this.$target,

                ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( oc === 'parent' ) ? el.parent().get( 0 ) : oc;

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

                containmentDifT,containmentDifL,containmentDifB,containmentDifR;

                difT = dragBoxOffset.top - withinOffset.top;

                difL = dragBoxOffset.left - withinOffset.left;

                containmentDifB = within.height - scrollInfo.height - this.reH - difT - this.borderWidths.bottom;

                containmentDifR = within.width - scrollInfo.width - this.reW - difL - this.borderWidths.right;

                containmentDifT = difT + this.height - this.borderWidths.top;

                containmentDifL = difL + this.width - this.borderWidths.left;

                this.SEMaxWidth = this.opMaxWidth === 'max' ? containmentDifR : $.leoTools.range( this.opMaxWidth, 0, containmentDifR );

                this.SEMinWidth = Math.min( this.SEMaxWidth, this.opMinWidth );

                this.SEMaxHeight = this.opMaxHeight === 'max' ? containmentDifB : $.leoTools.range( this.opMaxHeight, 0, containmentDifB );

                this.SEMinHeight = Math.min( this.SEMaxHeight, this.opMinHeight );

                this.NWMaxWidth = this.opMaxWidth === 'max' ? containmentDifL : containmentDifL > 0 ? $.leoTools.range( this.opMaxWidth, 0, containmentDifL ) : 0;

                this.NWMinWidth = Math.min( this.NWMaxWidth, this.opMinWidth );

                this.NWMaxHeight = this.opMaxHeight === 'max' ? containmentDifT : containmentDifT > 0 ? $.leoTools.range( this.opMaxHeight, 0, containmentDifT ) : 0;

                this.NWMinHeight = Math.min( this.NWMaxHeight, this.opMinHeight );

            },

            _getBorderWidths:function(no) {

                if(no){

                    this.borderWidths = {

                        left:0,

                        top:0,

                        right:0,

                        bottom:0

                    }

                }else{

                    this.borderWidths = {

                        left: $.leoTools.parseCss(  this.$containment[0] ,'borderLeftWidth' ),

                        top: $.leoTools.parseCss(  this.$containment[0] ,'borderTopWidth' ),

                        right: $.leoTools.parseCss(  this.$containment[0] ,'borderRightWidth' ),

                        bottom: $.leoTools.parseCss(  this.$containment[0] ,'borderBottomWidth' )

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

                var offset,o = this.options;

                this.$dragBox = this.$target;

                isFixed = this.$dragBox.position()

                offset = this.$target.offset();

                if ( o.bClone ) {

                    this.$dragBox = o.proxy.call( null, this.$target[0] ).offset({ left: offset.left,top: offset.top});

                    this.bClone = true;

                }

                this.isFixed = this.$dragBox.css('position') === 'fixed';

                !o.stopMouseWheel && ( this.scrollParents = $.leoTools.scrollParents( this.$dragBox ) );

                this._stopOnMouseWheel();

                this.startLeft = this.left = $.leoTools.parseCss( this.$dragBox[0],'left' );

                this.startTop = this.top = $.leoTools.parseCss( this.$dragBox[0],'top' );

                this.startWidth = this.width = this.$target.width();

                this.startHeight = this.height = this.$target.height();

                this._getContainmentInfo();

                this._getContainmentRange();

                this.startX =  this.isFixed ? event.clientX : event.pageX;

                this.startY = !o.stopMouseWheel ? event.clientY + $.leoTools.getScrollParentsTop( this.scrollParents ) : this.isFixed ? event.clientY : event.pageY;

                this.$body.css( 'cursor',this.cursor );

                this._blockFrames();

                !! o.onStartResize && o.onStartResize.call(this.$target[0],event,this.$dragBox,this.startWidth,this.startHeight);

                this._setCursorChange(false);

            },

            _getAspectRatio:function( moveX, moveY ){

                var width,height,cur = this.cur,aspectRatio = this.options.aspectRatio,

                SEMinScaleWH =  this.SEMinWidth / this.SEMinHeight,

                SNMinScaleWH =  this.SEMinWidth / this.NWMinHeight,

                NSMinScaleWH =  this.NWMinWidth / this.SEMinHeight,

                NWMinScaleWH =  this.NWMinWidth / this.NWMinHeight;

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

                var o = this.options;

                if( o.grid ){

                    moveY = o.grid[1] ? Math.round( moveY / o.grid[1] ) * o.grid[1] : moveY;

                    moveX = o.grid[0] ? Math.round( moveX / o.grid[0] ) * o.grid[0] : moveX;

                }

                return { moveX: moveX, moveY: moveY};

            },

            _mouseDrag:function(event) {

                var cur = this.cur,moveX = ( this.isFixed ? event.clientX : event.pageX ) - this.startX,moveY = !this.options.stopMouseWheel ? event.clientY - this.startY + $.leoTools.getScrollParentsTop( this.scrollParents ) : ( this.isFixed ? event.clientY : event.pageY ) - this.startY,grid = this._setGrid( moveX, moveY );

                this._getContainmentRange();

                moveX = grid.moveX;

                moveY = grid.moveY;

                if( !!this.options.aspectRatio ){

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

                this.options.onResize.call( this.$target[0], event, this.$dragBox, this.width, this.height );

                this.$dragBox.css( { height: this.height,width: this.width,top: this.top,left: this.left } );

            },

            _mouseStop:function(event) {

                var dragBoxOffset = this.$dragBox.offset(),o = this.options,This = this;

                this._stopOffMouseWheel();

                if( this.bClone ){

                    jQuery.offset.setOffset( this.$target[0], { top: dragBoxOffset.top,left: dragBoxOffset.left, using: function(prop){

                        if( !o.bCloneAnimate ){

                            This.$target.css( { height: This.height, width: This.width, top: prop.top, left: prop.left } );

                        }else{

                            This.$target.animate( { height: This.height, width: This.width, top: prop.top, left: prop.left}, { duration: o.duration, complete:function(){

                                !! o.onStopAnimateResize && o.onStopAnimateResize.call( This.$target[0], event, This.$dragBox, This.width, This.height );

                            }});

                        }

                    }})

                    this.$dragBox.remove()

                }

                !! o.onStopResize && o.onStopResize.call( this.$target[0], event, this.width, this.height );

                this.$body.css('cursor','');

                this._unblockFrames();

                this.bClone = false;

                this._setCursorChange(true);

            },

            _setOption:function( key,value ){

                if( key === 'handles'){

                    this._handleInit();

                }

                if( key === 'containment'){

                    this._getContainment();

                }

                if( key === 'maxWidth' || key === 'maxHeight' || key === 'minWidth' || key === 'minHeight'){

                    this._dragArea();

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

                }

                fn.setCursorChange = this._setCursorChange = function(flag){

                    _cursorChange = !!flag;

                }

            }

        });

        $.leoTools.plugIn({

            name:'leoDroppable',

            version:'1.0',

            dependsFnName:{

                draggable:'leoDraggable'

            },//依赖函数名

            addJquery:false,

            addJqueryFn:true,

            defaults:{

                accept:'*',//决定哪个可拖动元素将会被接收。

                toleranceType:'intersect',//fit,intersect,pointer,touch

                scope:'all',//用来设置拖动（draggle）元素和放置（droppable）对象的集合

                disabled:false,//当设置为true时停止。

                onDragEnter: $.noop, //e,source,dragBox ,dragBox - offset 当可拖动元素被拖入目标容器的时候触发，参数source是被拖动的DOM元素。

                onDragOver: $.noop,//e,source,dragBox,dragBox - offset  当可拖动元素被拖至某个元素之上的时候触发，参数source是被拖动的DOM元素。

                onDragLeave: $.noop,//e,source,dragBox,dragBox - offset  当可拖动元素被拖离目标容器的时候触发，参数source是被拖动的DOM元素。

                onDrop: null//e,source,dragBox,dragBox - offset   当可拖动元素被拖入目标容器并放置的时候触发，参数source是被拖动的DOM元素。

            },

            _init:function(){

                var entered = false,This = this;

                this.scope = this.options.scope;

                this._setElements( this.scope );

                this.options.accept === '*' ? this.accepts = '*' : this.accepts = $( this.options.accept );

                this._trigger( 'leoDroppableStar', function( event, draggable ){

                    if( This.options.disabled ){

                        return;

                    }

                    This.source = draggable.box[0];

                    if( This.accepted = This._accept() ){

                        var dragBox = draggable.dragBox[0],

                        intersected = dragBox !== this && intersect( boxSize( draggable.dragBox, draggable.dragBoxLeft, draggable.dragBoxTop, draggable.pageX, draggable.pageY ),boxSize( $(this) ), This.options.toleranceType );

                        if( intersected && !entered ){

                            entered = true;

                        }else if( !intersected && !!entered ){

                            entered = false;

                        }else if(intersected){

                            This.options.onDragOver.call( this, event, This.source, dragBox, {

                                left : draggable.dragBoxLeft,

                                top : draggable.dragBoxTop

                            })

                        }

                    }

                })

                this._trigger('leoDroppableOver',function( event, draggable ){

                    This.source !== draggable.box[0] && This._reAccepted( draggable.box[0] );

                    if( This.accepted && This.options.disabled !== true ){

                        var dragBox = draggable.dragBox[0],

                        intersected = dragBox !== this && intersect( boxSize( draggable.dragBox, draggable.dragBoxLeft, draggable.dragBoxTop, draggable.pageX, draggable.pageY), boxSize( $(this) ), This.options.toleranceType);

                        if( intersected && !entered ){

                            This.options.onDragEnter.call( this,event, This.source, dragBox, {

                                left : draggable.dragBoxLeft,

                                top : draggable.dragBoxTop

                            })

                            entered = true;

                        }else if( !intersected && !!entered ){

                            This.options.onDragLeave.call( this, event, This.source, dragBox, {

                                left : draggable.dragBoxLeft,

                                top : draggable.dragBoxTop

                            })

                            entered = false;

                        }else if(intersected){

                            This.options.onDragOver.call( this, event, This.source, dragBox, {

                                left : draggable.dragBoxLeft,

                                top : draggable.dragBoxTop

                            })

                        }

                    }

                })

                this._trigger('leoDroppableEnd',function( event, draggable ){

                    This.source !== draggable.box[0] && This._reAccepted( draggable.box[0] );

                    if( This.options.onDrop !== null && This.accepted && This.options.disabled !== true ){

                        if( draggable.dragBox[0] !== this && intersect( boxSize( draggable.dragBox, draggable.dragBoxLeft, draggable.dragBoxTop, draggable.pageX, draggable.pageY ),boxSize( $(this) ), This.options.toleranceType )){

                            draggable.box[This.dependsFnName.draggable]( 'setDragEndStop', This.options.onDrop.call( this,event, draggable.box[0], draggable.dragBox[0], {

                                left : draggable.dragBoxLeft,

                                top : draggable.dragBoxTop

                            }) === false );

                            entered = false;

                        }

                    }

                });

                function boxSize( $box, left, top, pageX, pageY ){

                    var outerW,outerH,top,left,offset;

                    if( !!left && !!top && !!pageX && !!pageY ){

                        outerW = $box.outerWidth();

                        outerH = $box.outerHeight();

                        return{

                            width : outerW,

                            height : outerH,

                            top : top,

                            left : left,

                            bottom : top + outerH,

                            right : left + outerW,

                            pageX :pageX,

                            pageY : pageY

                        }

                    }else{

                        offset = $box.offset();

                        top = offset.top;

                        left = offset.left;

                        outerW = $box.outerWidth();

                        outerH = $box.outerHeight();

                        return{

                            width : outerW,

                            height : outerH,

                            top : top,

                            left : left,

                            bottom : top + outerH,

                            right : left + outerW

                        }

                    }

                }

                function intersect( draggable, droppable, toleranceMode ) {

                    var pageX = draggable.pageX,pageY = draggable.pageY,

                    x1 = draggable.left,y1 =draggable.top,

                    x2 = draggable.right,y2 = draggable.bottom,

                    l = droppable.left,t = droppable.top,

                    r = droppable.right,b = droppable.bottom;

                    switch (toleranceMode) {

                        case "fit":

                            return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);

                        case "intersect":

                            return (l <= x1 + (draggable.width / 2) &&
                                x2 - (draggable.width / 2) <= r &&
                                t <= y1 + (draggable.height / 2) &&
                                y2 - (draggable.height / 2) <= b );

                        case "pointer":

                            return  (l <= pageX && pageX <= r && t <= pageY && pageY <= b);

                        case "touch":

                            return (
                                (y1 >= t && y1 <= b) ||
                                (y2 >= t && y2 <= b) ||
                                (y1 < t && y2 > b)
                            ) && (
                                (x1 >= l && x1 <= r) ||
                                (x2 >= l && x2 <= r) ||
                                (x1 < l && x2 > r)
                            );

                        default:

                            return false;

                        }

                };

            },

            _reAccepted:function(source){

                !!source && ( this.source = source );

                this.accepted = this._accept();

            },

            _accept:function(){

                return this.accepts === '*' ? true : $( this.source ).is( this.accepts );

            },

            _setOption:function( key, value ){

                if( key === 'scope') {

                    this._deletElements( this.scope );

                    this._setElements(value);

                    this.scope = value;

                }

                if( key === 'accept') {

                    value === '*' ? this.accepts = '*' : this.accepts = $( value );

                    this._reAccepted();

                }

            },

            _destroy:function(){

                this._deletElements( this.scope );

            }

        },{

            _initElements:function(fn){

                var _elements = {};

                fn.getElements = this._getElements = function(scope){

                    return _elements[scope] || [];

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

    })(jQuery);

    /**
     +-------------------------------------------------------------------
     * jQuery leoUi--leoDialog
     +-------------------------------------------------------------------
     * @version    1.0.0 beta
     * @author     leo
     +-------------------------------------------------------------------
     */
    ;(function($) {

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

                appendTo: 'body',

                modalShowDelay: 0,

                modalHideDelay: 0,

                showDelay:0,

                hideDelay:0,

                width:400,

                height:'auto',

                zIndex:1000,

                scope:'all',//用来设置leoDialog对象的集合

                getScope:'all',//用来取得leoDialog对象的集合

                okHandle:'.send_submit',

                cancelHandle:'.send_off',

                restore:false,//是否每次都回到初始值

                okCallback:$.noop,

                cancelCallback:$.noop,

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

                    bClone:false,

                    handle:'.leoDialog_titlebar',

                    containment:'document',

                    iframeFix:false,

                    stopMouseWheel:false

                },

                fixIframeMask:false,

                initResizable:true,

                resizableOption:{

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

                makeModel:function(){

                    return $('<div class="a" style = "position: fixed;top: 0px; left: 0px;width:100%;height:100%;background-color:black;overflow:hidden;"></div>').hide().appendTo('body')

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

                initCallback: $.noop,

                beforeShow:$.noop,

                dialogShowCallback: function(){

                    // this.dialogHide();

                },

                dialogHideCallback: function(){

                    // this.modalHide();

                },

                modalDialogHideCallback:function(){

                    // console.log(this)

                }

            },

            _init:function(){

                this._initSize();

                this._setZindex();

                this._createCaptionButtons();

                this._createOkButton();

                this._createCancelButton();

                this._setButton();

                this._dialogEventBind();

                this._setInnerFrame();

                this.originalSize = {

                    width:this.options.width,

                    height:this.options.height,

                    position:$.extend( {}, this.options.position )

                }

                this._dialogState = 'close';

                this.$modal = false;

                this.firstTime = true;

                this.isMaximize = false;

                this.isMaximize = false;

                this.scope = this.options.scope;

                this.hasResizable = false;

                this.draggableDisabled = false;

                this.hasDraggable = false;

                this._makeDraggable(true);

                this._makeResizable(true);

                this._setElements( this.scope );

                this.options.initCallback.call( this.$target );

            },

            _setZindex:function(){

                this.$target.css( 'z-index', this.options.zIndex );

            },

            _getHandle:function(event, handle) {

                return $( event.target ).closest( this.$target.find(handle) )[0];

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

                        This.options.okCallback.call( this, event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

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

                        This.options.cancelCallback.call( this, event, This._bottunDisable( $(this) ) ,This._bottunEnable( $(this) ) );

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

                            if( This._dialogState === 'open' ){

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

                if( !this.innerFrame ){return;}

                if ( flag === true ) {

                    !this.mask && ( this.mask = $('<div style = " width: 100%; height: 100%; position: absolute;top: 0; left: 0; z-index: 1 " ></div>') );

                    this.mask.show().prependTo( this.$content );

                }else if( flag === false ){

                    !!this.mask && this.mask.detach();

                }

            },

            _setInnerFrame:function(){

                if( this.options.fixIframeMask ){

                    this.innerFrame = this.$content.find('iframe')[0];

                }else{

                    this.innerFrame = false;

                }

            },

            _destoryIframeMask: function() {

                if ( this.innerFrame && this.mask ) {

                    this.mask.remove();

                    this.mask = null;

                }

            },

            _leoDialogRefresh:function(){

                if ( this.innerFrame ) {

                    var fr = $( this.innerFrame );

                    fr.attr( "src", fr.attr("src") );

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

                if( this.innerFrame ){

                    this.$target.hide();

                    this.$minimizeBar.css( 'zIndex', this.options.zIndex ).append( this.$uiDialogTitlebar.clone( true ) ).appendTo('body');

                }else{

                    this.$content.hide();

                    this.$target.css( { width: 'auto', height: 'auto', position: 'static', float: 'left'} ).wrap( this.$minimizeBar.css( 'zIndex', this.options.zIndex ) );

                }

            },

            _unWrapMinimize:function(){

                this.$target.find('.leoDialog_titlebar_button_float').css( 'float', '' ).end().find('.leoDialog_titlebar_button_hide').show();

                if( this.innerFrame ){

                    this.$target.show();

                    this.$minimizeBar.empty().detach();

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

                    this.oldSize.height = 'auto';

                    this.$content.hide();

                }

                this._setSizes( this.oldSize );

                this.$target.offset( this.oldSize.offset );

                $( this.buttons.restore.element ).detach();

            },

            _bottunDisable:function($box){

                var This = this;

                return function(){

                    This._disable($box);

                }

            },

            _bottunEnable:function($box){

                var This = this;

                return function(){

                    This._enable($box);

                }

            },

            _setContent:function(){

                this.$content = this.$target.find( '.leoDialog_content' ).append( this.options.contentHtml );

                this._appentTo();

            },

            _appentTo:function(){

                this.$target.appendTo(  this.options.appendTo );

            },

            _initSize:function(){

                var width = this.options.width,height = this.options.height;

                this._setContent();

                this._appentTo();

                this.$target.show().css({ visibility: 'visible', height: 'auto', width: width });

                this.reHeight = this.$target.height() - this.$content.height();

                this.reWidth = this.$target.width() - this.$content.width();

                this.$target.css({ height: height, width: width });

                this.$content.width( width === 'auto' ? 'auto' : width - this.reWidth ).height( height === 'auto' ? 'auto' : height - this.reHeight );

                this.$target.hide();

            },

            _setSizes:function(option){

                var key;

                for ( key in option ) {

                    if( option.hasOwnProperty( key ) ){

                        this._setSize( key, option[key] );

                    }

                }

            },

            _setSize:function( key, value, firstFlag ){

                var isVisible = this.$target.is( ":visible" ),This = this;

                !isVisible && this.$target.show();

                if( key === 'width' ){

                   this.$target.width(value);

                   this.$content.width( value === 'auto' ? 'auto' : value - this.reWidth );

                }

                if( key === 'height' ){

                   this.$target.height(value);

                   this.$content.height( value === 'auto' ? 'auto' : value - this.reHeight );

                }

                if( key === 'position' ){

                    this.$target.position(value);

                }

                if( key === 'offset' ){

                    this.$target.offset(value);

                }

                if( key === 'top' ){

                    this.$target.css( 'top' , value );

                }

                if( key === 'cssPosition' ){

                    this.$target.css( 'position' , value );

                }

                if( key === 'left' ){

                    this.$target.css( 'left' , value );

                }

                firstFlag !== undefined && ( this.firstTime = firstFlag );

                !isVisible && this.$target.hide();

            },

            _setButton:function(){

                this.$target.find( this.options.cancelHandle + ',' + this.options.okHandle ).attr( 'role','button' );

            },

            _restore:function(){

                !this.firstTime && this.options.restore && this._setSizes( this.originalSize );

            },

            dialogShow:function(){

                if( this._dialogState === 'close' && !this.$modal ){

                    this._createOverlay();

                    this._setDraggableDisabled(true);

                    this._setResizableDisabled(true);

                    this.firstTime === true && this._setSize( 'position', this.options.position, false );

                    this._restore();

                    this._moveToTop();

                    this.options.beforeShow.call( this.$target );

                    !this.$modal ? this._dialogShow() : this.options.makeModelDialogShow.call( this, this._modalShowFn(), this._dialogShowFn() );

                }

            },

            _dialogShowCallback:function(){

                this._setDraggableDisabled(false);

                this._setResizableDisabled(false);

                this.options.dialogShowCallback.call(this);

            },

            _makeDraggable:function(init){

                if( !$.fn[this.dependsFnName.draggable] ){

                    return;

                }

                if ( this.options.initDraggable ) {

                    if( init === true && this.hasDraggable === false ){

                        var This = this;

                        this.draggableDefault = {

                            cancel:'[ role = "button" ]',

                            onStartDrag:function(){

                                This._handleIframeMask(true);

                                This.hasResizable && This.$target[This.dependsFnName.resizable].setCursorChange(false);

                            },

                            onBeforeStopDrag:function(){

                                This._handleIframeMask(false);

                                This.hasResizable && This.$target[This.dependsFnName.resizable].setCursorChange(true);

                            }

                        }

                        this.$target[this.dependsFnName.draggable]( $.extend( this.options.draggableOption, this.draggableDefault ) );

                        this.hasDraggable = true;

                    }

                    this.$target[this.dependsFnName.draggable]( 'option', $.extend( this.options.draggableOption, this.draggableDefault ) );

                }else if( !this.options.initDraggable && init === false && this.hasDraggable === true ){

                        this.$target[this.dependsFnName.draggable]('destroy');

                        this.hasDraggable = false;

                }

            },

            _setDraggableDisabled:function(flag){

                this.hasDraggable && !this.draggableDisabled && !this.isMinimize && !this.isMaximize && this.$target[this.dependsFnName.draggable]( 'option','disabled', flag );

            },

            _makeResizable:function(init){

                if( !$.fn[this.dependsFnName.resizable] ){

                    return;

                }

                if ( this.options.initResizable ) {

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

                            },

                            onStopResize:function(){

                                This._handleIframeMask(false);

                            },

                            mouseMoveCurIn:function(cur){

                                if( !This.hasDraggable ){ return; }

                                if( !( cur === 'S-resize' || cur === 'SW-resize' || cur === 'SE-resize' ) ){

                                    this.addClass('leoDialog_inherit');

                                }

                                this[This.dependsFnName.draggable]( 'setLockDrag', true );

                            },

                            mouseMoveCurOut:function(cur){

                                if( !This.hasDraggable ){ return; }

                                this.removeClass('leoDialog_inherit')[This.dependsFnName.draggable]( 'setLockDrag', false );

                            }

                        }

                        this.$target[this.dependsFnName.resizable]( $.extend( this.options.resizableOption, this.resizableDefault ) );

                        this.hasResizable = true;

                    }

                    this.$target[this.dependsFnName.resizable]( 'option', $.extend( this.options.resizableOption, this.resizableDefault ) );

                }else if( !this.options.initResizable && init === false && this.hasResizable === true ){

                        this.$target[this.dependsFnName.resizable]('destroy');

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

                if( key === 'fixIframeMask' ){

                    this._setInnerFrame();

                    return;

                }

                if( key === 'okHandle' ){

                    if( value === false ){

                        this._destroyOkButton();

                    }else{

                        this._createOkButton();

                    }

                    return;

                }

                if( key === 'cancelHandle' ){

                    if( value === false ){

                        this._destroyCancelButton();

                    }else{

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

                    this.$modal = this.options.makeModel();

                    this.modalState = 'close';

                    !!this.options.quickClose && this._on( this.$modal, 'click', function(){

                        This.modalState === 'open' && This._dialogState === 'open' && This.modalDialogHide();

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

                this.options.dialogHideCallback.call(this);

            },

            _moveToTop:function() {

                var arr = this._getElements( this.options.getScope ),arrLength = arr.length,

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

                    !!this.innerFrame && !!this.isMinimize && ( $target = this.$minimizeBar );

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

                    this.options.modalDialogHideCallback.call(this);

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

                    !!this.innerFrame && !!this.isMinimize && ( $target = this.$minimizeBar );

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

                this._getElements = function(scope){

                    return _elements[scope] || [];

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

    })(jQuery);

    return $;

}));