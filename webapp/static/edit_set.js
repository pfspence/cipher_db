

// $.get( "show_entries", function( data ) {
// 	console.log(data);
// });
var app = new Vue({
  el: '#app',
  data: {
    file_infos: []
  }
})

var success = function(filepath){
	
	$.get( "score?filepath=" + encodeURIComponent(filepath), function( data ) {
		var matches = []
		for (var i = 0; i < data.length; i++){
			var match = JSON.parse(data[i]);
			match.score = parseInt(match.score);
			match.character = match.character.split('.')[0];
			matches.push(match);
		}
		console.log(matches)
		var filepathArr = filepath.split('/');
		var filename = filepathArr[filepathArr.length - 1];
		app.file_infos.push({candidate_path: filepath, candidate_name: filename, matches: matches});
	});
}
var error = function(data){
	console.log('error', arguments)
}

$(':button').click(function(){
    var formData = new FormData($('form')[0]);
    $.ajax({
        url: 'upload',  //Server script to process data
        type: 'POST',
        xhr: function() {  // Custom XMLHttpRequest
            var myXhr = $.ajaxSettings.xhr();
            // if(myXhr.upload){ // Check if upload property exists
            //     myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
            // }
            return myXhr;
        },
        //Ajax events
        success: success,
        error: error,
        // Form data
        data: formData,
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
    });
});



