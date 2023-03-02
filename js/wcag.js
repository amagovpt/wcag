console.log('it works');

/* 
Fire a function in case is accessed via browser back button - we re-run the filters! 
This technique via: https://developer.mozilla.org/en-US/docs/Web/API/Window/pageshow_event
*/
addEventListener('pageshow', (event) => { filterSc(); });

/*
Functions in this file 

- initFilters: Runs on page load. Attaches event handlers to filters form
- filterSc: runs when any of the filter checkboxes are toggled and updates which SCs are displayed
- scModal: 
- closeScModal: 
*/


/* 
Set up all of our variables and constants 
*/

// Create and populate array of filters
var filterArray = ['A', 'AA', 'AAA', '20', '21', '22', 'pgDescriptions', 'doclinks']; 

// Define main container: used to attach an event listener onto SC links
const main = document.querySelector('main');

// Node list of all list items in <main>. These each contain an SC link
const scList = document.querySelectorAll('main li');
const scListContainers = document.querySelectorAll('main ul');

// List of all principle and guideline descriptions
const pgList = document.querySelectorAll('main p.pg');

// List of all doclinks
const doclinksList = document.querySelectorAll('main span.doclinks');

// Define counter to be updated when page is filtered
const counterContainer = document.querySelector('#counterContainer');

// Define modal and mask containers
const mask = document.querySelector('#mask');
const modal = document.querySelector('#modal');

// Get nodelist of ALL links in <main> to be used in our live search
// const scLinksNodeList = document.querySelectorAll("main a");

// List of all checkboxes in header for filtering by
const checkboxList = document.querySelectorAll('header input[type="checkbox"]');

// Get live filter textbox
const liveFilter = document.querySelector('#liveFilter');

// Define a string to display above empty lists
const emptyListPara = document.createElement('p');
emptyListPara.classList.add('emptyListPara');
emptyListPara.textContent = "No success criteria match current filters";

// Define list of all elements that are collapsible buttons e.g. buttons with class of collapsible
// Add event handler to all these elelemnts
const collapsibles = document.querySelectorAll('button.collapsible');


/*
Initialise page
*/

// Add event handlers to the page filters
initFilters();

// Add click event handler to all sc links
// This is used to prevent the default link action and instead open a modal dialog
//main.addEventListener("click", scModal, false);


/*
function initFilters
====================
Add event listeners to the filter form and live input text field
And hide submit button
*/
function initFilters() {

  const filterForm = document.querySelector('form.filter');
  filterForm.addEventListener("change", filterSc, false);

  const filterSubmit = document.querySelector('#filterSubmit');
  //filterSubmit.classList.add('hidden');
  filterSubmit.hidden = "true";
  
  liveFilter.addEventListener("keyup", filterSc, false);

  // Now  call filterSc function to set initial count
  filterSc();
  console.log('filters applied!');
  console.log(filterArray);
  };


/*
Function: filterSc
==================
This is fired when the state of any of the filter checkboxes is changed
OR a user enters text into the live filter text box
This function then filters all of the SCs on the page according to selected filters
It further updates the count of the total number of displayed success criteria
*/
function filterSc() {

  // First reset the array! 
  filterArray = [];

  // Now populate it to match the selected filters on the page
  checkboxList.forEach(
    function(checkbox) {

      // If checked == true, then checkbox is checked so add to the filter array
      if (checkbox.checked) {
        filterArray.push(checkbox.name);
      console.log(checkbox.name);
      }
    }
  )

 
  // Now to get the filter text from the text box
  // liveFilterString = liveFilter.value.replace(/\W /g, '');
  liveFilterString = liveFilter.value.replace(/[\W_]+/g," ");

  // Now to update the filtered live string back onto the page to remove any non alpha characters
  liveFilter.value = liveFilterString;
  
  // Declare an empty count variable
  var counter = 0;

  // Loop through all links and Filter them according to any selected filters
  scList.forEach(
    function(sc) {

      // Get version and level
      var classes = Array.from(sc.classList);
      var level = classes[0];
      var version = classes[1].replaceAll('.', '');
      
      // For each SC list item, we hide it if
      // - the version is not in the filter array
      // - the level is not in the filter array
      // - the filterstring is not contained within the text content of the list item

      if (filterArray.includes(level) && filterArray.includes(version) && sc.textContent.toLowerCase().includes(liveFilterString.toLowerCase())) {

        // Show this list element e.g. remove hidden class
        sc.hidden = "";

        // Increment the counter
        counter++;
      } else {
        // Otherwise, hide the SC
        sc.hidden = "true";

        // Future improvement: if all children of a list of SCS are hidden, then hide the parent <ul> element
      }

      // Now to also check whether highlight new checkbox is checked. If so, add a class to all version 2.2 SCs
      if (filterArray.includes('highlightNew') && version == "22") {
        sc.classList.add("highlight");
      } else {
        sc.classList.remove("highlight");
      }

    });

    

    // Check if pgDescriptions should be visible; loop through them and toggle visibility accordingly
    if (filterArray.includes('pgDescriptions')) {
      for (i = 0; i < pgList.length; i++) {
        pgList[i].hidden = "";
      }
    } else {
      for (i = 0; i < pgList.length; i++) {
        pgList[i].hidden = "true";
      }
    }

    // Check if readmore links should be visible; loop through them and toggle visibility accordingly
    if (filterArray.includes('doclinks')) {
      for (i = 0; i < doclinksList.length; i++) {
        doclinksList[i].hidden = "";
      }
    } else {
      for (i = 0; i < doclinksList.length; i++) {
        doclinksList[i].hidden = "true";
      }
    }

    // Let's hide any empty lists that may have resulted from the filtering
    hideEmptyLists();

    // Let's also display the filter strings and results count
    counterContainer.textContent = outputFilterString(counter);


 
  }

