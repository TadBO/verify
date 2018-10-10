/**
 * @Author: Tuber
 * @Date: 2018/9/29
 * @Version: 1.0.1
 * @Last Modified by: Tuber
 * @Last Modified time: 2018/10/9
 */

/**
 * 图片拖拽验证，配合后台进行验证，后台提供图片资源以及验证接口
 * @params { imgUrl: '获取图片资源的url地址', checkUrl: '校验的请求url地址'}
 * todo 关于后台返回字段，一定要按我这边定义的字段位置，请求图片资源返回的参数：{state: 0, data: {bgSrc: '背景图片的src地址', moveSrc:'要移动的图片src地址', posY: '图片距离上面的高度'}, 'msg': 'successs'}，请求校验的参数： {x: 102}，返回参数：{state: 0, data: {}, 'msg': 'success'}
 */
class Verify {
    constructor(config) {
        this.oBar = null;
        this.oCon = null;
        this.oImg = null;
        this.oBtn = null;
        this.oRignt = null;
        this.oError = null;
        this.oBgImg = null;
        this.tips = null;
        this.token = null;
        this.mask = null;
        this.callback = config.callback || function () {};
        this.el = 'body';  //追加的位置
        this.imgUrl = config.imgUrl; //获取图片资源的请求地址
        this.checkUrl = config.checkUrl; //验证是否正确的请求地址
        try {
            if (!this.imgUrl || !this.checkUrl || typeof this.callback != 'function') {
                throw new Error('参数异常！');
            }
        } catch (e) {
            console.log(e);
            return false;
        }
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.styles();
        this.draw();
        this.event(this.callback);
    }

    /**
     * 创建dom
     */
    draw() {
        let verifyDom = `<div class="wrap"><div class="verify" id="Verify">
				<div class="verify_bar">
					<p class="verify_btn"></p>
					<p class="verify_txt">向右滑动滑块填充拼图</p>
				</div>
				<div class="verify_con">
					<div class="verify_slide_img"></div>
					<div class="verify_slide_bg"><img class="bg_img"/></div>
				</div>
				<div class="verify_tips">
					<p class="verify_res verify_right">验证成功</p>
					<p class="verify_res verify_error">验证失败</p>
				</div>
			</div></div>`,
            mask = document.createElement('div');
        mask.setAttribute('class', 'mask');
        mask.innerHTML = verifyDom;
        document.querySelector(this.el).appendChild(mask);
        this.oBar = document.querySelector('.verify_bar');
        this.oCon = document.querySelector('.verify_con');
        this.oImg = document.querySelector('.verify_slide_img');
        this.oBtn = document.querySelector('.verify_btn');
        this.oRignt = document.querySelector('.verify_right');
        this.oError = document.querySelector('.verify_error');
        this.oBgImg = document.querySelector('.bg_img');
        this.tips = document.querySelector('.verify_txt');
        this.options = document.querySelector('.verify_tips');
        this.mask = document.querySelector('.mask');
    }

