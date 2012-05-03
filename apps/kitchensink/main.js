$require('/default.js');
$require('/toolbar.js');
$require('/button.js');
$require('/table.js');
$require('/groupTable.js');

$class('tau.demo.kitchensink.Main').extend(tau.ui.ParallelNavigator).define({

  /**
   * initialize
   */
  init: function() {
    var ctrls = [ new tau.demo.kitchensink.Form(),
        new tau.demo.kitchensink.GroupTable(false),
        new tau.demo.kitchensink.GroupTable(true),
        new tau.demo.kitchensink.Table(tau.ui.PaginationBar.SLIDER_TYPE),
        new tau.demo.kitchensink.Table(tau.ui.PaginationBar.NORMAL_TYPE),
        new tau.demo.kitchensink.Toolbar(),
        new tau.demo.kitchensink.Button() ];

    this.appCtx = tau.getCurrentContext();
    this.setControllers(ctrls);

    var tabs = [ 
      {icon: '/img/star.png' }, 
      {icon: '/img/headset.png' }, 
      {icon: '/img/cleaning.png' }, 
      {icon: '/img/signal.png' }, 
      {icon: '/img/car.png' }, 
      {icon: '/img/glass.png' }, 
      {icon: '/img/leaf.png' }
    ];

    var tabBar = this.getTabBar();
    var tabcomps = tabBar.getComponents();
    for (var i = 0, len = tabs.length; i < len; i++) {
      var tab = tabs[i];
      var tabcomp = tabcomps[i];
      var backImage = {
        normal: tab.icon,
        selected: tab.icon,
        disabled: tab.icon,
        highlighted: tab.icon,
      };
      tabcomp.setBackgroundImage(backImage);
      tabcomp.setStyles({
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top center',
        fontSize: '70%',
      });
    }
  }
});
