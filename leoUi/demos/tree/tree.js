//tree

$.config({

    level:6,

    baseUrl:'/leoUi/',

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

}).require('leoUi-tree,ready', function($) {

    var zNodes =[
            { name:"父节点1 - 展开", open:true,
                children: [
                    { name:"父节点11 - 折叠",
                        children: [
                            { name:"叶子节点111",
                        children: [
                            { name:"叶子节点111",
                        children: [
                            { name:"叶子节点111",
                        children: [
                            { name:"叶子节点111"},
                            { name:"叶子节点112"},
                            { name:"叶子节点113"},
                            { name:"叶子节点114"}
                        ]},
                            { name:"叶子节点112"},
                            { name:"叶子节点113"},
                            { name:"叶子节点114"}
                        ]},
                            { name:"叶子节点112"},
                            { name:"叶子节点113"},
                            { name:"叶子节点114"}
                        ]},
                            { name:"叶子节点112"},
                            { name:"叶子节点113"},
                            { name:"叶子节点114"}
                        ]},
                    { name:"父节点12 - 折叠",

                        // url:{

                        //     href:'http://www.baidu.com.cn',

                        //     target:'_blank'

                        // },
                        children: [
                            { name:"叶子节点121"},
                            { name:"叶子节点122"},
                            { name:"叶子节点123"},
                            { name:"叶子节点124"}
                        ]},
                    { name:"父节点13 - 没有子节点"}
                ]},
            { name:"父节点2 - 折叠",
                children: [
                    { name:"父节点21 - 展开", open:true,
                        children: [
                            { name:"叶子节点211"},
                            { name:"叶子节点212"},
                            { name:"叶子节点213"},
                            { name:"叶子节点214"}
                        ]},
                    { name:"父节点22 - 折叠",
                        children: [
                            { name:"叶子节点221"},
                            { name:"叶子节点222"},
                            { name:"叶子节点223"},
                            { name:"叶子节点224"}
                        ]},
                    { name:"父节点23 - 折叠",
                        children: [
                            { name:"叶子节点231"},
                            { name:"叶子节点232"},
                            { name:"叶子节点233"},
                            { name:"叶子节点234"}
                        ]}
                ]},
            { name:"父节点3 - 没有子节点"},
            { name:"父节点4 - 折叠",
                children: [
                    { name:"父节点41 - 展开", open:true,
                        children: [
                            { name:"叶子节点411"},
                            { name:"叶子节点412"},
                            { name:"叶子节点413"},
                            { name:"叶子节点414"}
                        ]},
                    { name:"父节点42 - 折叠",
                        children: [
                            { name:"叶子节点421"},
                            { name:"叶子节点422"},
                            { name:"叶子节点423"},
                            { name:"叶子节点424"}
                        ]},
                    { name:"父节点43 - 折叠",
                        children: [
                            { name:"叶子节点431"},
                            { name:"叶子节点432"},
                            { name:"叶子节点433"},
                            { name:"叶子节点434"}
                        ]}
                ]}
        ];

    $("#tree").leoTree({

        treeJson:zNodes,

        hoverOpenClose:false,

        autoCollapse:false


    });

    $('#botton_1').click(function(event) {
            $("#tree").leoTree('option',{

                hoverOpenClose:true,

                autoCollapse:true

            });
    });

});