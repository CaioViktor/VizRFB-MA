 // const  path_estabelecimentos = path_data+"estabelecimenos_min.csv";
const  path_empresas = path_data+"empresas.csv";


const  path_brazil_emp = path_data+"maranhao_pop.json";

const width = 800
const height = 600

let margin = {top: 40, right: 40, bottom: 40, left: 40};


var w = window.innerWidth;
var h = window.innerHeight;

var dim_municipios_emp = null;
var group_municipios_emp = null;
var previous_this_map_emp = null;

var colh = h/2;
var colw = (33/100) * w;

var colorScale_mapa_emp = null;
var city_name_mapa_emp = new Map();
var city_population_emp = new Map();
var previous_filter_emp = null;

// var tabela = new dc.DataTable("#tabelaempresa");
// var chartQ8 = new dc.ScatterPlot("#Q8");
var chartQ7 = new dc.PieChart("#Q7");

var runDimension7, runGroup, runDimensionQ8, speedSumGroup;



// var ofs = 0, pag = 100;

function renderMap_emp(data,maps){
	const svg = d3.select("#Q12").append("svg");


	const scaleValue = 4.5 * (colw*colh)*650/(633.6*474.5);
	// const scaleValue = 291.7808219178083;
	// const scaleValue = 600;

	

	var projection =  d3.geoMercator()
					  // .scale(scaleValue)
					  // .center([center0, center1]);
					  .scale(scaleValue)
					  .center([-45, -5.7])
					//   .center([0,0])
  					  .translate([colw / 2, colh / 2]);

	path = d3.geoPath().projection(projection);

	// let path = d3.geoPath()


	svg.attr("width",colw)
		.attr("height",colh);
	svg.append("g")
	  .attr("class", "states")
	.selectAll("path")
	  .data(data.features)
	.enter().append("path")
	  .attr("fill",function(d){
			if(maps[1].has(d.properties.id_rfb))
				return colorScale_mapa_emp(maps[1].get(d.properties.id_rfb));
			else
				return "white";
		})
	  .attr("d", path)
	  .attr("element_id",d=>d.properties.id_rfb)
	  .on("click",function(d){
	  		d3.select(this) // seleciona o elemento atual
			    .attr("stroke-width", 3)
			    .attr("stroke","red");
	  		let clicked_state = this.getAttribute("element_id");
	  		if(clicked_state==previous_filter_emp){
	  			d3.select(this) // seleciona o elemento atual
				    .attr("stroke-width", 0)
	    			.attr("stroke","none"); //volta ao valor padrão
	  			clicked_state = null;
	  			// previous_this_map_emp = null;
	  		}else{
	  			let previous_this_map_emp = $("[element_id="+previous_filter_emp+"]")[0];
	  			d3.select(previous_this_map_emp) // seleciona o elemento atual
			    .attr("stroke-width", 0)
	    		.attr("stroke","none"); //volta ao valor padrão
	  		}
	  		dim_municipios_emp.filterExact(clicked_state);
	  		dc.renderAll();
	  		previous_filter_emp = clicked_state;
	  		// previous_this_map_emp = this;
	  })
	  .on("mouseover", function(d){
	    d3.select(this) // seleciona o elemento atual
	    .style("cursor", "pointer") //muda o mouse para mãozinha
	    .attr("stroke-width", 3)
	    .attr("stroke","#FFF5B1");
	    
	    const rect = this.getBoundingClientRect();
	    showTooltip_emp(maps,this.getAttribute("element_id"), rect.x, rect.y);
	  })
	.on("mouseout", function(d){

	    d3.select(this)
	    .style("cursor", "default")
	    .attr("stroke-width", 1)
	    .attr("stroke","white"); //volta ao valor padrão
	    if(previous_filter_emp != null){
	    	let previous_this_map_emp = $("[element_id="+previous_filter_emp+"]")[0];
			d3.select(previous_this_map_emp) // seleciona o elemento atual
			    .attr("stroke-width", 3)
			    .attr("stroke","red");
		}
	    hideTooltip_emp(maps);
	});

	svg.append("path")
	  .datum(topojson.mesh(data, data.features, function(a, b) { return a !== b; }))
	  .attr("class", "states")
	  .attr("d", path)
	d3.select("#tooltip_emp").remove()
	  let node = d3.select("body")
	      .append("div")
	      .attr("id","tooltip_emp")
	      .attr("class","hidden")
	      .append("p")
	      .html("<h4 id='name_county'></h4>Quantidade de empresas: <span id='qtd'></span><br/>População: <span id='pop'></span><br/>Taxa de empresas para 100.000 habitantes: <b><span id='taxa'></span></b>")

	// Once we append the vis elments to it, we return the DOM element for Observable to display above.
	if(previous_filter_emp!=null){
		let previous_this_map_emp = $("[element_id="+previous_filter_emp+"]")[0];
		d3.select(previous_this_map_emp) // seleciona o elemento atual
			    .attr("stroke-width", 3)
			    .attr("stroke","red");
	}
	return svg.node()
}

