// SCATTER plot for a multi-axis scatter plot (3 propertie each in X- and Y-axis )
// define SVG area dimensions
var svgWidth = 1400;
var svgHeight = 600;
var svgMovingDisplayWidth=1800;
var svgMovingDisplayHeight=200;

// define the chart's margins as an object
var margin = {
  top: 60,
  topMovingDisplacy: 200,
  right: 60,
  bottom: 160,
  left: 100
};

//radius of plotted circles for each state
const stateRadius=10;

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var xList=['poverty','age','income'];
var yList=['obesity','smokes','healthcare'];

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

var svgTransition = d3.select("#movingDisplay")
  .append("svg")
  .attr("height", svgMovingDisplayHeight)
  .attr("width", svgMovingDisplayWidth)
  .attr("transform", `translate(${0}, ${margin.top})`);

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
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var yLabelGroup = chartGroup.append("g")
        //.attr("transform", `${chartWidth/2+margin.left},${chartHeight+margin.top+i*20})`);
        //.attr("transform", `translate(${chartWidth/2+margin.left},${chartHeight+margin.top})`);
        .attr("transform", `translate(${-20-margin.left/2},${chartHeight/2+2*margin.top})`);
    
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

    var yAxisLabels=yList.forEach(function(d,i){
        yLabelGroup.append('g').append("text")
            .classed("inactive", true)
            .attr("id",`${d}`)
            .attr("value", `${d}`)
            .attr("transform", "rotate(-90)")
            .attr("y",20*i)
            .attr("x",44)
            //.attr("dy", "1em")
            //.style("text-anchor", "middle")
            .text(d);   
    })

    var chosenXAxis='income', chosenYAxis='obesity';
    // initialize X-axis and Y-axis by income and obesity, respectively
    d3.select(`#${chosenXAxis}`).classed("active",true).classed("inactive",false);
    d3.select(`#${chosenYAxis}`).classed("active",true).classed("inactive",false);

    //changning X-axis properties based on selec{ted id
    // d3.select('#tage').on('mouseover',function(){
        
    //     console.log("here")
    //     xAxis='age';
    //     return xAxis;
    // })
    // console.log(xAxis)
    // Create a scale for your independent (x) coordinates

  
    // // function used for updating x-scale var upon click on axis label
    // function xScale(xLabel) {
    //     // create scales
    //     let x = d3.scaleLinear()
    //       .domain([d3.min(hraData, d => d[xLabel]) * 0.8,
    //         d3.max(hraData, d => d[xLabel]) * 1.2
    //     ])
    //     .range([0, svgWidth]);
    
    //     return x;
    // }

    // // function used for updating y-scale var upon click on axis label
    // function yScale(yLabel) {
    //     // create scales
    //     let y = d3.scaleLinear()
    //     .domain([0, d3.max(hraData, d => d[yLabel]) * 1.2
    //     ])
    //     .range([svgHeight, 0]);
    //     // .domain([d3.min(hraData, d => d[yLabel])*0.8, d3.max(hraData, d => d[yLabel]) * 1.2])
    //     // .range([0, svgWidth]);
    //     return y;

    // }
    
    // x and y linear scale functions above csv import
    var xLinearScale = xScale(hraData, chosenXAxis);
    var yLinearScale = yScale(hraData, chosenYAxis);
    //console.log('yLinearScale=',yLinearScale(20))
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append X-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    // append Y-axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // adding circles of scatter plot
    var circlesGroup=chartGroup.selectAll(".scatter")
        .data(hraData)
            .enter()
                .append("circle")
                    //.attr(circAttr)
                    .attr("cx", d => xLinearScale(d[chosenXAxis]))
                    .attr("cy", d => yLinearScale(d[chosenYAxis]))
                    .attr("r", stateRadius)
                    .attr("fill", "blue")
                    //.on("mouseover", hMouseOver)
                    //.on("mouseout", hMouseOut);

    // updateToolTip function for the 1st time with default X- and Y-axis
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //adding text to circles
    var textsGroup=chartGroup.selectAll(".scatter")
       .data(hraData)
           .enter()
                .append("text")
                    .attr("x", d => xLinearScale(d[chosenXAxis])-stateRadius/2)
                    .attr("y", d => yLinearScale(d[chosenYAxis])+stateRadius/4)
                    .attr("fill","black")
                    .text(d=> d.abbr)
                    .attr("font-size","10px")
                    
    // X-axis labels event listener
    xLabelGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        let valueX = d3.select(this).attr("value");
        if (valueX !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = valueX;

            // updates y scales for new data
            xLinearScale = xScale(hraData, chosenXAxis);

            // updates X- and Y-axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);
            console.log('chosenXAxis=',chosenXAxis,'xLinearScale=',xLinearScale(20))

            // updates circles with new x values
            console.log('dataset[chosenXAxis]=',dataset[chosenXAxis])
            circlesGroup = renderCircles(hraData,circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);
          console.log(circlesGroup)
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
          console.log(chosenYAxis)
          // updates y scales for new data
          yLinearScale = yScale(hraData, chosenYAxis);
          yAxis = renderYAxis(yLinearScale, yAxis);
          console.log('chosenYaxis=',chosenYAxis,'yLinearScale=',yLinearScale(20))
          // updates Y-axis with transition
          // updates circles with new Y values
          circlesGroup = renderCircles(hraData,circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          console.log("YYYYYYYYYYYYYYYYYYYYYY")
          // updates texts with new Y values
          textsGroup = renderTexts(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

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
// chartGroup.append("text")
//     .attr("id",`introText`)
//     .attr("x",10)
//     .attr("y",10)
//     .text("Scatter Plot of correlation between Healthcare and Poverty nationwide!")
//     .attr("font-size",'14px')
// setTimeout(function(){
//     d3.select(`#introText`).remove()
// },5000);




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
  console.log("newYscale(20)=",newYScale(20))
  circlesGroup
      .data(hraData)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    console.log(`${chosenXAxis}, ${chosenYAxis}`)
   
    console.log(circlesGroup)
    return circlesGroup;
}

// function used for updating textgroups inside circles with a transition to new circles
function renderTexts(textsGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textsGroup
      .transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis])-stateRadius/2)
      .attr("y", d => newYScale(d[chosenYAxis])+stateRadius/4);
    return textsGroup;
}

