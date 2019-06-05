// SCATTER plot for each state 
// define SVG area dimensions
var svgWidth = 1400;
var svgHeight = 600;

// define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 160,
  left: 100
};

//radius of plotted circles for each state
const stateRadius=10;



// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//read csv file and store it to an array of objects
var dataset=d3.csv("./assets/data/data.csv")
dataset.then(function(hraData) {
    // Throw an error if one occurs
    //if (error) throw error;

    // Format and cast numeric columns (as string in imported csv file) to a number
    hraData.forEach(function(data) {
      //data.state = parseTime(data.date);
      data.poverty=+data.poverty;
      data.smokes = +data.smokes;
      data.healthcare= +data.healthcare;
      data.age= +data.age;
      data.obesity= +data.obesity;
      data.income= +data.income;
    });
    //6 different parameters (3 in X-axis and 3 in Y-axis)
    // chartGroup.append("text")
    // .attr("id",`tPoverty`)
    // .attr("x",10)
    // .attr("y",10)
    // .text("Scatter Plot of correlation between Healthcare and Poverty nationwide!")
    // .attr("font-size",'14px')

    //X-axis labels 
    var xAxisLabels=['poverty','age','income'].forEach(function(d,i){
        chartGroup.append("text")
        .attr("value",`t${d}`)           
        .attr("transform",
                `translate(${chartWidth/2+margin.left},${chartHeight+margin.top+i*20})`) 
                .style("text-anchor", "middle")
        .text(d);
    })

    //Y-axis labels
    var yAxisLabels=['obesity','somkes','healthcare'].forEach(function(d,i){
        svg.append("text")
            .attr("id",`t${d}`) 
            .attr("transform", "rotate(-90)")
            //.attr("y", 0 - margin.left)
            //.attr("x",0 - (chartHeight / 2))
            .attr("y",40-i*20)
            .attr("x",0-chartHeight/2-50)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(d);   
    })
    var xAxis='income', yAxis;
    //changning X-axis properties based on selec{ted id
    d3.select('#tage').on('mouseover',function(){
        
        console.log("here")
        // chartGroup.append("text")
        // .attr("x",50)
        // .attr("y",50)
        // .text("HELLLLLLLLLLLLLLLLO")
        // .attr("font-size",'14px')
        xAxis='age';
        return xAxis;
    })
    console.log(xAxis)
    // Create a scale for your independent (x) coordinates
    // var xAxis='poverty', yAxis='healthcare';
    //var xAxis='age', yAxis='smokes';
    yAxis='smokes';
    var xScale = d3.scaleLinear()
    .domain(d3.extent(hraData, d => d[xAxis]))
    .range([0, svgWidth]);

    // Create a scale for your dependent (y) coordinates
    var yScale = d3.scaleLinear()
    .domain(d3.extent(hraData, d => d[yAxis]))
    .range([svgHeight, 0]);
    console.log(svgHeight)
    //define attributes of plotted circles
    var circAttr={
        //class: "bar",
        cx: function(d) { return xScale(d[xAxis]); }  ,
        cy: function(d) { return yScale(d[yAxis]); }  ,
        r: stateRadius,
        "fill": "blue"
    }
    
    //define attributes of text in each circle
    var textAttr={
        x: d => xScale(d[xAxis])-stateRadius/2,
        y: d => yScale(d[yAxis])+stateRadius/4,
        fill: "red",
        text: d=>d.abbr,
        "font-size": "10px"
    }
    //console.log(textAttr)

    // Create two new functions passing the scales in as arguments
    // These will be used to create the chart's axes
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    // Append two SVG group elements to the chartGroup area,
    // and create the bottom and left axes inside of them
    chartGroup.append("g")
    //.attr("transform", `translate(0, 0)`)
    .call(leftAxis);

    chartGroup.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    //.attr("transform", 'translate(0,500)')
    .call(bottomAxis);

    // Create one SVG rectangle per piece of tvData
    // Use the linear and band scales to position each rectangle within the chart

    chartGroup.selectAll(".scatter")
        .data(hraData)
        .enter()
            .append("circle")
            //.attr(circAttr)
            .attr("cx", d => xScale(d[xAxis]))
            .attr("cy", d => yScale(d[yAxis]))
            .attr("r", stateRadius)
            .attr("fill", "blue")
            .on("mouseover", hMouseOver)
            .on("mouseout", hMouseOut);

    //adding text to circles
   chartGroup.selectAll(".scatter")
       .data(hraData)
           .enter()
                .append("text")
                    .attr("x", d => xScale(d[xAxis])-stateRadius/2)
                    .attr("y", d => yScale(d[yAxis])+stateRadius/4)
                    .attr("fill","white")
                    .text(d=> d.abbr)
                    .attr("font-size","10px")
                    
    function hMouseOver(d, i) {
        d3.select(this)  
            .attr("r",stateRadius*2)
            .attr("fill", "red")

        chartGroup.append("text")
            .attr("id", `t${d[xAxis]}-${d[yAxis]}-${i}`) //assign an ID to be removed on MouseOut
            .attr("x", function() { return xScale(d[xAxis])-stateRadius; })
            .attr("y", function() { return yScale(d[yAxis])-stateRadius*2 })
            .text([`P=${d[xAxis]}`, `H=${d[yAxis]}`]) 
            .attr('fill','red')
    }
    function hMouseOut(d, i) {
        d3.select(this)
            .attr("r",stateRadius)
            .attr("fill", "blue");
        var textID=`t${d[xAxis]}-${d[yAxis]}-${i}`;
        //d3.select(textID).remove()
        var element=document.getElementById(textID)
        element.parentNode.removeChild(element)
    }

})
chartGroup.append("text")
    .attr("id",`introText`)
    .attr("x",10)
    .attr("y",10)
    .text("Scatter Plot of correlation between Healthcare and Poverty nationwide!")
    .attr("font-size",'14px')
setTimeout(function(){
    d3.select(`#introText`).remove()
},5000);




