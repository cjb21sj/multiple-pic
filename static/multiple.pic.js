
$(function () {
	var multiple = {
		info:function(info) {
				$(".layerNote .font14").text(info);
				$(".layerNote").fadeIn();
				setTimeout(function(){
					$(".layerNote").fadeOut();
				},1500);
				return false;
			},
		infoShow:function(info) {
					$(".layerNote .font14").text(info);
					$(".layerNote").fadeIn();
					return false;
				},
		infoHide:function() {
					setTimeout(function(){
						$(".layerNote").fadeOut();
					},1500); 
					return false;
				},
		
		rotateImg:function(img, direction,canvas) { //对图片旋转处理
					//最小与最大旋转方向，图片旋转4次后回到原方向  
					var min_step = 0;  
					var max_step = 3;  
					if (img == null)return;  
					//img的高度和宽度不能在img元素隐藏后获取，否则会出错  
					var height = img.height;  
					var width = img.width; 
					var step = 2;  
					if (step == null) {  
						step = min_step;  
					}  
					if (direction == 'right') {  
						step++;  
						//旋转到原位置，即超过最大值  
						step > max_step && (step = min_step);  
					} else {  
						step--;  
						step < min_step && (step = max_step);  
					}
					//旋转角度以弧度值为参数  
					var degree = step * 90 * Math.PI / 180;  
					var ctx = canvas.getContext('2d');  
					switch (step) {  
						case 0:  
							canvas.width = width;  
							canvas.height = height;  
							ctx.drawImage(img, 0, 0);  
							break;  
						case 1:  
							canvas.width = height;  
							canvas.height = width;  
							ctx.rotate(degree);  
							ctx.drawImage(img, 0, -height);  
							break;  
						case 2:  
							canvas.width = width;  
							canvas.height = height;  
							ctx.rotate(degree);  
							ctx.drawImage(img, -width, -height);  
							break;  
						case 3:  
							canvas.width = height;  
							canvas.height = width;  
							ctx.rotate(degree);  
							ctx.drawImage(img, -width, 0);  
							break;  
					}  
				},
		getBase64:function(obj,Orientation){//获取图片base64值 | get the base64 of the selected picture 
					var expectWidth = obj.naturalWidth;
					var expectHeight = obj.naturalHeight;
					var canvas = document.createElement("canvas");
					var ctx = canvas.getContext("2d");
					canvas.width = expectWidth;
					canvas.height = expectHeight;
					ctx.drawImage(obj, 0, 0, expectWidth, expectHeight);
					var base64 = null;
					//修复ios
					if (navigator.userAgent.match(/iphone/i)) {
						console.log('iphone');
						//如果方向角不为1，都需要进行旋转 added by lzk
						if(Orientation != "" && Orientation != 1){
							switch(Orientation){
								case 6://需要顺时针（向左）90度旋转
									multiple.rotateImg(obj,'left',canvas);
									break;
								case 8://需要逆时针（向右）90度旋转
									multiple.rotateImg(obj,'right',canvas);
									break;
								case 3://需要180度旋转
									multiple.rotateImg(obj,'right',canvas);//转两次
									multiple.rotateImg(obj,'right',canvas);
									break;
							}       
						}
						
						base64 = canvas.toDataURL("image/jpeg", 0.1);
					}else if (navigator.userAgent.match(/Android/i)) {// 修复android
						var encoder = new JPEGEncoder();
						base64 = encoder.encode(ctx.getImageData(0, 0, expectWidth, expectHeight), 10);
					}else{
						if(Orientation != "" && Orientation != 1){
							switch(Orientation){
								case 6://需要顺时针（向左）90度旋转
									multiple.rotateImg(obj,'left',canvas);
									break;
								case 8://需要逆时针（向右）90度旋转
									multiple.rotateImg(obj,'right',canvas);
									break;
								case 3://需要180度旋转
									multiple.rotateImg(obj,'right',canvas);//转两次
									multiple.rotateImg(obj,'right',canvas);
									break;
							}       
						}
						
						base64 = canvas.toDataURL("image/jpeg", 0.1);
					}

					return base64;
				},
	};
	
	var keys,classLen,kk;
	var home_url = $('input[name="home_url"]').val();
	localStorage.removeItem('keys');
	
	$("#logo").on('click',function () {
		this.value = '';
	});
	$("#logo").on('change',function(){
		var selectedFile = $("#logo").val();
		if (selectedFile) {
			var size = document.getElementById('logo').files[0].size;
			console.log('size--:'+size);
			var picTypes = new Array('jpg','jpeg','png','JPG','JPEG','PNG'); //定义可支持的文件类型数组 types of picture
			var newFileName = selectedFile.split('.');
			newFileName = newFileName[newFileName.length-1];
			if($.inArray(newFileName,picTypes) == -1){
				multiple.info("上传文件必须是jpg,jpeg,或png格式！");
				return false;
			}
		} else {
			multiple.info("无效文件!");
			return false;
		}

		classLen = $('.pic_list').length;
		if(classLen>9){
			multiple.info('不能超过9张!');
			return;
		}
		
		if($("#logo").val() != ''){
			multiple.infoShow('图片处理中');
			var file = null ;
			var fileInput = document.getElementById('logo');
			var files = fileInput.files;
			var len = files.length;
			var allLen = parseInt(classLen)+parseInt(len);
			if(allLen > 9){
				multiple.info('不能超过9张!');
				return false;
			}
			if(allLen === 9){
				$('.sctp_btns.pic').fadeOut();
			}

			if((allLen<=9) && (len>=1)){
				if(localStorage.getItem('keys')){
					kk = JSON.parse(localStorage.getItem('keys'));
					//console.log('--JSON.stringify(kk):'+JSON.stringify(kk));
					if(len <= kk.length) {
						//当删除的图片数(localStorage.getItem('keys))大于等于重新上传的图片
						for (var ms = 0;ms<len;ms++) {
							if(len < (parseInt(ms)+1)){
								break;
							}
							var file = files[ms];
							/*图片旋转**/
							var Orientation = null;

							//获取照片方向角属性，用户旋转控制
							EXIF.getData(file, function() {
								EXIF.getAllTags(this);  
								Orientation = EXIF.getTag(this, 'Orientation');
							});

							var mpImg = new MegaPixImage(file);
							resImg = new Image();
							mpImg.render(resImg, {quality: 0.1 });

							$(resImg).on('load',{"i":kk[0]},function (d,s) {

								var base64 = multiple.getBase64(this,Orientation);
								var src = $(this).attr('src');
								var cla = 'resultImage'+d.data.i;
								if(src.indexOf("base64")>-1){
									if(!base64){
										multiple.info('图片压缩失败');
										return false;
									}

									$('.upload_tu_list').prepend('<dd class="pic_list resultImage'+d.data.i+'"><img src="'+base64+'" id="resultImage'+d.data.i+'" class="resultImage" style="width:100%;height:100%;"><span class="deletion pic" item="resultImage'+d.data.i+'" key="'+d.data.i+'"></span></dd>');

									var tmpInput = '<input type="hidden" class="'+cla+'" name="img[]" value="'+base64+'">';
									$("#picForm").append(tmpInput);
								}
							})
							console.log('--JS--ON.stringify(kk):'+JSON.stringify(kk))
							kk.shift();
							localStorage.setItem('keys',JSON.stringify(kk));
						}
					}else{
						//当删除的图片小于重新上传的图片，
						//1.先上传删除的keys 中保存的kk[0]
						//2.在‘keys'变成[]之后，在当前的基础上进行添加

						var kkLen = 0 ;
						if(kk.length > 0) kkLen = kk.length-1;
						for(var i=classLen,j=0;j<len;i++,j++){
							var file = files[j];
							/*图片旋转**/
							var Orientation = null;

							//获取照片方向角属性，用户旋转控制
							EXIF.getData(file, function() {
								EXIF.getAllTags(this);  
								Orientation = EXIF.getTag(this, 'Orientation');
							});

							var mpImg = new MegaPixImage(file);
							resImg = new Image();
							mpImg.render(resImg, {quality: 0.1 });

							if(kk.length > 0){
								$(resImg).on('load',{"i":kk[0]},function (d,s) {
									var base64 = multiple.getBase64(this,Orientation);
									var src = $(this).attr('src');
									var cla = 'resultImage'+d.data.i;
									if(src.indexOf("base64")>-1){
										if(!base64){
											multiple.info('图片压缩失败');
											return false;
										}

										$('.upload_tu_list').prepend('<dd class="pic_list resultImage'+d.data.i+'"><img src="'+base64+'" id="resultImage'+d.data.i+'" class="resultImage" style="width:100%;height:100%;"><span class="deletion pic" item="resultImage'+d.data.i+'" key="'+d.data.i+'"></span></dd>');

										var tmpInput = '<input type="hidden" class="'+cla+'" name="img[]" value="'+base64+'">';
										$("#picForm").append(tmpInput);
									}
								})
								kk.shift();
								localStorage.setItem('keys',JSON.stringify(kk));
							}else{
								 //todo  ii 不连续 但不会出现重复值现象 
								 $(resImg).on('load',{"ii":parseInt(kkLen+i)},function (d,s) {
									var base64 = multiple.getBase64(this,Orientation);
									var src = $(this).attr('src');
									var cla = 'resultImage'+d.data.ii;
									if(src.indexOf("base64")>-1){
										if(!base64){
											multiple.info('图片压缩失败');
											return false;
										}

										$('.upload_tu_list').prepend('<dd class="pic_list resultImage'+d.data.ii+'"><img src="'+base64+'" id="resultImage'+d.data.ii+'" class="resultImage" style="width:100%;height:100%;"><span class="deletion pic" item="resultImage'+d.data.ii+'" key="'+d.data.ii+'"></span></dd>');

										var tmpInput = '<input type="hidden" class="'+cla+'" name="img[]" value="'+base64+'">';
										$("#picForm").append(tmpInput);
									}
								})   
							}
						}
					}
				}else{
					for(var i=classLen,j=0;j<len;i++,j++){

						var file = files[j];

						/*rotate picture*/
						var Orientation = null;

						//获取照片方向角属性，用户旋转控制
						EXIF.getData(file, function() {
							EXIF.getAllTags(this);  
							Orientation = EXIF.getTag(this, 'Orientation');
						});

						var mpImg = new MegaPixImage(file);
						var resImg = new Image();
						mpImg.render(resImg, {quality: 0.1 });

						$(resImg).on('load',{"i":i},function (d,s) {
							
							var base64 = multiple.getBase64(this,Orientation);

							var src = $(this).attr('src');
							var cla = 'resultImage'+d.data.i;

							if(src.indexOf("base64")>-1){
								if(!base64){
									multiple.info('图片压缩失败');
									return false;
								}
								
								$('.upload_tu_list').prepend('<dd class="pic_list resultImage'+d.data.i+'"><img src="'+base64+'" id="resultImage'+d.data.i+'" class="resultImage" style="width:100%;height:100%;"><span class="deletion pic" item="resultImage' + d.data.i + '" key="' + d.data.i + '"></span></dd>');

								var tmpInput = '<input type="hidden" class="'+cla+'" name="img[]" value="'+base64+'">';
								$("#picForm").append(tmpInput);
							}
						})
					}
				}
			}
			multiple.infoHide();
		}
	});
	
	//delete this picture
	$('.upload_tu_list').on('click','.pic_list .deletion.pic',function () {
		var item = $(this).attr('item');
		var key = parseInt($(this).attr('key'));
		console.log('item:'+item+'--key:'+key);
		$('.'+item).remove();
		if(localStorage.getItem('keys')){
			keys =  JSON.parse(localStorage.getItem('keys'));
		}else{
			keys = new Array();
		}
		keys.push(key);
		localStorage.setItem('keys',JSON.stringify(keys));
		console.log('keys',localStorage.getItem('keys'));
	});
	
	//createPic
	var submit_flag = 0;
	$('.share_rten.create_pic').on('click',function () {

		$('div.motail_wrap').show();
		if(submit_flag) {
			$('div.motail_wrap').fadeOut();
			return false;
		}
		
		var options ={
			async:false,
			url:post_url,
			type:'post',
			data:null,
			dataType:'json',
			timeout: 8000,
			success:function(res,st){
				if(res.status == 200){
					$('.share_rten.create_pic').unbind("click");
					$('div.motail_wrap').fadeOut();
					$(".layerNote .font14").text(res.data.msg);
					$(".layerNote").fadeIn();
					setTimeout(function(){
						location.href = res.data.url;
						$(".layerNote").fadeOut();
					},1500)
					return false;
				}else{
					submit_flag = 0;
					multiple.info(res.data);
					$('div.motail_wrap').fadeOut();
					return;
				}
			},  
			error: function(XmlHttpRequest, textStatus, errorThrown){ 
				$(".layerNote .font14").text('TimeOut');
				$(".layerNote").fadeIn();              
				setTimeout(function(){
					location.reload();
					$(".layerNote").fadeOut();
				},1500);
			} 
		};
		submit_flag = 1;
		$('#picForm').ajaxSubmit(options);
	})
})
