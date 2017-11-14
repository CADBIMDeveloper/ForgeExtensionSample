function ModelNotes(aViewer, options) {
    Autodesk.Viewing.Extension.call(this, aViewer, options);

    var viewer = aViewer;
    var self = this;

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

    self.load = function () {
        createToolbar();

        console.log("loaded");

        return true;
    };
    self.unload = function () {
        removeToolbar();

        Autodesk.Viewing.theExtensionManager.unregisterExtension("ModelNotes");

        console.log("unloaded")

        return true;
    };

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
        alert("add snap shot");
    }

    function showSnapShots() {
        alert("show snapshots")
    }
}

ModelNotes.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ModelNotes.prototype.constructor = ModelNotes;

Autodesk.Viewing.theExtensionManager.registerExtension("ModelNotes", ModelNotes);