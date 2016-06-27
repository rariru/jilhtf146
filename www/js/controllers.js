var category = {
	POPULER: 'Populer',
	TEMPAT_BARU: 'Tempat Baru',
	OLEH_OLEH: 'Oleh-oleh',

	KHAS_SOLO: 'Khas Solo',
	NASI: 'Nasi',
	BAKSO_SUP_MIE: 'Bakso, Sup & Mie',
	WEDANGAN: 'Wedangan',
	SATE_GULAI: 'Sate & Gulai',
	MARTABAK: 'Martabak',
	MINUMAN_KHAS: 'Minuman Khas',
	CAFE_RESTO: 'Cafe & Resto'
};

angular.module('app.controllers', [])

.controller('restoransCtrl', function($scope, $stateParams, Services, $ionicLoading, $ionicPopup, $ionicTabsDelegate) {
	$ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner>'
    });

	$scope.category = $stateParams.category;
	switch($scope.category) {
		default: {
			Services.getRestoranCategory($scope.category).then(function(restorans) {
				if(restorans) {
					$scope.restorans = restorans;
					console.log('success');
					// console.log($scope.restorans);
				} else {
					$scope.restorans = null;
					console.log('failure');
				}

				$ionicLoading.hide();
			}, function(reason) {
				$scope.restorans = null;
				console.log('error');

				$ionicLoading.hide();
			});
		} break;
	}

	$scope.saveRestoran = function(index) {
		if(Services.checkSavedRestoran(index)) {
			$ionicPopup.confirm({
				template: 'Apakah Anda yakin ingin menghapus restoran ini?',
				okText: 'Hapus',
				cancelText: 'Batal',
				okType: 'button-assertive'
			}).then(function(res) {
				if(res) {
					Services.deleteRestoran(index);
					$ionicPopup.alert({
						template: 'Restoran berhasil dihapus',
						okText: 'OK',
						okType: 'button-balanced'
					});
				}
			});
		} else {
			if(Services.saveRestoran(index)) {
				$ionicPopup.confirm({
					template: 'Restoran berhasil disimpan',
					okText: 'Lihat tersimpan',
					cancelText: 'Tutup',
					okType: 'button-balanced'
				}).then(function(res) {
					if(res) {
						// $state.go('tabsController.tersimpan');
						$ionicTabsDelegate.select(1);
					}
				});
			} else {
				$ionicPopup.alert({
					template: 'Gagal menyimpan restoran',
					okText: 'OK',
					okType: 'button-balanced'
				});
			}
		}
	}

	$scope.shareRestoran = function(index) {
		console.log('share: '+ index);
	}
})

.controller('restoranCtrl', function($scope, $stateParams, Services, $ionicLoading, $ionicModal) {
	$ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner>'
    });
