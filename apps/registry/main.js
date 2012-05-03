/**
 * Registry Demo Application
 * 
 * @version 1.1.0
 * @creation 2011. 11. 28.
 */

/**
 * Main Controller Class. This class is registered config.json configuration
 * file
 */
$class('tau.sample.store.AppStore').extend(tau.ui.ParallelNavigator).define({

  /**
   * initialize default properties
   */
  init: function () {
    tau.sample.store.AppStore.$super.init.apply(this, arguments);
    var ctrls = [];
    this.appCtx = tau.getCurrentContext();
    var tabs = this.appCtx.getConfig().tabs;
    
    for (var i = 0, len = tabs.length; i < len; i++) {
      ctrls.push(new tau.sample.store.AppNavigator({ title: tabs[i].title }));
    }
    this.setControllers(ctrls);
    
    var tabBar = this.getTabBar();
    var tabcomps = tabBar.getComponents();
    for (var i = 0, len = tabcomps.length; i < len; i++) {
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
        fontSize: '70%',
      });
    }
  }
});

/**
 * Class definition for Page Navigation(SequenceNavigation)
 */
$class('tau.sample.store.AppNavigator').extend(tau.ui.SequenceNavigator).define({
  init: function () {
    var title = this.getTitle();
    var ctrl;
    if (title === '카테고리') {
      ctrl = new tau.sample.store.CategoryListController({'title': title});
    } else if (title === '검색') {
      ctrl = new tau.sample.store.AppsSearchController({'title': title});
    } else if (title === '추천') {
      ctrl = new tau.sample.store.AppsRecommendController({'title': title});
    } else {
      ctrl = new tau.sample.store.BaseListController({'title': title});
    }
    this.setRootController(ctrl);
  }
});

/**
 * Class for app list controller for default TableSceneController 
 */
$class('tau.sample.store.BaseListController').extend(tau.ui.TableSceneController).define({
  BaseListController: function () {
    this._model = null;
  },

  /**
   * initialize default table appearance
   */
  init: function () {
    tau.sample.store.BaseListController.$super.init.apply(this, arguments);
    var scene = this.getScene();
    var table = new tau.ui.Table({styles: {backgroundColor: '#ccc'}});
    scene.add(table);
  },
  
  /**
   * create table cell and returns
   * @param index
   * @param offset
   * @returns {tau.ui.TableCell}
   */
  makeTableCell: function (index, offset) {
    var cell = new tau.ui.TableCell({
          styles: {
            backgroundImage: '-webkit-gradient(linear, left top, left bottom,from(white),color-stop(40%,white),color-stop(80%,#EFEFEF),to(#DDD));',
            height: '70px',
            cellLeftItemWidth: '70px',
            'border-top': '1px solid #F2F2F0',
            'border-bottom': '1px solid #BFBFBD'
          }
        }),
        data = this._model[offset + index];
    cell.setTitle(data.title);
    cell.setLeftItem(new tau.ui.ImageView({
      src: data.icon,
      styles: {
        margin: '5px',
        width: '60px',
        height: '60px'
      }
    }));

    cell.setStyle('background-color', index % 2 == 0 ? '#ccc' : '#ddd');
    if (data.vendor) {
      cell.setSubTitle(data.vendor);
    }
    return cell;
  },
  
  /**
   * load data model
   * @param start
   * @param size
   */
  loadModel: function (start, size) {
    var that = this,
        apps = tau.getCurrentContext().getConfig().apps,
        table = this.getTable();
    tau.getRuntime().resolve(apps, function (confs) {
      that._model = confs;
      table.addNumOfCells(confs.length);
    });
  },
  
  /**
   * event listener, it will be notified when a user touches table cell
   */
  cellSelected: function (current, before) {
    if (current instanceof tau.ui.TableCell) {
      var idx = this.getCellIndex(current);
      var detail = new tau.sample.store.AppDetailController(this._model[idx]);
      this.getParent().pushController(detail);
    }
  },
  
  /**
   * find the index of specified cell out of table component
   * @param cell
   * @returns
   */
  getCellIndex: function (cell) {
    return this.getTable().indexOf(cell).pop(); // index is array
  },
  
  /**
   * @override
   */
  destory: function () {
    tau.sample.store.BaseListController.$super.destroy.apply(this, arguments);
    this._model = null;
  }
});

/**
 * 
 */
