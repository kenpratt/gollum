// ua
$(document).ready(function() {
  
  // ua detection
  if ($.browser.mozilla) {
    $('body').addClass('ff');
  } else if ($.browser.webkit) {
    $('body').addClass('webkit');
  } else if ($.browser.msie) {
    $('body').addClass('ie');
    if ($.browser.version == "7.0") {
      $('body').addClass('ie7');
    } else if ($.browser.version == "8.0") {
      $('body').addClass('ie8');
    }
  }
  
  if ($('#minibutton-new-page').length) {
    $('#minibutton-new-page').removeClass('jaws');
    $('#minibutton-new-page').click(function(e) {
      e.preventDefault();
      $.GollumDialog.init({
                            title: 'Create New Page',
                            fields: [
                              {
                                id:   'name',
                                name: 'Page Name',
                                type: 'text'
                              }
                            ],
                            OK: function( res ) {
                              var n = 'New Page';
                              if ( res['name'] )
                                var n = res['name'];
                              n = encodeURIComponent( n );
                              window.location = '/' + n;
                            }
                          });
    });
  }
  
  if ($('#wiki-wrapper').hasClass('history')) {
    $('#wiki-history td.checkbox input').each(function() {
      $(this).click(highlightChecked);
      if ( $(this).is(':checked') ) {
        nodeSelector.checkNode($(this));
      }
    });

    if ($('.history a.action-compare-revision').length) {
      $('.history a.action-compare-revision').click(function() {
        $("#version-form").submit();
      });
    }
  }
  

  
  if ($('#searchbar a#search-submit').length) {
    $.GollumPlaceholder.add($('#searchbar #search-query'));
    $('#searchbar a#search-submit').click(function(e) {
      e.preventDefault();
      $('#searchbar #search-form')[0].submit();
    });
    $('#searchbar #search-form').submit(function(e) {
      $.GollumPlaceholder.clearAll();
      $(this).unbind('submit');
      $(this).submit();
    });
  }  

  if (typeof(pages) !== "undefined" && $('#jumpbar a#jump-submit').length) {
    $.GollumPlaceholder.add($('#jumpbar #jump-page'));
    var jump = function(toPage) {
      location.href = location.origin + "/" + toPage;
    }
    $("#jumpbar #jump-page").autocomplete({
      source: pages,
      autoFocus: true,
      delay: 0,
      select: function(e, ui) { jump(ui.item.value); }
    });
    $('#jumpbar a#jump-submit').click(function(e) {
      e.preventDefault();
      jump($("#jumpbar #jump-page").val());
    });
    $('#jumpbar #jump-form').submit(function(e) {
      jump($("#jumpbar #jump-page").val());
      return false;
    });
  }

  if ($('#gollum-revert-form').length &&
      $('.gollum-revert-button').length ) {
    $('a.gollum-revert-button').click(function(e) {
      e.preventDefault();
      $('#gollum-revert-form').submit();
    });
  }
  
  // hotkeys

  var addHotkey = function(key, action) {
    $(document).bind("keypress", key, action);
  };

  var focusElem = function(selector) {
    return function(e) {
      e.preventDefault();
      $(selector).focus();
    };
  };

  var redirectTo = function(page) {
    return function(e) {
      e.preventDefault();
      if (page.indexOf("http://") == -1) {
        window.location = window.location.origin + page;
      } else {
        window.location = page;
      }
    };
  };

  // h => redirect to Home
  addHotkey("h", redirectTo("/"));

  // n => redirect to New page
  addHotkey("n", redirectTo("/new"));

  // a => redirect to All pages
  addHotkey("a", redirectTo("/pages"));

  // s => focus search box
  if ($("#search-query").length > 0) {
    addHotkey("s", focusElem("#search-query"));
  }

  // j => focus jump box
  if ($("#jump-page").length > 0) {
    addHotkey("j", focusElem("#jump-page"));
  }

  // v => View page
  if ($(".action-view-page").attr("href")) {
    addHotkey("v", redirectTo($(".action-view-page").attr("href")));
  }

  // e => Edit page
  if ($(".action-edit-page").attr("href")) {
    addHotkey("e", redirectTo($(".action-edit-page").attr("href")));
  }

  // ? => history page
  if ($(".action-page-history").attr("href")) {
    addHotkey("shift+?", redirectTo($(".action-page-history").attr("href")));
  }

  // esc => cancel
  // c => cancel
  if ($(".action-cancel").attr("href")) {
    addHotkey("esc", redirectTo($(".action-cancel").attr("href")));
    addHotkey("c", redirectTo($(".action-cancel").attr("href")));
  }

});

