function initScene() {
  // config(data)가져오는 부분이 필요함.
  var context = tau.getCurrentContext(),
      config = context.getConfig(),
      scene = this.getScene();
  
  scene.setStyles({
    display: 'flexbox', 
    '-webkit-box-orient': 'vertical'
  });
  scene.add(new tau.ui.ImageView({
    src : '/' + config.header, 
    styles: {
      display: config.header ? 'block' : 'none', 
          height: '60px', 
          width: '100%'
    }
  }));
  
  scene.add(new tau.ui.Panel({
    id: 'map',
    styles: {
      '-webkit-box-flex': 1, 
      display: 'block',
      width: '100%',
      height: '100%',
    }
  }));

  scene.add(new tau.ui.ImageView({
    src: '/' + config.footer, 
    styles: {
      display: config.footer ? 'block' : 'none', 
      height: '60px', 
      width: '100%'
    }
  }));
}