
$.config({

        level:6,

        baseUrl:'leoUi/',

        alias : {

            leoCss : '../../css/leo.css',

            jqueryMousewheel:'../jquery/jquery-mousewheel'

        },

        shim: {

            jquery: {

                src: '../jquery/jquery-1.9.1.js',

                exports: "$"

            }　

        }

}).require('leoUi-resizable,leoCss,ready', function($) {

    $('body').leoResizable({

        selector:'.a',

        disabled:false,//如果设置为true将禁止缩放。

        bClone:true,//克隆对象

        bCloneAnimate:true, //克隆拖拽是否动画

        duration:400,//动画时间

        containment:"parent",//使用指定的元素强制性限制大小调整的界限.

        stopMouseWheel: false, //拖拽时候是否关闭滚轮事件

        handles:'all',//n, e, s, w, ne, se, sw, nw, all

        edge:4,//mouse的cursor的变化宽度

        grid:false,//拖拽元素时，只能以指定大小的方格进行拖动。数组形式为[ x, y ]。

        iframeFix:true,//在拖动期间阻止iframe捕捉鼠标移过事件。与cursorAt选项搭配使用时或者当鼠标指针可能不在拖动助手元素之上时，该参数非常有用。

                        // 支持多种类型:

                        // Boolean: 当设置为true, 透明层将被放置于页面上的所有iframe之上。

                        // Selector: 任何由选择器匹配的iframe将被透明层覆盖。

        aspectRatio:false//等比例缩放,为长与高之比

    })

    $('#botton_1').click(function(event) {
            $('body').leoResizable('option',{

                selector:"#a"

            });
    });


});
