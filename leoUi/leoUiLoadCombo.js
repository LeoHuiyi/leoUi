/**
+-------------------------------------------------------------------
* leoUi--合并leoUiLoadCombo
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
+-------------------------------------------------------------------
*/
var rExistId = /define\(\s*['"][^\[\('"\{]+['"]\s*,?/,

	rProtocol = /^(http(?:s)?\:\/\/|file\:.+\:\/)/,

	rModId = /([^\\\/?]+?)(\.(?:js|css))?(\?.*)?$/,

	rRightEnd = /,?\s*(?:(function\s*\(.*|\{.*)|[^\(\["\]]*\))/,

	rPullDeps = /((?:define|leoUiLoad\.require)\(.*)/g,

	rDeps = /((?:define|leoUiLoad\.require)\([^\[\(\{]*\[)([^\]]+)/,

	rNames = /((?:define|leoUiLoad\.require)\()[\'\"]([^\[\(\{]*)[\'\"],/,

	rDefine = /define\(/,

	rword = /[^, ]+/g,

	rConfig = /(?:leoUiLoad\.config\([^\)]*\))/g,

	fs = require('fs'),

	path = require('path'),

	depsCache = {},

	hasOwn = Object.prototype.hasOwnProperty,

	class2type = {},

	core_toString = class2type.toString,

	type = function( obj ) {

		if ( obj === null ) {

			return String( obj );

		}

		return typeof obj === "object" || typeof obj === "function" ? class2type[ core_toString.call(obj) ] || "object" : typeof obj;

	},

	isArray = Array.isArray || function( obj ) {

		return type(obj) === "array";

	},

	isObj = function( obj ) {

		return type(obj) === "object";

	},

	define = function(name, deps) {

		if (Array.isArray(name)) {

			deps = name;

		}

		return deps;

	},

	leoUiLoad = {

		require: function(ids) {

			return typeof ids === 'string' ? ids.replace('ready', '').split(',') : ids;

		},

		config: function(obj) {

			return obj || {};

		}

	},

	mix = function minIn(receiver, supplier, deep) {

		var key,copy,target,copyIsArray,clone;

		if(receiver === supplier){

			return receiver;

		}

		for (key in supplier) {

			if (hasOwn.call(supplier, key)) {

				copy = supplier[key];

				target = receiver[key];

				if ( deep && copy && ( isObj(copy) || (copyIsArray = isArray(copy)) ) ) {

					if ( copyIsArray ) {

						copyIsArray = false;

						clone = target && isArray(target) ? target : [];

					} else {

						clone = target && isObj(target) ? target : {};

					}

					receiver[key] = minIn(clone, copy, deep);

				}else if( copy !== undefined ){

					receiver[key] = copy;

				}

			}

		}

		return receiver;
	},

	comboConfig = function(configArr, config){

		var i;

		if(configArr && (i = configArr.length)){

			while(i--){

				config = mix(config, eval(configArr[i]), true);

			}

		}

		return config;

	},

	//扫描文件夹名称和文件名
	scanFolder = function (path, deep){

        var fileList = [],

            folderList = [],

            jsFileList = [],

            walk = function(path, fileList, folderList, jsFileList){

                var files = fs.readdirSync(path);

                files.forEach(function(item) {

                    var tmpPath = path + '/' + item,

                        stats = fs.statSync(tmpPath);

                    if(stats.isDirectory()) {

                        !!deep && walk(tmpPath, fileList, folderList, jsFileList);

                        folderList.push(tmpPath);

                    }else{

                    	fileList.push(tmpPath);

                        ~item.indexOf('.js') && jsFileList.push(tmpPath);

                    }

                });

            };

        walk(path, fileList, folderList, jsFileList);

        console.log('扫描' + path +'成功');

        return {

        	'jsFiles': jsFileList,

            'files': fileList,

            'folders': folderList

        }

    },

	// 分析模块的依赖，将依赖模块的模块标识组成一个数组以便合并
	parseDeps = function(key, mods, encoding, config, baseUrl) {

		var cache = depsCache[key],

			deps = [];

			config = config || {};

		mods.forEach(function(modUrl) {

			var content, literals, alias, shim;

			if (~modUrl.indexOf('.css')) {

				return;

			}

			if (!~modUrl.indexOf('.js')) {

				modUrl += '.js'

			}

			// 读取文件
			try {

				content = fs.readFileSync(modUrl, encoding);

			} catch (error) {

				console.log('Read file ' + error);

				deps = null;

				return;

			}

			// 将define(), require()用正则提取出来
			literals = content.match(rPullDeps);

			config = comboConfig(content.match(rConfig) || [], config);

			alias = config.alias;

			shim = config.shim;

			literals.forEach(function(literal, i) {

				var arr, depsArr = [];
				// define('hello', ['hello1'], function(){  =>  define('hello', ['hello1'])
				// require('hello', function(){  =>  require('hello')
				literal = literal.replace(rRightEnd, ')');
				// 然后用eval去执行处理过的define和require获取到依赖模块的标识
				arr = eval(literal);

				if (arr && arr.length) {
					// 为依赖模块解析真实的模块路径
					arr.forEach(function(item, i) {

						var prop, isShim = false;

						if (alias) {

							for (prop in alias) {

								if (item === prop) {

									item = alias[prop];

								}

							}

						}

						if (shim) {

							for (prop in shim) {

								if (item === prop) {

									item = shim[prop].src;

								}

							}

						}

						if (item) {

							depsArr.push(path.resolve(baseUrl, item));

						}

					});

					deps = deps.concat(depsArr);

				}

			});

		});

		if (deps.length > 0) {

			cache.ids = deps.concat(cache.ids);

			// 递归调用直到所有的依赖模块都添加完
			parseDeps(key, deps, encoding, config, baseUrl);

		}

	},

	formatDeps = function(_, define, deps) {

		var arr = deps.split(','),
			len = arr.length,
			i = 0,
			item, index;

		for (; i < len; i++) {

			item = arr[i];

			item = item.replace(/['"]/g, '').trim();

			index = item.lastIndexOf('/');

			arr[i] = ~index ? item.slice(index + 1) : item;

		}

		return define + "'" + arr.join("','") + "'";

	},

	formatNames = function(_, define, deps) {

		var arr = deps.split(','),
			len = arr.length,
			i = 0,
			item, index;

		for (; i < len; i++) {

			item = arr[i];

			item = item.replace(/['"]/g, '').trim();

			index = item.lastIndexOf('/');

			arr[i] = ~index ? item.slice(index + 1) : item;

		}

		return define + "'" + arr.join(",") + "',";

	},

	//创建文件夹
	mkdirSync = function(url, mode, cb) {

		var arr = url.split("/");

		mode = mode || 0755;

		cb = cb || function() {};

		if (arr[0] === ".") { //处理 ./aaa

			arr.shift();

		}

		if (arr[0] == "..") { //处理 ../ddd/d

			arr.splice(0, 2, arr[0] + "/" + arr[1]);

		}

		function inner(cur) {

			if (!fs.existsSync(cur)) { //不存在就创建一个

				fs.mkdirSync(cur, mode);

			}

			if (arr.length) {

				inner(cur + "/" + arr.shift());

			} else {

				cb();

			}

		}

		arr.length && inner(arr.shift());

	},

	// 合并内容
	comboContent = function(key, baseUrl, encoding, format) {

		var cache = depsCache[key],
			unique = cache.unique,
			ids = cache.ids;

		ids.forEach(function(id) {

			var modName = id.match(rModId)[1],

				modUrl = path.resolve(baseUrl, id),

				content;

			if (~modUrl.indexOf('.css')) {

				return;

			}

			if (!~modUrl.indexOf('.js')) {

				modUrl += '.js';

			}

			content = fs.readFileSync(modUrl, encoding);

			// 非require()的情况下防止重复合并
			if (!~content.indexOf('leoUiLoad\.require(')) {

				if (unique[modUrl]) {

					return;

				}

				unique[modUrl] = true;

			}

			// utf-8 编码格式的文件可能会有 BOM 头，需要去掉
			if (encoding === 'UTF-8' && content.charCodeAt(0) === 0xFEFF) {

				content = content.slice(1);

			}

			// 格式化
			if (typeof format === 'function') {

				content = format(content);

			}

			if (rConfig.test(content)) {

				content = content.replace(rConfig, "");

			};

			// 为匿名模块添加模块名
			if (!rExistId.test(content)) {

				content = content.replace(rDefine, "define('" + modName + "',");

			}

			// 格式化依赖模块列表 ['../hello5'] => ['hello5']
			content = content.replace(rDeps, formatDeps);

			content = content.replace(rNames, formatNames);

			// 合并
			cache.contents += content + '\n';

			console.log('Combo the [' + modName + '] success.');

		});

	},

	// 写入文件
	writeFile = function(key, mod, uglifyUrl) {

		var output = mod.output,

			outputDir = output.replace(/\/[^\/]*(?:.js)$/, ''),

			contents = depsCache[key].contents,

			uglify, jsp, pro, ast;

		contents = "leoUiLoad.config.options.isLeoUiCombo = true;\n" + contents;

		// 压缩文件
		if (uglifyUrl) {

			uglify = require(uglifyUrl);

			jsp = uglify.parser;

			pro = uglify.uglify;

			ast = jsp.parse(contents);

			ast = pro.ast_mangle(ast);

			ast = pro.ast_squeeze(ast);

			contents = pro.gen_code(ast);

		}

		// 合并好文本内容后的回调
		// if (typeof complete === 'function') {

		// 	contents = complete(contents);

		// }

		// 写入文件
		try {

			mkdirSync(outputDir);

			fs.writeFileSync(output, contents, mod.encoding);

		} catch (error) {

			console.log('Output file ' + error);

			return;

		}

		console.log('\n');

		console.log('============================================================');

		console.log('Output the [' + output + '] success.');

		console.log('============================================================');

		console.log('\n');

		delete depsCache[key];

	},

	modulesCombo = function(modules, baseUrl, options){

		var config = options.config;

		modules.forEach(function(mod) {

			var encoding = mod.encoding = (mod.encoding || 'UTF-8').toUpperCase(),

				randomKey = (+new Date() + '') + (Math.random() + '').slice(-8);

			depsCache[randomKey] = {

				ids: [],

				unique: {},

				contents: ''

			};

			mod.input.forEach(function(id) {

				var modUrl = path.resolve(baseUrl, id);

				depsCache[randomKey].ids.push(modUrl);

				parseDeps(randomKey, [modUrl], encoding, config, baseUrl);

			});

			comboContent(randomKey, baseUrl, encoding, mod.format);

			writeFile(randomKey, mod, options.uglifyUrl);

		});

	},

	leoUiLoadCombo = function(options) {

		var modules = options.modules,files,i,newModules,file,folder,reFile,

		baseUrl = path.resolve() + options.baseUrl,outputSrc;

		if(Array.isArray(modules)){

			modulesCombo(modules, baseUrl, options);

		}

		if((folder = options.folder)){

			files = scanFolder(path.resolve(baseUrl, folder.inputSrc), folder.deep).jsFiles;

			i = files.length;

			outputSrc = folder.outputSrc;

			newModules = [];

			reFile = /\/[^\/]*(?:.js)$/;

			while(i--){

				file = files[i];

				newModules.push({

					input:[file],

					output: outputSrc + files[i].match(reFile, '')[0]

				})

			}

			modulesCombo(newModules, baseUrl, options);

		}

	};

exports.leoUiLoadCombo = leoUiLoadCombo;