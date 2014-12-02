/**
 *
 * @authors leo
 * @date    2014-11-13 09:49:36
 * @version 1.0
 */

var zNodes = [{
	name: "leoUi文档",
	open: true,
	url: {href: '#!leo#iframe/leoUi-index.html'},
	children: [{
			name: "leoUiLoad模块加载器",
			url: {href: '#!leo#iframe/leoUiLoad.html'}
		}, {
			name: "leoPlugIn创建jQuery插件",
			url: {href: '#!leo#iframe/leoPlugIn.html'}
		}, {
			name: "leoMouse鼠标拖拽基础插件",
			url: {href: '#!leo#iframe/leoMouse.html'}
		}, {
			name: "leoDraggable拖拽组件",
			url: {href: '#!leo#iframe/leoDraggable.html'}
		}]
	}],reHref = /.*#!leo#/;

$('#navigation').leoTree({

    treeJson:zNodes,

    isDblclick: false,

    clickNodeCallBack:function(event){

    	event.preventDefault();

    	var $this = $(this),href = $this.attr('href'),

    	$iframe = $('#archives');

    	if(!!href && (href = href.replace(reHref, ''))){

    		$iframe.attr('src', href);

    	}

    }

});