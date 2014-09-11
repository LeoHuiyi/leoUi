/**
+-------------------------------------------------------------------
* jQuery leoUi--tree
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
*
* 使用treeJon配合Id 提高速度！
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

            isIcon:true,//是否展现图标

            hoverOpenClose:false,//通过鼠标悬浮收起菜单

            autoCollapse:false,//自动折叠的功能

            isSimpleData:false,//是否启用简单的json数据

            dragAndDrop:true//是否能拖放

        },

        _init:function(){

            if( this.options.treeJson.constructor !== Array ){ return; }

            this.expando = "leoTree_" + ( this.version + Math.random() ).replace( /\D/g, "" );

            this._markTree();

            this._addEvent();

            this.options.dragAndDrop === true && this._setDraggable();

        },

        _setOption:function( key, value ){

            if( key === 'hoverOpenClose' ){

                this._treeHoverEvent();

            }

        },

        _setDraggable:function(){

            var This = this,dragId,dropJson,treeDragIsOpen = false,ul,inner;

            this.$tree.leoDraggable({

                selector:'span.leoTree_inner',

                cancel:'span.leoTree_icon_triangle',

                distance:4,

                cursor:'pointer',

                bClone: true,

                revert: false,

                revertAnimate: true,

                bCloneAnimate: true,

                dragBoxReturnToTarget: true,

                useDroppable: true,

                cursorAt:{top:4,left:4},

                stopMouseWheel: false,

                proxy: function(source) {

                    dragId = This.dragId = This._getTreeId( source.id, 'inner' );

                    return $(source).clone().addClass('leoTree_active').removeAttr('id').css( { width: $(source).outerWidth(), position: 'absolute' } ).insertAfter(source);

                },

                onStartDrag: function( e, drag ) {

                    dropJson = This.treeJson[dragId];

                    inner = This._getTreeNode( dragId, 'inner' );

                    ul = This._getTreeNode( dragId, 'ul' )

                    if( dropJson.open === true ){

                        This._treeNodeClose( inner, ul, dropJson, function(){

                            This.$tree.leoDraggable('setDropsProp');

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

            })

            this._setDroppable( this.$tree.find('div.leoTree_node') );

        },

        _setDroppable:function( $dropDivs ){

            var This = this,nameDiv = 'div',distance = 4,id,arrowTop,arrowLeft,dropId,inner,arrowBottom,isNotDropNode,ul,dropJson,delayTime;

            !!this.$dropDivs && this.$dropDivs.leoDroppable('destroy');

            this.$dropDivs = $dropDivs.leoDroppable({

                toleranceType:'pointer',

                onDragEnter: function( e, drop, drag ) {

                    id = this.id;

                    arrowTop = drop.top;

                    arrowLeft = drop.left;

                    arrowBottom = drop.bottom;

                    dropId = This._getTreeId( id, nameDiv );

                    inner = This._getTreeNode( dropId, 'inner' );

                    ul = This._getTreeNode( dropId, 'ul' );

                    dropJson = This.treeJson[dropId];

                },

                onDragOver: function( event, drop, drag ) {

                    if(  ( isNotDropNode = This._isNotDropNode( dropId, This.dragId ) ) === true ){ return };

                    !This.innerHoverDisabled && ( This.innerHoverDisabled = true );

                    This.$arrow.is( ':hidden' ) && This.$arrow.show();

                    if( event.pageY <= arrowTop + distance && This.enterFlag !== 1 ){

                        !!delayTime && clearTimeout( delayTime );

                        This.$arrow.css( { top: arrowTop, left: arrowLeft } );

                        This.enterFlag = 1;

                        This._removeHoverClass(inner);

                    }else if( event.pageY >= arrowBottom - distance && This.enterFlag !== 2 ){

                        !!delayTime && clearTimeout( delayTime );

                        This.$arrow.css( { top: arrowBottom, left: arrowLeft } );

                        This.enterFlag = 2;

                        This._removeHoverClass(inner);

                    }else if( event.pageY < arrowBottom - distance && event.pageY > arrowTop + distance  && This.enterFlag !== 3 ){

                        This.$arrow.css( { top: ( arrowTop + arrowBottom )/2, left: arrowLeft } );

                        This.enterFlag = 3;

                        !!delayTime && clearTimeout( delayTime );

                        delayTime = setTimeout( function(){

                            if( !!dropJson.children && dropJson.open === false ){

                                This._treeNodeOpen( inner, ul, dropJson, function(){

                                    This.$tree.leoDraggable('setDropsProp');

                                } );

                            }

                        }, 400 );

                        This._addHoverClass(inner);

                    }

                },

                onDragLeave: function( e, drop, drag ) {

                    !!delayTime && clearTimeout( delayTime );

                    This._removeHoverClass( This._getTreeNode( this.id, 'div', 'inner' ) );

                    This.$arrow.hide();

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

            // var parentId = this.treeJson[dropId].parentId;

            // while(parentId){

            //     if( parentId === dragId ){

            //         return true;

            //     }

            //     parentId = this.treeJson[parentId].parentId;

            // }

            // return false;

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

            var liJson = this.treeJson[dropId],level = liJson.level,

            $dropLi = $(dropLi);

            liJson.switchId = this._setTreeNodeId( dropId, 'switch', level, true );

            liJson.ulId = this._setTreeNodeId( dropId, 'ul', level, true );

            liJson.open = true;

            this.html = '';

            this._createUlStr( liJson.ulId, liJson.open );

            this.html += '</ul>';

            $dropLi.attr( 'class', 'leoTree_parent' ).append( this.html ).children('ul').append(dragLi);

            this.html = '';

            this._createDivStr( true, liJson, true );

            $dropLi.children('div').empty().append( this.html );

            delete this.html;

        },

        _treeJsonAppendTo:function( dragId, dropId ){

            var parentId,parentJson,parentNode;

            if(  ( parentId = this._getTreeNodeId( dragId, 'parent') ) !== dropId ){

                !this.treeJson[dropId].children && ( this.treeJson[dropId].children = [] );

                this.treeJson[dragId].level = this._getLevel( dropId ) + 1;

                this.treeJson[dragId].parentId = dropId;

                this.treeJson[dropId].children.push( this.treeJson[dragId] );

                this._removeChildId( parentId, dragId );

                if( $.isEmptyObject( this.treeJson[parentId].children ) ){

                    parentJson = this.treeJson[parentId];

                    delete parentJson.children;

                    delete parentJson.open;

                    delete parentJson.UlId;

                    delete parentJson.switchId;

                    parentNode = this._getTreeNode( parentId, 'li' );

                    this.html = '';

                    this._createDivStr( false, parentJson , true );

                    $(parentNode).attr( 'class', 'leoTree_item' ).children('div').empty().append( this.html ).end().children('ul').remove();

                    delete this.html;

                }

            }

        },

        _removeChildId:function( parentId, childId ){

            var childrens = this.treeJson[parentId].children,

            i = childrens.length - 1;

            while( i >= 0 ){

                if( childrens[ i ].id === childId ){

                    childrens.splice( i, 1 );

                }

                i--;

            }

        },

        _createArrow:function(){

            !this.$arrow && ( this.$arrow = $("<div class='leoTree_arrow'><img src = '../../img/arrow.png' /></div>").hide().appendTo('body') );

        },

        _destroyArrow:function(){

            this.$arrow.remove();

            delete this.$arrow

        },

        _setTreeId:function(id){

            return this.expando + '_id_' + id;

        },

        _getTreeId:function( id, name ){

            return id.slice( 0, id.indexOf( '_' + name ) );

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

            }else{

                 return this.treeJson[id][ setName + 'Id' ];

            }

        },

        _getTreeNode:function( id, setName, getName ){

            var doc = this.document[0];

            if( getName ){

                return doc.getElementById( this._getTreeNodeId( id, setName, getName ) );

            }else{

                 return doc.getElementById( this.treeJson[id][ setName + 'Id' ] );

            }

        },

        _getLevel:function( id ){

            return this.treeJson[id].level;

        },

        _hasChild:function (id) {

            return !!this.treeJson[id].children;

        },

        _markNodeTree:function( treeJson, isChild, level, parentId ){

            var i = 0,length,child,id,treeId,rootId;

            if( !isChild ){

                this.treeJson = {};

                level = 0;

                this.id = 0;

                id = this.id++;

                treeId = this._setTreeId( id );

                rootId = this._setTreeNodeId( id, 'root', level );

                this.treeJson[treeId] = { level: level, rootId: rootId }

                this.html = '<ul id="' + rootId + '" class="leoTree_list leoUi_helper_reset">';

                parentId = treeId;

                treeJson = treeJson || this.options.treeJson;

            }

            level += 1;

            !this.treeJson[ 'level_'+level ] && ( this.treeJson[ 'level_'+level ] = [] );

            length = treeJson.length;

            while( i < length ){

                if( child = treeJson[i++] ){

                    if( child.children ){

                        id = this.id++;

                        treeId = this._setTreeId(id);

                        !this.treeJson[treeId] && ( this.treeJson[treeId] = {} );

                        this.treeJson[treeId].id = treeId;

                        this.treeJson[treeId].name = child.name;

                        this.treeJson[treeId].level = level;

                        this.treeJson[treeId].liId = this._setTreeNodeId( id, 'li', level );

                        this.treeJson[treeId].ulId = this._setTreeNodeId( id, 'ul', level );

                        this.treeJson[treeId].innerId = this._setTreeNodeId( id, 'inner', level );

                        this.treeJson[treeId].switchId = this._setTreeNodeId( id, 'switch', level );

                        this.treeJson[treeId].divId = this._setTreeNodeId( id, 'div', level );

                        this.treeJson[treeId].aId = this._setTreeNodeId( id, 'a', level );

                        this.treeJson[treeId].parentId = parentId;

                        !child.open && ( child.open = false );

                        this.treeJson[treeId].open = child.open;

                        this.treeJson[ 'level_' + level ].push(treeId);

                        this._createLiStr( true, this.treeJson[treeId].liId );

                        this._createDivStr( true, this.treeJson[treeId] );

                        this._createUlStr( this.treeJson[treeId].ulId, this.treeJson[treeId].open );

                        this._markNodeTree( child.children, true, level, treeId );

                        this.html += '</ul></li>';

                    }else{

                        id = this.id++;

                        treeId = this._setTreeId(id);

                        !this.treeJson[treeId] && ( this.treeJson[treeId] = {} );

                        this.treeJson[treeId].id = treeId;

                        this.treeJson[treeId].name = child.name;

                        this.treeJson[treeId].level = level;

                        this.treeJson[treeId].liId = this._setTreeNodeId( id, 'li', level );

                        this.treeJson[treeId].innerId = this._setTreeNodeId( id, 'inner', level );

                        this.treeJson[treeId].divId = this._setTreeNodeId( id, 'div', level );

                        this.treeJson[treeId].aId = this._setTreeNodeId( id, 'a', level );

                        this.treeJson[ 'level_'+level ].push(treeId);

                        this.treeJson[treeId].parentId = parentId;

                        this._createLiStr( false, this.treeJson[treeId].liId );

                        this._createDivStr( false, this.treeJson[treeId] );

                        this.html += '</li>';

                    }

                    !this.treeJson[parentId].children && ( this.treeJson[parentId].children = [] );

                    this.treeJson[parentId].children.push( this.treeJson[treeId] );

                }

            }

        },

        _changeSimpleTreeJson:function(){

            var simpleDatas = this.options.treeJson,treeJson = [],

            length = simpleDatas.length,i = 0,simpleData;

            while( i < length ){

                simpleData = simpleDatas[i++];

                if( simpleData.pId === 0 ){

                    treeJson.push( simpleData );

                }

            }

            return ( function treeChild( json, data ){

                var i = 0,jsonLen = json.length,dataLen = data.length,

                jsonData,jsonId,dataData;

                while( i < jsonLen ){

                    var j = 0;

                    jsonData = json[i++];

                    jsonId = jsonData.id;

                    while( j < dataLen ){

                        dataData = data[j++];

                        if( dataData.pId === jsonId ){

                            !jsonData.children && ( jsonData.children = [] );

                            jsonData.children.push( dataData );

                        }

                    }

                    if( jsonData.children ){

                        treeChild( jsonData.children, data );

                    }

                }

                return json;

            }( treeJson, simpleDatas ) );

        },

        _markTree:function(){

            this._markNodeTree( this.options.isSimpleData === true && this._changeSimpleTreeJson() );

            this.html += '</ul>';

            this.$tree = $( this.html );

            this.$tree.appendTo( this.$target );

            delete this.html;

        },

        _createUlStr:function( id, isOpen ){

            !isOpen ? this.html += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: none;">' : this.html += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: block;">';

        },

        _createLiStr:function( isChild, id ){

            !isChild ? this.html += '<li id="' + id + '" class="leoTree_item">' : this.html += '<li id="' + id + '" class="leoTree_parent">';

        },

        _createDivStr:function( isChild, child, notWrap ){

            var isIcon = this.options.isIcon,href,

            name = child.name, divId = child.divId, innerId = child.innerId,

            switchId = child.switchId, isOpen = child.open,aId = child.aId,

            url = child.url;

            !notWrap ? this.html +='<div id="' + divId + '" class="leoTree_node">' :

            this.html = '';

            if( isChild ){

                if( isOpen ){

                    this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix leoTree_inner_open"><span id="' + switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    !!isIcon && ( this.html += '<span class="leoTree_icon leoTree_icon_folder"></span>' );


                }else{

                    this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix leoTree_inner_close"><span id="' + switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    !!isIcon && ( this.html += '<span class="leoTree_icon leoTree_icon_folder"></span>' );

                }

            }else{

                !isIcon ? this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix">' : this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix"><span class="leoTree_icon leoTree_icon_document"></span>';

            }

            if( url ){

                href = url.href || '###';

                this.html += '<a id="' + aId + '" href="' + href + '" target = "' + url.target + '" class="leoTree_dblclick_a"><span>' + name + '</span></a></span>';

            }else{

                this.html += '<a id="' + aId + '" href="###" class="leoTree_dblclick_a"><span>' + name + '</span></a></span>';

            }

            !notWrap && ( this.html += '</div>' );

        },

        _addEvent:function(){

            var This = this;

            this._on( this.$tree, 'mouseenter.hover', 'span.leoTree_inner', function(event){

                event.stopPropagation();

                if( This.innerHoverDisabled === true ){ return };

                This._addHoverClass(this);

            });

            this._on( this.$tree, 'mouseleave.hover', 'span.leoTree_inner', function(event){

                event.stopPropagation();

                if( This.innerHoverDisabled === true ){ return };

                This._removeHoverClass(this);

            });

            this._on( this.$tree, 'click.switch', 'span.leoTree_icon_triangle', function(event){

                event.stopPropagation();

                This._treeNodeOpenOrClose( this, 'switch' );

            });

            this._on( this.$tree, 'dblclick.switch', 'a.leoTree_dblclick_a', function(event){

                event.stopPropagation();

                This._treeNodeOpenOrClose( this, 'a' );

            });

            this._on( this.$tree, 'click.active', 'span.leoTree_inner', function(event){

                event.stopPropagation();

                This._treeNodeActive(this);

            });

            this._treeHoverEvent();

        },

        _autoCollapse:function(treeJson){

            if( !this.options.autoCollapse ){ return; }

            var childrens = this.treeJson[treeJson.parentId].children,

            i = childrens.length - 1,childJson;

            while( i >= 0 ){

                childJson = childrens[i--];

                if( childJson.open === true ){

                    this._treeNodeClose( document.getElementById( childJson.innerId ), document.getElementById( childJson.ulId ), childJson );

                }

            }

        },

        _treeHoverEvent:function(){

            if( !this.options.hoverOpenClose ){

                this._off( this.$tree, 'mouseenter.treeHoverEvent' );

                this._off( this.$tree, 'mouseleave.treeHoverEvent' );

                return;

            }

            var This = this,document = this.document[0];

            this._on( this.$tree, 'mouseenter.treeHoverEvent', 'span.leoTree_inner', function(event){

                var id = this.id,

                treeJson = This.treeJson[ This._getTreeId( id, 'inner' ) ];

                treeJson.open === false && This._treeNodeOpen( this, document.getElementById( This._getTreeNodeId( id, 'inner', 'ul' ) ), treeJson );

            });

            this._on( this.$tree, 'mouseleave.treeHoverEvent', 'li', function(event){

                var id = this.id,

                treeJson = This.treeJson[ This._getTreeId( id, 'li' ) ];

                treeJson.open === true && This._treeNodeClose( document.getElementById( This._getTreeNodeId( id, 'li', 'inner' ) ), document.getElementById( This._getTreeNodeId( id, 'li', 'ul' ) ), treeJson );

            });

        },

        _treeNodeOpenOrClose:function( node, name ){

            var id = node.id,document,ul,inner,

            treeJson = this.treeJson[ this._getTreeId( id, name ) ];

            if( !treeJson.children ){ return; }

            document = this.document[0];

            ul = document.getElementById( this._getTreeNodeId( id, name, 'ul' ) );

            inner = document.getElementById( this._getTreeNodeId( id, name, 'inner' ) );

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

    })

	return $;

}));