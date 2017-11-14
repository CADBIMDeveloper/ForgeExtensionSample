var myViewerDiv = document.getElementById('viewer');
var extensionsConfig = {
    extensions: ['ModelNotes']
};
var viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv, extensionsConfig);
var options = {
    'env': 'Local',
    'document': './Content/Model/0.svf'
};
Autodesk.Viewing.Initializer(options, function () {
    viewer.start(options.document, options);
});