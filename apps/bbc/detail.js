/**
 * RSSFeed sample application class
 */
$class('tau.bbc.DetailController').extend(tau.ui.SceneController).define(
{
  init: function () {
    this.fontSize = 100;
    this.appCtx = tau.getCurrentContext();   // 현재 앱의 컨텍스트 정보를 가져온다.
    this.setTitle(' ');  // 네비게이션 바의 제목을 설정한다.
  },
  
  /**
   * 테이블셀 컴포넌트에 출력할 정보 아이템을 반환한다.
   */
  getItem: function () {
    return tau.bbc.ListController.RSSFEEDS[this._rssid];
  },
  
  getRssTitle: function () {
    if (!this._rssid) return null;
    
    var index = this.getRSSIndex(), 
          rss = tau.bbc.ListController.RSS[index];
    return rss ? rss.title : null;
  },
  
  getRSSIndex: function () {
    if (!this._rssid) return -1;
    
    tau.log('RSS [' + this._rssid +  ']');
    
    return this._rssid.split(',')[0].substring(3);
  },
  
  getIndex: function () {
    if (!this._rssid) return -1;
    
    return this._rssid.split(',')[1] || -1;
  },
  
  setRssId: function (id) {
    this._rssid = id;
  },
  
  /**
   * 네비게이션 바에 출력할 제목을 반환한다.
   */
  getNaviTitle: function (){ 
    return this._navititle;
  },

  sceneLoaded: function () {
    var navigationbar = this.getNavigationBar();
    var back = navigationbar.getLeftItem();
    var label = this.getScene().getComponent('date');
    var text = this.getItem().pubDate ? this.getItem().pubDate: this.getItem().author;

    label.setText(text);
    navigationbar.setStyles({
      backgroundImage: 'url(/img/title.png)', 
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center'
    });

    back.setBackgroundImage({
      normal: '/img/back.png',
      selected: '/img/back_selected.png'
    });
    back.setStyles({
      backgroundColor: 'transparent',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: '64px',
      height: '36px',
      border: 'none'
      }
    );
    back.onEvent(tau.rt.Event.TAP, this.popController, this);
    
    navigationbar.setRightItem(new tau.ui.Panel({
      styles: {
        width: '70px',
        height: '100%'
      },
      components: [
        new tau.ui.Button({
          id: 'prevBtn',
          styles: {
            backgroundImage: 'url(/img/prev.png)',
            backgroundColor: 'transparent',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            width: '34px',
            height: '100%',
            border: 'none'
          }
        }),
        new tau.ui.Button({
          id: 'nextBtn',
          styles: {
            backgroundImage: 'url(/img/next.png)',
            backgroundColor: 'transparent',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            width: '32px',
            height: '100%',
            border: 'none'
          }
        })
      ]
    }));
    
    var prevBtn = navigationbar.getRightItem().getComponent('prevBtn');
    var nextBtn = navigationbar.getRightItem().getComponent('nextBtn');
    
    this.updatePrevNextButton();
    
    prevBtn.onEvent(tau.rt.Event.TAP, this.handlePrevNext, this);
    nextBtn.onEvent(tau.rt.Event.TAP, this.handlePrevNext, this);
    
    tau.bbc.DetailController.$super.sceneLoaded.apply(this, arguments);
  },
  
  /**
   * 이전 Scene으로 이동한다.
   */
  popController : function(e, payload) {
    var parent = this.getParent();
    parent.popController();
  },
  

  /**
   * refesh 버튼을 눌렸을 때 데이터를 다시 가져온다.
   * TODO
   */
  refreshBtnSelected: function (e, payload) {
    this.fontSize = 100;
    this.getScene().getComponent(1).setStyle('fontSize', this.fontSize + '%');
  },
  
  /**
   * share  버튼을 눌렸을 때 ActionSheet를 open한다.
   */
  shareBtnSelected: function (e, payload) {
    var actionSheet = this.getScene().getComponent('share');
    if (!actionSheet) {
      id: 'share',
      actionSheet = new tau.ui.ActionSheet({
        title: 'Share this article or send us your content', 
        showCloseBtn: true,
        components: [
          {label: 'Share by Email'},
          {label: 'Share by Facebook'},
          {label: 'Share on Twitter'},
        ]
      });
      this.getScene().add(actionSheet, null, true);
    }
    actionSheet.open();
  },
  
  /**
   * font size를 조정한다.
   */
  handleFontSize: function (e, payload) {
    var scene = this.getScene(),
      src = e.getSource(),
      active = src.getId(), 
      deactive;
    
    if (this.fontSize == 60 && active === 'button1' ||
        this.fontSize == 180 && active === 'button2') {
      src.setStyles({
        opacity: .3
      });
      return;
    }

    if (active === 'button1') {
      deactive = 'button2';
      this.fontSize = this.fontSize - 10;
    } else {
      deactive = 'button1';
      this.fontSize = this.fontSize + 10;
    }
    deactive = scene.getComponent(deactive);
    deactive.setStyles({
      opacity: 1
    });
    
    scene.getComponent(1).setStyle('fontSize', this.fontSize + '%');
    scene.getComponent('textview1').refresh();
  },
  
  /**
   * 이전, 다음 item을 가져온다.
   */  
  handlePrevNext: function (e, payload) {
    var index = this.getIndex(),
      src = e.getSource(),
      active = src.getId(), 
      position;
    
    if (active === 'prevBtn' && index < 1 || active === 'nextBtn' && index > 7) return;
    
    var scene = this.getScene(), 
      curContent = scene.getComponent(1), 
      newContent = this.makeContent(),
      curDom = curContent.getDOM(),
      newDom = newContent.getDOM();
    
    if (active === 'prevBtn') {
      this.setRssId('rss'.concat(this.getRSSIndex(), ',', --index));
      position = -100;
    } else {
      this.setRssId('rss'.concat(this.getRSSIndex(), ',', ++index));
      position = 100;
    }

    this.updatePrevNextButton();
    
    curDom.style.webkitTransform = 'translate3d(0, 0, 0)';
    newDom.style.display = 'none';
    newDom.style.webkitTransform = 'translate3d(' + position + '%, 0, 0)';
    
    scene.add(newContent, 1, true);

    var anim1 = new tau.fx.Transition();
    anim1.setStyle('-webkit-transform', 'translate3d(' + (-position) + '%, 0, 0)', {
      onEnd: function (e){
        e.target.style.webkitTransform = '';
        curContent.destroy();
      }});
    var anim2 = new tau.fx.Transition();
    anim2.setStyle('display', null);
    anim2.setStyle('-webkit-transform', 'translate3d(0, 0, 0)', {
      onEnd: function (e){
        var style = e.target.style; 
        style.webkitTransform = '';
        style.position = 'relative';
        style.width =null;
        style.height = null;
      }});
    anim1.animate(curDom);
    anim2.animate(newDom);
  },
  
  updatePrevNextButton: function () {
    var navigationbar = this.getNavigationBar();
    var prevBtn = navigationbar.getRightItem().getComponent('prevBtn');
    var nextBtn = navigationbar.getRightItem().getComponent('nextBtn');
    var index = this.getIndex();
    
    if (index == 0) {
      prevBtn.setStyles({opacity: .3});
    } else {
      prevBtn.setStyles({opacity: 1});
    }
    if (index == 8) {
      nextBtn.setStyles({opacity: .3});
    } else {
      nextBtn.setStyles({opacity: 1});
    }
  },
  
  /**
   * 
   */
  makeContent: function () {
    var panel2 = new tau.ui.Panel({
      styles: {
        display: 'flexbox',
        position: 'absolute',
        height: '100%',
        width:  '100%',
        '-webkit-box-flex': 1,
        '-webkit-box-orient': 'vertical'
      }
    });
     
    var label3 = new tau.ui.Label({
      styles: {
        backgroundColor: '#eee',
        color: '#383838',
        display: 'block'
      },
      text: this.getItem().title,
    });

    // 상세내용을 TextView 컴포넌트에 넣어서 출력한다.
    var textView1 = new tau.ui.TextView({
      text: this.getItem().description,
      styles: {
        backgroundColor: '#eee', 
        color: '#151515',
        display: 'block',
        '-webkit-box-flex': 1
      }
    });
    
    panel2.add(label3);
    panel2.add(textView1);
    return panel2;
  }
  
});