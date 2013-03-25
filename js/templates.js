Handlebars.templates = Handlebars.templates || {};


// template --- tmpl-MainScreen ---
Handlebars.templates['tmpl-MainScreen'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"MainScreen\">\n	    <div class=\"MainScreen-header\">\n	    </div>\n	    <div class=\"MainScreen-main\">\n	    </div>\n    </div>";}
);

// template --- tmpl-ReportHeader ---
Handlebars.templates['tmpl-ReportHeader'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"ReportHeader\">\n		<div class=\"navbar  navbar-inverse navbar-fixed-top\">\n		  <div class=\"navbar-inner\">\n		    <a class=\"brand\" href=\"#\">D3JS Demo</a>\n		    <ul class=\"nav\">\n		      <li data-nav=\"UserWeightD3Cluster\" class=\"menu active\">ContactCluster D3JS</li>\n		      <li data-nav=\"UserWeightEaselJSCluster\" class=\"menu\">ContactCluster EaselJS</li>\n		    </ul>\n		  </div>\n		</div>\n	</div>";}
);

// template --- tmpl-UserWeightD3Cluster ---
Handlebars.templates['tmpl-UserWeightD3Cluster'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"UserWeightD3Cluster\">\n		<div class=\"UserWeightD3ClusterContainer\"></div>\n	</div>";}
);

// template --- tmpl-UserWeightEaselJSCluster ---
Handlebars.templates['tmpl-UserWeightEaselJSCluster'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<div class=\"UserWeightEaselJSCluster\">\n		<div class=\"UserWeightEaselJSClusterContainer\">\n		  <canvas id=\"userWeightCanvas\" width=\"1000\" height=\"1000\"></canvas>\n		</div>\n	</div>";}
);
