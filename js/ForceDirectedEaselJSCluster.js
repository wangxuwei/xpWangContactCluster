;(function() {

  (function($) {
    var contactDao = brite.dao("Contact");
    var _colors = ["#2ca02c","#ff7f0e","#aec7e8","#1f77b4","#ff9896","#9467bd"];
    brite.registerView("ForceDirectedEaselJSCluster", {
      emptyParent : true,
      parent : ".MainScreen-main",
      loadTmpl: false
    }, {
      create : function(data, config) {
        var html = '<div class="ForceDirectedEaselJSCluster">'+
                   '<canvas id="userWeightCanvas" ></canvas>'+
                   '</div>';
        var $e = $(html);
        return html;
      },
      postDisplay : function(data, config) {
        var view = this;
        var $e = view.$el;
        var $canvas = $e.find("#userWeightCanvas");
        $canvas[0].width = $e.parent().width();
        $canvas[0].height = $e.parent().height();

        showView.call(view);
      }

    });

    function showView() {
      var view = this;
      var $e = view.$el;
      view.nodes = [];
      view.circles = {};
      view.linesNodes = {};
      //{"cx,cy",[relatedNode]}
      view.relatedNodes = {};
      view.lines = {};
      view.baseNodeName = null;
      view.originXY = {};
      var stage = new createjs.Stage("userWeightCanvas");
      view.stage = stage;
      view.LEVEL = 1;
      var container = view.container = new createjs.Container();
      stage.addChild(container);
      
      showFriendByNode.call(view,null,0).done(function(){
        
        for(var i = 0; i < view.nodes.length; i++){
          var node = view.nodes[i];
          //draw line
          for(var j = i-1; j >= 0; j--){
            var node1 = view.nodes[j];
            var line = createLine.call(view,node.x,node.y,node1.x,node1.y);
            container.addChild(line);
            view.linesNodes[node.name+","+node1.name]=line;
            
            var relatedNodes = view.relatedNodes[node.name];
            var relatedNodes1 = view.relatedNodes[node1.name];
            var lines = view.lines[node.name];
            var lines1 = view.lines[node1.name];
            if(!relatedNodes){
              relatedNodes = [];
              view.relatedNodes[node.name] = relatedNodes;
            }
            if(!relatedNodes1){
              relatedNodes1 = [];
              view.relatedNodes[node1.name] = relatedNodes1;
            }
            if(!lines){
              lines = [];
              view.lines[node.name] = lines;
            }
            if(!lines1){
              lines1 = [];
              view.lines[node1.name] = lines1;
            }
            relatedNodes.push(node1);
            relatedNodes1.push(node);
            lines.push(line);
            lines1.push(line);
          }
          
        }
        
        for(var i = 0; i < view.nodes.length; i++){
          var node = view.nodes[i];
          
          //draw nodes
          var c = createNodeCircle.call(view,node.name);
          c.x = node.x;
          c.y = node.y;
          container.addChild(c);
          view.originXY[node.name] = {x:c.x,y:c.y};
          view.circles[node.name] = c;
          
          c.addEventListener("mousedown",function(evt){
            var target = evt.target;
            var ox = target.x;
            var oy = target.y;
            var relatedNodes = view.relatedNodes[target.name];
            var lines = view.lines[target.name];
            var offset = {x:target.x-evt.stageX, y:target.y-evt.stageY};
            evt.addEventListener("mousemove",function(ev) {
              var offsetX = ev.stageX - target.x + offset.x;
              var offsetY = ev.stageY - target.y + offset.y;
              
              target.x = ev.stageX+offset.x;
              target.y = ev.stageY+offset.y;
              
              forceNode.call(view,target.name,offsetX,offsetY);
              drawLine.call(view);
              
              stage.update();
            });
            
            evt.addEventListener("mouseup",function(ev) {
              requestAnimationFrame(function(){
                
                var fx = view.circles[view.baseNodeName].x - view.originXY[view.baseNodeName].x;
                var fy = view.circles[view.baseNodeName].y - view.originXY[view.baseNodeName].y;
                for(var i = 0; i < view.nodes.length; i++){
                  if(view.baseNodeName != view.nodes[i].name){
                    var cir = view.circles[view.nodes[i].name];
                    var nx = cir.x;
                    var ny = cir.y;
                    cir.x = view.originXY[view.nodes[i].name].x + fx;
                    cir.y = view.originXY[view.nodes[i].name].y + fy;
                    doSpring.call(view,cir,cir.x,cir.y,nx,ny);
                  }
                }
                doSpring.call(view,target,ox,oy,ev.stageX,ev.stageY);
                
              });
              
            });
            
          });
          
        }
        
        stage.update();
      });
      
      
    }
    
    function showFriendByNode(data,level,x,y){
      var view = this;
      var stage = view.stage;
      var weightPerLength = 15;
      var baseLineLen = 40;
      var centerX = 500;
      var centerY = 380;
      if(typeof x != 'undefined'){
        centerX = x;
      }
      if(typeof y != 'undefined'){
        centerY = y;
      }
      var container = stage;
      level++;
      var dataDfd = $.Deferred();
      var returnDfd = $.Deferred();
      if(data){
        dataDfd.resolve(data);
      }else{
        contactDao.getByName().done(function(ret){
          ret.x = centerX;
          ret.y = centerY;
          view.nodes.push(ret);
          dataDfd.resolve(ret);
        });
      }
      
      dataDfd.done(function(dataSource){
        var baseRad = Math.PI * 2 / dataSource.children.length;
        app.util.serialResolve(dataSource.children,function(item,i){
          
          var cData = dataSource.children[i];
          view.nodes.push(cData);
          var weight = cData.weight > 4 ? cData.weight : cData.weight;
          var l = weight * weightPerLength + baseLineLen;
          var cx = centerX + l * Math.sin(baseRad * i);
          var cy = centerY + l * Math.cos(baseRad * i);
          cData.x = cx;
          cData.y = cy;
          if(!isExist.call(view,cData)){
            view.nodes.push(cData);
          }
          
          var dfd = $.Deferred();
          if(level >= view.LEVEL){
            dfd.resolve();
          }else{
            contactDao.getByName(cData.name).done(function(newData){
              showFriendByNode.call(view,newData,level,cx,cy).done(function(){
                dfd.resolve();
              });
            });
          }
          
          return dfd.promise();
        });
        
      }).done(function(){
        returnDfd.resolve();
      });
      
      return returnDfd.promise();
    }
    
    function createNodeCircle(name){
      var r = 4;
      var circle = new createjs.Shape();
      var index = Math.floor(Math.random() * 5);
      circle.graphics.beginFill(_colors[index]).drawCircle(0, 0, r);
      circle.graphics.beginStroke("#cccccc").drawCircle(0, 0, r+1);
      circle.name = name;
      return circle;
    }
    
    function createLine(x0, y0, x1, y1){
      var line = new createjs.Shape();
      line.name = new Date() * 1 + "";
      line.graphics.beginStroke("#c6c6c6").moveTo(x0,y0).lineTo(x1,y1);
      return line;
    }
    
    function isExist(node){
      var  view = this;
      for(var i = 0; i < view.nodes.length; i++){
        if(view.nodes[i].id == node.id){
          return true;
        }
      }
      return false;
    }
    
    function doSpring(target,x0,y0,x1,y1,ang,length){
      var view = this;
      var stage = view.stage;
      var sin_a = (y1-y0) / Math.sqrt(Math.pow((x1-x0),2) + Math.pow((y1-y0),2));
      var cos_a = (x1-x0) / Math.sqrt(Math.pow((x1-x0),2) + Math.pow((y1-y0),2));
      var a = (y0-y1) / (x0-x1);
      var b = y0 - (a * x0);
      var maxLength = Math.sqrt(Math.pow((x1-x0),2) + Math.pow((y1-y0),2));
      if(maxLength > 130){
        maxLength = 100;
      }
      
      if(typeof length == 'undefined'){
        length = maxLength;
      }
      if(typeof ang == 'undefined'){
        ang = 0;
      }
      
      var a = 10;
      var l = 1;
      ang = ang - a;
      length = length - l;
      
      var ratio = Math.sin(ang * Math.PI / 180);
      
      var y = length * sin_a * ratio + y0;
      var x = length * cos_a * ratio + x0;
      target.x = x;
      target.y = y;
      
      var relatedNodes = view.relatedNodes[target.name];
      var lines = view.lines[target.name];
      for (var i = 0; i < relatedNodes.length; i++) {
        var node = relatedNodes[i];
        var circle = view.circles[node.name];
        var line = lines[i];
        line.graphics.clear().beginStroke("#c6c6c6").moveTo(circle.x, circle.y).lineTo(x, y);
      }

      
      stage.update();
      
      if(length > 0){
        requestAnimationFrame(function(){
          doSpring.call(view,target,x0,y0,x1,y1,ang,length);
        });
      }else{
        target.x = x0;
        target.y = y0;
        stage.update();
      }
      
    }
    
    function forceNode(nodeName,fx, fy,useNodesName){
      var view = this;
      var reduce = 0.7;
      if(typeof useNodesName == 'undefined'){
        useNodesName = [];
      }
      fx = reduce * fx;
      fy = reduce * fy;
      var relatedNodes = view.relatedNodes[nodeName];
      for (var i = 0; i < relatedNodes.length; i++) {
        var rnode = relatedNodes[i];
        if($.inArray(rnode.name,useNodesName) == -1){
          useNodesName.push(rnode.name);
          
          //get Basic Node
          if(useNodesName.length == view.nodes.length - 1){
            view.baseNodeName = rnode.name;
          }
          
          var circle = view.circles[rnode.name];
          circle.x = circle.x + fx;
          circle.y = circle.y + fy;
          forceNode.call(view,rnode.name,fx,fy,useNodesName);
        }
      }
    }
    
    
    function drawLine() {
      var view = this;
      for (var k in view.linesNodes) {
        var nodes = k.split(",");
        var line = view.linesNodes[k];
        var cs = view.circles[nodes[0]];
        var ce = view.circles[nodes[1]];
        line.graphics.clear().beginStroke("#c6c6c6").moveTo(cs.x, cs.y).lineTo(ce.x, ce.y);
      }
    }


  })(jQuery);
})();
