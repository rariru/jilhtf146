angular.module('app.controllers', [])

.controller('restoransCtrl', function($scope, $stateParams, Services, $ionicLoading, $cordovaToast, $ionicTabsDelegate, $cordovaSocialSharing, $timeout) {
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
		loadResto();
		$scope.$broadcast('scroll.refreshComplete');
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
			case 'all' : {
				// console.log('halo');
				Services.getAllRestorans(flag).then(function(restorans) {
					if(!$scope.restorans) {
						$scope.restorans = [];
					}

					if(restorans) {
						loadFlag = true;

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
					}
					
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');

					// console.log(flag +" | "+ flag2);
					if(flag >= flag2) {
						flag--;
						failCounter++;
					} else {
						failCounter = 0;
					}
					flag2 = flag;
				}, function(reason) {
					console.log('error fetch data');
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}).finally(function() {
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
							});
						}

					}
				}, function(reason) {
					console.log('error fetch data');
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					$ionicLoading.hide();
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
		$ionicPopup.alert({
			title: 'Coming Soon',
			template: '<center>Layanan ini akan segera hadir</center>',
			okText: 'OK',
			okType: 'button-balanced'
		});
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
		$ionicPopup.alert({
			title: 'Coming Soon',
			template: '<center>Layanan ini akan segera hadir</center>',
			okText: 'OK',
			okType: 'button-balanced'
		});
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
  
.controller('jelajahCtrl', function($scope, $ionicSlideBoxDelegate, Services, $state, $ionicLoading, $cordovaToast, $cordovaGoogleAnalytics, config, $ionicPopup, $cordovaAppVersion) {
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 5000
    });

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
    	analytics.trackView('Jelajah');
    	console.log('trackView, Jelajah');
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
})

.controller('pencarianCtrl', function($scope, $stateParams, $ionicLoading, Services, $cordovaToast, $cordovaSocialSharing, config, $timeout) {
	$scope.category = 'Pencarian';
	$scope.user = {};
	$scope.user.query = $stateParams.query;
	
	// pindah di on enter
    // analytics.trackView('Pencarian');
    // console.log('trackView, Pencarian');

    $scope.$on('$ionicView.enter', function() {
    	analytics.trackView('Pencarian');
    	console.log('trackView, Pencarian');
    });
	
    $scope.searchQuery = function() {
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
						}
					} else {
						makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
						console.log("No result");
					}
				});
			}
		});
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
   
.controller('tersimpanCtrl', function($scope, Services, $cordovaToast, $state, $cordovaSocialSharing, $ionicLoading, $timeout) {
	$scope.category = 'Tersimpan';

	// pindah di on enter
	//
	// analytics.trackView('Tersimpan');
	// console.log('trackView, Tersimpan');

	var savedRestorans = [];
	$scope.restorans = [];

	$scope.$on('$ionicView.enter', function() {
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
	});

	$scope.getRestorans = function() {
		var temp = Services.getSavedRestorans();
		savedRestorans = temp.slice(0);
		savedRestorans.reverse();

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
		loadFlag = true;

		console.log('update');
		savedRestorans = news;
		$scope.restorans = [];
		if(news && news.length > 0) {
			for(var i=0; i<news.length; i++) {
				Services.getRestoranDetails(news[i]).then(function(restoran) {
					if(restoran) {
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

					var contentString = '<p><b>'+restoran.namaResto+'</b></p>';

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

	$scope.$on('$ionicView.enter', function() {
		// $ionicLoading.show({
	 //      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	 //      duration: 5000
	 //    });

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
		timeout: 2000,
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
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		$scope.map = new google.maps.Map(document.getElementById('mangan-peta'), mapOptions);

		// wait till map loaded
		google.maps.event.addListener($scope.map, 'idle', function() {
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

			// $ionicLoading.hide();
		}, function(reason) {
			console.log('error');
			console.log(reason);

			// $ionicLoading.hide();
		});
	}

	function addInfoWindow(marker, message, index) {
		// console.log('waaaahaa');
		var infoWindow = new google.maps.InfoWindow({
			content: '<a href="#/page1/tab1/restoran/'+ index +'">'+ message +'</a>',
			maxWidth: 100
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
		console.log('ulasanMenu')
		$scope.$broadcast('scroll.refreshComplete');
	}

	$scope.getMenu();
})

.controller('promoCtrl', function($scope, $state, $ionicLoading, $cordovaToast, Services, $timeout) {
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
	    		makeToast('Koneksi tidak stabil', 1500, 'bottom');
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
})