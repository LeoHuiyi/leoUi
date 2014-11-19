require('./leoUi/leoUiLoadCombo.js') //相对于build.js的路径
	.leoUiLoadCombo({
		// baseUrl: '/leoUi', //是需要合并的模块的基础路径。
		// uglifyUrl: '../uglify/uglify-js', //是压缩工具 uglify 的路径。
		// modules: [{ //可以传一组待合并的数据。
		// 	input: ['src/i_class.js'], //一个或一组待合并的的模块，(多个模块压缩成一个文件就是一组)。
		// 	output: 'leo/js/src/i_class.js' //输出合并文件路径
		// }],
		// folder: { //合并的文件夹下所有的数据
		// 	inputSrc: 'src',
		// 	待合并的文件夹路径
		// 	outputSrc: 'leo/js/src',
		// 	输出合并的文件夹路径
		// 	deep: false //是否深度递归所有的文件
		// },
		// config: { //配置文件可以统一放在这里

		// 	debug: false,

		// 	alias: {

		// 		'leoUiCss': '../css/leoUi.css',

		// 		'public': 'src/public',

		// 	},

		// 	shim: {

		// 		jquery: {

		// 			src: 'lib/jquery-1.11.1-min.js',

		// 			exports: "$"

		// 		}

		// 	}

		// }
	});