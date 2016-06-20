/**
* Author: Arron.y
* Email: yangyun4814@gmail.com
* Github: https://github.com/ArronYR
* CreateTime: 2016-03-26
*/

'use strict'

// get the element object
function $(selector, context) {
    return (context || document).querySelectorAll(selector);
}

// // add CSS sttributes to the dom element
// function css(el, styles) {
//     for (var property in styles){
//         el.style[property] = styles[property];
//     }
// }

//just replace the css function that you write, it has a bug, if the styles has not only a css property
function css(el, styles) {
    for(var i = 0; i< styles.length; i++){
        el.style[i] = styles[i];
    }
}

// check the dom has someone class style
function hasClass(el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
}

// add class style
function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else if (!hasClass(el, className)) {
        el.className += ' ' + className;
    }
}

// remove class style
function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
    }
}

// helper for enabling IE 8 event bindings
function addEvent(el, type, handler) {
    if (el.attachEvent) {
        el.attachEvent('on'+type, handler);
    } else {
        el.addEventListener(type, handler);
    }
}

// animate to left
function animateLeft(el, duration, left) {
    var s = el.style, step = (duration || 200)/20;
    s.left = s.left || '0px';
    (function animation() {
        s.left = (parseInt(s.left, 10)-step) > 0 ? (parseInt(s.left, 10)-step)+'px' : 0;
        parseInt(s.left, 10) > 0 ? setTimeout(animation, 10) : s.left = 0;
    })();
}

// animate opacity
function animateOpacity(el, duration, opacity) {
    var s = el.style, step = 25/(duration || 200);
    s.opacity = s.opacity || 0;
    (function animation() {
        (s.opacity = parseFloat(s.opacity)+step) > 1 ? s.opacity = 1 : setTimeout(animation, 25);
    })();
}

// the main object SliderUnlock
function SliderUnlock(elm, options, success, always) {
    var _self = this;

    var $elm = _self.checkElm(elm) ? $(elm)[0] : document;
    var options = _self.checkObj(options) ? options : new Object();
    var success = _self.checkFn(success) ? success : function(){};
    var always = _self.checkFn(always) ? always : function(){};

    var opts = {
        labelTip: typeof(options.labelTip)!=="undefined" ? options.labelTip : "Slide to Unlock",
        successLabelTip: typeof(options.successLabelTip)!=='undefined' ? options.successLabelTip : "Success",
        duration: typeof(options.duration)!=='undefined'||!isNaN(options.duration) ? options.duration : 200,
        swipestart: typeof(options.swipestart)!=='undefined' ? options.swipestart : false,
        min: typeof(options.min)!=='undefined'||!isNaN(options.min) ? options.min : 0,
        max: typeof(options.max)!=='undefined'||!isNaN(options.max) ? options.max : $elm.clientWidth-$(".slideunlock-label")[0].clientWidth,
        index: typeof(options.index)!=='undefined'||!isNaN(options.index) ? options.index : 0,
        IsOk: typeof(options.isOk)!=='undefined' ? options.isOk : false,
        lableIndex: typeof(options.lableIndex)!=='undefined'||!isNaN(options.lableIndex) ? options.lableIndex : 0
    }

    //$elm
    _self.elm = $elm;
    //opts
    _self.opts = opts;
    //是否开始滑动
    _self.swipestart = opts.swipestart;
    //最小值
    _self.min = opts.min;
    //最大值
    _self.max = opts.max;
    //当前滑动条所处的位置
    _self.index = opts.index;
    //是否滑动成功
    _self.isOk = opts.isOk;
    //鼠标在滑动按钮的位置
    _self.lableIndex = opts.lableIndex;
    //success
    _self.success = success;
    //always
    _self.always = always;
}

// check the element exists
SliderUnlock.prototype.checkElm = function (elm) {
    if($(elm).length > 0){
        return true;
    }else{
        throw "this element does not exist.";
    }
};

// judge the given param is a object
SliderUnlock.prototype.checkObj = function (obj) {
    if(typeof obj === "object"){
        return true;
    }else{
        throw "the params is not a object.";
    }
};

