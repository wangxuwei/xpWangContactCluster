;(function() {

  (function($) {
    brite.registerView("UserWeightEaselJSCluster", {
      emptyParent : true,
      parent : ".MainScreen-main",
      loadTmpl: false
    }, {
      create : function(data, config) {
        var html = '<div class="UserWeightEaselJSCluster">'+
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

        var dataSet = app.createDataSet(30);
        var chartData = app.transformData(dataSet);
        view.dataSet = dataSet;
        showView.call(view, chartData);
      }

    });

    function showView(data, $newDataView, offset) {
      var view = this;
      var $e = view.$el;
      
      
      var stage = new createjs.Stage("userWeightCanvas");
      view.stage = stage;
      view.currentContainerName = "currentContainer";
      view.newContainerName = "newContainer";
      view.cName = "centerCircle";
      
      var container = createContainer.call(view,data);
      container.name = view.currentContainerName;
      stage.addChild(container);
      stage.update();
    }
    
    function createContainer(data){
      var view = this;
      var stage = view.stage;
      var weightPerLength = 20;
      var baseLineLen = 80;
      var centerX = 500;
      var centerY = 380;
      var baseRad = Math.PI * 2 / data.children.length;
      var container = new createjs.Container();
      
      for(var i = 0; i < data.children.length; i++){
        var cData = data.children[i];
        var weight = cData.weight > 4 ? cData.weight : cData.weight;
        var l = weight * weightPerLength + baseLineLen;
        var cx = centerX + l * Math.sin(baseRad * i);
        var cy = centerY + l * Math.cos(baseRad * i);
        
        var line = createLine.call(view,centerX,centerY,cx,cy);
        container.addChild(line);
        var c = createNodeCircle.call(view);
        c.name = cData.name;
        c.x = cx;
        c.y = cy;
        container.addChild(c);
        c.addEventListener("click",function(e){
          var circleNode = e.target;
          changeCenterCircle.call(view,circleNode);
        });
      }
      
      var centerCircle = createCenterCircle.call(view);
      centerCircle.name = view.cName;
      centerCircle.x = centerX;
      centerCircle.y = centerY;
      container.addChild(centerCircle);
      
      return container;
    }
    
    function createNodeCircle(){
      var r = 7;
      var circle = new createjs.Shape();
      circle.graphics.beginFill("#d9eefe").drawCircle(0, 0, r);
      circle.graphics.beginStroke("#979ca3").drawCircle(0, 0, r+1);
      return circle;
    }
    
    function createCenterCircle(){
      var r = 7;
      var circle = new createjs.Shape();
      circle.graphics.beginStroke("#a4998e").drawCircle(0, 0, r+1);
      circle.graphics.beginFill("#ffe9c2").drawCircle(0, 0, r);
      return circle;
    }
    
    function createLine(x0, y0, x1, y1){
      var line = new createjs.Shape();
      line.graphics.beginStroke("#dddddd").moveTo(x0,y0).lineTo(x1,y1);
      return line;
    }

    
    function changeCenterCircle(circleNode) {
      var view = this;
      var stage = view.stage;
      var oldContainer = stage.getChildByName(view.currentContainerName);
      var view = this;
      var newCircle = createCenterCircle.call(view);
      newCircle.x = circleNode.x;
      newCircle.y = circleNode.y;
      oldContainer.removeChild(circleNode);
      oldContainer.addChild(newCircle);

      var oldCenterCircle = oldContainer.getChildByName(view.cName);
      var newCenterCircle = createNodeCircle.call(view);
      newCenterCircle.x = oldCenterCircle.x;
      newCenterCircle.y = oldCenterCircle.y;
      newCenterCircle.name = view.cName;
      oldContainer.removeChild(oldCenterCircle);
      oldContainer.addChild(newCenterCircle);
      
      var centerX = newCenterCircle.x;
      var centerY = newCenterCircle.y;

      //create new Container
      var newData = app.transformData(view.dataSet, circleNode.name);
      var newContainer = createContainer.call(view, newData);
      newContainer.name = view.newContainerName;
      newContainer.x = circleNode.x - centerX;
      newContainer.y = circleNode.y - centerY;
      newContainer.alpha = 0;
      stage.addChild(newContainer);

      stage.update();
      
      
      var x0 = centerX;
      var y0 = centerY;
      var x1 = newCircle.x;
      var y1 = newCircle.y;
      
      var time = 800;
      oldContainer.alpha = 1;
      var ox = oldContainer.x - (x1 - x0);
      var oy = oldContainer.y - (y1 - y0);
      createjs.Tween.get(oldContainer).to({alpha : 0, x : ox, y : oy }, time,createjs.Ease.quartInOut); 
      
      createjs.Tween.get(newContainer).to({alpha : 1, x : 0, y : 0}, time,createjs.Ease.quartInOut).call(function() {
          animationEnd.call(view);
      }); 

      createjs.Ticker.addEventListener("tick", stage);
    }

    function animationEnd() {
      var view = this;
      var stage = view.stage;
      createjs.Ticker.removeEventListener("tick", view.stage);
      var oldContainer = stage.getChildByName(view.currentContainerName);
      var newContainer = stage.getChildByName(view.newContainerName);

      //remove oldContainer
      newContainer.x = 0;
      newContainer.y = 0;
      stage.removeChild(oldContainer);
      newContainer.name = view.currentContainerName;
      newContainer.alpha = 1;
      
      stage.update();

    }


  })(jQuery);
})();
