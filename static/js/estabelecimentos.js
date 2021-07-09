// const  path_estabelecimentos = path_data+"estabelecimentos.csv";

// const  path_estabelecimentos = path_data+"estabelecimentos_min.csv";
const  path_mapa = path_data+"mapa.csv";
const  path_estabelecimentos_abertos = path_data+"inicio_estabs_formatado.csv";
const  path_porte_situacao = path_data+"situacao_porte.csv";
const  path_situacao = path_data+"situacao_formatado.csv";
const  path_atividades = path_data+"situacao_formatado.csv";
const  path_brazil = path_data+"maranhao_pop.json";
var w = window.innerWidth;
var h = window.innerHeight;
var colh = h/2;
var colw = (33/100) * w;
let mapa = null;
let next,last;
let colorScale_mapa = null;
let city_name_mapa = new Map();
let city_population = new Map();
let format = d3.format(".2f");
let facts = null;
let brazil = null;
let dim_states = null;
let group_municipios = null;
let previous_filter = null;
let previous_this_map = null;
let resetar = null;
let parseDate = d3.utcParse("%Y-%m-%d");
let colorScale = d3.scaleOrdinal()
					.domain(["Ativa","Baixada","Inapta","Nula","Suspensa"])
					.range(["#8dd3c7", "#fb8072", "#e0e004","#80b1d3","#bebada"])
tratar_dados = function(d){
	d.date_month = parseDate(d.data.substr(0,7)+"-02");
	d.date_month_str = d.data.substr(0,7)+"-02";
	d.data = parseDate(d.data);
	d.QTD = + d.QTD;
}

function clickFilter(el){
	var df = $("#d"+el.id)[0];
	if(df.style.display != "inline")
		df.style.display = "inline";
	else
		df.style.display = "none";
}

function renderMap(data,maps){
	const svg = d3.select("#Q1").append("svg");


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
				return colorScale_mapa(maps[1].get(d.properties.id_rfb));
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
	  		if(clicked_state==previous_filter){
	  			d3.select(this) // seleciona o elemento atual
				    .attr("stroke-width", 0)
	    			.attr("stroke","none"); //volta ao valor padrão
	  			clicked_state = null;
	  			// previous_this_map = null;
	  		}else{
	  			let previous_this_map = $("[element_id="+previous_filter+"]")[0];
	  			d3.select(previous_this_map) // seleciona o elemento atual
			    .attr("stroke-width", 0)
	    		.attr("stroke","none"); //volta ao valor padrão
	  		}
	  		dim_states.filterExact(clicked_state);
	  		dc.renderAll();
	  		previous_filter = clicked_state;
	  		// previous_this_map = this;
	  })
	  .on("mouseover", function(d){
	    d3.select(this) // seleciona o elemento atual
	    .style("cursor", "pointer") //muda o mouse para mãozinha
	    .attr("stroke-width", 3)
	    .attr("stroke","#FFF5B1");
	    
	    const rect = this.getBoundingClientRect();
	    showTooltip(maps,this.getAttribute("element_id"), rect.x, rect.y);
	  })
	.on("mouseout", function(d){

	    d3.select(this)
	    .style("cursor", "default")
	    .attr("stroke-width", 1)
	    .attr("stroke","white"); //volta ao valor padrão
	    if(previous_filter != null){
	    	let previous_this_map = $("[element_id="+previous_filter+"]")[0];
			d3.select(previous_this_map) // seleciona o elemento atual
			    .attr("stroke-width", 3)
			    .attr("stroke","red");
		}
	    hideTooltip(maps);
	});

	svg.append("path")
	  .datum(topojson.mesh(data, data.features, function(a, b) { return a !== b; }))
	  .attr("class", "states")
	  .attr("d", path)
	d3.select("#tooltip").remove()
	  let node = d3.select("body")
	      .append("div")
	      .attr("id","tooltip")
	      .attr("class","hidden")
	      .append("p")
	      .html("<h4 id='name_county'></h4>Quantidade de estabelecimentos: <span id='qtd'></span><br/>População: <span id='pop'></span><br/>Taxa de estabelecimentos para 100.000 habitantes: <b><span id='taxa'></span></b>")

	// Once we append the vis elments to it, we return the DOM element for Observable to display above.
	if(previous_filter!=null){
		let previous_this_map = $("[element_id="+previous_filter+"]")[0];
		d3.select(previous_this_map) // seleciona o elemento atual
			    .attr("stroke-width", 3)
			    .attr("stroke","red");
	}
	return svg.node()
}

function update_countCities(group){
	let map = new Map();
	let map_100000 = new Map();
	let cities = group.all();
	cities.forEach(function(d){
		map.set(d.key,+d.value);
		const population = city_population.get(d.key);
		const to_100000 = (d.value * 100000)/population;
		map_100000.set(d.key,to_100000);
	});

	return [map,map_100000];
}

