function initScene() {
  var scene = this.getScene();
  scene.setStyles({
    background: 'black',
    padding: '2px'
  });
  var table = new tau.ui.Table({id: 'list'});
  table.onEvent(tau.rt.Event.SELECTCHANGE, this.handleCellSelected, this);
  table.onEvent(tau.ui.Table.EVENT_CELL_LOAD, this.makeTableCell, this);
  
  var panel = new tau.ui.Panel({
    styles: {
      width: '100%'
    }
    /*
    styles: {
      backgroundImage: '-webkit-linear-gradient(#717172, #3a3a3a 50%, #0d0d0f 51%, #0f0f10)',
      color: 'white'
    }*/
  });
  var label = new tau.ui.Label({
    text: 'Type a company name or stock ID.',
    styles: {
      display: 'block',
      width: '100%',
      textAlign: 'center',
      fontSize: '.8em'
    }
  });
  var textfield = new tau.ui.TextField({
    type: 'search',
    styles: {width: '78%', padding: '0 6px'}
  });
  textfield.onEvent('keyup', this.handleKeyup, this);
  var button = new tau.ui.Button({
    id: 'cancel',
    label: 'cancel',
    styleClass: {size: 'small'}
  });
  button.onEvent(tau.rt.Event.TAP, this.handleCancel, this);
  
  panel.setComponents([label, textfield, button]);
  table.setHeaderItem(panel);
  scene.add(table);
}