function update_countCities_emp(group){
	let map = new Map();
	let map_100000 = new Map();
	let cities = group.all();
	cities.forEach(function(d){
		map.set(d.key,+d.value);
		const population = city_population_emp.get(d.key);
		const to_100000 = (d.value * 100000)/population;
		map_100000.set(d.key,to_100000);
	});

	return [map,map_100000];
}

function createLegend_emp(color_scheme){
	let div = document.createElement('div');
	let labels = [],from, to;
	$(div).addClass('info legend');
	div.id = "legend";
	const n = color_scheme.length;

	for (let i = 0; i < n; i++) {
		let c = color_scheme[i]
        let fromto = colorScale_mapa_emp.invertExtent(c);
		labels.push(
			'<i style="background:' + color_scheme[i] + '"></i> ' +
			d3.format(".3f")(fromto[0]) + (d3.format(".3f")(fromto[1]) ? '&ndash;' + d3.format(".3f")(fromto[1]) : '+'));
	}

	div.innerHTML = "<b>Para 100.000 habitantes</b><br/>"+labels.join('<br>')
	const left =  (w*650)/1920;
	const top = (h*330)/949;
	$(div).css("position","absolute");
	$(div).css("left",left+"px");
	$(div).css("top",top+"px");
	if(w < 1200 || h < 640){
		const sw = w/1920;
		const sh = h/949;
		$(div).css("transform","scale("+sw+","+ sh+")")
	}
	// position: absolute;
	// left: 680px;
 //    top: 270px;
  	$("#Q12").append(div);
}

function showTooltip_emp(maps,element_id, x, y) {
	const offset = 10;
	const t = d3.select("#tooltip_emp");
	
	if(maps[0].has(element_id)){
		t.select("#qtd").text(maps[0].get(element_id));
		t.select("#taxa").text(maps[1].get(element_id));
		t.select("#name_county").text(city_name_mapa_emp.get(element_id));
	}
	else{
		t.select("#qtd").text("0");
		t.select("#taxa").text("0");
	}
	t.select("#name_county").text(city_name_mapa_emp.get(element_id));
	t.select("#pop").text(city_population_emp.get(element_id));
	t.classed("hidden", false);
	const rect = t.node().getBoundingClientRect();
	const wi = rect.width;
	const hi = rect.height;
	if (x + offset + wi > w) {
		x = x - wi;
	}

	if (y - hi < 0){
		y = y + hi + offset*3;
	}
	t.style("left", x + offset + "px").style("top", y - hi + "px");
}

function hideTooltip_emp(map){
	d3.select("#tooltip_emp")
		.classed("hidden", true);
}

function createMap_emp(){
	$("#Q12").empty();
	
	const maps = update_countCities_emp(group_municipios_emp);
	// const domain = [group_municipios_emp.top(group_municipios_emp.size())[group_municipios_emp.size()-1].value,group_municipios_emp.top(1)[0].value];
	//aqui
	let min= Number.MAX_VALUE, max = Number.MIN_VALUE;
	maps[1].forEach(function(d){
		if(d > max)
			max = d;
		if(d < min)
			min = d;
	});
	const domain = [0,max];
	//aqui
	const color_scheme = d3.schemeGreens[7];
	const values_variation = domain[1] - domain[0];
	colorScale_mapa_emp = d3.scaleQuantile()
		                .domain([domain[0],domain[0] + (values_variation * 0.05),domain[0] + (values_variation * 0.1),domain[0] + (values_variation * 0.30),domain[0] + (values_variation * 0.5),domain[0] + (values_variation * 0.7),domain[1]])
		                .range(color_scheme);
	mapa = renderMap_emp(brazil,maps);
	createLegend_emp(color_scheme);
}

	





var data_emp = d3.csv(path_empresas).then(function (data) {

  data.forEach(function(d){
		d.QTD = +d.QTD;
	});
	var facts = crossfilter(data);
	// //Map dim e group
	dim_municipios_emp = facts.dimension(d => d.MUNICIPIO);
	group_municipios_emp = dim_municipios_emp.group().reduceSum(d=>d.QTD);
	
	//Q1
	d3.json(path_brazil_emp).then(function(data2){
		data2.features.forEach(function(d){
			city_name_mapa_emp.set(d.properties.id_rfb,d.properties.name);
			city_population_emp.set(d.properties.id_rfb,d.properties.populacao);
		});
		brazil = data2;
		createMap_emp();
	});
	
    runDimensionQ7  = facts.dimension(d =>d.NATUREZA_JURIDICA)
    speedSumGroup = runDimensionQ7.group().reduceSum(d=>d.QTD);

  chartQ7
  .width((w / 3) * 1.50)
  .height(h / 3)
  .slicesCap(7)
  .dimension(runDimensionQ7)
  .group(speedSumGroup)
  .legend(dc.legend().itemHeight(13).gap(5).highlightSelected(true))

  .on("filtered", function(chart,filter){
            createMap_emp()
      });

  chartQ7.on('pretransition', function(chart) {
    chartQ7.selectAll('.dc-legend-item text')
        .text('')
      .append('tspan')
        .text(function(d) { return d.name; })
      .append('tspan')
        .attr('text-anchor', 'start')
        .text(function(d) { return ''; });

        chartQ7.selectAll('text.pie-slice').text(function(d) {
              return dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
      })
  });
  chartQ7.render();
	return data;
});