function ModelNotes(aViewer, options) {
    Autodesk.Viewing.Extension.call(this, aViewer, options);

    var viewer = aViewer;
    var self = this;

    var snapshots = []
    var snapshotsPanel = null;

    self.load = function () {
        createToolbar();

        console.log("loaded")

        snapshotsPanel = new SnapshotsPanel(viewer.container, newGUID())

        snapshotsPanel.addVisibilityListener(function (isVisible) {
            if (!isVisible) {
                viewer.setNavigationLock(false);
                for (var i = 0; i < snapshots.length; ++i) {
                    snapshots[i].restoreColors();
                }
            }
        });

        return true;
    };

    self.unload = function () {
        removeToolbar();

        Autodesk.Viewing.theExtensionManager.unregisterExtension("ModelNotes");

        snapshots = [];

        console.log("unloaded")

        snapshotsPanel.setVisible(false);

        return true;
    };

    function createToolbar() {
        var toolbar = new Autodesk.Viewing.UI.ToolBar('model-notes-toolbar');
        var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup('Model.Notes.ToolBar.ControlGroup');
        ctrlGroup.addClass('toolbar-vertical-group');

        var buttons = [{
            name: "MN.AddNote",
            icon: "pencil",
            tooltip: "Добавить замечание",
            click: function () {
                addSnapShot();
            }
        }, {
            name: "MN.ShowNotes",
            icon: "tags",
            tooltip: "Показать замечания",
            click: function () {
                showSnapShots();
            }
        }
        ];

        for (var i = 0; i < buttons.length; ++i) {
            ctrlGroup.addControl(createButton(buttons[i]));
        }

        toolbar.addControl(ctrlGroup);

        createToolbarHtml(toolbar);
    }

    function createButton(opts) {
        var button = new Autodesk.Viewing.UI.Button(opts.name);

        button.icon.classList.add('myicon');
        button.icon.classList.add('glyphicon');
        button.icon.classList.add('glyphicon-' + opts.icon);

        button.setToolTip(opts.tooltip);

        button.onClick = opts.click;

        return button;
    }

    function createToolbarHtml(toolbar) {
        var toolbarDivHtml = '<div id="divMNToolbar"> </div>';

        $(viewer.container).append(toolbarDivHtml);

        toolbar.centerToolBar = function () {
            $('#divMNToolbar').css({
                'top': 'calc(50% + ' + toolbar.getDimensions().height / 2 + 'px)'
            });
        };

        toolbar.addEventListener(
		  Autodesk.Viewing.UI.ToolBar.Event.SIZE_CHANGED,
		  toolbar.centerToolBar
		);

        $('#divMNToolbar').css({
            'top': '0%',
            'left': '0%',
            'z-index': '100',
            'position': 'absolute'
        });

        $('#divMNToolbar')[0].appendChild(toolbar.container);

        setTimeout(function () { toolbar.centerToolBar(); }, 100);
    }

    function removeToolbar() {
        $('#divMNToolbar').remove();

        var viewerToolbar = viewer.getToolbar(true);

        viewerToolbar.removeControl("Model.Notes.ToolBar.ControlGroup")
    }

    function addSnapShot() {
        var title = prompt("Замечание");
        if (title !== null) {
            snapshots.push(new Snapshot(viewer, newGUID(), title))
        }
    }

    function showSnapShots() {
        snapshotsPanel.setSnapshots(snapshots);
        snapshotsPanel.setVisible(true);
        viewer.setNavigationLock(true);
    }

    function newGUID() {
        var d = new Date().getTime();
        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
		  /[xy]/g,
		  function (c) {
		      var r = (d + Math.random() * 16) % 16 | 0;
		      d = Math.floor(d / 16);
		      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
		  });
        return guid;
    }

    function SnapshotsPanel(parentContainer, baseId) {
        this.baseId = baseId;
        this.content = document.createElement('div');

        this.content.id = baseId + 'PanelContentId';

        Autodesk.Viewing.UI.DockingPanel.call(
		  this,
		  parentContainer,
		  baseId,
		  "Snapshots",
		  { shadow: true });

        this.container.style.right = "0px";
        this.container.style.top = "0px";

        this.container.style.width = "380px";
        this.container.style.height = "400px";

        this.container.style.resize = "auto";

        var html = "<div class='snapshots-content'></div>";
        $('#' + baseId).append(html);
    }

    SnapshotsPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
    SnapshotsPanel.prototype.constructor = SnapshotsPanel;
    SnapshotsPanel.prototype.setSnapshots = function (items) {
        var panelContent = $("#" + this.baseId + " > .snapshots-content");
        panelContent.empty()

        var ul = $("<ul></ul>");

        var restoreSnapshot = function (evt) {
            items
		        .filter(function (s) { return s.id === evt.target.id })
		        .forEach(function (s) {
		            s.restore();
		            s.colorize();
		        })
        }

        for (var i = 0; i < items.length; ++i) {
            var snapshot = items[i];
            var itemEl = $("<li></li>")
            itemEl.html(snapshot.title);
            itemEl.attr("id", snapshot.id)
            itemEl.css("color", "white")

            itemEl.click(restoreSnapshot);

            ul.append(itemEl)
        }

        panelContent.append(ul);
    }
    var overlayName = "temperary-colored-overlay";

    function addMaterial(color) {
        var material = new THREE.MeshPhongMaterial({
            color: color
        });

        viewer.impl.createOverlayScene(overlayName, material, material);

        return material;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Set color for nodes
    // objectIds should be an array of dbId
    ///////////////////////////////////////////////////////////////////////////
    Autodesk.Viewing.Viewer3D.prototype.setColorMaterial = function (objectIds, color) {
        var material = addMaterial(color);

        for (var i = 0; i < objectIds.length; i++) {

            var dbid = objectIds[i];

            //from dbid to node, to fragid
            var it = viewer.model.getData().instanceTree;

            it.enumNodeFragments(dbid, function (fragId) {
                var renderProxy = viewer.impl.getRenderProxy(viewer.model, fragId);

                renderProxy.meshProxy = new THREE.Mesh(renderProxy.geometry, renderProxy.material);

                renderProxy.meshProxy.matrix.copy(renderProxy.matrixWorld);
                renderProxy.meshProxy.matrixWorldNeedsUpdate = true;
                renderProxy.meshProxy.matrixAutoUpdate = false;
                renderProxy.meshProxy.frustumCulled = false;

                viewer.impl.addOverlay(overlayName, renderProxy.meshProxy);
                viewer.impl.invalidate(true);

            }, false);
        }
    }


    Autodesk.Viewing.Viewer3D.prototype.restoreColorMaterial = function (objectIds) {
        for (var i = 0; i < objectIds.length; i++) {

            var dbid = objectIds[i];

            //from dbid to node, to fragid
            var it = viewer.model.getData().instanceTree;

            it.enumNodeFragments(dbid, function (fragId) {
                var renderProxy = viewer.impl.getRenderProxy(viewer.model, fragId);

                if (renderProxy.meshProxy) {

                    viewer.impl.clearOverlay(overlayName);
                    delete renderProxy.meshProxy;

                    viewer.impl.invalidate(true);
                }
            }, true);
        }
    }
}

