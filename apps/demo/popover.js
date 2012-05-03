$class('tau.demo.PopoverController').extend(tau.ui.SceneController).define({
  loadScene: function () {
    var toolbarTop = new tau.ui.ToolBar({
          dock: tau.ui.ToolBar.TOP_DOCK,
          styleClass: { type: 'dark'}
        }),
        btn1 = new tau.ui.Button({id: 'btn1', label: 'btn1'}),
        btn2 = new tau.ui.Button({id: 'btn2', label: 'btn2'}),
        btn3 = new tau.ui.Button({id: 'btn3', label: 'btn3'});
    toolbarTop.add(btn1);
    toolbarTop.add(btn2);
    toolbarTop.add(btn3);
    
    //pop1을 생성하여 멤버변수로 등록한다.
    this.pop1 = new tau.ui.PopoverController({width: '100px', height: '150px'});
    
    btn1.onEvent(tau.rt.Event.TAP, this.handlePresentPopover1, this);
    
    this.pop2 = new tau.ui.PopoverController({width: '100px', height: '150px'});
    
    btn2.onEvent(tau.rt.Event.TAP, this.handlePresentPopover2, this);
    
    this.pop3 = new tau.ui.PopoverController({width: '100px', height: '150px'});
    
    btn3.onEvent(tau.rt.Event.TAP, this.handlePresentPopover3, this);
    
    var toolbarBottom = new tau.ui.ToolBar({
          dock: tau.ui.ToolBar.BOTTOM_DOCK,
          styleClass: { type: 'dark'}
        }),
        btn4 = new tau.ui.Button({id: 'btn4', label: 'btn4'}),
        btn5 = new tau.ui.Button({id: 'btn5', label: 'btn5'}),
        btn6 = new tau.ui.Button({id: 'btn6', label: 'btn6'});
    toolbarBottom.add(btn4);
    toolbarBottom.add(btn5);
    toolbarBottom.add(btn6);
    
    this.pop4 = new tau.ui.PopoverController({width: '100px', height: '150px'});
    
    btn4.onEvent(tau.rt.Event.TAP, this.handlePresentPopover4 ,this);
    
    this.pop5 = new tau.ui.PopoverController({width: '100px', height: '150px'});
    
    btn5.onEvent(tau.rt.Event.TAP, this.handlePresentPopover5 ,this);
    
    this.pop6 = new tau.ui.PopoverController({width: '100px', height: '150px'});
    
    btn6.onEvent(tau.rt.Event.TAP, this.handlePresentPopover6 ,this);
    
    this.getScene().add(toolbarTop);
    this.getScene().add(toolbarBottom);
  },
  
  /**
   * event handler called back when button1 is touched
   */
  handlePresentPopover1: function () {
    var btn1 = this.getScene().getComponent('btn1');
    //pop1에서 click 버튼이 클릭되었을 때 이벤트를 처리하기 위한 이벤트 등록
    this.pop1.onEvent('click', this.handleClick, this);
    //pop1에서 dismiss 버튼이 클릭되었을 때 이벤트를 처리하기 위한 이벤트 등록
    this.pop1.onEvent('dismiss', this.handleDismiss, this);    
    var contentCtr = new tau.demo.ContentScene();
    //pop1을 표시하는 함수
    this.pop1.presentCtrl(contentCtr,btn1,{
          masking: true,
          direction: tau.ui.PopoverController.DOWN_DIRECTION
        });
  },
  
  /**
   * event handler called back when button2 is touched
   */
  handlePresentPopover2: function () {
    var btn2 = this.getScene().getComponent('btn2');
    this.pop2.onEvent('click',this.handleClick, this);
    this.pop2.onEvent('dismiss',this.handleDismiss, this);
    var contentCtr = new tau.demo.ContentScene();    
    this.pop2.presentCtrl(contentCtr,btn2,{
        masking: true,
        direction: tau.ui.PopoverController.DOWN_DIRECTION
      });
  },
  
  /**
   * event handler called back when button3 is touched
   */
  handlePresentPopover3: function () {
    var btn3 = this.getScene().getComponent('btn3');
    this.pop3.onEvent('click',this.handleClick, this);
    this.pop3.onEvent('dismiss',this.handleDismiss, this);
    var contentCtr = new tau.demo.ContentScene();    
    this.pop3.presentCtrl(contentCtr,btn3);
  },
  
  /**
   * event handler called back when button4 is touched
   */
  handlePresentPopover4: function () {
    var btn4 = this.getScene().getComponent('btn4');
    this.pop4.onEvent('click', this.handleClick, this);
    this.pop4.onEvent('dismiss', this.handleDismiss, this);
    var contentCtr = new tau.demo.ContentScene();    
    this.pop4.presentCtrl(contentCtr,btn4,{
          masking: false,
          direction: tau.ui.PopoverController.RIGHT_DIRECTION
        });
  },
  
  /**
   * event handler called back when button5 is touched
   */
  handlePresentPopover5: function () {
    var btn5 = this.getScene().getComponent('btn5');
    this.pop5.onEvent('click',this.handleClick, this);
    this.pop5.onEvent('dismiss',this.handleDismiss, this);
    var contentCtr = new tau.demo.ContentScene();    
    this.pop5.presentCtrl(contentCtr,btn5,{
          masking: true,
          direction: tau.ui.PopoverController.UP_DIRECTION
        });
  },
  
  /**
   * event handler called back when button6 is touched
   */
  handlePresentPopover6: function () {
    var btn6 = this.getScene().getComponent('btn6');
    this.pop6.onEvent('click',this.handleClick, this);
    this.pop6.onEvent('dismiss',this.handleDismiss, this);
    var contentCtr = new tau.demo.ContentScene();    
    this.pop6.presentCtrl(contentCtr,btn6,{
          masking: true,
          direction: tau.ui.PopoverController.LEFT_DIRECTION
        });
  },
  
  /**
   * event handler called back when event('click') is called
   * @param e
   * @param payload
   */
  handleClick: function() {
   tau.log("clicking");
  },
  
  /**
   * event handler called back when event('dismiss') is called
   * @param e
   * @param popover popoverController 
   */
  handleDismiss: function (e, popover) {
   tau.log.debug("dismiss");
   //넘겨받은 popover를 삭제처리한다.
   popover.dismiss();
  },
  
  destroy: function () {
    //삭제될 때 , popover reference도 null 처리한다. 
    this.pop1 = null;
    this.pop2 = null;
    this.pop3 = null;
    this.pop4 = null;
    this.pop5 = null;
    this.pop6 = null;
  }
});

$class('tau.demo.ContentScene').extend(tau.ui.SceneController).define({
  loadScene: function () {
    var btn1 = new tau.ui.Button({
      'label': 'click', 
      'styles': {top: '10px', left: '10px', width: '60px'}
    });
    btn1.onEvent(tau.rt.Event.TAP, this.fireClick, this);
    var btn2 = new tau.ui.Button({
      'label': 'dismiss', 
      'styles': {top: '80px', left: '10px', width: '60px'}
    });
    btn2.onEvent(tau.rt.Event.TAP, this.fireDismiss, this);
    var scene = this.getScene();
    scene.add(btn1);
    scene.add(btn2);
  },  
  
  fireClick: function () {
    this.fireEvent('click');
  },
  
  fireDismiss: function () {
  //tau.demo.ContentScene의 parent는 PopoverController이다.
  //삭제처리하기 위해서 넘겨준다.
    this.fireEvent('dismiss',this.getParent());
  }
});