function createLegend(color_scheme){
	let div = document.createElement('div');
	let labels = [],from, to;
	$(div).addClass('info legend');
	div.id = "legend";
	const n = color_scheme.length;

	for (let i = 0; i < n; i++) {
		let c = color_scheme[i]
        let fromto = colorScale_mapa.invertExtent(c);
		labels.push(
			'<i style="background:' + color_scheme[i] + '"></i> ' +
			d3.format(".3f")(fromto[0]) + (d3.format(".3f")(fromto[1]) ? '&ndash;' + d3.format(".3f")(fromto[1]) : '+'));
	}

	div.innerHTML = "<b>Para 100.000 habitantes</b><br/>"+labels.join('<br>')
	const left =  (w*680)/1920;
	const top = (h*270)/949;
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
  	$("#Q1").append(div);
}

function showTooltip(maps,element_id, x, y) {
	const offset = 10;
	const t = d3.select("#tooltip");
	
	if(maps[0].has(element_id)){
		t.select("#qtd").text(maps[0].get(element_id));
		t.select("#taxa").text(maps[1].get(element_id));
		t.select("#name_county").text(city_name_mapa.get(element_id));
	}
	else{
		t.select("#qtd").text("0");
		t.select("#taxa").text("0");
	}
	t.select("#name_county").text(city_name_mapa.get(element_id));
	t.select("#pop").text(city_population.get(element_id));
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

function hideTooltip(map){
	d3.select("#tooltip")
		.classed("hidden", true);
}

function createMap(){
	$("#Q1").empty();
	
	const maps = update_countCities(group_municipios);
	// const domain = [group_municipios.top(group_municipios.size())[group_municipios.size()-1].value,group_municipios.top(1)[0].value];
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
	colorScale_mapa = d3.scaleQuantile()
		                .domain([domain[0],domain[0] + (values_variation * 0.05),domain[0] + (values_variation * 0.1),domain[0] + (values_variation * 0.30),domain[0] + (values_variation * 0.5),domain[0] + (values_variation * 0.7),domain[1]])
		                .range(color_scheme);
	mapa = renderMap(brazil,maps);
	createLegend(color_scheme);
}

// var data = d3.csv(path_estabelecimentos).then(function(data){
// 	//root_cnpj,cnpj_est,name,date_start,situation,situationDate,state,porte,activity
// 	let parseDate = d3.utcParse("%Y-%m-%d");
// 	data.forEach(function(d){
// 		d.date_month = parseDate(d.date_start.substr(0,7)+"-02");
// 		d.date_start = parseDate(d.date_start);
// 		d.date_month = d.situationDate.substr(0,7)+"-01";
// 		d.situationDate = parseDate(d.situationDate);
// 	});
	
	// let lineChartQ11 = dc.lineChart("#Q11");
	// let data_table = dc.dataTable("#table_estabs");
	// let barchart= dc.barChart("#Q3");
	// let lineChart_situation = dc.seriesChart("#situacoes_linha");
	// let rowChartQ2 = dc.rowChart("#Q2");
	// let selectFilter_situation = dc.selectMenu("#filter_situa");
	// let lineChartQ11Filter = dc.lineChart("#Q11F");

	// resetar = function(){
	// 	if(previous_filter != null){
	// 		let filtered_state = $("[element_id="+previous_filter+"]")[0];
	// 		filtered_state.dispatchEvent(new Event('click'));
	// 	}
	// 	lineChartQ11.filterAll();
	// 	data_table.filterAll();
	// 	barchart.filterAll();
	// 	lineChart_situation.filterAll();
	// 	rowChartQ2.filterAll();
	// 	selectFilter_situation.filterAll();
	// 	lineChartQ11Filter.filterAll();
	// 	dc.renderAll();
	// };

var data_mapa = d3.csv(path_mapa).then(function(data){
	data.forEach(function(d){
		d.QTD = +d.QTD;
	});
	let facts = crossfilter(data);//TODO: No futuro interligar gráficos
	// //Map dim e group
	dim_municipios = facts.dimension(d => d.MUNICIPIO);
	group_municipios = dim_municipios.group().reduceSum(d=>d.QTD);
	
	//Q1
	d3.json(path_brazil).then(function(data2){
		data2.features.forEach(function(d){
			city_name_mapa.set(d.properties.id_rfb,d.properties.name);
			city_population.set(d.properties.id_rfb,d.properties.populacao);
		});
		brazil = data2;
		createMap();
	});
	
	return data;
})
	


	
Q11
let lineChartQ11 = dc.lineChart("#Q11");
var data_estabelecimentos_abertos = d3.csv(path_estabelecimentos_abertos).then(function(data){
	data.forEach(tratar_dados);
	
	let facts = crossfilter(data);//TODO: No futuro interligar gráficos

	let dim_date_start = facts.dimension(d=>d.date_month);
	let _group = dim_date_start.group().reduceSum(function(d){return d.QTD});
	var group_date_start = {
		all:function () {
			var cumulate = 0;
			var g = [];
			_group.all().forEach(function(d,i) {
				cumulate += d.value;
				g.push({key:d.key,value:cumulate,'in_day':d.value})
			});
			return g;
		}
	};
	let hourScale = d3.scaleTime().domain(d3.extent(data,d=> d.date_month));
	lineChartQ11.width(colw)
			.height(colh/2)
			.margins({left: 50, top: 5, right: 5, bottom: 30})
			.dimension(dim_date_start)
			.group(group_date_start)
			.x(hourScale)
			.renderArea(true)
			.yAxisLabel("Qtd. de estabelecimentos")
			.xAxisLabel("Ano de início das atividades")
			.clipPadding(10)
			.elasticY(true)
			.title(function(d) { return 'Mês: ' + d.key.toLocaleDateString().substr(3)+'\nAcumulado: '+ d.value+'\nNo mês: '+d.in_day; })
			.brushOn(false)
			.mouseZoomable(true)
			.on("filtered", function(chart,filter){
					createMap()
			});
	lineChartQ11.render();
	return data;
})



    // let dim_date_start_filter = facts.dimension(d=>d.date_month);
    // let group_date_start_filter = dim_date_start.group();
	// lineChartQ11Filter.width(colw/2)
    //         .height(colh/3)
 	// 			// .margins({left: 40, top: 20, right: 10, bottom: 40})
    //         .dimension(dim_date_start_filter)
    //         .group(group_date_start_filter)
    //         .x(hourScale)
    //         .renderArea(true)
    //         // .yAxisLabel("Qtd. de estabelecimentos")
	//         .xAxisLabel("Ano de início das atividades")
	//         .clipPadding(10)
	//         // .elasticY(true)
	//         // .title(function(d) { return 'Mês: ' + d.key.toLocaleDateString().substr(3)+'\nAcumulado: '+ d.value+'\nNo mês: '+d.in_day; })
    //         .brushOn(true)
    //         .mouseZoomable(false)
    //         .on("filtered", function(chart,filter){
	// 		        createMap()
	// 		})
	// 		.xAxis().ticks(5);
	// 		lineChartQ11Filter.yAxis().ticks(0);





//Q3
let barchart= dc.barChart("#Q3");
let data_situacao_porte = d3.csv(path_porte_situacao).then(function(data){
	data.forEach(function(d){
		situacoes_map = {"ACTIVE":"Ativa","DOWN":"Baixada","UNFIT":"Inapta","NULL":"Nula","SUSPENDED":"Suspensa"}
		d.URI_CLASSE_TIPO_SITUACAO = situacoes_map[d.URI_CLASSE_TIPO_SITUACAO];
		d.QTD = +d.QTD;
	});
	let facts = crossfilter(data);//TODO: No futuro interligar gráficos
	let dim_porte = facts.dimension(function(d){ return d.URI_PORTE});
	let situacoes = ["Ativa","Baixada","Inapta","Nula","Suspensa"];
	barchart.ordering(function(d){
		let cont = 0;
		for(i in d.value) {
			cont+= d.value[i];
		}
		return -cont;
	});
	
	let group_porte_situacao = dim_porte.group().reduce(function(p,v){
			//Add
			p[v.URI_CLASSE_TIPO_SITUACAO] = (p[v.URI_CLASSE_TIPO_SITUACAO] || 0) + v.QTD;
			return p;
		},function(p,v){
			//Remove
			p[v.URI_CLASSE_TIPO_SITUACAO] = (p[v.URI_CLASSE_TIPO_SITUACAO] || 0) - v.QTD;
			return p;
		},function(p,v){
			//Init
			return {};
		});
		
		function sel_stack(i) {
				return function(d) {
					return d.value[i];
				};
			}
	console.log(group_porte_situacao.all())
		
	
	barchart.width(colw)
				.height(colh)
				.x(d3.scaleLinear().domain([1, 21]))
				.margins({left: 80, top: 20, right: 10, bottom: 40})
				.brushOn(false)
				.clipPadding(20)
				.gap(40)
				.yAxisLabel("Qtd. de estabelecimentos")
				.xAxisLabel("Porte")
				.elasticY(true)
				.title(function (d) {
					let total = 0
					for (i in d.value){
						total += d.value[i];
					}
					let rate = format((d.value[this.layer]/ total) * 100);
					return d.key + '[' + this.layer + ']: ' + d.value[this.layer]+"\n"+rate+"%";
				})
				.x(d3.scaleBand())
				.xUnits(dc.units.ordinal)
				.dimension(dim_porte)
				.group(group_porte_situacao, situacoes[0], sel_stack(situacoes[0]))
				.renderLabel(true)
				.colors(colorScale)
				.on("filtered", function(chart,filter){
					createMap()
				});
	
	barchart.legend(dc.legend());
	for (var i = 1; i < 5; ++i) {
				barchart.stack(group_porte_situacao, '' + situacoes[i], sel_stack(situacoes[i]));
	}
	barchart.render();
	return data;
});






    
           
//Gráfico de linha das situações
let lineChart_situation = dc.seriesChart("#situacoes_linha");
let data_situacao = d3.csv(path_situacao).then(function(data){
	data.forEach(tratar_dados);
	let facts = crossfilter(data);//TODO: No futuro interligar gráficos
	let dim_situation = facts.dimension(d=>[d.URI_CLASSE_TIPO_SITUACAO,d.date_month_str]);
	let _group_situation = dim_situation.group();
	
	var group_situation = {
		all:function () {
			var cumulate = {};
			var g = [];
			_group_situation.all().forEach(function(d,i) {
				if(!(d.key[0] in cumulate))
				cumulate[d.key[0]] = d.value;
				else
				cumulate[d.key[0]] += d.value;
				g.push({key:[d.key[0],parseDate(d.key[1])],value:cumulate[d.key[0]],'in_day':d.value})
			});
			
			
			return g;
		}
	};
	let hourScale_situation = d3.scaleTime().domain(d3.extent(data,function(d){
		return parseDate(d.date_month_str)
	}))
	lineChart_situation.width(colw)
				     .height(colh/2)
				     .margins({left: 50, top: 5, right: 5, bottom: 30})
				     .chart(function(c) { return new dc.LineChart(c); })
				     .x(hourScale_situation)
				     .brushOn(false)
				     .yAxisLabel("Qtd. de estabelecimentos")
				     .xAxisLabel("Data da situação")
				     .clipPadding(10)
				     .elasticY(true)
				     .dimension(dim_situation)
				     .group(group_situation)
				     .mouseZoomable(false)
				     .title(function(d) { return 'Situação: '+d.key[0]+'\nMês: ' + d.key[1].toLocaleDateString().substr(3)+'\nAcumulado: '+ d.value+'\nNo mês: '+d.in_day; })
				     .seriesAccessor(function(d) { return d.key[0];})
				     .keyAccessor(function(d) {return d.key[1];})
				     .valueAccessor(function(d) { return +d.value;})
				     .colors(colorScale)
				     .on("filtered", function(chart,filter){
					    createMap();
					})
				     .legend(dc.legend().x(250).y(0).itemHeight(13).gap(5))
				     .xAxis().ticks(5);
	lineChart_situation.render();
	return data;
})













//Gráfico de Q2
let data_atividades = d3.csv("")
let dim_atividades = facts.dimension(d => d.activity);
let group_atividades = dim_atividades.group();
let scaleAtividades = d3.scaleLinear().domain([0,group_atividades.top(1)[0].value]);
rowChartQ2.ordering(function(d){return -d.value});


rowChartQ2.width(window.innerWidth)
.height(colh-100)
.dimension(dim_atividades)
.group(group_atividades)
.x(scaleAtividades)
// .label(function(d){return d.key;})
// .margins({top: 50, right: 50, bottom: 25, left: 40})
.elasticX(true)
.valueAccessor(function(d) { return +d.value;})
.othersGrouper(false)
.colors(['#0d6efd'])
.cap(10)
.on("filtered", function(chart,filter){
	createMap()
});





	// 	//Filter situation
	// 	let dim_situation_filter = facts.dimension(d=>d.situation);
	// 	selectFilter_situation.dimension(dim_situation_filter)
	// 			.group(dim_situation_filter.group())
	// 			.multiple(true)
	// 			.numberVisible(5)
	// 			// .mouseZoomable(false)
	// 			.controlsUseVisibility(true)
	// 			.on("filtered", function(chart,filter){
	// 		        createMap()
	// 			});

//   dc.renderAll();
//   function AddXAxis(chartToUpdate, displayText){
// 	    chartToUpdate.svg()
// 	                .append("text")
// 	                .attr("class", "x-axis-label")
// 	                .attr("text-anchor", "middle")
// 	                .attr("x", chartToUpdate.width()/2)
// 	                .attr("y", chartToUpdate.height()-1.5)
// 	                .text(displayText);
// 	}
// AddXAxis(rowChartQ2, "Qtd. de estabelecimentos");
//   return data;
// });