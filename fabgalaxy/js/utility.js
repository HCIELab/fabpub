/*
 * Helper fucntions
 * Author: Liang He
 * Date: 5/18/2018
 */


/*
 * Test if the input year in the selected years
 * param: y - the target year, years - the selected years
 * return: true if the target year is in the selected years, otherwise, false
 */
function is_in_years(y, years){
	for (var i = 0; i < years.length; i++) {
        if(y == years[i])
          return true;
    }
    return false;
}

/*
 * Get the subset of the whole dataset based on the selected years
 * param: years - the selected years
 * return: the dataset which includes the data in the selected years
 */
function get_data_by_selected_years(years){
    var sub_data = [];
	
    const data = d3.csv("fab_dataset.csv", function(data) {
	
		for (var i = 0; i < data.length; i++) {
            var obj = data[i]["Year"];
            if(is_in_years(obj, years))
              sub_data.push(data[i]);
      	}
	});

    return sub_data;
}

/*
 * Get the color code based on the conference name
 * param: v - the name of the conference
 * return: the color code "#xxxxxx"
 */
function get_color_by_conf_name(v){
    var rel;
    switch(v){
    	case 'ACM CHI': rel='#F2F2F3'; break;
        case 'ACM C&C': rel='#F8ADB5'; break;
        case 'ACM DIS': rel='#84AAE2'; break;
        case 'ACM Symposium': rel='#ED9878'; break;
        case 'ACM SIGGRAPH': rel='#8DD3D2'; break;
        case 'ACM SIGGRAPH ASIA': rel='#8782AC'; break;
        case 'ACM TEI': rel='#EDEA8C'; break;
        case 'ACM UIST': rel='#93D788'; break;
        case 'EUROGRAPHICS': rel='#D395E2'; break;
        case 'Others': rel='#959292'; break;
        default: break;
    }
    return rel;
}

function dictToNodes(dictionary, minNum=0){
	var keyList = Object.keys(dictionary)
	nodes = [];
	for (var a = 0; a <keyList.length; a++){
		if (dictionary[keyList[a]].length > minNum){
			nodes.push({id: keyList[a], values:dictionary[keyList[a]]})
		}
	}
	return nodes;
}
function generateIDs(){
	var authorIDs = [];
	var keyIDs = [];
	d3.csv("fab_dataset.csv", function(error, data){
		var aid = 1;
		var kid = 1;
		for (var p = 0; p<data.length; p++){
			authors_project = data[p].Authors.split(","); 	
			for (var a = 0; a<authors_project.length;  a++){
				author = authors_project[a].trim()			
				if (!(author in authorIDs)){
					authorIDs[author] = "a"+aid;
					aid += 1;
				}
			}
			keywords_project = data[p].Keywords.split(";");
			for (var a = 0; a<keywords_project.length;  a++){
				keyword = keywords_project[a].trim();
				if (!(keyword in keyIDs)){
					keyIDs[keyword] = "k"+kid;
					kid +=1;
				}
			}
		}
	})
	return {
        authorIDs: authorIDs,
        keyIDs: keyIDs
    };
}

function isInAuthorIDs(author, authorIDs){
	var result = false;
	authorIDs.forEach(function(aID){

		for(var key in aID){
			if(key == author)
				result = true;
		}
		
	});

	return result;
}
function isInKeywordIDs(keyword, keywordIDs){
	var result = false;
	keywordIDs.forEach(function(kID){

		for(var key in kID){
			if(key == keyword)
				result = true;
		}
		
	});

	return result;
}
function getPubIDs(data, authorIDs, KeywordIDs){
	var pubList = [];
	data.forEach(function(d){
		var author_list = d.Authors.split(",");
		var pID = d.ID;
		var key_list = d.Keywords.split(";");

		author_list.forEach(function(a){
			var au = a.trim();
			if(isInAuthorIDs(au, authorIDs) && pubList.indexOf(pID) == -1)
				pubList.push(pID);
		});

		key_list.forEach(function(k){
			var kw = k.trim();
			if(isInKeywordIDs(kw, KeywordIDs) && pubList.indexOf(pID) == -1)
				pubList.push(pID);
		});

	});

	return pubList;
}

function getNodes(data, year, authorIDs, keyIDs){
	var authors_dict = [];
	var pubNodes = [];
	var keyword_dict =[];
	
	for (var i = 0; i<years.length; i++){
			year= years[i];
			var pubs = data.filter((d)=>d.Year == year);
			for (var p = 0; p<pubs.length; p++){

				authors_project = pubs[p].Authors.split(",");
				var authorList_pub = [];
				for (var a = 0; a<authors_project.length;  a++){
					author = authors_project[a].trim()
					if (!(author in authors_dict)){
						authors_dict[author] = ["p"+pubs[p].ID];
					}else{
						authors_dict[author].push("p"+pubs[p].ID);
					}
					authorList_pub.push(authorIDs[author]);
				}
				
				keywords_project = pubs[p].Keywords.split(";");
				var keyList_pub = [];
				for (var a = 0; a<keywords_project.length;  a++){
					keyword = keywords_project[a].trim();
					if (!(keyword in keyword_dict)){
						keyword_dict[keyword] = [pubs[p].ID];
					}else{
						keyword_dict[keyword].push(pubs[p].ID);
					}
					keyList_pub.push(keyIDs[keyword]);
				}
								
				//append pub node
				pubNodes.push({id: "p"+pubs[p].ID, authors: authorList_pub,  keys: keyList_pub, conference:pubs[p].Conference, year: year});
			}
		}

	var authorList = Object.keys(authors_dict)
	
	// generate author nodes
	var authorNodes = [];
	for (var a = 0; a <authorList.length; a++){
		authorNodes.push({id: authorIDs[authorList[a]],name:authorList[a], pubs:authors_dict[authorList[a]]})
	}
	var keyList = Object.keys(keyword_dict);
	var keyNodes = [];
	for(var k = 0; k< keyList.length; k++){
		if (keyword_dict[keyList[k]].length >1){
			keyNodes.push({id: keyIDs[keyList[k]], name: keyList[k], pubs:keyword_dict[keyList[k]]});
			}
	}
	return{
		authorNodes :authorNodes,
		pubNodes: pubNodes,
		keyNodes: keyNodes 
		};	
}

