function initScene() {
  var scene = this.getScene();
  var panel1 = new tau.ui.Panel({styles : {backgroundImage: '-webkit-gradient(linear, left top, left bottom,from(#FEFEFE),to(#E2E2E2))', borderBottomColor: '#D0D0D0', borderBottomStyle: 'solid', borderBottomWidth: '2px', padding: '10px 10px 6px 10px', width: '100%'}});
  scene.add(panel1);
  var button1 = new tau.ui.Button({styles : {backgroundImage: '-webkit-gradient(linear, left top, left bottom,from(#FCFCFC),color-stop(50%,#F7F6F6),color-stop(51%,#F3F1F1),to(#F3F3F3))', borderColor: '#DEDDDD', color: '#898989', float: 'left', height: 'auto', padding: '2px 6px'} , label : {normal: '이전'}});
  panel1.add(button1);
  button1.onEvent('tap', this.popScene, this);
  var label1 = new tau.ui.Label({text : this.article.title , styles : {color: '#666666', display: 'block', padding: '4px 10px', whiteSpace: 'nowrap'}});
  panel1.add(label1);
  var textView1 = new tau.ui.TextView({id: 'textView1', hScroll: true, text : this.article.description , styles : {backgroundColor: '#FFFFFF'}});
  scene.add(textView1);
}