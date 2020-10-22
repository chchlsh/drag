/**
 * PC端和移动端拖拽插件
 * */

class Drag{

  constructor(selector, options){
    this.el = this.getElement(selector);
    if(!this.el){
      throw `未找到移动元素`;
    }

    this.bindEvent();

    let defaultOpts = {
      target: null,  // 拖拽须到达的目标
      back: true,  // 松开回到原位
      border: true,  // 拖拽时不超过父元素边界
    };
    this.opts = Object.assign({},defaultOpts,options);
    if(this.opts.target){
      this.target = this.getElement(this.opts.target);
      if(!this.target){
        throw `未找到目标元素`;
      }
    } else {
      this.target = this.opts.target;
    }

    return this.bindEvent();
  }

  initData(){
    // 父元素的位置
    this.parentPos = {
      x: this.el.parentNode.getBoundingClientRect().left,
      y: this.el.parentNode.getBoundingClientRect().top,
      w: this.el.parentNode.getBoundingClientRect().width,
      h: this.el.parentNode.getBoundingClientRect().height,
    };
    // 移动元素的初始位置和大小
    this.elemPos = {
      x: this.el.offsetLeft,
      y: this.el.offsetTop,
      w: this.el.offsetWidth,
      h: this.el.offsetHeight,
    };
    // 目标元素的初始位置和大小
    if(this.target){
      this.targetPos = {
        x: this.target.offsetLeft,
        y: this.target.offsetTop,
        w: this.target.offsetWidth,
        h: this.target.offsetHeight
      };
    }
  }

  getElement(selector){
    if(typeof selector === 'string'){
      return document.querySelector(selector);
    } else if(typeof selector === 'object'){
      return selector;
    } else {
      throw '请传入正确的元素';
    }
  }

  // 绑定事件
  bindEvent(){
    let eventName = this.eventName(),
        status = false;

    this.initData(); 

    // 按下
    this.el.addEventListener(eventName[0], e => {
      status = true;
    });

    // 移动
    document.addEventListener(eventName[1], e => {
      if(status){
        e = this.eventObj(e);
        let left = e.clientX - this.elemPos.w / 2 - this.parentPos.x,
            top = e.clientY - this.elemPos.h / 2 - this.parentPos.y;
        if(this.opts.border) {
          if(left < 0) left = 0;
          if(left > this.parentPos.w - this.elemPos.w) left = this.parentPos.w - this.elemPos.w;
          if(top < 0) top = 0;
          if(top > this.parentPos.h - this.elemPos.h) top = this.parentPos.h - this.elemPos.h;
        }
        this.el.style.cssText = `position: absolute; left: ${ left }px; top: ${ top }px;`;
      }
    });

    return new Promise((resolve, reject) => {
      // 松开
      document.addEventListener(eventName[2], e => {
        e = this.eventObj(e,true);
        status = false;
        if(this.opts.back){
          if(this.target){
            let left = e.clientX - this.elemPos.w / 2 - this.parentPos.x,
                right = left + this.elemPos.w,
                top = e.clientY - this.elemPos.h / 2 - this.parentPos.y,
                bottom = top + this.elemPos.h;
            if(left < this.targetPos.x + this.targetPos.w && right > this.targetPos.x && top < this.targetPos.y + this.targetPos.h && bottom > this.targetPos.y){
              resolve();
            } else {
              this.backOrigin();
            }
          } else {
            this.backOrigin();
          }
        } else {
          resolve();
        }
      });
    });
  }

  // 返回原位
  backOrigin(){
    this.el.style.cssText = `left: ${ this.elemPos.x }px; top: ${ this.elemPos.y }`;
  }

  // 事件名称
  eventName(){
    if(isMobile()){
      return ['touchstart','touchmove','touchend'];
    } else {
      return ['mousedown','mousemove','mouseup'];
    }
  }

  // 事件对象
  eventObj(event,isEnd = false){
    return isMobile() ? (isEnd ? event.changedTouches[0] : event.touches[0]) : event;
  }

}

function isMobile() {
  return document.body.ontouchstart;
}