$class('tau.sample.store.CategoryListController').extend(tau.sample.store.BaseListController).define({

  /**
   * Load default data model
   * @param start
   * @param size
   * @returns
   */
  loadModel: function (start, size) {
    this._model = [ { title: '게임', icon: '/img/icon1.png' },
                   { title: '생산성', icon: '/img/icon2.png' }, 
                   { title: '도서', icon: '/img/icon3.png' }, 
                   { title: '뉴스', icon: '/img/icon4.png' }, 
                   { title: '사진 및 비디오', icon: '/img/icon5.png' }, 
                   { title: '내비게이션', icon: '/img/icon6.png' }, 
                   { title: '건강 및 피트니스', icon: '/img/icon7.png' }, 
                   { title: '날씨', icon: '/img/icon8.png' }, 
                   { title: '소셜네트워크', icon: '/img/icon9.png' }, 
                   { title: '참고', icon: '/img/icon0.png' } ];
    return this._model.length;
  },

  /**
   * callback method when user touches specific table cell
   * @param current
   * @param before
   */
  cellSelected: function (current, before) {
    if (current instanceof tau.ui.TableCell) {
      var path = this.getTable().indexOf(current).pop();
      var detail = new tau.sample.store.BaseListController();
      detail.setTitle(this._model[path].title);
      this.getParent().pushController(detail);
    }
  }
});

/**
 *
 */
$class('tau.sample.store.AppsSearchController').extend(tau.sample.store.BaseListController).define({

  /**
   * initialize default properties
   */
  init: function () {
    tau.sample.store.AppsSearchController.$super.init.apply(this, arguments);
    var headerPanel = new tau.ui.Panel();
    headerPanel.setStyles({width: '100%', padding: '5px'});
    var searchBar = new tau.ui.TextField({
      placeholderImage: '/img/06-magnify.png',
      clearButtonMode: true});
    searchBar.setStyle('width', '100%');
    searchBar.onEvent('keyup', this._handleKeyup, this);
    headerPanel.add(searchBar);

    var table = this.getTable();
    table.setHeaderItem(headerPanel);
  },
  
  /**
   * event handler for 'keyup' event
   * @param e
   * @param payload
   */
  _handleKeyup: function (e, payload) {
    var table = this.getTable();
    var count = this.loadModel(payload.start, payload.size,
        payload.value);
    table.removeComponents();
    if (count && count >= 0) {
      table.addNumOfCells(count);
    } else {
      table.draw();
    }
  },
  
  /**
   *
   */
  loadModel: function (start, size, word) {
    if (!word || word === '') {
      return 0;
    }
    if (this._model) {
      return this._model.length;
    }
    tau.sample.store.AppsSearchController.$super.loadModel.apply(this, arguments);
  }
});

/**
 *
 */
$class('tau.sample.store.AppsRecommendController').extend(tau.sample.store.BaseListController).define({

  /**
   * initialize default properties
   */
  init: function () {
    tau.sample.store.AppsRecommendController.$super.init.apply(this, arguments);
    var table = this.getTable();
    
    var panel = this._getBannerPanel('/img/temp1.png', '/img/temp2.png');
    table.add(this._getBannerCell(panel));
    panel = this._getBannerPanel('/img/temp3.png', '/img/temp4.png');
    table.add(this._getBannerCell(panel));
  },
  
  /**
   * 
   * @param index
   * @param offset
   * @returns
   */
  makeTableCell: function (index, offset) {
    var p = tau.sample.store.AppsRecommendController.$super;
    return p.makeTableCell.call(this, index, 0); // adjust offset value as 0 
  },
  
  /**
   * 
   * @override
   */
  getCellIndex: function (cell) {
    return this.getTable().indexOf(cell).pop() - 2;// first two is banner
  },
  
  /**
   * 
   * @param src
   * @returns {tau.ui.ImageView}
   */
  _getBannerPanel: function (img1, img2) {
    var panel = new tau.ui.Panel({styles: {width: '312px'}});
    panel.add(this._getBannerImg(img1));
    panel.add(this._getBannerImg(img2));
    return panel;
  },

  /**
   * 
   * @param src
   * @returns {tau.ui.ImageView}
   */
  _getBannerImg: function (src) {
    return new tau.ui.ImageView({
      'src': src,
      styles: {
        height: '50px',
        width: '48%',
        'border-radius': '10px',
        margin: '1%'
      }
    });
  },
  
  /**
   * 
   * @param content
   * @returns {tau.ui.TableCell}
   */
  _getBannerCell: function (content) {
    return new tau.ui.TableCell({
      disabled: true,
      contentItem: content,
      styles: {height: '70px'}
    });
  }
});

