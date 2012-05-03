$require('/theme.js');
$require('/font.js');

/**
 * demo application class
 */
$class('tau.demo.Setting').extend(tau.ui.SequenceNavigator).define({
  init: function (){
    this.setRootController(new tau.demo.SettingController());
  }
});

/**
 * 
 */
$class('tau.demo.SettingController').extend(tau.ui.TableSceneController).define( {
  $static: { 
    CELLS : [// 테이블 셀에 출력할 제목
      'Font'
      ,'Theme'
    ]
  },
  
  init: function () {
    tau.demo.SettingController.$super.init.apply(this, arguments);
    this.setTitle('Setting');  // 네비게이션 바에 출력할 제목
  },
  
  /**
   * callback function when scene is loaded
   */
  sceneLoaded: function () {
    var clazz = tau.demo.SettingController;
    var table = this.getTable();
    for(var i=0; i < clazz.CELLS.length; i++){  
      var cell = new tau.ui.TableCell();
      cell.setTitle(clazz.CELLS[i]);
      table.add(cell);
    }
    clazz.$super.sceneLoaded.apply(this, arguments);
  },

  /**
   * event listener, it will be notified when a user touches table cell
   */
  cellSelected: function (current, before) {
    var title = current.getTitle();
    var clazz = $class.forName('tau.demo.' + title);
    this.getParent().pushController(new clazz());
  }
});