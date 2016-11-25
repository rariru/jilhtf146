angular.module('app.controllers', [])

.controller('main', function($scope, $stateParams, $localStorage) {
	$localStorage.badge = 0;
	$scope.badge = $localStorage.badge;
})

.controller('restoransCtrl', function($scope, $stateParams, Services, $ionicLoading, $cordovaToast, $ionicTabsDelegate, $cordovaSocialSharing, $timeout) {
	var loadFlag = false;
	$scope.nodata = false;
	$scope.notersimpan = false;
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		$scope.nodata = true;
    		makeToast('Koneksi tidak stabil');
    		console.log('timeout');
    	}
    }, 10000);

	// $ionicLoading.show({
 //      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
 //      duration: 10000
 //    });

	$scope.category = $stateParams.name;

	var category = $stateParams.category;
	var flag = new Date().getTime();
	var flag2 = flag;
	var failCounter = 0;
	// $scope.restorans = [];

	$scope.$on('$ionicView.enter', function() {
		analytics.trackView('Kategori '+$scope.category);
		console.log('trackView, Kategori, '+$scope.category);
		analytics.trackEvent('Kategori', 'Kategori Kuliner', $scope.category, 5);
		console.log('trackEvent, Kategori Kuliner, '+$scope.category);

		failCounter = 0;
	});

	$scope.getRestorans = function() {
		loadFlag = false;
		$scope.nodata = false;
		$scope.notersimpan = false;
		// $scope.nodata = false;
		// $scope.notersimpan = false;
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	    });

	    $timeout(function() {
	    	$ionicLoading.hide();
	    	if(!loadFlag) {
	    		$scope.nodata = true;
	    		makeToast('Koneksi tidak stabil');
	    		console.log('timeout - reload');
	    	}
	    }, 10000);

		flag = new Date().getTime();
		flag2 = flag;
		failCounter = 0;
	    
		loadResto();
	}

	loadResto();

	$scope.saveRestoran = function(index) {
		if(Services.checkSavedRestoran(index)) {
			Services.deleteRestoran(index).then(function() {
				analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
				console.log('trackEvent, Hapus Simpan, '+index);
				makeToast('Restoran telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					analytics.trackEvent('Simpan Kuliner', 'Simpan', index, 5);
					console.log('trackEvent, Simpan, '+index);
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not ever happen.');
				}
			}, function(reason) {
				analytics.trackEvent('Simpan Kuliner', 'Simpan Penuh');
				console.log('trackEvent, Simpan Penuh');
				makeToast('Penyimpanan restoran penuh (max. 5)', 1500, 'bottom');
			});
		}
	}

	$scope.shareRestoran = function(index) {
		/////////////////////////////////////////////////////////////////////
		//
		// get data resto
		//
		//////////////////////////////////////////////////////////////////////
		var resto = null;
		for(var id in $scope.restorans) {
			// console.log($scope.restorans[id].index +" | "+ index)
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}

		var link = 'Kunjungi mobilepangan.com untuk download aplikasinya.';
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto;

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			analytics.trackEvent('Share', 'Share Kuliner', index);
			makeToast('Berhasil membagikan', 1500, 'bottom');
			console.log('trackEvent, Share, '+index);
		}, function(err) {
			analytics.trackEvent('Error', 'Share', index, 5);
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});
	}

	$scope.checkSavedRestoran = function(index) {
		// if(Services.checkSavedRestoran(index)) {
		// 	return true;
		// } else {
		// 	return false;
		// }
		return Services.checkSavedRestoran(index);
	}

	$scope.loadMoreResto = function() {
		// console.log("nyanyaa");
		loadResto();
	}

	$scope.canLoadResto = function() {
		return (failCounter < 3);
	}

	function loadResto() {
		switch(category) {
			case 'terbaru': {
				// console.log(category);
				Services.getNewRestorans(flag).then(function(restorans) {
					if(restorans) {
						loadFlag = true;

						$scope.restorans = restorans;

						$ionicLoading.hide();
						$scope.$broadcast('scroll.refreshComplete');

					}
				}, function(reason) {
					console.log('error fetch data');
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.refreshComplete');
				}).finally(function() {
					$scope.$broadcast('scroll.refreshComplete');
				});

				failCounter = 3;
			} break;
			case 'all' : {
				// console.log('halo');
				Services.getAllRestorans(flag).then(function(restorans) {
					if(!$scope.restorans) {
						$scope.restorans = [];
					}

					if(restorans) {
						loadFlag = true;
						$scope.nodata = false;

						var n = 0;
						for(var id in restorans) {
							n++;
						}

						var i=0;
						for(var id in restorans) {
							$scope.restorans[id] = restorans[id];

							// console.log(restorans[id].tglInput);
							if(restorans[id].tglInput < flag) {
								flag = restorans[id].tglInput;
								// console.log('flag: '+ restorans[id].tglInput);
							}
						}
						// $scope.restorans.push.apply($scope.restorans, restorans);
					} else {
						$scope.nodata = true;
					}
					
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');

					// console.log(flag +" | "+ flag2);
					if(flag >= flag2) {
						flag--;
						failCounter++;
					} else {
						failCounter = 0;
					}
					flag2 = flag;
				}, function(reason) {
					$scope.nodata = true;

					console.log('error fetch data');
					makeToast('Koneksi tidak stabil');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');
				}).finally(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');
				});
			} break;
			default: {
				// console.log(category);
				Services.getRestoranCategory(category).then(function(restorans) {
					if(restorans) {
						loadFlag = true;

						$scope.restorans = [];

						for(var r in restorans) {
							// console.log(r);
							Services.getRestoranDetails(r).then(function(restoran) {
								$scope.restorans.push(restoran);

								$ionicLoading.hide();
								$scope.$broadcast('scroll.refreshComplete');
							}, function(reason) {
								console.log('error fetch data');
								makeToast('Koneksi tidak stabil', 1500, 'bottom');
								$scope.$broadcast('scroll.refreshComplete');
							});
						}

					}
				}, function(reason) {
					console.log('error fetch data');
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.refreshComplete');
				}).finally(function() {
					$scope.$broadcast('scroll.refreshComplete');
				});

				failCounter = 3;
			} break;
		}

		// console.log(flag);
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('restoranCtrl', function($scope, $stateParams, Services, $ionicLoading, $cordovaToast, $ionicModal, $state, $ionicPopup, $timeout) {
    
	// $ionicLoading.show({
 //      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
 //      duration: 5000
 //    });
	// console.log("index:'"+ $stateParams.index +"'");
	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	loadingIndicator.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		analytics.trackView('Kuliner');
		console.log('trackView, Kuliner');
		analytics.trackEvent('Kuliner', 'Informasi', $stateParams.index, 5);
		console.log('trackEvent, Kuliner, Informasi, '+$stateParams.index);
	});

	$scope.restoran = null;
	$scope.menus = null;
	$scope.reviews = [];
	$scope.user = {
		rating: 5
	};


	$scope.getRestoran = function() {
		Services.getRestoranDetails($stateParams.index).then(function(restoran) {
			if(restoran) {
				$scope.restoran = restoran;
				loadFlag = true;
				// pindah di on enter
				//
				// analytics.trackView('Kuliner');
				// console.log('trackView, Kuliner');
				// analytics.trackEvent('Kuliner', 'Informasi', $stateParams.index, 5);
				// console.log('trackEvent, Kuliner, Informasi, '+$stateParams.index);

				Services.getRestoranMenus($stateParams.index).then(function(menus) {
					if(menus) {
						$scope.menus = menus;
						// console.log('ada menu');
						/////////////////////////////////////////////////////////
						//
						// for nexxt development, authentification -> review-rating
						//
						////////////////////////////////////////////////////////

						// Services.getRestoranReviews($stateParams.index).then(function(reviews) {
						// 	if(reviews) {
						// 		for(var r in reviews) {
						// 			if(reviews[r].review == undefined || reviews[r].review == null) {
						// 				delete reviews[r];
						// 			}
						// 		}
						// 		$scope.reviews = reviews;

						// 		// console.log('success');
						// 	}
						// });
					} else {
						makeToast('Error, tidak ada menu', 1500, 'bottom');
						console.log('gaada menu');
					}

					$ionicLoading.hide();
				}, function(reason) {
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					console.log('error fetching data');
					$ionicLoading.hide();
				});
			} else {
				$ionicLoading.hide();
			}
		}, function(reason) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('gabisa ambil resto');
			$ionicLoading.hide();
		}).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	$scope.getRestoran();

	
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
		rating: $scope.user.rating,
		minRating: 1,
		callback: function(rating) {
			$scope.ratingsCallback(rating);
		}
	};

	$scope.ratingsCallback = function(rating) {
		// console.log('Select', rating);
		$scope.user.rating = rating;
	};

	$scope.saveRatingReview = function() {
		// console.log(uid);
		// console.log('\t'+ $scope.user.review);
		// console.log('\t'+ $scope.user.rating);

		Services.updateRatingReview($scope.restoran.index, $scope.user.reviewer, $scope.user.rating, $scope.user.review);
		$scope.modalRating.hide();

		// if(!$scope.reviews) {
		// 	$scope.reviews = [];
		// }

		$scope.reviews[$scope.user.reviewer] = {
			reviewer: $scope.user.reviewer,
			review: $scope.user.review
		};
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

	$ionicModal.fromTemplateUrl('templates/gambarMenu.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalMenuGambar = modal; });

	$ionicModal.fromTemplateUrl('templates/rating.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalRating = modal; });

	$scope.openReview = function() {
		analytics.trackView('Ulasan Kuliner');
		console.log('trackView, Ulasan Kuliner');
		analytics.trackEvent('Ulasan', 'Ulasan Kuliner', $stateParams.index, 5);
		console.log('trackEvent, Ulasan, Ulasan Kuliner, '+$stateParams.index);
		$scope.modalReview.show();
	};

	$scope.closeReview = function() {
		$scope.modalReview.hide();
	};

	$scope.openMenu = function(index) {
		analytics.trackView('Ulasan Menu Kuliner');
		console.log('trackView, Ulasan Menu Kuliner');
		analytics.trackEvent('Ulasan', 'Ulasan Menu Kuliner '+$stateParams.index , index, 5);
		console.log('trackEvent, Ulasan, Ulasan Menu Kuliner '+$stateParams.index+', '+index);
		$scope.selectedMenu = $scope.menus[index];
		console.log($scope.selectedMenu);
		if (!$scope.selectedMenu.review) {
			$scope.modalMenuGambar.show();
		}else{
			// $scope.modalMenu.show();
			$state.go('tabsController.ulasanMenu', {'selectedMenu': $scope.selectedMenu});
		}
		// console.log($scope.menu[index]);
	};

	$scope.closeMenu = function() {
		$scope.modalMenu.hide();
	};

	$scope.openMenuGambar = function(index) {
		analytics.trackView('Gambar Ulasan Menu Kuliner');
		console.log('trackView, Gambar Ulasan Menu Kuliner');
		analytics.trackEvent('Ulasan', 'Gambar Ulasan Menu Kuliner '+$stateParams.index, index, 5);
		console.log('trackEvent, Ulasan, Gambar Ulasan Menu Kuliner '+$stateParams.index+', '+index);
		$scope.selectedMenu = $scope.menus[index];
		// console.log($scope.selectedMenu);
		$scope.modalMenuGambar.show();
	};

	$scope.closeMenuGambar = function() {
		$scope.modalMenuGambar.hide();
	};

	$scope.openRating = function() {
		// check whether current user has already review this resto or not
		// Services.getRatingReview($scope.restoran.namaResto, uid).then(function(result) {
		// 	if(result) {
		// 		console.log(result.reviewer);
		// 		console.log('success');
		// 	} else {
		// 		console.log('no review yet');
		// 	}
		// 	$scope.modalRating.show();
		// }, function(reason) {
		// 	console.log('error');
		// 	$scope.modalRating.show();
		// });
		
		// Kode asli
		// $scope.modalRating.show();

		// Coming Soon
		analytics.trackEvent('Coming Soon', 'Ulasan Pengguna', 'Tombol Ulasan', 10);
		console.log('trackEvent, Coming Soon, Ulasan Pengguna, Tombol Ulasan');
		$ionicPopup.alert({
			title: 'Coming Soon',
			template: '<center>Layanan ini akan segera hadir</center>',
			okText: 'OK',
			okType: 'button-balanced'
		});
	};

	$scope.pesan = function() {
		analytics.trackEvent('Coming Soon', 'Pesan', 'Tombol Pesan', 5);
		console.log('trackEvent, Coming Soon, Pesan, Tombol Pesan');
		var user = firebase.auth().currentUser;
		if (user) {
			$state.go('tabsController.pesan', {'index': $scope.restoran.index});
			// $ionicPopup.alert({
			// 	title: 'Logged In',
			// 	template: '<center>Anda dapat memesan</center>',
			// 	okText: 'Pesan',
			// 	okType: 'button-balanced'
			// });
		} else {
			$state.go('login');
		}
		// $ionicPopup.alert({
		// 	title: 'Coming Soon',
		// 	template: '<center>Layanan ini akan segera hadir</center>',
		// 	okText: 'OK',
		// 	okType: 'button-balanced'
		// });
	}

	$scope.ulasanPengguna = function() {
		$state.go('tabsController.ulasanPengguna');
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('menusCtrl', function($scope, $stateParams, Services, $ionicModal, $ionicLoading, $cordovaToast, $ionicPopup, $state, $timeout) {
	// pindah di on enter
	//
    // analytics.trackView('Menu Kuliner');
    // console.log('trackView, Menu Kuliner');
    // analytics.trackEvent('Menu', 'Lihat Menu', $stateParams.index, 5);
    // console.log('trackEvent, Menu, Lihat Menu, '+$stateParams.index);

    // $ionicLoading.show({
    //   template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
    //   duration: 5000
    // });

	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	loadingIndicator.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

    $scope.$on('$ionicView.enter', function() {
    	analytics.trackView('Menu Kuliner');
	    console.log('trackView, Menu Kuliner');
	    analytics.trackEvent('Menu', 'Lihat Menu', $stateParams.index, 5);
	    console.log('trackEvent, Menu, Lihat Menu, '+$stateParams.index);
    });

    $scope.getMenus = function() {
		Services.getRestoranMenus($stateParams.index).then(function(menus) {
			if(menus) {
				loadFlag = true;
				$scope.menus = menus;
			} else {
				makeToast('Error, tidak ada menu', 1500, 'bottom');
				console.log('Error menu tidak ada');
			}
		}, function(err) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('Error fetch data');
		}).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
    }

    $scope.getMenus();

	$ionicModal.fromTemplateUrl('templates/ulasanMenu.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalMenu = modal; });

	$ionicModal.fromTemplateUrl('templates/gambarMenu.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalMenuGambar = modal; });

	$scope.openMenu = function(index) {
		analytics.trackView('Ulasan Menu Kuliner');
		console.log('trackView, Ulasan Menu Kuliner');
		analytics.trackEvent('Ulasan', 'Ulasan Menu Kuliner '+$stateParams.index , index, 5);
		console.log('trackEvent, Ulasan, Ulasan Menu Kuliner '+$stateParams.index+', '+index);
		$scope.selectedMenu = $scope.menus[index];
		console.log($scope.selectedMenu);
		if (!$scope.selectedMenu.review) {
			$scope.modalMenuGambar.show();
		}else{
			// $scope.modalMenu.show();
			$state.go('tabsController.ulasanMenu', {'selectedMenu': $scope.selectedMenu});
		}
		// console.log($scope.menu[index]);
	};

	$scope.closeMenu = function() {
		$scope.modalMenu.hide();
	};

	$scope.openMenuGambar = function(index) {
		analytics.trackView('Gambar Ulasan Menu Kuliner');
		console.log('trackView, Gambar Ulasan Menu Kuliner');
		analytics.trackEvent('Ulasan', 'Gambar Ulasan Menu Kuliner '+$stateParams.index, index, 5);
		console.log('trackEvent, Ulasan, Gambar Ulasan Menu Kuliner '+$stateParams.index+', '+index);
		$scope.selectedMenu = $scope.menus[index];
		$scope.selectedMenu = $scope.menus[index];
		// console.log($scope.selectedMenu);
		$scope.modalMenuGambar.show();
	};

	$scope.closeMenuGambar = function() {
		$scope.modalMenuGambar.hide();
	};

	$scope.pesan = function() {
		analytics.trackEvent('Coming Soon', 'Pesan', 'Tombol Pesan', 5);
		console.log('trackEvent, Coming Soon, Pesan, Tombol Pesan');
		// $ionicPopup.alert({
		// 	title: 'Coming Soon',
		// 	template: '<center>Layanan ini akan segera hadir</center>',
		// 	okText: 'OK',
		// 	okType: 'button-balanced'
		// });
		$state.go('tabsController.pesan', {'index': $scope.restoran.index});
		// var user = firebase.auth().currentUser;
		// if (user) {
		// 	$state.go('tabsController.pesan');
		// } else {
		// 	$state.go('login');
		// };
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})
  
.controller('jelajahCtrl', function($scope, $ionicSlideBoxDelegate, Services, $state, $ionicLoading, $cordovaToast, $cordovaGoogleAnalytics, config, $ionicPopup, $cordovaAppVersion, $cordovaGeolocation, $http) {
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 5000
    });

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			$scope.dataUser = "";
		}
	})

    Services.getVersion().then(function(version) {
    	if (version) {
    		// if (config.version < version) {
    		$cordovaAppVersion.getVersionCode().then(function(currentVersion) {
				$ionicLoading.hide();

    			if (parseInt(currentVersion) < version) {
			    	$ionicPopup.confirm({
						title: 'Update Aplikasi',
						template: '<center>Versi baru aplikasi tersedia di play store</center>',
						okText: 'OK',
						cancelText: 'Nanti',
						okType: 'button-balanced',
						cancelType: 'button-clear'
					}).then(function(res) {
						console.log('button tapped');

						if(res) {
							analytics.trackEvent('Update', 'Tombol Update');
							window.open('https://play.google.com/store/apps/details?id=com.manganindonesia.mangan', '_system', 'location=yes');
						} else {
							analytics.trackEvent('Update', 'Tombol Nanti');
						}
					});
	    		} else {
	    			console.log("version match");
	    		}
    		}, function(error) {
    			console.log('error get version: '+ error);
    		});

    		
    	} else {
    		console.log('error get version');

    		$ionicLoading.hide();
    	}
    }, function(err) {
    	console.log(err);
    });

    function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
            analytics.startTrackerWithId(config.analytics);
            // pindah di on enter
		    // analytics.trackView('Jelajah');
        }
        else{
            setTimeout(function(){
                _waitForAnalytics();
            },10000);
        }
    };
    _waitForAnalytics();

    $scope.$on('$ionicView.enter', function() {
    	// analytics.trackView('Jelajah');
    	// console.log('trackView, Jelajah');
	    function _waitForAnalytics(){
	        if(typeof analytics !== 'undefined'){
	            analytics.startTrackerWithId(config.analytics);
	            // pindah di on enter
			    analytics.trackView('Jelajah');
	        }
	        else{
	            setTimeout(function(){
	                _waitForAnalytics();
	            },10000);
	        }
	    };
	    _waitForAnalytics();

		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			console.log('not logged in');
			$scope.dataUser = "";
		}

	    $scope.greeting();
    });

	$scope.options = {
		loop: true,
		autoplay: true,
		speed: 3000,
	};

	$scope.user = {};

	if (firebase == 'undefined') {
		console.log('Error firebase undefined');
		makeToast('Error koneksi tidak stabil', 1500, 'bottom');
	}

	$scope.getProfileByUid = function(uid) {
		Services.getProfileByUid(uid).then(function(dataUser) {
			if (dataUser) {
				$scope.dataUser = dataUser
				console.log(JSON.stringify(dataUser));
			} else {
				console.log('profil no dataUser found with uid:'+uid);
			}
		})
	}

	$scope.searchQuery = function() {
		$state.go('tabsController.pencarian', {'query': $scope.user.query});
		delete $scope.user.query;
	};

	$scope.rekomendasikan = function() {
		analytics.trackEvent('Rekomendasikan', 'Buka Rekomendasikan');
		console.log('trackEvent, Rekomendasikan, Buka Rekomendasikan');
		window.open('https://mobilepangan.com/mangan/rekomendasi', '_system', 'location=yes'); 
		return false;
	}

	$scope.daftar = function() {
		analytics.trackEvent('Rekomendasikan', 'Buka Rekomendasikan');
		console.log('trackEvent, Daftar, Pendaftaran Restoran');
		window.open('https://mobilepangan.com/mangan/daftar', '_system', 'location=yes'); 
		return false;
	}

	Services.getSliders().then(function(sliders) {
		if (sliders) {
			$scope.sliders = sliders;
		} else {
			makeToast('Error koneksi tidak stabil', 1500, 'bottom');
			console.log('Error fetch data');
		}
	}, function(err) {
		makeToast('Error koneksi tidak stabil', 1500, 'bottom');
		console.log(err);
	});

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}

	///////////////////////////////////////////////////////////////////
	//
	// USED FOR DYNAMIC CATEGORIES
	//
	///////////////////////////////////////////////////////////////////

	// Services.getCategories().then(function(categories) {
	// 	if(categories) {
	// 		// for(var category in categories) {
	// 		// 	// categories[category].namaUp = categories[category].nama.toUpperCase();
	// 		// 	console.log(categories[category]);
	// 		// }
	// 		$scope.categories = categories;
	// 	}

	// 	$ionicLoading.hide();
	// });

	// get location and weather
	$scope.greeting = function() {
		var coords = {
			latitude: -7.569527,
			longitude: 110.830289
		};

		var options = {
			timeout: 5000,
			enableHighAccuracy: true
		};

		$cordovaGeolocation.getCurrentPosition(options).then(function(position) {
			if(position) {
				coords = position.coords;
			}

			$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+coords.latitude+","+coords.longitude+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
				$scope.lokasiUser = result.results[0].address_components[2].short_name+', '+result.results[0].address_components[3].short_name;
			}).error(function(error) {
				console.log('data error : '+error);
			});
		}, function(error) {
			console.log("could not get location");
			// show dialog to pick city manually 

			// $ionicPopup.alert({
			// 	title: 'Error',
			// 	template: 'Tidak dapat menemukan sinyal GPS!',
			// 	okText: 'OK',
			// 	okType: 'button-balanced'
			// }).then(function(res) {
			// 	showMap();
			// });
		});
	}
})

