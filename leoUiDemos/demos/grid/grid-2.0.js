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

            src: '../jquery/jquery-1.11.2.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-dataAdapter,leoUi-grid-2.0,leoUi,leoUiGrid,ready', function($) {

    var tableModel = [{

            boxType: 'checkBox',

            width: 70,

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

            edit: true,

            initEdit:function(td, tableModel, data){

                console.log(td)

            },

            beforeEdit:function(td, tableModel, data){

                var $td = $(td);

                $('<input type="text" style="width: 90%;" value="'+ data +'">').appendTo($td.empty()).select();

            },

            getSaveCellVal:function(td, tableModel, data){

                return $(td).find('input').val();

            },

            saveCell:function(td, validator, val, tableModel, data, getCellHtml){

                if(validator.passed){

                    $(td).html(getCellHtml(tableModel.renderCell, val));

                }else{

                    $(td).find('input').css('border', '1px solid red')

                }

            },

            validator:function(td, validatorCell, val, cellData){

                return validatorCell(val, cellData.tableModel.dataKey, cellData.trIndex)

            },

            renderThCell:function(val) {

                return val;

            }

        }, {

            dataKey: 'mobile',

            theadName: '手机',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: function(a, b, status){

                if(status === 'asc'){

                    return a.mobile - b.mobile;

                }else if(status === 'desc'){

                    return b.mobile - a.mobile;

                }

            },

            resize: true

        }, {

            dataKey: 'im',

            theadName: 'QQ',

            width: 123,

            minWidth: 50,

            sortable: true,

            resize: true

        }, {

            dataKey: 'weixin',

            theadName: '微信',

            width: 144,

            minWidth: 50,

            sortable: true,

            resize: true

        }, {

            dataKey: 'skype',

            theadName: 'skype',

            width: 132,

            minWidth: 50,

            sortable: true,

            resize: true

        }, {

            dataKey: 'email',

            theadName: 'email',

            width: 150,

            minWidth: 50,

            sortable: true,

            resize: true

        }, {

            dataKey: 'phone',

            theadName: '座机',

            width: 112,

            minWidth: 50,

            sortable: true,

            resize: true

        }, {

            dataKey: 'address',

            sortable: true,

            resize: true,

            width: 200,

            minWidth: 100,

            theadName: '地址'

        }, {

            dataKey: 'first',

            theadName: '首要联系人',

            width: 50,

            minWidth: 50,

            sortable: true,

            resize: true,

            edit:true,

            initEdit:function(td, tableModel, data){

                console.log(td)

            },

            beforeEdit:function(td, tableModel, data){

                var $td = $(td);

                $('<select><option value="1">是</option><option value="0">否</option></select>').appendTo($td.empty()).find('option[value="'+data+'"]').attr('selected', true);

            },

            getSaveCellVal:function(td, tableModel, data){

                return +$(td).find('select').val();

            },

            validator:true,

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
            localData: getData(10000),
            datatype: "array",
            isPage: true,
            pageSize: 1000,
            setAjaxPageInfo:function(data){

                return data.pageInfo;

            },
            ajaxParam:function(option, arg){

                var ajaxParam, sortInfo = arg.sortInfo, searchInfo = arg.searchInfo;

                if(option.pageMethod === 'local'){

                    ajaxParam = $.extend({}, option.ajax, {

                        data:{

                            pageSize: 10000,

                            page: 1

                        }

                    });

                }else{

                    ajaxParam = $.extend({}, option.ajax, {

                        data:{

                            pageSize: option.pageSize,

                            page: arg.page

                        }

                    });

                }

                if(sortInfo && sortInfo.sortAjax && (sortInfo.status !== 'normal')){

                    $.extend(ajaxParam.data, {dataKey: sortInfo.dataKey, status: sortInfo.status});

                }

                if(searchInfo && searchInfo.searchAjax && searchInfo.type === 'search'){

                    $.extend(ajaxParam.data, {val: searchInfo.val, type: searchInfo.type});

                }

                return ajaxParam;

            },
            filterData:function(data, option){

                if(data.pageData){

                    return data.pageData;

                }

                return data;

            },
            ajax:{
                url:'http://127.0.0.1:1337/',
                dataType :'json'
            },
            search: {

                rword: /[^, ]+/g,

                keys: 'all',

                searchDataFnName: 'in',

                valsLogic: 'or'//and, or

            },
            currentPage: 1,
            method:'local',
            pageMethod:'local', //local,ajax
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

                    if(value){

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

        function random(min, max) {

            if (max === undefined) {

                max = min;

                min = 0;

            }

            return min + Math.floor(Math.random() * (max - min + 1));

        };

        function getData(length){

            var row, i = 0, arr = [],

            contact = ["Andrew", "Nancy", "Shelley", "Regina", "Yoshi", "Antoni", "Mayumi", "Ian", "Peter", "Lars", "Petra", "Martin", "Sven", "Elio", "Beate", "Cheryl", "Michael", "Guylene"],

            address = ['广东省广州市越秀区中山六路109', '广东省广州市越秀区中山六路101号', ' 广东省广州市越秀区中山六路97号', '广东省广州市越秀区中山六路23号', '广东省广州市越秀区中山六路89号', '广东省广州市越秀区中山一路95号', '广东省广州市越秀区中山六路9212号', '广东省广州市中山六路95号', '广东省广州市越秀区中山六路935号', '广东省广州市越秀区中山六路95号', '广东省广州市95号', '广东省广州市越秀区中山六路235号'],

            phone = ['159', '158', '157', '156', '189', '188', '187', '185'];

            while(length--){

                row = {

                    id: i++,

                    contact: contact[Math.floor(Math.random() * contact.length)],

                    mobile: phone[Math.floor(Math.random() * phone.length)] + random(10000000, 99999999),

                    im: random(10000000, 999999999999),

                    weixin: random(100000, 999999999),

                    skype: random(10000, 999999999),

                    email: (random(10000000, 999999999999) + '.qq.com'),

                    phone: random(10000000000, 99999999999),

                    address: address[Math.floor(Math.random() * address.length)],

                    first: random(0, 1)

                }

                arr.push(row);

            }

            return arr;

        }

    $grid = $('.grid-wrap').leoGrid({

        source: dataAdapter,

        tableModel: tableModel,

        sortAjax:false,

        searchAjax:false,

        footerShow:true,

        cellEdit:true,

        virtualScroll:true,

        virtualScrollAddRows:4,

        rowList: [20,30,100],

        disabledCheck:false,//禁用选择

        disabledEvent:false,//是否禁用事件

        hoverClass:'leoUi-state-hover',//移入添加的类名称

        evenClass:'leoUi-priority-secondary',//为表身的偶数行添加一个类名，以实现斑马线效果。false 没有

        activeClass:'leoUi-state-highlight',//选中效果

        boxCheckType:'multiple',//radio单选，multiple多选,false无

        selectTr:function(tdData){

            if(tdData.id < 20)return true;

        },

        width: function($grid) {

            return $grid.width();

        },

        height: function($grid) {

            return $grid.height();

        },

        getParam:function(data, id){

            return (data && data.id) || id;

        },

        clickTrCallback: function(event, tr) {

            // if(!$grid.leoGrid('rowEdit', tr)){

            //     $grid.leoGrid('cancelRowEdit');

            // };

        },

        beforeRowEdit:function(editRow){

            // var rowData = editRow.rowData, tr = editRow.tr;

            // $grid.leoGrid('saveRow', rowData.rowRecord, function(validatorRow, editRow){

            //     return {passed: true};

            // });

        }

    });
    var i = 0, flag = true;
    $('#btn').on('click', function(event) {
        event.preventDefault();
        // $grid.leoGrid('setPage', i++);
        // $grid.leoGrid('multipleCheckBoxAllSelect', $grid.leoGrid('getCheckBoxFlag') !== 'all', true);
        flag = !flag;

        // console.log($grid.leoGrid('getSelectRowsTrParam'));

        $grid.leoGrid('searchReset');

        return false;

        // console.log($grid.leoGrid('getRecords'));
    });

    $('#input').on('keydown', function(event) {

        if(event.which === 13){

            var val = $(this).val();

            $grid.leoGrid('search', val);

            return false;

        }


    });

});
