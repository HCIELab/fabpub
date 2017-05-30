	// Search inside tag 'search-included'
	var container = document.querySelector('[data-ref="search-included"]');
	
    var inputSearch = document.querySelector('[data-ref="input-tag-search"]');
	var btnSearch = document.querySelector('[data-ref="input-btn-search"]');
	var btnAll = document.querySelector('[data-ref="input-btn-all"]');
	var selectPaper = document.querySelector('[data-ref="select-paper"]');
	var selectYear = document.querySelector('[data-ref="select-year"]');
    var keyupTimeout;

    var mixer = mixitup(container, {
	animation: 
	{
	duration: 350
	},
	callbacks: 
	{
		onMixClick: function() 
		{
			// Reset the search if a filter is clicked
			if (this.matches('[data-filter]')) 
			{
				inputSearch.value = '';
			}
		}
	}
	});
			
	// Set up a handler to listen for "click" events from the search input
	btnSearch.addEventListener('click', function() 
	{
		var searchValue;

		searchValue = selectPaper.value.toLowerCase().trim() + " " + selectYear.value.toLowerCase().trim();
		filterByString(searchValue);
	});

	// Set up a handler to listen for "click" events from the search input
	btnAll.addEventListener('click', function() 
	{
		mixer.filter('all');
	});
	
	// Set up a handler to listen for "keyup" events from the search input
	inputSearch.addEventListener('keyup', function() 
	{
		var searchValue;
		if (inputSearch.value.length < 2) 
		{
			// If the input value is less than 2 characters, don't send
			searchValue = '';
		} 
		else 
		{
			searchValue = inputSearch.value.toLowerCase().trim();
		}
		
		// Very basic throttling to prevent mixer thrashing. Only search
		// once 350ms has passed since the last keyup event
		clearTimeout(keyupTimeout);
		keyupTimeout = setTimeout(function() {
		filterByString(searchValue);
		}, 350);
	});
			
	/**
	* Filters the mixer using a provided search string, which is matched against
	* the contents of each target's "class" attribute. Any custom data-attribute(s)
	* could also be used.
	*
	* @param  {string} searchValue
	* @return {void}
	*/

	function filterByString(searchValue) 
	{
		if (searchValue) 
		{
			// Use an attribute wildcard selector to check for matches
			mixer.filter('[class*="' + searchValue + '"]');
		} 
		else 
		{
			// If no searchValue, treat as filter('all')
			mixer.filter('all');
		}
	}