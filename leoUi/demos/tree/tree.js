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

leoUiLoad.require('leoUi-tree,base,leoUi,ready', function($) {

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
                            { name:"叶子节点114",checked:true}
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

                        url: 'http://www.baidu.com.cn',target:'_blank',

                        children: [
                            { name:"叶子节点121",checked:true},
                            { name:"叶子节点122",checked:true},
                            { name:"叶子节点123",checked:true},
                            { name:"叶子节点124",checked:true}
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
        ],

    zSimpleNodes =[
            { id:1, pId:0, name:"父节点1 - 展开", open:true,urdl: 'http://www.baidu.com.cn',target:'_blank', title:"12312321",checked:true},
            { id:11, pId:1, name:"父节点11 - 折叠",checked:true},
            { id:111, pId:11, name:"叶子节点111", checked:true},
            { id:112, pId:11, name:"叶子节点112",checked:true},
            { id:113, pId:11, name:"叶子节点113",checked:true},
            { id:114, pId:11, name:"叶子节点114",checked:true},
            { id:12, pId:1, name:"父节点12 - 折叠",checked:true},
            { id:121, pId:12, name:"叶子节点121", checked:true},
            { id:122, pId:12, name:"叶子节点122",checked:true},
            { id:123, pId:12, name:"叶子节点123",checked:true},
            { id:124, pId:12, name:"叶子节点124",checked:true},
            { id:13, pId:1, name:"父节点13 - 没有子节点",checked:true},
            { id:2, pId:0, name:"父节点2 - 折叠"},
            { id:21, pId:2, name:"父节点21 - 展开", open:true},
            { id:211, pId:21, name:"叶子节点211"},
            { id:212, pId:21, name:"叶子节点212"},
            { id:213, pId:21, name:"叶子节点213"},
            { id:214, pId:21, name:"叶子节点214"},
            { id:22, pId:2, name:"父节点22 - 折叠"},
            { id:221, pId:22, name:"叶子节点221"},
            { id:222, pId:22, name:"叶子节点222"},
            { id:223, pId:22, name:"叶子节点223"},
            { id:224, pId:22, name:"叶子节点224"},
            { id:23, pId:2, name:"父节点23 - 折叠"},
            { id:231, pId:23, name:"叶子节点231"},
            { id:232, pId:23, name:"叶子节点232",checked:true},
            { id:233, pId:23, name:"叶子节点233"},
            { id:234, pId:23, name:"叶子节点234"},
            { id:3, pId:0, name:"父节点3 - 没有子节点"}
        ];

    $("#tree").leoTree({

        treeJson:zSimpleNodes,

        hoverOpenClose:false,

        autoCollapse:false,

        key:{

            children:'children',

            title:true

        },

        check:{

            enable:true
        },

        isSimpleData:{

            enable:true,

            idKey:'id',

            pidKey:'pId'

        },

        isIcon:true,

        dragAndDrop:true,

        clickNodeCallBack:function(event, data){

            console.log(data)

        }

    });

    $('#botton_1').click(function(event) {
        $("#tree").leoTree('option',{

            hoverOpenClose:false,

            autoCollapse:true

        });
    });

});