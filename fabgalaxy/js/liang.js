/*
 * The JavaScript impelememtation of the detailed panels
 * Author: Liang He
 * Date: 5/18/2018
 */

/* Get the project information by project ID
 * proj_id: project ID
 * dataset: dataset
 * return: the record of the queried project
 */
function get_proj_info(proj_id, dataset){
	var record;
	dataset.forEach(function(d){
		if(d["ID"] == proj_id)
			record = d;
	});
	return record;
}

/* Test if an author is in a list of authors
 * auhtorName: the target author
 * authorList: the list of authors
 * return: true - the author is in the list
 *		   false - the author is not in the list
 */	
function isAuthorIncluded(authorName, authorList){
	var result = false;
	var authors = authorList.split(',');

	authors.forEach(function(a){
		var temp = a.trim();
		if(temp == authorName){
			result = true;
		}
	});
	return result;
}

function getColorByVenue(v){
	var color;
	switch(v){
		case "ACM CHI": case "ACM CHI EA": color = "#f8cbad"; break;		// ACM CHI: ACM CHI, ACM CHI EA
		case "ACM C&C": color = "#F8ADB5"; break;
		case "ACM DIS": color = "#84aae2"; break;
		case "ACM Symposium": case "ACM SCF": case "ACM SCA": case "ACM SGP": color = "#ed9878"; break; // ACM Symposium: ACM SCF, ACM SCA, ACM SGP
		case "ACM SIGGRAPH": color = "#8dd3d2"; break;
		case "ACM SIGGRAPH ASIA": color = "#8782ac"; break;
		case "ACM TEI": color = "#edea8c"; break;
		case "ACM UIST": color = "#93d788"; break;
		case "EUROGRAPHICS": color = "#d395e2"; break;
		case "Others":
		case "ACM VRST": case "COMPUTER AND GRAPHICS": case "IOPScience":
		case "IEEE Pervasive Computing": case "IEEE COMPUTER GRAPHICS AND APPLICATIONS":
		case "CEA": case "NIME": color = "#959292"; break;	//Others: ACM VRST, COMPUTER AND GRAPHICS, IOPScience, IEEE Pervasive Computing, IEEE COMPUTER GRAPHICS AND APPLICATIONS, CEA, NIME
		default:color = "#000000"; break;
	}
	return color;
}
/* Get the author information by author name
 * author_name: the target author
 * dataset: dataset
 * return: the related information of the target author
 */
function get_author_info(author_name, dataset){
	var collaborators_list = {};
	var keywords_list = {};
	var proj_list = [];
	var record = {};	// dictionary that stores all the information related to the author

	dataset.forEach(function(d){
		var authorlist = d["Authors"];
		if(isAuthorIncluded(author_name, authorlist)){
			// if the author is the author of the project

			// add the project ID
			proj_list.push(d["ID"]);

			// add the keyword
			var keywords = d["Keywords"].split(';');

			keywords.forEach(function(k){
				var tempKeyword = k.trim();

				// add the keyword in the keyword list
				if(isNaN(keywords_list[tempKeyword])){
					keywords_list[tempKeyword] = 1;
				}
				else{
					keywords_list[tempKeyword] += 1;
				}
			});

			// add the collaborators
			var collaborators = d["Authors"].split(',');

			collaborators.forEach(function(c){
				var tempcollaborator = c.trim();

				// add the collaborators in the collaborator list
				if(tempcollaborator != author_name){
					if(isNaN(collaborators_list[tempcollaborator])){
						collaborators_list[tempcollaborator] = 1;
					}
					else{
						collaborators_list[tempcollaborator] += 1;
					}
				}
				
			});

			// console.log("author_name: " + author_name);
			// console.log("project list: " + proj_list);
			// console.log("collaborator list: " + collaborators_list);
			// console.log("keywords list: " + keywords_list);
		}
	});

	// sort the collaborators_list
	var collaborators_array_sorted = Object.keys(collaborators_list).map(function(key){
		return [key, collaborators_list[key]];
	});

	collaborators_array_sorted.sort(function(first, second){
		return second[1] - first[1];
	});
	var collaborators_list_sorted = {};
	collaborators_array_sorted.forEach(function(cas){
		collaborators_list_sorted[cas[0]] = cas[1];
	});

	// sort the keywords_list
	var keywords_array_sorted = Object.keys(keywords_list).map(function(key){
		return [key, keywords_list[key]];
	});

	keywords_array_sorted.sort(function(first, second){
		return second[1] - first[1];
	});
	var keywords_list_sorted = {};
	keywords_array_sorted.forEach(function(kas){
		keywords_list_sorted[kas[0]] = kas[1];
	});

	//console.log(keywords_list_sorted);
	//console.log(collaborators_list_sorted);
	record["projects"] = proj_list;
	record["collaborators"] = collaborators_list_sorted;
	record["areas"] = keywords_list_sorted; 

	return record;
}

