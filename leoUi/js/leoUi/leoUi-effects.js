/*!
 * jQuery UI Effects @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * leoUi:jQuery UI Effects Explode特效添加zIndex;
 *
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

	var dataSpace = "ui-effects-",
		dataSpaceStyle = "ui-effects-style",
		dataSpaceAnimated = "ui-effects-animated",

		// Create a local jQuery because jQuery Color relies on it and the
		// global may not exist with AMD and a custom build (#10199)
		jQuery = $;

	$.effects = {
		effect: {}
	};

	/*!
	 * jQuery Color Animations v2.1.2
	 * https://github.com/jquery/jquery-color
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * Date: Wed Jan 16 08:47:09 2013 -0600
	 */
	(function(jQuery, undefined) {

		var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",

			// plusequals test for += 100 -= 100
			rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
			// a set of RE's that can match strings and generate color tuples.
			stringParsers = [{
				re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
				parse: function(execResult) {
					return [
						execResult[1],
						execResult[2],
						execResult[3],
						execResult[4]
					];
				}
			}, {
				re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
				parse: function(execResult) {
					return [
						execResult[1] * 2.55,
						execResult[2] * 2.55,
						execResult[3] * 2.55,
						execResult[4]
					];
				}
			}, {
				// this regex ignores A-F because it's compared against an already lowercased string
				re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
				parse: function(execResult) {
					return [
						parseInt(execResult[1], 16),
						parseInt(execResult[2], 16),
						parseInt(execResult[3], 16)
					];
				}
			}, {
				// this regex ignores A-F because it's compared against an already lowercased string
				re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
				parse: function(execResult) {
					return [
						parseInt(execResult[1] + execResult[1], 16),
						parseInt(execResult[2] + execResult[2], 16),
						parseInt(execResult[3] + execResult[3], 16)
					];
				}
			}, {
				re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
				space: "hsla",
				parse: function(execResult) {
					return [
						execResult[1],
						execResult[2] / 100,
						execResult[3] / 100,
						execResult[4]
					];
				}
			}],

			// jQuery.Color( )
			color = jQuery.Color = function(color, green, blue, alpha) {
				return new jQuery.Color.fn.parse(color, green, blue, alpha);
			},
			spaces = {
				rgba: {
					props: {
						red: {
							idx: 0,
							type: "byte"
						},
						green: {
							idx: 1,
							type: "byte"
						},
						blue: {
							idx: 2,
							type: "byte"
						}
					}
				},

				hsla: {
					props: {
						hue: {
							idx: 0,
							type: "degrees"
						},
						saturation: {
							idx: 1,
							type: "percent"
						},
						lightness: {
							idx: 2,
							type: "percent"
						}
					}
				}
			},
			propTypes = {
				"byte": {
					floor: true,
					max: 255
				},
				"percent": {
					max: 1
				},
				"degrees": {
					mod: 360,
					floor: true
				}
			},
			support = color.support = {},

			// element for support tests
			supportElem = jQuery("<p>")[0],

			// colors = jQuery.Color.names
			colors,

			// local aliases of functions called often
			each = jQuery.each;

		// determine rgba support immediately
		supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
		support.rgba = supportElem.style.backgroundColor.indexOf("rgba") > -1;

		// define cache name and alpha properties
		// for rgba and hsla spaces
		each(spaces, function(spaceName, space) {
			space.cache = "_" + spaceName;
			space.props.alpha = {
				idx: 3,
				type: "percent",
				def: 1
			};
		});

		function clamp(value, prop, allowEmpty) {
			var type = propTypes[prop.type] || {};

			if (value == null) {
				return (allowEmpty || !prop.def) ? null : prop.def;
			}

			// ~~ is an short way of doing floor for positive numbers
			value = type.floor ? ~~value : parseFloat(value);

			// IE will pass in empty strings as value for alpha,
			// which will hit this case
			if (isNaN(value)) {
				return prop.def;
			}

			if (type.mod) {
				// we add mod before modding to make sure that negatives values
				// get converted properly: -10 -> 350
				return (value + type.mod) % type.mod;
			}

			// for now all property types without mod have min and max
			return 0 > value ? 0 : type.max < value ? type.max : value;
		}

		function stringParse(string) {
			var inst = color(),
				rgba = inst._rgba = [];

			string = string.toLowerCase();

			each(stringParsers, function(i, parser) {
				var parsed,
					match = parser.re.exec(string),
					values = match && parser.parse(match),
					spaceName = parser.space || "rgba";

				if (values) {
					parsed = inst[spaceName](values);

					// if this was an rgba parse the assignment might happen twice
					// oh well....
					inst[spaces[spaceName].cache] = parsed[spaces[spaceName].cache];
					rgba = inst._rgba = parsed._rgba;

					// exit each( stringParsers ) here because we matched
					return false;
				}
			});

			// Found a stringParser that handled it
			if (rgba.length) {

				// if this came from a parsed string, force "transparent" when alpha is 0
				// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
				if (rgba.join() === "0,0,0,0") {
					jQuery.extend(rgba, colors.transparent);
				}
				return inst;
			}

			// named colors
			return colors[string];
		}

		color.fn = jQuery.extend(color.prototype, {
			parse: function(red, green, blue, alpha) {
				if (red === undefined) {
					this._rgba = [null, null, null, null];
					return this;
				}
				if (red.jquery || red.nodeType) {
					red = jQuery(red).css(green);
					green = undefined;
				}

				var inst = this,
					type = jQuery.type(red),
					rgba = this._rgba = [];

				// more than 1 argument specified - assume ( red, green, blue, alpha )
				if (green !== undefined) {
					red = [red, green, blue, alpha];
					type = "array";
				}

				if (type === "string") {
					return this.parse(stringParse(red) || colors._default);
				}

				if (type === "array") {
					each(spaces.rgba.props, function(key, prop) {
						rgba[prop.idx] = clamp(red[prop.idx], prop);
					});
					return this;
				}

				if (type === "object") {
					if (red instanceof color) {
						each(spaces, function(spaceName, space) {
							if (red[space.cache]) {
								inst[space.cache] = red[space.cache].slice();
							}
						});
					} else {
						each(spaces, function(spaceName, space) {
							var cache = space.cache;
							each(space.props, function(key, prop) {

								// if the cache doesn't exist, and we know how to convert
								if (!inst[cache] && space.to) {

									// if the value was null, we don't need to copy it
									// if the key was alpha, we don't need to copy it either
									if (key === "alpha" || red[key] == null) {
										return;
									}
									inst[cache] = space.to(inst._rgba);
								}

								// this is the only case where we allow nulls for ALL properties.
								// call clamp with alwaysAllowEmpty
								inst[cache][prop.idx] = clamp(red[key], prop, true);
							});

							// everything defined but alpha?
							if (inst[cache] && jQuery.inArray(null, inst[cache].slice(0, 3)) < 0) {
								// use the default of 1
								inst[cache][3] = 1;
								if (space.from) {
									inst._rgba = space.from(inst[cache]);
								}
							}
						});
					}
					return this;
				}
			},
			is: function(compare) {
				var is = color(compare),
					same = true,
					inst = this;

				each(spaces, function(_, space) {
					var localCache,
						isCache = is[space.cache];
					if (isCache) {
						localCache = inst[space.cache] || space.to && space.to(inst._rgba) || [];
						each(space.props, function(_, prop) {
							if (isCache[prop.idx] != null) {
								same = (isCache[prop.idx] === localCache[prop.idx]);
								return same;
							}
						});
					}
					return same;
				});
				return same;
			},
			_space: function() {
				var used = [],
					inst = this;
				each(spaces, function(spaceName, space) {
					if (inst[space.cache]) {
						used.push(spaceName);
					}
				});
				return used.pop();
			},
			transition: function(other, distance) {
				var end = color(other),
					spaceName = end._space(),
					space = spaces[spaceName],
					startColor = this.alpha() === 0 ? color("transparent") : this,
					start = startColor[space.cache] || space.to(startColor._rgba),
					result = start.slice();

				end = end[space.cache];
				each(space.props, function(key, prop) {
					var index = prop.idx,
						startValue = start[index],
						endValue = end[index],
						type = propTypes[prop.type] || {};

					// if null, don't override start value
					if (endValue === null) {
						return;
					}
					// if null - use end
					if (startValue === null) {
						result[index] = endValue;
					} else {
						if (type.mod) {
							if (endValue - startValue > type.mod / 2) {
								startValue += type.mod;
							} else if (startValue - endValue > type.mod / 2) {
								startValue -= type.mod;
							}
						}
						result[index] = clamp((endValue - startValue) * distance + startValue, prop);
					}
				});
				return this[spaceName](result);
			},
			blend: function(opaque) {
				// if we are already opaque - return ourself
				if (this._rgba[3] === 1) {
					return this;
				}

				var rgb = this._rgba.slice(),
					a = rgb.pop(),
					blend = color(opaque)._rgba;

				return color(jQuery.map(rgb, function(v, i) {
					return (1 - a) * blend[i] + a * v;
				}));
			},
			toRgbaString: function() {
				var prefix = "rgba(",
					rgba = jQuery.map(this._rgba, function(v, i) {
						return v == null ? (i > 2 ? 1 : 0) : v;
					});

				if (rgba[3] === 1) {
					rgba.pop();
					prefix = "rgb(";
				}

				return prefix + rgba.join() + ")";
			},
			toHslaString: function() {
				var prefix = "hsla(",
					hsla = jQuery.map(this.hsla(), function(v, i) {
						if (v == null) {
							v = i > 2 ? 1 : 0;
						}

						// catch 1 and 2
						if (i && i < 3) {
							v = Math.round(v * 100) + "%";
						}
						return v;
					});

				if (hsla[3] === 1) {
					hsla.pop();
					prefix = "hsl(";
				}
				return prefix + hsla.join() + ")";
			},
			toHexString: function(includeAlpha) {
				var rgba = this._rgba.slice(),
					alpha = rgba.pop();

				if (includeAlpha) {
					rgba.push(~~(alpha * 255));
				}

				return "#" + jQuery.map(rgba, function(v) {

					// default to 0 when nulls exist
					v = (v || 0).toString(16);
					return v.length === 1 ? "0" + v : v;
				}).join("");
			},
			toString: function() {
				return this._rgba[3] === 0 ? "transparent" : this.toRgbaString();
			}
		});
		color.fn.parse.prototype = color.fn;

		// hsla conversions adapted from:
		// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021

		function hue2rgb(p, q, h) {
			h = (h + 1) % 1;
			if (h * 6 < 1) {
				return p + (q - p) * h * 6;
			}
			if (h * 2 < 1) {
				return q;
			}
			if (h * 3 < 2) {
				return p + (q - p) * ((2 / 3) - h) * 6;
			}
			return p;
		}

		spaces.hsla.to = function(rgba) {
			if (rgba[0] == null || rgba[1] == null || rgba[2] == null) {
				return [null, null, null, rgba[3]];
			}
			var r = rgba[0] / 255,
				g = rgba[1] / 255,
				b = rgba[2] / 255,
				a = rgba[3],
				max = Math.max(r, g, b),
				min = Math.min(r, g, b),
				diff = max - min,
				add = max + min,
				l = add * 0.5,
				h, s;

			if (min === max) {
				h = 0;
			} else if (r === max) {
				h = (60 * (g - b) / diff) + 360;
			} else if (g === max) {
				h = (60 * (b - r) / diff) + 120;
			} else {
				h = (60 * (r - g) / diff) + 240;
			}

			// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
			// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
			if (diff === 0) {
				s = 0;
			} else if (l <= 0.5) {
				s = diff / add;
			} else {
				s = diff / (2 - add);
			}
			return [Math.round(h) % 360, s, l, a == null ? 1 : a];
		};

		spaces.hsla.from = function(hsla) {
			if (hsla[0] == null || hsla[1] == null || hsla[2] == null) {
				return [null, null, null, hsla[3]];
			}
			var h = hsla[0] / 360,
				s = hsla[1],
				l = hsla[2],
				a = hsla[3],
				q = l <= 0.5 ? l * (1 + s) : l + s - l * s,
				p = 2 * l - q;

			return [
				Math.round(hue2rgb(p, q, h + (1 / 3)) * 255),
				Math.round(hue2rgb(p, q, h) * 255),
				Math.round(hue2rgb(p, q, h - (1 / 3)) * 255),
				a
			];
		};

		each(spaces, function(spaceName, space) {
			var props = space.props,
				cache = space.cache,
				to = space.to,
				from = space.from;

			// makes rgba() and hsla()
			color.fn[spaceName] = function(value) {

				// generate a cache for this space if it doesn't exist
				if (to && !this[cache]) {
					this[cache] = to(this._rgba);
				}
				if (value === undefined) {
					return this[cache].slice();
				}

				var ret,
					type = jQuery.type(value),
					arr = (type === "array" || type === "object") ? value : arguments,
					local = this[cache].slice();

				each(props, function(key, prop) {
					var val = arr[type === "object" ? key : prop.idx];
					if (val == null) {
						val = local[prop.idx];
					}
					local[prop.idx] = clamp(val, prop);
				});

				if (from) {
					ret = color(from(local));
					ret[cache] = local;
					return ret;
				} else {
					return color(local);
				}
			};

			// makes red() green() blue() alpha() hue() saturation() lightness()
			each(props, function(key, prop) {
				// alpha is included in more than one space
				if (color.fn[key]) {
					return;
				}
				color.fn[key] = function(value) {
					var vtype = jQuery.type(value),
						fn = (key === "alpha" ? (this._hsla ? "hsla" : "rgba") : spaceName),
						local = this[fn](),
						cur = local[prop.idx],
						match;

					if (vtype === "undefined") {
						return cur;
					}

					if (vtype === "function") {
						value = value.call(this, cur);
						vtype = jQuery.type(value);
					}
					if (value == null && prop.empty) {
						return this;
					}
					if (vtype === "string") {
						match = rplusequals.exec(value);
						if (match) {
							value = cur + parseFloat(match[2]) * (match[1] === "+" ? 1 : -1);
						}
					}
					local[prop.idx] = value;
					return this[fn](local);
				};
			});
		});

		// add cssHook and .fx.step function for each named hook.
		// accept a space separated string of properties
		color.hook = function(hook) {
			var hooks = hook.split(" ");
			each(hooks, function(i, hook) {
				jQuery.cssHooks[hook] = {
					set: function(elem, value) {
						var parsed, curElem,
							backgroundColor = "";

						if (value !== "transparent" && (jQuery.type(value) !== "string" || (parsed = stringParse(value)))) {
							value = color(parsed || value);
							if (!support.rgba && value._rgba[3] !== 1) {
								curElem = hook === "backgroundColor" ? elem.parentNode : elem;
								while (
									(backgroundColor === "" || backgroundColor === "transparent") &&
									curElem && curElem.style
								) {
									try {
										backgroundColor = jQuery.css(curElem, "backgroundColor");
										curElem = curElem.parentNode;
									} catch (e) {}
								}

								value = value.blend(backgroundColor && backgroundColor !== "transparent" ?
									backgroundColor :
									"_default");
							}

							value = value.toRgbaString();
						}
						try {
							elem.style[hook] = value;
						} catch (e) {
							// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
						}
					}
				};
				jQuery.fx.step[hook] = function(fx) {
					if (!fx.colorInit) {
						fx.start = color(fx.elem, hook);
						fx.end = color(fx.end);
						fx.colorInit = true;
					}
					jQuery.cssHooks[hook].set(fx.elem, fx.start.transition(fx.end, fx.pos));
				};
			});

		};

		color.hook(stepHooks);

		jQuery.cssHooks.borderColor = {
			expand: function(value) {
				var expanded = {};

				each(["Top", "Right", "Bottom", "Left"], function(i, part) {
					expanded["border" + part + "Color"] = value;
				});
				return expanded;
			}
		};

		// Basic color names only.
		// Usage of any of the other color names requires adding yourself or including
		// jquery.color.svg-names.js.
		colors = jQuery.Color.names = {
			// 4.1. Basic color keywords
			aqua: "#00ffff",
			black: "#000000",
			blue: "#0000ff",
			fuchsia: "#ff00ff",
			gray: "#808080",
			green: "#008000",
			lime: "#00ff00",
			maroon: "#800000",
			navy: "#000080",
			olive: "#808000",
			purple: "#800080",
			red: "#ff0000",
			silver: "#c0c0c0",
			teal: "#008080",
			white: "#ffffff",
			yellow: "#ffff00",

			// 4.2.3. "transparent" color keyword
			transparent: [null, null, null, 0],

			_default: "#ffffff"
		};

	})(jQuery);

	/******************************************************************************/
	/****************************** CLASS ANIMATIONS ******************************/
	/******************************************************************************/
	(function() {

		var classAnimationActions = ["add", "remove", "toggle"],
			shorthandStyles = {
				border: 1,
				borderBottom: 1,
				borderColor: 1,
				borderLeft: 1,
				borderRight: 1,
				borderTop: 1,
				borderWidth: 1,
				margin: 1,
				padding: 1
			};

		$.each(["borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle"], function(_, prop) {
			$.fx.step[prop] = function(fx) {
				if (fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr) {
					jQuery.style(fx.elem, prop, fx.end);
					fx.setAttr = true;
				}
			};
		});

		function getElementStyles(elem) {
			var key, len,
				style = elem.ownerDocument.defaultView ?
				elem.ownerDocument.defaultView.getComputedStyle(elem, null) :
				elem.currentStyle,
				styles = {};

			if (style && style.length && style[0] && style[style[0]]) {
				len = style.length;
				while (len--) {
					key = style[len];
					if (typeof style[key] === "string") {
						styles[$.camelCase(key)] = style[key];
					}
				}
				// support: Opera, IE <9
			} else {
				for (key in style) {
					if (typeof style[key] === "string") {
						styles[key] = style[key];
					}
				}
			}

			return styles;
		}

		function styleDifference(oldStyle, newStyle) {
			var diff = {},
				name, value;

			for (name in newStyle) {
				value = newStyle[name];
				if (oldStyle[name] !== value) {
					if (!shorthandStyles[name]) {
						if ($.fx.step[name] || !isNaN(parseFloat(value))) {
							diff[name] = value;
						}
					}
				}
			}

			return diff;
		}

		// support: jQuery <1.8
		if (!$.fn.addBack) {
			$.fn.addBack = function(selector) {
				return this.add(selector == null ?
					this.prevObject : this.prevObject.filter(selector)
				);
			};
		}

		$.effects.animateClass = function(value, duration, easing, callback) {
			var o = $.speed(duration, easing, callback);

			return this.queue(function() {
				var animated = $(this),
					baseClass = animated.attr("class") || "",
					applyClassChange,
					allAnimations = o.children ? animated.find("*").addBack() : animated;

				// map the animated objects to store the original styles.
				allAnimations = allAnimations.map(function() {
					var el = $(this);
					return {
						el: el,
						start: getElementStyles(this)
					};
				});

				// apply class change
				applyClassChange = function() {
					$.each(classAnimationActions, function(i, action) {
						if (value[action]) {
							animated[action + "Class"](value[action]);
						}
					});
				};
				applyClassChange();

				// map all animated objects again - calculate new styles and diff
				allAnimations = allAnimations.map(function() {
					this.end = getElementStyles(this.el[0]);
					this.diff = styleDifference(this.start, this.end);
					return this;
				});

				// apply original class
				animated.attr("class", baseClass);

				// map all animated objects again - this time collecting a promise
				allAnimations = allAnimations.map(function() {
					var styleInfo = this,
						dfd = $.Deferred(),
						opts = $.extend({}, o, {
							queue: false,
							complete: function() {
								dfd.resolve(styleInfo);
							}
						});

					this.el.animate(this.diff, opts);
					return dfd.promise();
				});

				// once all animations have completed:
				$.when.apply($, allAnimations.get()).done(function() {

					// set the final class
					applyClassChange();

					// for each animated element,
					// clear all css properties that were animated
					$.each(arguments, function() {
						var el = this.el;
						$.each(this.diff, function(key) {
							el.css(key, "");
						});
					});

					// this is guarnteed to be there if you use jQuery.speed()
					// it also handles dequeuing the next anim...
					o.complete.call(animated[0]);
				});
			});
		};

		$.fn.extend({
			addClass: (function(orig) {
				return function(classNames, speed, easing, callback) {
					return speed ?
						$.effects.animateClass.call(this, {
							add: classNames
						}, speed, easing, callback) :
						orig.apply(this, arguments);
				};
			})($.fn.addClass),

			removeClass: (function(orig) {
				return function(classNames, speed, easing, callback) {
					return arguments.length > 1 ?
						$.effects.animateClass.call(this, {
							remove: classNames
						}, speed, easing, callback) :
						orig.apply(this, arguments);
				};
			})($.fn.removeClass),

			toggleClass: (function(orig) {
				return function(classNames, force, speed, easing, callback) {
					if (typeof force === "boolean" || force === undefined) {
						if (!speed) {
							// without speed parameter
							return orig.apply(this, arguments);
						} else {
							return $.effects.animateClass.call(this, (force ? {
									add: classNames
								} : {
									remove: classNames
								}),
								speed, easing, callback);
						}
					} else {
						// without force parameter
						return $.effects.animateClass.call(this, {
							toggle: classNames
						}, force, speed, easing);
					}
				};
			})($.fn.toggleClass),

			switchClass: function(remove, add, speed, easing, callback) {
				return $.effects.animateClass.call(this, {
					add: add,
					remove: remove
				}, speed, easing, callback);
			}
		});

	})();

	/******************************************************************************/
	/*********************************** EFFECTS **********************************/
	/******************************************************************************/

	(function() {

		if ($.expr && $.expr.filters && $.expr.filters.animated) {
			$.expr.filters.animated = (function(orig) {
				return function(elem) {
					return !!$(elem).data(dataSpaceAnimated) || orig(elem);
				};
			})($.expr.filters.animated);
		}

		if ($.uiBackCompat !== false) {
			$.extend($.effects, {
				// Saves a set of properties in a data storage
				save: function(element, set) {
					var i = 0,
						length = set.length;
					for (; i < length; i++) {
						if (set[i] !== null) {
							element.data(dataSpace + set[i], element[0].style[set[i]]);
						}
					}
				},

				// Restores a set of previously saved properties from a data storage
				restore: function(element, set) {
					var val, i = 0,
						length = set.length;
					for (; i < length; i++) {
						if (set[i] !== null) {
							val = element.data(dataSpace + set[i]);
							element.css(set[i], val);
						}
					}
				},

				setMode: function(el, mode) {
					if (mode === "toggle") {
						mode = el.is(":hidden") ? "show" : "hide";
					}
					return mode;
				},

				// Wraps the element around a wrapper that copies position properties
				createWrapper: function(element) {

					// if the element is already wrapped, return it
					if (element.parent().is(".ui-effects-wrapper")) {
						return element.parent();
					}

					// wrap the element
					var props = {
							width: element.outerWidth(true),
							height: element.outerHeight(true),
							"float": element.css("float")
						},
						wrapper = $("<div></div>")
						.addClass("ui-effects-wrapper")
						.css({
							fontSize: "100%",
							background: "transparent",
							border: "none",
							margin: 0,
							padding: 0
						}),
						// Store the size in case width/height are defined in % - Fixes #5245
						size = {
							width: element.width(),
							height: element.height()
						},
						active = document.activeElement;

					// support: Firefox
					// Firefox incorrectly exposes anonymous content
					// https://bugzilla.mozilla.org/show_bug.cgi?id=561664
					try {
						active.id;
					} catch (e) {
						active = document.body;
					}

					element.wrap(wrapper);

					// Fixes #7595 - Elements lose focus when wrapped.
					if (element[0] === active || $.contains(element[0], active)) {
						$(active).trigger("focus");
					}

					wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

					// transfer positioning properties to the wrapper
					if (element.css("position") === "static") {
						wrapper.css({
							position: "relative"
						});
						element.css({
							position: "relative"
						});
					} else {
						$.extend(props, {
							position: element.css("position"),
							zIndex: element.css("z-index")
						});
						$.each(["top", "left", "bottom", "right"], function(i, pos) {
							props[pos] = element.css(pos);
							if (isNaN(parseInt(props[pos], 10))) {
								props[pos] = "auto";
							}
						});
						element.css({
							position: "relative",
							top: 0,
							left: 0,
							right: "auto",
							bottom: "auto"
						});
					}
					element.css(size);

					return wrapper.css(props).show();
				},

				removeWrapper: function(element) {
					var active = document.activeElement;

					if (element.parent().is(".ui-effects-wrapper")) {
						element.parent().replaceWith(element);

						// Fixes #7595 - Elements lose focus when wrapped.
						if (element[0] === active || $.contains(element[0], active)) {
							$(active).trigger("focus");
						}
					}

					return element;
				}
			});
		}

		$.extend($.effects, {
			version: "@VERSION",

			define: function(name, mode, effect) {
				if (!effect) {
					effect = mode;
					mode = "effect";
				}

				$.effects.effect[name] = effect;
				$.effects.effect[name].mode = mode;

				return effect;
			},

			scaledDimensions: function(element, percent, direction) {
				if (percent === 0) {
					return {
						height: 0,
						width: 0,
						outerHeight: 0,
						outerWidth: 0
					};
				}

				var x = direction !== "horizontal" ? ((percent || 100) / 100) : 1,
					y = direction !== "vertical" ? ((percent || 100) / 100) : 1;

				return {
					height: element.height() * y,
					width: element.width() * x,
					outerHeight: element.outerHeight() * y,
					outerWidth: element.outerWidth() * x
				};

			},

			clipToBox: function(animation) {
				return {
					width: animation.clip.right - animation.clip.left,
					height: animation.clip.bottom - animation.clip.top,
					left: animation.clip.left,
					top: animation.clip.top
				};
			},

			// Injects recently queued functions to be first in line (after "inprogress")
			unshift: function(element, queueLength, count) {
				var queue = element.queue();

				if (queueLength > 1) {
					queue.splice.apply(queue, [1, 0].concat(queue.splice(queueLength, count)));
				}
				element.dequeue();
			},

			saveStyle: function(element) {
				element.data(dataSpaceStyle, element[0].style.cssText);
			},

			restoreStyle: function(element) {
				element[0].style.cssText = element.data(dataSpaceStyle) || "";
				element.removeData(dataSpaceStyle);
			},

			mode: function(element, mode) {
				var hidden = element.is(":hidden");

				if (mode === "toggle") {
					mode = hidden ? "show" : "hide";
				}
				if (hidden ? mode === "hide" : mode === "show") {
					mode = "none";
				}
				return mode;
			},

			// Translates a [top,left] array into a baseline value
			getBaseline: function(origin, original) {
				var y, x;

				switch (origin[0]) {
					case "top":
						y = 0;
						break;
					case "middle":
						y = 0.5;
						break;
					case "bottom":
						y = 1;
						break;
					default:
						y = origin[0] / original.height;
				}

				switch (origin[1]) {
					case "left":
						x = 0;
						break;
					case "center":
						x = 0.5;
						break;
					case "right":
						x = 1;
						break;
					default:
						x = origin[1] / original.width;
				}

				return {
					x: x,
					y: y
				};
			},

			// Creates a placeholder element so that the original element can be made absolute
			createPlaceholder: function(element) {
				var placeholder,
					cssPosition = element.css("position"),
					position = element.position();

				// Lock in margins first to account for form elements, which
				// will change margin if you explicitly set height
				// see: http://jsfiddle.net/JZSMt/3/ https://bugs.webkit.org/show_bug.cgi?id=107380
				// Support: Safari
				element.css({
						marginTop: element.css("marginTop"),
						marginBottom: element.css("marginBottom"),
						marginLeft: element.css("marginLeft"),
						marginRight: element.css("marginRight")
					})
					.outerWidth(element.outerWidth())
					.outerHeight(element.outerHeight());

				if (/^(static|relative)/.test(cssPosition)) {
					cssPosition = "absolute";

					placeholder = $("<" + element[0].nodeName + ">").insertAfter(element).css({

							// Convert inline to inline block to account for inline elements
							// that turn to inline block based on content (like img)
							display: /^(inline|ruby)/.test(element.css("display")) ? "inline-block" : "block",
							visibility: "hidden",

							// Margins need to be set to account for margin collapse
							marginTop: element.css("marginTop"),
							marginBottom: element.css("marginBottom"),
							marginLeft: element.css("marginLeft"),
							marginRight: element.css("marginRight"),
							"float": element.css("float")
						})
						.outerWidth(element.outerWidth())
						.outerHeight(element.outerHeight())
						.addClass("ui-effects-placeholder");

					element.data(dataSpace + "placeholder", placeholder);
				}

				element.css({
					position: cssPosition,
					left: position.left,
					top: position.top
				});

				return placeholder;
			},

			removePlaceholder: function(element) {
				var dataKey = dataSpace + "placeholder",
					placeholder = element.data(dataKey);

				if (placeholder) {
					placeholder.remove();
					element.removeData(dataKey);
				}
			},

			// Removes a placeholder if it exists and restores
			// properties that were modified during placeholder creation
			cleanUp: function(element) {
				$.effects.restoreStyle(element);
				$.effects.removePlaceholder(element);
			},

			setTransition: function(element, list, factor, value) {
				value = value || {};
				$.each(list, function(i, x) {
					var unit = element.cssUnit(x);
					if (unit[0] > 0) {
						value[x] = unit[0] * factor + unit[1];
					}
				});
				return value;
			}
		});

		// return an effect options object for the given parameters:
		function _normalizeArguments(effect, options, speed, callback) {

			// allow passing all options as the first parameter
			if ($.isPlainObject(effect)) {
				options = effect;
				effect = effect.effect;
			}

			// convert to an object
			effect = {
				effect: effect
			};

			// catch (effect, null, ...)
			if (options == null) {
				options = {};
			}

			// catch (effect, callback)
			if ($.isFunction(options)) {
				callback = options;
				speed = null;
				options = {};
			}

			// catch (effect, speed, ?)
			if (typeof options === "number" || $.fx.speeds[options]) {
				callback = speed;
				speed = options;
				options = {};
			}

			// catch (effect, options, callback)
			if ($.isFunction(speed)) {
				callback = speed;
				speed = null;
			}

			// add options to effect
			if (options) {
				$.extend(effect, options);
			}

			speed = speed || options.duration;
			effect.duration = $.fx.off ? 0 :
				typeof speed === "number" ? speed :
				speed in $.fx.speeds ? $.fx.speeds[speed] :
				$.fx.speeds._default;

			effect.complete = callback || options.complete;

			return effect;
		}

		function standardAnimationOption(option) {
			// Valid standard speeds (nothing, number, named speed)
			if (!option || typeof option === "number" || $.fx.speeds[option]) {
				return true;
			}

			// Invalid strings - treat as "normal" speed
			if (typeof option === "string" && !$.effects.effect[option]) {
				return true;
			}

			// Complete callback
			if ($.isFunction(option)) {
				return true;
			}

			// Options hash (but not naming an effect)
			if (typeof option === "object" && !option.effect) {
				return true;
			}

			// Didn't match any standard API
			return false;
		}

		$.fn.extend({
			effect: function( /* effect, options, speed, callback */ ) {
				var args = _normalizeArguments.apply(this, arguments),
					effectMethod = $.effects.effect[args.effect],
					defaultMode = effectMethod.mode,
					queue = args.queue,
					queueName = queue || "fx",
					complete = args.complete,
					mode = args.mode,
					modes = [],
					prefilter = function(next) {
						var el = $(this),
							normalizedMode = $.effects.mode(el, mode) || defaultMode;

						// Sentinel for duck-punching the :animated psuedo-selector
						el.data(dataSpaceAnimated, true);

						// Save effect mode for later use,
						// we can't just call $.effects.mode again later,
						// as the .show() below destroys the initial state
						modes.push(normalizedMode);

						// See $.uiBackCompat inside of run() for removal of defaultMode in 1.13
						if (defaultMode && (normalizedMode === "show" ||
								(normalizedMode === defaultMode && normalizedMode === "hide"))) {
							el.show();
						}

						if (!defaultMode || normalizedMode !== "none") {
							$.effects.saveStyle(el);
						}

						if ($.isFunction(next)) {
							next();
						}
					};

				if ($.fx.off || !effectMethod) {
					// delegate to the original method (e.g., .show()) if possible
					if (mode) {
						return this[mode](args.duration, complete);
					} else {
						return this.each(function() {
							if (complete) {
								complete.call(this);
							}
						});
					}
				}

				function run(next) {
					var elem = $(this);

					function cleanup() {
						elem.removeData(dataSpaceAnimated);

						$.effects.cleanUp(elem);

						if (args.mode === "hide") {
							elem.hide();
						}

						done();
					}

					function done() {
						if ($.isFunction(complete)) {
							complete.call(elem[0]);
						}

						if ($.isFunction(next)) {
							next();
						}
					}

					// Override mode option on a per element basis,
					// as toggle can be either show or hide depending on element state
					args.mode = modes.shift();

					if ($.uiBackCompat !== false && !defaultMode) {
						if (elem.is(":hidden") ? mode === "hide" : mode === "show") {

							// Call the core method to track "olddisplay" properly
							elem[mode]();
							done();
						} else {
							effectMethod.call(elem[0], args, done);
						}
					} else {
						if (args.mode === "none") {

							// Call the core method to track "olddisplay" properly
							elem[mode]();
							done();
						} else {
							effectMethod.call(elem[0], args, cleanup);
						}
					}
				}

				// Run prefilter on all elements first to ensure that
				// any showing or hiding happens before placeholder creation,
				// which ensures that any layout changes are correctly captured.
				return queue === false ?
					this.each(prefilter).each(run) :
					this.queue(queueName, prefilter).queue(queueName, run);
			},

			show: (function(orig) {
				return function(option) {
					if (standardAnimationOption(option)) {
						return orig.apply(this, arguments);
					} else {
						var args = _normalizeArguments.apply(this, arguments);
						args.mode = "show";
						return this.effect.call(this, args);
					}
				};
			})($.fn.show),

			hide: (function(orig) {
				return function(option) {
					if (standardAnimationOption(option)) {
						return orig.apply(this, arguments);
					} else {
						var args = _normalizeArguments.apply(this, arguments);
						args.mode = "hide";
						return this.effect.call(this, args);
					}
				};
			})($.fn.hide),

			toggle: (function(orig) {
				return function(option) {
					if (standardAnimationOption(option) || typeof option === "boolean") {
						return orig.apply(this, arguments);
					} else {
						var args = _normalizeArguments.apply(this, arguments);
						args.mode = "toggle";
						return this.effect.call(this, args);
					}
				};
			})($.fn.toggle),

			cssUnit: function(key) {
				var style = this.css(key),
					val = [];

				$.each(["em", "px", "%", "pt"], function(i, unit) {
					if (style.indexOf(unit) > 0) {
						val = [parseFloat(style), unit];
					}
				});
				return val;
			},

			cssClip: function(clipObj) {
				return clipObj ?
					this.css("clip", "rect(" + clipObj.top + "px " + clipObj.right + "px " + clipObj.bottom + "px " + clipObj.left + "px)") :
					parseClip(this.css("clip"), this);
			},

			transfer: function(options, done) {
				var element = $(this),
					target = $(options.to),
					targetFixed = target.css("position") === "fixed",
					body = $("body"),
					fixTop = targetFixed ? body.scrollTop() : 0,
					fixLeft = targetFixed ? body.scrollLeft() : 0,
					endPosition = target.offset(),
					animation = {
						top: endPosition.top - fixTop,
						left: endPosition.left - fixLeft,
						height: target.innerHeight(),
						width: target.innerWidth()
					},
					startPosition = element.offset(),
					transfer = $("<div class='ui-effects-transfer'></div>")
					.appendTo("body")
					.addClass(options.className)
					.css({
						top: startPosition.top - fixTop,
						left: startPosition.left - fixLeft,
						height: element.innerHeight(),
						width: element.innerWidth(),
						position: targetFixed ? "fixed" : "absolute"
					})
					.animate(animation, options.duration, options.easing, function() {
						transfer.remove();
						if ($.isFunction(done)) {
							done();
						}
					});
			}
		});

		function parseClip(str, element) {
			var outerWidth = element.outerWidth(),
				outerHeight = element.outerHeight(),
				clipRegex = /^rect\((-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto)\)$/,
				values = clipRegex.exec(str) || ["", 0, outerWidth, outerHeight, 0];

			return {
				top: parseFloat(values[1]) || 0,
				right: values[2] === "auto" ? outerWidth : parseFloat(values[2]),
				bottom: values[3] === "auto" ? outerHeight : parseFloat(values[3]),
				left: parseFloat(values[4]) || 0
			};
		}

		$.fx.step.clip = function(fx) {
			if (!fx.clipInit) {
				fx.start = $(fx.elem).cssClip();
				if (typeof fx.end === "string") {
					fx.end = parseClip(fx.end, fx.elem);
				}
				fx.clipInit = true;
			}

			$(fx.elem).cssClip({
				top: fx.pos * (fx.end.top - fx.start.top) + fx.start.top,
				right: fx.pos * (fx.end.right - fx.start.right) + fx.start.right,
				bottom: fx.pos * (fx.end.bottom - fx.start.bottom) + fx.start.bottom,
				left: fx.pos * (fx.end.left - fx.start.left) + fx.start.left
			});
		};

	})();

	/******************************************************************************/
	/*********************************** EASING ***********************************/
	/******************************************************************************/

	(function() {

		// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

		var baseEasings = {};

		$.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function(i, name) {
			baseEasings[name] = function(p) {
				return Math.pow(p, i + 2);
			};
		});

		$.extend(baseEasings, {
			Sine: function(p) {
				return 1 - Math.cos(p * Math.PI / 2);
			},
			Circ: function(p) {
				return 1 - Math.sqrt(1 - p * p);
			},
			Elastic: function(p) {
				return p === 0 || p === 1 ? p :
					-Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
			},
			Back: function(p) {
				return p * p * (3 * p - 2);
			},
			Bounce: function(p) {
				var pow2,
					bounce = 4;

				while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
				return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
			}
		});

		$.each(baseEasings, function(name, easeIn) {
			$.easing["easeIn" + name] = easeIn;
			$.easing["easeOut" + name] = function(p) {
				return 1 - easeIn(1 - p);
			};
			$.easing["easeInOut" + name] = function(p) {
				return p < 0.5 ?
					easeIn(p * 2) / 2 :
					1 - easeIn(p * -2 + 2) / 2;
			};
		});

	})();

	/*!
	 * jQuery UI Effects Blind @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("blind", "hide", function(options, done) {
		var map = {
				up: ["bottom", "top"],
				vertical: ["bottom", "top"],
				down: ["top", "bottom"],
				left: ["right", "left"],
				horizontal: ["right", "left"],
				right: ["left", "right"]
			},
			element = $(this),
			direction = options.direction || "up",
			start = element.cssClip(),
			animate = {
				clip: $.extend({}, start)
			},
			placeholder = $.effects.createPlaceholder(element);

		animate.clip[map[direction][0]] = animate.clip[map[direction][1]];

		if (options.mode === "show") {
			element.cssClip(animate.clip);
			if (placeholder) {
				placeholder.css($.effects.clipToBox(animate));
			}

			animate.clip = start;
		}

		if (placeholder) {
			placeholder.animate($.effects.clipToBox(animate), options.duration, options.easing);
		}

		element.animate(animate, {
			queue: false,
			duration: options.duration,
			easing: options.easing,
			complete: done
		});
	});


	/*!
	 * jQuery UI Effects Bounce @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("bounce", function(options, done) {
		var upAnim, downAnim, refValue,
			element = $(this),

			// defaults:
			mode = options.mode,
			hide = mode === "hide",
			show = mode === "show",
			direction = options.direction || "up",
			distance = options.distance,
			times = options.times || 5,

			// number of internal animations
			anims = times * 2 + (show || hide ? 1 : 0),
			speed = options.duration / anims,
			easing = options.easing,

			// utility:
			ref = (direction === "up" || direction === "down") ? "top" : "left",
			motion = (direction === "up" || direction === "left"),
			i = 0,

			queuelen = element.queue().length;

		$.effects.createPlaceholder(element);

		refValue = element.css(ref);

		// default distance for the BIGGEST bounce is the outer Distance / 3
		if (!distance) {
			distance = element[ref === "top" ? "outerHeight" : "outerWidth"]() / 3;
		}

		if (show) {
			downAnim = {
				opacity: 1
			};
			downAnim[ref] = refValue;

			// if we are showing, force opacity 0 and set the initial position
			// then do the "first" animation
			element
				.css("opacity", 0)
				.css(ref, motion ? -distance * 2 : distance * 2)
				.animate(downAnim, speed, easing);
		}

		// start at the smallest distance if we are hiding
		if (hide) {
			distance = distance / Math.pow(2, times - 1);
		}

		downAnim = {};
		downAnim[ref] = refValue;
		// Bounces up/down/left/right then back to 0 -- times * 2 animations happen here
		for (; i < times; i++) {
			upAnim = {};
			upAnim[ref] = (motion ? "-=" : "+=") + distance;

			element
				.animate(upAnim, speed, easing)
				.animate(downAnim, speed, easing);

			distance = hide ? distance * 2 : distance / 2;
		}

		// Last Bounce when Hiding
		if (hide) {
			upAnim = {
				opacity: 0
			};
			upAnim[ref] = (motion ? "-=" : "+=") + distance;

			element.animate(upAnim, speed, easing);
		}

		element.queue(done);

		$.effects.unshift(element, queuelen, anims + 1);
	});

	/*!
	 * jQuery UI Effects Clip @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("clip", "hide", function(options, done) {
		var start,
			animate = {},
			element = $(this),
			direction = options.direction || "vertical",
			both = direction === "both",
			horizontal = both || direction === "horizontal",
			vertical = both || direction === "vertical";

		start = element.cssClip();
		animate.clip = {
			top: vertical ? (start.bottom - start.top) / 2 : start.top,
			right: horizontal ? (start.right - start.left) / 2 : start.right,
			bottom: vertical ? (start.bottom - start.top) / 2 : start.bottom,
			left: horizontal ? (start.right - start.left) / 2 : start.left
		};

		$.effects.createPlaceholder(element);

		if (options.mode === "show") {
			element.cssClip(animate.clip);
			animate.clip = start;
		}

		element.animate(animate, {
			queue: false,
			duration: options.duration,
			easing: options.easing,
			complete: done
		});

	});


	/*!
	 * jQuery UI Effects Drop @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("drop", "hide", function(options, done) {

		var distance,
			element = $(this),
			mode = options.mode,
			show = mode === "show",
			direction = options.direction || "left",
			ref = (direction === "up" || direction === "down") ? "top" : "left",
			motion = (direction === "up" || direction === "left") ? "-=" : "+=",
			oppositeMotion = (motion === "+=") ? "-=" : "+=",
			animation = {
				opacity: 0
			};

		$.effects.createPlaceholder(element);

		distance = options.distance || element[ref === "top" ? "outerHeight" : "outerWidth"](true) / 2;

		animation[ref] = motion + distance;

		if (show) {
			element.css(animation);

			animation[ref] = oppositeMotion + distance;
			animation.opacity = 1;
		}

		// Animate
		element.animate(animation, {
			queue: false,
			duration: options.duration,
			easing: options.easing,
			complete: done
		});
	});


	/*!
	 * jQuery UI Effects Explode @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("explode", "hide", function(options, done) {

		var i, j, left, top, mx, my,
			rows = options.pieces ? Math.round(Math.sqrt(options.pieces)) : 3,
			cells = rows,
			element = $(this),
			mode = options.mode,
			show = mode === "show",

			// show and then visibility:hidden the element before calculating offset
			offset = element.show().css("visibility", "hidden").offset(),

			// width and height of a piece
			width = Math.ceil(element.outerWidth() / cells),
			height = Math.ceil(element.outerHeight() / rows),
			pieces = [],
			//添加zIndex(leoUi)
			zIndex = element.css('zIndex');

		// children animate complete:
		function childComplete() {
			pieces.push(this);
			if (pieces.length === rows * cells) {
				animComplete();
			}
		}

		// clone the element for each row and cell.
		for (i = 0; i < rows; i++) { // ===>
			top = offset.top + i * height;
			my = i - (rows - 1) / 2;

			for (j = 0; j < cells; j++) { // |||
				left = offset.left + j * width;
				mx = j - (cells - 1) / 2;

				// Create a clone of the now hidden main element that will be absolute positioned
				// within a wrapper div off the -left and -top equal to size of our pieces
				element
					.clone()
					.appendTo("body")
					.wrap("<div></div>")
					.css({
						position: "absolute",
						visibility: "visible",
						left: -j * width,
						top: -i * height
					})

				// select the wrapper - make it overflow: hidden and absolute positioned based on
				// where the original was located +left and +top equal to the size of pieces
				.parent()
					.addClass("ui-effects-explode")
					.css({
						position: "absolute",
						overflow: "hidden",
						width: width,
						height: height,
						left: left + (show ? mx * width : 0),
						top: top + (show ? my * height : 0),
						opacity: show ? 0 : 1,
						//添加zIndex(leoUi)
						zIndex:zIndex
					})
					.animate({
						left: left + (show ? 0 : mx * width),
						top: top + (show ? 0 : my * height),
						opacity: show ? 1 : 0
					}, options.duration || 500, options.easing, childComplete);
			}
		}

		function animComplete() {
			element.css({
				visibility: "visible"
			});
			$(pieces).remove();
			done();
		}
	});


	/*!
	 * jQuery UI Effects Fade @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("fade", "toggle", function(options, done) {
		var show = options.mode === "show";

		$(this)
			.css("opacity", show ? 0 : 1)
			.animate({
				opacity: show ? 1 : 0
			}, {
				queue: false,
				duration: options.duration,
				easing: options.easing,
				complete: done
			});
	});


	/*!
	 * jQuery UI Effects Fold @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("fold", "hide", function(options, done) {

		// Create element
		var element = $(this),
			mode = options.mode,
			show = mode === "show",
			hide = mode === "hide",
			size = options.size || 15,
			percent = /([0-9]+)%/.exec(size),
			horizFirst = !!options.horizFirst,
			ref = horizFirst ? ["right", "bottom"] : ["bottom", "right"],
			duration = options.duration / 2,

			placeholder = $.effects.createPlaceholder(element),

			start = element.cssClip(),
			animation1 = {
				clip: $.extend({}, start)
			},
			animation2 = {
				clip: $.extend({}, start)
			},

			distance = [start[ref[0]], start[ref[1]]],

			queuelen = element.queue().length;

		if (percent) {
			size = parseInt(percent[1], 10) / 100 * distance[hide ? 0 : 1];
		}
		animation1.clip[ref[0]] = size;
		animation2.clip[ref[0]] = size;
		animation2.clip[ref[1]] = 0;

		if (show) {
			element.cssClip(animation2.clip);
			if (placeholder) {
				placeholder.css($.effects.clipToBox(animation2));
			}

			animation2.clip = start;
		}

		// Animate
		element
			.queue(function(next) {
				if (placeholder) {
					placeholder
						.animate($.effects.clipToBox(animation1), duration, options.easing)
						.animate($.effects.clipToBox(animation2), duration, options.easing);
				}

				next();
			})
			.animate(animation1, duration, options.easing)
			.animate(animation2, duration, options.easing)
			.queue(done);

		$.effects.unshift(element, queuelen, 4);
	});


	/*!
	 * jQuery UI Effects Highlight @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("highlight", "show", function(options, done) {
		var element = $(this),
			animation = {
				backgroundColor: element.css("backgroundColor")
			};

		if (options.mode === "hide") {
			animation.opacity = 0;
		}

		$.effects.saveStyle(element);

		element
			.css({
				backgroundImage: "none",
				backgroundColor: options.color || "#ffff99"
			})
			.animate(animation, {
				queue: false,
				duration: options.duration,
				easing: options.easing,
				complete: done
			});
	});


	/*!
	 * jQuery UI Effects Puff @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("puff", "hide", function(options, done) {
		var newOptions = $.extend(true, {}, options, {
			fade: true,
			percent: parseInt(options.percent, 10) || 150
		});

		$.effects.effect.scale.call(this, newOptions, done);
	});


	/*!
	 * jQuery UI Effects Pulsate @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("pulsate", "show", function(options, done) {
		var element = $(this),
			mode = options.mode,
			show = mode === "show",
			hide = mode === "hide",
			showhide = show || hide,

			// Showing or hiding leaves off the "last" animation
			anims = ((options.times || 5) * 2) + (showhide ? 1 : 0),
			duration = options.duration / anims,
			animateTo = 0,
			i = 1,
			queuelen = element.queue().length;

		if (show || !element.is(":visible")) {
			element.css("opacity", 0).show();
			animateTo = 1;
		}

		// Anims - 1 opacity "toggles"
		for (; i < anims; i++) {
			element.animate({
				opacity: animateTo
			}, duration, options.easing);
			animateTo = 1 - animateTo;
		}

		element.animate({
			opacity: animateTo
		}, duration, options.easing);

		element.queue(done);

		$.effects.unshift(element, queuelen, anims + 1);
	});


	/*!
	 * jQuery UI Effects Scale @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("scale", function(options, done) {

		// Create element
		var el = $(this),
			mode = options.mode,
			percent = parseInt(options.percent, 10) ||
			(parseInt(options.percent, 10) === 0 ? 0 : (mode !== "effect" ? 0 : 100)),

			newOptions = $.extend(true, {
				from: $.effects.scaledDimensions(el),
				to: $.effects.scaledDimensions(el, percent, options.direction || "both"),
				origin: options.origin || ["middle", "center"]
			}, options);

		// Fade option to support puff
		if (options.fade) {
			newOptions.from.opacity = 1;
			newOptions.to.opacity = 0;
		}

		$.effects.effect.size.call(this, newOptions, done);
	});


	/*!
	 * jQuery UI Effects Shake @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("shake", function(options, done) {

		var i = 1,
			element = $(this),
			direction = options.direction || "left",
			distance = options.distance || 20,
			times = options.times || 3,
			anims = times * 2 + 1,
			speed = Math.round(options.duration / anims),
			ref = (direction === "up" || direction === "down") ? "top" : "left",
			positiveMotion = (direction === "up" || direction === "left"),
			animation = {},
			animation1 = {},
			animation2 = {},

			queuelen = element.queue().length;

		$.effects.createPlaceholder(element);

		// Animation
		animation[ref] = (positiveMotion ? "-=" : "+=") + distance;
		animation1[ref] = (positiveMotion ? "+=" : "-=") + distance * 2;
		animation2[ref] = (positiveMotion ? "-=" : "+=") + distance * 2;

		// Animate
		element.animate(animation, speed, options.easing);

		// Shakes
		for (; i < times; i++) {
			element.animate(animation1, speed, options.easing).animate(animation2, speed, options.easing);
		}

		element
			.animate(animation1, speed, options.easing)
			.animate(animation, speed / 2, options.easing)
			.queue(done);

		$.effects.unshift(element, queuelen, anims + 1);
	});

	/*!
	 * jQuery UI Effects Size @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("size", function(options, done) {
		// Create element
		var baseline, factor, temp,
			element = $(this),

			// Copy for children
			cProps = ["fontSize"],
			vProps = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"],
			hProps = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"],

			// Set options
			mode = options.mode,
			restore = mode !== "effect",
			scale = options.scale || "both",
			origin = options.origin || ["middle", "center"],
			position = element.css("position"),
			pos = element.position(),
			original = $.effects.scaledDimensions(element),
			from = options.from || original,
			to = options.to || $.effects.scaledDimensions(element, 0);

		$.effects.createPlaceholder(element);

		if (mode === "show") {
			temp = from;
			from = to;
			to = temp;
		}

		// Set scaling factor
		factor = {
			from: {
				y: from.height / original.height,
				x: from.width / original.width
			},
			to: {
				y: to.height / original.height,
				x: to.width / original.width
			}
		};

		// Scale the css box
		if (scale === "box" || scale === "both") {

			// Vertical props scaling
			if (factor.from.y !== factor.to.y) {
				from = $.effects.setTransition(element, vProps, factor.from.y, from);
				to = $.effects.setTransition(element, vProps, factor.to.y, to);
			}

			// Horizontal props scaling
			if (factor.from.x !== factor.to.x) {
				from = $.effects.setTransition(element, hProps, factor.from.x, from);
				to = $.effects.setTransition(element, hProps, factor.to.x, to);
			}
		}

		// Scale the content
		if (scale === "content" || scale === "both") {

			// Vertical props scaling
			if (factor.from.y !== factor.to.y) {
				from = $.effects.setTransition(element, cProps, factor.from.y, from);
				to = $.effects.setTransition(element, cProps, factor.to.y, to);
			}
		}

		// Adjust the position properties based on the provided origin points
		if (origin) {
			baseline = $.effects.getBaseline(origin, original);
			from.top = (original.outerHeight - from.outerHeight) * baseline.y + pos.top;
			from.left = (original.outerWidth - from.outerWidth) * baseline.x + pos.left;
			to.top = (original.outerHeight - to.outerHeight) * baseline.y + pos.top;
			to.left = (original.outerWidth - to.outerWidth) * baseline.x + pos.left;
		}
		element.css(from);

		// Animate the children if desired
		if (scale === "content" || scale === "both") {

			vProps = vProps.concat(["marginTop", "marginBottom"]).concat(cProps);
			hProps = hProps.concat(["marginLeft", "marginRight"]);

			// Only animate children with width attributes specified
			// TODO: is this right? should we include anything with css width specified as well
			element.find("*[width]").each(function() {
				var child = $(this),
					childOriginal = $.effects.scaledDimensions(child),
					childFrom = {
						height: childOriginal.height * factor.from.y,
						width: childOriginal.width * factor.from.x,
						outerHeight: childOriginal.outerHeight * factor.from.y,
						outerWidth: childOriginal.outerWidth * factor.from.x
					},
					childTo = {
						height: childOriginal.height * factor.to.y,
						width: childOriginal.width * factor.to.x,
						outerHeight: childOriginal.height * factor.to.y,
						outerWidth: childOriginal.width * factor.to.x
					};

				// Vertical props scaling
				if (factor.from.y !== factor.to.y) {
					childFrom = $.effects.setTransition(child, vProps, factor.from.y, childFrom);
					childTo = $.effects.setTransition(child, vProps, factor.to.y, childTo);
				}

				// Horizontal props scaling
				if (factor.from.x !== factor.to.x) {
					childFrom = $.effects.setTransition(child, hProps, factor.from.x, childFrom);
					childTo = $.effects.setTransition(child, hProps, factor.to.x, childTo);
				}

				if (restore) {
					$.effects.saveStyle(child);
				}

				// Animate children
				child.css(childFrom);
				child.animate(childTo, options.duration, options.easing, function() {

					// Restore children
					if (restore) {
						$.effects.restoreStyle(child);
					}
				});
			});
		}

		// Animate
		element.animate(to, {
			queue: false,
			duration: options.duration,
			easing: options.easing,
			complete: function() {

				var offset = element.offset();

				if (to.opacity === 0) {
					element.css("opacity", from.opacity);
				}

				if (!restore) {
					element
						.css("position", position === "static" ? "relative" : position)
						.offset(offset);

					// Need to save style here so that automatic style restoration
					// doesn't restore to the original styles from before the animation.
					$.effects.saveStyle(element);
				}

				done();
			}
		});

	});


	/*!
	 * jQuery UI Effects Slide @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	$.effects.define("slide", "show", function(options, done) {
		var startClip, startRef,
			element = $(this),
			map = {
				up: ["bottom", "top"],
				down: ["top", "bottom"],
				left: ["right", "left"],
				right: ["left", "right"]
			},
			mode = options.mode,
			direction = options.direction || "left",
			ref = (direction === "up" || direction === "down") ? "top" : "left",
			positiveMotion = (direction === "up" || direction === "left"),
			distance = options.distance || element[ref === "top" ? "outerHeight" : "outerWidth"](true),
			animation = {};

		$.effects.createPlaceholder(element);

		startClip = element.cssClip();
		startRef = element.position()[ref];

		// Define hide animation
		animation[ref] = (positiveMotion ? -1 : 1) * distance + startRef;
		animation.clip = element.cssClip();
		animation.clip[map[direction][1]] = animation.clip[map[direction][0]];

		// Reverse the animation if we're showing
		if (mode === "show") {
			element.cssClip(animation.clip);
			element.css(ref, animation[ref]);
			animation.clip = startClip;
			animation[ref] = startRef;
		}

		// Actually animate
		element.animate(animation, {
			queue: false,
			duration: options.duration,
			easing: options.easing,
			complete: done
		});
	});

	/*!
	 * jQuery UI Effects Transfer @VERSION
	 * http://jqueryui.com
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 */
	if ($.uiBackCompat !== false) {
		$.effects.define("transfer", function(options, done) {
			$(this).transfer(options, done);
		});
	}

	return $;

}));