.controller('pencarianCtrl', function($scope, $stateParams, $ionicLoading, Services, $cordovaToast, $cordovaSocialSharing, config, $timeout) {
	$scope.category = 'Pencarian';
	$scope.user = {};
	$scope.user.query = $stateParams.query;
	$scope.notfound = false;
	
	// pindah di on enter
    // analytics.trackView('Pencarian');
    // console.log('trackView, Pencarian');

    $scope.$on('$ionicView.enter', function() {
    	analytics.trackView('Pencarian');
    	console.log('trackView, Pencarian');

    	$scope.notfound = false;
    });
	
    $scope.searchQuery = function() {
    	// $ionicLoading.show({
	    //   template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	    //   duration: 5000
	    // });

		var loadFlag = false;
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	    });

	    $timeout(function() {
	    	$ionicLoading.hide();
	    	if(!loadFlag) {
	    		$scope.notfound = true;
	    		makeToast('Koneksi tidak stabil');
	    	}
	    }, 10000);

		function _waitForAnalytics(){
	        if(typeof analytics !== 'undefined'){
	            analytics.startTrackerWithId(config.analytics);
				analytics.trackEvent('Pencarian', 'Cari', $scope.user.query, 5);
				console.log('trackEvent, Pencarian, Cari, '+$scope.user.query);
	        }
	        else{
	            setTimeout(function(){
	                _waitForAnalytics();
	            },10000);
	        }
	    };
	    _waitForAnalytics();

		Services.searchQuery($scope.user.query).then(function(inputQuery) {
			// console.log($scope.user.query);
			if(inputQuery) {
				// console.log(result);

				Services.getRestoranKeyword().then(function(result) {
					if(result) {
						loadFlag = true;
						$scope.notfound = false;
						// using filter
						$scope.restorans = [];

						var restoransNSorted = [];
						var isFound = false;
						// console.log('mulai cari');

						var ta = 0;
						for(var id in result) {
							ta++;
						}

						// console.log('ta: '+ ta);

						var ia = 0,
							ir = 0,
							tr = 0;
						for(var id in result) {
							// console.log(result[id].keyword);
							if(result[id].keyword.indexOf($scope.user.query) >= 0) {
								// console.log('HASIL:\t'+ id);
								isFound = true;
								// resultList.push(id);
								tr++;
								Services.getRestoranDetails(id).then(function(result) {
									// console.log(result.namaResto);

									//using filter
									$scope.restorans.push(result);
									$ionicLoading.hide();

									// restoransNSorted.push(result);

									// ir++;
									// if((ir >= tr) && (ia >= ta)) {
									// 	$ionicLoading.hide();
									// 	sortRestorans(restoransNSorted);
									// }
								});
							}

							ia++;
						}
						// console.log('isFound: '+ isFound);
						if(!isFound) {
							delete $scope.restorans;
							$ionicLoading.hide();
							$scope.notfound = true;
							makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
						}
					} else {
						makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
						console.log("No result");
						$scope.notfound = true;
					}
				}, function(reason) {
					$scope.notfound = true;
					makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
				});
			}
		});
	}

	$scope.rekomendasikan = function() {
		analytics.trackEvent('Rekomendasikan', 'Buka Rekomendasikan');
		console.log('trackEvent, Rekomendasikan, Buka Rekomendasikan');
		window.open('https://mobilepangan.com/mangan/rekomendasi', '_system', 'location=yes'); 
		return false;
	}

	function sortRestorans(rs) {
		$scope.restorans = [];

		var i = 0;
		var nrs = [];

		for(var id in rs) {
			nrs[i++] = rs[id];
			// console.log(nrs[i-1].namaResto);
		}

		nrs.sort(function(x,y) {
			return x.tglInput < y.tglInput;
		});

		for(var i = 0; i < nrs.length; i++) {
			$scope.restorans.push(nrs[i]);
		}
		// $scope.restoran = nrs;
		// setTimeout(function() {
		// 	// for(var i = 0; i < nrs.length; i++) {
		// 	// 	$scope.restorans = nrs;
		// 	// }
		// }, 1000);
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	$scope.saveRestoran = function(index) {
		if(Services.checkSavedRestoran(index)) {
			Services.deleteRestoran(index).then(function() {
				analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
				console.log('trackEvent, Hapus Simpan, '+index);
				makeToast('Restoran telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					analytics.trackEvent('Simpan Kuliner', 'Simpan', index, 5);
					console.log('trackEvent, Simpan, '+index);
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not be done.');
				}
			}, function(reason) {
				analytics.trackEvent('Simpan Kuliner', 'Simpan Penuh');
				console.log('trackEvent, Simpan Penuh');
				makeToast('Penyimpanan restoran penuh (max. 5)', 1500, 'bottom');
			});
		}
	}

	$scope.shareRestoran = function(index) {
		// console.log('share: '+ index);

		var resto = null;
		for(var id in $scope.restorans) {
			console.log($scope.restorans[id].index +" | "+ index)
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}
		// var resto = $scope.restorans[index];

		var link = 'Kunjungi mobilepangan.com untuk download aplikasinya.';
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto;

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			makeToast('Berhasil membagikan', 1500, 'bottom');
			analytics.trackEvent('Share', 'Share Kuliner', index);
			console.log('trackEvent, Share, '+index);
		}, function(err) {
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});
	}

    $scope.searchQuery();

    function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})
   
