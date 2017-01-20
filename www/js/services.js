// Initialize Firebase
// mangan
var config = {
	apiKey: "AIzaSyCQz7kgKgqjOo6ptPdvEGJLxOCBKUPZEoY",
	authDomain: "project-1449647215698534337.firebaseapp.com",
	databaseURL: "https://project-1449647215698534337.firebaseio.com",
	storageBucket: "project-1449647215698534337.appspot.com"
};

// ryou
// var config = {
// 	apiKey: "AIzaSyBvDJSC5qe1AfnNbEZOiqw3GUFjvb4i3go",
//     authDomain: "project-7791088175021720001.firebaseapp.com",
//     databaseURL: "https://project-7791088175021720001.firebaseio.com",
//     storageBucket: "project-7791088175021720001.appspot.com",
// };

// hamzah ManganBak
// var config = {
//     apiKey: "AIzaSyB1U7icSEQX4ZTCdsRHxDUFieD-r7sDFKA",
//     authDomain: "manganbak.firebaseapp.com",
//     databaseURL: "https://manganbak.firebaseio.com",
//     storageBucket: "manganbak.appspot.com",
//     messagingSenderId: "374536724800"
// };

firebase.initializeApp(config);

var kategori = firebase.database().ref('kategori');
var restoran = firebase.database().ref('dataResto');
var menu = firebase.database().ref('dataMenu');
var review = firebase.database().ref('reviewRating');
var search = firebase.database().ref('searching');
var keyword = firebase.database().ref('keywordResto');
var slider = firebase.database().ref('slider');
var promo = firebase.database().ref('promo');
var version = firebase.database().ref('version');
var user = firebase.database().ref('user');
var transaksi = firebase.database().ref('transaksi');
var queue = firebase.database().ref('status').child('queue');

angular.module('app.services', [])

