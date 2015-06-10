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

leoUiLoad.require('leoUi-dataAdapter, ready', function($) {

    var data = [{
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
            "address": "sdfsdf",
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
            "address": "asdasdsa",
            "first": "0"
        }],
        option = {
            localData:data,
            pageSize:2,
            datatype: "array",
            mode: [{
                name: 'id',
                type: 'number',
                validator:"required number"
            }, {
                name: 'contact',
                type: 'number',
                validator:["required", "string"]
            }, {
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
            }],

            loadComplete:function(data){

                console.log(data)
            }
        }, dataAdapter;

        var b = new $.leoTools.dataAdapter.DataWrapper(data),

        c = b.clone();

        console.log(c.getData())

        console.log(c.setData([]).getData())

        console.log(b.map(function(val, i){

            val.haha = i;

            return val;

        }).findRow(function(val, i){

            return val.id > 100;

        }).sortBy(function(a, b){

            return a.id < b.id;

        }).getRow(2).getData())

        dataAdapter = $.leoTools.dataAdapter(option).dataBind();

        console.log(dataAdapter.getPageData(1),dataAdapter.getPageData(2),dataAdapter.getPageData(3),dataAdapter.getPageData(4));

        $.leoTools.dataAdapter.addValidatorFn('number', function(val, info) {

            if(typeof val === 'number'){

                return true;

            }else{

                return '不是这里的数字！！';

            }

        });

        var data =  $.leoTools.dataAdapter({
            localData:[{
            "id": "123123211312",
            "contact": "2332423432432",
            "mobile": "2332",
            "phone": "0",
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "asdasdsa",
            "first": "0"
        },
        {
            "id": "1231231123",
            "contact": "2332423432432",
            "mobile": "2332",
            "phone": "0",
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "asdasdsa",
            "first": "0"
        }],
            datatype: "array",
            method:"locat",
            mode: [{
                name: 'id',
                type: 'number',
                validator:"required number"
            }, {
                name: 'contact',
                type: 'number',
                validator:["required", "string"]
            }, {
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
            }],

            loadComplete:function(data){

                console.log(data)
            }
        }).dataBind();

        console.log(dataAdapter.updateRow({
            "id": "121212121",
            "contact": "2332423432432",
            "mobile": "2332",
            "phone": '',
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "asdasdsa",
            "first": "0"
        }));

        console.log(dataAdapter.updateCell("3333333"));

        dataAdapter.deleteRow();

        console.log(dataAdapter.appendRow({
            "id": 11111111111,
            "contact": "2332423432432",
            "mobile": 1,
            "phone": 12313213,
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "asdasdsa",
            "first": "0"
        },4))

        console.log(dataAdapter.prependRow({
            "id": 3333333333333333,
            "contact": "2332423432432",
            "mobile": 1,
            "phone": 12313213,
            "im": "0",
            "weixin": "",
            "skype": "",
            "email": "",
            "address": "asdasdsa",
            "first": "0"
        },5))


});
