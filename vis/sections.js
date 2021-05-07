let data_network, data_appearance, data_twitter, data_revenue, data_screen_time, data_frequency
let followerSizeScale, followerXScale, categoryColorScale
let simulation, nodes
let categoryLegend, salaryLegend

const margin = {left: 170, top: 50, bottom: 50, right: 20}
const width = 1000 - margin.left - margin.right
const height = 950 - margin.top - margin.bottom

// Read all data

d3.csv('data/network.csv', function(data){
    return {
        hero_1: data.hero1,
        hero_2: data.hero2
    };
}).then(data => {
    data_network = data
    console.log(data_network)
})

d3.csv('data/revenue.csv', function(data){
    return {
        title: data.Title,
        gross: data.Gross,
        budget: data.Budget
    };
}).then(data => {
    data_revenue = data
    console.log(data_revenue)
})

d3.csv('data/twitter.csv', function(data){
    return {
        character: data.character,
        alter_ego: data.alter_ego,
        actor: data.actor,
        first_appearance_month: data.first_appearance_month,
        first_appearance_year: data.first_appearance_year,
        first_appearance_movie: data.first_appearance_movie,
        twitter_handle: data.twitter_handle,
        followers: data.followers,
    };
}).then(data => {
    data_twitter = data
    followerSizeScale = d3.scaleLinear(d3.extent(data_twitter, d => d.followers / 100 + 10), [5,35])
    followerXScale = d3.scaleLinear(d3.extent(data_twitter, d => d.followers / 100 + 10), [margin.left, margin.left + width+250])
    setTimeout(drawBubbles(), 100)
    console.log(data_twitter)
})

d3.csv('data/appearance.csv', function(data){
    return {
        character: data.Character,
        movies: data.Movies,
        year: data.Year
    };
}).then(data => {
    data_appearance = data
    console.log(data_appearance)
})

d3.csv('data/frequency.csv', function(data){
    return {
        character: data.character,
        freq: data.freq
    };
}).then(data => {
    data_frequency = data
})

d3.csv('data/screen_time.csv', function(data){
    return {
        character: data.hero,
        screen_time: data.total_screen_time
    };
}).then(data => {
    data_screen_time = data
    console.log(data_screen_time)
})

// All the initial elements should be create in the drawInitial function
// As they are required, their attributes can be modified
// They can be shown or hidden using their 'opacity' attribute
// Each element should also have an associated class name for easy reference

function drawBubbles(){
    clean('isFirst')

    let svg = d3.select("#vis")
        .append('svg')
        .attr('width', 1000)
        .attr('height', 950)
        .attr('opacity', 1)

    simulation = d3.forceSimulation(data_twitter)

    // Define each tick of simulation
    simulation.on('tick', () => {
        nodes
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    })

    // Selection of all the circles 
    nodes = svg
        .selectAll('circle')
        .data(data_twitter)
        .enter()
        .append('circle')
            .attr('cx', (d, i) => followerXScale(d.followers / 100 + 10) + 5)
            .attr('cy', (d, i) => i * 5.2 + 30)

    // Add mouseover and mouseout events for all circles
    // Changes opacity and adds border
    svg.selectAll('circle')
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r', (d, i) => d.followers / 50 + 10)
        .attr('fill', hasTwitter)
        .attr('opacity', 0.8)

    function mouseOver(d, i){

        d3.select(this)
            .transition('mouseover').duration(100)
            .attr('opacity', 1)
            .attr('stroke-width', 5)
            .attr('stroke', 'black')
            
        d3.select('#tooltip')
            .style('left', (d3.event.pageX + 10)+ 'px')
            .style('top', (d3.event.pageY - 25) + 'px')
            .style('display', 'inline-block')
            .html(`<strong>Character:</strong> ${d.character} 
                <br> <strong>Movie Appearances:</strong> ${d.followers}`)
    }
    
    function mouseOut(d, i){
        d3.select('#tooltip')
            .style('display', 'none')

        d3.select(this)
            .transition('mouseout').duration(100)
            .attr('opacity', 0.8)
            .attr('stroke-width', 0)
    }

    //Stop simulation
    simulation.stop()

    simulation  
        .force('charge', d3.forceManyBody().strength([5]))
        .force('forceX', d3.forceX(400))
        .force('forceY', d3.forceY(350))
        .force('collide', d3.forceCollide(d => followerSizeScale(d.followers/50) + 20))
        .alphaDecay([0.02])

    //Reheat simulation and restart
    simulation.alpha(0.9).restart()
}

//Cleaning Function
//Will hide all the elements which are not necessary for a given chart type 

function clean(chartType){
    let svg = d3.select('#vis').select('svg')
    if (chartType !== "isScatter") {
        svg.select('.scatter-x').transition().attr('opacity', 0)
        svg.select('.scatter-y').transition().attr('opacity', 0)
        svg.select('.best-fit').transition().duration(200).attr('opacity', 0)
    }
    if (chartType !== "isMultiples"){
        svg.selectAll('.lab-text').transition().attr('opacity', 0)
            .attr('x', 1800)
        svg.selectAll('.cat-rect').transition().attr('opacity', 0)
            .attr('x', 1800)
    }
    if (chartType !== "isFirst"){
        svg.select('.first-axis').transition().attr('opacity', 0)
        svg.selectAll('.small-text').transition().attr('opacity', 0)
            .attr('x', -200)
    }
    if (chartType !== "isHist"){
        svg.selectAll('.hist-axis').transition().attr('opacity', 0)
    }
    if (chartType !== "isBubble"){
        svg.select('.enrolment-axis').transition().attr('opacity', 0)
    }
}

function hasTwitter(d, i){
    if (d.followers > 0) {
        return '#ffcc00';
    } else {
        return '#808080';
    }
}

function draw2(){
    //Stop simulation
    simulation.stop()

    let svg = d3.select("#vis").select('svg')
    
    clean('none')

    svg.selectAll('circle')
        .transition().duration(300).delay((d, i) => i * 5)
        .attr('r', (d, i) => d.followers / 50 + 10)
        .attr('fill', hasTwitter)
        .attr('opacity', 0.8)

    simulation  
        .force('charge', d3.forceManyBody().strength([5]))
        .force('forceX', d3.forceX(400))
        .force('forceY', d3.forceY(350))
        .force('collide', d3.forceCollide(d => followerSizeScale(d.followers/50) + 20))
        .alphaDecay([0.02])

    //Reheat simulation and restart
    simulation.alpha(0.9).restart()
}

function draw1(){
    //Stop simulation
    simulation.stop()
    
    let svg = d3.select("#vis")
                    .select('svg')
                    .attr('width', 1000)
                    .attr('height', 950)
    
    clean('isFirst')

    d3.select('.categoryLegend').transition().remove()

    svg.select('.first-axis')
        .attr('opacity', 1)
    
    svg.selectAll('circle')
        .transition().duration(500).delay(100)
        .attr('fill', 'black')
        .attr('r', 3)
        .attr('cx', (d, i) => followerXScale(d.followers / 100)+15)
        .attr('cy', (d, i) => i * 5.2 + 30)

    svg.selectAll('.small-text').transition()
        .attr('opacity', 1)
        .attr('x', margin.left)
        .attr('y', (d, i) => i * 5.2 + 30)
}

//Array of all the graph functions
//Will be called from the scroller functionality

let activationFunctions = [
    draw1,
    draw2,
    draw1,
    draw2,
    draw1
]

//All the scrolling function
//Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function(index){
    d3.selectAll('.step')
        .transition().duration(500)
        .style('opacity', function (d, i) {return i === index ? 1 : 0.1;});
    
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1; 
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})