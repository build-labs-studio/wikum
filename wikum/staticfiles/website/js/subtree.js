var timer = null;
var isClick = true;
var isClick2 = true;
var isMouseDown = false;
var hover_timer = null;
var highlighted_text = null;
var highlighted_comm = null;
var highlight_text = null;

var margin = {top: 30, right: 20, bottom: 30, left: 20},
    width = 550 - margin.left - margin.right,
    barHeight = 30;

var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 16]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("#viz").append("svg")
    .attr("width", width + margin.left + margin.right)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


svg.append('svg:rect')
  .attr('width',  width + margin.left + margin.right) // the whole width of g/svg
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('click', function() {
  	clearTimeout(cancelClick);
  	if (isClick) {
  		if (!(d3.event.ctrlKey || d3.event.metaKey)) {
	  		d3.selectAll( '.clicked').classed( "clicked", false);
	  		highlight_all();
	  		show_text(nodes_all[0]);
	  	}
  	} else {
  		show_text('clicked');
  	}

  	isClick = true;
  })
  .on('mousedown', function() {
  		isMouseDown = true;
		
  		cancelClick = setTimeout(is_click, 250);
   		var p = d3.mouse( this);

	    svg.append( "rect")
	    .attr({
	        rx      : 6,
	        ry      : 6,
	        class   : "selection",
	        x       : p[0],
	        y       : p[1],
	        width   : 0,
	        height  : 0
	    })
	    .on("mousemove", function() {
	    	var s = svg.select("rect.selection");
	    	var p = d3.mouse(this),
            d = {
                x       : parseInt( s.attr( "x"), 10),
                y       : parseInt( s.attr( "y"), 10),
                width   : parseInt( s.attr( "width"), 10),
                height  : parseInt( s.attr( "height"), 10)
            },
            move = {
                x : p[0] - d.x,
                y : p[1] - d.y
            }
	        ;

	        if( move.x < 1 || (move.x*2<d.width)) {
	            d.x = p[0];
	            d.width -= move.x;
	        } else {
	            d.width = move.x;
	        }

	        if( move.y < 1 || (move.y*2<d.height)) {
	            d.y = p[1];
	            d.height -= move.y;
	        } else {
	            d.height = move.y;
	        }

	        s.attr( d);

	    })
	    .on("mouseup", function() {
	    	isMouseDown = false;

	       // remove selection frame
	    	svg.selectAll( "rect.selection").remove();
	    	
	    	if (!(d3.event.ctrlKey || d3.event.metaKey)) {
		  		d3.selectAll( '.clicked').classed( "clicked", false);
		  		highlight_all();
		  		show_text(nodes_all[0]);
		  	}
		 
	    });
  })
  .on( "mousemove", function() {
    var s = svg.select( "rect.selection");

    if( !s.empty()) {
        var p = d3.mouse(this),
            d = {
                x       : parseInt( s.attr( "x"), 10),
                y       : parseInt( s.attr( "y"), 10),
                width   : parseInt( s.attr( "width"), 10),
                height  : parseInt( s.attr( "height"), 10)
            },
            move = {
                x : p[0] - d.x,
                y : p[1] - d.y
            }
        ;

        if( move.x < 1 || (move.x*2<d.width)) {
            d.x = p[0];
            d.width -= move.x;
        } else {
            d.width = move.x;
        }

        if( move.y < 1 || (move.y*2<d.height)) {
            d.y = p[1];
            d.height -= move.y;
        } else {
            d.height = move.y;
        }

        s.attr( d);

		if (!(d3.event.ctrlKey || d3.event.metaKey)) {
			// deselect all temporary selected state objects
			d3.selectAll( '.clicked').classed( "clicked", false);
	        unhighlight_all();
	     }
	
	        d3.selectAll( 'path').each( function(state_data, i) {
	        	if (this.className.baseVal.indexOf('ghostCircle') == -1) {
		            if(
		                !d3.select( this).classed( "selected") &&
		                    // inner circle inside selection frame
		                state_data.x>=d.y && state_data.x<=d.y+d.height &&
		                state_data.y>=d.x && state_data.y<=d.x+d.width
		            ) {
		            	if (!state_data.article) {
							d3.select(this)
							.style("stroke","#000000")
							.style("stroke-width", stroke_width)
							.attr("class", "clicked");
						}
		            }
		        }
	        });
	   

        }
        })
	.on( "mouseup", function() {
		isMouseDown = false;

	       // remove selection frame
	    svg.selectAll( "rect.selection").remove();
	    

	});

var nodes_all = null;

var article_url = $('#article_url').text();
article_url = article_url.replace('#','%23');

var sort = getParameterByName('sort');
if (!sort) {
	if (article_url.indexOf('wikipedia.org') !== -1) {
		sort = "id";
	} else {
		sort = "likes";
	}
}
var next = parseInt(getParameterByName('next'));
if (!next) {
	next = 0;
}