.service('Services', function($q, $localStorage) {
	$localStorage = $localStorage.$default({
		indexes: [],
		maxSaved: 5,
		token: null,
		location: 'Surakarta', // default location,
		indexUser: 'uyehh'
	});

	this.getVersion = function() {
		return promiseAdded(
			version
		);
	}

	this.getCategories = function() {
		return promiseValue(
			kategori.child('jenis')
			);
	}

	this.getRestoranKeyword = function() {
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
			// kategori.child(category).orderByChild('tanggalInput')
			kategori.child(category)
			);
	}

	this.getNewRestorans = function(startDate) {
		return promiseValue(
			restoranKota().orderByChild('tglInput').limitToLast(12)
			);
	}

	this.getAllRestorans = function(startDate) {
		return promiseValue(
			restoranKota().orderByChild('tglInput').endAt(startDate).limitToLast(10)
			);
	}

	this.getRestoranDetails = function(id) {
		return promiseAdded(
			restoranKota().orderByChild('index').equalTo(id)
			);
	}

	this.getRestoranMenus = function(id) {
		return promiseValue(
			menu.child(id)//.orderByChild('priority').equalTo(true)
			);
	}

	this.getRestoranReviews = function(id) {
		return promiseValue(
			review.child(id).orderByChild('tglReview')
			);
	}

		this.getJmlSad = function(id) {
			return promiseValue(
				restoranKota().child(id +'/jmlSad')
				);
		}

		this.getJmlHappy = function(id) {
			return promiseValue(
				restoranKota().child(id +'/jmlHappy')
				);
		}

		this.getJmlFavorite = function(id) {
			return promiseValue(
				restoranKota().child(id +'/jmlFavorite')
				);
		}

	this.getRestoransByLocation = function(lon1, lon2) {
		// console.log(lon1 +' | '+ lon2);
		return promiseValue(
			restoranKota().orderByChild('map/long').startAt(lon1).endAt(lon2)
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

	/////////////////////////////////////////
	//
	// rs-1 = berhasil
	// rs-0 = sudah ada, shouldn't ever happen
	// rs-1 = 
	// rs-0 = max
	//
	//////////////////////////////////////////
	this.saveRestoran = function(id) {
		var promise = $q.defer();

		if($localStorage.indexes.length < 5) {
			if(!this.checkSavedRestoran(id)) {
				$localStorage.indexes.push(id);
				promise.resolve(true);
			} else {
				promise.resolve(false);
			}
		} else {
			promise.reject(false);
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

	this.updateRatingReview = function(resto, user, userPhotoUrl, userRating, titleReview, userReview) {
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

		// 1. ini versi update,jadi 1 user cuma bisa kasih 1 komen,kalo komen lagi yg sebelumnya diupdate
		// review.child(resto +'/'+ user).set({
		// 	'rating': userRating,
		// 	'titleReview': titleReview || null,
		// 	'review' : userReview || null,
		// 	'username': user,
		// 	'userPhotoUrl': userPhotoUrl,
		// 	'tglReview': firebase.database.ServerValue.TIMESTAMP
		// }).then(function() {
		// 	promise.resolve(true);
		// });

		// 2. ini versi add, 1 user bisa nambah komen berapapun
		review.child(resto).push({
			'rating': userRating,
			'titleReview': titleReview || null,
			'review' : userReview || null,
			'username': user,
			'userPhotoUrl': userPhotoUrl,
			'tglReview': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

		this.updateJmlSad = function(resto) {
			var promise = $q.defer();

			restoranKota().child(resto +'/jmlSad').once('value', function(jml) {
				var jmlSad = jml.val();
				if(typeof jmlSad === 'number' && jmlSad >= 1) {
					jmlSad++;
				} else {
					jmlSad = 1;
				}

				restoranKota().child(resto +'/jmlSad').set(jmlSad).then(function() {
					promise.resolve(true);
				});
			});

			return promise.promise;
		}

		this.updateJmlHappy = function(resto, jmlHappy) {
			var promise = $q.defer();

			restoranKota().child(resto +'/jmlHappy').once('value', function(jml) {
				var jmlHappy = jml.val();
				if(typeof jmlHappy === 'number' && jmlHappy >= 1) {
					jmlHappy++;
				} else {
					jmlHappy = 1;
				}

				restoranKota().child(resto +'/jmlHappy').set(jmlHappy).then(function() {
					promise.resolve(true);
				});
			});

			return promise.promise;
		}

		this.updateJmlFavorite = function(resto, jmlFavorite) {
			var promise = $q.defer();

			restoranKota().child(resto +'/jmlFavorite').once('value', function(jml) {
				var jmlFavorite = jml.val();
				if(typeof jmlFavorite === 'number' && jmlFavorite >= 1) {
					jmlFavorite++;
				} else {
					jmlFavorite = 1;
				}

				restoranKota().child(resto +'/jmlFavorite').set(jmlFavorite).then(function() {
					promise.resolve(true);
				});
			});

			return promise.promise;
		}

	this.searchQuery = function(query) {
		var promise = $q.defer();

		var logged = firebase.auth().currentUser;
		if(logged) {
			user.child($localStorage.indexUser +"/search").push({
				'keyword': query,
				'timestamp': firebase.database.ServerValue.TIMESTAMP
			});
		}

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
			restoranKota().orderByChild('keyword').startAt(keyword)//.endAt(keyword)
			);
	}

	this.getSliders = function() {
		return promiseValue(
			slider
		);
	}

	this.getPromos = function() {
		return promiseValue(
			promo
		);
	}

	this.cekUserData = function(email) {
		return promiseValue(
			user.orderByChild('email').equalTo(email)
		)
	}

	this.getProfileByUid = function(uid) {
		return promiseValue(
			user.child(uid)
		)
	}

	this.addUserData = function(dataUser) {
		var promise = $q.defer();

		user.child(dataUser.id).set({
			'index': dataUser.id,
			'email': dataUser.email,
			'fb_id': dataUser.id,
			'name': dataUser.name,
			'photoUrl': dataUser.picture.data.url,
			'device_token' : $localStorage.token,
			'dateRegister': firebase.database.ServerValue.TIMESTAMP,
			'dateUpdatedData': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.updateUserData = function(userData) {
		var promise = $q.defer();

		user.child(userData.index).update({
			'dateUpdatedData' : firebase.database.ServerValue.TIMESTAMP,
			'noTelpUser' : userData.noTelpUser,
			'name' : userData.name,
			'photoUrl' : userData.photoUrl || userData.picture.data.url || userData.picture || null,
			'device_token' : $localStorage.token,
			'lineUsername' : userData.lineUsername
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.updateUserDataFB = function(userData) {
		var promise = $q.defer();

		user.child(userData.id).update({
			'dateUpdatedData' : firebase.database.ServerValue.TIMESTAMP,
			'name' : userData.name,
			'photoUrl' : userData.photoUrl || userData.picture.data.url || null,
			'device_token' : $localStorage.token
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addUserDataByGoogle = function(dataUser) {
		var promise = $q.defer();

		user.child(dataUser.id).set({
			'index': dataUser.id,
			'email': dataUser.email,
			'gpluslink': dataUser.link,
			'name': dataUser.name,
			'photoUrl': dataUser.picture,
			'dateRegister': firebase.database.ServerValue.TIMESTAMP,
			'dateUpdatedData': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addTransaction = function(kurir, idTransaksi, dataTransaksi) {
		var promise = $q.defer();

		transaksi.child(kurir +'/'+ idTransaksi).set({
			'indexUser' : dataTransaksi.indexUser,
			'alamat' : dataTransaksi.alamat,
			'alamatUser' : dataTransaksi.alamatUser,
			'alamatUserDetail' : dataTransaksi.alamatUserDetail || null,
			'feedelivery' : dataTransaksi.feedelivery,
			'indexResto' : dataTransaksi.indexResto,
			'gambarResto' : dataTransaksi.gambarResto,
			'keteranganBuka' :dataTransaksi.keteranganBuka,
			'indexTransaksi' : dataTransaksi.indexTransaksi,
			'jumlah' : dataTransaksi.jumlah,
			'kurir' : dataTransaksi.kurir,
			'map' : {
				'lat' : dataTransaksi.map.lat,
				'long' : dataTransaksi.map.long
			},
			'mapUser' : {
				'lat' : dataTransaksi.mapUser.lat,
				'long' : dataTransaksi.mapUser.long
			},
			'namaResto' : dataTransaksi.namaResto,
			'namaUser' : dataTransaksi.namaUser,
			'noTelpUser' : dataTransaksi.noTelpUser,
			// to not use angular.copy, pleasee use trackby on ng-repeat
			'pesanan' : angular.copy(dataTransaksi.pesanan),
			'status' : dataTransaksi.status,
			'processBy' : dataTransaksi.processBy,
			'tgl' : dataTransaksi.tgl,
			'totalHarga' : dataTransaksi.totalHarga,
			'userPhotoUrl' : dataTransaksi.userPhotoUrl,
			'username' : dataTransaksi.username,
			'lineUsername' : dataTransaksi.lineUsername || null,
			'tambahan' : dataTransaksi.tambahan || null,
			'device_token' : $localStorage.token
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addQueue = function(kurir, idTransaksi) {
		var promise = $q.defer();

		queue.child(kurir +'/'+ idTransaksi).set({
			'indexTransaksi' : idTransaksi
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addHistory = function(index, idTransaksi, kurir) {
		var promise = $q.defer();

		user.child(index +'/transaksi/'+ idTransaksi).set({
			'indexTransaksi' : idTransaksi,
			'kurir' : kurir
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.getHistory = function(index) {
		console.log("nilai index uid : "+index);
		return promiseValue(
			user.child(index +'/transaksi')
		);
	}

	this.getTransaksiDetails = function(kurir, index) {
		return promiseValue(
			transaksi.child(kurir +'/'+ index)
		);
	}

	this.changeStatus = function(kurir, index) {
		var promise = $q.defer();

		transaksi.child(kurir +'/'+ index).update({
			'userCancel' : true,
			'status' : "cancel",
			'statusUserCancel' : firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	// delete entri in queue list
	this.deleteQueue = function(kurir, index) {
		var promise = $q.defer();

		queue.child(kurir +'/'+ index).remove().then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addCancel = function(indexUser, indexTransaksi) {
		var promise = $q.defer();

		user.child(indexUser +'/cancel/'+indexTransaksi).set({
			'indexTransaksi' : indexTransaksi,
			'timestamp' : firebase.database.ServerValue.TIMESTAMP
		})
	}


	// DAFTAR& REKOMENDASI
	this.daftarResto = function(data) {
		var promise = $q.defer();

		firebase.database().ref('daftar').push({
			'namaResto': data.namaResto,
			'namaPemilik': data.namaPemilik,
			'alamat': data.alamat,
			'kontak': data.kontak,
			'namaResto': data.namaResto,
			'namaPemilik': data.namaPemilik,
			'alamat': data.alamat,
			'kontak': data.kontak
		}).then(function() {
			promise.resolve(true)
		});

		return promise.promise;
	}

	this.rekomendasiResto = function(data) {
		var promise = $q.defer();

		firebase.database().ref('rekomendasi').push({
			'namaResto': data.namaResto,
			'alamat': data.alamat,
			'jenis': data.jenis,
			'namaResto': data.namaResto,
			'alamat': data.alamat,
			'jenis': data.jenis
		}).then(function() {
			promise.resolve(true)
		});

		return promise.promise;
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

	function restoranKota()
	{
		// console.log('try get resto');
		// return restoran.child($localStorage.location);
		return restoran;

		//next utk 2 kota
		// if($localStorage.location == 'Surakarta') {
		// 	return firebase.database().ref('dataResto');
		// } else if($localStorage.location == 'Yogyakarta') {
		// 	return firebase.database().ref('dataRestoJogya');
		// }
	}
})

.service('Analytics', function() {

	this.logView = function(viewName) {
		addValue('trackView/'+ viewName);
	}

	this.logEvent = function(category, action, label) {
		if(label)
			addValue('trackEvent/'+ category +'/'+ action +'/'+ label);
		else
			addValue('trackEvent/'+ category +'/'+ action);
	}
	
	function addValue(branch) {
		firebase.database().ref('analytics/'+ branch).once('value', function(_value) {
			var newValue = _value.val();
			// console.log('_value: '+ _value.val());
			if(typeof newValue === 'number' && newValue >= 1) {
				newValue++;
			} else {
				newValue = 1;
			}
			// console.log('newValue: '+ newValue);
			firebase.database().ref('analytics/'+ branch).set(newValue);
		});
	}
})

.service('ManganAds', function() {
	this.getAdsUrl = function() {
		return "img/cat.jpg";
	}
});

