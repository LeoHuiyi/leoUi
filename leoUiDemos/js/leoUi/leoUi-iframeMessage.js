/**
+-------------------------------------------------------------------
* jQuery leoUi--iframeMessage
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

	var count = 0,timer,callback,userAgent = navigator.userAgent,

	isHack =  userAgent.indexOf("MSIE 8.0") > 0 || userAgent.indexOf("MSIE 9.0") > 0 || !window.postMessage,hack = '__leoUIiframeMessageHack__';

	/**
	 * query to json
	 * @param {Object} QS
	 * @param {Object} isDecode
	 */
	function queryToJson( QS, isDecode ) {

		var _fData = function(data) {

			if (isDecode) {

				return decodeURIComponent(data);

			} else {

				return data;

			}

		};

		if( QS.indexOf(hack) >= 0 ){

			return JSON.parse( _fData( QS.replace( hack, '' ) ) );

		}else{

			return QS;

		}


	}

	function jsonToQuery(json, isEncode) {

		var _fdata = function(data) {

			data = data === null ? '' : data;

			data = $.trim(data);

			if (isEncode) {

				return encodeURIComponent(data);

			} else {

				return data;

			}

		};

		if (typeof json === "object") {

			if(isHack){

				return _fdata( hack + JSON.stringify(json) );

			}else{

				return json;

			}

		}else{

			return ""

		}

	}

	/**
	 * 初始化监听程序
	 */
	var init = function() {

		if(window.postMessage) {

			$(window).on('message.leoUi',messageHanlder)

		}else{

			messagePoll(window, "name");

		};

	};

	/**
	 * window.name监听方式
	 * @param {Object} oWindow
	 * @param {Object} sName
	 */
	var messagePoll = function(oWindow, sName) {

		var hash = "";

		/**
		 * 处理处理
		 * @param {Object} name	返回的window.name
		 */
		function parseData(name) {

			var oData = name.split("^").pop().split("&");

			return {

				domain: oData[0], //域名

				data: window.unescape(oData[1]) //数据

			}

		}
		/**
		 * 获取window.name
		 */
		function getWinName() {

			var name = oWindow[sName]; //=window.name

			//如果和上次不一样，则获取新数据
			if (name != hash) {

				hash = name;

				messageHanlder(parseData(name));

			}

		}

		timer = setInterval(getWinName, 1000 / 20);

	};

	/**
	 * 消息监听函数
	 * @param {Object} event 监听到的数据对象
	 */
	var messageHanlder = function(event) {

		var data = event.originalEvent.data;

		isHack && ( data = queryToJson( unescape(data) ) );

		//执行回调
		callback && callback(data);

	};

	init();


	/*---------------------------公开函数------------------------------*/

	var XD = {};
	/**
	 * 发送跨域消息
	 * @param {Object} target	//iframe或parent，如果为iframe，则需要传iframe.contentWindow对象
	 * @param {Object} oArgs
	 */
	XD.sendMessage = function(target, oArgs) {

		if (!target) return;

		if (typeof target != 'object') return;

		var data = jsonToQuery(oArgs);

		isHack && ( data = escape(data) );

		if (window.postMessage) {

			// 此处一定要用“*”，否则数据不能返回，参考：http://dev.w3.org/html5/postmsg/#dom-window-postmessage
			target.postMessage(data, "*");

		} else {

			target.name = (new Date()).getTime() + (count++) + "^" + document.domain + "&" + window.escape(data);

		}

	};

	/**
	 * 接收跨域传递的消息，只需开发者重写即可
	 * @param {Object} data json数据
	 */
	XD.receiveMessage = function(oCallback) {

		callback = oCallback;

	};

	XD.destroy = function(){

		if (window.postMessage) {

			$(window).off('message.leoUi',messageHanlder)

		} else {

			clearInterval(timer);

		};

	}

	return XD;

}));