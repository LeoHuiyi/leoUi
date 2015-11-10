/**
+-------------------------------------------------------------------
* jQuery leoUi--tree
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
*
* 使用treeJon配合Id 提高速度！
*
* checkState:0(无)，1(半选)，2(全选)
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools","leoUi-droppable"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoTree',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            disabled:false,//如果设置为true将禁止缩放

            treeJson:false,//tree的jsan(格式见例子)

            dataType:'data',//ajax,data

            ajax:{

                url:'leoui.com',

                type: 'GET',

                dataType:'json',

                teamsKey:'teams'//总数据(为false时直接用data)

            },//是否用ajax调出数据

            isIcon:true,//是否展现图标

            isDblclick:true,//是否双击打开关闭菜单

            hoverOpenClose:false,//通过鼠标悬浮收起菜单

            autoCollapse:false,//自动折叠的功能

            ajaxMegCallback:$.noop,//ajax信息回调

            arrowSrc: '../../img/arrow.png',//箭头图标src

            key:{

                children:'children',

                name:'name',

                url:'url',

                target:'target',

                checked:'checked',

                title:true

            },//json的key

            check:{

                enable:false,

                checkType:'checkbox'

            },

            isSimpleData:{

                enable: false,

                idKey:'id',

                pidKey:'pId',

                rootPId:0

            },//是否启用简单的json数据

            dragAndDrop:false,//是否能拖放

            clickNodeCallBack: false//点击节点回调

        },

        _init:function(){

            this._getData();

        },

        _createTree:function(){

            var op = this.options;

            if( $.type(op.treeJson) !== "array" ){

                return;

            }

            this.expando = "leoTree_" + ( this.version + Math.random() ).replace( /\D/g, "" );

            this._ohasOwn = Object.prototype.hasOwnProperty;

            this._markTree();

            this._addEvent();

            op.dragAndDrop === true && this._setDraggable();

        },

        _createLoading:function(){

            !this.$loading && (this.$loading = $('<div class="leoTree_loading" style="display: none;">读取中...</div>').appendTo(this.$target).show());

        },

        _destroyLoading:function(){

            if(this.$loading){

                this.$loading.remove();

                this.$loading = null;

            }

        },

        _getData:function(){

            var op = this.options,ajax = op.ajax,This = this,

            teamsKey,dataType = op.dataType;

            if( dataType === 'ajax' ){

                this._createLoading();

                teamsKey = ajax.teamsKey;

                $.ajax(ajax).done(function(data){

                    console.log(data)

                    This._destroyLoading();

                    op.ajaxMegCallback(data, "done");

                    teamsKey === false ? op.treeJson = data : op.treeJson = data[teamsKey];

                    This._createTree();

                }).fail(function(data){

                    op.ajaxMegCallback(data, "fail");

                });

            }else if( dataType === 'data' ){

                this._createTree();

            }

        },

        _setOption:function( key, value ){

            if( key === 'hoverOpenClose' ){

                this._treeHoverEvent();

            }

        },

        _setDraggable:function(){

            var This = this,dragId,dropJson,$body = this.document.find('body'),

            treeDragIsOpen = false,ul,inner,

            $tree,zIndex = (this.$target.css('zIndex') >> 0) + 1;

            $tree = this.$tree.leoDraggable({

                mouseDownSelector:'.leoTree_inner',

                cancel:'.leoTree_icon_triangle',

                distance:4,

                cursor:'pointer',

                droppableScope:'leoTree',

                bClone: true,

                revert: false,

                revertAnimate: true,

                bCloneAnimate: true,

                dragBoxReturnToTarget: true,

                useLeoDroppable: true,

                cursorAt:{top:4,left:4},

                stopMouseWheel: false,

                proxy: function(source) {

                    dragId = This.dragId = This._getTreeId( source.id, 'inner' );

                    var $source = $(source);

                    return $source.clone().addClass('leoTree_active').removeAttr('id').css( { width: $source.outerWidth(), position: 'absolute', zIndex: zIndex } ).appendTo($body);

                },

                onStartDrag: function( e, drag ) {

                    dropJson = This.treeJson[dragId];

                    inner = This._getTreeNode( dragId, 'inner' );

                    ul = This._getTreeNode( dragId, 'ul' );

                    if( dropJson.open === true ){

                        This._treeNodeClose( inner, ul, dropJson, function(){

                            $tree.leoDraggable('setDropsProp');

                        } );

                        treeDragIsOpen = true;

                    }else{

                        treeDragIsOpen = false;

                    }

                    This._createArrow();

                    This.enterFlag = 0;

                },

                onBeforeStopDrag: function() {

                    if( treeDragIsOpen === true && dropJson.open === false ){

                        This._treeNodeOpen( inner, ul, dropJson );

                    }

                    This._destroyArrow();

                    This.innerHoverDisabled = false;

                }

            });

            this._setDroppable( $tree.find('div.leoTree_node') );

        },

        _setDroppable:function( $dropDivs ){

            var This = this,nameDiv = 'div',distance = 4,

            id,arrowTop,arrowLeft,dropId,inner,arrowBottom,

            isNotDropNode,ul,dropJson,delayTime,

            $tree = this.$tree;

            !!this.$dropDivs && this.$dropDivs.leoDroppable('destroy');

            this.$dropDivs = $dropDivs.leoDroppable({

                tolerance:'pointer',

                scope:'leoTree',

                onDragEnter: function( e, drop, drag ) {

                    id = this.id;

                    arrowTop = drop.top;

                    arrowLeft = drop.left;

                    arrowBottom = drop.bottom;

                    dropId = This._getTreeId( id, nameDiv );

                    inner = This._getTreeNode( dropId, 'inner' );

                    ul = This._getTreeNode( dropId, 'ul' );

                    dropJson = This.treeJson[dropId];

                    isNotDropNode = This._isNotDropNode( dropId, This.dragId );

                },

                onDragOver: function( event, drop, drag ) {

                    if( isNotDropNode === true ){ return; }

                    !This.innerHoverDisabled && ( This.innerHoverDisabled = true );

                    !!This.$arrow && This.$arrow.show();

                    if( event.pageY <= arrowTop + distance && This.enterFlag !== 1 ){

                        !!delayTime && clearTimeout( delayTime );

                        !!This.$arrow && This.$arrow.css( { top: arrowTop, left: arrowLeft } );

                        This.enterFlag = 1;

                        This._removeHoverClass(inner);

                    }else if( event.pageY >= arrowBottom - distance && This.enterFlag !== 2 ){

                        !!delayTime && clearTimeout( delayTime );

                        !!This.$arrow && This.$arrow.css( { top: arrowBottom, left: arrowLeft } );

                        This.enterFlag = 2;

                        This._removeHoverClass(inner);

                    }else if( event.pageY < arrowBottom - distance && event.pageY > arrowTop + distance  && This.enterFlag !== 3 ){

                        !!This.$arrow && This.$arrow.css( { top: ( arrowTop + arrowBottom )/2, left: arrowLeft } );

                        This.enterFlag = 3;

                        !!delayTime && clearTimeout( delayTime );

                        delayTime = setTimeout( function(){

                            if( !!dropJson.children && dropJson.open === false ){

                                This._treeNodeOpen( inner, ul, dropJson, function(){

                                    $tree.leoDraggable('setDropsProp');

                                } );

                            }

                            delayTime = null;

                        }, 400 );

                        This._addHoverClass(inner);

                    }

                },

                onDragLeave: function( e, drop, drag ) {

                    This.enterFlag = 0;

                    !!delayTime && clearTimeout( delayTime );

                    This._removeHoverClass( This._getTreeNode( this.id, 'div', 'inner' ) );

                    !!This.$arrow && This.$arrow.hide();

                },

                onDrop: function( e, drop, darg ) {

                    !!delayTime && clearTimeout( delayTime );

                    if( isNotDropNode === true ){ return }

                    This._treeDrop(dropId);

                    return true;

                }

            });

        },

        _isNotDropNode:function( dropId, dragId ){

            if( dragId === dropId ){ return true; }

            var treeJson = this.treeJson,

            parentId = treeJson[dropId].parentId;

            while(parentId){

                if( parentId === dragId ){

                    return true;

                }

                parentId = treeJson[parentId].parentId;

            }

            return false;

        },

        _treeDrop:function(dropId){

            var dragId = this.dragId;

            switch( this.enterFlag ){

                case 1:

                    this._treeNodeInsertBefore( dragId, dropId );

                    break;

                case 2:

                    this._treeNodeInsertAfter( dragId, dropId );

                    break;

                case 3:

                    this._treeNodeAppendTo( dragId, dropId );

                    break;

                default:

                    return false;

            }

        },

        _treeNodeInsertAfter:function( dragId, dropId ){

            var dropLi = this._getTreeNode( dropId, 'li' ),

            dragLi = this._getTreeNode( dragId, 'li' );

            $(dropLi).after(dragLi);

            this._treeJsonAppendTo( dragId, this.treeJson[dropId].parentId );

        },

        _treeNodeInsertBefore:function( dragId, dropId ){

            var dropLi = this._getTreeNode( dropId, 'li' ),

            dragLi = this._getTreeNode( dragId, 'li' );

            $(dropLi).before(dragLi);

            this._treeJsonAppendTo( dragId, this.treeJson[dropId].parentId );

        },

        _treeNodeAppendTo:function( dragId, dropId ){

            var Child = this._getTreeNode( dropId, 'ul' );

            if( Child ){

                $( this._getTreeNode( dragId, 'li' ) ).appendTo(Child);

                this._treeJsonAppendTo( dragId, dropId );

            }else{

                var dropLi = this._getTreeNode( dropId, 'li' ),

                dragLi = this._getTreeNode( dragId, 'li' );

                this._treeLiToChild( dropId, dropLi, dragLi );

                this._treeJsonAppendTo( dragId, dropId );

            }

        },

        _treeLiToChild:function( dropId, dropLi, dragLi ){

            var liJson = this.treeJson[dropId],level = liJson.level;

            liJson.switchId = this._setTreeNodeId( dropId, 'switch', level, true );

            liJson.ulId = this._setTreeNodeId( dropId, 'ul', level, true );

            liJson.open = true;

            $(dropLi).attr( 'class', 'leoTree_parent' ).append( this._createUlStr( liJson.ulId, liJson.open, true ) ).children('ul').append(dragLi).end().children('div').empty().append( this._createDivStr( liJson, true, true ) );

        },

        _treeJsonAppendTo:function( dragId, dropId ){

            var parentId,parentJson,treeJson,oldParentId;

            if( ( parentId = this._getTreeNodeId( dragId, 'parent') ) !== dropId ){

                treeJson = this.treeJson;

                !treeJson[dropId].children && ( treeJson[dropId].children = [] );

                this._deleteLevel(treeJson[dragId].level, dragId);

                treeJson[dragId].level = this._getLevel( dropId ) + 1;

                this._addLevel(treeJson[dragId].level, dragId);

                oldParentId = treeJson[dragId].parentId;

                treeJson[dragId].parentId = dropId;

                treeJson[dropId].children.push( treeJson[dragId] );

                this._removeChildId( parentId, dragId );

                if( $.isEmptyObject( treeJson[parentId].children ) ){

                    parentJson = treeJson[parentId];

                    parentJson.children = null;

                    parentJson.open = null;

                    parentJson.UlId = null;

                    parentJson.switchId = null;

                    $(this._getTreeNode( parentId, 'li' )).attr( 'class', 'leoTree_item' ).children('div').empty().append(  this._createDivStr( parentJson, false, true ) ).end().children('ul').remove();

                }

                this._checkboxRefreshParentsChecked(dropId);

                this._checkboxRefreshParentsChecked(oldParentId);

            }

        },

        _removeChildId:function( parentId, childId ){

            var childrens = this.treeJson[parentId].children,

            i = childrens.length;

            while( i-- ){

                if( childrens[ i ].id === childId ){

                    childrens.splice( i, 1 );

                    break;

                }

            }

        },

        _deleteLevel:function(level, id){

            var levels = this.treeJson['level_' + level],i;

            if(levels){

                i = levels.length;

                while( i-- ){

                if( levels[ i ] === id ){

                        levels.splice( i, 1 );

                        break;

                    }

                }

            }

        },

        _addLevel:function(level, id){

            var levels = this.treeJson['level_' + level];

            !levels && (levels = this.treeJson['level_' + level] = []);

            levels.push(id);

        },

        _createArrow:function(){

            !this.$arrow && ( this.$arrow = $("<div class='leoTree_arrow'><img src = '"+this.options.arrowSrc+"' /></div>").hide().appendTo('body') );

        },

        _destroyArrow:function(){

            if(this.$arrow){

                this.$arrow.remove();

                this.$arrow = null;

            }

        },

        _setTreeId:function(id){

            return this.expando + '_id_' + id;

        },

        _getTreeId:function( id, name ){

            return id.slice( 0, id.indexOf( '_' + name ) );

        },

        _getNodeTreeJson:function( id, name ){

            return this.treeJson[id.slice( 0, id.indexOf( '_' + name ) )] || {};

        },

        _getNodeTreeData:function( id, name ){

            return this._getNodeTreeJson( id, name ).data || {};

        },

        _setTreeNodeId:function( id, name, level, flag ){

            if( flag === true ){

                return id + '_' + name + '_level_' + level;

            }else{

                return this.expando + '_id_' + id + '_' + name + '_level_' + level;

            }

        },

        _getTreeNodeId:function( id, setName, getName ){

            if( getName ){

                return id.replace( setName, getName );

            }else if(this.treeJson[id]){

                return this.treeJson[id][ setName + 'Id' ];

            }

        },

        _getTreeNode:function( id, setName, getName ){

            return this.document[0].getElementById( this._getTreeNodeId( id, setName, getName ) );

        },

        _getLevel:function( id ){

            return this.treeJson[id].level;

        },

        _hasChild:function (id) {

            return !!this.treeJson[id].children;

        },

        _markNodeTree:function( treeJson, isChild, level, parentId ){

            var i = 0,length,child,id,treeId,rootId,op = this.options,childHtml,

            key = op.key,children = key.children,treeData,childData,html = '';

            if( !isChild ){

                this.treeJson = {};

                level = 0;

                this.nodeTreeId = 0;

                id = this.nodeTreeId++;

                treeId = this._setTreeId( id );

                rootId = this._setTreeNodeId( id, 'root', level );

                this.treeJson[treeId] = { level: level, rootId: rootId };

                html += '<ul id="' + rootId + '" class="leoTree_list leoUi_helper_reset">';

                parentId = treeId;

                treeJson = treeJson || $.extend(true, [], op.treeJson);

            }

            level += 1;

            treeData = this.treeJson;

            !treeData[ 'level_'+level ] && ( treeData[ 'level_'+level ] = [] );

            length = treeJson.length;

            while( i < length ){

                if((child = treeJson[i++])){

                    id = this.nodeTreeId++;

                    treeId = this._setTreeId(id);

                    if( child[children] ){

                        childData = this._setTreeJson(id, treeId, parentId, level, child, true);

                        childHtml = this._markNodeTree( child[children], true, level, treeId );

                        this._checkboxSetTreeProp(child, childData, id, parentId, level, true);

                        html += this._createTreeNodeHtml(childData, childHtml);

                    }else{

                        childData = this._setTreeJson(id, treeId, parentId, level, child);

                        this._checkboxSetTreeProp(child, childData, id, parentId, level, false);

                        html += this._createTreeNodeHtml(childData);

                    }

                    !treeData[parentId].children && ( treeData[parentId].children = [] );

                    treeData[parentId].children.push( childData );

                }

            }

            !isChild && (html += '</ul>');

            return html;

        },

        _setTreeJson:function(id, treeId, parentId, level, data, isChild){

            var treeData = this.treeJson,childData;

            childData = treeData[treeId] = {data: this._dataMin({}, data)};

            childData.id = treeId;

            childData.level = level;

            childData.liId = this._setTreeNodeId( id, 'li', level );

            !!isChild && (childData.ulId = this._setTreeNodeId( id, 'ul', level ));

            childData.innerId = this._setTreeNodeId( id, 'inner', level );

            !!isChild && (childData.switchId = this._setTreeNodeId( id, 'switch', level ));

            childData.divId = this._setTreeNodeId( id, 'div', level );

            childData.aId = this._setTreeNodeId( id, 'a', level );

            childData.parentId = parentId;

            childData.open = !!data.open;

            treeData[ 'level_' + level ].push(treeId);

            this._setTreeJsonProp(data, childData);

            return childData;

        },

        _checkboxSetTreeProp:function(data, childData, id, parentId, level, isChild){

            var op = this.options, check = op.check, childLen,

            isCheck = !!check.enable,checkKey,

            checkType = check.checkType,checkbox;

            if(isCheck && checkType === 'checkbox'){

                checkKey = op.key.checked;

                childData.checkId = this._setTreeNodeId( id, 'check', level );

                !(checkbox = childData.checkbox) && (checkbox = childData.checkbox = {

                    childCheckedLen: 0

                });

                if(!isChild){

                    if(data[checkKey]){

                        checkbox.state = 2;

                        this._checkboxSetParentChildLen(parentId, 1);

                    }else{

                        checkbox.state = 0;

                        this._checkboxSetParentChildLen(parentId, 0);

                    }

                }else{

                    childLen = childData.children.length;

                    if(checkbox.childCheckedLen === childLen){

                        checkbox.state = 2;

                        this._checkboxSetParentChildLen(parentId, 1);

                    }else if(checkbox.childCheckedLen > 0){

                        checkbox.state = 1;

                        this._checkboxSetParentChildLen(parentId, 0.5);

                    }else{

                        checkbox.state = 0;

                        this._checkboxSetParentChildLen(parentId, 0);

                    }

                }

            }

        },

        _checkboxSetParentChildLen:function(parentId, num){

            var parentCheckbox;

            !(parentCheckbox = this.treeJson[parentId].checkbox) && (parentCheckbox = this.treeJson[parentId].checkbox = {});

            parentCheckbox.childCheckedLen === undefined ? parentCheckbox.childCheckedLen = +num : parentCheckbox.childCheckedLen += +num;

        },

        _setTreeJsonProp:function(data, childData){

            var key = this.options.key,prop,val,_ohasOwn = this._ohasOwn;

            for(prop in key){

                if(_ohasOwn.call(key, prop) && prop !== 'children'){

                    if(!!(val = data[key[prop]])){

                        childData[prop] = val;

                    }else if(prop === 'title' && key[prop] === true){

                        childData[prop] = true;

                    }

                }

            }

        },

        _dataMin:function(receiver, supplier, deep){

            var hasOwn = this._ohasOwn,key,copy,target,copyIsArray,

            isPlainObject = $.isPlainObject,isArray = $.isArray,clone,

            children = this.options.key.children;

            if(receiver === supplier){

                return receiver;

            }

            for (key in supplier) {

                if (hasOwn.call(supplier, key) && (key !== children)) {

                    copy = supplier[key];

                    target = receiver[key];

                    if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {

                        if ( copyIsArray ) {

                            copyIsArray = false;

                            clone = target && isArray(target) ? target : [];

                        } else {

                            clone = target && isPlainObject(target) ? target : {};

                        }

                        receiver[key] = this._dataMin(clone, copy, deep);

                    }else if( copy !== undefined ){

                        receiver[key] = copy;

                    }

                }

            }

            return receiver;

        },

        _changeSimpleTreeJson:function(){

            var op = this.options,i = 0,

            simpleDatas = $.extend(true, [], op.treeJson),treeJson = [],

            length = simpleDatas.length,simpleData,isSimpleData = op.isSimpleData,

            id = isSimpleData.idKey,pid = isSimpleData.pidKey,children = op.key.children,

            rootPId = isSimpleData.rootPId;

            while( i < length ){

                simpleData = simpleDatas[i++];

                if( + simpleData[pid] === + rootPId ){

                    treeJson.push( simpleData );

                }

            }

            return ( function treeChild( json, data ){

                var i = 0,jsonLen = json.length,dataLen = data.length,

                jsonData,jsonId,dataData,j;

                while( i < jsonLen ){

                    j = 0;

                    jsonData = json[i++];

                    jsonId = + jsonData[id];

                    while( j < dataLen ){

                        dataData = data[j++];

                        if( + dataData[pid] === jsonId ){

                            !jsonData[children] && ( jsonData[children] = [] );

                            jsonData[children].push( dataData );

                        }

                    }

                    if( jsonData[children] ){

                        treeChild( jsonData[children], data );

                    }

                }

                return json;

            }( treeJson, simpleDatas ) );

        },

        _markTree:function(){

            this.$tree = $( this._markNodeTree( this.options.isSimpleData.enable === true && this._changeSimpleTreeJson() ) ).appendTo( this.$target );

        },

        _createUlStr:function( id, isOpen, end ){

            var str = '';

            if(isOpen){

                str += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: block;">';

                !!end && (str += '</ul>');

            }else{

                str += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: none;">';

                !!end && (str += '</ul>');

            }

            return str;

        },

        _createLiStr:function( id, isChild ){

            if(isChild){

                return '<li id="' + id + '" class="leoTree_parent">';

            }else{

                return '<li id="' + id + '" class="leoTree_item">';

            }

        },

        _createTreeNodeHtml:function(childData, childHtml){

            var str = '';

            if(childHtml){

                str += this._createLiStr( childData.liId, true );

                str += this._createDivStr( childData, true );

                str += this._createUlStr( childData.ulId, childData.open );

                str += childHtml;

                str += '</ul></li>';

            }else{

                str += this._createLiStr( childData.liId ,false );

                str += this._createDivStr( childData, false );

                str += '</li>';

            }

            return str;

        },

        _createDivStr:function( child, isChild, notWrap ){

            var str = '';

            str += this._wrapDivHtml(child, notWrap);

            str += this._innerDivHtml(child, isChild);

            str += this._wrapDivHtml(child, notWrap, true);

            return str;

        },

        _wrapDivHtml:function(child, notWrap, isEnd){

            var str = '';

            if(!notWrap){

                !isEnd ? str +='<div id="' + child.divId + '" class="leoTree_node">' : str +='</div>';

            }

            return str;

        },

        _innerDivHtml:function(child, isChild){

            var str = '',isIcon = this.options.isIcon;

            if( isChild ){

                if( child.isOpen ){

                    str += '<span id="' + child.innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix leoTree_inner_open"><span id="' + child.switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    str += this._checkboxHtml(child);

                    !!isIcon && ( str += this._iconHtml(isChild) );


                }else{

                    str += '<span id="' + child.innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix leoTree_inner_close"><span id="' + child.switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    str += this._checkboxHtml(child);

                    !!isIcon && ( str += this._iconHtml(isChild) );

                }

            }else{

                str += '<span id="' + child.innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix">';

                str += this._checkboxHtml(child);

                !!isIcon && ( str += this._iconHtml(isChild) );

            }

            str += this._aHtml(child);

            str += '</span>';

            return str;

        },

        _checkboxHtml:function(child){

            if(!child.checkId){

                return '';

            }

            var state = child.checkbox.state,

            str = '<div id="'+ child.checkId +'" class="leoTree_checkbox">';

            if(state === 2){

                str += '<div class="leoTree_checkbox_box leoTree_checkbox_active">';

                str += '<span class="leoTree_checkbox_icon leoTree_checkbox_check"></span>';

            }else if(state === 1){

                str += '<div class="leoTree_checkbox_box leoTree_checkbox_active">';

                str += '<span class="leoTree_checkbox_icon leoTree_checkbox_halfCheck"></span>';

            }else if(state === 0){

                str += '<div class="leoTree_checkbox_box">';

                str += '<span></span>';

            }

            str += '</div></div>';

            return str;

        },

        _iconHtml:function(isChild){

            if(isChild){

                return '<span class="leoTree_icon leoTree_icon_folder"></span>';

            }else{

                return '<span class="leoTree_icon leoTree_icon_document"></span>';

            }

        },

        _aHtml:function(child){

            var str = '',name = child.name,aId = child.aId,

            url = child.url,target,title = child.title;

            if( url ){

                if((target = child.target)){

                    str += '<a id="' + aId + '" href="' + url + '" target = "' + target + '" class="leoTree_dblclick_a"';

                }else{

                    str += '<a id="' + aId + '" href="' + url + '" class="leoTree_dblclick_a"';

                }

            }else{

                str += '<a id="' + aId + '" class="leoTree_dblclick_a"';

            }

            if(title === true){

                str += 'title="' + name + '" >';

            }else if(title){

                str += 'title="' + title + '" >';

            }else{

                str += '>';

            }

            str += '<span>' + name + '</span></a>';

            return str;

        },

        _addEvent:function(){

            var This = this,$tree = this.$tree;

            this._on( $tree, 'mouseenter.hover', '.leoTree_inner', function(event){

                event.stopPropagation();

                if( This.innerHoverDisabled === true ){ return };

                This._addHoverClass(this);

            });

            this._on( $tree, 'mouseleave.hover', '.leoTree_inner', function(event){

                event.stopPropagation();

                if( This.innerHoverDisabled === true ){ return; }

                This._removeHoverClass(this);

            });

            this._on( $tree, 'click.switch', '.leoTree_icon_triangle', function(event){

                event.stopPropagation();

                This._treeNodeOpenOrClose( this, 'switch' );

            });

            this._on( $tree, 'click.active', '.leoTree_inner', function(event){

                event.stopPropagation();

                This._treeNodeActive(this);

            });

            this._treeSwitchClickEvent();

            this._treeHoverEvent();

            this._addCheckboxEvent();

        },

        _addCheckboxEvent:function(){

            if(this.options.check.enable === true && this.options.check.checkType === 'checkbox'){

                var $tree = this.$tree,This = this;

                this._on( $tree, 'mouseenter.CheckboxHover', '.leoTree_checkbox_box', function(event){

                    $(this).addClass('leoTree_checkbox_hover');

                });

                this._on( $tree, 'mouseleave.CheckboxHover', '.leoTree_checkbox_box', function(event){

                    $(this).removeClass('leoTree_checkbox_hover');

                });

                this._on( $tree, 'click.CheckboxHover', '.leoTree_checkbox', function(event){

                    event.stopPropagation();

                    This._checkboxChick(this);

                });

            }

        },

        _checkboxChick:function(elem){

            if(this.options.check.enable === true && this.options.check.checkType === 'checkbox'){

                var nodeTreeJson = this._getNodeTreeJson(elem.id, 'check');

                if(nodeTreeJson.checkbox.state === 0){

                    this._checkboxFindChildsChecked(nodeTreeJson.children, 2);

                    this._checkboxFindParentsChecked(nodeTreeJson, 2);

                    this._checkboxSelfChecked(nodeTreeJson, 2);

                }else{

                    this._checkboxFindChildsChecked(nodeTreeJson.children, 0);

                    this._checkboxFindParentsChecked(nodeTreeJson, 0);

                    this._checkboxSelfChecked(nodeTreeJson, 0);

                }

            }

        },

        _checkboxSelfChecked:function(childsJson, state){

            this._checkboxSetState(childsJson, state);

            this._checkboxSetChildsJson(childsJson, state);

        },

        _checkboxRefreshParentsChecked:function(id){

            if(this.options.check.enable === true && this.options.check.checkType === 'checkbox'){

                var nodeTreeJson, childsJson, checkbox,i;

                if((nodeTreeJson = this.treeJson[id])){

                    childsJson =  nodeTreeJson.children;

                    checkbox = nodeTreeJson.checkbox;

                    if(childsJson){

                        i = childsJson.length;

                        checkbox.childCheckedLen = 0;

                        while(i--){

                            checkbox.childCheckedLen += childsJson[i].checkbox.state/2;

                        }

                        this._checkboxSetParentState(nodeTreeJson);

                    }

                }

            }

        },

        _checkboxFindParentsChecked:function(nodeTreeJson, state){

            if(!nodeTreeJson.parentId){return;}

            var oldeState = nodeTreeJson.checkbox.state,

            parentJson = this.treeJson[nodeTreeJson.parentId],

            parentCheckbox = parentJson.checkbox;

            parentCheckbox.childCheckedLen += (state - oldeState)/2;

            this._checkboxSetParentState(parentJson);

        },

        _checkboxSetParentState:function(parentJson){

            var checkbox = parentJson.checkbox;

            if(checkbox.childCheckedLen === parentJson.children.length){

                this._checkboxSetState(parentJson, 2);

                this._checkboxFindParentsChecked(parentJson, 2);

                checkbox.state = 2;

            }else if(checkbox.childCheckedLen > 0){

                this._checkboxSetState(parentJson, 1);

                this._checkboxFindParentsChecked(parentJson, 1);

                checkbox.state = 1;

            }else{

                this._checkboxSetState(parentJson, 0);

                this._checkboxFindParentsChecked(parentJson, 0);

                checkbox.state = 0;

            }

        },

        _checkboxFindChildsChecked:function(childsJson, state){

            if(!childsJson){return;}

            var i = childsJson.length,childJson;

            while(i--){

                childJson = childsJson[i];

                this._checkboxSetState(childJson, state);

                this._checkboxSetChildsJson(childJson, state);

                this._checkboxFindChildsChecked(childJson.children, state);

            }

        },

        _checkboxSetChildsJson:function(nodeTreeJson, state){

            var checkbox = nodeTreeJson.checkbox;

            if(state === 2){

                checkbox.state = 2;

                !!nodeTreeJson.children && (checkbox.childCheckedLen = nodeTreeJson.children.length);

            }else if(state === 0){

                checkbox.state = 0;

                !!nodeTreeJson.children && (checkbox.childCheckedLen = 0);

            }

        },

        _checkboxSetState:function(nodeTreeJson, state){

            if(state === 2 && nodeTreeJson.checkbox.state !== 2){

                $(this._getTreeNode(nodeTreeJson.id, "check")).children().addClass('leoTree_checkbox_active').children().removeClass().addClass('leoTree_checkbox_icon leoTree_checkbox_check');

            }else if(state === 1 && nodeTreeJson.checkbox.state !== 1){

                $(this._getTreeNode(nodeTreeJson.id, "check")).children().addClass('leoTree_checkbox_active').children().removeClass().addClass('leoTree_checkbox_icon leoTree_checkbox_halfCheck');

            }else if(state === 0 && nodeTreeJson.checkbox.state !== 0){

                $(this._getTreeNode(nodeTreeJson.id, "check")).children().removeClass().addClass('leoTree_checkbox_box').children().removeClass();

            }

        },

        _treeSwitchClickEvent:function(){

            var op = this.options, This = this,clickTime,$tree = this.$tree,

            clickNodeCallBack = this.options.clickNodeCallBack;

            if(op.isDblclick){

                this._on( $tree, 'dblclick.switch', '.leoTree_dblclick_a', function(event){

                    !!clickTime && clearTimeout(clickTime);

                    This._treeNodeOpenOrClose( this, 'a' );

                });

                this._on( $tree, 'click.switch', '.leoTree_dblclick_a', function(event){

                    var self = this;

                    !!clickTime && clearTimeout(clickTime);

                    clickTime = setTimeout(function(){

                        clickNodeCallBack !== false && clickNodeCallBack.call( self, event, This._getNodeTreeData( self.id, 'a' ) );

                    }, 300);

                });

            }else{

                this._on( $tree, 'click.switch', '.leoTree_dblclick_a', function(event){

                    clickNodeCallBack !== false && clickNodeCallBack.call( this, event, This._getNodeTreeData( this.id, 'a' ) );

                });

            }

        },

        _autoCollapse:function(treeJson){

            if( !this.options.autoCollapse ){ return; }

            var childrens = this.treeJson[treeJson.parentId].children,

            i = childrens.length,childJson,doc = this.document[0];

            while( i-- ){

                childJson = childrens[i];

                if( childJson.open === true ){

                    this._treeNodeClose( doc.getElementById( childJson.innerId ), doc.getElementById( childJson.ulId ), childJson );

                }

            }

        },

        _treeHoverEvent:function(){

            if( !this.options.hoverOpenClose ){

                this._off( this.$tree, 'mouseenter.treeHoverEvent' );

                this._off( this.$tree, 'mouseleave.treeHoverEvent' );

                return;

            }

            var This = this,doc = this.document[0];

            this._on( this.$tree, 'mouseenter.treeHoverEvent', 'span.leoTree_inner', function(event){

                var id = this.id,

                treeJson = This.treeJson[ This._getTreeId( id, 'inner' ) ];

                treeJson.open === false && This._treeNodeOpen( this, doc.getElementById( This._getTreeNodeId( id, 'inner', 'ul' ) ), treeJson );

            });

            this._on( this.$tree, 'mouseleave.treeHoverEvent', 'li', function(event){

                var id = this.id,

                treeJson = This.treeJson[ This._getTreeId( id, 'li' ) ];

                treeJson.open === true && This._treeNodeClose( doc.getElementById( This._getTreeNodeId( id, 'li', 'inner' ) ), doc.getElementById( This._getTreeNodeId( id, 'li', 'ul' ) ), treeJson );

            });

        },

        _treeNodeOpenOrClose:function( node, name ){

            var id = node.id,doc,ul,inner,

            treeJson = this.treeJson[ this._getTreeId( id, name ) ];

            if( !treeJson.children ){ return; }

            doc = this.document[0];

            ul = doc.getElementById( this._getTreeNodeId( id, name, 'ul' ) );

            inner = doc.getElementById( this._getTreeNodeId( id, name, 'inner' ) );

            if( treeJson.open === true ){

                this._treeNodeClose( inner, ul, treeJson );

            }else{

                this._treeNodeOpen( inner, ul, treeJson );

                this._autoCollapse( treeJson );

            }

        },

        _treeNodeActive:function(activeNode){

            !!this.active && $( this.active ).removeClass( 'leoTree_active' );

            $(activeNode).addClass( 'leoTree_active' );

            this.active = activeNode;

        },

        _removeHoverClass:function(activeNode){

            $(activeNode).removeClass( 'leoTree_inner_hover' );

        },

        _addHoverClass:function(activeNode){

            $(activeNode).addClass( 'leoTree_inner_hover' );

        },

        _treeNodeOpen:function( inner, ul, treeJson, fun ){

            $(inner).removeClass( 'leoTree_inner_close' ).addClass( 'leoTree_inner_open' );

            $(ul).slideDown( 160, function(){

                treeJson.open = true;

                fun && fun();

            } );

        },

        _treeNodeClose:function( inner, ul, treeJson, fun ){

            $(inner).removeClass( 'leoTree_inner_open' ).addClass( 'leoTree_inner_close' );

            $(ul).slideUp( 160, function(){

                treeJson.open = false;

                fun && fun();

            } );

        }

    });

    return $;

}));