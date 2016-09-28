window.sigmaCloudmapRenderer = function() {
  var _callbacks = {};

  // Return the renderer itself:
  var renderer = function(node, context, settings) {
    var args = arguments
    var prefix = settings('prefix') || ''
    var size = node[prefix + 'size']
    var color = node.color || settings('defaultNodeColor')

    context.save();

    // Draw the border:
    context.beginPath();
    context.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      node[prefix + 'size'],
      0,
      Math.PI * 2,
      true
    );
    context.lineWidth = size / 5;
    context.fillStyle = '#999'
    context.fill();
  };

  return renderer;
}