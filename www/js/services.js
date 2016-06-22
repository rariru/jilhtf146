// Initialize Firebase
var config = {
	apiKey: "",
	authDomain: "",
	databaseURL: "",
	storageBucket: "",
};
firebase.initializeApp(config);

var restoran = firebase.database().ref('dataResto');
var menu = firebase.database().ref('dataMenu');
var review = firebase.database().ref('review');



angular.module('app.services', [])

.service('Services', function($q) {
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

