$require('/table1data.js');

/**
 * ScrollPanel
 */
$class('tau.demo.ScrollPanel').extend(tau.ui.ParallelNavigator).define({

  init: function () {
    this.setControllers(
        [new tau.demo.ScrollPanelSimple(),
         new tau.demo.ScrollPanelPullToRefresh()]
    );
  }
});

$class('tau.demo.ScrollPanelSimple').extend(tau.ui.SceneController).define({

  ScrollPanelSimple: function (){
    this.setTitle('Simple');
  },
  
  loadScene: function () {
    // ScrollPanel 컴포넌트를 생성한다.
    var scene = this.getScene(),
        hpanel = new tau.ui.ScrollPanel({
          id: 'hpanel',
          vScroll: false,
          styles: {width: '100%', height: '50%', display: 'block'}
        }), 
        vpanel = new tau.ui.ScrollPanel({
          id: 'vpanel',
          hScroll: false,
          styles: {backgroundColor: 'black', width: '100%', height: '50%'}
        });
        
    scene.add(vpanel);
    scene.add(hpanel);
  },
  
  /**
   * when scene is loaded fill the scroll panel with images
   */
  sceneLoaded: function () {
    var i, x,
        height = tau.getHeight() / 2,
        width = tau.getWidth(),
        scene = this.getScene(),
        vpanel = scene.getComponent('vpanel'),
        hpanel = scene.getComponent('hpanel');
    
    for (i = 0; i < 10; i++) {
      vpanel.add(new tau.ui.ImageView({
            src: '/img/' + (i + 1) + '.jpg',
            styles: {
              width: width * 0.9 + 'px',
              height: height * 0.5 + 'px',
              margin: '10px 5px'
            }
          })
      );
      
      x = i * width * 0.7 + i * 10;
      hpanel.add(new tau.ui.ImageView({
            src: '/img/' + (i + 1) + '.jpg',
            styles: {
              width: width * 0.7  + 'px',
              height: height * 0.9 + 'px',
              left: x  + 'px',
              top: 0,
              margin: '5px 10px'
            }
          })
      );
    }
  }
});

$class('tau.demo.ScrollPanelPullToRefresh').extend(tau.ui.SceneController).define({

  ScrollPanelPullToRefresh: function () {
    this.setTitle('PullToRefresh');
  },
  
  init: function (){
  	this.vIndex = 3, 
    this.hIndex = 3,
    this.height = window.innerHeight / 2,
    this.width = window.innerWidth;
  },
  
  loadScene: function (){
    // ScrollPanel 컴포넌트를 생성한다.
    // TODO: innerWidth, innerHeight TAU Framework에서 제공해주어야함.
    var scene = this.getScene();
    
    var vpanel = new tau.ui.ScrollPanel({
      id: 'vpanel',
      hScroll: false, 
      pullToRefresh: 'down', 
      pullDownFn: tau.ctxAware(this.pullDownForVPanel, this),
      styles: {backgroundColor: 'black', width: '100%', height: '50%'}
    });
    
    var hpanel = new tau.ui.ScrollPanel({
      id: 'hpanel',
      vScroll: false, 
      pullToRefresh: 'up', 
      pullUpFn: tau.ctxAware(this.pullUpForHPanel, this),
      styles: {width: '100%', height: '50%'}
    });

    // scene에 ScrollPanel 컴포넌트를 추가한다.
    scene.add(vpanel);
    scene.add(hpanel);
        
    // ScrollPanel에 컴포넌트를 추가해서 스크롤이 생기도록 한다.
    for(var i=0, j=1; i < 3; i++, j++){
      this.makeVPanelItem(vpanel, this.height, this.width, i);
      this.makeHPanelItem(hpanel, this.height, this.width, i);
    }
  },
  
  pullDownForVPanel: function () {
    var target = this.getScene().getComponent('vpanel');
    if (this.vIndex < 9) {
      this.makeVPanelItem(target, this.height, this.width, this.vIndex++);
      this.makeVPanelItem(target, this.height, this.width, this.vIndex++);
      this.makeVPanelItem(target, this.height, this.width, this.vIndex++);
      this.getScene().update();
    }
    target.refresh();
  },
  
  pullUpForHPanel: function (){
    var target = this.getScene().getComponent('hpanel');
    if (this.hIndex < 9) {
      this.makeHPanelItem(target, this.height, this.width, this.hIndex++);
      this.makeHPanelItem(target, this.height, this.width, this.hIndex++);
      this.makeHPanelItem(target, this.height, this.width, this.hIndex++);
      this.getScene().update();
    }
    target.refresh();
  },
  
  makeVPanelItem: function (target, height, width, index) {
    target.add(
        new tau.ui.ImageView({
              src: '/img/' + (index + 1) + '.jpg',
              styles: 
              {
                width: width * 0.9 + 'px',
                height: height * 0.5 + 'px', 
                margin: '10px 5px'
              }
            }), 0);
  },
  
  makeHPanelItem: function (target, height, width, index) {
    var x = index * width * 0.7 + index * 10;
    target.add(
        new tau.ui.ImageView({
              src: '/img/' + (index + 1) + '.jpg',
              styles: {
                width: width * 0.7  + 'px', 
                height: height * 0.9 + 'px', 
                left: x  + 'px', 
                top: 0, 
                margin: '5px 10px'
              }
            }), 0);
  },
});

