leoUi
=====
基于jquery的框架，其中包括：

leoUiLoad.js：模块加载，具有readyDom功能，根据习惯可能写成$(function($)())形式，具有level调试功能等

leoUiLoadCombo.js：合并工具可以直接在 cmd 中运行命令：node build（nodejs）

leoUi-tools.js：核心，统一创建jQuery插件写法，可继承，自动事件命名，事件屏蔽，改写选项等功能

leoUi-mouse.js：基于鼠标交互，是很多关于鼠标的交互的父类

leoUi-draggable.js：拖拽，可以适应各种位置，可无限嵌套，拖拽不变形，api全面

leoUi-resizable.js：缩放，可无限嵌套，api全面），leoUi-dialog.js(弹出框，支持各种动画效果，有最大化，最小化，拖拽，缩放，固定等功能按键

leoUi-droppable.js：投掷插件，支持多种类型的碰撞检测

leoUi-position.js：位置，在jqueryUI的基础上按照自己的需求增加了API，修复了getDimensions()中没加上borderWidth

leoUi-selectable.js：选择插件 基本和jqueryUi相同使用自己的核心插件生成

leoUi-tooltip.js：提示框，可自动调节位置，是提示框始终在屏幕内，

leoUi-Effects.js：jqueryUi特效，修改一些需求,

leoUI-tree.js：树形插件（自动折叠，拖放,多选等）

leoUi-iframeMessage.js：iframe直接通向工具

leoUi-select.js：原生select模拟

leoUi-grid.js：表格插件（支持各种定制）

leoUi-imagePlayer.js: 轮播图插件(全屏，自动缩放，自调轮播个数等)

leoUi-tabs.js:tab插件（支持拖拽，滚动等）

leoUi--upload.js：支持html5、ajax2上传插件

leoUi--datetimepicker.js:时间插件（支持小时到百年选择等）

leoUi-grid-2.0.js：表格插件（2.0版本）把数据层抽出来--leoUi--dataAdapter(数据适配器)，新增虚拟滚动，支持大数据单页显示