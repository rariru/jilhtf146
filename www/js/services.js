// Initialize Firebase
var config = {apiKey: "AIzaSyCQz7kgKgqjOo6ptPdvEGJLxOCBKUPZEoY",
authDomain: "project-1449647215698534337.firebaseapp.com",
databaseURL: "https://project-1449647215698534337.firebaseio.com",
storageBucket: "project-1449647215698534337.appspot.com",};

firebase.initializeApp(config);

var kategori = firebase.database().ref('kategori');
var restoran = firebase.database().ref('dataResto');
var menu = firebase.database().ref('dataMenu');
var review = firebase.database().ref('reviewRating');
var search = firebase.database().ref('searching');
var keyword = firebase.database().ref('keywordResto');

angular.module('app.services', [])

.service('Services', function($q, $localStorage) {
	$localStorage = $localStorage.$default({
		indexes: [],
		maxSaved: 5
	});

	this.getCategories = function() {
		return promiseValue(
			kategori.child('jenis')
			);
	}

	this.getRestoranKeyword = function(key) {
		return promiseValue(keyword);
	}

	this.getRestoranCategory = function(category) {
		// var promise = $q.defer();

		// console.log(category);
		// firebase.database().ref('dataResto').orderByChild('kategori').startAt(category).on('value', function(data) {
		// 	promise.resolve(data.val());
		// 	console.log(data.val());
		// });

		// return promise.promise;
		return promiseValue(
			kategori.child(category).orderByChild('tanggalInput')
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
			firebase.database().ref('reviewRating/'+ id).orderByChild('tglReview')
			);
	}

	this.getSavedRestorans = function() {
		// for testing purpose
		// if($localStorage.indexes.length === 0) {
		// 	$localStorage.indexes.push('resto1');
		// }


		// var promise = $q.defer();

		// var indexes = $localStorage.indexes;
		// if(indexes) {
		// 	promise.resolve(indexes);
		// } else {
		// 	promise.reject(null);
		// 	console.log("Error fetch data");
		// }

		// return promise.promise;


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
		var promise = $q.defer();

		if($localStorage.indexes.length < 5 && !this.checkSavedRestoran(id)) {
			$localStorage.indexes.push(id);
			if(this.checkSavedRestoran(id)) {
				promise.resolve(true);
			} else {
				promise.reject(false);
			}
		} else {
			promise.resolve(false);
		}

		return promise.promise;

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
	}

	this.deleteRestoran = function(id) {
		var promise = $q.defer();

		$localStorage.indexes.splice($localStorage.indexes.indexOf(id), 1);
		if(!this.checkSavedRestoran(id)) {
			promise.resolve(true);
		} else {
			promise.reject(false);
		}

		return promise.promise;
	}

	this.getRatingReview = function(resto, user) {
		console.log('try get ratrev');
		// return promiseAdded(
		// 	review.child(resto +'/'+ user)
		// 	);

		var promise = $q.defer();

		firebase.database().ref('reviewRating/'+ resto +'/'+ user).on('value', function(data) {
			promise.resolve(data.val());
			console.log(data.val().review);
		});

		return promise.promise;
	}

	this.updateRatingReview = function(resto, user, userRating, userReview) {
		// this.getRestoranReviews(resto).then(function(result) {
		// 	var ratingReviews = result;
		// 	console.log(ratingReviews);
		// 	var newRR = {
		// 		'rating': userRating,
		// 		'review': userReview || null,
		// 		'reviewer': user
		// 	};
		// 	ratingReviews.push(newRR);
		// 	console.log(ratingReviews);

			
		// 	var promise = $q.defer();

		// 	review.child(resto).set(ratingReviews).then(function() {
		// 		promise.resolve(true);
		// 	});

		// 	return promise;
		// });

		var promise = $q.defer();

		review.child(resto +'/'+ user).set({
			'rating': userRating,
			'review' : userReview || null,
			'reviewer': user,
			'tglReview': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.searchQuery = function(query) {
		var promise = $q.defer();

		search.child('all').push({
			'keyword': query,
			'timestamp': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.searchRestorans = function(keyword) {
		return promiseValue(
			restoran.orderByChild('keyword').startAt(keyword)//.endAt(keyword)
			);
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