    /**
     * 样式
     */
    styles() {
        let style = document.createElement('style');
        style.innerHTML = `body,html{margin: 0;padding: 0;}
                            .mask { width: 100%; height: 100%; position: fixed; left: 0; top: 0;background: rgba(0,0,0,.4); z-index: 999; display: none;}
                            .wrap{width: 500px;padding-top: 200px;position: absolute; left: 50%; margin-left: -250px; top: 50%; margin-top: -137px;background:#fff;padding-bottom: 40px;}
                            .verify{position: relative;width: 300px;margin: 0 auto;}
                            .verify_bar{height: 34px;width: 300px;position: relative;border: 1px solid #ccc;background: #eee;line-height: 34px;text-align: center;box-sizing: border-box;}
                            .verify_btn{position: absolute;height: 100%;width: 35px;left: 0px;cursor: pointer;padding: 0;margin: 0;background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAzUlEQVQ4T93TMQrCMBQG4P/v6jW8g7Nu4uTiomcwr64uXZ3SdHfxCiIIjnoCB8/RE/RJBItCCwlkEDO/fPC//CESHyb28GegiGyapnlUVXXuW1VUZBHZqWoOYOacu3ShUSAAGmP2AFZ9aCyIoiiyuq4PqrroQqNBH/MTJTkvy/L0jt+CeZ4PVXXpYwV2MwOwBjBQ1bFz7ubvtZeNMSOS00DMj7UgyYm19voFRkBhkUPB1I+StjbJiy0iW5J3a+0xydcL2XNo50Ks18zvg08WzGMVsuSGVQAAAABJRU5ErkJggg==) center center no-repeat;background-color: #fff;}
                             .verify_btn:hover {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAr0lEQVQ4T93TMQ5BQRSF4f9obcMe1HSi0mhYg+RprcAiNLYgEomSFShs58gU5JF58q6MREw9+XLPnTOi8FFhjz8DbS+Bq6RD06pCkW2vgQoYSzrm0CiY7m+AeRMaAtNEtjvAFpjm0DCYQSeS9vf4D9B2D5hB6yqlSRdAFxhIOie0DvaBUaDodXAo6fQEBqDXPeYjtwWLPortsrX5RrFXwEXSrsjXa7Pnj4r9Dv598AZDHjwV3Xu4TQAAAABJRU5ErkJggg==) center center no-repeat; background-color: #1991fa;}
                            .verify_bar:hover { border-color:  #1991fa;}   
                            .verify_txt{padding: 0;margin: 0;font-size: 12px;color: #999;}
                            .verify_con{position: absolute;width: 100%;height: 150px;bottom: 44px;left: 0;}
                            .verify_slide_img{position: absolute;height: 100%;width: 76px;left: 0;background-position: 0px 21px;background-repeat: no-repeat;}
                            .verify_tips{position: absolute;left: 100%;top: 0;padding-left: 15px;padding-top: 9px;}
                            .verify_res{padding-left: 18px;font-size: 12px;width: 80px;display:none;margin: 0;}
                            .verify_right{color: #8ec571;background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDAwQjFFOTJERDAyMTFFNUEyMDNDNjkwQTE2RjIzQjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDAwQjFFOTNERDAyMTFFNUEyMDNDNjkwQTE2RjIzQjAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MDBCMUU5MEREMDIxMUU1QTIwM0M2OTBBMTZGMjNCMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0MDBCMUU5MUREMDIxMUU1QTIwM0M2OTBBMTZGMjNCMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkOQ1v8AAAEISURBVHjaYuw7WsiABESAuAiIfYBYDSp2A4g3AfEkIH4DU8iCpCkYiOcCMT8DKtCH4nwgTgLitSBBJiRNq7FoQgZ8UDXBMI2iQDwPiBkZCANGqFoxkMZcqGmEwE0g9oaqLQD50Y8ITVeBOBuIF0P5PiAbNZAUHMWi6TxU0wogloWKqTOhKVoKxBOQ+CeBuASI1wCxBJL4LyZoPMHAVCB+BMTtQHwEiGuhmkTQLLjHBI1c5FDrA+KvQNwA1SSIxflbQRqnAPEnNIkWIN6DI7RBaieANL6Cpoj/RITuf6jaV7DAASWjMCD+jEcTSC4UPckxQP2jBA2YK0D8G+rX81CnK8E0gQBAgAEALbA1DQUbguQAAAAASUVORK5CYII=) left center no-repeat;}
                            .verify_error{color: #fa5b5b;background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTg0OTk4RDdERDAyMTFFNUEyMDNDNjkwQTE2RjIzQjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTg0OTk4RDhERDAyMTFFNUEyMDNDNjkwQTE2RjIzQjAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MDBCMUU5OEREMDIxMUU1QTIwM0M2OTBBMTZGMjNCMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1ODQ5OThENkREMDIxMUU1QTIwM0M2OTBBMTZGMjNCMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhKYxrsAAAEpSURBVHjadJK9SkNBEIVz5bZqo3kAwZ9CSG2jwUItgk3UJo0/tSg2VnaCYClopy+gaYSANqLd7Sy0iAg+QLBStLgi12/gLIzLzcAHy8w5u7O7k+StVsXFCOxBAyaU68I1nMB7EKbO1IRzGK78j5rYgU1oW3LAmS5LTD6GpGkG4yhcQAI5ZCWmTLVE2qoZt7VbEMzDrTPdKJe5k3ftjstONAunaqcDBazAmWohGmacitragG9taMZjWI80k2mfh5iBX7eOI0/1TzWXfIIl2NeJi3AH007zlupzg/FTwi04UO4LFuAFBpXrJExOlcWre9l7qEetPcCc1h8wbt/R00QUKtRL7hRMhbS9MDk2RmtqtV9YbTUeOYsrGIMjeIYf3e8RDlVrB/GfAAMAMPw/kb33l20AAAAASUVORK5CYII=) left center no-repeat;}`;
        document.querySelector('head').appendChild(style);
    }

