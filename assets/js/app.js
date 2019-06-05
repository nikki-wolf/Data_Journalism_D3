// SCATTER plot for a multi-axis scatter plot (3 propertie each in X- and Y-axis )
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


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    // if (chosenXAxis === "hair_length") {
    //   var label = "Hair Length:";
    // }
    // else {
    //   var label = "# of Albums:";
    // }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.rockband}<br> ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}
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
    let xList=['poverty','age','income'];
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
    let yList=['obesity','smokes','healthcare'];
    var yAxisLabels=yList.forEach(function(d,i){
        yLabelGroup.append('g').append("text")
            .classed("inactive", true)
            .attr("id",`${d}`)
            .attr("value", `${d}`)
            .attr("transform", "rotate(-90)")
            //.attr("y", 0 - margin.left)
            //.attr("x",0 - (chartHeight / 2))
            // .attr("y",40-i*20)
            // .attr("x",0-chartHeight/2-50)
            .attr("y",20*i)
            .attr("x",50)
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

  
    // function used for updating x-scale var upon click on axis label
    function xScale(xLabel) {
        // create scales
        let x = d3.scaleLinear()
        .domain([d3.min(hraData, d => d[xLabel]) * 0.8,
            d3.max(hraData, d => d[xLabel]) * 1.2
        ])
        .range([0, svgWidth]);
    
        return x;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(yLabel) {
        // create scales
        let y = d3.scaleLinear()
        .domain([0, d3.max(hraData, d => d[yLabel]) * 1.2
        ])
        .range([svgHeight, 0]);
        return y;

    }

    // x and y linear scale functions above csv import
    var xLinearScale = xScale(chosenXAxis);
    var yLinearScale = yScale(chosenYAxis);

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
                    
    // //tooltip
    // var toolTip = d3.tip()
    //     .attr("class", "d3-tip")
    //     .offset([80, -60])
    //     .html(function(d){ 
    //         //return `income= ${d.income}<br>age= ${d.age}<br>poverty=${d.poverty}
    //         //    <br>smoke= ${d.smokes}<br>health care= ${d.healthcare}<br>=${d.poverty}`});
    //         return `income= ${d.income}`});

    
    // chartGroup.call(toolTip);

    // function hMouseOver(d, i) {
    //     d3.select(this)  
    //         .attr("r",stateRadius*2)
    //         .attr("fill", "red")
    //     toolTip.show(d);
    //     console.log(toolTip)

    // }
    // function hMouseOut(d, i) {
    //     d3.select(this)
    //         .attr("r",stateRadius)
    //         .attr("fill", "blue");
    // }

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
    // X-axis labels event listener
    xLabelGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // updates y scales for new data
            xLinearScale = xScale(chosenXAxis);

            // updates X- and Y-axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);

            // updates circles with new x values
            textsGroup = renderTexts(textsGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

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
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;
            console.log(chosenYAxis)
            // updates y scales for new data
            yLinearScale = yScale(chosenYAxis);
            // updates Y-axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);

            // updates texts with new x values
            textsGroup = renderTexts(circlesGroup, xLinearScale, yLinearScale, chosenXAxis,chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

            //changes active class of Y-ids to change bold text
            yList.forEach(function(d,i){
                d3.select(`#${d}`).classed("active",false).classed("inactive",true);
                d3.select(`#${chosenYAxis}`).classed("active",true).classed("inactive",false);
            })

    }
    });


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




// function used for updating X-Axis var upon click on X-axis label
function renderXAxis(newXScale, Axis) {
    let bottomAxis = d3.axisBottom(newXScale);
    
    Axis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return Axis;
  }

// function used for updating Y-Axis var upon click on Y-axis label
function renderYAxis(newYScale, Axis) {
    let leftAxis = d3.axisLeft(newYScale);
    Axis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return Axis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

// function used for updating textgroups inside circles with a transition to new circles
function renderTexts(textsGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    textsGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis])-stateRadius/2)
      .attr("y", d => newYScale(d[chosenYAxis])+stateRadius/4);
    return textsGroup;
  }
