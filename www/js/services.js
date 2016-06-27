// Initialize Firebase
var config = {
	apiKey: "AIzaSyCQz7kgKgqjOo6ptPdvEGJLxOCBKUPZEoY",
    authDomain: "project-1449647215698534337.firebaseapp.com",
    databaseURL: "https://project-1449647215698534337.firebaseio.com",
    storageBucket: "project-1449647215698534337.appspot.com",
};
firebase.initializeApp(config);

var restoran = firebase.database().ref('dataResto');
var menu = firebase.database().ref('dataMenu');
var review = firebase.database().ref('reviewRating');

angular.module('app.services', [])

.service('Services', function($q, $localStorage) {
	$localStorage = $localStorage.$default({
		indexes: [],
		maxSaved: 5
	});

	this.getRestoranCategory = function(category) {
		// var promise = $q.defer();

		// console.log(category);
		// firebase.database().ref('dataResto').orderByChild('kategori').startAt(category).on('value', function(data) {
		// 	promise.resolve(data.val());
		// 	console.log(data.val());
		// });

		// return promise.promise;
		return promiseValue(
			restoran.orderByChild('kategori')
			);
	}

	this.getRestoranDetails = function(id) {
		return promiseAdded(
			restoran.orderByChild('index').equalTo(id)
			);
	}

	this.getRestoranMenus = function(id) {
		return promiseValue(
			menu.child(id)
			);
	}

	this.getRestoranReviews = function(id) {
		return promiseValue(
			review.child(id)
			);
	}

	this.getSavedRestorans = function() {
		// for testing purpose
		// if($localStorage.indexes.length === 0) {
		// 	$localStorage.indexes.push('resto1');
		// }
		return $localStorage.indexes;
	}

	this.checkSavedRestoran = function(id) {
		// for below IE9. Dude, we use mobile.
		// for(var i=0; i<$localStorage.indexes.length; i++) {
		// 	if(id === $localStorage.indexes[i]) {
		// 		return true;
		// 	}
		// } return false;
		if($localStorage.indexes.indexOf(id) >= 0) {
			return true;
		} return false;
	}

	this.saveRestoran = function(id) {
		if($localStorage.indexes.length < 5 && !this.checkSavedRestoran(id)) {
			// isSaved = false;
			// for(var i=0; i<$localStorage.indexes.length; i++) {
			// 	if(id === $localStorage.indexes[i]) {
			// 		isSaved = true;
			// 		break;
			// 	}
			// }

			// if(!isSaved) {
			// 	$localStorage.indexes.push(id);
			// 	return true;
			// }
			$localStorage.indexes.push(id);
			return true;
		} return false;
	}

	this.deleteRestoran = function(id) {
		$localStorage.indexes.splice($localStorage.indexes.indexOf(id), 1);
	}



	function promiseAdded(obj) {
		var promise = $q.defer();

		obj.on('child_added', function(data) {
			promise.resolve(data.val());
			// console.log(data.val());
		}, function(err) {
			promise.reject(null);
			console.log("Error fetch data");
		});

		return promise.promise;
	}

	function promiseValue(obj) {
		var promise = $q.defer();

		obj.on('value', function(data) {
			promise.resolve(data.val());
			// console.log(data.val());
		}, function(err) {
			promise.reject(null);
			console.log("Error fetch data");
		});

		return promise.promise;
	}
});

