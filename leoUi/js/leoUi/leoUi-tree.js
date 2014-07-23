/**
+-------------------------------------------------------------------
* jQuery leoUi--tree
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools",], factory);

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

            disabled:false,//如果设置为true将禁止缩放。(格式见例子)

            treeJson:false,//tree的jsan

            isIcon:true,//是否展现图标

            hoverOpenClose:false//通过鼠标悬浮收起菜单

        },

        _init:function(){

            this.treeJson = this.options.treeJson;

            if( this.treeJson.constructor !== Array ){ return; }

            this.markTree();

            this.addEvent();

        },

        markTree:function( $child, treeJson ){

            var tJson = !treeJson ? this.treeJson : treeJson,

            i = tJson.length,child,$child,$ul,

            $tree = !$child ? this.$tree = $( this.createUlStr() ) : this.$tree.find( $child );

            while( i ){

                if( child = tJson[--i] ){

                    if( child.children ){

                        $child = $( this.createLiStr( true, child.name, child.open ) ).append( $ul = $( this.createUlStr( true, child.open ) ) );

                        $($child).prependTo($tree);

                        this.markTree( $ul, child.children );

                    }else{

                        $child = $( this.createLiStr( false, child.name, child.open ) );

                        $($child).prependTo($tree);

                    }

                }

            }

            this.$tree.appendTo( this.$target );

        },

        createUlStr:function( isChild, isOpen ){

            var ul;

            if( !isChild ){

                ul = '<ul class="leoTree_list leoUi_helper_reset"></ul>';

            }else{

                !isOpen ? ul = '<ul class="leoTree_list leoUi_helper_reset leoTree_child" style="display: none;"></ul>' : ul = '<ul class="leoTree_list leoUi_helper_reset leoTree_child" style="display: block;"></ul>';

            }

            return ul;

        },

        createLiStr:function( isChild, name,  isOpen, isIcon, check  ){

            var li,isIcon = this.options.isIcon;

            if( isChild ){

                li = '<li class="leoTree_parent"><div class="leoTree_node"><span class="leoTree_state_default leoTree_inner leoUi_clearfix">';

                if( isOpen ){

                    li += '<span class="leoTree_icon leoTree_icon_triangle leoTree_icon_triangle_open"></span>';

                    !!isIcon && ( li += '<span class="leoTree_icon leoTree_icon_folder leoTree_icon_folder_open"></span>' );


                }else{

                    li += '<span class="leoTree_icon leoTree_icon_triangle leoTree_icon_triangle_close"></span>';

                    !!isIcon && ( li += '<span class="leoTree_icon leoTree_icon_folder leoTree_icon_folder_close"></span>' );

                }

            }else{

                !isIcon ? li = '<li class="leoTree_item"><div class="leoTree_node"><span class="leoTree_state_default leoTree_inner leoUi_clearfix">' : li = '<li class="leoTree_item"><div class="leoTree_node"><span class="leoTree_state_default leoTree_inner leoUi_clearfix"><span class="leoTree_icon leoTree_icon_document"></span>';

            }

            li += '<a href="#"><span>' + name + '</span></a></span></div></li>';

            return li;

        },

        addEvent:function(){

            var This = this;

            this._on( this.$tree, 'mouseenter', 'span.leoTree_inner', function(event){

                $(this).addClass( 'leoTree_hover' );

            });

            this._on( this.$tree, 'mouseleave', 'span.leoTree_inner', function(event){

                $(this).removeClass( 'leoTree_hover' );

            });

            this._on( this.$tree, 'click', 'div.leoTree_node', function(event){

                This.treeNodeOpenOrClose( event.target, this );

            });

            this.treeHoverEventAdd();

        },

        treeHoverEventAdd:function(){

            if( !this.options.hoverOpenClose ){ return; }

            var This = this;

            this._on( this.$tree, 'mouseenter', 'div.leoTree_node', function(event){

                var $node = $(this);

                This.treeNodeOpen( $node, $node.find( 'span.leoTree_icon_triangle' ) );

            });

            this._on( this.$tree, 'mouseleave', 'li', function(event){

                var $node = $(this).find( 'div.leoTree_node:first' );

                This.treeNodeClose( $node, $node.find( 'span.leoTree_icon_triangle' ) );

            });

        },

        treeNodeOpenOrClose:function( target, node ){

            var $node,$child;

            if( ( $icon = $(target) ).is('.leoTree_icon_triangle') ){

                $node = $(node);

                $child = $node.next();

                if( $child.is(':visible') ){

                    this.treeNodeClose( $node, $icon, $child )

                }else{

                    this.treeNodeOpen( $node, $icon, $child );

                }

            }else{

                this.treeNodeActive( node.firstChild );

            }


        },

        treeNodeActive:function(activeNode){

            !!this.active && $( this.active ).removeClass( 'leoTree_active' );

            $(activeNode).addClass( 'leoTree_active' );

            this.active = activeNode;

        },

        treeNodeOpen:function( $node, $icon, $child ){

            var $children = $child || $node.next();

            $icon.removeClass('leoTree_icon_triangle_close').addClass('leoTree_icon_triangle_open');

            !!this.options.isIcon && $node.find('.leoTree_icon_folder').removeClass('leoTree_icon_folder_close').addClass('leoTree_icon_folder_open');

            $children.stop( true, true ).slideDown(200);

        },

        treeNodeClose:function( $node, $icon, $child ){

            var $children = $child || $node.next();

            $icon.removeClass('leoTree_icon_triangle_open').addClass('leoTree_icon_triangle_close');

            !!this.options.isIcon && $node.find('.leoTree_icon_folder').removeClass('leoTree_icon_folder_open').addClass('leoTree_icon_folder_close');

            $children.stop( true, true ).slideUp(200);

        }

    })

	return $;

}));