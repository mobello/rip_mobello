$class('tau.demo.kitchensink.Table').extend(tau.ui.SceneController).define({

  /**
   * Constructor
   * @param paginationType
   */
  Table: function(paginationType) {
    this.setTitle('Table');
    this.paginationType = paginationType;
  },

  /**
   * loads default scene
   */
  loadScene: function() {
    var scene = this.getScene();
    var paginationDock = (this.paginationType == tau.ui.PaginationBar.NORMAL_TYPE)  ? 
        tau.ui.PaginationBar.BOTTOM_DOCK : tau.ui.PaginationBar.LEFT_DOCK;
    var table = new tau.ui.Table({
      headerItem: new tau.ui.Label({text: 'Header'}),
      footerItem: new tau.ui.Label({text: 'Footer'}),
      group: false, // true 로 하면 pagination.pageSize 속성이 적용 안된다. 
      pagination: {
        pageSize: 5, 
        dock: paginationDock, 
        type: this.paginationType
      }
    });
    scene.add(table);
    for(var i = 0; i < 100; i++) {
      var cell = new tau.ui.TableCell({
        title: 'Table Cell ' + i,
        groupName: Math.floor(i/10) + '0',
      });
      table.add(cell);
    }
  },
});