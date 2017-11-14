var myViewerDiv = document.getElementById('viewer');
var viewer = new Autodesk.Viewing.Private.GuiViewer3D(myViewerDiv);
var options = {
    'env': 'Local',
    'document': './Content/Model/0.svf'
};
Autodesk.Viewing.Initializer(options, function () {
    viewer.start(options.document, options);
});