/**
 */
$class('tau.sample.store.AppDetailController').extend(tau.ui.SceneController).define({
  /**
   * Constructor
   * @param {Object} item flickr individual item
   */
  AppDetailController: function (detail) {
    this._detail = detail;
    this.setTitle('정보');
  },

  /**
   * 
   */
  loadScene: function () {
    var scene = this.getScene();
    scene.setStyles({
          'background-image': '-webkit-gradient(linear, left top, left bottom,from(#999),color-stop(20%,#ccc),to(#ccc))'
        });
    var panel = new tau.ui.Panel({
      styles: {
        width: '100%',
        height: '100px'
      }
    });

    var img = new tau.ui.ImageView({
          'src': this._detail.icon,
          styles: {
            left: '10px',
            top: '10px',
            width: '60px',
            '-webkit-box-reflect': 'below 0px -webkit-gradient(linear, 0% 70%, 0% 100%, from(transparent), to(rgba(0, 0, 0, 0.398438)))'
          }
        });

    var vendor = new tau.ui.Label({
      text: this._detail.vendor,
      styles: {
        top: '30px',
        left: '80px',
        color: '#555',
        'font-weight': 'bold',
        'font-size': '0.8em',
        'text-shadow': 'rgba(255,255,255, 0.5) 0 1px'
      }
    });
    var title = new tau.ui.Label({
      text: this._detail.title,
      styles: {
        top: '10px',
        left: '80px',
        'font-weight': 'bold',
        'font-size': '1.4em',
        'text-shadow': 'rgba(255,255,255, 0.5) 0 1px'
      }
    });
    var install = new tau.ui.Button({
      'label': '설치',
      styleClass: {
        type: 'sanmarino'
      },
      styles: {
        top: '50px',
        right: '10px'
      }
    });

    var desc = new tau.ui.Label({
      text: this._detail.desc,
      styles: {
        'border-bottom': '1px dashed gray',
        padding: '10px'
      }
    });

    panel.add(img);
    panel.add(vendor);
    panel.add(title);
    panel.add(install);
    scene.add(panel);
    scene.add(desc);

    panel = new tau.ui.Panel({
      styles: {
        width: '100%',
        height: '30px',
        'font-size': '14px',
        'border-bottom': '1px dashed gray',
        'border-top': '1px dashed lightgray'
      }
    });

    var vendorLabel = new tau.ui.Label({
      text: '회사',
      styles: {
        right: '80%',
        color: '#555',
        'font-weight': 'bold',
        margin: '6px'
      }
    });

    var vendorName = new tau.ui.Label({
      text: this._detail.vendor,
      styles: {
        left: '25%',
        margin: '6px'
      }
    });

    panel.add(vendorLabel);
    panel.add(vendorName);
    scene.add(panel);

    panel = new tau.ui.Panel({
      styles: {
        width: '100%',
        height: '30px',
        'font-size': '14px',
        'border-bottom': '1px dashed gray',
        'border-top': '1px dashed lightgray'
      }
    });
    var versionLabel = new tau.ui.Label({
      text: '버전',
      styles: {
        right: '80%',
        color: '#555',
        'font-weight': 'bold',
        margin: '6px'
      }
    });

    var versionName = new tau.ui.Label({
      text: this._detail.version,
      styles: {
        left: '25%',
        margin: '6px'
      }
    });
    panel.add(versionLabel);
    panel.add(versionName);
    scene.add(panel);
    install.onEvent(tau.rt.Event.TAP, this.handleInstallTouched, this);
  },

  /**
   * 
   * @param e
   * @param payload
   */
  handleInstallTouched: function (e, payload) {
    var scene = this.getScene();
    scene.fireEvent(tau.rt.Event.RT_START, '$dashboard');
    scene.fireEvent(tau.rt.Event.RT_INSTALL, {
      name: this._detail.name,
      sys: false
    });
  },

  /**
   * Frees resources no longer used
   */
  destroy: function () {
    tau.sample.store.AppDetailController.$super.destroy.apply(this, arguments);
    this._detail = null;
  }
});