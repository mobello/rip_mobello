/**
 * Font
 */
$class('tau.demo.Font').extend(tau.ui.SceneController).define( {
  $static: { 
    FONTS : [
      {label: 'default'},
      {label: 'simple'},
    ]
  },
  
  loadScene: function() {
    this.getScene().add(new tau.ui.SegmentedButton({
      vertical: true,
      components: tau.demo.Font.FONTS,
      valueChange: this.changeFont,
      styles: {width: '100%'}
    })
   );
  },
  
  /**
   * event listener, it will be notified when a user touches segmented button
   */
  changeFont: function (e, payload) {
    var fontName,
        current = payload.selectedIndexes[0],
        before = payload.deselectedIndexes[0];
    
    if (current != before){
      if (this._font){
        this._font.unload();
        delete this._font;
      }
      fontName = tau.demo.Font.FONTS[current].label;
      if (fontName != 'default'){
        this._font = new tau.ScriptHelper({ 
          type: 'css',
          url: 'lib/resources/font/' + fontName + '/stylesheet.css'
        });
        this._font.load();
      }
    } 
  }
});