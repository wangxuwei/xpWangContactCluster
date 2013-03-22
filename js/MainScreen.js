;(function() {
	
    (function ($) {
        brite.registerView("MainScreen",  {}, {
            create:function (data, config) {
                var $html = app.render("tmpl-MainScreen");
                var $e = $($html);
                return $e;
            },
            postDisplay:function (data, config) {
                var view = this;
                var $e = view.$el;
                brite.display("ReportHeader");
                brite.display("UserWeightD3Cluster");
            },
            events:{
            }
            
        });
    })(jQuery);


})();
