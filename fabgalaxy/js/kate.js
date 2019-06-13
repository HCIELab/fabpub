// Given nodes, make circles(dots) and force simulation)
function d3_nodesToDots(authors_nodes, pubs_nodes,keywords_nodes, author_links){     
	var R1 = 450, 
		R2 = 500;

	var count_year = 11; // since 2009

	pubs_nodes = addDotPosition(R1,R2,pubs_nodes);
	
	var authorLines = d3.select("#visKate")
		.append("g")
		.selectAll(".authorLinks")
		.data(author_links)
		.enter().append('line')
		 .attr('marker-end', 'url()')
		.attr("stroke", "#9ad5fe")
		.attr('stroke-opacity', 0.5);
	
	var authorDots = d3.select("#visKate")
    	.append("g")
    	.selectAll(".author_circles")
		.data(authors_nodes)
    	.enter().append("circle")
    		.attr("r", function(d){return authorNodeRadius(d); })
    		.attr("id", function(d){return d.id+"g"})
    		.attr("class", "authorDots")
    		.style("fill", "#9ad5fe");
	
	d3.select("#visKate")
  		.append('marker')
  		.attr('id', 'arrowhead')
  		.attr('refX', 6+15) // Controls the shift of the arrow head along the path
  		.attr('refY', 2)
  		.attr('markerWidth', 6)
 		.attr('markerHeight', 4)
  		.attr('orient', 'auto')
  		.style('fill', '#9ad5fe')
 		.append('path')
    	.attr('d', 'M 0,0 V 4 L6,2 Z');	
    	
    var pubsByYear = d3.nest()
    	.key(function(d){return d.year})
    	.rollup(function(v){return v.length;})
    	.entries(pubs_nodes);
        
    var pie = d3.pie()
    	.startAngle(-90 * Math.PI/180)
    	.endAngle(-90 * Math.PI/180 + 2*Math.PI)
    	.value(function(d) { return d.value; })
    	.padAngle(.01)
    	.sort(null)
    
    var yearArc = d3.arc()
    	.innerRadius(R2+5)
    	.outerRadius(R2+10);
    
 	var yearPie = d3.select("#visKate").append("g").selectAll(".yearArc")
    	.data(pie(pubsByYear))
    	.enter().append("path")
    		.attr("class", "yearArc")
    		.attr("id", function(d,i) { return "yearArc"+i; }) //Unique id for each slice
			.attr("d", yearArc)
 			.style('fill', 'white')
 			.style('opacity', function(d,i){return (count_year-i)/count_year;});
 			
	var yearLabels = d3.select("#visKate").append("g").selectAll(".yearLabel")
		.data(pubsByYear)
		.enter().append("text")
		.attr("class", "yearLabel")
		.attr("dy", -5) 
		.append("textPath")
			.attr("xlink:href", function(d,i){return "#yearArc"+i;})
			.attr("style","font-size:12px;")
			.attr("fill", "white")
			.attr("opacity", 0.5)
			.text(function(d){return d.key;});

 	var pubDots = d3.select("#visKate")
		.append("g")
		.selectAll(".pub_circles")
		.data(pubs_nodes)
		.enter().append("circle")
			.attr("r", 7)
			.attr("id", function(d){return d.id+"g";})
			.attr("class", "pubDots")
			.style("fill", function(d) { return venue_color(d.conference); });
    
    var keywordDots = d3.select("#visKate")
    	.append("g")		
		.selectAll(".keyword_circles")
		.data(keywords_nodes)
		.enter().append("g")
			.attr('class', 'keyNodes')
			.attr("id", function(d){return d.id+"g";})
	
	keywordDots.append("circle")
			.attr("r",  function(d){return Math.floor((d.pubs.length/count_year)+6); })
			.style("fill", "NavajoWhite")
			.attr("class", "keyCircles")
			.style("opacity", 0.5);

	var keyLabels = keywordDots.append("text")
			.text(function(d){return d.name})
			.style("fill", "NavajoWhite")
			.style('opacity',  function(d){return (d.pubs.length/count_year)+0.5;})
			.style("font-size", function(d){return (d.pubs.length/count_year)+13 + "px"; })
   			.attr("id", function(d){return d.id+"g_l";})
   			.attr("dy", ".35em")
   			.attr("text-anchor", "middle")
   			.style("visibility", "hidden");
	
	var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id }))
			.force('charge', d3.forceManyBody());

	simulation.nodes(authors_nodes)
		.force("x", d3.forceX().strength(.19))
		.force("y", d3.forceY().strength(.19))
		.on("tick", ticked);
	
	simulation.force("link")
		.links(author_links);
	
	d3.forceSimulation(pubs_nodes)
		.on("tick", ticked)
	
	d3.forceSimulation(keywords_nodes)
		.force("charge",  d3.forceManyBody())
		.force("r", d3.forceRadial(700))
		.force("x", d3.forceX())
		.force("y", d3.forceY())
		.on("tick", ticked);
		
	function ticked(e){
		authorDots.attr("cx", function(d){ return d.x;})
			.attr("cy", function(d){ return d.y;});		
		pubDots.attr("cx", function(d){ return d.x;})
			.attr("cy", function(d){ return d.y;});			
		keywordDots.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			
		
		authorLines
        	.attr("x1", function(d) { return d.source.x; })
    		.attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
		}	
