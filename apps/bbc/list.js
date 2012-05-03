$require('http://www.google.com/jsapi?key=AIzaSyA5m1Nc8ws2BbmPRwKu5gFradvD_hgq6G0');
$require('/rss.js'); // 필요한 라이브러리들을 import한다.
$require('/detail.js');
$require('/edit.js');
$class('tau.bbc.ListController').extend(tau.ui.TableSceneController).define({
  
  $static: {
    RSSFEEDS: {},
    RSS: {},
  },
  
  init: function () {
    tau.bbc.ListController.$super.init.apply(this, arguments);
    var scene = this.getScene();
    var bar = this.getNavigationBar();
    this.appCtx = tau.getCurrentContext();   // 현재 앱의 컨텍스트 정보를 가져온다.
    var table = new tau.ui.Table({
      sectionSort: tau.ui.INDEX_SORT,
      group: true,
      components: [
        new tau.ui.TableSection(),
        new tau.ui.TableSection({groupName: 'MORE', foldable: true, folded: false})
      ],
      styleClass: {cellSize: 'auto'},
      styles: {
        backgroundColor: '#303030'
      }
    });
    scene.add(table);
    
    var indicator = new tau.ui.ActivityIndicator({
      id: 'loadingIndicator',
      autoStart: true,
      message: 'Loading...', 
      styles: {color: 'white', backgroundColor: 'black', opacity: 0.5}
    });
    scene.add(indicator);

    this.setTitle(' ');  // 네비게이션 바의 제목을 설정한다.
    bar.setStyles({
      backgroundImage: 'url(/img/title.png)', 
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '56% center'
    });
    
    bar.setLeftItem(new tau.ui.Button({
      backgroundImage: {
        normal: '/img/radioplay.png',
        selected: '/img/radiopause.png',
      },
      styles: {
        backgroundColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '110px',
        height: '36px',
        border: 'none'
      }
    }));
    bar.setRightItem(new tau.ui.Button({
      styles: {
        backgroundImage: 'url(/img/edit.png)',
        backgroundColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '64px',
        height: '36px',
        border: 'none'
      }
    }));
    
    bar.getRightItem().onEvent(tau.rt.Event.TAP, this.editButtonSelected, this);
    bar.getLeftItem().onEvent(tau.rt.Event.TAP, this.radioButtonSelected, this);
    
    this.getParent().onEvent(tau.rt.Event.RT_CTRL_CHANGE,  function (e, payload){
      if (payload.fg && payload.fg.ctrl  === this && payload.bg && payload.bg.ctrl._changed){
        // FIXME immediate false인 경우에도 되어야 함. 
        table.getComponent(0).removeComponents(true);
        table.getComponent(1).removeComponents(true);

        table.addNumOfCells(this.loadModel());
        this.sceneDrawn();
      }
    }, this);
  },
  
  /**
   * event listener, it will be notified when the table component is ready
   * load rss data from application storage
   */
  loadModel : function(start, size) {
    var rss = this.appCtx.getStorage('$rss');
    if (!rss) {
      var config = this.appCtx.getConfig();
      this.appCtx.setStorage('$rss', config.RSS);
      rss = this.appCtx.getStorage('$rss');
    }
    tau.bbc.ListController.RSS = rss;
    
    return tau.bbc.ListController.RSS.length;
  },
  
  /**
   * rss 데이터를 로드한다.
   */
  sceneDrawn: function () {
	var table = this.getTable();  
	table.addNumOfCells(this.loadModel());
    tau.bbc.ListController.RSSFeeds = {};  // rss 데이터 객체에 대한 참조
    for(var i=0, length = tau.bbc.ListController.RSS.length; i < length; i++){
      if (tau.bbc.ListController.RSS[i].isDefault) {
        this._loadRSSFeed(i, tau.bbc.ListController.RSS[i]);
      }
    }
  },  
  
  /**
   * event listener, it will be notified when data to make a cell is ready
   * creates new TableCell instance and adds as a row
   * payload.data: an element of the loaded data(array)
   * payload.index: the index(0-based) of rows
   */
  makeTableCell: function (index, offset) {
    var that = this,
        i = index + offset,
        rss = tau.bbc.ListController.RSS[i];
    if (!rss) {
    	return;
    }
   var show = rss.isDefault, 
        cell = new tau.ui.TableCell({
          disabled: true,
          styles: {
            minHeight: '40px',
            fontSize: '0.8em'
          }
        }),
        contentPanel = new tau.ui.Panel({
          styles: {
            display: 'block', height: '100%', width: '100%'
          },
          components: [
            new tau.ui.Label({
              text: rss.title, 
              styles: {display: 'block', color: '#fefefe', fontWeight: 'bold'}
            }),
            new tau.ui.ScrollPanel({
              id: 'rss' + i,
              vScroll: false, 
              styles: {height: '100px', display: 'block'}
            })
          ]
        }),
        panel = contentPanel.getComponent('rss' + i);

      if (rss.fixed) {
        cell.$index = 0;
      }
    
      cell.setContentItem(contentPanel);
      
      for(var j=0; j < 9; j ++){
        var sub = new tau.ui.Panel({
          id: 'rss' + i + ',' + j,
          styles: {
            boxShadow: '0 0 1px 1px #454642',
            border: '4px solid #101010',
            backgroundColor: '#393738',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            padding: '1px',
            display: 'block',
            
            //left: (j * width) + 'px',
            width: '96px',
            
            height: '100px',
            fontSize: '.8em'
          },
          components: [
           new tau.ui.Label({
             numberOfLines: 3, 
             styles: {fontWeight: 'bold', color: '#fefefe', top: 68 + '%'}
           }),
          ]
        });
        sub.onEvent(tau.rt.Event.TAP, this.itemSelected, this, true);
        panel.add(sub);
      }
      
      if (!show){
        contentPanel.add(new tau.ui.Button({
          styleClass: {size: 'small'}, 
          styles: {
            border: 'none',
            background: 'transparent',
            backgroundImage: 'url(/img/back_ar.png)', 
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '10px', height: '10px', top: '0', right: '0'}
          }));
        
        cell.open = false;
        cell.dataLoaded = false;
        cell.setGroupName('MORE');
        cell.onEvent(tau.rt.Event.TAP, this.foldSelected, this, true);
        
        panel.setStyle('height', '0px');
      }
      return cell;
  },
  
  /**
   * rss item을 tap했을 때 처리
   */
  itemSelected: function (e, payload) {
    var src = e.getSource();
    
    if (src instanceof tau.ui.Panel || 
        (src = src.getParent()) instanceof tau.ui.Panel) {

      var id = src.getId(),
          data;
      
      if (!id) return;
      
      data = tau.bbc.ListController.RSSFEEDS[id];
      
      if (!data) return;
      
      var detailController = new tau.bbc.DetailController({ rssId: id});
      this.getParent().pushController(detailController); 
      
    }
  },

  /**
   * live radio 버튼을 tap했을 때 처리
   */
  radioButtonSelected: function (e, payload) {
    var audio = document.getElementById('audio'),
          button = this.getNavigationBar().getLeftItem(),
          selected = button.isSelected();
    
    if (!audio) {
      audio = document.createElement('audio');
      audio.setAttribute('id', 'audio');
      audio.setAttribute('controls', 'controls');
      audio.innerHTML = ' <source src=' + this.appCtx.getRealPath('/radio.mp3') + '>';
      this.getDOM().appendChild(audio);
    }
    if (!selected) {
      audio.play();
    } else {
      audio.pause();
    }
    button.setSelected(!selected);
  },
  
  /**
   * edit 버튼을 tap했을 때 처리
   */
  editButtonSelected: function (e, payload) {
    var edit = new tau.bbc.EditController();
    this.getParent().pushController(edit);
  },

  /**
   * More section을 tap했을 때 처리
   */
  foldSelected: function (e, payload) {
    var that = this,
        fold = e.getSource(),
        panel = fold.getParent(), 
        cell; 
        
    if ((fold instanceof tau.ui.Button || fold instanceof tau.ui.Label) && 
        panel && (cell = panel.getParent()) instanceof tau.ui.TableCell){
      
      fold = panel.getComponent(2);
      
      var contentItem = cell.getContentItem(),
           scrollPanel = contentItem.getComponent(1);
      
      var anim1, anim2;
      if (!cell.open){
        if (!cell.dataLoaded){
          var index = scrollPanel.getId().substring(3);
          this._loadRSSFeed(index, tau.bbc.ListController.RSS[index]);
          cell.dataLoaded = true;
        }

        anim1 = new tau.fx.Anim(scrollPanel.getDOM(true), {to:{height:"100px"}});
        anim2 = new tau.fx.Anim(fold.getDOM(true), 
            { to:{ webkitTransition: '-webkit-transform 0.5s ease-in', webkitTransform: "rotate(-90deg)" } }
        );
        anim1.onEvent('animationend', function () {
          that.getTable().refresh();
        });
      } else {
        anim1 = new tau.fx.Anim(scrollPanel.getDOM(true), {to:{height:"0px"}});
        anim2 = new tau.fx.Anim(fold.getDOM(true), 
            { to:{ webkitTransition: '-webkit-transform 0.5s ease-in', webkitTransform: "rotate(0deg)" } }
        );
        anim1.onEvent('animationend', function () {
          that.getTable().refresh();
        });
      }
      cell.open = !cell.open; 
      tau.fx.chain([anim1, anim2]).play();
    }
  },
   
  /**
   * rss 데이터를 가져와서 panel을 그려준다.
   */
  _loadRSSFeed: function(index, rss) { // rss 데이터를 가져온다.
    var rssAPI = google, 
        that = this;

    if (tau.isUndefined(rssAPI)) {
      return;
    }

    rssAPI.load("feeds", "1", {"callback": onLoad});

    function onLoad() {
      // Create a feed instance that will grab RSS feed.
      var feed = new rssAPI.feeds.Feed(rss.url);
      // Request the results in XML
      feed.setResultFormat(rssAPI.feeds.Feed.XML_FORMAT);
      feed.setNumEntries(9);

      // Calling load sends the request off.  It requires a callback function.
      feed.load(feedLoaded);
      
      //Our callback function, for when a feed is loaded.
      function feedLoaded (result) {
        if (!result.error) {
          var rssFeed = new tau.sample.RSSFeed(result.xmlDocument);
          
          var comp = that.getScene().getComponent('rss' + index);
          
          if (!comp) return;
          
          var comps = comp.getComponents();
          for (var j = 0, count = rssFeed.count; j < count; j++) {
            
            
            var label = comps[j].getComponent(0),
                data = rssFeed.getItem(j);
            label.setText(data.title);
            
            tau.bbc.ListController.RSSFEEDS[comps[j].getId()] = data;
            
            var media = data['media:thumbnail'];
            if (media){
              image = media['url'];
              comps[j].setStyles({backgroundImage: 'url(' + image + ')'});
            }
          }        
        }
        that.getScene().getComponent('loadingIndicator').end();
      }
    }
  }
});