.controller('tersimpanCtrl', function($scope, Services, $cordovaToast, $state, $cordovaSocialSharing, $ionicLoading, $timeout, $localStorage, $http) {
	$scope.category = 'Tersimpan';
	$scope.nodata = false;
	$scope.notersimpan = false;
	var loadFlag = false;

	var savedRestorans = [];
	$scope.restorans = [];

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			$scope.dataUser = "";
		}
	})

	$scope.$on('$ionicView.enter', function() {
		loadFlag = false;
		$scope.nodata = false;
		$scope.notersimpan = false;
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	    });

	    $timeout(function() {
	    	$ionicLoading.hide();
	    	if(!loadFlag && !$scope.notersimpan) {
	    		$scope.nodata = true;
	    		makeToast('Koneksi tidak stabil');
	    		console.log('timeout');
	    	}
	    }, 10000);

	 	analytics.trackView('Tersimpan');
		console.log('trackView, Tersimpan');

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

		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			console.log('not logged in');
			$scope.dataUser = "";
		}
	});

	$scope.getRestorans = function() {
		$scope.nodata = false;
		$scope.notersimpan = false;

		var temp = Services.getSavedRestorans();
		savedRestorans = temp.slice(0);
		savedRestorans.reverse();

		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	    });

	    $timeout(function() {
	    	$ionicLoading.hide();
	    	if(!loadFlag && !$scope.notersimpan) {
	    		$scope.nodata = true;
	    		makeToast('Koneksi tidak stabil');
	    		console.log('timeout');
	    	}
	    }, 10000);

		updateSavedRestorans(savedRestorans);
		$scope.$broadcast('scroll.refreshComplete');
	}

	$scope.saveRestoran = function(index) {
		Services.deleteRestoran(index).then(function() {
			analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
			console.log('trackEvent, Hapus Simpan, '+index);
			window.plugins.toast.showWithOptions({
				message: 'Restoran berhasil dihapus',
				duration: 1500,
				position: 'bottom',
				addPixelsY: -40
			});
			$state.go($state.current, {}, {reload: true});
		});
	}

	$scope.shareRestoran = function(index) {
		// console.log('share: '+ index);

		var resto = null;
		for(var id in $scope.restorans) {
			console.log($scope.restorans[id].index +" | "+ index)
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}
		// var resto = $scope.restorans[index];

		var link = 'Kunjungi mobilepangan.com untuk download aplikasinya.';
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto;

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			makeToast('Berhasil membagikan', 1500, 'bottom');
			analytics.trackEvent('Share', 'Share Kuliner', index);
			console.log('trackEvent, Share, '+index);
		}, function(err) {
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});

		// var resto = $scope.restorans[index];
		// var link = 'www.mobilepangan.com/downloads';
		// var image = 'www/img/cafe.jpg';
		// $cordovaSocialSharing.share(resto.reviewTim, resto.namaResto, image, link).then(function(result) {
		// console.log(resto.keteranganResto);
		// console.log(resto.namaResto);
		// console.log(resto.gambar[0]);
		// console.log(link);
		// $cordovaSocialSharing.share(resto.keteranganResto, resto.namaResto, null, link)
		// .then(function(result) {
		// 	console.log('shared');
		// }, function(err) {
		// 	console.log('error');
		// });

		// var optionShare = {
		// 	message: resto.keteranganResto,
		// 	subject: resto.namaResto,
		// 	files: [resto.gambar[0]],
		// 	url: link,
		// 	chooserTitle: 'Bagikan restoran'
		// };

		// window.plugins.socialsharing.shareWithOptions(options, function() {
		// 	console.log('shared');
		// }, function() {
		// 	console.log('error');
		// });
	// })
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	function updateSavedRestorans(news) {
		console.log('update');
		savedRestorans = news;
		$scope.restorans = [];
		if(news && news.length > 0) {
			$scope.notersimpan = false;

			for(var i=0; i<news.length; i++) {
				Services.getRestoranDetails(news[i]).then(function(restoran) {
					if(restoran) {
						loadFlag = true;
						$scope.nodata = false;
						$scope.restorans.push(restoran);
						// console.log(restoran);
						console.log('success');
					} else {
						console.log('failure');
					}

					$ionicLoading.hide();
				});
			}
		} else {
			$scope.notersimpan = true;
			$ionicLoading.hide();
		}
		// console.log($scope.restorans);
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}

	// get Profile User by UID
	$scope.getProfileByUid = function(uid) {
		Services.getProfileByUid(uid).then(function(dataUser) {
			if (dataUser) {
				$scope.dataUser = dataUser
			} else {
				console.log("tersimpan no dataUser found with uid: "+uid);
			}
		})
	}

	$scope.openProfile = function() {
		$state.go('tabsController.profil');
	}

	$scope.login = function() {
		$state.go('login');
	}
})

