leoUiLoad.config({

    debug: false,

    baseUrl: 'leoUi/',

    alias: {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css',

        leoUiGrid: '../../css/leoUi-grid.css',

        jqueryMousewheel: '../jquery/jquery-mousewheel',

        template: '../jquery/template'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-grid-2.0,leoUi,leoUiGrid,ready', function($) {

    var tableModel = [{

            boxType: 'checkBox',

            width: 70,

            align: "center",

            id: 'isCheck',

            isCheck: true,

            thStyle:'background-color:#fff',

            thClass:'leo aaaa',

            fixed: true

        }, {

            id: 'contact',

            theadName: '联系人',

            width: 150,

            minWidth: 100,

            sortable: true,

            sortableType: 'string',

            resize: true,

            thStyle:'background-color:#fff',

            thClass:'leo aaaa',

            edit: {

                type: 'text'

            },

            thTemplate:'<div style="color:red">{{theadName}}</div>'

        }, {

            id: 'mobile',

            theadName: '手机',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            id: 'im',

            theadName: 'QQ',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            id: 'weixin',

            theadName: '微信',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            id: 'skype',

            theadName: 'skype',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            id: 'email',

            theadName: 'email',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            id: 'phone',

            theadName: '座机',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            id: 'address',

            sortable: true,

            sortableType: 'string',

            resize: true,

            fixed: true,

            width: 200,

            minWidth: 100,

            theadName: '地址',

            edit: {

                type: 'text'

            }

        }, {

            id: 'first',

            theadName: '首要联系人',

            width: 100,

            minWidth: 100,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'select',

                typeOption: {

                    '1': '是',

                    '0': '否'

                },

                isMust: false

            },

            renderCell: function(val, index, selectKey) {

                if (+selectKey === 1) {

                    val = '是';

                } else {

                    val = '';

                }

                return val;

            }

        }, {

            id: 'operate',

            width: 150,

            theadName: '修改',

            resize: true,

            minWidth: 100,

            fixed: true,

            renderCell: function(val) {

                return '<a class="teamEditBtn" href="javascript:;">修改</a><span>|</span><a class="dataDelBtn" href="javascript:;">删除</a>';

            }

        }],
        $grid,

        data = [{
            "id": "92",
            "contact": "23423",
            "mobile": "3242343",
            "phone": "23423",
            "im": "0",
            "weixin": "",
            "skype": "23432",
            "email": "",
            "address": "",
            "first": "1"
        }, {
            "id": "105",
            "contact": "23423",
            "mobile": "23432",
            "phone": "0",
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "",
            "first": "1"
        }, {
            "id": "106",
            "contact": "242323",
            "mobile": "233223",
            "phone": "0",
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "",
            "first": "0"
        }, {
            "id": "107",
            "contact": "243243",
            "mobile": "2323",
            "phone": "0",
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "",
            "first": "0"
        }, {
            "id": "108",
            "contact": "23423432",
            "mobile": "3243232",
            "phone": "0",
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "",
            "first": "0"
        }, {
            "id": "109",
            "contact": "2332423432432",
            "mobile": "2332",
            "phone": "0",
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "",
            "first": "0"
        }];

    $grid = $('.grid-wrap').leoGrid({

        dataType: 'data',

        gridData: data,

        isPage: true,

        tableModel: tableModel,

        trIdKey: 'id',

        rowNum: 2,

        rowList: [2,30,50],

        resizeHeight: true,

        width: function($grid) {

            return $grid.width();

        },

        height: '100%',

        resizeWidth: true,

        clickTdCallback: function(event, td, table) {



        }

    });

});