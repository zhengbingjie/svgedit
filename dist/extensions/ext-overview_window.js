var svgEditorExtension_overview_window = (function () {
  'use strict';

  /**
   * @file ext-overview_window.js
   *
   * @license MIT
   *
   * @copyright 2013 James Sacksteder
   *
   */
  var extOverview_window = {
    name: 'overview_window',
    init: function init(_ref) {
      var $ = _ref.$,
          isChrome = _ref.isChrome,
          isIE = _ref.isIE;
      var overviewWindowGlobals = {}; // Disabled in Chrome 48-, see https://github.com/SVG-Edit/svgedit/issues/26 and
      // https://code.google.com/p/chromium/issues/detail?id=565120.

      if (isChrome()) {
        var verIndex = navigator.userAgent.indexOf('Chrome/') + 7;
        var chromeVersion = Number.parseInt(navigator.userAgent.substring(verIndex));

        if (chromeVersion < 49) {
          return undefined;
        }
      } // Define and insert the base html element.


      var propsWindowHtml = '<div id="overview_window_content_pane" style="width:100%; ' + 'word-wrap:break-word;  display:inline-block; margin-top:20px;">' + '<div id="overview_window_content" style="position:relative; ' + 'left:12px; top:0px;">' + '<div style="background-color:#A0A0A0; display:inline-block; ' + 'overflow:visible;">' + '<svg id="overviewMiniView" width="150" height="100" x="0" ' + 'y="0" viewBox="0 0 4800 3600" ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink">' + '<use x="0" y="0" xlink:href="#svgroot"> </use>' + '</svg>' + '<div id="overview_window_view_box" style="min-width:50px; ' + 'min-height:50px; position:absolute; top:30px; left:30px; ' + 'z-index:5; background-color:rgba(255,0,102,0.3);">' + '</div>' + '</div>' + '</div>' + '</div>';
      $('#sidepanels').append(propsWindowHtml); // Define dynamic animation of the view box.

      var updateViewBox = function updateViewBox() {
        var portHeight = Number.parseFloat($('#workarea').css('height'));
        var portWidth = Number.parseFloat($('#workarea').css('width'));
        var portX = $('#workarea').scrollLeft();
        var portY = $('#workarea').scrollTop();
        var windowWidth = Number.parseFloat($('#svgcanvas').css('width'));
        var windowHeight = Number.parseFloat($('#svgcanvas').css('height'));
        var overviewWidth = $('#overviewMiniView').attr('width');
        var overviewHeight = $('#overviewMiniView').attr('height');
        var viewBoxX = portX / windowWidth * overviewWidth;
        var viewBoxY = portY / windowHeight * overviewHeight;
        var viewBoxWidth = portWidth / windowWidth * overviewWidth;
        var viewBoxHeight = portHeight / windowHeight * overviewHeight;
        $('#overview_window_view_box').css('min-width', viewBoxWidth + 'px');
        $('#overview_window_view_box').css('min-height', viewBoxHeight + 'px');
        $('#overview_window_view_box').css('top', viewBoxY + 'px');
        $('#overview_window_view_box').css('left', viewBoxX + 'px');
      };

      $('#workarea').scroll(function () {
        if (!overviewWindowGlobals.viewBoxDragging) {
          updateViewBox();
        }
      });
      $('#workarea').resize(updateViewBox);
      updateViewBox(); // Compensate for changes in zoom and canvas size.

      var updateViewDimensions = function updateViewDimensions() {
        var viewWidth = $('#svgroot').attr('width');
        var viewHeight = $('#svgroot').attr('height');
        var viewX = 640;
        var viewY = 480;

        if (isIE()) {
          // This has only been tested with Firefox 10 and IE 9 (without chrome frame).
          // I am not sure if if is Firefox or IE that is being non compliant here.
          // Either way the one that is noncompliant may become more compliant later.
          // TAG:HACK
          // TAG:VERSION_DEPENDENT
          // TAG:BROWSER_SNIFFING
          viewX = 0;
          viewY = 0;
        }

        var svgWidthOld = $('#overviewMiniView').attr('width');
        var svgHeightNew = viewHeight / viewWidth * svgWidthOld;
        $('#overviewMiniView').attr('viewBox', viewX + ' ' + viewY + ' ' + viewWidth + ' ' + viewHeight);
        $('#overviewMiniView').attr('height', svgHeightNew);
        updateViewBox();
      };

      updateViewDimensions(); // Set up the overview window as a controller for the view port.

      overviewWindowGlobals.viewBoxDragging = false;

      var updateViewPortFromViewBox = function updateViewPortFromViewBox() {
        var windowWidth = Number.parseFloat($('#svgcanvas').css('width'));
        var windowHeight = Number.parseFloat($('#svgcanvas').css('height'));
        var overviewWidth = $('#overviewMiniView').attr('width');
        var overviewHeight = $('#overviewMiniView').attr('height');
        var viewBoxX = Number.parseFloat($('#overview_window_view_box').css('left'));
        var viewBoxY = Number.parseFloat($('#overview_window_view_box').css('top'));
        var portX = viewBoxX / overviewWidth * windowWidth;
        var portY = viewBoxY / overviewHeight * windowHeight;
        $('#workarea').scrollLeft(portX);
        $('#workarea').scrollTop(portY);
      };

      $('#overview_window_view_box').draggable({
        containment: 'parent',
        drag: updateViewPortFromViewBox,
        start: function start() {
          overviewWindowGlobals.viewBoxDragging = true;
        },
        stop: function stop() {
          overviewWindowGlobals.viewBoxDragging = false;
        }
      });
      $('#overviewMiniView').click(function (evt) {
        // Firefox doesn't support evt.offsetX and evt.offsetY.
        var mouseX = evt.offsetX || evt.originalEvent.layerX;
        var mouseY = evt.offsetY || evt.originalEvent.layerY;
        var overviewWidth = $('#overviewMiniView').attr('width');
        var overviewHeight = $('#overviewMiniView').attr('height');
        var viewBoxWidth = Number.parseFloat($('#overview_window_view_box').css('min-width'));
        var viewBoxHeight = Number.parseFloat($('#overview_window_view_box').css('min-height'));
        var viewBoxX = mouseX - 0.5 * viewBoxWidth;
        var viewBoxY = mouseY - 0.5 * viewBoxHeight; // deal with constraints

        if (viewBoxX < 0) {
          viewBoxX = 0;
        }

        if (viewBoxY < 0) {
          viewBoxY = 0;
        }

        if (viewBoxX + viewBoxWidth > overviewWidth) {
          viewBoxX = overviewWidth - viewBoxWidth;
        }

        if (viewBoxY + viewBoxHeight > overviewHeight) {
          viewBoxY = overviewHeight - viewBoxHeight;
        }

        $('#overview_window_view_box').css('top', viewBoxY + 'px');
        $('#overview_window_view_box').css('left', viewBoxX + 'px');
        updateViewPortFromViewBox();
      });
      return {
        name: 'overview window',
        canvasUpdated: updateViewDimensions,
        workareaResized: updateViewBox
      };
    }
  };

  return extOverview_window;

}());
