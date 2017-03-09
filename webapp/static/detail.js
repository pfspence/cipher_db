var app = new Vue({
	el: '#app',
	data: {
		index: 0,
		ciphers: [],
		cipher: {},
		text: '',
		textArray: [],
		fontSize: 40,
		kerning: 0,
		vertAlign: 'top',
		useAlternate: false
	},
	methods: {
		goNext: goNext,
		goPrev: goPrev,
		updateText: updateText,
		addLetter: addLetter
	}
})

function goNext(event){
	app.index++;
	app.cipher = app.ciphers[app.index % app.ciphers.length];
}
function goPrev(event){
	app.index--;
	if (app.index < 0){
		app.index = app.ciphers.length -1;
	}
	app.cipher = app.ciphers[app.index % app.ciphers.length];
}
function updateText(event){
	console.log(app.cipher.name)
	app.textArray = app.text.split('');	
	var symbols = {
		';': '_semicolon',
		'.': '_period',
		',': '_comma',
		'(': '_parens',
		')': '_parens',
		'\'': '_sngl_quote',
		'"': '_dbl_quote',
		':': '_colon',
		' ': '_space',
		'&': '_and',
		'!': '_exclamation',
		'#': '_number_indicator'
	}

	app.textArray = app.textArray.map(function(x){
		x = app.useAlternate ? '_' + x : x;
		x = symbols[x] ? symbols[x] : x;
		
		return {
			name: x,
			path: app.cipher.name + '/' + x + '.jpg'
		}
	})
}
function addLetter(letter){
	var symbols = {
		'_semicolon': ';',
		'_period': '.',
		'_full_stop': '.',
		'_comma': ',',
		'_parens': '(',
		'_sngl_quote': '\'',
		'_dbl_quote': '"',
		'_colon': ':',
		'_question': '?',
		'_space': ' ',
		'_and': '&',
		'_exclamation': '!',
		'_number_indicator': '#'

	}
	letter = symbols[letter] ? symbols[letter] : letter;
	letter = letter[0] == '_' ? letter.slice(1) : letter;

	app.text += letter;
	 $('#customText').focus();
}



var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


$.get( "getallciphers", function( data ) {
	var ciphers = [];
	for (var i = 0; i < data.length; i++){
		ciphers.push(JSON.parse(data[i]));
	}
	//$( ".result" ).html( data );
	var name = getUrlParameter('name');

	for(var i = 0; i < ciphers.length; i++){
		if (ciphers[i].name === name){
			app.index = i;
		}
	}

	app.ciphers = ciphers;
	app.cipher = ciphers[app.index];
});