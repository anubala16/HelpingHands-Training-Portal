/**
 * This file is the logic for EditTrainging.handlebars
 * It is used to hide and show different content in the modal for the page.
 */

 //This shows/hides the inputs for different page types based on a drop down menu
$(document).ready(function () {
  $('.pages').hide();
  $('#quiz').show();
  $('#pageType').change(function () {
    $('.pages').hide();
    $('#'+$(this).val()).show();
  })
});

 //This shows/hides the inputs for different question types based on a drop down menu
//Only relevant if the Quiz type of page is already selected
 $(document).ready(function () {
  $('.question').hide();
  $('#multChoice').show();
  $('#questionType').change(function () {
    $('.question').hide();
    $('#'+$(this).val()).show();
  })
});


/**
 * The following functions are only relevant if a Timeline Page is selected.
 */

//This shows/hides the inputs for dates based on a checkbox
//If the "event" is the Title Page of the Timeline, no Date Object is needed
$(document).ready(function () {
  $('#titleCheck').change(function () {
      if (!this.checked) 
         $('#dateObj').show('slow');
      else 
          $('#dateObj').hide('slow');
  });
});

//This shows/hides the inputs for text based on a checkbox
$(document).ready(function () {
  $('#textObj').hide();
  $('#textCheck').change(function () {
      if (this.checked) 
         $('#textObj').show('slow');
      else 
          $('#textObj').hide('slow');
  });
});

//This shows/hides the inputs for media based on a checkbox
$(document).ready(function () {
  $('#mediaObj').hide();
  $('#mediaCheck').change(function () {
      if (this.checked) 
         $('#mediaObj').show('slow');
      else 
          $('#mediaObj').hide('slow');
  });
});

//This shows/hides the inputs for link to media based on a radio buttons
$(document).ready(function() {
  $('#mediaLocal').hide();
  $("input[name$='mediaLink']").click(function() {
      var mediaID = $(this).val();
      $(".mediaLink").hide();
      $("#" + mediaID).show();
  });
});

$(document).ready(function() {
  $('#saveEvent').click(function() {
    $('#mediaObj').hide('slow');
    $('#textObj').hide('slow');
    $('#dateObj').show('slow');
  })
});