;(function() {

  (function($) {
    brite.registerView("UserWeightEaselJSCluster", {
      emptyParent : true,
      parent : ".MainScreen-main"
    }, {
      create : function(data, config) {
        var $html = app.render("tmpl-UserWeightEaselJSCluster");
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
      var baseLineLen = 20;
      var centerX = 500;
      var centerY = 380;
      var baseRad = Math.PI * 2 / data.children.length;
      var container = new createjs.Container();
      
      for(var i = 0; i < data.children.length; i++){
        var cData = data.children[i];
        var weight = cData.weight > 4 ? cData.weight : cData.weight;
        var l = weight * baseLineLen;
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
      circle.graphics.beginRadialGradientFill(["#FCA000","#F8F28A"],[0,1], 0, 0, r, 0, 0, 0).drawCircle(0, 0, r);
      circle.graphics.beginStroke("#FB4100").drawCircle(0, 0, r+1);
      return circle;
    }
    
    function createCenterCircle(){
      var r = 10;
      var circle = new createjs.Shape();
      circle.graphics.beginStroke("#cccccc").drawCircle(0, 0, r+1);
      circle.graphics.beginLinearGradientFill(["#006400","#6DA202"],[0,1], 0, 0, r, 0, 0, 0).drawCircle(0, 0, r);
      return circle;
    }
    
    function createLine(x0, y0, x1, y1){
      var line = new createjs.Shape();
      line.graphics.beginStroke("#cccccc").moveTo(x0,y0).lineTo(x1,y1);
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
      console.log(x1,y1);
      
      function tick(event) {
        var oldContainer = stage.getChildByName(view.currentContainerName);
        var newContainer = stage.getChildByName(view.newContainerName);
        oldContainer.alpha = oldContainer.alpha - 0.05;
        newContainer.alpha = newContainer.alpha + 0.05;
        
        oldContainer.x =  oldContainer.x - (x1 - x0) * 0.05;
        oldContainer.y =  oldContainer.y - (y1 - y0) * 0.05;
        
        newContainer.x =  newContainer.x - (x1 - x0) * 0.05;
        newContainer.y =  newContainer.y - (y1 - y0) * 0.05;
        
        stage.update(event);
        if(oldContainer.alpha <= 0){
          animationEnd.call(view);
          stage.update(event);
        }
      }
      
      function animationEnd(){
        createjs.Ticker.removeEventListener("tick",tick);
        var oldContainer = stage.getChildByName(view.currentContainerName);
        var newContainer = stage.getChildByName(view.newContainerName);
        
        //remove oldContainer
        newContainer.x = 0;
        newContainer.y = 0;
        stage.removeChild(oldContainer);
        newContainer.name = view.currentContainerName;
        newContainer.alpha = 1;
        
      }

      createjs.Ticker.addEventListener("tick", tick);
    }
    


  })(jQuery);
})();