/* Test if the keyword is in a list of keywords
 * k: the target keyword
 * kList: the list of the keywords
 * return: true - the keyword exists
 *		   false - the keyword does not exist
 */
function isKeywordExist(k, kList){
	var result = false;
	var keywords = kList.split(';');

	keywords.forEach(function(kw){
		var temp = kw.trim();
		if(temp == k){
			result = true;
		}
	});

	return result;
}

/* Get the keyword information by the keyword
 * keyword: the target keyword
 * dataset: dataset
 * return: the related information of the target keyword
 */
function get_keyword_info(keyword, dataset){
	var record = {};
	var proj_list = [];

	dataset.forEach(function(d){
		var keywords = d["Keywords"];

		if(isKeywordExist(keyword,keywords)){
			proj_list.push(d["ID"]);
		}
	});

	record["projects"] = proj_list;
	return record;
}
/* Author Search Part */
function getAuthorTable(){
	d3.select("#AuthorSearch").append("g")
  		.attr("class", "SearchBar")
  		.attr("id", "AuthorSearchBar")

	d3.select("#AuthorSearchBar").append("input")
    		.attr("class", "SearchBox")
    		.attr("id", "asearch")
    		.attr("type", "text")
    		.attr("placeholder", "Author")
	
	var table = d3.select("#AuthorSearch")
  		.append("div")
  			.attr("class","tableDiv")
  		.append("table")
  			.attr("id", "AuthorTable");		
	return table;
}

function getKeyTable(){	
    /* Keyword Search Part */
	d3.select("#KeywordSearch").append("g")
  		.attr("class", "SearchBar")
  		.attr("id", "KeywordSearchBar");

	d3.select("#KeywordSearchBar").append("input")
    		.attr("class", "SearchBox")
    		.attr("id", "ksearch")
    		.attr("type", "text")
    		.attr("placeholder", "Keyword");

  	var table = d3.select("#KeywordSearch")
  		.append("div")
  			.attr("class","tableDiv")
  		.append("table")
  			.attr("id", "KeywordTable");	
  	
  	return table;
 }
