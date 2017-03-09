var app = new Vue({
	el: '#app',
	data: {
		ciphers: [],
		filter: ''
	},
	computed: {
		filteredCiphers() {
			var self = this
			if (!this.filter){
				return this.ciphers
			}

			var filter = this.filter.trim().toLowerCase();
			return this.ciphers.filter(function(cipher) {
				if(cipher.name.toLowerCase().indexOf(filter) > -1){
	                return cipher;
	            }		
	        })
		}
	},
	methods:{
		goTo: goTo
	}
})

function goTo (name){
	console.log(window.location)
	window.location = '/detail?name=' + name;
}
$.get( "getallciphers", function( data ) {
	var ciphers = [];
	for (var i = 0; i < data.length; i++){
		ciphers.push(JSON.parse(data[i]));
		// console.log(JSON.parse(data[i]));
	}
	//$( ".result" ).html( data );
	app.ciphers = ciphers
});