.controller('petaCtrl', function($scope, $state, $stateParams, Services, $cordovaToast, $cordovaGeolocation, $ionicPopup) {
	$scope.category = 'Peta';
	
	// console.log($stateParams.index);

	// pindah di on enter
	//
	// analytics.trackView('Peta');
	// console.log('trackView, Peta');
	// analytics.trackEvent('Peta', 'Lihat Peta', $stateParams.index, 5);
	// console.log('trackEvent, Peta, Lihat Peta, '+$stateParams.index);

	$scope.$on('$ionicView.enter', function() {
		analytics.trackView('Peta');
		console.log('trackView, Peta');
		analytics.trackEvent('Peta', 'Lihat Peta', $stateParams.index, 5);
		console.log('trackEvent, Peta, Lihat Peta, '+$stateParams.index);
	});

	var options = {timeout: 10000, enableHighAccuracy: true};
	// $cordovaGeolocation.getCurrentPosition(options).then(function(position){
	// navigator.geolocation.getCurrentPosition(options).then(function(position){
		Services.getRestoranDetails($stateParams.index).then(function(restoran) {
			if(restoran) {
				$scope.restoran = restoran;
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

					var contentString = '<div style="width: 200px; font-size: 14px;"><center><p><b>'+restoran.namaResto+'</b></p><p>'+restoran.keteranganBuka+'</p><a href="tel:'+restoran.noTelp+'" style="color:blue; text-decoration:none;">Hubungi</a></center></div>';

					var infoWindow = new google.maps.InfoWindow({
						content: contentString,
						maxWidth: 500
					});

					google.maps.event.addListener(marker, 'click', function () {
						infoWindow.open($scope.map, marker);
					});

					infoWindow.open($scope.map, marker);
				});

				$scope.openUrl = function() {
					analytics.trackEvent('Peta', 'Navigasikan', $stateParams.index, 5);
					console.log('trackEvent, Peta, Navigasikan, '+$stateParams.index);
					$cordovaGeolocation.getCurrentPosition(options).then(function(position){
						var lat = position.coords.latitude;
						var lng = position.coords.longitude;
						window.open('http://maps.google.com/maps?saddr=+'+lat+'+,+'+lng+'+&daddr=+'+restoLat+'+,+'+restoLng+'+&dirflg=d', '_system', 'location=yes');
						// window.open('geo:'+lat+','+lng+'?q='+restoLat+','+restoLng+'('+restoran.namaResto+')', '_system', 'location=yes');
						return false;
					}, function(error){
						console.log("Could not get location");
						window.open('http://maps.google.com/maps?saddr=Current+Location&daddr=+'+restoLat+'+,+'+restoLng+'+&dirflg=d', '_system', 'location=yes');
						// $ionicPopup.alert({
						// 	title: 'Error',
						// 	template: 'Tidak dapat menggunakan GPS, hidupkan setting GPS anda',
						// 	okText: 'OK',
						// 	okType: 'button-balanced'
						// });
					});
				}
			} else {
				makeToast('Koneksi tidak stabil', 1500, 'bottom');
				console.log('failure');
			}
		}, function(reason) {	
			$scope.restoran = null;
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('error');
		});
	// }, function(error){
	// 	console.log("Could not get location");
	// 	$ionicPopup.alert({
	// 		title: 'Error',
	// 		template: 'Tidak dapat menggunakan GPS, hidupkan setting GPS anda',
	// 		okText: 'OK',
	// 		okType: 'button-balanced'
	// 	});
	// });

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('terdekatCtrl', function($scope, $state, $stateParams, Services, $cordovaGeolocation, $ionicPopup, $ionicLoading) {
	$scope.category = 'Terdekat';

	$ionicLoading.show({
		template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	});

	$scope.$on('$ionicView.enter', function() {
		analytics.trackView('Terdekat');
		console.log('trackView, Terdekat');
		analytics.trackEvent('Terdekat', 'Kuliner Terdekat', $scope.category, 5);
		console.log('trackEvent, Terdekat, Kuliner Terdekat, '+$scope.category);
	});

	//////////////////////////////////////////////////////////////////
	//
	// load map, use current location, if not available, use default
	//
	//////////////////////////////////////////////////////////////////
	var coords = {
		latitude: -7.569527,
		longitude: 110.830289
	};

	var options = {
		timeout: 5000,
		enableHighAccuracy: true
	};

	var openedInfo = null;

	$cordovaGeolocation.getCurrentPosition(options).then(function(position) {

		if(position) {
			console.log('position aru');
			coords = position.coords;
		}

		showMap();
	}, function(error) {
		console.log("could not get location");

		$ionicPopup.alert({
			title: 'Error',
			template: 'Tidak dapat menemukan sinyal GPS!',
			okText: 'OK',
			okType: 'button-balanced'
		}).then(function(res) {
			showMap();
		});
	});


	function showMap() {

		console.log('pusat: '+ coords.latitude, coords.longitude);
		var latlon = new google.maps.LatLng(coords.latitude, coords.longitude);

		var mapOptions = {
			center: latlon,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		$scope.map = new google.maps.Map(document.getElementById('mangan-peta'), mapOptions);
		$scope.markers = [];

		// wait till map loaded
		google.maps.event.addListener($scope.map, 'idle', function() {
			var userMarker = new google.maps.Marker({
				map: $scope.map,
				icon: '',
				position: latlon
			});

			// var userInfo = new google.maps.InfoWindow({
			// 	content: "Lokasimu"
			// }).open($scope.map, userMarker);

			addMarkers();
		});
	}

	function addMarkers() {

		// $ionicLoading.show({
		// 	template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
		// 	duration: 5000
		// });

		var bounds = $scope.map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		// console.log(ne.lat() +' | '+ ne.lng());
		// console.log(sw.lat() +' | '+ sw.lng());

		// 1210 reserved for RIO

		// console.log('markers');

		// longitude filter from firebase
		Services.getRestoransByLocation(sw.lng(), ne.lng()).then(function(restorans) {

			if(restorans) {

				// latitude filter from these
				for(var r in restorans) {
					var location = restorans[r].map;
					if(location.lat < sw.lat() || location.lat > ne.lat()) {
						console.log(sw.lat() +' | '+ location.lat +' | '+ ne.lat());
						delete restorans[r];
					}
				}

				$scope.restorans = restorans;

				var i = 0, j = 0;
				// var marker = [];
				for(var r in restorans) {
					i++;
					if(restorans[r].map) {
						var lat = restorans[r].map.lat;
						var lon = restorans[r].map.long;

						if(lat && lon) {
							var rLatlon = new google.maps.LatLng(lat, lon);
							console.log(lat+' | '+lon);

							var marker = new google.maps.Marker({
								map: $scope.map,
								// animation: google.maps.Animation.DROP,
								position: rLatlon,
								icon: 'img/marker.png'
							});

							var contentString = restorans[r].namaResto;
							addInfoWindow(marker, contentString, restorans[r].index);

							$scope.markers.push(marker);

							j++;
						} else {
							console.log('...');
						}
					}
				}
				console.log(i +"/"+ j);
			} else {
				console.log('no resto');
			}

			var markerCluster = new MarkerClusterer($scope.map, $scope.markers, {
				imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
			});

			$ionicLoading.hide();
		}, function(reason) {
			console.log('error');
			console.log(reason);

			$ionicLoading.hide();
		});
	}

	function addInfoWindow(marker, message, index) {
		// console.log('waaaahaa');
		var infoWindow = new google.maps.InfoWindow({
			content: '<div style="width: auto; font-size: 14px;""><center><a href="#/page1/tab1/restoran/'+ index +'" style="text-decoration: none;"><b>'+ message +'</b><p>Lihat</p></a></center></div>',
			maxWidth: 150
		});

		google.maps.event.addListener(marker, 'click', function () {
			if(openedInfo) {
				openedInfo.close();
			}
			openedInfo = infoWindow;
			
			infoWindow.open($scope.map, marker);
		});

		addInfoListener(infoWindow, message);
	}

	function addInfoListener(infoWindow, message) {

		google.maps.event.addDomListener(infoWindow, 'click', function() {
			console.log(message);
		});
	}
})
 
.controller('ulasanMenuCtrl', function($scope, $state, $stateParams, Services) {
	$scope.getMenu = function() {
		$scope.selectedMenu = $stateParams.selectedMenu;
		console.log('ulasanMenu');
		$scope.$broadcast('scroll.refreshComplete');
	}

	$scope.getMenu();
})

.controller('promoCtrl', function($scope, $state, $ionicLoading, $cordovaToast, Services, $timeout, $localStorage) {
	// $ionicLoading.show({
 //      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
 //      duration: 5000
 //    });
	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	loadingIndicator.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		analytics.trackView('Promo');
		console.log('trackView, Promo');
	});

	$scope.openPromo = function(index) {
		analytics.trackEvent('Promo', 'Click', index, 5);
		console.log('Promo, Click, '+index);
		$state.go('tabsController.restoran', {'index': index});
	}

	$scope.getPromos = function() {
	    Services.getPromos().then(function(promos) {
	    	loadFlag = true;
	    	if (promos) {
		    	$scope.promos = promos;
		    	$ionicLoading.hide();
	    	} else {
	    		makeToast('Nantikan Promo Menarik', 1500, 'bottom');
	    		console.log('Error fetch data');
	    		$ionicLoading.hide();
	    	}
	    }, function(err) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
	    	console.log(err);
	    }).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
	    });
	}

	$scope.getPromos();

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('loginCtrl', function($scope, $state, $ionicLoading, Services, $ionicHistory, $cordovaOauth, $localStorage, $http) {
	$scope.fblogin = function() {
		$cordovaOauth.facebook(1764800933732733, ["email", "user_birthday", "user_location"]).then(function(result) {
			console.log(result.access_token);
			$localStorage.fbaccesstoken = result.access_token;
			var credential = firebase.auth.FacebookAuthProvider.credential($localStorage.fbaccesstoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				console.log('Error : '+JSON.stringify(error));
			});
			$ionicHistory.goBack();
		}, function(err) {
			console.log('Error oAuth favebook: '+err);
		})
	}

	$scope.googlelogin = function() {
		$cordovaOauth.google("1054999345220-m4vlisv7o0na684cgcg13s1tj2t4v447.apps.googleusercontent.com", ["email", "profile"]).then(function(result) {
			$localStorage.googleidtoken = result.id_token;
			$localStorage.googleaccesstoken = result.access_token;
			var credential = firebase.auth.GoogleAuthProvider.credential($localStorage.googleidtoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				console.log("Error : "+JSON.stringify(error));
			});
			$ionicHistory.goBack();
		}, function(err) {
			console.log('Error oAuth google: '+err);
		})
	}

	// listen to auth change
	firebase.auth().onAuthStateChanged(function(user) {
		// logged in
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					// cek if data already stored
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							console.log(JSON.stringify(user));
							// update user data?
							// data already added to database
						} else {
							// create new data in firebase from facebook
							$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
								access_token : $localStorage.fbaccesstoken,
								format : "json"
							}}).then(function(result) {
								$scope.dataUser = result.data;
								console.log(JSON.stringify(result.data));
								Services.addUserData($scope.dataUser).then(function(user) {
									console.log(user);
								}, function(err) {
									console.log(err);
								})
							})
						}
					}, function(err) {
						console.log("error cekUserData(): "+err);
					})
				} else if (profile.providerId === "google.com") {
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							console.log(JSON.stringify(user));
							// update user data?
							// data already added to database
						} else {
							console.log('tryna get from google apis');
							// create new data in firebase from Google
							$http.get("https://www.googleapis.com/userinfo/v2/me?fields=email,family_name,gender,given_name,hd,id,link,locale,name,picture,verified_email", {
								headers :{
									"Authorization" : "Bearer "+$localStorage.googleaccesstoken
								}
							}).then(function(result) {
								$scope.dataUser = result.data;
								console.log(JSON.stringify(result.data));
								Services.addUserDataByGoogle($scope.dataUser).then(function(user) {
									console.log(user);
								}, function(err) {
									console.log(err);
								})
							}, function(err) {
								console.log('error get from google apis: '+JSON.stringify(err));
							})
						}
					}, function(err) {
						console.log("error cekUserData(): "+err);
					})
				}  else {
					console.log('logged in with provider :'+profile.providerId);
				}
			});
		} else {
			console.log('not logged in');
		}
	});
})