var num = parseInt(getParameterByName('num'));
if (!num) {
	num = 0;
}

var comment_id = parseInt(getParameterByName('comment_id'));
if (!comment_id) {
	comment_id = '';
}

var filter = getParameterByName('filter');
if (!filter) {
	filter = '';
}

var colorby = getParameterByName('colorby');
if (!colorby) {
	colorby = 'summarized';
}



var owner = getParameterByName('owner');

  make_stats();
  
  make_color();
  
  make_dropdown();
  
    make_filter();

  make_highlight();
  
  var article_id = $("#article_id").text();
  
  $('#menu-view').children().eq(1).css({'background-color': '#42dca3'});
  $('#menu-view').children().eq(1).addClass('disabled-menu');
  
  $('#menu-view').children().eq(1).children().first().on('click', function() {
	    return false;
	});

 $('#menu-view').children().eq(0).children().first().attr('href', `/visualization_flags?id=${article_id}&owner=${owner}`);
 $('#menu-view').children().eq(1).children().first().attr('href', `/subtree?id=${article_id}&owner=${owner}`);
 $('#menu-view').children().eq(2).children().first().attr('href', `/cluster?id=${article_id}&owner=${owner}`);
 $('#menu-view').children().eq(3).children().first().attr('href', `/history?id=${article_id}&owner=${owner}`);
	   $('#menu-view').children().eq(4).children().first().attr('href', article_id);

 make_username_typeahead();

d3.json('/subtree_data?id=' + article_id + '&sort=' + sort + '&next=' + next + '&owner=' + owner + '&comment_id=' + comment_id, function(error, flare) {
  if (error) throw error;

  if (!flare.no_subtree) {
	  flare.x0 = 100;
	  flare.y0 = 100;

	  nodes_all = tree.nodes(flare);

	  update(root = flare);

	  d = nodes_all[1];
	  while (d.parent_node) {
	  	d = d.children[0];
	  }

	  if (comment_id && d.replace_node) {
		if (!d.children) {
			d.children = [];
		}
		for (var i=0; i<d.replace.length; i++) {
			d.children.push(d.replace[i]);
		}
		d.replace = [];
		update(d);
	  }

	  show_text(d);

	  make_progress_bar();
	  
	  var next_sub = next + 1;
	  var url = "/subtree?id=" + article_id + '&num=' + num + '&owner=' + owner + '&sort=' + sort + '&colorby=' + colorby  + '&next=';
	  var text = '<a class="btn btn-xs btn-primary" href="' +url + next_sub + '">Get another subtree &gt;&gt;</a>';
	  $('#paginate').html(text);

  } else {
  	$('#box').text('There are no more subtrees to summarize!');
  }


});

function make_dropdown() {

	var sort_num = 0;
	if (sort == "likes") {
		sort_num = 1;
	} else if (sort == "replies") {
		sort_num = 2;
	} else if (sort == "long") {
		sort_num = 3;
	} else if (sort == "short") {
		sort_num = 4;
	} else if (sort == "newest") {
		sort_num = 5;
	} else if (sort == "oldest") {
		sort_num = 6;
	}
	
  $('#menu-sort').children().eq(sort_num).css({'background-color': '#42dca3'});
  $('#menu-sort').children().eq(sort_num).addClass('disabled-menu');
  
  $('#menu-sort').children().eq(sort_num).children().first().on('click', function() {
	    return false;
	});
	
  var url = "/subtree?id=" + article_id + '&owner=' + owner + '&colorby=' + colorby  + '&sort=';
  $('#menu-sort').children().eq(0).children().first().attr('href', String(url + 'id'));
  $('#menu-sort').children().eq(1).children().first().attr('href', String(url + 'likes'));
  $('#menu-sort').children().eq(2).children().first().attr('href', String(url + 'replies'));
  $('#menu-sort').children().eq(3).children().first().attr('href', String(url + 'long'));
  $('#menu-sort').children().eq(4).children().first().attr('href', String(url + 'short'));
  $('#menu-sort').children().eq(5).children().first().attr('href', String(url + 'newest'));
  $('#menu-sort').children().eq(6).children().first().attr('href', String(url + 'oldest'));
  
}

function make_color() {
	var color_val = 0;
	if (colorby == "user") {
		 color_val = 1;
	}
	
	$('#menu-color').children().eq(color_val).css({'background-color': '#42dca3'});
		 $('#menu-color').children().eq(color_val).addClass('disabled-menu');

  		$('#menu-color').children().eq(color_val).children().first().on('click', function() {
	    	return false;
		});
	
	$('#menu-color').children().eq(0).children().first().attr('href', 
		`/subtree?id=${article_id}&owner=${owner}&sort=${sort}&filter=${filter}&colorby=summarized`);
 
 	$('#menu-color').children().eq(1).children().first().attr('href', 
		`/subtree?id=${article_id}&owner=${owner}&sort=${sort}&filter=${filter}&colorby=user`);

}