// console.log("index:'"+ $stateParams.index +"'");

	$scope.restoran = null;
	$scope.menus = null;
	$scope.reviews = null;

	Services.getRestoranDetails($stateParams.index).then(function(restoran) {
		if(restoran) {
			$scope.restoran = restoran;
			// console.log(restoran);

			Services.getRestoranMenus($stateParams.index).then(function(menus) {
				if(menus) {
					$scope.menus = menus;

					Services.getRestoranReviews($stateParams.index).then(function(reviews) {
						if(reviews) {
							for(var i=0; i<reviews.length; i++) {
								if(reviews[i].review == undefined || reviews[i].review == null) {
									reviews.splice(i, 1);
								}
							}
							$scope.reviews = reviews;

							console.log('success');
						} else {
							console.log('failure');
						}
					});
				} else {
					console.log('failure');
				}
			});
		} else {
			console.log('failure');
		}

		$ionicLoading.hide();
	}, function(reason) {
		$scope.restoran = null;
		console.log('error');

		$ionicLoading.hide();
	});

	
	///////////////////////////////////////////////////////////
	//
	// RATING SECTION
	//
	///////////////////////////////////////////////////////////
	$scope.ratingsObject = {
		iconOn: 'ion-ios-star',
		iconOff: 'ion-ios-star-outline',
		iconOnColor: 'orangered',
		iconOffColor: 'grey',
		rating: 5,
		minRating: 1,
		callback: function(rating) {
			$scope.ratingsCallback(rating);
		}
	};

	$scope.ratingsCallback = function(rating) {
		console.log('Select', rating);
	};


	///////////////////////////////////////////////////////////
	//
	// MODAL SECTION
	//
	///////////////////////////////////////////////////////////
	$ionicModal.fromTemplateUrl('templates/ulasanResto.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.modalReview = modal; });

	$ionicModal.fromTemplateUrl('templates/ulasanMenu.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalMenu = modal; });

	$ionicModal.fromTemplateUrl('templates/rating.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalRating = modal; });

	$scope.openReview = function() {
		$scope.modalReview.show();
	};

	$scope.closeReview = function() {
		$scope.modalReview.hide();
	};

	$scope.openMenu = function(index) {
		$scope.selectedMenu = $scope.menus[index];
		console.log($scope.selectedMenu);
		$scope.modalMenu.show();
	};

	$scope.closeMenu = function() {
		$scope.modalMenu.hide();
	};

	$scope.openRating = function() {
		$scope.modalRating.show();
	}
})

.controller('menusCtrl', function($scope, $stateParams, Services, $ionicModal) {

	Services.getRestoranMenus($stateParams.index).then(function(menus) {
		if(menus) {
			$scope.menus = menus;
		} else {
			console.log('failure');
		}
	});

	$ionicModal.fromTemplateUrl('templates/ulasanMenu.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalMenu = modal; });

	$scope.openMenu = function(index) {
		$scope.selectedMenu = $scope.menus[index];
		console.log($scope.selectedMenu);
		$scope.modalMenu.show();
	};
})
  
.controller('jelajahCtrl', function($scope) {

})
   
.controller('tersimpanCtrl', function($scope, Services, $ionicPopup, $state) {
	$scope.category = 'Tersimpan';
	var savedRestorans = [];
	$scope.restorans = [];

	$scope.$on('$ionicView.enter', function() {
		var temp = Services.getSavedRestorans();
		savedRestorans = temp.slice(0);
		savedRestorans.reverse();
		// console.log(savedRestorans.length +" | "+ temp.length);
		// if(savedRestorans.length !== temp.length) {
		// 	updateSavedRestorans(temp);
		// } else {
		// 	var diff = false;
		// 	var prev = savedRestorans.slice(0);
		// 	var next = temp.slice(0);
		// 	prev.sort();
		// 	next.sort();

		// 	for(var i=0; i<prev.length; i++) {
		// 		if(prev[i] !== next[i]) {
		// 			updateSavedRestorans(temp);
		// 			break;
		// 		}
		// 	}
		// }

		updateSavedRestorans(savedRestorans);
	});

	$scope.saveRestoran = function(index) {
		$ionicPopup.confirm({
			template: 'Apakah Anda yakin ingin menghapus restoran ini?',
			okText: 'Hapus',
			cancelText: 'Batal',
			okType: 'button-assertive'
		}).then(function(res) {
			if(res) {
				Services.deleteRestoran(index);
				$ionicPopup.alert({
					template: 'Restoran berhasil dihapus',
					okText: 'OK',
					okType: 'button-balanced'
				}).then(function() {
					$state.go($state.current, {}, {reload: true});
				});
			}
		});
	}

	$scope.shareRestoran = function(index) {
		console.log('share: '+ index);
	}



	function updateSavedRestorans(news) {
		console.log('update');
		savedRestorans = news;
		$scope.restorans = [];
		for(var i=0; i<news.length; i++) {
			Services.getRestoranDetails(news[i]).then(function(restoran) {
				if(restoran) {
					$scope.restorans.push(restoran);
					// console.log(restoran);
					console.log('success');
				} else {
					console.log('failure');
				}
			}, function(reason) {
				console.log(reason);
				console.log('error');
			});
		}
		// console.log($scope.restorans);
	}
})
   
.controller('populerCtrl', function($scope) {

})
         
.controller('selatViensCtrl', function($scope) {

})
   
.controller('transaksiCtrl', function($scope) {

})
   
.controller('pengaturanCtrl', function($scope) {

})
   
.controller('profilCtrl', function($scope) {

})
   
.controller('menuSelatViensCtrl', function($scope) {

})
   
.controller('invoiceCtrl', function($scope) {

})
   
.controller('kategoriCtrl', function($scope) {

})

.controller('petaCtrl', function($scope, $state, $stateParams, Services, $cordovaGeolocation, $ionicPopup) {

	console.log($stateParams.index);
	
	Services.getRestoranDetails($stateParams.index).then(function(restoran) {
		if(restoran) {
			$scope.restoran = restoran;
			var options = {timeout: 10000, enableHighAccuracy: true};

			var restoLat = restoran.map.lat;
			var restoLng = restoran.map.long;

			var latLng = new google.maps.LatLng(restoLat, restoLng); 
			console.log(restoran.map.lat);
			console.log(restoran.map.long); 

			var mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			$scope.map = new google.maps.Map(document.getElementById("mangan-peta"), mapOptions);
			//Wait until the map is loaded
			google.maps.event.addListenerOnce($scope.map, 'idle', function(){
				var marker = new google.maps.Marker({
					map: $scope.map,
					animation: google.maps.Animation.DROP,
					position: latLng,
					icon: 'img/marker.png'
				});

				var contentString = '<p><b>'+restoran.namaResto+'</b></p>';

				var infoWindow = new google.maps.InfoWindow({
					content: contentString
				});

				google.maps.event.addListener(marker, 'click', function () {
					infoWindow.open($scope.map, marker);
				});

				infoWindow.open($scope.map, marker);
			});

			$scope.openUrl = function() {
				$cordovaGeolocation.getCurrentPosition(options).then(function(position){
					var lat = position.coords.latitude;
					var lng = position.coords.longitude;
					window.open('http://maps.google.com/maps?saddr=+'+lat+'+,+'+lng+'+&daddr=+'+restoLat+'+,+'+restoLng+'+&dirflg=d', '_system', 'location=yes');
					// window.open('geo:'+lat+','+lng+'?q=-7.5664551,110.8061434(Ralana Eatery)', '_system', 'location=yes');
					return false;
				}, function(error){
					// console.log("Could not get location");
					$ionicPopup.alert({
						title: 'Error',
						template: 'Could not get location',
						okText: 'OK',
						okType: 'button-balanced'
					});
				});
			}

		} else {
			console.log('failure');
		}
	}, function(reason) {
		$scope.restoran = null;
		console.log('error');
	});
})
 