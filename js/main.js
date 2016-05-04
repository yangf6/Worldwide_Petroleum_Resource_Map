/* Create a scatter plot of 1960 life expectancy (gdp) versus 2013 life expectancy (life_expectancy).
		The variable "data" is accessible to you, as you read it in from data.js
*/
$(function() {
  // load data and display the map on the canvas with country geometries*/
  d3.json("world-110m.json", function(error, topology) {
    d3.csv("data/Petrodata.csv",function(error, allData) {
      var width = 1000,
      height = 600,
      centered;
      var colorOil = "black";
      var colorGas = "red";
      var color = "purple";
      var currentData = [];
      var country = [];
      var countryData =[];
 
    // projection-settings for mercator    
    var projection = d3.geo.mercator()
        // where to center the map in degrees
       .center([0,50])
        // zoomlevel
        .scale(100)
       // map-rotation
        .rotate([0,0]);
 
      // defines "svg" as data type and "make canvas" command
    var svg = d3.select("body").append("svg")
        .attr("width", width)
       .attr("height", height);
    // defines "path" as return of geographic features
    var path = d3.geo.path()
        .projection(projection);
    // group the svg layers 
    var g = svg.append("g");
      g.selectAll("path")
          .data(topojson.object(topology, topology.objects.countries)
              .geometries)
        .enter()
          .append("path")
          .attr("d", path)
          .on("click", clicked);
          
      //console.log(projection(aa),projection(bb));
    var filterData = function(name){
      if(country.length > 0){
        return countryData.filter(function(d){
          return d.RESINFO == name
        })
      }else{
        return allData.filter(function(d){
          return d.RESINFO == name
        })
      }
    };

    var draw = function(data, delet){
      var map = g.selectAll("circle")
        .data(data);
        map.exit().transition()
            .attr("r", 0)
            .remove();
            document.getElementById("display").innerHTML=" ";
      if(delet == 0){
      map.enter()
        .append("svg:circle")
        .transition()
        .attr("r", 2)
      map
        .attr("cx", function (d) {
                     return projection([d.LONG, d.LAT])[0];
                 })
        .attr("cy", function (d) {
                     return projection([d.LONG, d.LAT])[1];
                 })
        .attr("fill", function(d){
                if(d.RESINFO == "oil"){
                  return colorOil;
                }
                if(d.RESINFO == "gas"){
                  return colorGas;
                }
                if(d.RESINFO == "oil and gas"){
                  return color;
                }
        })
        .style("opacity",0.6)
        .append("svg:title")
         .text(function(d) { return ("Province/Sate: " + d.NAME + " Type: " + d.RESINFO); });
      }
    };
    function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
  }


    //draw(allData)
    $("input").on('change', function() {
      // Get value, determine if which type of resource to show
      var ckBox = [];
      var ckBox = Array.from($("input:checked"));
      var box = [];
      for(i=0; i<ckBox.length; i++){
        box[i] = ckBox[i].value;
      }
      if(box.length == 1){  
        currentData = filterData(box[0]);
        draw(currentData,0);
        document.getElementById("display").innerHTML = 
        "there are " + currentData.length + " of " + box[0];
      }else if(box.length == 2){
        currentData = filterData(box[0]);
        currentData = currentData.concat(filterData(box[1]));
        document.getElementById("display").innerHTML = 
        "there are " + currentData.length + " of " + box;
        draw(currentData,0);
      }else if(box.length == 3){
        currentData = filterData(box[0]);
        currentData = currentData.concat(filterData(box[1]));
        currentData = currentData.concat(filterData(box[2]));
        draw(currentData,0);
        document.getElementById("display").innerHTML = 
        "there are " + currentData.length + " of " + box;
      }else{
        currentData = filterData(box.value);
        draw(currentData,1);
      }
    });
    var countryList = new Set();
    function unpack(rows, key) {
      return rows.map(function(row) { return row[key]; });
    };
    var onLoadCountryName = function(){
      var temp = unpack(allData, 'COUNTRY');
        for(i = 0; i < temp.length; i++){
          if(!countryList.has(temp[i])){
            countryList.add(temp[i]);
          }
        }
      countryList = Array.from(countryList);
      var dropBox = document.getElementById('countryName');
      for(i = 0; i < countryList.length; i++){
        var option = document.createElement("option");
        option.value = countryList[i];
        option.innerHTML = countryList[i];
        dropBox.appendChild(option);
      }
      document.getElementById('countryName').disabled = false;
    }
    onLoadCountryName();
    $('select').on('change',function(){
        country = document.getElementById('countryName').value;
        countryData = allData.filter(function(d){
          return d.COUNTRY == country;
        });
        alert(countryData.length)
        draw(countryData,0)
    })
    }); 
  });    
});