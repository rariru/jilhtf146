// Initialize Firebase
var config = {
	apiKey: "AIzaSyBvDJSC5qe1AfnNbEZOiqw3GUFjvb4i3go",
	authDomain: "project-7791088175021720001.firebaseapp.com",
	databaseURL: "https://project-7791088175021720001.firebaseio.com",
	storageBucket: "project-7791088175021720001.appspot.com",
};
firebase.initializeApp(config);

var restoran = firebase.database().ref('dataResto');
var menu = firebase.database().ref('dataMenu');
var review = firebase.database().ref('review');
var storage = firebase.storage();

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

	this.getImgUrl = function(gambarUrl) {
		storage.refFromURL(gambarUrl).getMetadata().then(function(metadata) {
				// $scope.src = metadata.downloadURLs[0];
				return metadata.downloadURLs[0];
			});
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

