window.sigmaCloudmapRenderer = function() {

  // Return the renderer itself:
  var renderer = function(node, context, settings) {
    var args = arguments
    var prefix = settings('prefix') || ''
    var size = node[prefix + 'size']
    var color = node.color || settings('defaultNodeColor')

    context.save()

    // Draw the border:
    context.beginPath()
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
    context.fill()
  }

  function blur(ctx, smoothing_ratio) {
    var w = ctx.canvas.clientWidth
    var h = ctx.canvas.clientHeight
    
    var imgd = ctx.getImageData(0, 0, w, h)
    var pix = imgd.data

    // Split channels
    var channels = [[], [], [], []] // rgba
    for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
      channels[0].push(pix[i  ])
      channels[1].push(pix[i+1])
      channels[2].push(pix[i+2])
      channels[3].push(pix[i+2])
    }

    var r = Math.sqrt( 0.08 * smoothing_ratio * w * h / Math.PI )

    channels.forEach(function(scl){
      var tcl = scl.slice(0)
      var bxs = boxesForGauss(r, 3);
      boxBlur (scl, tcl, w, h, (bxs[0]-1)/2);
      boxBlur (tcl, scl, w, h, (bxs[1]-1)/2);
      boxBlur (scl, tcl, w, h, (bxs[2]-1)/2);
      scl = tcl
    })

    // Merge channels
    for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
      pix[i  ] = channels[0][i/4]
      pix[i+1] = channels[1][i/4]
      pix[i+2] = channels[2][i/4]
      pix[i+2] = channels[3][i/4]
    }

    ctx.putImageData( imgd, 0, 0 )

    // From http://blog.ivank.net/fastest-gaussian-blur.html

    function boxesForGauss(sigma, n) { // standard deviation, number of boxes
    
      var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width 
      var wl = Math.floor(wIdeal);  if(wl%2==0) wl--;
      var wu = wl+2;
      
      var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
      var m = Math.round(mIdeal);
      // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
          
      var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
      return sizes;
    }

    function boxBlur (scl, tcl, w, h, r) {
      for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
      boxBlurH(tcl, scl, w, h, r);
      boxBlurT(scl, tcl, w, h, r);
    }

    function boxBlurH (scl, tcl, w, h, r) {
      var iarr = 1 / (r+r+1);
      for(var i=0; i<h; i++) {
        var ti = i*w, li = ti, ri = ti+r;
        var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
        for(var j=0; j<r; j++) val += scl[ti+j];
        for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
        for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
        for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
      }
    }

    function boxBlurT (scl, tcl, w, h, r) {
      var iarr = 1 / (r+r+1);
      for(var i=0; i<w; i++) {
        var ti = i, li = ti, ri = ti+r*w;
        var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
        for(var j=0; j<r; j++) val += scl[ti+j*w];
        for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
        for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
        for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
      }
    }
  }

  return renderer
}