function update_tooltip(name, dataset, type){

	var tooltip_panel = document.getElementById("tooltip");
	while (tooltip_panel.firstChild) {
    	tooltip_panel.removeChild(tooltip_panel.firstChild);
	}

	switch(type){
		case "a":{
			// show the author information in the tooltip pannel
			var record = get_author_info(name,dataset);
			var proj_list = record["projects"];
			var totalnum = proj_list.length;

			var author_info = document.createElement("DIV");
			author_info.setAttribute("class","info_tooltip");

			var author_name = document.createElement("H1");
			author_name.innerHTML = name + " (" + totalnum + " papers)";
			
			var author_collaborators = document.createElement("P");
			var ac_pre = document.createElement("SPAN");
			ac_pre.setAttribute("style","font-weight: bold");
			ac_pre.innerHTML = "Co-authors: ";

			var collaborator_str = "";

			var collaborators = Object.keys(record["collaborators"]);
			for(var i = 0; i<Math.min(3,collaborators.length); i++){
				key = collaborators[i];
				collaborator_str += key;
				if (i != Math.min(3,collaborators.length)-1){
					collaborator_str += ', ';
				}
			}
			var ac_post = document.createElement("SPAN");
			ac_post.innerHTML = collaborator_str;
			author_collaborators.appendChild(ac_pre);
			author_collaborators.appendChild(ac_post);

			author_info.appendChild(author_name);
			author_info.appendChild(author_collaborators);

			// Add the timeline based stats of publications of the target author
			var author_pub_stat = document.createElement("DIV");
			author_pub_stat.setAttribute("class","pub_stat_tooltip");

			var pub_stats_array = [];
			var pub_stats = {};
			proj_list.forEach(function(pid){
				var proj = dataset[pid-1];
				var c = proj["Conference"];
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
						c == "CEA" || c == "NIME"){
					// ACM VRST, COMPUTER AND GRAPHICS, IOPScience, IEEE Pervasive Computing, IEEE COMPUTER GRAPHICS AND APPLICATIONS, CEA, NIME
					c = "Others";
				}

				if(pub_stats[c] == null){
					pub_stats[c] = 1;
				}
				else{
					pub_stats[c] += 1;
				}
			});

			for (var key in pub_stats) {
				var t = {};
				t[key] = pub_stats[key];
				pub_stats_array.push(t);
			}

			var pub_stas_ordered = pub_stats_array.sort(function(a, b){
				return b - a
			});

			pub_stas_ordered.forEach(function(d){
				var k, c, clr;
				for(var key in d){
					k = key;
					c = d[key];
				}
				var r = document.createElement("DIV");
				r.setAttribute('class','pub_circle_cnt');
				var cir = document.createElement("DIV");
				cir.setAttribute("class","pub_circle");
				cir.setAttribute("style","background-color:"+getColorByVenue(k));
				var cnt = document.createElement("SPAN");
				cnt.setAttribute("class","pub_cnt");
				cnt.setAttribute("style", "color: "+getColorByVenue(k));
				cnt.innerHTML = c + " papers";
				r.appendChild(cir);
				r.appendChild(cnt);

				author_pub_stat.appendChild(r);
			});

			tooltip_panel.appendChild(author_info);
			tooltip_panel.appendChild(author_pub_stat);
		}
		break;
		case "k":{
			// show the keyword information in the tooltip pannel
			// Update the detail panel with the keyword-driven information
			var c_name = name;
			var record = get_keyword_info(c_name,dataset);
			var proj_list = record["projects"];


			// add the header
			var kw_head_container = document.createElement("DIV");
			kw_head_container.setAttribute("class","kw_head_container_tooltip");
			var header = document.createElement("H1");
			var p1 = document.createElement("SPAN");
			p1.innerHTML = "There are ";
			var p2 = document.createElement("SPAN");
			p2.setAttribute("class","k_tooltip_text");
			p2.innerHTML = proj_list.length;
			var p3 = document.createElement("SPAN");
			p3.innerHTML = " projects related to \""
			var p4 = document.createElement("SPAN");
			p4.setAttribute("class","k_tooltip_text");
			p4.innerHTML = name;
			var p5 = document.createElement("SPAN");
			p5.innerHTML = "\"";

			header.appendChild(p1);
			header.appendChild(p2);
			header.appendChild(p3);
			header.appendChild(p4);
			header.appendChild(p5);

			kw_head_container.appendChild(header);
			tooltip_panel.appendChild(kw_head_container);

		}
		break;
		default:break;
	}
}

