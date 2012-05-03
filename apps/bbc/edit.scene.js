function initScene() {
	var scene = this.getScene();
  var table1 = new tau.ui.Table({
      group: true,
      components: [
        new tau.ui.TableSection({
          groupName: tau.bbc.EditController.DEFAULT_TEXT
        }),
        new tau.ui.TableSection({
          groupName: tau.bbc.EditController.MORE_TEXT
        })
      ]
    });

  table1.onEvent(tau.rt.Event.TAP, this.updateGroup, this, true);
	scene.add(table1);
}