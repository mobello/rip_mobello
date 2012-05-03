function initScene() {
  var scene = this.getScene();
  scene.setStyles({
    background: 'black',
      padding: '2px'
  });
  var toolbar = new tau.ui.ToolBar({
    styleClass: {type: 'dark'},
    styles: {
      color: 'white'
    },
    dock: tau.ui.ToolBar.TOP_DOCK
  });
  var add = new tau.ui.Button({
    id: 'add',
    label: '+',
    styleClass: {type: 'dark'},
    styles: {
      marginLeft: '4px'
    }
  });
  var label = new tau.ui.Label({
    text: 'Stocks'
  });
  var done = new tau.ui.Button({
    id: 'done',
    styleClass: {type: 'blue'},
    label: 'Done',
    styles: {
      marginRight: '4px'
    }
  });

  add.onEvent(tau.rt.Event.TAP, this.handleAdd, this);
  done.onEvent(tau.rt.Event.TAP, this.handleDone, this);
  
  toolbar.setComponents([add, label, done]);
  
  scene.add(toolbar);
  
  var table = new tau.ui.Table({
    styles: {
      background: 'white',
      height: '78%',
      marginBottom: '2%',
      borderRadius: '10px',
      cellRightItemWidth: '80px'
    }
  });
  table.onEvent(tau.rt.Event.TAP, this.handleTap, this);
  table.onEvent(tau.ui.Table.EVENT_MODEL_LOAD, this.loadModel, this);
  table.onEvent(tau.ui.Table.EVENT_CELL_LOAD, this.makeTableCell, this);
  
  scene.add(table);
  
  var segmentedButton = new tau.ui.SegmentedButton({
    id: 'stockValueType',
    styles: {
      display: 'flexbox',
      padding: '4px'
    },
    components: [
      {label: '%'},
      {label: '주식가격'},
      {label: '시가총액'},
    ],
    selectedIndexes: [parseInt(this._stockValueType)]
  });
  segmentedButton.onEvent(tau.rt.Event.VALUECHANGE, this.handleStockValueType, this);
  scene.add(segmentedButton);
}