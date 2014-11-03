/**
+-------------------------------------------------------------------
* jQuery leoUi--加载leoUiLoad
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
+( function( global, DOC ) {

	var _$ = global.$,_leoUiLoad = global.leoUiLoad,//保存已有同名变量

	W3C = DOC.dispatchEvent,//IE9开始支持W3C的事件模型与getComputedStyle取样式值

	html = DOC.documentElement,//HTML元素

	head = DOC.head || DOC.getElementsByTagName("head")[0], //HEAD元素

	loadings = [], //正在加载中的模块列表

	factorys = [],//储存需要绑定ID与factory对应关系的模块（标准浏览器下，先parse的script节点会先onload）

	moduleClass = "leoUi" + (new Date - 0),

	hasOwn = Object.prototype.hasOwnProperty,

	rProtocol = /^(file\:.+\:\/|[\w\-]+\:\/\/)/,

	rmakeid = /(#.+|\W)/g, //用于处理掉href中的hash与所有特殊符号，生成长命名空间

	rdeuce = /\/\w+\/\.\./, modules = { ready: {} },

	readyFn, ready = W3C ? "DOMContentLoaded" : "readystatechange",basepath;

	function $(expr) {

		if ( typeof expr === "function" && expr.call ) { //注意在safari下,typeof nodeList的类型为function,因此必须使用$.type

			return $.require("_leoUi,ready", expr);

		}

	}

	/**
	 * 糅杂，为一个对象添加更多成员
	 * @param {Object} receiver 接受者
	 * @param {Object} supplier 提供者
	 * @return  {Object} 目标对象
	 * @api public
	 */
	function mix(receiver, supplier) {

		var args = [].slice.call(arguments),

			i = 1,

			key, //如果最后参数是布尔，判定是否覆写同名属性

			ride = typeof args[args.length - 1] === "boolean" ? args.pop() : true;

		if (args.length === 1) { //处理$.mix(hash)的情形

			receiver = !this.window ? this : {};

			i = 0;

		}

		while ((supplier = args[i++])) {

			for (key in supplier) { //允许对象糅杂，用户保证都是对象

				if (hasOwn.call(supplier, key) && (ride || !(key in receiver))) {

					receiver[key] = supplier[key];

				}

			}

		}

		return receiver;
	}

	mix($, {

		rword: /[^, ]+/g,

		hasOwn: function(obj, key) {

			return hasOwn.call(obj, key);

		},

		/**
		 * 数组化
		 * @param {ArrayLike} nodes 要处理的类数组对象
		 * @param {Number} start 可选。要抽取的片断的起始下标。如果是负数，从后面取起
		 * @param {Number} end  可选。规定从何处结束选取
		 * @return {Array}
		 * @api public
		 */
		slice: W3C ? function(nodes, start, end) {

			return factorys.slice.call(nodes, start, end);

		} : function(nodes, start, end) {

			var ret = [],

				n = nodes.length;

			if (end === void 0 || typeof end === "number" && isFinite(end)) {

				start = parseInt(start, 10) || 0;

				end = end == void 0 ? n : parseInt(end, 10);

				if (start < 0) {

					start += n;

				}

				if (end > n) {

					end = n;

				}

				if (end < 0) {

					end += n;
				}

				for (var i = start; i < end; ++i) {

					ret[i - start] = nodes[i];

				}

			}

			return ret;

		},

		noConflict: function( deep ) {

			if ( global.$ === $ ) {

				global.$ = _$;

			}

			if ( deep && global.leoUiLoad === $ ) {

				global.leoUiLoad = _leoUiLoad;

			}

			return this;
		},

		/**
		 * 绑定事件(简化版)
		 * @param {Node|Document|window} el 触发者
		 * @param {String} type 事件类型
		 * @param {Function} fn 回调
		 * @param {Boolean} phase ? 是否捕获，默认false
		 * @return {Function} fn 刚才绑定的回调
		 */
		bind: W3C ? function(el, type, fn, phase) {

			el.addEventListener(type, fn, !!phase);

			return fn;

		} : function(el, type, fn) {

			el.attachEvent && el.attachEvent("on" + type, fn);

			return fn;

		},

		/**
		 * 卸载事件(简化版)
		 * @param {Node|Document|window} el 触发者
		 * @param {String} type 事件类型
		 * @param {Function} fn 回调
		 * @param {Boolean} phase ? 是否捕获，默认false
		 */
		unbind: W3C ? function(el, type, fn, phase) {

			el.removeEventListener(type, fn || $.noop, !!phase);

		} : function(el, type, fn) {

			if (el.detachEvent) {

				el.detachEvent("on" + type, fn || $.noop);

			}

		},

		/**
		 *  将调试信息打印到控制台或页面
		 *  $.log(str, page, level )
		 *  @param {Any} str 用于打印的信息，不是字符串将转换为字符串
		 *  @param {Boolean} page ? 是否打印到页面
		 *  @param {Number} level ? 通过它来过滤显示到控制台的日志数量。
		 *          0为最少，只显示最致命的错误；7，则连普通的调试消息也打印出来。
		 *          显示算法为 level <= $.config.level。
		 *          这个$.config.level默认为9。下面是level各代表的含义。
		 *          0 EMERGENCY 致命错误,框架崩溃
		 *          1 ALERT 需要立即采取措施进行修复
		 *          2 CRITICAL 危急错误
		 *          3 ERROR 异常
		 *          4 WARNING 警告
		 *          5 NOTICE 通知用户已经进行到方法
		 *          6 INFO 更一般化的通知
		 *          7 DEBUG 调试消息
		 *  @return {String}
		 *  @api public
		 */
		log: function( str, page, level ) {

			for ( var i = 1, show = true; i < arguments.length; i++ ) {

				level = arguments[i];

				if ( typeof level === "number" ) {

					show = level <= $.config.level;

				} else if ( level === true ) {

					page = true;

				}

			}

			if (show) {

				if (page === true) {

					$.require("ready", function() {

						var div = DOC.createElement("pre");

						div.className = "leoUi_sys_log";

						div.innerHTML = str + ""; //确保为字符串

						DOC.body.appendChild(div);

					});

				} else if ( window.opera ) {

					opera.postError(str);

					//http://www.cnblogs.com/zoho/archive/2013/01/31/2886651.html
					//http://www.dotblogs.com.tw/littlebtc/archive/2009/04/06/ie8-ajax-2-debug.aspx
				} else if ( global.console && console.info && console.log ) {

					console.log(str);

				}

			}

			return str;

		},

		/**
		 * 配置
		 * @param  {Object} settings 配置对象
		 * @return {$}
		 */
		config: function(settings) {

			settings.level && ( $.config.level = settings.level );

			if ( settings.baseUrl ) {

				basepath = $.mergePath( settings.baseUrl, basepath );

			}

			if ( settings.alias ) {

				!$.config.alias && ($.config.alias = {});

				mix( $.config.alias, settings.alias );

			}

			if ( settings.shim ) {

				!$.config.shim && ($.config.shim = {});

				mix( $.config.shim, settings.shim );

			}

			return this;

		},

		// 将模块标识(相对路径)和基础路径合并成新的真正的模块路径(不含模块的文件名)
		mergePath: function(id, url) {

			var isRootDir = id.charAt(0) === '/',

				isHttp = url.slice(0, 4) === 'http',

				domain = '',

				i = 0,

				protocol, isHttp, urlDir, idDir, dirPath, len, dir;

			protocol = url.match(rProtocol)[1];

			url = url.slice(protocol.length);

			// HTTP协议的路径含有域名
			if (isHttp) {

				domain = url.slice(0, url.indexOf('/') + 1);

				url = isRootDir ? '' : url.slice(domain.length);

			}

			// 组装基础路径的目录数组
			urlDir = url.split('/');

			urlDir.pop();

			// 组装模块标识的目录数组
			idDir = id.split('/');

			idDir.pop();

			if (isRootDir) {

				idDir.shift();

			}

			len = idDir.length;

			for (; i < len; i++) {

				dir = idDir[i];

				// 模块标识的目录数组中含有../则基础路径的目录数组删除最后一个目录
				// 否则直接将模块标识的目录数组的元素添加到基础路径的目录数组中
				if (dir === '..') {

					urlDir.pop();

				} else if (dir !== '.') {

					urlDir.push(dir);

				}

			}

			// 基础路径的目录数组转换成目录字符串
			dirPath = urlDir.join('/');

			// 无目录的情况不用加斜杠
			dirPath = dirPath === '' ? '' : dirPath + '/';

			return protocol + domain + dirPath;

		},

		//一个空函数
		noop: function() {},

		/**
		 * 抛出错误,方便调试
		 * @param {String} str
		 * @param {Error}  e ? 具体的错误对象构造器
		 * EvalError: 错误发生在eval()中
		 * SyntaxError: 语法错误,错误发生在eval()中,因为其它点发生SyntaxError会无法通过解释器
		 * RangeError: 数值超出范围
		 * ReferenceError: 引用不可用
		 * TypeError: 变量类型不是预期的
		 * URIError: 错误发生在encodeURI()或decodeURI()中
		 */
		error: function(str, e) {

			throw new(e || Error)(str);

		}

	});

	function init() {

		var i = 0,script, scripts, initMod, initBaseUrl, url ,initCoreLib, configUrl;

        // firefox支持currentScript属性
        if (document.currentScript) {

            script = document.currentScript;

        } else {

            // 正常情况下，在页面加载时，当前js文件的script标签始终是最后一个
            scripts = document.getElementsByTagName('script');

            script = scripts[scripts.length - 1];

        }

        initMod = script.getAttribute('data-main');

        config = script.getAttribute('data-config');

        initBaseUrl = script.getAttribute('data-baseurl');

        initCoreLib = script.getAttribute('data-corelib');

        url = script.hasAttribute ? script.src : script.getAttribute('src', 4);

        url = url || window.location.href;

		basepath = !!initBaseUrl ? $.mergePath( initBaseUrl, window.location.href ) : url.slice( 0, url.lastIndexOf('/') + 1 );

		$.config.level = 6;

		$.config.shim = {

            _leoUi:{

                src: initCoreLib || 'jquery/jquery-1.9.1.js',

                exports:function(){

                	window.jQuery = null;

                	return window.$.noConflict();

                }

            }　

        }

        if (initMod) {

        	if (config){

	        	( configUrl = basepath + config ).indexOf('.js') === -1 && ( configUrl += '.js' );

	        	loadJS( configUrl, function() {

					loadJSCSS( initMod, basepath, false, true );

				} )

			}else{

				loadJSCSS( initMod, basepath, false, true );

			}

		}

		scripts = script = null;

	};

	//============================加载系统===========================

	function getCurrentScript(base) {
		// 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
		var stack;

		try {

			a.b.c(); //强制报错,以便捕获e.stack

		} catch (e) { //safari的错误对象只有line,sourceId,sourceURL

			stack = e.stack;

			if (!stack && window.opera) {

				//opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
				stack = (String(e).match(/of linked script \S+/g) || []).join(" ");

			}

		}

		if (stack) {

			/**e.stack最后一行在所有支持的浏览器大致如下:
			 *chrome23:
			 * at http://113.93.50.63/data.js:4:1
			 *firefox17:
			 *@http://113.93.50.63/query.js:4
			 *opera12:http://www.oldapps.com/opera.php?system=Windows_XP
			 *@http://113.93.50.63/data.js:4
			 *IE10:
			 *  at Global code (http://113.93.50.63/data.js:4:1)
			 *  //firefox4+ 可以用document.currentScript
			 */
			stack = stack.split(/[@ ]/g).pop(); //取得最后一行,最后一个空格或@之后的部分

			stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, ""); //去掉换行符

			return stack.replace(/(:\d+)?:\d+$/i, ""); //去掉行号与或许存在的出错字符起始位置

		}

		var nodes = (base ? document : head).getElementsByTagName("script"); //只在head标签中寻找

		for (var i = nodes.length, node; node = nodes[--i];) {

			if ((base || node.className === moduleClass) && node.readyState === "interactive") {

				return node.className = node.hasAttribute ? node.src : node.getAttribute('src', 4);

			}

		}

	}

	function checkCycle( deps, nick ) {

		//检测是否存在循环依赖
		for (var id in deps) {

			if ( deps[id] === "leoUi" && modules[id].state !== 2 && ( id === nick || checkCycle( modules[id].deps, nick ) ) ) {

				return true;

			}

		}

	}

	function checkDeps() {

		//检测此JS模块的依赖是否都已安装完毕,是则安装自身
		loop: for ( var i = loadings.length, id; id = loadings[--i]; ) {

			var obj = modules[id],deps = obj.deps;

			for ( var key in deps ) {

				if ( hasOwn.call(deps, key) && modules[key].state !== 2 ) {

					continue loop;

				}

			}
			//如果deps是空对象或者其依赖的模块的状态都是2
			if (obj.state !== 2) {

				loadings.splice(i, 1); //必须先移除再安装，防止在IE下DOM树建完后手动刷新页面，会多次执行它

				fireFactory(obj.id, obj.args, obj.factory);

				checkDeps(); //如果成功,则再执行一次,以防有些模块就差本模块没有安装好

			}

		}

	}

	function checkFail( node, onError, fuckIE ) {

		var id = node.src; //检测是否死链

		node.onload = node.onreadystatechange = node.onerror = null;

		if ( onError || ( !!fuckIE && !!modules[id] && !modules[id].state ) ) {

			setTimeout(function() {

				head.removeChild(node);

			});

			$.log("加载 " + id + " 失败" + onError + " " + ( !!modules[id] && !modules[id].state ), 7);

		} else {

			return true;

		}

	}

	function loadJSCSS( url, parent, shim, isModules ) {

		//1. 特别处理ready标识符
		if (/^ready$/.test(url)) {
			return url;
		}

		if(shim){

			url = shim['src'];

		}

		if ( !!$.config.alias && $.config.alias[url] ) { //别名机制

			url = $.config.alias[url];

		}

		if (/^(\w+)(\d)?:.*/.test(url)) { //如果本来就是完整路径

				ret = url;

		} else {

			parent = parent.substr(0, parent.lastIndexOf('/'));

			var tmp = url.charAt(0);

			if (tmp !== "." && tmp !== "/") { //相对于根路径

				ret = basepath + url;

			} else if (url.slice(0, 2) === "./") { //相对于兄弟路径

				ret = parent + url.slice(1);

			} else if (url.slice(0, 2) === "..") { //相对于父路径

				ret = parent + "/" + url

				while (rdeuce.test(ret)) {

					ret = ret.replace(rdeuce, "");

				}

			} else if (tmp === "/") {

				ret = parent + url; //相对于兄弟路径

			} else {

				$.error("不符合模块标识规则: " + url);

			}

		}

		var src = ret.replace(/[?#].*/, ""),ext;

		if (/\.(css|js)$/.test(src)) {

			ext = RegExp.$1;

		}

		if (!ext) { //如果没有后缀名,加上后缀名

			src += ".js";

			ext = "js";

		}

		if ( !!$.config.nocache && $.config.nocache[url] ) {

            src += ( src.indexOf("?") === -1 ? "?" : "&" ) + ( new Date - 0 );

        }

		//3. 开始加载JS或CSS
		if (ext === "js") {

			if (!modules[src]) { //如果之前没有加载过

				!isModules && ( modules[src] = {

					id: src,

					parent: parent,

					exports: {},

					state: 1

				} );

				if (shim) { //shim机制

					$.require(shim.deps || "", function() {

						loadJS(src, function() {

							modules[src].exports = typeof shim.exports === "function" ?shim.exports() : window[shim.exports];

							if( modules[src].exports ){

								modules[src].state = 2;

							}else{

								$.log( "shim机制下的" + src + " 无输出", 7 );

							}

							checkDeps();

						});

					});

				} else {

					loadJS(src);

				}

			}

			return src;

		} else {

			loadCSS(src);

		}

	}

	function loadJS(url, callback) {
		//通过script节点加载目标模块
		var node = DOC.createElement("script");

		node.charset = 'utf-8';

		node.async = true;

		node.className = moduleClass; //让getCurrentScript只处理类名为moduleClass的script节点

		node[W3C ? "onload" : "onreadystatechange"] = function() {

			if (W3C || /loaded|complete/i.test(node.readyState)) {

				//在_checkFail把它上面的回调清掉，尽可能释放回存，尽管DOM0事件写法在IE6下GC无望
				var factory = factorys.pop();

				factory && factory.delay(node.src);

				// head.removeChild(node);

				if (callback) {

					callback();

				}

				if ( checkFail( node, false, !W3C ) ) {

					$.log( "已成功加载 " + node.src, 7 );

				}

			}

		};

		node.onerror = function() {

			checkFail( node, true );

		};

		node.src = url; //插入到head的第一个节点前，防止IE6下head标签没闭合前使用appendChild抛错

		head.insertBefore(node, head.firstChild); //chrome下第二个参数不能为null

		$.log("正准备加载 " + node.src, 7); //更重要的是IE6下可以收窄getCurrentScript的寻找范围

	}

	function loadCSS(url) {

		//通过link节点加载模块需要的CSS文件
		var id = url.replace(rmakeid, "");

		if (!DOC.getElementById(id)) {

			var node = DOC.createElement("link");

			node.rel = "stylesheet";

			node.href = url;

			node.id = id;

			head.insertBefore(node, head.firstChild);

		}

	}

	/**
	 * 请求模块
	 * @param {String|Array} list 依赖列表
	 * @param {Function} factory 模块工厂
	 * @param {String} parent ? 父路径，没有使用种子模块的根路径或配置项
	 * @api public
	 */
	$.require = function(list, factory, parent) {

		// 用于检测它的依赖是否都为2
		var deps = {},

			// 用于保存依赖模块的返回值
			args = [],

			// 需要安装的模块数
			dn = 0,

			// 已安装完的模块数
			cn = 0,

			id = parent || "callback" + setTimeout("1"),url;

		parent = parent || basepath;

		String(list).replace($.rword, function(el) {

			if( !!$.config.shim && $.config.shim[el] ){

				url = loadJSCSS( el, parent, $.config.shim[el] );

			}else{

				url = loadJSCSS( el, parent );

			}

			if (url) {

				dn++;

				if ( modules[url] && modules[url].state === 2 ) {

					cn++;

				}

				if (!deps[url]) {

					args.push(url);

					deps[url] = "leoUi"; //去重

				}

			}

		});

		modules[id] = { //创建一个对象,记录模块的加载情况与其他信息

			id: id,

			factory: factory,

			deps: deps,

			args: args,

			state: 1

		};

		if (dn === cn) { //如果需要安装的等于已安装好的

			!!factory && fireFactory( id, args, factory ); //安装到框架中

		} else {

			//放到检测列队中,等待checkDeps处理
			loadings.unshift(id);

		}

		checkDeps();

	};

	/**
	 * 定义模块
	 * @param {String} id ? 模块ID
	 * @param {Array} deps ? 依赖列表
	 * @param {Function} factory 模块工厂
	 * @api public
	 */
	window.define = $.define = function(id, deps, factory) { //模块名,依赖列表,模块本身

		var args = $.slice(arguments);

		if (typeof id === "string") {

			var _id = args.shift();

		}

		if (typeof args[0] === "boolean") { //用于文件合并, 在标准浏览器中跳过补丁模块

			if (args[0]) {

				return;

			}

			args.shift();

		}
		if (typeof args[0] === "function") {

			args.unshift([]);

		} //上线合并后能直接得到模块ID,否则寻找当前正在解析中的script节点的src作为模块ID
		//现在除了safari外，我们都能直接通过getCurrentScript一步到位得到当前执行的script节点，
		//safari可通过onload+delay闭包组合解决
		id = modules[id] && modules[id].state >= 1 ? _id : getCurrentScript();

		if (!modules[id] && _id) {

			modules[id] = {

				id: id,

				factory: factory,

				state: 1

			}

		}

		factory = args[1];

		factory.id = _id; //用于调试

		factory.delay = function(id) {

			args.push(id);

			if( !!modules[id] && !!modules[id].deps ){

				var isCycle = true;

				try {

					isCycle = checkCycle( modules[id].deps, id );

				} catch (e) {}

				if (isCycle) {

					$.error( id + "模块与之前的某些模块存在循环依赖" );

				}

			}

			delete factory.delay; //释放内存

			$.require.apply( null, args ); //0,1,2 --> 1,2,0

		};

		if (id) {

			factory.delay(id, args);

		} else { //先进先出

			factorys.push(factory);

		}

	};

	$.define.amd = modules;

	/**
	 * 请求模块从modules对象取得依赖列表中的各模块的返回值，执行factory, 完成模块的安装
	 * @param {String} id  模块ID
	 * @param {Array} deps 依赖列表
	 * @param {Function} factory 模块工厂
	 * @api private
	 */
	function fireFactory( id, deps, factory ) {

		for (var i = 0, array = [], d; d = deps[i++];) {

			d !== "ready" && array.push( modules[d].exports );

		}

		var module = Object( modules[id] ),ret = factory.apply( global, array );

		if( module.id.indexOf( 'callback' ) !== -1 ){

			delete modules[id];

		}else{

			if ( ret !== void 0 ) {

				module.exports = ret;

				module.state = 2;

			}else{

				$.log( "fireFactory中" + id + " 无输出", 7 );

			}

		}

		return ret;

	}

	//============================domReady机制==========================

	function fireReady() {

		modules.ready.state = 2;

		checkDeps();

		if (readyFn) {

			$.unbind( DOC, ready, readyFn );

		}

		fireReady = $.noop; //隋性函数，防止IE9二次调用_checkDeps

	}

	function doScrollCheck() {

		try { //IE下通过doScrollCheck检测DOM树是否建完

			html.doScroll("left");

			fireReady();

		} catch (e) {

			setTimeout(doScrollCheck);

		}

	};

	//在firefox3.6之前，不存在readyState属性
	//http://www.cnblogs.com/rubylouvre/archive/2012/12/18/2822912.html
	if (!DOC.readyState) {

		var readyState = DOC.readyState = DOC.body ? "complete" : "loading";

	}

	if ( DOC.readyState === "complete" ) {

		fireReady(); //如果在domReady之外加载

	} else {

		$.bind(DOC, ready, readyFn = function() {

			if ( W3C || DOC.readyState === "complete" ) {

				fireReady();

				if (readyState) { //IE下不能改写DOC.readyState

					DOC.readyState = "complete";

				}

			}

		});

		if (html.doScroll) {

			try { //如果跨域会报错，那时肯定证明是存在两个窗口

				if ( self.eval === parent.eval ) {

					doScrollCheck();

				}

			} catch (e) {

				doScrollCheck();

			}

		}

	}

	init();

	global.leoUiLoad = global.$ = $;

})( window, document );