.controller('profilCtrl', function($scope, $state, $ionicLoading, Services, $http, $localStorage, $ionicHistory, $ionicModal, $cordovaGeolocation, $ionicPopup, $cordovaToast) {
	// profile Code here
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 5000
    });

	$scope.$on('$ionicView.enter', function() {
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			$state.go('tabsController.tersimpan');
		}
	});

	// get profile by UID
	$scope.getProfileByUid = function(uid) {
		Services.getProfileByUid(uid).then(function(dataUser) {
			if (dataUser) {
				$scope.dataUser = dataUser;
			} else {
				console.log('profil no dataUser found with uid:'+uid);
			}
		})
	} 

	// get Profile User
	// $scope.getProfile = function() {
	// 	if ($localStorage.hasOwnProperty("fbaccesstoken")) {
	// 		$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
	// 			access_token : $localStorage.fbaccesstoken,
	// 			format : "json"
	// 		}}).then(function(result) {
	// 			$scope.dataUser = result.data;
	// 			console.log(JSON.stringify(result.data));
	// 			$ionicLoading.hide();
	// 		})
	// 	} else {
	// 		// missing access token
	// 		console.log('no access token');
	// 	}
	// }
	$scope.updateUserData = function() {
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	      duration: 5000
	    });

		Services.updateUserData($scope.dataUser).then(function(result) {
			$ionicLoading.hide();
			makeToast('Data berhasil diperbarui')
		}, function(err) {
			console.log('error');
			$ionicLoading.hide();
		});
	}

	$scope.signOut = function() {
		firebase.auth().signOut().then(function() {
			console.log('signed out');
			$state.go('tabsController.tersimpan');
			$ionicHistory.removeBackView();
		}, function(error) {
			console.log(error);
		});
	}

	$scope.pickLocation = function() {
		var coords = { latitude: -7.569527, longitude: 110.830289 };
		var options = { timeout: 5000, enableHighAccuracy: true };
		var openedInfo = null;
		$cordovaGeolocation.getCurrentPosition(options).then(function(position) {
			if(position) {
				console.log('position aru');
				coords = position.coords;
			}
			showMap();
		}, function(error) {
			console.log("could not get location");
			$ionicPopup.alert({
				title: 'Error',
				template: 'Tidak dapat menemukan sinyal GPS!',
				okText: 'OK',
				okType: 'button-balanced'
			}).then(function(res) {
				showMap();
			});
		});


		function showMap() {
			console.log('pusat: '+ coords.latitude, coords.longitude);
			var latlon = new google.maps.LatLng(coords.latitude, coords.longitude);
			var mapOptions = { center: latlon, zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP };
			
			$scope.map = new google.maps.Map(document.getElementById('mangan-peta'), mapOptions);

			// wait till map loaded
			// google.maps.event.addListener($scope.map, 'idle', function() {
				var userMarker = new google.maps.Marker({
					map: $scope.map,
					icon: 'img/marker.png',
					position: latlon,
					draggable: true
				})
			// });
				google.maps.event.addListener(userMarker, 'dragend', function(evt) {
					console.log(evt.latLng.lat(), evt.latLng.lng());
					$scope.mapUser = {
						'lat' : evt.latLng.lat(),
						'long' : evt.latLng.lng()
					}
					
					$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+evt.latLng.lat()+","+evt.latLng.lng()+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
						$scope.dataUser.location = result.results[0].address_components[2].short_name;
					}).error(function(error) {
						console.log('data error : '+error);
					});
				})
		}
		$scope.maps.show();
	}

	$ionicModal.fromTemplateUrl('templates/maps.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.maps = modal; });

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('pesanCtrl', function($scope, $stateParams, Services, $ionicModal, $ionicLoading, $cordovaToast, $ionicPopup, $state, $timeout, $ionicHistory) {
	// code pesan here	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	loadingIndicator.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

    $scope.$on('$ionicView.enter', function() {
    	analytics.trackView('Menu Kuliner');
	    console.log('trackView, Menu Kuliner');
	    analytics.trackEvent('Menu', 'Lihat Menu', $stateParams.index, 5);
	    console.log('trackEvent, Menu, Lihat Menu, '+$stateParams.index);
    });

    Services.getRestoranDetails($stateParams.index).then(function(restoran) {
    	if (restoran) {
    		$scope.restoran = restoran;
    	} else {
    		console.log('Error fetch data restoran');
    	};
    })

    $scope.getMenus = function() {
		Services.getRestoranMenus($stateParams.index).then(function(menus) {
			if(menus) {
				loadFlag = true;
				$scope.menus = menus;
				for(var id in $scope.menus) {
					$scope.menus[id].quantity = 0;
				}
				$ionicLoading.hide();
			} else {
				makeToast('Error, tidak ada menu', 1500, 'bottom');
				console.log('Error menu tidak ada');
			}
		}, function(err) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('Error fetch data');
		}).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
    }

    $scope.getMenus();

	$scope.minQuantity = function(index, quantity) {
		console.log(index, quantity);
		if (quantity > 0) {
			$scope.menus[index].quantity = quantity - 1;
		} else {
			$scope.menus[index].quantity = 0;
		}
	}

	$scope.addQuantity = function(index, quantity) {
		console.log(index, quantity);
		if (quantity >= 0) {
			$scope.menus[index].quantity = quantity + 1;
		} else {
			$scope.menus[index].quantity = 0;
		}
	}

	$scope.invoice = function() {
		$scope.selectedMenus = [];
		for(var id in $scope.menus) {
			if ($scope.menus[id].quantity > 0) {
				$scope.selectedMenus.push($scope.menus[id]);
			}
		}
		if ($scope.selectedMenus == "") {
			// alert('Mohon masukan pesanan minimal 1');
			$ionicPopup.alert({
				title: 'Pilih pesanan',
				template: '<center>Kamu harus memilih pesanan minimal 1</center>',
				okText: 'OK',
				okType: 'button-balanced'
			});
		} else if($scope.selectedMenus !== ""){
			var user = firebase.auth().currentUser;
			if (user) {
				user.providerData.forEach(function(profile) {
					$scope.uid = profile.uid
				});
			} else {
				$ionicPopup.alert({
					title: 'Belum login',
					template: '<center>Kamu harus login dulu</center>',
					okText: 'OK',
					okType: 'button-balanced'
				});
				$state.go('login');
			}

			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
		      duration: 5000
		    });

			Services.getProfileByUid($scope.uid).then(function(dataUser) {
				if (dataUser) {
					Services.getRestoranDetails($stateParams.index).then(function(restoran) {
						if (restoran) {
							if ($scope.transaksi) {
								$scope.transaksi.pesanan = $scope.selectedMenus;
							} else {
								$scope.transaksi = {
									'alamat' : restoran.alamat,
									'alamatUser' : null,
									'feedelivery' : 5000,
									'indexResto' : restoran.index,
									'indexTransaksi' : Date.now()+$scope.uid+restoran.index,
									'jumlah' : null,
									'kurir' : null,
									'map' : {
										'lat' : restoran.map.lat,
										'long' : restoran.map.long
									},
									'mapUser' : {
										'lat' : null,
										'long' : null
									},
									'namaResto' : restoran.namaResto,
									'namaUser' : dataUser.name,
									'noTelpUser' : 0+dataUser.noTelpUser,
									'pesanan' : $scope.selectedMenus,
									'status' : 'queue',
									'processBy' : null,
									'tgl' : firebase.database.ServerValue.TIMESTAMP,
									'totalHarga' : null,
									'userPhotoUrl' : dataUser.photoUrl,
									'username' : $scope.uid
								}
							}
							$ionicLoading.hide();
							$state.go('tabsController.invoice', {'transaksi': $scope.transaksi});
						}
					});
				}
			});
		}
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('invoiceCtrl', function($scope, $state, $stateParams, Services, $ionicHistory, $ionicModal, $ionicPopup, $cordovaGeolocation, $http, $ionicLoading){
	$scope.invoice = function() {
		$scope.transaksi = $stateParams.transaksi;
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.invoice();

	function jumlah() {
		var jumlah = 0;
		var hnq = 0;
		for(var id in $scope.transaksi.pesanan) {
			hnq = $scope.transaksi.pesanan[id].harga*$scope.transaksi.pesanan[id].quantity;
			jumlah += hnq;
			hnq = 0;
		}
		return jumlah;
	}

	function totalHarga() {
		var total = 0;
		var total = jumlah();
		total += $scope.transaksi.feedelivery;
		return total;
	}

	$scope.minQuantity = function(index, quantity) {
		console.log(index, quantity);
		if (quantity > 1) {
			$scope.transaksi.pesanan[index].quantity = quantity - 1;
		} else {
			$scope.transaksi.pesanan[index].quantity = 1;
		}
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.addQuantity = function(index, quantity) {
		console.log(index, quantity);
		if (quantity >= 1) {
			$scope.transaksi.pesanan[index].quantity = quantity + 1;
		} else {
			$scope.transaksi.pesanan[index].quantity = 1;
		}
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.addOrder = function() {
		$ionicHistory.goBack();
	}

	$scope.pickLocation = function() {
		var coords = {};
		var options = { timeout: 5000, enableHighAccuracy: true };
		$cordovaGeolocation.getCurrentPosition(options).then(function(position) {
			if(position) {
				coords = position.coords;
			}
			showMap();
		}, function(error) {
			$ionicPopup.alert({
				title: 'Lokasi Tidak Ditemukan',
				template: '<center>Nyalakan setting GPS anda</center>',
				okText: 'OK',
				okType: 'button-balanced'
			}).then(function(res) {
				showMap();
			});
		});


		function showMap() {
			console.log('pusat: '+ coords.latitude, coords.longitude);
			var latlon = new google.maps.LatLng(coords.latitude, coords.longitude);
			var mapOptions = { center: latlon, zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP };
			
			$scope.map = new google.maps.Map(document.getElementById('mangan-peta'), mapOptions);

			// wait till map loaded
			// google.maps.event.addListener($scope.map, 'idle', function() {
			var userMarker = new google.maps.Marker({
				map: $scope.map,
				icon: 'img/marker.png',
				position: latlon,
				draggable: true
			})

			$scope.mapUser = {
				'lat' : coords.latitude,
				'long' : coords.longitude
			}

			$scope.getAddress(coords.latitude, coords.longitude);
			$scope.transaksi.mapUser = $scope.mapUser;

			google.maps.event.addListener(userMarker, 'dragend', function(evt) {
				$scope.mapUser = {
					'lat' : evt.latLng.lat(),
					'long' : evt.latLng.lng()
				}
				$scope.getAddress(evt.latLng.lat(), evt.latLng.lng());
				$scope.transaksi.mapUser = $scope.mapUser;
			})
			// });
		}
		$scope.maps.show();
	}

	$scope.checkout = function() {
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				$scope.uid = profile.uid
			});
		} else {
			$ionicPopup.alert({
				title: 'Belum login',
				template: '<center>Kamu harus login dulu</center>',
				okText: 'OK',
				okType: 'button-balanced'
			});
			$state.go('login');
		}

		if ($scope.transaksi.namaUser == ""
			|| $scope.transaksi.alamatUser == "" 
			|| $scope.transaksi.noTelpUser == ""
			|| $scope.transaksi.kurir == ""
			|| $scope.transaksi.namaUser == null
			|| $scope.transaksi.alamatUser == null 
			|| $scope.transaksi.noTelpUser == null
			|| $scope.transaksi.kurir == null) {
			$ionicPopup.alert({
				title: 'Data tidak lengkap',
				template: '<center>Mohon lengkapi data pemesanan</center>',
				okText: 'OK',
				okType: 'button-balanced'
			});
		} else {
			Services.addTransaction($scope.transaksi.kurir, $scope.transaksi.indexTransaksi, $scope.transaksi).then(function() {
				// console.log($scope.transaksi.kurir, $scope.transaksi.indexTransaksi, JSON.stringify(angular.toJson($scope.transaksi)));
				Services.addQueue($scope.transaksi.kurir, $scope.transaksi.indexTransaksi).then(function() {
					var notificationData = {
						"notification":{
							"title":"Order Baru",
							"body":"Dari "+$scope.transaksi.namaUser+" ke "+$scope.transaksi.namaResto,
							"sound":"default",
							"icon":"fcm_push_icon"
						},
						"to":"/topics/"+$scope.transaksi.kurir,
						"priority":"high",
						"restricted_package_name":"com.manganindonesia.kurma"
					}

					$http.post('https://fcm.googleapis.com/fcm/send', notificationData, {
						headers: {
							"Content-Type" : "application/json",
							"Authorization" : "key=AIzaSyD-AE-K7XNFFfwl-VWnmKW0PHMTHJBtQKo"
						}
					}).then(function(result) {
						console.log(JSON.stringify(result));
					}, function(err) {
						console.log(err);
					})

					Services.addHistory($scope.uid, $scope.transaksi.indexTransaksi, $scope.transaksi.kurir).then(function(){
						console.log('complete add history');
					});

					$state.go('tabsController.transaksi');
				})
			}, function(err) {
				console.log(err);
			})
		}
	}

	$scope.getAddress = function(lat, lng) {
		console.log(lat, lng);
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	      duration: 2000
	    });

		$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
			$scope.alamatUser = result.results[0].formatted_address;
			$scope.transaksi.alamatUser = $scope.alamatUser;
			console.log($scope.alamatUser);
			$ionicLoading.hide();
		}).error(function(error) {
			console.log('data error : '+error);
			$scope.alamatUser = "";
			$ionicLoading.hide();
		});
	}

	$ionicModal.fromTemplateUrl('templates/maps.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.maps = modal; });
})

.controller('transaksiCtrl', function($scope, $state, $stateParams, Services, $ionicHistory) {
	// code for transaksi
	$scope.$on('$ionicView.enter', function() {
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				$scope.uid = profile.uid;
				$scope.getHistory(profile.uid);
			});
		} else {
			$state.go('tabsController.tersimpan');
		}
	});

	$scope.getHistory = function(uid) {
		$scope.transactions = [];
		Services.getHistory(uid).then(function(transactions) {
			for (var id in transactions) {
				Services.getTransaksiDetails(transactions[id].kurir, transactions[id].indexTransaksi).then(function(transaksi) {
					$scope.transactions.push(transaksi);
				});
			}
		}, function(err) {
			console.log('error get transactions :'+err);
		})
	}
})

.controller('ulasanPenggunaCtrl', function($scope, $state, $stateParams) {
	// code here
})