function ModelNotes(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);

    var self = this;

    self.load = function () {
        alert("extension loaded");

        return true;
    };

    self.unload = function () {
        Autodesk.Viewing.theExtensionManager.unregisterExtension("ModelNotes");
        alert("extension unloaded");

        return true;
    };
}

ModelNotes.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ModelNotes.prototype.constructor = ModelNotes;

Autodesk.Viewing.theExtensionManager.registerExtension("ModelNotes", ModelNotes);
