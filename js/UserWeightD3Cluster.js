;(function() {

  (function($) {
    brite.registerView("UserWeightD3Cluster", {
      emptyParent : true,
      parent : ".MainScreen-main"
    }, {
      create : function(data, config) {
        var $html = app.render("tmpl-UserWeightD3Cluster");
        var $e = $($html);
        return $e;
      },
      postDisplay : function(data, config) {
        var view = this;
        var $e = view.$el;

        var dataSet = app.createDataSet(30);
        var chartData = app.transformData(dataSet);
        view.dataSet = dataSet;

        showView.call(view, chartData);
      }

    });

    function showView(data, $newDataView, offset) {
      var view = this;
      var $e = view.$el;
      view.curData = data;

      var $container = $e.find(".UserWeightD3ClusterContainer");
      if ($newDataView) {
        $newDataView.appendTo($container);
      } else {
        $newDataView = $("<div class='dataView current'></div>").appendTo($container);
      }

      if (offset) {
        $newDataView.css("opacity", .1);
        $newDataView.css("transform", "translate(" + offset.x + "px," + offset.y + "px)");
        setTimeout(function() {
          $newDataView.addClass("transition-medium");
          $newDataView.css("opacity", 1);
          $newDataView.css("transform", "");
          $newDataView.on("btransitionend",function(){
            $newDataView.css("transition", "");
          });
        }, 10);
      }

      var w = 1000, h = 800, rx = w / 2, ry = h / 2, m0, rotate = 0;

      var radialGradients = [{
        id : "radialGradientNodes",
        endColor : "#FCA000",
        startColor : "#F8F28A",
        r : 8
      }, {
        id : "radialGradientOrigin",
        endColor : "#006400",
        startColor : "#6DA202",
        r : 12
      }];

      var cluster = d3.layout.cluster().size([360, ry - 120]).sort(function(a, b) {
        return d3.ascending(a.weight, b.weight);
      });

      var svg = d3.select(".dataView.current").append("div").style("width", w + "px").style("height", w + "px");

      var vis = svg.append("svg:svg").attr("width", w).attr("height", w).append("svg:g").attr("transform", "translate(" + rx + "," + ry + ")");

      var defs = vis.append("defs");

      var radialGradient = defs.selectAll("radialGradient").data(radialGradients).enter().append("radialGradient").attr("id", function(d) {
        return d.id
      }).attr("r", "70%").attr("cx", "50%").attr("cy", "50%").attr("rx", "50%").attr("ry", "50%");

      radialGradient.append("stop").attr("offset", "0%").style("stop-color", function(d) {
        return d.startColor
      }).style("stop-opacity", "1");
      radialGradient.append("stop").attr("offset", "100%").style("stop-color", function(d) {
        return d.endColor
      }).style("stop-opacity", "1");

      var nodes = cluster.nodes(data);

      var link = vis.selectAll("g.link").data(nodes).enter().append("svg:g").attr("class", "link").append("line").attr("x1", function(d) {
        return 0;
      }).attr("y1", function(d) {
        return 0;
      }).attr("x2", function(d) {
        return xs(nodes[0]);
      }).attr("y2", function(d) {
        return ys(nodes[0]);
      });

      vis.selectAll(".dot").data(nodes).enter().append("circle").attr("class", function(d) {
        return (d.depth == 0) ? "origin" : "nodes";
      }).attr("cx", function(d) {
        return 0;
      }).attr("cy", function(d) {
        return 0;
      }).attr("r", function(d) {
        return (d.depth == 0) ? 12 : 8;
      }).attr("style", function(d) {
        return (d.depth == 0) ? "fill:url(#radialGradientOrigin)" : "fill:url(#radialGradientNodes)";
      }).on("click", function(d){
        click.call(this,d,view,$newDataView,nodes);
      });

      vis.selectAll("circle").append("title").text(function(d) {
        return "Weight: " + d.weight;
      });

      vis.selectAll("g.link").select("line").attr("x1", function(d) {
        return xs(d);
      }).attr("y1", function(d) {
        return ys(d);
      });

      vis.selectAll("circle").attr("cx", function(d) {
        return xs(d);
      }).attr("cy", function(d) {
        return ys(d);
      });

      var node = vis.selectAll("g.node").data(nodes).enter().append("g").attr("class", "node").attr("transform", function(d) {
        return "rotate(" + (d.x - 90) + ")translate(" + getNodeTranslate(d) + ")";
      }).append("svg:text").attr("dx", function(d) {
        return d.x < 180 ? 12 : -18;
      }).attr("dy", ".31em").attr("text-anchor", function(d) {
        return d.x < 180 ? "start" : "end";
      }).attr("transform", function(d) {
        return d.x < 180 ? null : "rotate(180)";
      }).text(function(d) {
        return d.name;
      });

    }

    function xs(d) {
      return (d.depth > 0 ? (d.y - 150 + ((10 - d.weight) * 10)) : d.y) * Math.cos((d.x - 90) / 180 * Math.PI);
    }

    function ys(d) {
      return (d.depth > 0 ? (d.y - 150 + ((10 - d.weight) * 10)) : d.y) * Math.sin((d.x - 90) / 180 * Math.PI);
    }

    function getNodeTranslate(d) {
      var translate = (d.depth > 0 ? (d.y - 150 + ((10 - d.weight) * 10)) : d.y);
      return translate;
    }

    function click(d,view,$currentDataView,nodes) {
      var userName = d.name;
      var vis = d3.select(".dataView.current svg");
      $currentDataView.removeClass("current");
      $currentDataView.addClass("old");

      var thisCircle = d3.select(this);
      var cxVal = thisCircle.attr("cx");
      var cyVal = thisCircle.attr("cy");
      var originNode = vis.select("circle.origin");
      var cxOrigin = originNode.attr("cx");
      var cyOrigin = originNode.attr("cy");
      var offsetX = cxVal - cxOrigin;
      var offsetY = cyVal - cyOrigin;
      if(offsetX.toFixed){
        offsetX = 1 * offsetX.toFixed(9);
      }
      if(offsetY.toFixed){
        offsetY = 1 * offsetY.toFixed(9);
      }

      if (view.curData.name != userName) {
        var parentName = d.parent.name;
        var userData = app.transformData(view.dataSet, userName);

        originNode.attr("class", "nodes").attr("style", "fill:url(#radialGradientNodes)").attr("r", 8);
        thisCircle.attr("class", "origin").attr("style", "fill:url(#radialGradientOrigin)").attr("r", 12);

        $currentDataView.css("opacity", 1);
        $currentDataView.css("transform", "translate(0px,0px)");
        setTimeout(function() {
          $currentDataView.addClass("transition-medium");
          $currentDataView.css("opacity", .1);
          $currentDataView.css("transform", "translate(" + (-1*offsetX) + "px," + (-1*offsetY) + "px)");
          $currentDataView.on('btransitionend',function(){
            $currentDataView.remove();
          });
        }, 10);

        var $newDataView = $("<div class='dataView current'></div>");
        showView.call(view, userData, $newDataView , {
          x : offsetX,
          y : offsetY
        });
      }
    }

  })(jQuery);
})();
