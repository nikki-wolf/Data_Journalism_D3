// SCATTER plot for a multi-axis scatter plot (3 propertie each in X- and Y-axis )
// define SVG area dimensions
var svgWidth = 1000;
var svgHeight = 600;
var svgMovingDisplayWidth=310;
var svgMovingDisplayHeight=200;

// define the chart's margins as an object
var margin = {
  top: 160,
  topMovingDisplacy: 40,
  right: 60,
  bottom: 200,
  left: 100,
  ymove:-200
};

//radius of plotted circles for each state
const stateRadius=10;

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var xList=['poverty','age','income'];
var yList=['obesity','smokes','healthcare'];

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

var svgTransition1 = d3.select("#movingDisplay1")
  .append("svg")
  .attr("height", svgMovingDisplayHeight)
  .attr("width", svgMovingDisplayWidth)
  .attr("transform", `translate(${0}, ${margin.topMovingDisplacy})`);

var svgTransition2 = d3.select("#movingDisplay2")
  .append("svg")
  .attr("height", svgMovingDisplayHeight)
  .attr("width", svgMovingDisplayWidth)
  .attr("transform", `translate(${0}, ${margin.topMovingDisplacy})`);

// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//read csv file and store it to an array of objects
var dataset=d3.csv("./assets/data/data.csv")
dataset.then(function(hraData) {

    // Format and cast numeric columns (as string in imported csv file) to a number
    hraData.forEach(function(data) {
      //data.state = parseTime(data.date);
      data.poverty=parseFloat(data.poverty);
      data.smokes = parseFloat(data.smokes);
      data.healthcare= parseFloat(data.healthcare);
      data.age= parseInt(data.age);
      data.obesity= parseFloat(data.obesity);
      data.income= parseFloat(data.income);
    });

    //group for 3/3 X-axis/Y-axis labels
    var xLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top/2})`);

    var yLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${-20-margin.left/2},${chartHeight/2+margin.top/2})`);
    
    //X-axis labels 
    var xAxisLabels=xList.forEach(function(d,i){
        xLabelGroup.append('g').append("text")
        .classed("inactive", true)
        .attr("value", `${d}`)
        .attr("id",`${d}`)
        .attr("transform", "rotate(0)")    
        .attr("y",100-i*20)       
        .style("text-anchor", "middle")
        .text(d);
    })

    //Y-axis labels 
    var yAxisLabels=yList.forEach(function(d,i){
        yLabelGroup.append('g').append("text")
            .classed("inactive", true)
            .attr("id",`${d}`)
            .attr("value", `${d}`)
            .attr("transform", "rotate(-90)")
            .attr("y",20*i)
            .attr("x",44)
            .text(d);   
    })

    // initialize X-axis and Y-axis by income and obesity, respectively
    var chosenXAxis='income';
    var chosenYAxis='obesity';
    d3.select(`#${chosenXAxis}`).classed("active",true).classed("inactive",false);
    d3.select(`#${chosenYAxis}`).classed("active",true).classed("inactive",false);

    
    // x and y linear scale functions above csv import
    var xLinearScale = xScale(hraData, chosenXAxis);
    var yLinearScale = yScale(hraData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append X-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight+100})`)
        .call(bottomAxis);
    
    // append Y-axis
    var yAxis = chartGroup.append("g")
       .classed("y-axis", true)
       .attr("transform", `translate(0, ${margin.ymove})`)
       .call(leftAxis);

    // adding circles of scatter plot
    var circlesGroup=chartGroup.selectAll(".scatter")
        .data(hraData)
            .enter()
                .append("circle")
                    //.attr(circAttr)
                    .attr("cx", d => xLinearScale(d[chosenXAxis]))
                    .attr("cy", d => yLinearScale(d[chosenYAxis])+margin.ymove)
                    .attr("r", stateRadius)
                    .attr("fill", "blue")

    // updateToolTip function for the 1st time with default X- and Y-axis
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //adding text to circles
    var textsGroup=chartGroup.selectAll(".scatter")
       .data(hraData)
           .enter()
                .append("text")
                    .attr("x", d => xLinearScale(d[chosenXAxis])-stateRadius/2)
                    .attr("y", d => yLinearScale(d[chosenYAxis])+stateRadius/8+margin.ymove)
                    .attr("fill","black")
                    .text(d=> d.abbr)
                    .attr("font-size","10px")
                    .attr("fill","white")

                    
    // X-axis labels event listener
    xLabelGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        let valueX = d3.select(this).attr("value");
        if (valueX !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = valueX;

            // updates x scales for new data
            xLinearScale = xScale(hraData, chosenXAxis);

            // updates X-axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(hraData,circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);

            // updates circles with new x values
            textsGroup = renderTexts(textsGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);

            //changes active class of Y-ids to change bold text
            xList.forEach(function(d,i){
                d3.select(`#${d}`).classed("active",false).classed("inactive",true);
                d3.select(`#${chosenXAxis}`).classed("active",true).classed("inactive",false);
            })
        }
      });

    // Y-axis labels event listener
    yLabelGroup.selectAll("text")
      .on("click", function() {
      // get value of selection
      let valueY = d3.select(this).attr("value");
      if (valueY !== chosenYAxis) {

          // replaces chosenXAxis with value
          chosenYAxis = valueY;

          // updates y scales for new data
          yLinearScale = yScale(hraData, chosenYAxis);

          // updates Y-axis with transition
          yAxis = renderYAxis(yLinearScale, yAxis);

          // updates circles with new Y values
          circlesGroup = renderCircles(hraData,circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates texts with new Y values
          textsGroup = renderTexts(textsGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          //changes active class of Y-ids to change bold text
          yList.forEach(function(d,i){
              d3.select(`#${d}`).classed("active",false).classed("inactive",true);
              d3.select(`#${chosenYAxis}`).classed("active",true).classed("inactive",false);
          })

      }
    });
})