/*
Function: outputFilterString
==================
Turns filter array into a string to display on page of the format
Showing X results filtered by WCAG versions 2.0, 2.1, at levels A, AA, with filter text "focu" 

Takes global filterArray variable and parses it to convert to a string as above
*/

function outputFilterString(count) {

  // Parse the filter array

  var outputFilterString = "Showing " + count + " success criteria. Filtering by: ";

  // Set our flags for this loop to track when we have added descriptors like: levels, filters
  var levelFlag = false;
  var versionFlag = false;

  // Need to create string for levels and versions 
  filterArray.forEach(function(filter) {

    // Check if filter var is a level
    if (filter == "A" || filter == "AA" || filter == "AAA") {

      // Now only add this descriptor prefix if we haven't already!
      if (!levelFlag) {
        outputFilterString += " levels ";
        levelFlag = true;
      }

      // Now add the level!
      outputFilterString += filter + ", ";

      //console.log('Level variables found!');
    }

    // Check if filter var is a version
    if (filter == "20" || filter == "21" || filter == "22") {

      // Now only add this descriptor prefix if we haven't already!
      if (!versionFlag) {
        outputFilterString += " versions ";
        versionFlag = true;
        }

      // Now add the version!
      // Remembering that versions are stored as 2 digit numbers; need to add a period to make them 2.0, 2.1 etc. 
      filterAddedPeriod = filter.substring(0,1) + "." + filter.substring(1,2);
      outputFilterString += filterAddedPeriod + ", ";
    }

  });
  
  // Check if filtering via text input
  if (liveFilterString.length > 0) {
    console.log('Filtering by text: ')
    outputFilterString += "and containing text " + liveFilterString;
  } else {
    // Remove trailling comma on existing string!
    outputFilterString = outputFilterString.substring(0, outputFilterString.length - 2);
  }

  // Need to create string for versions (and add in periods etc)


  // outputFilterString = "Using filters: " + filterArray.toString() + "There are " + count + "results";

  // Ideal string: Filtering by levels A, AA, AAA, versions 2.0, 2.1, 2.2, filter text XYZ, highlighting 2.2 SCs

  // So need to detect if ANY levels and include that heading BEFORE the levels
  // Need to detect if ANY versions and include that heading BEFORE the versions (but only once!)
  // Need to detect if any filter text AND include that 
  return outputFilterString;
}



/*
Function: hideEmptyLists
==================
Loops through all unordered list elements on the page. 
If every child element is hidden, then adds hidden to the parent element
*/
function hideEmptyLists() {

  // First remove all existing empty list paragraphs; these are all p.emptyListPara
  var emptyListParas = document.querySelectorAll('p.emptyListPara');
  emptyListParas.forEach(function(para) {
    para.remove();
    
  })

  // Go through all <ul> elements
  scListContainers.forEach(
    function(ul) {
      // Now to loop through each child element e.g. ul.children
      var ulChildren = ul.children;
      
      // Set variable for whether to hide this <ul>
      // This is true by default, but if ANY child <li> elements are visible (e.g. hidden=false) then this gets set to false!
      var ulHide = true;

      for (var i=0; i<ulChildren.length; i++) {
        if (!ulChildren[i].hidden) ulHide = false;
      }

      // Update hidden attribute of parent UL
      ul.hidden = ulHide; 

      // If list is hidden, then include a descriptive paragraph stating that it is empty 
      // because no SCs matched the current filter. This para is the const emptyListPara
      // We have to use cloneNode on it as we add it multiple times!
      if (ulHide) ul.insertAdjacentElement('beforebegin', emptyListPara.cloneNode(true));      
    }

  );

}


/*
function scModal
================
Is called when an SC link is selected
Passes id of selected SC to a PHP file which then retrieves the data 
via MySQL, and displays it in a modal
*/


function scModal(event) {
  // Proceed if the clicked element is a link
  if (event.target.nodeName == "A") {
    console.log('within SC MODAL');
    event.preventDefault();
    // A link was selected
    //console.log('SC ID ' + event.target.id);

    // Get the of the current link. This both determines what SC to open 
    // in the modal, and which link to set focus back to when the modal is closed
    var id = event.target.id;

    // Show modal
    //var mask = document.querySelector('#mask');
    //mask.classList.remove('hidden');

    // Now to call AJAX function to retrieve date
    // and populate modal container
    var url = "sc.php?id=" + id;
    //console.log(url);
    fetch(url)
      .then(response => response.text())
      .then(html => {
        modal.innerHTML = html;
      })

    // Toggle modal container visibility
    mask.classList.remove('hidden');
    // modal.classList.remove('hidden');

    // Add no-scroll class to body
    //document.querySelector('body').classList.add('noscroll');

    // Remove all header, footer, main links from focus AND reading order
    // Adding aria-hidden to hide form reading order
    // Adding inert to hide from focus order
    main.inert = true;

    // Set focus to dialog
    var scClose = document.querySelector('#scClose');
    console.log('Closing ' + scClose);

    // Add event listener on modal background mask

  }
  
}

/*
function closeScModal() 
Closes the modal overlay (hides it)
Returns focus to originating link
Removes noscroll class from body


*/
function closeScModal(id) {

  // Toggle modal container visibility
  mask.classList.add('hidden');

  main.inert = false;
  // set focus back to link that opened modal
  //console.log('setting focus to ' + id);
  document.querySelector('#' + id).focus();

}
