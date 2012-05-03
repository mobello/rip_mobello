/**
 * Theme
 */
$class('tau.demo.Theme').extend(tau.ui.SceneController).define( {
  $static: { 
    THEMES : [
      'default',
      'simple',
      'ios'
    ]
  },
  
  loadScene: function() {
    var themeName = tau.getRuntime().$themeMgr._getDefaultThemeName(),
      themes = tau.demo.Theme.THEMES,
       index = themes.indexOf(themeName) || 0,
       comps = [];

    for(var i=0; i < themes.length; i++) {
      comps[i] = {label : themes[i]}; 
    }

    this.getScene().add(new tau.ui.SegmentedButton({
      components: comps,
      vertical: true,
      valueChange: this.changeTheme,
      styles: {width: '100%'},
      selectedIndexes: [index]
    }));
  },
  
  /**
   * event listener, it will be notified when a user touches segmented button
   */
  changeTheme: function (e, payload) {
    var themes = tau.demo.Theme.THEMES;
    var index = payload.selectedIndexes[0] || 0;

    tau.getRuntime().setTheme(themes[index]);
  }
});