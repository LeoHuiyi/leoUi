
leoUiLoad.config({

        debug: true,

        baseUrl:'leoUi/',

        alias : {

            base: '../../css/base.css',

            leoUi: '../../css/leoUi.css',

            jqueryMousewheel:'../jquery/jquery-mousewheel'

        },

        shim: {

            jquery: {

                src: '../jquery/jquery-1.9.1.js',

                exports: "$"

            }　

        }

})

leoUiLoad.require('leoUi-draggable,base,leoUi,ready', function($) {

    $('body').leoDraggable({

            mouseDownSelector:'.a',

            handle:false, //点击拖拽地区

            cursor:'move',//拖动时的CSS指针。

            bClone:true, //是否使用克隆拖拽

            bCloneAnimate:true, //克隆拖拽是否动画

            dragBoxReturnToTarget:false,//是否回到target位置

            duration:400,//动画时间

            stopMouseWheel:false, //拖拽时候是否关闭滚轮事件

            containment:"parent",//使用指定的元素强制性限制大小调整的界限.

            revert:false, //如果设置为true, 当拖动停止时元素将返回它的初始位置。

            revertAnimate:true ,//还原是否动画

            closestScrollParent:'#abc',//从最近的可滚动的祖先开始，在DOM 树上逐级向上的可滚动的祖先匹配，如果匹配到了break，没匹配到则默认到document，如果scroll选项设置为false，则该参数无效（document不算在内,false为不匹配）

            proxy: function(source) { //source

                return $(source).clone().css({
                    'z-index': 1,
                    width: $(source).width(),
                    position: 'relative'
                }).removeAttr('id').insertAfter(source);

            }

    });

    $('#botton_1').on('click', function(event) {
        event.preventDefault();
        // $('body').leoDraggable('destroy');

        $('body').leoDraggable('option',{

                mouseDownSelector:false

            });
    });

});