var nodeSelector = {
  
  node1: null,
  node2: null,
  
  selectNodeRange: function( n1, n2 ) {
    if ( nodeSelector.node1 && nodeSelector.node2 ) {
      $('#wiki-history td.selected').removeClass('selected');
      nodeSelector.node1.addClass('selected');
      nodeSelector.node2.addClass('selected');
      
      // swap the nodes around if they went in reverse
      if ( nodeSelector.nodeComesAfter( nodeSelector.node1, 
                                        nodeSelector.node2 ) ) {
        var n = nodeSelector.node1;
        nodeSelector.node1 = nodeSelector.node2;
        nodeSelector.node2 = n;
      }
      
      var s = true;
      var $nextNode = nodeSelector.node1.next();
      while ( $nextNode ) {
        $nextNode.addClass('selected');
        if ( $nextNode[0] == nodeSelector.node2[0] ) {
          break;
        }
        $nextNode = $nextNode.next();
      }
    }
  },
  
  nodeComesAfter: function ( n1, n2 ) {
    var s = false;
    $(n1).prevAll().each(function() {
      if ( $(this)[0] == $(n2)[0] ) {
        s = true;
      }
    });
    return s;
  },
  
  checkNode: function( nodeCheckbox ) {
    var $nodeCheckbox = nodeCheckbox;
    var $node = $(nodeCheckbox).parent().parent();
    // if we're unchecking
     if ( !$nodeCheckbox.is(':checked') ) {
    
       // remove the range, since we're breaking it
       $('#wiki-history tr.selected').each(function() {
         if ( $(this).find('td.checkbox input').is(':checked') ) {
           return;
         }
         $(this).removeClass('selected');
       });
       
       // no longer track this
       if ( $node[0] == nodeSelector.node1[0] ) {
         nodeSelector.node1 = null;
         if ( nodeSelector.node2 ) {
           nodeSelector.node1 = nodeSelector.node2;
           nodeSelector.node2 = null;
         }
       } else if ( $node[0] == nodeSelector.node2[0] ) {
         nodeSelector.node2 = null;
       }
       
     } else {
       if ( !nodeSelector.node1 ) {
         nodeSelector.node1 = $node;
         nodeSelector.node1.addClass('selected');
       } else if ( !nodeSelector.node2 ) {
         // okay, we don't have a node 2 but have a node1
         nodeSelector.node2 = $node;
         nodeSelector.node2.addClass('selected');
         nodeSelector.selectNodeRange( nodeSelector.node1, 
                                       nodeSelector.node2 );
       } else {
         // we have two selected already
         $nodeCheckbox[0].checked = false;
       }
     }
  }
  
};

function highlightOn() {
  $(this).parent().parent().animate({
                                      backgroundColor: '#ffffea',
                                      duration: 400
                                    });
}

function highlightOff() {
  var color = '#ebf2f6';
  if ($(this).parent().parent().hasClass('alt-row')) {
    color = '#f3f7fa';
  }
  $(this).parent().parent().animate({
                                      backgroundColor: color,
                                      duration: 400
                                    });
}

function highlightChecked() {
 nodeSelector.checkNode($(this));
}

function initMathJax() {
  
}