// function used for updating X-Axis var upon click on X-axis label
function renderXAxis(newXScale, Axis) {
    let bottomAxis = d3.axisBottom(newXScale);  
    Axis.transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .call(bottomAxis); 
    return Axis;
}

// function used for updating Y-Axis var upon click on Y-axis label
function renderYAxis(newYScale, Axis) {
    let leftAxis = d3.axisLeft(newYScale);
    Axis.transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .call(leftAxis);
    return Axis;
}

// function used for updating x-scale var upon click on axis label
function xScale(hraData,xLabel) {
  // create scales
  let x = d3.scaleLinear()
    .domain([d3.min(hraData, d => d[xLabel]) * 0.8,
      d3.max(hraData, d => d[xLabel]) * 1.2
  ])
  .range([0, svgWidth]);

  return x;
}

// function used for updating y-scale var upon click on axis label
function yScale(hraData,yLabel) {
  // create scales
  let y = d3.scaleLinear()
  .domain([0, d3.max(hraData, d => d[yLabel]) * 1.2
  ])
  .range([svgHeight, 0]);
  // .domain([d3.min(hraData, d => d[yLabel])*0.8, d3.max(hraData, d => d[yLabel]) * 1.2])
  // .range([0, svgWidth]);
  return y;

}

// function used for updating circles group with a transition to new circles
function renderCircles(hraData, circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup
      //.data(hraData)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis])+margin.ymove);
    return circlesGroup;
}

// function used for updating textgroups inside circles with a transition to new circles
 function renderTexts(textsGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textsGroup
      .transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis])-stateRadius/2)
      .attr("y", d => newYScale(d[chosenYAxis])+stateRadius/8+margin.ymove);
     return textsGroup;
 }

//Updating the transition words
// courtesy: Mike Bostock’s Block 3808234

var g1 = svgTransition1.append("g").attr("transform", `translate(0,${svgMovingDisplayHeight/2})`);
var g2 = svgTransition2.append("g").attr("transform", `translate(0,${svgMovingDisplayHeight/2})`);

function update(data,grp) {
  var t = d3.transition()
      .duration(750)
      .ease(d3.easeLinear);
  // JOIN new data with old elements.
  var text = grp.selectAll("text")
    .data(data, function(d) { return d; })

  // EXIT old elements not present in new data.
  text.exit()
      .attr("class", "exit")
    .transition(t)
      .attr("y", 60)
      .style("fill-opacity", 1e-6)
      .remove();

  // UPDATE old elements present in new data.
  text.attr("class", "update")
      .attr("y", 0)
      .style("fill-opacity", 1)
    .transition(t)
      .attr("x", function(d, i) { return i * 32; });

  // ENTER new elements present in new data.
  text.enter().append("text")
      .style("font", "44px monospace")
      .style("text-align","left")
      .attr("class", "enter")
      .attr("dy", ".35em")
      .attr("y", -60)
      .attr("x", function(d, i) { return i * 32; })
      .style("fill-opacity", 1e-6)
      .text(function(d) { return d; })
      .transition(t)
      .attr("y", 0)
      .style("fill-opacity", 1);
}

// Interval to update the display X
d3.interval(function() {
  let a=Math.floor(Math.random()*xList.length);
  let worda=`${xList[a]}`;
  update(worda,g1)
}, 1000);

// Interval to update the display Y 
d3.interval(function() {
  let a=Math.floor(Math.random()*xList.length);
  let worda=`${yList[a]}`;
  update(worda,g2)
}, 1000);

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "income") {
    var label = "income";
  }
  else {
    var label = "# of Albums:";
  }
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style('z-index', '999999999')
    .offset([80, -60])
    .html(function(d){ 
      return (`${d.state}<br>Household Income= $ ${d.income} (median)<br>Age= ${d.age} (median)<br>Poverty=${d.poverty}%
            <br>Smoke= ${d.smokes}%<br>Lacks Healthcare= ${d.healthcare}%<br>Obesity=${d.obesity}%`)});
  
  circlesGroup.call(toolTip);

  circlesGroup  
    //on mouse over event
    .on("mouseover", function(data) {
      d3.select(this)  
        .attr("r",stateRadius*2)
        .attr("fill", "red")

      toolTip.show(data);
 
      
    })
    //on mouse out event
    .on("mouseout", function(data, index) {
      d3.select(this)
        .attr("r",stateRadius)
        .attr("fill", "blue");

      toolTip.hide(data);
    });

  return circlesGroup;
}