    /**
     * 展示图片
     */
    showImg() {
        //参数重置
        this.oBtn.style.left = '0px';
        this.oImg.style.left = '0px';
        this.oRignt.style.display = 'none';
        this.oError.style.display = 'none';
        this.ajax({type: 'GET', url: this.imgUrl}, (res) => {
            if (res.state == 0) {
                this.oImg.style.backgroundImage = 'url(data:image/png;base64,' + res.data.moveSrc + ')';
                this.oImg.style.backgroundPositionY = res.data.posY + 'px';
                this.oBgImg.setAttribute('src', 'data:image/png;base64,' + res.data.bgSrc);
                this.token = res.data.token;
                this.mask.style.display = 'block';
            }
        });
    }

    /**
     * 事件监听
     */
    event(callback) {
        let disX,
            valueL,
            flag = false;
        // this.oBar.onmouseover = () => {
        //     this.oCon.style.display = 'block';  //显示图片  之前想法是移入显示并操作
        // }
        this.oBtn.onmousedown = (evt) => {  //按下
            evt.stopPropagation();
            disX = evt.clientX - this.oBtn.getBoundingClientRect().left;
            flag = true;
            this.tips.style.display = 'none';
        }
        this.oBtn.ontouchstart = (evt) => {  //移动端touch事件
            evt.stopPropagation();
            disX = evt.touches[0].clientX - this.oBtn.getBoundingClientRect().left;
            flag = true;
            this.tips.style.display = 'none';
            this.oBtn.style.background = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAr0lEQVQ4T93TMQ5BQRSF4f9obcMe1HSi0mhYg+RprcAiNLYgEomSFShs58gU5JF58q6MREw9+XLPnTOi8FFhjz8DbS+Bq6RD06pCkW2vgQoYSzrm0CiY7m+AeRMaAtNEtjvAFpjm0DCYQSeS9vf4D9B2D5hB6yqlSRdAFxhIOie0DvaBUaDodXAo6fQEBqDXPeYjtwWLPortsrX5RrFXwEXSrsjXa7Pnj4r9Dv598AZDHjwV3Xu4TQAAAABJRU5ErkJggg==) center center no-repeat;`;
            this.oBtn.style.backgroundColor = `#1991fa`;
            this.oBar.style.borderColor = `#1991fa`;
        }
        document.querySelector('body').onmousemove = (evt) => {  //移动
            evt.stopPropagation();
            if (!flag) {
                return false;
            }
            valueL = evt.clientX - disX - this.oBar.getBoundingClientRect().left;
            if (valueL <= 0) {

                valueL = 0;

            } else if (valueL >= this.oBar.clientWidth - this.oBtn.clientWidth) {

                valueL = this.oBar.clientWidth - this.oBtn.clientWidth

            }
            this.oBtn.style.left = valueL + 'px';
            this.oImg.style.left = valueL + 'px';
        }
        document.querySelector('body').ontouchmove = (evt) => {
            evt.stopPropagation();
            if (!flag) {
                return false;
            }
            valueL = evt.touches[0].clientX - disX - this.oBar.getBoundingClientRect().left;
            if (valueL <= 0) {

                valueL = 0;

            } else if (valueL >= this.oBar.clientWidth - this.oBtn.clientWidth) {

                valueL = this.oBar.clientWidth - this.oBtn.clientWidth

            }
            this.oBtn.style.left = valueL + 'px';
            this.oImg.style.left = valueL + 'px';
        }
        document.querySelector('body').onmouseup = (evt) => {  //停止并发送请求校验
            if (!flag) {
                return false;
            }
            evt.stopPropagation();
            this.tips.style.display = 'block';
            flag = false;
            let oL = this.oBtn.offsetLeft,
                timer = null,
                s = 0;
            this.ajax({type: 'POST', url: this.checkUrl, data: {x: this.oImg.offsetLeft, token: this.token}}, (res) => {
                if (res.state == 0) {
                    //匹配成功
                    // this.oCon.style.display = 'none';
                    this.oRignt.style.display = 'block';
                    this.oError.style.display = 'none';
                    timer = setTimeout(() => {
                        this.mask.style.display = 'none';
                    }, 1000);
                    //todo 成功后的操作，跳转或者怎样都可以
                    callback(res);
                } else {
                    //匹配失败
                    this.oError.style.display = 'block';
                    this.oRignt.style.display = 'none';
                    setTimeout(() => {
                        this.oError.style.display = 'none';
                        clearInterval(timer);
                        timer = setInterval(() => {
                            s++;
                            this.oBtn.style.left = oL - s + 1 + 'px';
                            this.oImg.style.left = oL - s + 'px';
                            if (oL - s < 1) {
                                //重新加载图片
                                this.showImg();
                                clearInterval(timer);
                            }
                        }, 4);
                    }, 500);
                    s = 0;
                }
            });
        }
        document.querySelector('body').ontouchend = (evt) => {  //停止并发送请求校验
            if (!flag) {
                return false;
            }
            evt.stopPropagation();
            this.tips.style.display = 'block';
            this.options.style.left = '-11px';
            this.options.style.top = '34px';
            this.oBtn.style.background = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAzUlEQVQ4T93TMQrCMBQG4P/v6jW8g7Nu4uTiomcwr64uXZ3SdHfxCiIIjnoCB8/RE/RJBItCCwlkEDO/fPC//CESHyb28GegiGyapnlUVXXuW1VUZBHZqWoOYOacu3ShUSAAGmP2AFZ9aCyIoiiyuq4PqrroQqNBH/MTJTkvy/L0jt+CeZ4PVXXpYwV2MwOwBjBQ1bFz7ubvtZeNMSOS00DMj7UgyYm19voFRkBhkUPB1I+StjbJiy0iW5J3a+0xydcL2XNo50Ks18zvg08WzGMVsuSGVQAAAABJRU5ErkJggg==) center center no-repeat;`;
            this.oBtn.style.backgroundColor = `#fff`;
            this.oBar.style.borderColor = `#ccc`;
            flag = false;
            let oL = this.oBtn.offsetLeft,
                timer = null,
                s = 0;
            this.ajax({type: 'POST', url: this.checkUrl, data: {x: this.oImg.offsetLeft, token: this.token}}, (res) => {
                if (res.state == 0) {
                    //匹配成功
                    // this.oCon.style.display = 'none';
                    this.oRignt.style.display = 'block';
                    this.oError.style.display = 'none';
                    timer = setTimeout(() => {
                        this.mask.style.display = 'none';
                    }, 1000);
                    //todo 成功后的操作，跳转或者怎样都可以
                    callback(res);
                } else {
                    //匹配失败
                    this.oError.style.display = 'block';
                    this.oRignt.style.display = 'none';
                    setTimeout(() => {
                        this.oError.style.display = 'none';
                        clearInterval(timer);
                        timer = setInterval(() => {
                            s++;
                            this.oBtn.style.left = oL - s + 1 + 'px';
                            this.oImg.style.left = oL - s + 'px';
                            if (oL - s < 1) {
                                //重新加载图片
                                this.showImg();
                                clearInterval(timer);
                            }
                        }, 4);
                    }, 500);
                    s = 0;
                }
            });
        }
        // this.oBar.onmouseout = () => {  //移开隐藏图片
        //     this.oCon.style.display = 'none';
        // }
        this.mask.onclick = function (evt) {
            if (evt.target == this) {
                this.style.display = 'none';
            }
        }
        this.mask.ontouchstart = function (evt) {
            if (evt.target == this) {
                this.style.display = 'none';
            }
        }
    }

    /**
     * promise封装ajax
     * 公司项目老。不支持promise,放弃promise，可以考虑fetch
     * @param params
     * @returns {Promise<any>}
     */
    // ajax(params) {
    //     return new Promise((resolve, reject) => {
    //         let xhr = new XMLHttpRequest();
    //         xhr.open(params.type, params.url);
    //         xhr.onreadystatechange = () => {
    //             if (xhr.status == 200) {
    //                 resolve(JSON.parse(xhr.responseText));
    //             } else {
    //                 reject(xhr)
    //             }
    //         }
    //         if (params.type == 'GET') {
    //             xhr.send()
    //         } else {
    //             xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //             xhr.send(this.formatParams(params.data));
    //         }
    //     });
    // }

    ajax(params, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open(params.type, params.url);
        if (params.type == 'GET') {
            xhr.send()
        } else {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(this.formatParams(params.data));
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    callback(JSON.parse(xhr.responseText));
                } else {
                    callback(xhr);
                }

            }
        }
    }

    /**
     * 发送数据处理，将{key1: value1, key2: value2} 转换成 key1=value1&key2=value2形式
     * @param params
     * @returns {string}
     */
    formatParams(params) {
        var arr = [];
        for (var name in params) {
            arr.push(name + '=' + params[name]);
        }
        return arr.join("&");
    }

    doSomething(params) {
        return params;
    }

    /**
     * 显示二维码
     */
    showVerify() {
        this.showImg();
    }

}