/**
 * Table application class
 */
$class('tau.demo.Table').extend(tau.ui.ParallelNavigator).define({
  
  init: function () {
    this.setControllers([
      new tau.demo.Simple(),
      new tau.demo.Group(),
      new tau.demo.PaginationDefault(),
      new tau.demo.PaginationSlider(),
      new tau.demo.PullToRefresh()
    ]);
  }
});

$class('tau.demo.Simple').extend(tau.ui.SceneController).define({
  
  Simple: function () {
    this.setTitle('simple');
  },
  
  loadScene: function () {
    var table = new tau.ui.Table({
      headerItem: new tau.ui.Label({text: 'Scientific name: Amphibia'}),
      footerItem: new tau.ui.ImageView({
        src: '/img/' + 'main_bug.jpg',
        styles: 
          {
            width: '50%', 
            height: '100%', 
            backgroundSize: '100% 100%'
          }
      }),
      styles: {
        cellLeftItemWidth: '20%'
      }
    });

    
    this.getScene().add(table);
    for (var i = 0, length = DATA.length; i < length; i++) {
      var cell = new tau.ui.TableCell({
        title: DATA[i].title,
        subTitle: DATA[i].group,
        leftItem: new tau.ui.ImageView({
          src: '/img/' + DATA[i].image, 
          styles: {backgroundSize: 'auto'}})
      });
      if (i == 0) {
        cell.setStyles({cellLeftItemWidth: '30%'});
      }
      table.add(cell);
    }
  }
});

$class('tau.demo.Group').extend(tau.ui.SceneController).define({
  
  Group: function () {
    this.setTitle('Group');
  },
  
  loadScene: function () {
    var table = new tau.ui.Table({
      group: true, 
      foldable: true,
      foldedSections: ['BBC']
    });
    this.getScene().add(table);
    var items = [{title: 'Top News story', groupName: 'BBC'},
                 {title: 'Technology of Business', groupName: 'BBC'},
                 {title: 'Latest news', groupName: 'CNN'},
                 {title: '시청자와 함께하는', groupName: 'KBS'}];
    for (var i = 0, len = items.length; i < len; i++) {
      table.add(new tau.ui.TableCell(items[i]));
    }
  }
});

$class('tau.demo.PaginationDefault').extend(tau.ui.SceneController).define({
  
  PaginationDefault: function () {
    this.setTitle('page default');
  },
  
  loadScene: function () {
    var table = new tau.ui.Table(
        {pagination: {pageSize: 5, dock: tau.ui.PaginationBar.BOTTOM_DOCK}});
    table.setHeaderItem('header');
    table.setFooterItem('footer');
    this.getScene().add(table);
    for(var i = 0; i < 94; i++) {
      table.add(new tau.ui.TableCell({title: i + 1}));
    }
  }
});

$class('tau.demo.PaginationSlider').extend(tau.ui.TableSceneController).define({
  
  PaginationSlider: function () {
    this.setTitle('page slider');
  },
  
  loadScene: function () {
    var table = new tau.ui.Table({
        pagination: {
          type: tau.ui.PaginationBar.SLIDER_TYPE,
          dock: tau.ui.PaginationBar.LEFT_DOCK
        }
      }
    );
    
    this.getScene().add(table);
  },
  
  /**
   * loads model to display content on the table component
   * @param {Number} start start index(inclusive 0)
   * @param {Number} size the number of cells to display  on the current page
   * @returns {Number} the number of cells to load
   */
  loadModel: function () {
    return 94;
  },
  
  /**
   * Create table cell object and returns that 
   * @param {Number} index current index of the model at which the table cell
   * object is created. 
   * @param {Number} offset the offset from the beginning   
   * @returns {tau.ui.TableCell} newly created TabelCell object
   */
  makeTableCell: function (index, offset) {
    return new tau.ui.TableCell({title: (index + offset)});
  }
});