function alphabetical_order(author_nodes){
	// author_nodes: [{id: aID, name: author, pubs: [pIDs]}]
	var author_nodes_ordered = author_nodes;
	return author_nodes_ordered.sort(function(a,b){
		var a_name_list = a.name.split(' ');
		var a_lastname = a_name_list[a_name_list.length-1];

		var b_name_list = b.name.split(' ');
		var b_lastname = b_name_list[b_name_list.length-1];

		//console.log(b_lastname - a_lastname);

		if (a_lastname < b_lastname) return -1;
  		if (a_lastname > b_lastname) return 1;
  		return 0;
	});
}
function filter_keywords(keywords){
	return keywords.filter(function(d){
		return (d.pubs.length>=2) && (d.name != "Fabrication"); 
	});
}
function show_tooltip(isShown){
	var tooltip_panel = document.getElementById("tooltip");
	if(isShown) {
		tooltip_panel.className = "tooltipShow";
	}
	else{
		tooltip_panel.className = "tooltipHide";
	}
}
function update_project_list(pid_list, dataset){
	var dv = document.getElementById("resultlist");

	if (pid_list.length == 0){
		dv.className = "detail_view_hide";
		console.log(pid_list.length);
	}else{dv.className = "detail_view_show";}
	while (dv.firstChild) {
    	dv.removeChild(dv.firstChild);
	}

	

	// add the header
	var pl_head_container = document.createElement("DIV");
	pl_head_container.setAttribute("class","pl_head_container");
	var header = document.createElement("H1");
	header.innerHTML = "Search results: ";
	pl_head_container.appendChild(header);
	dv.appendChild(pl_head_container);

	var dv_1 = document.createElement("DIV");
	dv_1.setAttribute("class","pl_list_container");

	pid_list.sort(function(a,b){return a-b;});

	pid_list.forEach(function(pid){
		var pID = pid.substring(1, pid.length);
		var proj = dataset[pID-1];
		//console.log(proj);

		var _thumbtail = proj["Thumbtail"];
		var _title = proj["Title"];
		var _conf = proj["Conference"];
		var _year = proj["Year"];
		var _authors = proj["Authors"];
		var _DOI = proj["DOI"];

				
		// add all the project items
		var pl_item_container = document.createElement("DIV");
		pl_item_container.setAttribute("class","pl_item_container");

		var pl_item_img_container = document.createElement("DIV");
		pl_item_img_container.setAttribute("class","pl_item_img_container");
		var pl_thumbtail = document.createElement("IMG");
		pl_thumbtail.setAttribute("src", _thumbtail);
		pl_thumbtail.setAttribute("alt", _title);
		pl_thumbtail.onload = function(){
		    if(pl_thumbtail.height > pl_thumbtail.width){
		    	pl_thumbtail.height = '100%';
		    	pl_thumbtail.width = 'auto';
		    }
		};
		pl_item_img_container.appendChild(pl_thumbtail);

		var pl_item_intro_container = document.createElement("DIV");
		pl_item_intro_container.setAttribute("class","pl_item_intro_container");

		var pl_title = document.createElement("H1");
		var t_t = document.createTextNode(_title); 
		pl_title.appendChild(t_t);

		var pl_authors = document.createElement("P");
		pl_authors.innerHTML = _authors;

		var pl_conf = document.createElement("SPAN");
		pl_conf.setAttribute("class","conf_style");
		pl_conf.innerHTML = _conf + " " + _year;

		var pl_doi = document.createElement("SPAN");
		var doi_icon = document.createElement("I");
		doi_icon.setAttribute("class", "fas fa-link");
		var doi_link = document.createElement("A");
		doi_link.setAttribute("href",_DOI);
		doi_link.setAttribute("target","_blank");
		doi_link.innerHTML = "DOI";
		pl_doi.appendChild(doi_icon);
		pl_doi.appendChild(doi_link);

		pl_item_intro_container.appendChild(pl_title);
		pl_item_intro_container.appendChild(pl_authors);
		pl_item_intro_container.appendChild(pl_conf);
		pl_item_intro_container.appendChild(pl_doi);

		pl_item_container.appendChild(pl_item_img_container);
		pl_item_container.appendChild(pl_item_intro_container);

		dv_1.appendChild(pl_item_container);

		dv.appendChild(dv_1);
	});

	dv.appendChild(dv_1);

}

function showTutorial(isOn){

	var ol = document.getElementById("overlay");
	if(isOn){
		// Turn the tutorial on
		// ol.style.display = "block";
		// ol.style.opacity = "1.0";
		ol.className = "overlay_show";
	}
	else{
		// Turn the tutorial off
		// ol.style.display = "none";
		// ol.style.opacity = "0";
		ol.className = "overlay_hide";
	}
}

