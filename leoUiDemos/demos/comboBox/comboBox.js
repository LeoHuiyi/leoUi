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

leoUiLoad.require('jquery,leoUi-comboBox,leoUi,ready', function($) {

    var data = [{
                id: 'c++',
                name: 'c++1'
            }, {
                id: 'java',
                name: 'java'
            }, {
                id: 'php',
                name: 'php'
            }, {
                id: 'coldfusion',
                name: 'coldfusion'
            }, {
                id: 'javascript',
                name: 'javascript'
            }, {
                id: 'asp',
                name: 'asp'
            }, {
                id: 'ruby',
                name: 'ruby'
            }, {
                id: 'python',
                name: 'python'
            }, {
                id: 'c',
                name: 'c'
            }, {
                id: 'scala',
                name: 'scala'
            }, {
                id: 'groovy',
                name: 'groovy'
            }, {
                id: 'haskell',
                name: 'haskell'
            }, {
                id: 'perl',
                name: 'perl'
            }];

    $('.input').leoComboBox({

    	source:data,

        width:200,

        menuItemHtmlFn:function(data, i, inputVal){//data._disableItem = true不设置为menuItem

            data.value === 'php' && (data._disableItem = true);

            return '<div tabindex="-1"><span>' + data.value + '</span></div>';

        },

        labelKey: 'id',

        valueKey: 'name',

        listMenuHtml:'<div class="leoListMenu"><div class="leoListMenu_menuContentIn"></div><div style="height:20px">11</div></div>'

    });

    data1 = [{
                label: 'c++-------label',
                value: 'c++-------value'
            }, {
                label: 'java--------label',
                value: 'java-------value'
            }];

    $('#button').on('click', function(event) {
        event.preventDefault();
        // $leoListMenu.option('menuItemHtmlFn', function(data){

        //     return '<div class="leoListMenu_item" tabindex="-1">' + data.label + '</div>';

        // })
        // $leoListMenu.refresh(data1)

        $('.input').leoComboBox('addItem',{
                id: 'c++-------label',
                name: 'c++-------value'
            },'first');
    });
    $('#button1').on('click', function(event) {
        event.preventDefault();
        // $leoListMenu.option('menuItemHtmlFn', function(data){

        //     return '<div class="leoListMenu_item" tabindex="-1">' + data.label + '</div>';

        // })
        // $leoListMenu.refresh(data1)
        // $('#input').leoAutocomplete('next');
        console.log($('.input').leoComboBox('getSeleteLabel'));
    });

    $('#button2').on('click', function(event) {
        event.preventDefault();
        $('#input').leoComboBox('close');

    });

});