var MarkerClustering=function(a){this.DEFAULT_OPTIONS={map:null,markers:[],disableClickZoom:!0,minClusterSize:2,maxZoom:8,gridSize:100,icons:[],indexGenerator:[10,100,200,500,1e3],stylingFunction:function(){}},this._clusters=[],this._mapRelations=null,this._markerRelations=[],this.setOptions(naver.maps.Util.extend({},this.DEFAULT_OPTIONS,a),!0),this.setMap(a.map||null)};naver.maps.Util.ClassExtend(MarkerClustering,naver.maps.OverlayView,{onAdd:function(){var a=this.getMap();this._mapRelations=naver.maps.Event.addListener(a,"idle",naver.maps.Util.bind(this._onIdle,this)),this.getMarkers().length>0&&(this._createClusters(),this._updateClusters())},draw:naver.maps.Util.noop,onRemove:function(){naver.maps.Event.removeListener(this._mapRelation),this._clearClusters(),this._geoTree=null,this._mapRelation=null},setOptions:function(a){var b=this;if("string"==typeof a){var c=a,d=arguments[1];b.set(c,d)}else{var e=arguments[1];naver.maps.Util.forEach(a,function(a,c){"map"!==c&&b.set(c,a)}),a.map&&!e&&b.setMap(a.map)}},getOptions:function(a){var b=this,c={};return void 0!==a?b.get(a):(naver.maps.Util.forEach(b.DEFAULT_OPTIONS,function(a,d){c[d]=b.get(d)}),c)},getMinClusterSize:function(){return this.getOptions("minClusterSize")},setMinClusterSize:function(a){this.setOptions("minClusterSize",a)},getMaxZoom:function(){return this.getOptions("maxZoom")},setMaxZoom:function(a){this.setOptions("maxZoom",a)},getGridSize:function(){return this.getOptions("gridSize")},setGridSize:function(a){this.setOptions("gridSize",a)},getIndexGenerator:function(){return this.getOptions("indexGenerator")},setIndexGenerator:function(a){this.setOptions("indexGenerator",a)},getMarkers:function(){return this.getOptions("markers")},setMarkers:function(a){this.setOptions("markers",a)},getIcons:function(){return this.getOptions("icons")},setIcons:function(a){this.setOptions("icons",a)},getStylingFunction:function(){return this.getOptions("stylingFunction")},setStylingFunction:function(a){this.setOptions("stylingFunction",a)},getDisableClickZoom:function(){return this.getOptions("disableClickZoom")},setDisableClickZoom:function(a){this.setOptions("disableClickZoom",a)},changed:function(a,b){if(this.getMap())switch(a){case"marker":case"minClusterSize":case"gridSize":this._redraw();break;case"indexGenerator":case"icons":this._clusters.forEach(function(a){a.updateIcon()});break;case"maxZoom":this._clusters.forEach(function(a){a.getCount()>1&&a.checkByZoomAndMinClusterSize()});break;case"stylingFunction":this._clusters.forEach(function(a){a.updateCount()});break;case"disableClickZoom":var c="enableClickZoom";b&&(c="disableClickZoom"),this._clusters.forEach(function(a){a[c]()})}},_createClusters:function(){var a=this.getMap();if(a)for(var b=a.getBounds(),c=this.getMarkers(),d=0,e=c.length;d<e;d++){var f=c[d],g=f.getPosition();if(b.hasLatLng(g)){var h=this._getClosestCluster(g);h.addMarker(f),this._markerRelations.push(naver.maps.Event.addListener(f,"dragend",naver.maps.Util.bind(this._onDragEnd,this)))}}},_updateClusters:function(){for(var a=this._clusters,b=0,c=a.length;b<c;b++)a[b].updateCluster()},_clearClusters:function(){for(var a=this._clusters,b=0,c=a.length;b<c;b++)a[b].destroy();naver.maps.Event.removeListener(this._markerRelations),this._markerRelations=[],this._clusters=[]},_redraw:function(){this._clearClusters(),this._createClusters(),this._updateClusters()},_getClosestCluster:function(a){for(var b=this.getProjection(),c=this._clusters,d=null,e=1/0,f=0,g=c.length;f<g;f++){var h=c[f],i=h.getCenter();if(h.isInBounds(a)){var j=b.getDistance(i,a);j<e&&(e=j,d=h)}}return d||(d=new Cluster(this),this._clusters.push(d)),d},_onIdle:function(){this._redraw()},_onDragEnd:function(){this._redraw()}});var Cluster=function(a){this._clusterCenter=null,this._clusterBounds=null,this._clusterMarker=null,this._relation=null,this._clusterMember=[],this._markerClusterer=a};Cluster.prototype={constructor:Cluster,addMarker:function(a){if(!this._isMember(a)){if(!this._clusterCenter){var b=a.getPosition();this._clusterCenter=b,this._clusterBounds=this._calcBounds(b)}this._clusterMember.push(a)}},destroy:function(){naver.maps.Event.removeListener(this._relation);for(var a=this._clusterMember,b=0,c=a.length;b<c;b++)a[b].setMap(null);this._clusterMarker.setMap(null),this._clusterMarker=null,this._clusterCenter=null,this._clusterBounds=null,this._relation=null,this._clusterMember=[]},getCenter:function(){return this._clusterCenter},getBounds:function(){return this._clusterBounds},getCount:function(){return this._clusterMember.length},isInBounds:function(a){return this._clusterBounds&&this._clusterBounds.hasLatLng(a)},enableClickZoom:function(){if(!this._relation){var a=this._markerClusterer.getMap();this._relation=naver.maps.Event.addListener(this._clusterMarker,"click",function(b){a.morph(b.coord,a.getZoom()+1)})}},disableClickZoom:function(){this._relation&&(naver.maps.Event.removeListener(this._relation),this._relation=null)},updateCluster:function(){this._clusterMarker||(this._clusterMarker=new naver.maps.Marker({position:this._clusterCenter}),this._markerClusterer.getDisableClickZoom()||this.enableClickZoom()),this.updateIcon(),this.updateCount(),this.checkByZoomAndMinClusterSize()},checkByZoomAndMinClusterSize:function(){var a=this._markerClusterer,b=a.getMinClusterSize(),c=a.getMaxZoom(),d=a.getMap().getZoom();this.getCount()<b?this._showMember():(this._hideMember(),c<=d&&this._showMember())},updateCount:function(){var a=this._markerClusterer.getStylingFunction();a&&a(this._clusterMarker,this.getCount())},updateIcon:function(){var a=this.getCount(),b=this._getIndex(a),c=this._markerClusterer.getIcons();b=Math.max(b,0),b=Math.min(b,c.length-1),this._clusterMarker.setIcon(c[b])},_showMember:function(){for(var a=this._markerClusterer.getMap(),b=this._clusterMarker,c=this._clusterMember,d=0,e=c.length;d<e;d++)c[d].setMap(a);b&&b.setMap(null)},_hideMember:function(){for(var a=this._markerClusterer.getMap(),b=this._clusterMarker,c=this._clusterMember,d=0,e=c.length;d<e;d++)c[d].setMap(null);b&&b.setMap(a)},_calcBounds:function(a){var b=this._markerClusterer.getMap(),c=new naver.maps.LatLngBounds(a.clone(),a.clone()),d=b.getBounds(),e=b.getProjection(),f=e.fromCoordToOffset(d.getNE()),g=e.fromCoordToOffset(d.getSW()),h=e.fromCoordToOffset(c.getNE()),i=e.fromCoordToOffset(c.getSW()),j=this._markerClusterer.getGridSize()/2;h.add(j,-j),i.add(-j,j);var k=Math.min(f.x,h.x),l=Math.max(f.y,h.y),m=Math.max(g.x,i.x),n=Math.min(g.y,i.y),o=e.fromOffsetToCoord(new naver.maps.Point(k,l)),p=e.fromOffsetToCoord(new naver.maps.Point(m,n));return new naver.maps.LatLngBounds(p,o)},_getIndex:function(a){var b=this._markerClusterer.getIndexGenerator();if(naver.maps.Util.isFunction(b))return b(a);if(naver.maps.Util.isArray(b)){for(var c=0,d=c,e=b.length;d<e;d++){var f=b[d];if(a<f)break;c++}return c}},_isMember:function(a){return this._clusterMember.indexOf(a)!==-1}};