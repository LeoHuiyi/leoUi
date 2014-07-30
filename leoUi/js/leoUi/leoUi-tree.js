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

            autoCollapse:false//自动折叠的功能

        },

        _init:function(){

            if( this.options.treeJson.constructor !== Array ){ return; }

            this.expando = "leoTree_" + ( this.version + Math.random() ).replace( /\D/g, "" );

            this._markTree();

            this._addEvent();

            this._setDraggable();

        },

        _setOption:function( key, value ){

            if( key === 'hoverOpenClose' ){

                this._treeHoverEvent();

            }

        },

        _setDraggable:function(){

            var This = this;

            this.$tree.leoDraggable({

                selector:'span.leoTree_inner',

                notHandle:'span.leoTree_icon_triangle',

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

                    This.dargBox = source;

                    This.dragId = This._getTreeId( source.id, 'inner' );

                    return $(source).clone().addClass('leoTree_active').css( { width: $(source).outerWidth(), position: 'absolute' } ).insertAfter(source);

                },

                onStartDrag: function( e, drag ) {



                },

                onBeforeStopDrag: function() {

                    This._AddHoverClass(This.inner);


                }



            })

            this._setDroppable( this.$tree.find('div.leoTree_node') );

        },

        _setDroppable:function( $dropDivs ){

            var This = this,nameDiv = 'div',distance = 6;

            this.createArrow();

            !!this.$dropDivs && this.$dropDivs.leoDroppable('destroy');

            this.$dropDivs = $dropDivs.leoDroppable({

                toleranceType:'pointer',

                firstInOrOut:true,

                onDragEnter: function( e, drop, drag ) {

                    // var id = this.id,

                    // jsonId = This._getTreeId( id, nameDiv ),

                    // inner = This._getTreeNode( id, nameDiv, 'inner' );

                    // This._treeNodeActive(inner);

                    // if( jsonId !== This.dragId ){

                    //     console.log(id)


                    // }


                },

                onDragOver: function( event, drop, drag ) {

                    var id = this.id,lastInner,

                    jsonId = This._getTreeId( id, nameDiv );

                    This.inner = This._getTreeNode( id, nameDiv, 'inner' );

                    if( event.pageY <= drop.top + distance ){

                        This._removeHoverClass(This.inner);

                        This.lastInner = This.inner;

                        console.log(This.inner)

                    }else if( event.pageY >= drop.bottom - distance ){

                        This._removeHoverClass(This.inner);

                        This.lastInner = This.inner;

                    }else if( event.pageY < drop.bottom - distance && event.pageY > drop.top + distance ){

                        console.log(This.lastInner)

                        This._AddHoverClass(This.lastInner);

                        This._AddHoverClass(This.inner);

                        if( jsonId !== This.dragId ){

                            // console.log(id)


                        }


                    }

                    


                },

                onDragLeave: function( e, drop, drag ) {

    


                },

                onDrop: function( e, drop, darg ) {

                    return true
                }

            })

        },

        createArrow:function(){

            !!this.arrow && ( this.arrow = $("<div class='leoTree_arrow'></div>").hide().appendTo('body') );

        },

        destroyArrow:function(){

            this.arrow.remove();

            delete this.arrow

        },

        _setTreeId:function(id){

            return this.expando + '_id_' + id;

        },

        _getTreeId:function( id, name ){

            return id.slice( 0, id.indexOf( '_' + name ) );

        },

        _setTreeNodeId:function( id, name, level ){

            return this.expando + '_id_' + id + '_' + name + '_level_' + level;

        },

        _getTreeNodeId:function( id, setName, getName ){

            return id.replace( setName, getName );

        },

        _getTreeNode:function( id, setName, getName ){

            return this.document[0].getElementById( this._getTreeNodeId( id, setName, getName ) );

        },

        _getLevel:function( id ){

            return id.slice( id.indexOf( 'level_' ) );

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

                this.treeJson[treeId] = { level: level, rootId:

                rootId }

                this.html = '<ul id="' + rootId + '" class="leoTree_list leoUi_helper_reset">';

                parentId = treeId;

                treeJson = this.options.treeJson;

            }

            level += 1;

            !this.treeJson[ 'level_'+level ] && ( this.treeJson[ 'level_'+level ] = [] );

            length = treeJson.length;

            while( i < length ){

                if( child = treeJson[i++] ){

                    child.parentId = parentId;

                    if( child.children ){

                        id = this.id++;

                        treeId = this._setTreeId(id);

                        child.level = level;

                        child.liId = this._setTreeNodeId( id, 'li', level );

                        child.ulId = this._setTreeNodeId( id, 'ul', level );

                        child.innerId = this._setTreeNodeId( id, 'inner', level );

                        child.switchId = this._setTreeNodeId( id, 'switch', level );

                        child.divId = this._setTreeNodeId( id, 'div', level );

                        !child.open && ( child.open = false );

                        this.treeJson[treeId] = child;

                        this.treeJson[ 'level_'+level ].push(treeId);

                        this._createLiStr( true, child.liId );

                        this._createDivStr( true, child );

                        this._createUlStr( child.ulId, child.open );

                        this._markNodeTree( child.children, true, level, treeId );

                        this.html += '</ul></li>';

                    }else{

                        id = this.id++;

                        treeId = this._setTreeId(id);

                        child.level = level;

                        child.liId = this._setTreeNodeId( id, 'li', level );

                        child.innerId = this._setTreeNodeId( id, 'inner', level );

                        child.divId = this._setTreeNodeId( id, 'div', level );

                        this.treeJson[treeId] = child;

                        this.treeJson[ 'level_'+level ].push(treeId);

                        this._createLiStr( false, child.liId );

                        this._createDivStr( false, child );

                        this.html += '</li>';

                    }

                }

            }

        },

        _markTree:function(){

            this._markNodeTree();

            this.html += '</ul>';

            this.$tree = $(this.html);

            this.$tree.appendTo( this.$target );

            delete this.html;

        },

        _createUlStr:function( id, isOpen ){

            !isOpen ? this.html += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: none;">' : this.html += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: block;">';

        },

        _createLiStr:function( isChild, id ){

            !isChild ? this.html += '<li id="' + id + '" class="leoTree_item">' : this.html += '<li id="' + id + '" class="leoTree_parent">';

        },

        _createDivStr:function( isChild, child ){

            var isIcon = this.options.isIcon,href,

            name = child.name, divId = child.divId, innerId = child.innerId,

            switchId = child.switchId, isOpen = child.open,

            url = child.url;

            this.html +='<div id="' + divId + '" class="leoTree_node">';

            if( isChild ){

                if( isOpen ){

                    this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoTree_hover leoUi_clearfix leoTree_inner_open"><span id="' + switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    !!isIcon && ( this.html += '<span class="leoTree_icon leoTree_icon_folder"></span>' );


                }else{

                    this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoTree_hover leoUi_clearfix leoTree_inner_close"><span id="' + switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    !!isIcon && ( this.html += '<span class="leoTree_icon leoTree_icon_folder"></span>' );

                }

            }else{

                !isIcon ? this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoTree_hover leoUi_clearfix">' : this.html += '<span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoTree_hover leoUi_clearfix"><span class="leoTree_icon leoTree_icon_document"></span>';

            }

            if( url ){

                href = url.href || '###';

                this.html += '<a href="' + href + '" target = "' + url.target + '"><span>' + name + '</span></a></span></div>';

            }else{

                this.html += '<a href="###"><span>' + name + '</span></a></span></div>';

            }

        },

        _addEvent:function(){

            var This = this;

            this._on( this.$tree, 'click.switch', 'span.leoTree_icon_triangle', function(event){

                event.stopPropagation();

                This._treeNodeOpenOrClose( this, 'switch' );

            });

            this._on( this.$tree, 'dblclick.switch', 'span.leoTree_inner', function(event){

                event.stopPropagation();

                This._treeNodeOpenOrClose( this, 'inner' );

            });

            this._on( this.$tree, 'click.active', 'span.leoTree_inner', function(event){

                event.stopPropagation();

                This._treeNodeActive(this);

            });

            this._treeHoverEvent();

        },

        _autoCollapse:function(level){

            if( !this.options.autoCollapse ){ return; }

            var levels = this.treeJson[ 'level_' + level ],

            document = this.document[0],

            i = levels.length - 1,treeJson;

            while( i >= 0 ){

                treeJson = this.treeJson[ levels[i--] ];

                if( treeJson.open === true ){

                    this._treeNodeClose( document.getElementById( treeJson.innerId ), document.getElementById( treeJson.ulId ), treeJson );

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

                treeJson.open === false && This.treeNodeOpen( this, document.getElementById( This._getTreeNodeId( id, 'inner', 'ul' ) ), treeJson );

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

                this.treeNodeOpen( inner, ul, treeJson );

                this._autoCollapse( treeJson.level );

            }

        },

        _treeNodeActive:function(activeNode){

            !!this.active && $( this.active ).removeClass( 'leoTree_active' );

            $(activeNode).addClass( 'leoTree_active' );

            this.active = activeNode;

        },

        _removeHoverClass:function(activeNode){

            $(activeNode).removeClass( 'leoTree_hover' );

        },

        _AddHoverClass:function(activeNode){

            $(activeNode).addClass( 'leoTree_hover' );

        },

        treeNodeOpen:function( inner, ul, treeJson ){

            $(inner).removeClass( 'leoTree_inner_close' ).addClass( 'leoTree_inner_open' );

            $(ul).slideDown( 160, function(){

                treeJson.open = true;

            } );

        },

        _treeNodeClose:function( inner, ul, treeJson ){

            $(inner).removeClass( 'leoTree_inner_open' ).addClass( 'leoTree_inner_close' );

            $(ul).slideUp( 160, function(){

                treeJson.open = false;

            } );

        }

    })

	return $;

}));