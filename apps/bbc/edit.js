/**
 * 
 */
$class('tau.bbc.EditController').extend(tau.ui.TableSceneController).define({
  $static: {
    MORE_TEXT: 'MORE',
    DEFAULT_TEXT: 'TOP STORIES',
    PLUS_IMG: '/img/plus.png',
    MINUS_IMG: '/img/minus.png'
  },
  
  init: function () {
    this._changed = false;
    this.appCtx = tau.getCurrentContext();   // 현재 앱의 컨텍스트 정보를 가져온다.
    this.setTitle(' ');  // 네비게이션 바의 제목을 설정한다.

    var scene = this.getScene();
    var table1 = new tau.ui.Table({
        group: true,
        components: [
          new tau.ui.TableSection({
            groupName: tau.bbc.EditController.DEFAULT_TEXT
          }),
          new tau.ui.TableSection({
            groupName: tau.bbc.EditController.MORE_TEXT
          })
        ]
      });

    table1.onEvent(tau.rt.Event.TAP, this.updateGroup, this, true);
    scene.add(table1);
  },
  
  sceneLoaded: function () {
    this.getNavigationBar().setStyles({
      backgroundImage: 'url(/img/title.png)', 
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center'
    });
    
    this.getNavigationBar().getLeftItem().setVisible(false);
    
    var back = this.getNavigationBar().setRightItem(new tau.ui.Button({
      styles: {
        backgroundImage: 'url(/img/done.png)',
        backgroundColor: 'transparent',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '64px',
        height: '36px',
        border: 'none'
      }
    }));
    back.onEvent(tau.rt.Event.TAP, this.popController, this);
    tau.bbc.EditController.$super.sceneLoaded.apply(this, arguments);
  },
  
  /**
   * 이전 Scene으로 이동한다.
   */
  popController : function(e, payload) {
    var parent = this.getParent();
    parent.popController();
  },
  
  /**
   * event listener, it will be notified when data to make a cell is ready
   * creates new TableCell instance and adds as a row
   * payload.data: an element of the loaded data(array)
   * payload.index: the index(0-based) of rows
   */
  makeTableCell: function (index, offset) {
    var item = this.rss[index + offset];
    
    if (!item || item.fixed) return null;
    
    var groupName = tau.bbc.EditController.MORE_TEXT,
          image = tau.bbc.EditController.PLUS_IMG;
    
    if (item.isDefault ) {
      groupName =tau.bbc.EditController.DEFAULT_TEXT;
      image = tau.bbc.EditController.MINUS_IMG;
    }

    return new tau.ui.TableCell({
        disabled: true,
        title: item.title,
        groupName: groupName,
        leftItem: new tau.ui.Button({
          styles: {
            backgroundColor: 'transparent',
            backgroundImage: 'url(' + image + ')',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            border: 'none',
            height: '34px'
          }
        })
      });
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
    this.rss = rss;
    
    return this.rss.length;
  },
  
  updateGroup: function (e, payload) {
    var button = e.getSource(),
        cell, title;
        groupName = tau.bbc.EditController.MORE_TEXT,
        image = tau.bbc.EditController.PLUS_IMG;

    if (button instanceof tau.ui.Button && (cell = button.getParent())) {
      groupName = cell.getGroupName();
      if (groupName !== tau.bbc.EditController.DEFAULT_TEXT) {
        groupName = tau.bbc.EditController.DEFAULT_TEXT;
        image = tau.bbc.EditController.MINUS_IMG;
      } else {
        groupName = tau.bbc.EditController.MORE_TEXT;
      }

      cell.getLeftItem().setStyle('background-image', 'url(' + image + ')');
      cell.setGroupName(groupName);
      
      this.getTable().add(cell, null, true);

      title = cell.getTitle();

      for(var i=0, len = this.rss.length; i < len; i++) {
        if (this.rss[i].title == title) {
          this.rss[i].isDefault = !this.rss[i].isDefault; 
          break;
        }
      }
      this.appCtx.setStorage('$rss', this.rss);
      this._changed = true;
    }
  }
});