$class('tau.demo.PullToRefresh').extend(tau.ui.SceneController).define({
  
  PullToRefresh: function () {
    this.setTitle('pullToRefresh');
  },
  
  loadScene: function () {
    this.index = 0;
    this.prevIndex = 999;
    var table = new tau.ui.Table({
      id: 'table',
      pullToRefresh: 'both',
      pullDownFn: tau.ctxAware(this.pullDownForTable, this),
      pullUpFn: tau.ctxAware(this.pullUpForTable, this)
    });
    this.getScene().add(table);

    for(var i=0, index=1000; i < 5; i++, index++){
      var cell = new tau.ui.TableCell();
      cell.setTitle(index + ' cell');
      table.add(cell, 0);
    }
  },
  
  pullDownForTable: function () {
    var scene = this.getScene();
    var table = scene.getComponent('table');
    for(var j=0; j < 3; j++, this.index++) {
      table.add(new tau.ui.TableCell({title: this.index + ' cell'}), 0);
    }
    scene.update();
  },
  
  pullUpForTable: function () {
    var scene = this.getScene();
    var table = scene.getComponent('table');
    if (this.prevIndex > 0) {
      for(var j=0; j < 3 && this.prevIndex > 0; j++, this.prevIndex--){
        table.add(new tau.ui.TableCell({title: this.prevIndex + ' cell'}));
      }
      scene.update();
    }
  }
});

/**
 * TextView
 */
$class('tau.demo.TextView').extend(tau.ui.SceneController).define({
  $static: { // text message for displaying in the text area
    MSG: 'The TextArea class implements the behavior for a scrollable, '
      + 'multiline text region. The class supports the display of text using '
      + 'a custom font, color, and alignment and also supports text editing. '
      + 'You typically use a text area to display multiple lines of text, such '
      + 'as when displaying the body of a large text document. This class does'
      + 'not support multiple styles for text. The font, color, and text '
      + 'alignment attributes you specify always apply to the entire contents '
      + 'of the text view. To display more complex styling in your application,'
      + 'you need to use a iframe and render your content using HTML.'
      + 'Managing the Keyboard when the user taps in an editable text view, '
      + 'that text view becomes the first responder and automatically asks the '
      + 'system to display the associated keyboard.'
  },
  
  loadScene: function () {
    // TextView 컴포넌트를 생성한다.
    var textView = new tau.ui.TextView({text: tau.demo.TextView.MSG});
    // 크기를 지정한다.
    textView.setStyles({margin: '10px', width: '320px', height: '300px'});
    this.getScene().add(textView);
  }
});

/**
 * Carousel
 */
$class('tau.demo.Carousel').extend(tau.ui.SceneController).define({
  loadScene: function() {
    var scene = this.getScene(),
        carousel1 = new tau.ui.Carousel({vertical: true}),
        carousel2 = new tau.ui.Carousel(),
        panel1 = new tau.ui.Panel(),
        panel2 = new tau.ui.Panel(),
        panel3 = new tau.ui.Panel(),
        panel4 = new tau.ui.Panel(),
        panel5 = new tau.ui.Panel(),
        panel6 = new tau.ui.Panel(),
        panel7 = new tau.ui.Panel();
    
    // 높이, 위치를 지정해 준다.
    carousel1.setStyles({'top': '0px', 'height': '50%'});
    carousel2.setStyles({'top': '50%', 'height': '50%'});
    
    // Panel 컴포넌트의 배경색을 지정한다.
    panel1.setStyle('backgroundColor', 'red');
    panel2.setStyle('backgroundColor', 'orange');
    panel3.setStyle('backgroundColor', 'yellow');
    panel4.setStyle('backgroundColor', 'green');
    
    panel5.setStyle('backgroundColor', 'blue');
    panel6.setStyle('backgroundColor', 'indigo');
    panel7.setStyle('backgroundColor', 'violet');
    
    // Carousel 컴포넌트에 Panel 컴포넌트를 추가한다.
    carousel1.setComponents([panel1, panel2, panel3, panel4]);
    carousel2.setComponents([panel5, panel6, panel7]);
    // scene에 Carousel 컴포넌트를 추가한다.
    scene.add(carousel1);
    scene.add(carousel2);
  }
});