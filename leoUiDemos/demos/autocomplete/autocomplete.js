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

leoUiLoad.require('jquery,leoUi-autocomplete,leoUi,ready', function($) {

    var data = [{
                label: 'c++',
                value: 'c++1'
            }, {
                label: 'java',
                value: 'java'
            }, {
                label: 'php',
                value: 'php'
            }, {
                label: 'coldfusion',
                value: 'coldfusion'
            }, {
                label: 'javascript',
                value: 'javascript'
            }, {
                label: 'asp',
                value: 'asp'
            }, {
                label: 'ruby',
                value: 'ruby'
            }, {
                label: 'python',
                value: 'python'
            }, {
                label: 'c2',
                value: 'c2'
            }, {
                label: 'c3',
                value: 'c3'
            }, {
                label: 'c4',
                value: 'c5'
            }, {
                label: 'c',
                value: 'c6'
            }, {
                label: 'c',
                value: 'c7'
            }, {
                label: 'c',
                value: 'c'
            }, {
                label: 'scala',
                value: 'scala'
            }, {
                label: 'groovy',
                value: 'groovy'
            }, {
                label: 'haskell',
                value: 'haskell'
            }, {
                label: 'perl',
                value: 'perl'
            }];

    $('#input').leoAutocomplete({

    	source:data,

        width:150,

        menuItemHtmlFn:function(data){//data._disableItem = true不设置为menuItem

            data.value === 'php' && (data._disableItem = true);

            return '<div tabindex="-1"><span>' + data.value + '</span></div>';

        },

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
        
        $('#input').leoAutocomplete('addItem',{
                label: 'c++-------label',
                value: 'c++-------value'
            },'first');
    });
    $('#button1').on('click', function(event) {
        event.preventDefault();
        // $leoListMenu.option('menuItemHtmlFn', function(data){

        //     return '<div class="leoListMenu_item" tabindex="-1">' + data.label + '</div>';

        // })
        // $leoListMenu.refresh(data1)
        // $('#input').leoAutocomplete('next');
        $('#input').leoAutocomplete('destroy');
    });

    $('#button2').on('click', function(event) {
        event.preventDefault();
        $('#input').leoAutocomplete('close');

    });

});