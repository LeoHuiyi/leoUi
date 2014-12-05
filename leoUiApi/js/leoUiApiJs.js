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
			name: "leoPlugIn创建jQuery组件",
			url: {href: '#!leo#iframe/leoPlugIn.html'}
		}, {
			name: "leoMouse鼠标拖拽基础组件",
			url: {href: '#!leo#iframe/leoMouse.html'}
		}, {
			name: "leoDraggable拖拽组件",
			url: {href: '#!leo#iframe/leoDraggable.html'}
		}, {
			name: "leoResizable缩放组件",
			url: {href: '#!leo#iframe/leoResizable.html'}
		}, {
			name: "leoDroppable缩放组件",
			url: {href: '#!leo#iframe/leoDroppable.html'}
		}, {
			name: "leoDialog对话框组件",
			url: {href: '#!leo#iframe/leoDialog.html'}
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