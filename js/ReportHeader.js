;(function() {

    (function ($) {
        brite.registerView("ReportHeader",  {parent:".MainScreen-header"}, {
            create:function (data, config) {
                var $html = app.render("tmpl-ReportHeader");
               	var $e = $($html);
                return $e;
            },
            postDisplay:function (data, config) {
                var view = this;
                var $e = view.$el;
                
            },
            events:{
            	"btap;.nav li":function(e){
            		var view = this;
            		var $e = view.$el;
            		var $li = $(e.currentTarget);
            		$e.find("li").removeClass("active");
            		$li.addClass("active");
            		var menu = $li.attr("data-nav");
            		if(menu == "UserWeight"){
            		  	brite.display("UserWeight");
            		}if(menu == "UserWeightD3"){
            		  	brite.display("UserWeightD3");
            		}if(menu == "UserWeightD3Cluster"){
            		  	brite.display("UserWeightD3Cluster");
            		}if(menu == "UserWeightEaseljsCluster"){
            		  	brite.display("UserWeightEaseljsCluster");
            		}
            	}
            }
        });
        
    })(jQuery);
})();