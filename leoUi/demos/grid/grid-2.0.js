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

leoUiLoad.require('leoUi-dataAdapter,leoUi-grid-2.0,leoUi,leoUiGrid,ready', function($) {

    var tableModel = [{

            boxType: 'checkBox',

            width: 70,

            selectTr:function(tdData, tableModel){

                if(tdData.data.id < 20)return true;

            },

            align: "center",

            thStyle:'background-color:#fff',

            thClass:'leo aaaa',

            fixed: true,

            tdClass:'leo aaaa',

            tdStyle:'text-align:center'

        }, {

            dataKey: 'contact',

            theadName: '联系人',

            width: 50,

            minWidth: 50,

            sortable: true,

            type: 'string',

            resize: true,

            thStyle:'background-color:#fff',

            thClass:'leo aaaa',

            edit: {

                type: 'text'

            },

            renderThCell: function(val) {

                return val;

            }


        }, {

            dataKey: 'mobile',

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

            dataKey: 'im',

            theadName: 'QQ',

            width: 123,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            dataKey: 'weixin',

            theadName: '微信',

            width: 144,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            dataKey: 'skype',

            theadName: 'skype',

            width: 132,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            dataKey: 'email',

            theadName: 'email',

            width: 150,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            dataKey: 'phone',

            theadName: '座机',

            width: 112,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            edit: {

                type: 'text'

            }

        }, {

            dataKey: 'address',

            sortable: true,

            sortableType: 'string',

            resize: true,

            width: 200,

            minWidth: 100,

            theadName: '地址',

            edit: {

                type: 'text'

            }

        }, {

            dataKey: 'first',

            theadName: '首要联系人',

            width: 50,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            renderCell: function(val) {

                if (val === 1) {

                    val = '是';

                } else {

                    val = '否';

                }

                return val;

            }

        }, {

            width: 100,

            theadName: '修改',

            resize: true,

            minWidth: 100,

            renderCell: function(val) {

                return {

                    html:'<a class="teamEditBtn" href="javascript:;">修改</a><span>|</span><a class="dataDelBtn" href="javascript:;">删除</a>',

                    title:'asdfsdfsd'

                }

            }

        }], $grid,

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
            "mobile": "0",
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
            "im": "12312321",
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
            "weixin": "1231321",
            "skype": "",
            "email": "12321",
            "address": "http://www.baidu.com",
            "first": "0"
        }],option = {
            localData:data,
            datatype: "array",
            isPage: true,
            pageSize: 21,
            method:'ajax',
            setAjaxPageInfo:function(data, page){

                return data;

            },
            ajaxParam:function(option, data){

                if(option.pageMethod === 'local'){

                    return $.extend({}, option.ajax, {

                        data:{

                            pageSize: 100,

                            page: 1

                        }

                    });

                }else{

                    return $.extend({}, option.ajax, {

                        data:{

                            pageSize: option.pageSize,

                            page: data.page

                        }

                    });

                }

            },
            filterData:function(data, option){

                if(option.method === 'local'){

                    return data;

                }

                if(option.pageMethod === 'local'){

                    return data.pageData;

                }

            },
            ajax:{
                url:'http://127.0.0.1:1337/',
                dataType :'json'
            },
            currentPage: 1,
            pageMethod:'ajax', //local,ajax
            mode: [{
                name: 'id',
                type: 'number',
                validator:"required number"
            }, {
                name: 'contact',
                type: 'string',
                validator:["required", "string"]
            }, {
                name: 'email',
                type: 'string'

            }, {
                name: 'skype',
                type: 'number'

            },{
                name: 'im',
                type: 'number'

            },{
                name: 'weixin',
                type: 'number'

            },{
                name: 'mobile',
                type: 'number',
                validator:function(value){

                    if(value === 1){

                        return true

                    }else{

                        return '不为1';

                    }

                }
            }, {
                name: 'phone',
                type: 'number',
                validator:[["required", "required"], ["number", "不是数字"]]
            }, {
                name: 'address',
                type: 'string'
            },{
                name: 'first',
                type: 'number',
                validator:"required number"
            }]
        }, dataAdapter = $.leoTools.dataAdapter(option);

    $grid = $('.grid-wrap').leoGrid({

        source: dataAdapter,

        tableModel: tableModel,

        showPage:true,

        rowList: [20,30,100],

        resizeHeight: true,

        width: function($grid) {

            return $grid.width();

        },

        height: function($grid) {

            return $grid.height();

        },

        resizeWidth: true,

        clickTdCallback: function(event, td, table) {



        }

    });
    var i = 0;
    $('#btn').on('click', function(event) {
        event.preventDefault();
        $grid.leoGrid('setPage', i++);
    });

    

});