//Updating the transition words
// courtesy: Mike Bostock’s Block 3808234
var InitialPhrase= "Plot {Poverty, Age, Income} \n vs. {Obesity, Smokes, HealthCare} among The States".split("");

var svgPattern = svgTransition.append("g").attr("transform", `translate(${margin.left},${svgMovingDisplayHeight/2})`);

function update(svgPattern,data) {
  var t = d3.transition()
      .duration(750)
      .ease(d3.easeLinear);
  // JOIN new data with old elements.
  var text = svgPattern.selectAll("text")
    .data(data, function(d) { return d; })
    .style("font", "44px monospace");

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

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "income") {
    var label = "income";
  }
  else {
    var label = "# of Albums:";
  }
  console.log('label is=',label)
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .style('z-index', '999999999')
    .offset([80, -60])
    .html(function(d){ 
      return (`State=${d.state}<br>Household Income= $ ${d.income} (median)<br>Age= ${d.age} (median)<br>Poverty=${d.poverty}%
            <br>Smoke= ${d.smokes}%<br>Lacks Healthcare= ${d.healthcare}%<br>Smoke=${d.poverty}%`)});
  console.log(toolTip)
  
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

// Initial display.
update(InitialPhrase);

// Interval to update the display Y vs. X
d3.interval(function() {
  let a=Math.floor(Math.random()*xList.length);
  let worda=`${yList[a]} vs. ${xList[a]}`;
  // let slicea=worda.slice(0, Math.floor(Math.random() * worda.length));
  // let shufflea=worda.shuffle();
  // let shuffleSort=shufflea.split("").sort().join("");
  update(worda)
}, 1000);

// String.prototype.shuffle = function () {
//     var a = this.split(""),
//         n = a.length;

//     for(var i = n - 1; i > 0; i--) {
//         var j = Math.floor(Math.random() * (i + 1));
//         var tmp = a[i];
//         a[i] = a[j];
//         a[j] = tmp;
//     }
//     return a.join("");
// }
