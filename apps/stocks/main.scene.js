function initScene() {
  var scene = this.getScene();
  scene.setStyles({
    color: 'white',
    background: 'black',
    padding: '2px'
  });
  var table = new tau.ui.Table({
    id: 'list',
    styleClass: {cellContent: 'titleleft'},
    styles: {
      marginTop: '2px',
      height: '58%',
      borderRadius: '10px',
      marginBottom: '2%',
      cellRightItemWidth: '80px',
      fontSize: '2em',
      backgroundColor: '#C5CCD3',
      backgroundImage: '-webkit-gradient(linear, 0% 50%, 100% 50%, color-stop(75%, rgba(255, 255, 255, 0) ), color-stop(75%, rgba(255, 255, 255, 0.1) ) )',
      backgroundSize: '7px'
    }
  });
  table.onEvent(tau.rt.Event.TOUCHSTART, this.handleTouchStart, this, true);
  table.onEvent(tau.rt.Event.TAP, this.handleTap, this, true);
  table.onEvent(tau.rt.Event.SELECTCHANGE, this.handleCellSelected, this);
  table.onEvent(tau.ui.Table.EVENT_MODEL_LOAD, this.loadModel, this);
  table.onEvent(tau.ui.Table.EVENT_CELL_LOAD, this.makeTableCell, this);
  scene.add(table);
  var carousel = new tau.ui.Carousel({
    styles: {
      height: '40%',
      borderRadius: '10px'
    },
    components: [
      new tau.ui.Panel({
        id: 'stockInfo',
        styles: {
          backgroundImage: '-webkit-gradient(linear, left top, left bottom,color-stop(0%, #566b8a), color-stop(50%, #1c375d), color-stop(50%, #071b43), color-stop(100%, #071b43))',
          borderRadius: '10px',
          padding: '4px',
          fontSize: '.8em',
          border: '2px solid black',
          '-webkit-box-orient': 'vertical'
        },
        components: [
          new tau.ui.Label({
            id: 'detail_title',
            styles: {
              display: 'block',
              fontSize: '1.2em',
              width: '100%',
              textAlign: 'center'
            }
          }),
          new tau.ui.Label({text: 'Open:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_open', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: 'Mkt Cap:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'deatil_mktcap', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: 'High:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_high', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: '52w High:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_52whigh', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: 'Low:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_low', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: '52w Low:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_52wlow', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: 'Vol:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_vol', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: 'Avg Vol:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_avgvol', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: 'P/E:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_pe', styles: {width: '30%', padding: 0}}),
          new tau.ui.Label({text: 'Yeild:', styles: {width: '20%', padding: 0}}),
          new tau.ui.Label({text: '-', id: 'detail_yield', styles: {width: '30%', padding: 0}})
        ]
      }),
      new tau.ui.Panel({
        id: 'stockChart',
        styles: {
          backgroundImage: '-webkit-gradient(linear, left top, left bottom,color-stop(0%, #566b8a), color-stop(50%, #1c375d), color-stop(50%, #071b43), color-stop(100%, #071b43))',
          borderRadius: '10px',
          border: '2px solid black'
        },
        components: [
          new tau.ui.ImageView({
            id: 'detail_chart',
            styles: {
              width: '100%', 
              height: 'auto',
              maxHeight: '100%',
              borderRadius: '10px',
              paddingBottom: '44px'
            }
          })
        ]
      }) /*,
      new tau.ui.ScrollPanel({
        id: 'stockNews',
        styles: {
          backgroundImage: '-webkit-gradient(linear, left top, left bottom,color-stop(0%, #566b8a), color-stop(50%, #1c375d), color-stop(50%, #071b43), color-stop(100%, #071b43))',
          borderRadius: '10px',
          border: '2px solid black'
        }
      })*/
    ]
  });
  
  // 이 부분은 처리하지 어려울거 같음 
  var indicator = carousel.getMapItem('indicator');
  indicator.setStyles({
    backgroundImage: '-webkit-gradient(linear, left top, left bottom,color-stop(0%, #566b8a), color-stop(50%, #1c375d), color-stop(50%, #071b43), color-stop(100%, #071b43))',
    height: '44px',
    paddingTop: '20px'
  });
  scene.add(carousel);
  /*
  var button1 = new tau.ui.Button({
      label: 'Y!',
      styles: {
        bottom: '0',
        margin: '12px',
        height: '24px',
        left: '10px',
        zIndex: 1
      }
  });
  */
  var label =new tau.ui.Label({
      id: 'marketState',
      text: 'Market closed',
      styles: {
        display: 'block',
        bottom: '0',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '.8em',
        marginBottom: '24px',
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 1
      }
    });
  var button2 = new tau.ui.Button({
      id: 'setting',
      styles: {
        bottom: '0',
        right: '10px',
        marginBottom: '12px',
        border: 'none',
        borderRadius: '9999px',
        width: '24px',
        height: '24px',
        backgroundImage: 'url(/img/UIButtonBarInfo@2x.png)',
        backgroundColor: 'transparent',
        backgroundSize: 'cover',
        zIndex: 1
      }
    });
  button2.onEvent(tau.rt.Event.TAP, this.handleSetting, this);
  //scene.add(button1);
  scene.add(label);
  scene.add(button2);
  
}