/**
 * Contact detail scene
 */
$class('tau.sample.ContactInfo').extend(tau.ui.SceneController).define({
  /**
   * 
   * @param name
   * @param phone
   */
  ContactInfo: function (info) {
    this._info = info;
    this.setTitle('정보');
  },

  /**
   * create detail scene
   */
  loadScene: function () {
    var brief, btn, label, title, labels, cell,
        scene = this.getScene();
    scene.setStyles({display: 'flexbox', 
                    '-webkit-box-orient': 'vertical'});
    scene.setStyleClass({type:'ios'});

    var table = new tau.ui.Table({
        group: true,
        styles: {cellLeftItemWidth: '80px', '-webkit-box-flex': 1}, 
        styleClass: { section: 'sectionGroup' }}
      );
    var section = new tau.ui.TableSection();
    var photo = new tau.ui.ImageView();
    photo.setSrc(this._info.img || '/img/noname.png');
    photo.setStyles({padding: '10px'});
    cell = new tau.ui.TableCell({leftItem: photo, styles: {height: '100px'}});
    cell.setDisabled(true);

    brief = new tau.ui.Panel();
    brief.setStyles({display: 'inline-block', 'margin-left': '10px'});
    label = new tau.ui.Label();
    label.setText(this._info.name);
    label.setStyles({width: '100%', 'font-weight': 'bold'});
    brief.add(label);

    title = this._info.position;
    if (title && this._info.deppartment) {
      title += (' - ' + this._info.deppartment);
    } else  {
      title = this._info.deppartment;
    }
    if (title) {
      label = new tau.ui.Label();
      label.setText(title);
      label.setStyles({width: '100%', display: 'block'});
      brief.add(label);
    }
    if (this._info.company) {
      label = new tau.ui.Label();
      label.setText(this._info.company);
      label.setStyles({width: '100%', display: 'block'});
      brief.add(label);
    }
    cell.setContentItem(brief);
    section.add(cell);
    table.add(section);
    
    section = new tau.ui.TableSection();
    table.add(section);
    if (this._info.office) {
      section.add(this.newTableCell('직장', this._info.office));
    }
    if (this._info.mobile) {
      section.add(this.newTableCell('휴대전화', this._info.mobile));
    }
    
    if (this._info.email) {
      section = new tau.ui.TableSection();
      section.add(this.newTableCell('직장', this._info.email));
      table.add(section);
    }
    scene.add(table);
    
    var panel = new tau.ui.Panel();
    panel.setStyles({display: '-webkit-box', 
                    '-webkit-box-pack': 'justify',
                    'padding': '5px'});
    labels = ['메시지', '연락처공유', '즐겨찾기']; 
    for(var i = 0, len = labels.length; i < len; i++) {
      btn = new tau.ui.Button({
        styles: ({display: 'block'}),
           label: labels[i]
      });
      panel.add(btn);
    }
    panel.onEvent(tau.rt.Event.TAP, this.buttonSelected, this);
    scene.add(panel);
  },
  
  /**
   * event listener notified when user clicks button positioned bottom
   * @param e
   * @param payload
   */
  buttonSelected: function (e, payload) {
    var src = e.getSource();
    if (src instanceof tau.ui.Button) {
      tau.alert('['+ src.getLabel() + '] is tapped!');
    }
  },
  
  /**
   * creates new table cell with specified label and value
   * @param text
   * @param value
   * @returns {tau.ui.TableCell}
   */
  newTableCell: function (text, value) {
    var label = new tau.ui.Label();
    label.setText(text);
    label.setStyles({'font-weight': 'bold'});
    var cell = new tau.ui.TableCell({
      leftItem : label,
      title: value
    });
    return cell;
  }
});