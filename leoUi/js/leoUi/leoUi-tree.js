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

            this.markTree();

            this.addEvent();

            this.setDroppable();

        },

        _setOption:function( key, value ){

            if( key === 'hoverOpenClose' ){

                this.treeHoverEvent();

            }

        },

        setDroppable:function(){

            this.$tree.leoDraggable({

                selector:'li',

                bClone: true,

                revert: false,

                revertAnimate: true,

                bCloneAnimate: true,

                dragBoxReturnToTarget: true,

                useDroppable: true,

                cursorAt:{top:1,left:1},

                stopMouseWheel: false,

                proxy: function(source) { //source

                    return $(source).clone().css({
                        'z-index': 1,
                        width: $(source).width(),
                        position: 'fixed'
                    }).insertAfter(source);

                },

                onStartDrag: function(e, darg) {

                    $(this).css({
                        'opacity': '0.5'
                    })


                },
                onStopDrag: function() {

                    $(this).css('opacity', '1');

                    // $('.portlet').leoRizeBox('destroy');

                    // $('.portlet').leoDroppable('destroy')

                }



            })

            // $('.portlet').leoDraggable({
                
            // })

            // $('.portlet').leoDroppable({

            //     // accept:'#leo',

            //     onDragEnter: function(e, source, dargBox) {

            //         if (source !== this) {

            //             if ($(this).parent()[0] !== $(source).parent()[0] || $(this).index() < $(source).index()) {

            //                 $(source).insertBefore(this);

            //             } else {

            //                 $(source).insertAfter(this);

            //             }

            //         }

            //     },
            //     onDrop: function() {

            //         // console.log(this)

            //         // return false;

            //     }

            // })
            // $('.column').leoDroppable({

            //     // accept:'#leo',

            //     onDragEnter: function(e, source, dargBox) {

            //         if (!$.contains(this, source)) {

            //             $(source).appendTo(this);

            //         }

            //     }

            // });


        },

        setTreeId:function(id){

            return this.expando + '_id_' + id;

        },

        getTreeId:function( id, name ){

            return id.slice( 0, id.indexOf( '_' + name ) );

        },

        setTreeNodeId:function( id, name, level ){

            return this.expando + '_id_' + id + '_' + name + '_level_' + level;

        },

        getTreeNodeId:function( id, setName, getName ){

            return id.replace( setName, getName );

        },

        getLevel:function( id ){

            return id.slice( id.indexOf( '_level' ) );

        },

        markNodeTree:function( treeJson, isChild, level, parentId ){

            var i = 0,length,child,id,treeId,rootId;

            if( !isChild ){

                this.treeJson = {};

                level = 0;

                this.id = 0;

                id = this.id++;

                treeId = this.setTreeId( id );

                rootId = this.setTreeNodeId( id, 'root', level );

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

                        treeId = this.setTreeId(id);

                        child.level = level;

                        child.liId = this.setTreeNodeId( id, 'li', level );

                        child.ulId = this.setTreeNodeId( id, 'ul', level );

                        child.innerId = this.setTreeNodeId( id, 'inner', level );

                        child.switchId = this.setTreeNodeId( id, 'switch', level );

                        this.treeJson[treeId] = child;

                        this.treeJson[ 'level_'+level ].push(treeId);

                        !child.open && ( child.open = false );

                        this.createLiStr( true, child.name, child.liId, child.open );

                        this.cheateDivStr( true, child.name, child.innerId, child.switchId, child.open, child.url );

                        this.createUlStr( child.ulId, child.open );

                        this.markNodeTree( child.children, true, level, treeId );

                        this.html += '</ul></li>';

                    }else{

                        id = this.id++;

                        treeId = this.setTreeId(id);

                        child.level = level;

                        child.liId = this.setTreeNodeId( id, 'li', level );

                        child.innerId = this.setTreeNodeId( id, 'inner', level );

                        this.treeJson[treeId] = child;

                        this.treeJson[ 'level_'+level ].push(treeId);

                        this.createLiStr( false, child.name, child.liId, child.open );

                        this.cheateDivStr( false, child.name, child.innerId, child.open, child.url );

                        this.html += '</li>';

                    }

                }

            }

        },

        markTree:function(){

            this.markNodeTree();

            this.html += '</ul>';

            this.$tree = $(this.html);

            this.$tree.appendTo( this.$target );

            delete this.html;

        },

        createUlStr:function( id, isOpen ){

            !isOpen ? this.html += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: none;">' : this.html += '<ul id="' + id + '" class="leoTree_list leoUi_helper_reset leoTree_child" style="display: block;">';

        },

        createLiStr:function( isChild, name, id, isOpen ){

            !isChild ? this.html += '<li id="' + id + '" class="leoTree_item">' : this.html += '<li id="' + id + '" class="leoTree_parent">';

        },

        cheateDivStr:function( isChild, name, innerId, switchId, isOpen, url ){

            var isIcon = this.options.isIcon,href,target;

            if( isChild ){

                if( isOpen ){

                    this.html += '<div class="leoTree_node"><span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix leoTree_inner_open"><span id="' + switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    !!isIcon && ( this.html += '<span class="leoTree_icon leoTree_icon_folder"></span>' );


                }else{

                    this.html += '<div class="leoTree_node"><span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix leoTree_inner_close"><span id="' + switchId + '" class="leoTree_icon leoTree_icon_triangle"></span>';

                    !!isIcon && ( this.html += '<span class="leoTree_icon leoTree_icon_folder"></span>' );

                }

            }else{

                !isIcon ? this.html += '<div class="leoTree_node"><span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix">' : this.html += '<div class="leoTree_node"><span id="' + innerId + '" class="leoTree_state_default leoTree_inner leoUi_clearfix"><span class="leoTree_icon leoTree_icon_document"></span>';

            }

            if( url ){

                href = url.href || '###';

                target = url.target;

                this.html += '<a href="' + href + '" target = "' + target + '"><span>' + name + '</span></a></span></div>';

            }else{

                this.html += '<a href="###"><span>' + name + '</span></a></span></div>';

            }

        },

        addEvent:function(){

            var This = this;

            this._on( this.$tree, 'click.switch', 'span.leoTree_icon_triangle', function(event){

                event.stopPropagation();

                This.treeNodeOpenOrClose( this, 'switch' );

            });

            this._on( this.$tree, 'dblclick.switch', 'span.leoTree_inner', function(event){

                event.stopPropagation();

                This.treeNodeOpenOrClose( this, 'inner' );

            });

            this._on( this.$tree, 'click.active', 'span.leoTree_inner', function(event){

                event.stopPropagation();

                This.treeNodeActive(this);

            });

            this.treeHoverEvent();

        },

        autoCollapse:function(level){

            if( !this.options.autoCollapse ){ return; }

            var levels = this.treeJson[ 'level_' + level ],

            document = this.document[0],

            i = levels.length - 1,treeJson;

            while( i >= 0 ){

                treeJson = this.treeJson[ levels[i--] ];

                if( treeJson.open === true ){

                    this.treeNodeClose( document.getElementById( treeJson.innerId ), document.getElementById( treeJson.ulId ), treeJson );

                }

            }

        },

        treeHoverEvent:function(){

            if( !this.options.hoverOpenClose ){

                this._off( this.$tree, 'mouseenter.treeHoverEvent' );

                this._off( this.$tree, 'mouseleave.treeHoverEvent' );

                return;

            }

            var This = this,document = this.document[0];

            this._on( this.$tree, 'mouseenter.treeHoverEvent', 'span.leoTree_inner', function(event){

                var id = this.id,

                treeJson = This.treeJson[ This.getTreeId( id, 'inner' ) ];

                treeJson.open === false && This.treeNodeOpen( this, document.getElementById( This.getTreeNodeId( id, 'inner', 'ul' ) ), treeJson );

            });

            this._on( this.$tree, 'mouseleave.treeHoverEvent', 'li', function(event){

                var id = this.id,

                treeJson = This.treeJson[ This.getTreeId( id, 'li' ) ];

                treeJson.open === true && This.treeNodeClose( document.getElementById( This.getTreeNodeId( id, 'li', 'inner' ) ), document.getElementById( This.getTreeNodeId( id, 'li', 'ul' ) ), treeJson );

            });

        },

        treeNodeOpenOrClose:function( node, name ){

            var id = node.id,document,ul,inner,

            treeJson = this.treeJson[ this.getTreeId( id, name ) ];

            if( !treeJson.children ){ return; }

            document = this.document[0];

            ul = document.getElementById( this.getTreeNodeId( id, name, 'ul' ) );

            inner = document.getElementById( this.getTreeNodeId( id, name, 'inner' ) );

            if( treeJson.open === true ){

                this.treeNodeClose( inner, ul, treeJson );

            }else{

                this.treeNodeOpen( inner, ul, treeJson );

                this.autoCollapse( treeJson.level );

            }

        },

        treeNodeActive:function(activeNode){

            !!this.active && $( this.active ).removeClass( 'leoTree_active' );

            $(activeNode).addClass( 'leoTree_active' );

            this.active = activeNode;

        },

        treeNodeOpen:function( inner, ul, treeJson ){

            $(inner).removeClass( 'leoTree_inner_close' ).addClass( 'leoTree_inner_open' );

            $(ul).stop( true, true ).slideDown( 200, function(){

                treeJson.open = true;

            } );

        },

        treeNodeClose:function( inner, ul, treeJson ){

            $(inner).removeClass( 'leoTree_inner_open' ).addClass( 'leoTree_inner_close' );

            $(ul).stop( true, true ).slideUp( 200, function(){

                treeJson.open = false;

            } );

        }

    })

	return $;

}));