ModelNotes.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ModelNotes.prototype.constructor = ModelNotes;

Autodesk.Viewing.theExtensionManager.registerExtension("ModelNotes", ModelNotes);


function Snapshot(viewer, id, title) {
    this.id = id;
    this.title = title;
    this.viewer = viewer;
    this.selectedElementIds = viewer.getSelection();
    this.position = viewer.navigation.getPosition();
    this.target = viewer.navigation.getTarget();
    this.cameraUpVector = viewer.navigation.getCameraUpVector();
    this.navigationtool = this.viewer.getActiveNavigationTool();
}

Snapshot.prototype.restore = function () {
    var lockStatus = this.viewer.navigation.getIsLocked();

    this.viewer.navigation.setIsLocked(false);

    this.viewer.setActiveNavigationTool(this.navigationtool);
    this.viewer.navigation.setView(this.position, this.target);
    this.viewer.navigation.setCameraUpVector(this.cameraUpVector);
    this.viewer.select(this.selectedElementIds);

    this.viewer.navigation.setIsLocked(lockStatus);
}

Snapshot.prototype.colorize = function () {
    this.viewer.setColorMaterial(this.selectedElementIds, 0xff6600);
}

Snapshot.prototype.restoreColors = function () {
    this.viewer.restoreColorMaterial(this.selectedElementIds);
}