// judge the given param is a function
SliderUnlock.prototype.checkFn = function (fn) {
    if(typeof fn === "function"){
        return true;
    }else{
        throw "the param is not a function.";
    }
};

// initialize
SliderUnlock.prototype.init = function () {
    var _self = this,
        _slideunlockLabel = $(".slideunlock-label")[0];

    _self.updateView();
    addEvent(_slideunlockLabel, "mousedown", function (event) {
        var e = event || window.event;
        _self.lableIndex = e.clientX - this.offsetLeft;
        _self.handerIn();
    });
    addEvent(_slideunlockLabel, "mousemove", function (event) {
        _self.handerMove(event);
    });
    addEvent(_slideunlockLabel, "mouseup", function (event) {
        _self.handerOut();
    });
    addEvent(_slideunlockLabel, "mouseout", function (event) {
        _self.handerOut();
    });
    addEvent(_slideunlockLabel, "touchstart", function (event) {
        var e = event || window.event;
        console.log(e);
        _self.lableIndex = e.touches[0].pageX - this.offsetLeft;
        _self.handerIn();
    });
    addEvent(_slideunlockLabel, "touchmove", function (event) {
        _self.handerMove(event, "mobile");
    });
    addEvent(_slideunlockLabel, "touchend", function (event) {
        _self.handerOut();
    });
}

// 鼠标/手指接触滑动按钮
SliderUnlock.prototype.handerIn = function () {
    var _self = this;
    _self.swipestart = true;
    _self.min = 0;
    _self.max = _self.elm.clientWidth - $(".slideunlock-label")[0].clientWidth;
}

// 鼠标/手指移出
SliderUnlock.prototype.handerOut = function () {
    var _self = this;
    //停止
    _self.swipestart = false;
    //_self.move();
    if (_self.index < _self.max) {
        _self.reset();
    }
}

//鼠标/手指移动
SliderUnlock.prototype.handerMove = function (event, type) {
    var _self = this;
    if (_self.swipestart) {
        event.preventDefault();
        var event = event || window.event;
        if (type == "mobile") {
            _self.index = event.touches[0].pageX - _self.lableIndex;
        } else {
            _self.index = event.clientX - _self.lableIndex;
        }
        _self.move();
    }
}

//鼠标/手指移动过程
SliderUnlock.prototype.move = function () {
    var _self = this;
    if ((_self.index + 0) >= _self.max) {
        _self.index = _self.max - 0;
        //停止
        _self.swipestart = false;
        //解锁
        _self.isOk = true;
    }
    if (_self.index < 0) {
        _self.index = _self.min;
        //未解锁
        _self.isOk = false;
    }
    if (_self.index == _self.max && _self.max > 0 && _self.isOk) {
        _self.success();
    }
    _self.backgroundTranslate();
    _self.updateView();
}

// 重置slide的起点
SliderUnlock.prototype.reset = function () {
    var _self = this;

    animateLeft($(".slideunlock-label")[0], _self.opts.duration, _self.index);
    animateOpacity($(".slideunlock-lable-tip")[0], _self.opts.duration, 1);

    _self.index = 0
    _self.updateView();
};

// 颜色渐变
SliderUnlock.prototype.backgroundTranslate = function () {
    var _self = this;
    $(".slideunlock-label")[0].style.left = _self.index + "px";
    $('.slideunlock-lable-tip')[0].style.opacity = 1-(parseInt($(".slideunlock-label")[0].style.left)/_self.max);
}

// update the dom
SliderUnlock.prototype.updateView = function () {
    var _self = this,
        _labelTipEle = $(".slideunlock-lable-tip")[0];

    if (_self.index == (_self.max - 0)) {
        $(".slideunlock-lockable")[0].value = 1;
        var style = {
            "filter": "alpha(opacity=1)",
            "-moz-opacity": "1",
            "opacity": "1"
        };
        addClass(_self.elm, "success");
        _labelTipEle.innerHTML = _self.opts.successLabelTip;
        css(_labelTipEle, style);
    } else {
        $(".slideunlock-lockable")[0].value = 0;
        removeClass(_self.elm, "success");
        _labelTipEle.innerHTML = _self.opts.labelTip;
    }
    _self.always();
}

// TODO
