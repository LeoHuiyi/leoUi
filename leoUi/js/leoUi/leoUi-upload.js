/**
+-------------------------------------------------------------------
* jQuery leoUi--upload
+-------------------------------------------------------------------
* @version    1.0.0 beta
* @author     leo
* 只支持html5、ajax2上传
+-------------------------------------------------------------------
*/
;(function(factory) {

    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["leoUi-tools"], factory);

    } else {

        // Browser globals
        factory(jQuery);

    }

}(function($) {

    $.leoTools.plugIn({

        name:'leoUpload',

        version:'1.0',

        addJquery:false,

        addJqueryFn:true,

        defaults:{

            uploadHtml:'<div class="leoUpload"><div class="main"><div class="choose"><input id="fileImage" type="file" size="30" name="fileselect[]" multiple="" class="fileButton"><span id="fileDragArea" class="drag-area">或者将图片拖到此处</span></div><div id="preview" class="preview"></div></div><div class="submit"><button type="button" id="fileSubmit" class="submit-btn">确认上传</button></div></div>',

            fileInputSelector:'#fileImage',

            dragDropAreaSelector:'#fileDragArea',

            upButtonSelector:'#fileSubmit',

            previewSelector:'#preview',

            fileDeleteSelector:'.filedeleteicon',

            ajax:{

            	url:'',

            	fileName:'file'

            },

            filter:false,//选择文件组的过滤方法

			onStartAjax:$.noop,//开始AJAX上传

			onSuccess:$.noop, //文件上传成功时

			onFailure:$.noop, //文件上传失败时

			onComplete:$.noop //文件全部上传完毕时

        },

        _init: function(){

            this.leoUploadId = $.leoTools.getId('leoUpload') + '-';

            this.uid = 0;

            this.fileFilter = [];

            this.previewsArr = [];

            this.previewsState = "stop";

            this.$target.append(this.options.uploadHtml);

        	this._addEvent();

        },

        _addEvent:function(){

        	var This = this, op = this.options,

        	$target = this.$target;

        	this._on($target, 'dragover', op.dragDropAreaSelector, function(event){

        		This._funDragHover(event);

        	})._on($target, 'dragleave', op.dragDropAreaSelector, function(event){

        		This._funDragHover(event);

        	})._on($target, 'drop', op.dragDropAreaSelector, function(event){

        		This._getFiles(event);

        	})._on($target, 'change', op.fileInputSelector, function(event){

        		This._getFiles(event);

        	})._on($target, 'click', op.upButtonSelector, function(event){

        		This._uploadFile(event);

        	})._on($target, 'click', op.fileDeleteSelector, function(event){

        		This.deleteFile($(this).attr("data-index"));

        	});

        },

        _funDragHover:function(event){

			event.stopPropagation();

			event.preventDefault();

			this[event.type === "dragover" ? "_dragOver" : "_dragLeave"].call(event.target);

			return this;

		},

		_dragOver: function() {

            $(this).addClass("drag-hover");

        },

        _dragLeave: function() {

            $(this).removeClass("drag-hover");

        },

        _getOriginalEvent:function(event){

        	if(event.originalEvent){

        		return event.originalEvent;

        	}

        	return event;

        },

		_getFiles:function(event){

			event = this._getOriginalEvent(event);

			this._funDragHover(event);

			var files = event.target.files || event.dataTransfer.files;

			this._setFileFilter(files);

			return this;

		},

		_setFileFilter:function(files){

			var length = files.length, i = 0,

			filter = this.options.filter, file;

			for (; i < length; i++) {

				file = files[i];

				if(filter){

					if((file = filter(file))){

						file.index = this.uid++;

						this.fileFilter.push(file);

						this.previewsArr.push(file);

					}else{

						if(!this.fileFilter.length){

			                this._restoreBtn();

			            }

					}

				}else{

					file.index = this.uid++;

					this.fileFilter.push(file);

					this.previewsArr.push(file);

				}

			}

			this.previewsState === "stop" && this._appendPreview();

			if(this.fileFilter.length > 0){

                this.$target.find(this.options.upButtonSelector).show();

            }

			return this;

		},

		_deleteFile:function(id) {

            $("#" + this.leoUploadId + "list-" + id).fadeOut(function(){

            	$(this).remove();

            });

        },

		_deleteAllFiles:function(){

			this.fileFilter = [];

			return this;

		},

		clearDropArea:function(){

			this._deleteAllFiles();

			this._restoreBtn();

			this.$target.find(this.options.previewSelector).empty();

		},

		_progress:function(file, loaded, total) {

            $("#" + this.leoUploadId + "progress-" + file.index).show().html((loaded / total * 100).toFixed(2) + '%');

        },

        _getAjaxOp:function(){

        	return $.extend(true, this.options.ajax, {

				type: 'POST',

				processData: false,

				contentType: false,

        	});

        },

        _getAjaxDate:function(ajaxOp, file){

        	var formData = new FormData(), prop, data,

        	This = this;

        	ajaxOp = $.extend(true, {}, ajaxOp);

        	data = ajaxOp.data;

        	if(typeof data === 'object'){

        		for(prop in data){

        			if(data.hasOwnProperty(prop)){

        				formData.append(prop, data[prop]);

        			}

        		}

        	}

        	formData.append(ajaxOp.fileNmae, file);

        	ajaxOp.data = formData;

        	ajaxOp.xhr = function(){

                var xhr = $.ajaxSettings.xhr();

                xhr.upload.onprogress = function (event) {

                    if(event.lengthComputable) {

                    	This._progress(file, event.loaded, event.total);

                    }

                };

                return xhr;

            };

        	return ajaxOp;

        },

		_uploadFile:function() {

			var This = this, op = this.options,

			i = 0, file, ajaxOp = this._getAjaxOp();

			if(location.host.indexOf("sitepointstatic") >= 0){

				return;

			}

			op.onStartAjax();

			for(; file = this.fileFilter[i]; i++){

				(function(file) {

					$.ajax(This._getAjaxDate(ajaxOp, file)).done(function(data) {

						op.onSuccess(file, data);

						if (!This.fileFilter.length) {

							This._restoreBtn();

							op.onComplete();

						}

					})
					.fail(function(data) {

						op.onFailure(file, data);

					});

				})(file);

			}

		},

		_restoreBtn: function() {

			var op = this.options;

            this.$target.find(op.upButtonSelector).hide().end().find(op.fileInputSelector).val("");

        },

        _deleteFileFn:function(id){

        	var i = this.fileFilter.length;

        	while(i--){

        		if(+this.fileFilter[i].index === +id){

        			this.fileFilter.splice(i, 1);

        			break;

        		}

        	}

        	return this;

        },

        deleteFile:function(id){

        	var op = this.options, $target = this.$target;

			this._deleteFileFn(id);

			this._deleteFile(id);

            if(!this.fileFilter.length){

                this._restoreBtn();

            }else{

            	$target.find(op.upButtonSelector).show();

            }

            return this;

        },

        _appendPreview:function(){

        	var file = this.previewsArr.shift();

        	if(file){

                this.previewsState = "start";

        		file.type.indexOf('image') === -1 ? this._appendOther(file) : this._appendImage(file);

        	}else{

                this.previewsState = "stop";

            }

        },

		_appendImage:function(file){

			var reader = new FileReader(),

			This = this, index = file.index,

			leoUploadId = this.leoUploadId;

            reader.onload = function(event) {

                This.$target.find(This.options.previewSelector).append('<div id="'+leoUploadId+'list-'+ index +'" class="append-list">'+
                    '<a href="javascript:" class="filedeleteicon" title="删除" data-index="'+ index +'"></a>' +
                    '<img src="' + event.target.result + '"/><span title="' + file.name + '">' + file.name + '</span>'+
                    '<span id="'+leoUploadId+'progress-' + index + '" class="progress"></span>' +
                '</div>');

                This._appendPreview();

            };

            reader.readAsDataURL(file);

            return this;

		},

		_appendOther:function(file){

			var index = file.index,

			leoUploadId = this.leoUploadId;

			this.$target.find(this.options.previewSelector).append('<div id="'+leoUploadId+'list-'+ index +'" class="append-list">'+
                '<a href="javascript:" class="filedeleteicon" title="删除" data-index="'+ index +'"></a>' +
                '<img src="../images/leoUi/leoUi-leoUpload-fileicon.png"/><span title="' + file.name + '">' + file.name + '</span>'+
                '<span id="'+leoUploadId+'progress-' + index + '" class="progress"></span>' +
            '</div>');

            this._appendPreview();

            return this;

		}

    });

    return $;

}));