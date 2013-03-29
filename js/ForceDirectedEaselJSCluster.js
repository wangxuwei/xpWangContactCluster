;(function() {

  (function($) {
    var contactDao = brite.dao("Contact");
    
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
      //{"cx,cy",[lines]}
      view.lines = {};
      view.olines = {};
      var stage = new createjs.Stage("userWeightCanvas");
      view.stage = stage;
      view.LEVEL = 1;
      
      showFriendByNode.call(view,null,0).done(function(){
        
        for(var i = 0; i < view.nodes.length; i++){
          var node = view.nodes[i];
          //draw line
          for(var j = i-1; j >= 0; j--){
            var node1 = view.nodes[j];
            var line = createLine.call(view,node.x,node.y,node1.x,node1.y);
            
            stage.addChild(line);
            
            var lines = view.lines[node.x+","+node.y];
            var lines1 = view.lines[node1.x+","+node1.y];
            var olines = view.olines[node.x+","+node.y];
            var olines1 = view.olines[node1.x+","+node1.y];
            if(!lines){
              lines = [];
              view.lines[node.x+","+node.y] = lines;
            }
            if(!lines1){
              lines1 = [];
              view.lines[node1.x+","+node1.y] = lines1;
            }
            if(!olines){
              olines = [];
              view.olines[node.x+","+node.y] = olines;
            }
            if(!olines1){
              olines1 = [];
              view.olines[node1.x+","+node1.y] = olines1;
            }
            lines.push({x:node1.x,y:node1.y});
            lines1.push({x:node.x,y:node.y});
            olines.push(line);
            olines1.push(line);
          }
          
        }
        
        for(var i = 0; i < view.nodes.length; i++){
          var node = view.nodes[i];
          
          //draw nodes
          var c = createNodeCircle.call(view);
          c.x = node.x;
          c.y = node.y;
          stage.addChild(c);
          
          c.addEventListener("mousedown",function(evt){
            var target = evt.target;
            var ox = target.x;
            var oy = target.y;
            var lines = view.lines[ox+","+oy];
            var olines = view.olines[ox+","+oy];
            var offset = {x:target.x-evt.stageX, y:target.y-evt.stageY};
            evt.addEventListener("mousemove",function(ev) {
              target.x = ev.stageX+offset.x;
              target.y = ev.stageY+offset.y;
              
              for(var i = 0; i < lines.length; i++){
                var node = lines[i];
                var line = olines[i];
                line.graphics.clear().beginStroke("#585858").moveTo(node.x,node.y).lineTo(target.x,target.y);
              }
              
              stage.update();
            });
            
            evt.addEventListener("mouseup",function(ev) {
              createjs.Tween.get(target).to({
                x : ox,
                y : oy
              }, 1000, createjs.Ease.cubicInOut).addEventListener('change', function(ce) {
                console.log(ce);
                if(!ce){
                  return ;
                }
                var tar = ce.target.target;
                for (var i = 0; i < lines.length; i++) {
                  var node = lines[i];
                  var line = olines[i];
                  line.graphics.clear().beginStroke("#585858").moveTo(node.x, node.y).lineTo(tar.x, tar.y);
                }
                stage.update();
              }).call(function() {
                createjs.Ticker.addEventListener("tick", stage);
              });

              stage.update();
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
      circle.graphics.beginFill("#5ca818").drawCircle(0, 0, r);
      circle.graphics.beginStroke("#cccccc").drawCircle(0, 0, r+1);
      circle.graphics
      return circle;
    }
    
    function createLine(x0, y0, x1, y1){
      var line = new createjs.Shape();
      line.graphics.beginStroke("#585858").moveTo(x0,y0).lineTo(x1,y1);
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

  })(jQuery);
})();