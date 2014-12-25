/**
 *
 * @authors leo
 * @date    2014-11-13 09:49:36
 * @version 1.0
 */

var zNodes = [{
	name: "leoUi文档",
	open: true,
	url: '#!leo#iframe/leoUi-index.html',
	children: [{
			name: "leoUiLoad模块加载器",
			url: '#!leo#iframe/leoUiLoad.html'
		}, {
			name: "leoPlugIn创建jQuery组件",
			url: '#!leo#iframe/leoPlugIn.html'
		}, {
			name: "leoMouse鼠标拖拽基础组件",
			url: '#!leo#iframe/leoMouse.html'
		}, {
			name: "leoDraggable拖拽组件",
			url: '#!leo#iframe/leoDraggable.html'
		}, {
			name: "leoResizable缩放组件",
			url: '#!leo#iframe/leoResizable.html'
		}, {
			name: "leoDroppable拖放组件",
			url: '#!leo#iframe/leoDroppable.html'
		}, {
			name: "leoSelectable选择组件",
			url: '#!leo#iframe/leoSelectable.html'
		}, {
			name: "leoDialog对话框组件",
			url: '#!leo#iframe/leoDialog.html'
		}, {
			name: "leoTooltip提示框组件",
			url: '#!leo#iframe/leoTooltip.html'
		}, {
			name: "leoTree树形组件",
			url: '#!leo#iframe/leoTree.html'
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