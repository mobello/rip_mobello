function initScene() {
	var scene = this.getScene();
  
	scene.setStyles({
	  display: 'flexbox',
	  '-webkit-box-orient': 'vertical'
	});
	
	var panel = new tau.ui.Panel({
	  styles: {  
	    backgroundColor: '#dee2ee',
	    color: '#383838',
	    fontSize: '.7em',
	    fontWeight: 'bold',
	    display: 'flexbox'
	  },
	  components: [
	    new tau.ui.Label({
	      id: 'label1',
	      text: this.getRssTitle(),
	      styles: {
	        width: 'auto'
	      }
	    }),
	    new tau.ui.Label({
	      id: 'date',
	      text: '',
	      styles: {
	        '-webkit-box-flex': 1
	      }
	    })
	  ]
	});
	
	var panel2 = new tau.ui.Panel({
	  id: 'content',
	  styles: {
	    display: 'flexbox',
	    '-webkit-box-flex': 1,
	    '-webkit-box-orient': 'vertical'
	  }
	});
   
  var label3 = new tau.ui.Label({
    id: 'label3',
    styles: {
      backgroundColor: '#eee',
      color: '#383838',
      display: 'block'
    },
    text: this.getItem().title,
  });

  // 상세내용을 TextView 컴포넌트에 넣어서 출력한다.
  var textView1 = new tau.ui.TextView({
    id: 'textview1',
    text: this.getItem().description,
    styles: {
      backgroundColor: '#eee', 
      color: '#151515',
      display: 'block',
      '-webkit-box-flex': 1
    }
  });  
  
  var toolbar1 = new tau.ui.ToolBar({
    dock: tau.ui.ToolBar.BOTTOM_DOCK,
    styles: {
      backgroundImage: 'url(/img/toolbar.png)',
      backgroundPosition: 'center',
      '-webkit-box-pack': 'end'
    }
  });
  
  var refreshBtn = new tau.ui.Button({
    id: 'refreshBtn',
    styles: {
      backgroundImage: 'url(/img/refresh.png)',
      backgroundColor: 'transparent',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '20px',
      width: '44px',
      height: '36px',
      border: 'none'
    }
  });
  refreshBtn.onEvent(tau.rt.Event.TAP, this.refreshBtnSelected, this);
  
  var shareBtn = new tau.ui.Button({
    id: 'shareBtn',
    styles: {
      backgroundImage: 'url(/img/forward.png)',
      backgroundColor: 'transparent',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '20px',
      width: '44px',
      height: '36px',
      border: 'none'
      }
  });
  shareBtn.onEvent(tau.rt.Event.TAP, this.shareBtnSelected, this);
  
  var button1 = new tau.ui.Button({
    id: 'button1',
    styleClass: {shape: 'normal'},
    styles: {
      border: 'none',
      background: 'transparent',
      fontSize: '10px',
      fontWeight: 'bold'
    },
    label: '-A'
  });
  button1.onEvent(tau.rt.Event.TAP, this.handleFontSize, this);
  
  var button2 = new tau.ui.Button({
    id: 'button2',
    styleClass: {shape: 'normal'},
    label: 'A+',
    styles: {
      border: 'none',
      background: 'transparent',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  });
  button2.onEvent(tau.rt.Event.TAP, this.handleFontSize, this);
  
  toolbar1.add(refreshBtn);
  toolbar1.add(shareBtn);
  toolbar1.add(new tau.ui.Space());
  toolbar1.add(button1);
  toolbar1.add(button2);
  
  scene.add(panel);

  panel2.add(label3);
  panel2.add(textView1); 	
  
  scene.add(panel2);
  scene.add(toolbar1); 	
}