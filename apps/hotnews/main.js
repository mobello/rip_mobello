$require('/list.js');

/**
 * tab bar based application main controller
 */
$class('tau.sample.hotnews.MainController').extend(tau.ui.ParallelNavigator).define({
  /**
   * 
   */
  init: function() {
    var ctrls = new Array();
    this.appCtx = tau.getCurrentContext();
    var tabs = this.appCtx.getConfig().tabs;
    for (i in tabs) {
      ctrls.push(new tau.sample.hotnews.Navigator({
        title : tabs[i].title,
        url : tabs[i].url
      }));
    }

    this.setControllers(ctrls);

    var tabBar = this.getTabBar();
    var tabcomps = tabBar.getComponents();
    for (i in tabs) {
      var tabcomp = tabcomps[i];
      var backImage = {
        normal: tabs[i].icon,
        selected: tabs[i].selectedIcon,
        disabled: tabs[i].icon,
        highlighted: tabs[i].icon,
      };
      tabcomp.setBackgroundImage(backImage);
      tabcomp.setStyles({
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center',
        fontSize : '70%',
      });
    }
  }
});

/**
 * 
 */
$class('tau.sample.hotnews.Navigator').extend(tau.ui.SequenceNavigator).define({
  /**
   * 
   * @param opts
   */
  Navigator: function(opts) {
    this.opts = opts;
  },

  /**
   * 
   */
  init: function() {
    this.setHideNavigationBar(true);
    this.setRootController(new tau.sample.hotnews.ListController({
      title : this.opts.title,
      url : this.opts.url
    }));
  }
});