d3.timer(function(elapsed) {	
	 	var delta = (Date.now() - start);
    	pubDots.attr("transform", "rotate(" + delta * 1/2000 + ")");
    	yearPie.attr("transform", "rotate(" + delta * 1/2000 + ")");
    	// keywordDots.attr("transform", function(d) {
//       		return "translate("+(d.x+Math.cos(delta))+","+(d.y+Math.sin(delta))+")";});
// 		keyLabels.attr("transform", function(d) {
//       		return "rotate(" + -delta * 1/3000 + ")";});
    });
	return {
        authorDots: authorDots,
        pubDots: pubDots,
        keywordDots: keywordDots,
        authorLines:authorLines,
		keyLabels:keyLabels
    };
}
function getNodes(pubs, authorIDs, keyIDs){
	var authors_dict = [];
	var authors_link_dict = [];
	var pubNodes = [];
	var keyword_dict =[];
	var keyword_dict_authors =[];
	var authorLinks = [];
			for (var p = 0; p<pubs.length; p++){
				authors_project = pubs[p].Authors.split(",");
				
				var authorList_pub = [];
				
				for (var a = 0; a<authors_project.length;  a++){
					var author = authors_project[a].trim();
					if (a == 0){var source_author = author;};
					if (!(author in authors_dict)){
						authors_dict[author] = ["p"+pubs[p].ID];
					}else{
						authors_dict[author].push("p"+pubs[p].ID);
					}
					authorList_pub.push(authorIDs[author]);
					
					for (var aa = a+1; aa<authors_project.length; aa++){
						var author2 = authors_project[aa].trim();
						if (!(author in authors_link_dict)){
							authors_link_dict[author] = {}
							authors_link_dict[author][author2] = 1;
						}else{
							if(!(author2 in authors_link_dict[author])){
								authors_link_dict[author][author2] = 1;
							}else{
								authors_link_dict[author][author2] +=1;
							}
						}
						if (!(author2 in authors_link_dict)){
							authors_link_dict[author2] = {}
							authors_link_dict[author2][author] = 1;
						}else{
							if(!(author in authors_link_dict[author2])){
								authors_link_dict[author2][author] = 1;
							}else{
								authors_link_dict[author2][author] += 1;
							}
						}
					}

				}
				
				keywords_project = pubs[p].Keywords.split(";");
				var keyList_pub = [];
				for (var a = 0; a<keywords_project.length;  a++){
					keyword = keywords_project[a].trim();
					if (keyword != "Fabrication"){
					if (!(keyword in keyword_dict)){
						keyword_dict[keyword] = ["p"+pubs[p].ID];
						keyword_dict_authors[keyword] = authorList_pub;
					}else{
						keyword_dict[keyword].push("p"+pubs[p].ID);
						keyword_dict_authors[keyword].push(...authorList_pub);
					}
					keyList_pub.push(keyIDs[keyword]);
					}
				}
								
				//append pub node
				if (pubs[p].Year <= 2009){
					pubYear = "<2009";
				}else{pubYear = pubs[p].Year;}
				var c= pubs[p].Conference;
				if(c == "ACM CHI EA"){
					c = "ACM CHI";
				}
				else if(c == "ACM SCF" || c == "ACM SCA" || c == "ACM SGP"){
					// ACM SCF, ACM SCA, ACM SGP
					c = "ACM Symposium";
				}
				else if(c == "ACM VRST" || c == "COMPUTER AND GRAPHICS" || 
						c == "IOPScience" || c == "IEEE Pervasive Computing" ||
						c == "IEEE COMPUTER GRAPHICS AND APPLICATIONS" ||
						c == "CEA" || c == "NIME" || c == "IEEE TVCG"){
					// ACM VRST, COMPUTER AND GRAPHICS, IOPScience, IEEE Pervasive Computing, IEEE COMPUTER GRAPHICS AND APPLICATIONS, CEA, NIME
					c = "Others";
				}
				pubNodes.push({id: "p"+pubs[p].ID, authors: authorList_pub,  keys: keyList_pub, conference:c, year:pubYear});
		}

	var authorList = Object.keys(authors_dict)
	
	// generate author nodes
	var authorNodes = [];
	var linksTest = [];
	var tempdict = {};
	for (var a = 0; a <authorList.length; a++){
		authorNodes.push({id: authorIDs[authorList[a]],name:authorList[a], pubs:authors_dict[authorList[a]]})
		var list = authors_link_dict[authorList[a]];
		linksSorted = Object.keys(list).sort(function(a,b){return list[b]-list[a]})

		tempdict[authorIDs[authorList[a]]] = [];
		for (var j = 0; j<Math.min(1,linksSorted.length); j++){
			if (linksTest.indexOf(authorIDs[authorList[a]]+authorIDs[linksSorted[j]])==-1 && linksTest.indexOf(authorIDs[linksSorted[j]]+authorIDs[authorList[a]])==-1){
				linksTest.push(authorIDs[authorList[a]]+authorIDs[linksSorted[j]]);
				}
			tempdict[authorIDs[authorList[a]]].push(authorIDs[linksSorted[j]]);
			authorLinks.push({'source': authorIDs[authorList[a]], 'target':authorIDs[linksSorted[j]]});
		}
			}

	var keyList = Object.keys(keyword_dict);
	var keyNodes = [];
	for(var k = 0; k< keyList.length; k++){
		if (keyword_dict[keyList[k]].length >1){
			keyNodes.push({id: keyIDs[keyList[k]], name: keyList[k], pubs:keyword_dict[keyList[k]], authors:keyword_dict_authors[keyList[k]]});
			}
	}
	return{
		authorNodes :authorNodes,
		pubNodes: pubNodes,
		keyNodes: keyNodes,
		authorLinks : authorLinks
		};	
}
function getSourceTargetDict(authorLinks){
	var targetDict = {};
	var sourceDict = {};
	
	for (var i = 0; i <authorLinks.length; i++){
		var s = authorLinks[i].source.id;
		var t = authorLinks[i].target.id;
		
		targetDict[s] = t;
		if (!(t in sourceDict)){
			sourceDict[t] = [s];
		}else{
			sourceDict[t].push(s);
		}
		if (!(s in sourceDict)){
			sourceDict[s] = [];
		}
	}
	return {
		targetDict : targetDict,
		sourceDict : sourceDict
	}
}
function addDotPosition(R1, R2, nodes){
    	var thetas = [];
    	for (var n = 0; n<nodes.length; n++){
    		thetas.push(n*2*Math.PI/nodes.length+Math.PI);
    	}
		var dists = [R1+(R2-R1)/4, R1+3*(R2-R1)/4]
    	for (var n = 0; n<nodes.length; n++){
    		theta = thetas[n];
    		dist = dists[n%2];
    		var x =  dist * Math.cos(theta);
			var y =  dist * Math.sin(theta);
			nodes[n].x = x;
			nodes[n].y = y;
    	}
	return nodes;

    }
function authorNodeRadius(node){
	return Math.floor((node.pubs.length/2)+6)
}
	