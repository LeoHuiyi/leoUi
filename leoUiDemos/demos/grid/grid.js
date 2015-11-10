leoUiLoad.config({

    debug: true,

    baseUrl: 'leoUi/',

    alias: {

        base: '../../css/base.css',

        leoUi: '../../css/leoUi.css',

        leoUiGrid: '../../css/leoUi-grid.css',

        jqueryMousewheel: '../jquery/jquery-mousewheel'

    },

    shim: {

        jquery: {

            src: '../jquery/jquery-1.9.1.js',

            exports: "$"

        }　

    }

})

leoUiLoad.require('leoUi-grid,leoUi,leoUiGrid,ready', function($) {

    var tableModel = [{

            boxType: 'checkBox',

            width: 70,

            align: "center",

            checkBoxId: 'isCheck'

        }, {

            id: 'contact',

            theadName: '联系人',

            width: 150,

            minWidth: 100,

            sortable: true,

            sortableType: 'string',

            resize: true,

            fixed: true,

            edit: {

                type: 'text'

            }

        }, {

            id: 'mobile',

            theadName: '手机',

            width: 100,

            minWidth: 50,

            sortable: true,

            sortableType: 'string',

            resize: true,

            fixed: true,

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

            fixed: true,

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

            fixed: true,

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

            fixed: true,

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

            fixed: true,

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

            fixed: true,

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

            fixed: true,

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

        resizeHeight: true,

        width: function($grid) {

            return $grid.width();

        },

        height: '100%',

        resizeWidth: true,

        afterGetData: function(data) {

            data[0].isCheck = true

            return data;
        },

        clickTdCallback: function(event, td, table) {

            var $target = $(event.target),
                tr = td.parentNode;

            if ($target.is('a.dataDelBtn')) {

                event.stopPropagation();

                $grid.leoGrid('removeRow', tr);

            } else if ($target.is('a.teamEditBtn')) {

                event.stopPropagation();

                //   $grid.leoGrid( 'getEditRowInfo', td.parentNode, function(data){

                //      data.teams.push({

                //     id: 'cid',

                //     edit:{ 'type': 'hidden' },

                //     val:trid

                // });

                //       var edit = PU.edit( { text: '修改客户联系信息' }, data, {

                //          'height': 400,

                //          'width': 700,

                //           'beforeShow': function(target){

                //               var $content = edit.widget();

                //               $content.find('select.edit').leoSelect({'selectItemsMinHeight': 50});

                //               $content.find('select.edit').leoSelect('option',{'position.within':edit.widget()});

                //           },

                //           'dialogShowCallBack':function(){

                //               $grid.leoGrid( 'setDisabledEvent', false );

                //           },

                //           'okCallBack':function( event, disable, enable ){

                //               tipMsg.send('loadingShow');

                //               edit.option('hideAnimation', function(callBack) {

                //                   this.hide({
                //                       effect: "explode",
                //                       duration: 200,
                //                       complete: callBack
                //                   });

                //               });

                //               $.ajax({

                //                   url: '../../index.php?m=home&c=client&a=contact_edit',

                //                   type: "post",

                //                   data: edit.widget().find('.edit').serialize()

                //               }).done(function(data){

                //                   if( +data.code === 0 ){

                //                       tipMsg.send('ok', data.message);

                //                       $grid.leoGrid( 'editRow', td.parentNode, data.contact[0] );

                //                       edit.modalDialogHide();

                //                   }else{

                //                       tipMsg.send('error', data.message);

                //                       enable();

                //                   }

                //               }).fail(function(data){

                //                   tipMsg.send('error', data.statusText);

                //                   enable();

                //               });

                //               disable();

                //           },

                //           'cancelCallBack': function() {

                //               edit.option('hideAnimation', function(callBack) {

                //                   this.hide({
                //                       effect: "clip",
                //                       duration: 200,
                //                       complete: callBack
                //                   });

                //               });

                //               edit.widget().find('select.edit').leoSelect( 'hide', true );

                //               edit.modalDialogHide();

                //           },

                //           'closeCallBack':function(){

                //               edit.option('hideAnimation', function(callBack) {

                //                   this.hide({
                //                       effect: "clip",
                //                       duration: 200,
                //                       complete: callBack
                //                   });

                //               });

                //               edit.widget().find('select.edit').leoSelect( 'hide', true );

                //           },

                //           'modalDialogHideCallBack': function(isOKOrCancel) {

                //               edit.widget().find('select.edit').leoSelect('destroy');

                //               edit.destroy();

                //           }

                //       });

                //       edit.dialogShow();

                //   },function(data){

                //       tipMsg.send('error', data.statusText);

                //   } );

                //   $grid.leoGrid( 'setDisabledEvent', true );

            }

        }

    });

});