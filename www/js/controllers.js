angular.module('app.controllers', [])

.controller('main', function($scope, $stateParams, $localStorage, Analytics) {
	$localStorage.badge = 0;
	$scope.badge = $localStorage.badge;
})

.controller('restoransCtrl', function($scope, $stateParams, Services, $ionicLoading, $cordovaToast, $ionicTabsDelegate, $cordovaSocialSharing, $timeout, Analytics, $state, $localStorage) {
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

	$scope.category = $stateParams.name;

	var category = $stateParams.category;
	var flag = new Date().getTime();
	var flag2 = flag;
	var failCounter = 0;

	$scope.$on('$ionicView.enter', function() {
		// Analytics.logView('Kategori'+ $scope.category);
		// console.log('trackView, Kategori, '+$scope.category);

		// trackView
		Analytics.logViewArr(['Kategori', $scope.category]);

		// trackEvent
		Analytics.logEvent('Kategori', $scope.category, 'Seen');
		Analytics.logEvent('Jelajah', 'Kategori', $scope.category);

		// trackUser
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Kategori",
			$scope.category,
			"Seen"
		]);
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Jelajah",
			"Kategori",
			$scope.category,
		]);

		failCounter = 0;
	});

	$scope.getRestorans = function() {
		loadFlag = false;
		$scope.nodata = false;
		$scope.notersimpan = false;

	    $timeout(function() {
	    	// $ionicLoading.hide();
	    	$scope.$broadcast('scroll.refreshComplete');
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
				// analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
				Analytics.logEvent('Kategori', $scope.category, 'Unsave');
				Analytics.logMerchant(index, 'Unsave');

				// trackuser
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Kategori",
					$scope.category,
					"Unsave"
				]);
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Kuliner",
					index,
					"Unsave"
				]);

				makeToast('Restoran telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					// analytics.trackEvent('Simpan Kuliner', 'Simpan', index, 5);
					Analytics.logEvent('Simpan Kuliner', 'Simpan');
					Analytics.logMerchant(index, 'Save');
					Analytics.logEvent('Kategori', $scope.category, 'Save');
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not ever happen.');
				}
			}, function(reason) {
				// analytics.trackEvent('Simpan Kuliner', 'Simpan Penuh');
				Analytics.logEvent('Simpan Kuliner', 'Simpan Penuh');
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
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}

		var link = 'Download apliasinya bit.ly/download-mangan untuk Android dan bit.ly/download-mangan-ios untuk iPhone';
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto+" Buka di aplikasi MANGAN untuk info selengkapnya.";

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			// analytics.trackEvent('Share', 'Share Kuliner', index);
			Analytics.logMerchant(index, 'Share');
			Analytics.logEvent('Kategori', $scope.category, 'Share');
			Analytics.logEvent('Share', 'Kuliner', 'Success');
			makeToast('Berhasil membagikan', 1500, 'bottom');
			console.log('trackEvent, Share, '+index);
		}, function(err) {
			// analytics.trackEvent('Error', 'Share', index, 5);
			Analytics.logEvent('Share', 'Kuliner', 'Error');
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	$scope.loadMoreResto = function() {
		loadResto();
	}

	$scope.canLoadResto = function() {
		return (failCounter < 3);
	}

	function loadResto() {
		switch(category) {
			case 'terbaru': {
				Services.getNewRestorans(flag).then(function(restorans) {
					if(restorans) {
						loadFlag = true;
						$scope.nodata = false;

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
			case 'delivery' : {
				Services.getAllRestorans(flag).then(function(restorans) {
					if(!$scope.restorans) {
						$scope.restorans = {};
					}
					if(restorans) {
						loadFlag = true;
						$scope.nodata = false;
						var n = 0;
						for(var id in restorans) {
							if(restorans[id].delivery) {
								n++;
							} else {
								console.log(restorans[id].namaResto);
								delete restorans[id];
							}
						}

						var i=0;
						for(var id in restorans) {
							if(!(id in $scope.restorans)) {
								$scope.restorans[id] = restorans[id];
							}

							if(restorans[id].tglInput < flag) {
								flag = restorans[id].tglInput;
							}
						}
					} else if ($scope.restorans.length <= 0) {
						$scope.nodata = true;
					}
					
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');

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
			case 'all' : {
				Services.getAllRestorans(flag).then(function(restorans) {
					if(!$scope.restorans) {
						$scope.restorans = {};
					}

					if(restorans) {
						console.log("adaresto");
						loadFlag = true;
						$scope.nodata = false;

						var n = 0;
						for(var id in restorans) {
							n++;
							// console.log(id);
						}

						var i=0;
						for(var id in restorans) {
							if(!(id in $scope.restorans)) {
								$scope.restorans[id] = restorans[id];
							}
							// console.log(restorans[id].tglInput);
              
							if(restorans[id].tglInput < flag) {
								flag = restorans[id].tglInput;
							}
						}
					} else if ($scope.restorans.length <= 0) {
						console.log("gaada resto");
						$scope.nodata = true;
					}
					
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');

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
				Services.getRestoranCategory(category).then(function(restorans) {
					if(restorans) {
						loadFlag = true;

						$scope.restorans = {};

						for(var r in restorans) {
							Services.getRestoranDetails(r).then(function(restoran) {
								// $scope.restorans.push(restoran);
								$scope.restorans[restoran.index] = restoran;

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
	}

	$scope.openRestoran = function(index, image) {
		if (image) {
			Analytics.logEventArr(['Buka Restoran', 'Click Gambar']);
			Analytics.logEventArr(['Kategori', $scope.category, 'Buka Restoran', 'Click Gambar']);
		} else {
			Analytics.logEventArr(['Buka Restoran', 'Click Icon More']);
			Analytics.logEventArr(['Kategori', $scope.category, 'Buka Restoran', 'Click Icon More']);
		}
		$state.go('tabsController.restoran', {index: index});
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

.controller('restoranCtrl', function($scope, $stateParams, Services, $ionicLoading, $cordovaToast, $ionicModal, $state, $ionicPopup, $timeout, Analytics, $cordovaSocialSharing, $ionicHistory, $ionicPopup, $cordovaAppVersion) {
	var loadFlag = false;
	$scope.loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Kuliner');
		Analytics.logMerchant($stateParams.index, 'Seen');
	});

	$scope.restoran = null;
	$scope.menus = null;
	$scope.reviews = null;
	$scope.user = {
		rating: 5
	};


	$scope.getRestoran = function() {
		Services.getRestoranDetails($stateParams.index).then(function(restoran) {
			if(restoran) {
				$scope.restoran = restoran;
				loadFlag = true;
				$scope.loadFlag = true;

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
						refreshRatingReview();
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
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				Services.getProfileByUid(profile.uid).then(function(dataUser) {
					if (dataUser) {
						$scope.dataUser = dataUser;
						console.log(JSON.stringify(dataUser));
						Services.updateRatingReview(
							$scope.restoran.index, 
							$scope.dataUser.name, 
							$scope.dataUser.photoUrl,
							$scope.user.rating,
							$scope.user.titleReview,
							$scope.user.review
						).then(function(result) {
							$scope.reviews = null;

							Services.updateJmlSad($scope.restoran.index).then(function(result) {
								refreshRatingReview();
							});
							refreshRatingReview();
							Analytics.logMerchant($stateParams.index, 'Rating Review');
						}, function(reason) {
							console.log('gagal review');
						});
					} else {
						console.log('profil no dataUser found with uid:'+uid);
					}
				});
			});
		} else {
			$ionicPopup.alert({
				title: 'Belum login',
				template: '<center>Kamu harus login dulu</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
			$state.go('login');
		};

		
		$scope.modalRating.hide();

		// if(!$scope.reviews) {
		// 	$scope.reviews = [];
		// }

		// $scope.reviews[$scope.user.reviewer] = {
		// 	reviewer: $scope.user.reviewer,
		// 	review: $scope.user.review
		// };
	};

	function refreshRatingReview() {
		Services.getRestoranReviews($stateParams.index).then(function(reviews) {
			if(reviews) {
				for(var r in reviews) {
					if(reviews[r].review == undefined || reviews[r].review == null) {
						delete reviews[r];
					}
				}
				$scope.reviews = reviews;

				console.log('success');
			}
		}, function(reason) {
			console.log(JSON.stringify(reason));
			console.log('gagal');
		});
	}


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
		// analytics.trackView('Ulasan Kuliner');
		Analytics.logView('Ulasan Kuliner');
		console.log('trackView, Ulasan Kuliner');
		// analytics.trackEvent('Ulasan', 'Ulasan Kuliner', $stateParams.index, 5);
		Analytics.logEvent('Ulasan', 'Ulasan Kuliner', $stateParams.index);
		console.log('trackEvent, Ulasan, Ulasan Kuliner, '+$stateParams.index);
		$scope.modalReview.show();
	};

	$scope.closeReview = function() {
		$scope.modalReview.hide();
	};

	$scope.openMenu = function(index) {
		// analytics.trackView('Ulasan Menu Kuliner');
		Analytics.logView('Ulasan Menu');
		// analytics.trackEvent('Ulasan', 'Ulasan Menu Kuliner '+$stateParams.index , index, 5);
		Analytics.logEvent('Kuliner', 'Ulasan Menu');

		$scope.selectedMenu = $scope.menus[index];
		Analytics.logMerchant($stateParams.index, 'Ulasan Menu', $scope.selectedMenu.indexmenu);
		console.log($scope.selectedMenu);
		if (!$scope.selectedMenu.review) {
			// $scope.modalMenuGambar.show();
		}else{
			// $scope.modalMenu.show();
			$state.go('tabsController.ulasanMenu', {'selectedMenu': $scope.selectedMenu});
		}
		// console.log($scope.menu[index]);
	};

	$scope.closeMenu = function() {
		$scope.modalMenu.hide();
	};

	// $scope.openMenuGambar = function(index) {
	// 	// analytics.trackView('Gambar Ulasan Menu Kuliner');
	// 	Analytics.logView('Gambar Ulasan Menu Kuliner');
	// 	console.log('trackView, Gambar Ulasan Menu Kuliner');
	// 	// analytics.trackEvent('Ulasan', 'Gambar Ulasan Menu Kuliner '+$stateParams.index, index, 5);
	// 	Analytics.logEvent('Ulasan', 'Gambar Ulasan Menu Kuliner '+ $stateParams.index, index);
	// 	console.log('trackEvent, Ulasan, Gambar Ulasan Menu Kuliner '+$stateParams.index+', '+index);

	// 	Analytics.logMerchant($stateParams.index, 'Ulasan Menu', index);
	// 	$scope.selectedMenu = $scope.menus[index];
	// 	// console.log($scope.selectedMenu);
	// 	$scope.modalMenuGambar.show();
	// };

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
		// cek sdh login blm, blm munculnotif utk login
		//else
		// $scope.modalRating.show();

		// Coming Soon
		// analytics.trackEvent('Coming Soon', 'Ulasan Pengguna', 'Tombol Ulasan', 10);
		Analytics.logEvent('Rating Review', 'Ulasan Pengguna', 'Tombol Ulasan');
		var user = firebase.auth().currentUser;
		if (user) {
			$scope.modalRating.show();
		} else {
			$state.go('login');
		}
	};

	$scope.pesan = function() {
		Analytics.logMerchant($stateParams.index, 'Tombol Pesan');
		Analytics.logEvent('Kuliner', 'Tombol Pesan');
	    Services.getVersion().then(function(version) {
	    	if (version) {
	    		// if (config.version < version) {
	    		$cordovaAppVersion.getVersionCode().then(function(currentVersion) {
					$ionicLoading.hide();

	    			if (parseInt(currentVersion) < version) {
				    	$ionicPopup.alert({
							title: 'Update Aplikasi',
							template: '<center>Update Aplikasi untuk melanjutkan</center>',
							okText: 'Update',
							okType: 'button-oren',
						}).then(function(res) {
							if(res) {
								Analytics.logEvent('Pesan Antar', 'Alert', 'Update Aplikasi');
								window.open('https://play.google.com/store/apps/details?id=com.manganindonesia.mangan', '_system', 'location=yes');
							}
						});
		    		} else {
						Services.getSettingsDelivery().then(function(settings) {
							if (settings) {
								if (settings.status) {
									Analytics.logEvent('Pesan Antar', 'Tombol Pesan');

									///////////////////
									// fitur pesan
									if ($scope.restoran.delivery) {
										var user = firebase.auth().currentUser;
										if (user) {
											$state.go('tabsController.pesan', {'index': $scope.restoran.index});
										} else {
											Analytics.logEvent('Pesan Antar', 'Alert', 'Login')
											$state.go('login');
										}
									} else {
										//////////////////
										// tidak mendukung pesan antar
										Analytics.logEvent('Pesan Antar', 'Alert', 'Tidak Mendukung');
										$ionicPopup.alert({
											title: 'Oops',
											template: '<center>Maaf kuliner ini belum mendukung pesan antar</center>',
											okText: 'OK',
											okType: 'button-oren'
										});
									}
								} else {
									Analytics.logEvent('Pesan Antar', 'Alert', 'Tutup');
									$ionicPopup.alert({
										title: 'Pemberitahuan',
										template: '<center>'+settings.message+'</center>',
										okText: 'OK',
										okType: 'button-oren'
									});
								}
							}
						})
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
	};

	$scope.ulasanPengguna = function(compose) {
		var user = firebase.auth().currentUser;
		if (!user && compose) {
			Analytics.logEvent('Ulasan Pengguna', 'Alert', 'Login');
			$state.go('login');
		} else {
			if (compose) {
				Analytics.logEvent('Ulasan Pengguna', 'Icon Tulis Ulasan');		
				Analytics.logEvent('Kuliner', 'Icon Tulis Ulasan');		
			} else if(!compose) {
				Analytics.logEvent('Ulasan Pengguna', 'Button Tulis Ulasan');	
				Analytics.logEvent('Kuliner', 'Tombol Tulis Ulasan');
			}
			Analytics.logMerchant($scope.restoran.index, 'Ulasan Pengguna');
			$state.go('tabsController.ulasanPengguna', {'namaResto': $scope.restoran.namaResto, 'indexResto': $scope.restoran.index, 'compose': compose});			
		}
		// if (user && compose) {
		// 	$state.go('tabsController.ulasanPengguna', {'namaResto': $scope.restoran.namaResto, 'indexResto': $scope.restoran.index, 'compose': compose});	
		// } else if (user && !compose) {
		// 	$state.go('tabsController.ulasanPengguna', {'namaResto': $scope.restoran.namaResto, 'indexResto': $scope.restoran.index, 'compose': compose});
		// } else if (!user && compose) {
		// 	$state.go('login');
		// } else if (!user && !compose) {
		// 	$state.go('tabsController.ulasanPengguna', {'namaResto': $scope.restoran.namaResto, 'indexResto': $scope.restoran.index, 'compose': compose});	
		// }
	}

	$scope.shareRestoran = function(index) {
		var resto = $scope.restoran;
		var link = 'Selengkapnya di aplikasi MANGAN https://mobilepangan.com/'+resto.index;
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto+" Buka di aplikasi MANGAN untuk info selengkapnya.";

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			Analytics.logEvent('Share', 'Kuliner', 'Success');
			Analytics.logEvent('Kuliner', 'Share');
			Analytics.logMerchant($stateParams.index, 'Share');
			makeToast('Berhasil membagikan', 1500, 'bottom');
		}, function(err) {
			// analytics.trackEvent('Error', 'Share', index, 5);
			Analytics.logEvent('Share', 'Kuliner', 'Error')
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});
	}

	$scope.saveRestoran = function(index) {
		if(Services.checkSavedRestoran(index)) {
			Services.deleteRestoran(index).then(function() {
				// analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
				Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
				Analytics.logEvent('Kuliner', 'Hapus Simpan');
				console.log('trackEvent, Hapus Simpan, '+index);
				Analytics.logMerchant($stateParams.index, 'Unsave');
				makeToast('Restoran telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					// analytics.trackEvent('Simpan Kuliner', 'Simpan', index, 5);
					Analytics.logEvent('Simpan Kuliner', 'Simpan');
					Analytics.logEvent('Kuliner', 'Simpan');
					console.log('trackEvent, Simpan, '+index);
					Analytics.logMerchant($stateParams.index, 'Save');
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not ever happen.');
				}
			}, function(reason) {
				// analytics.trackEvent('Simpan Kuliner', 'Simpan Penuh');
				Analytics.logEvent('Simpan Kuliner', 'Simpan Penuh');
				console.log('trackEvent, Simpan Penuh');
				makeToast('Penyimpanan restoran penuh (max. 5)', 1500, 'bottom');
			});
		}
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	$scope.call = function(tel) {
		if (tel) {
			Analytics.logMerchant($stateParams.index, 'Call');
			Analytics.logEvent('Kuliner', 'Call');
			window.open('tel:'+tel, '_system', 'location=yes');			
		} else {
			Analytics.logMerchant($stateParams.index, 'Tombol Call');
			Analytics.logEvent('Kuliner', 'Tombol Call Tidak Tersedia');
			$ionicPopup.alert({
				title: 'Perhatian',
				template: '<center>Nomor telepon tidak tersedia</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		}
	}

	$scope.navigate = function(index) {
		if ($scope.restoran.map) {
			Analytics.logEvent('Kuliner', 'Tombol Lokasi');
			Analytics.logMerchant($stateParams.index, 'Tombol Lokasi');
			$state.go('tabsController.peta', { 'index': index } )			
		} else {
			Analytics.logEvent('Kuliner', 'Tombol Lokasi Tidak Tersedia');
			Analytics.logMerchant($stateParams.index, 'Tombol Lokasi');
			$ionicPopup.alert({
				title: 'Perhatian',
				template: '<center>Lokasi tidak tersedia</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		}
	}

	$scope.openMenuBook = function(index) {
		Analytics.logMerchant(index, 'Buku Menu');
		Analytics.logEvent('Kuliner', 'Buku Menu');
		$state.go('tabsController.menus', {'index': index});
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

.controller('menusCtrl', function($scope, $stateParams, Services, $ionicModal, $ionicLoading, $cordovaToast, $ionicPopup, $state, $timeout, Analytics, $cordovaAppVersion) {
	var loadFlag = false;
	$scope.loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 2500);

    $scope.$on('$ionicView.enter', function() {
    	$scope.getMenus();
    	// analytics.trackView('Menu Kuliner');
    	Analytics.logView('Buku Menu');
	    console.log('trackView, Menu Kuliner');
	    // analytics.trackEvent('Menu', 'Lihat Menu', $stateParams.index, 5);
	    console.log('trackEvent, Menu, Lihat Menu, '+$stateParams.index);
    });

    $scope.getMenus = function() {
		Services.getRestoranMenus($stateParams.index).then(function(menus) {
			if(menus) {
				loadFlag = true;
				$scope.loadFlag = true;
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

    // $scope.getMenus();

	// $ionicModal.fromTemplateUrl('templates/ulasanMenu.html', {
	// 	scope: $scope,
	// 	animation: 'slide-in-up'
	// }).then(function(modal) { $scope.modalMenu = modal; });

	// $ionicModal.fromTemplateUrl('templates/gambarMenu.html', {
	// 	scope: $scope,
	// 	animation: 'slide-in-up'
	// }).then(function(modal) { $scope.modalMenuGambar = modal; });

	// $scope.openMenu = function(index) {
	// 	// analytics.trackView('Ulasan Menu Kuliner');
	// 	Analytics.logView('Ulasan Menu Kuliner');
	// 	console.log('trackView, Ulasan Menu Kuliner');
	// 	// analytics.trackEvent('Ulasan', 'Ulasan Menu Kuliner '+$stateParams.index , index, 5);
	// 	Analytics.logEvent('Ulasan', 'Ulasan Menu Kuliner '+ $stateParams.index, index);
	// 	console.log('trackEvent, Ulasan, Ulasan Menu Kuliner '+$stateParams.index+', '+index);
	// 	$scope.selectedMenu = $scope.menus[index];
	// 	console.log($scope.selectedMenu);
	// 	if (!$scope.selectedMenu.review) {
	// 		$scope.modalMenuGambar.show();
	// 	}else{
	// 		// $scope.modalMenu.show();
	// 		$state.go('tabsController.ulasanMenu', {'selectedMenu': $scope.selectedMenu});
	// 	}
	// 	// console.log($scope.menu[index]);
	// };

	// $scope.closeMenu = function() {
	// 	$scope.modalMenu.hide();
	// };

	// $scope.openMenuGambar = function(index) {
	// 	// analytics.trackView('Gambar Ulasan Menu Kuliner');
	// 	Analytics.logView('Gambar Ulasan Menu Kuliner');
	// 	console.log('trackView, Gambar Ulasan Menu Kuliner');
	// 	// analytics.trackEvent('Ulasan', 'Gambar Ulasan Menu Kuliner '+$stateParams.index, index, 5);
	// 	Analytics.logEvent('Ulasan', 'Gambar Ulasan Menu Kuliner '+ $stateParams.index, index);
	// 	console.log('trackEvent, Ulasan, Gambar Ulasan Menu Kuliner '+$stateParams.index+', '+index);
	// 	$scope.selectedMenu = $scope.menus[index];
	// 	$scope.selectedMenu = $scope.menus[index];
	// 	// console.log($scope.selectedMenu);
	// 	$scope.modalMenuGambar.show();
	// };

	// $scope.closeMenuGambar = function() {
	// 	$scope.modalMenuGambar.hide();
	// };

	$scope.pesan = function() {
		Analytics.logMerchant($stateParams.index, 'Tombol Pesan');
		Analytics.logEvent('Buku Menu', 'Tombol Pesan');
	    Services.getVersion().then(function(version) {
	    	if (version) {
	    		// if (config.version < version) {
	    		$cordovaAppVersion.getVersionCode().then(function(currentVersion) {
					$ionicLoading.hide();

	    			if (parseInt(currentVersion) < version) {
				    	$ionicPopup.alert({
							title: 'Update Aplikasi',
							template: '<center>Update Aplikasi untuk melanjutkan</center>',
							okText: 'Update',
							okType: 'button-oren',
						}).then(function(res) {
							if(res) {
								Analytics.logEvent('Update', 'Tombol Update', 'Pesan Antar');
								window.open('https://play.google.com/store/apps/details?id=com.manganindonesia.mangan', '_system', 'location=yes');
							}
						});
		    		} else {
						Services.getSettingsDelivery().then(function(settings) {
							if (settings) {
								if (settings.status) {
									Analytics.logEvent('Pesan Antar', 'Tombol Pesan');

									///////////////////
									// fitur pesan
									if ($scope.restoran.delivery) {
										var user = firebase.auth().currentUser;
										if (user) {
											$state.go('tabsController.pesan', {'index': $scope.restoran.index});
										} else {
											$state.go('login');
										}
									} else {
										//////////////////
										// tidak mendukung pesan antar
										$ionicPopup.alert({
											title: 'Oops',
											template: '<center>Maaf kuliner ini belum mendukung pesan antar</center>',
											okText: 'OK',
											okType: 'button-oren'
										});
									}
								} else {
									$ionicPopup.alert({
										title: 'Pemberitahuan',
										template: '<center>'+settings.message+'</center>',
										okText: 'OK',
										okType: 'button-oren'
									});
								}
							}
						})
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
	};

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})
  
.controller('jelajahCtrl', function($scope, $ionicSlideBoxDelegate, Services, $state, $ionicLoading, $cordovaToast, $cordovaGoogleAnalytics, config, $ionicPopup, $cordovaAppVersion, $cordovaGeolocation, $http, $ionicHistory, Analytics, $ionicModal, $localStorage) {
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 1000
    });
    // set default selected city to Surakarta,
    // though the default city has been set in Services
	$scope.selectedCity = $localStorage.location? $localStorage.location: '';

	console.log("localStorage token "+$localStorage.token);

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
					Analytics.logUser($localStorage.indexUser, 'Jelajah');
					var branchEvent = [];
					branchEvent.push($localStorage.indexUser);
					branchEvent.push('Auth');
					branchEvent.push('Facebook');
					Analytics.logUserArr(branchEvent);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
					Analytics.logUser($localStorage.indexUser, 'Jelajah');
					branchEvent.push($localStorage.indexUser);
					branchEvent.push('Auth');
					branchEvent.push('Google');
					Analytics.logUserArr(branchEvent);
				} else {
					console.log('logged in with another provider');
				}
				if ($scope.queue == 'undefined' || $scope.process == 'undefined') {
					$scope.getOrder(profile.uid);
				} else {
					$scope.queue.$destroy();
					$scope.process.$destroy();
					console.log('wis enek');
					$scope.getOrder(profile.uid);
				}
			});
		} else {
			$scope.dataUser = {
				'photoUrl' : 'img/cat.jpg'
			};
		}
	})

    Services.getVersion().then(function(version) {
    	if (version) {
    		$cordovaAppVersion.getVersionCode().then(function(currentVersion) {
				$ionicLoading.hide();
    			if (parseInt(currentVersion) < version) {
			    	$ionicPopup.confirm({
						title: 'Update Aplikasi',
						template: '<center>Versi baru aplikasi tersedia di play store</center>',
						okText: 'OK',
						cancelText: 'Nanti',
						okType: 'button-oren',
						cancelType: 'button-clear'
					}).then(function(res) {
						if(res) {
							Analytics.logEvent('Jelajah', 'Update', 'Update');
							var branchEvent = [];
							branchEvent.push($localStorage.indexUser? $localStorage.indexUser : $localStorage.token);
							branchEvent.push('Update');
							branchEvent.push('Update');
							Analytics.logUserArr(branchEvent);
							window.open('https://play.google.com/store/apps/details?id=com.manganindonesia.mangan', '_system', 'location=yes');
						} else {
							var branchEvent = [];
							branchEvent.push($localStorage.indexUser? $localStorage.indexUser : $localStorage.token);
							branchEvent.push('Update');
							branchEvent.push('Nanti');
							Analytics.logUserArr(branchEvent);
							Analytics.logEvent('Jelajah', 'Update', 'Nanti');
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
		$scope.queue = [];
		$scope.process = [];
		// trackView
    	Analytics.logView('Jelajah');
    	// console.log('trackView, Jelajah');
	    // function _waitForAnalytics(){
	    //     if(typeof analytics !== 'undefined'){
	    //         analytics.startTrackerWithId(config.analytics);
	    //         // pindah di on enter
			  //   // analytics.trackView('Jelajah');
			  //   Analytics.logView('Jelajah');
	    //     }
	    //     else{
	    //         setTimeout(function(){
	    //             _waitForAnalytics();
	    //         },10000);
	    //     }
	    // };
	    // _waitForAnalytics();

		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
					Analytics.logUser($localStorage.indexUser, 'trackView', 'Jelajah');
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
					Analytics.logUser($localStorage.indexUser, 'trackView', 'Jelajah');
				} else {
					console.log('logged in with another provider');
				}
				$scope.queue = [];
				$scope.process = [];
				$scope.getOrder(profile.uid);
			});
		} else {
			console.log('not logged in');
			$scope.dataUser = "";
			Analytics.logUser($localStorage.indexUser, 'trackView', 'Jelajah');
		}

		if ($localStorage.location == null || $localStorage.location == '') {
			console.log("localStorage.location null");
			//hidupkan untuk pilih lokasi, otomatis, atau lewat pupup
		    $scope.setLocation();
		} else {
			console.log($localStorage.location);
		}

		$scope.greeting();
		$scope.getSliders();
    });

	$scope.sliderOptions = {
		loop: false,
		// autoplay: true,
		speed: 1000,
		// pagination: false

		onInit: function() {
			console.log('init slider');
			$scope.initSlide();
		},

		onSlideChangeEnd: function(index) {
			$scope.slideChange(index);
		}
	};

	$scope.initSlide = function() {
		Services.getSliders().then(function(sliders) {
			if (sliders) {
				$scope.slidersArr = [];
				for(var r in sliders) {
					$scope.slidersArr.push(sliders[r]);
				}
			}
			Analytics.logEventArr(['Ads', 'Slider', $scope.slidersArr[0].index, 'View'])
		});
	}

	$scope.slideChange = function(index) {
		var branchEvent = [];
			branchEvent.push('Ads');
			branchEvent.push('Slider');
			branchEvent.push($scope.slidersArray[index.activeIndex].index);
			branchEvent.push('View');
		Analytics.logEventArr(branchEvent);
	}

	$scope.user = {};

	if (firebase == 'undefined') {
		console.log('Error firebase undefined');
		makeToast('Error koneksi tidak stabil', 1500, 'bottom');
	}

	$scope.getProfileByUid = function(uid) {
		Services.getProfileByUid(uid).then(function(dataUser) {
			if (dataUser) {
				$localStorage.indexUser = dataUser.index;
				$scope.dataUser = dataUser;
			} else {
				$scope.dataUser = "";
			}
		})
	}

	$scope.searchQuery = function() {
		if ($scope.user.query == null) {
			console.log($scope.user.query);
		} else {
			Analytics.logEvent('Jelajah', 'Pencarian');
			$state.go('tabsController.pencarian', {'query': $scope.user.query});
			delete $scope.user.query;
		}
	};

	$scope.rekomendasikan = function() {
		Analytics.logEvent('Jelajah', 'Tombol Rekomendasi Restoran');
		$state.go("tabsController.rekomendasi"); 
	}

	$scope.transaksi = function() {
		Analytics.logEvent('Jelajah', 'Notifikasi Transaksi');
		$state.go('tabsController.transaksi');
	}

	$scope.daftar = function() {
		Analytics.logEvent('Jelajah', 'Tombol Daftar Restoran');
		$state.go("tabsController.daftar");
	}

	$scope.getSliders = function() {
		Services.getSliders().then(function(sliders) {
			if (sliders) {
				$scope.sliders = sliders;
				$scope.slidersArray = [];
				var image = [];
				for(var r in sliders) {
					image.push(sliders[r].url);
					$scope.slidersArray.push(sliders[r]);
				}
				$scope.image = image;
				Analytics.logEvent('Ads', 'Slider', 'Loaded');
				Analytics.logView('Slider');
			} else {
				Analytics.logEvent('Ads', 'Slider', 'Not Load');
				console.log('Tidak ada slider');
			}
		}, function(err) {
			Analytics.logEvent('Ads', 'Slider', 'Not Load');
			makeToast('Error koneksi tidak stabil', 1500, 'bottom');
			console.log(err);
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

	$ionicModal.fromTemplateUrl('templates/pickLocation.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modal = modal; });

	// get location and weather
	$scope.greeting = function() {
		var coords = {
			latitude: -7.569527,
			longitude: 110.830289
		};

		var options = {
			timeout: 10000,
			enableHighAccuracy: false
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
			// 	okType: 'button-oren'
			// }).then(function(res) {
			// 	showMap();
			// });
		});
	}

	$scope.setLocation = function() {
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

			$http.get(
					"https://maps.googleapis.com/maps/api/geocode/json?latlng="+coords.latitude+","+coords.longitude+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ"
				).success(function(result) {
				$localStorage.location = result.results[1].address_components[1].short_name;
				if ($localStorage.location == "Kota Surakarta") {
					console.log('ada di Solo');
					// Code fetch database solo
				} else if ($scope.kota == "Yogyakarta") {
					console.log('ada di Jogja');
					// Code fetch database jogja
				} else {
					//pick location
					// console.log('tampilkan popup lokasi');
					// $scope.modal.show();
				}
			}).error(function(error) {
				console.log('data error : '+error);
			});
		}, function(error) {
			//pick location
			// console.log("could not get location");
			// console.log('tampilkan popup lokasi');
			// $scope.modal.show();
			
			// show dialog to pick city manually 

			// $ionicPopup.alert({
			// 	title: 'Error',
			// 	template: 'Tidak dapat menemukan sinyal GPS!',
			// 	okText: 'OK',
			// 	okType: 'button-oren'
			// }).then(function(res) {
			// 	showMap();
			// });
		});
	}

	$scope.pilihKota = function(kota) {
		console.log(kota);
		$localStorage.location = kota;
		$scope.modal.hide();
	}

	$scope.getOrder = function(uid) {
		console.log('get order');
		$scope.queue = [];
		$scope.process = [];
		var date = new Date();
		var currentDate = date.getTime() ;
		var lastDayTimestamp = currentDate - 604800000;
		Services.getHistory(uid).then(function(transactions) {
			for (var id in transactions) {
				Services.getTransaksiDetails(transactions[id].kurir, transactions[id].indexTransaksi).then(function(transaksi) {
					console.log(transaksi.status);
					if(transaksi.status == "queue") {
						if (transaksi.tgl >= lastDayTimestamp) {
							console.log(transaksi.tgl);
							$scope.queue.push(transaksi);
						}
					} else if (transaksi.status == "process") {
						if (transaksi.tgl >= lastDayTimestamp) {
							console.log(transaksi.tgl);
							$scope.process.push(transaksi);
						}
					}
				});
			}
		}, function(err) {
			console.log('error get transactions :'+err);
		})
	}

	$scope.gotoURL = function(index, url, tel) {
		if (url) {
			Analytics.logEventArr(['Ads', 'Slider', index, 'Click']);
			window.open(url, '_system', 'location=yes');
		} else if(tel){
			Analytics.logEventArr(['Ads', 'Slider', index, 'Click']);
			window.open('tel:'+tel, '_system', 'location=yes');
		} else {
			console.log('ads clicked');
		}
	}

	$scope.jelajah = function() {
		Analytics.logEvent('Jelajah', 'Tombol Jelajah');
		$state.go('tabsController.restorans', {category: 'all', 'name': 'Terbaru'});
	}

	$scope.login = function() {
		Analytics.logEvent('Jelajah', 'Tombol Login')
		$state.go("login");
	}

	$scope.typeSearch = function() {
		Analytics.logEvent('Jelajah', 'Ketik Pencarian');
	}
})

.controller('pencarianCtrl', function($scope, $stateParams, $ionicLoading, $state, Services, $cordovaToast, $cordovaSocialSharing, config, $timeout, Analytics) {
	$scope.category = 'Pencarian';
	$scope.user = {};
	$scope.user.query = $stateParams.query;
	$scope.notfound = false;

    $scope.$on('$ionicView.enter', function() {
    	Analytics.logView('Pencarian');
    	$scope.notfound = false;
    });
	
    $scope.searchQuery = function() {
    	Analytics.logEvent('Pencarian', 'Query', $scope.user.query || 'empty');
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
	   //      if(typeof analytics !== 'undefined'){
	   //          analytics.startTrackerWithId(config.analytics);
				// analytics.trackEvent('Pencarian', 'Cari', $scope.user.query, 5);
				// console.log('trackEvent, Pencarian, Cari, '+$scope.user.query);
	   //      }
	   //      else{
	   //          setTimeout(function(){
	   //              _waitForAnalytics();
	   //          },10000);
	   //      }
	   		// Analytics.logEvent('Pencarian', 'Query', $scope.user.query);
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

						var ta = 0; // total all restoran
						for(var id in result) {
							ta++;
						}

						// console.log('ta: '+ ta);

						var ia = 0,
							ir = 0,
							tr = 0; // total restoran matches found
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
							Analytics.logEvent('Pencarian', 'Tidak Ditemukan');
							makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
						}
					} else {
						makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
						console.log("No result");
						Analytics.logEvent('Pencarian', 'Tidak Ditemukan');
						$scope.notfound = true;
					}
				}, function(reason) {
					$scope.notfound = true;
					Analytics.logEvent('Pencarian', 'Tidak Ditemukan');
					makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
				});
			}
		});
	}

	$scope.rekomendasikan = function() {
		Analytics.logEvent('Pencarian', 'Tombol Rekomendasi Restoran');
		$state.go('tabsController.rekomendasi');
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
				// analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
				Analytics.logEvent('Pencarian', 'Unsave');
				Analytics.logMerchant(index, 'Unsave');
				// trackuser
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Pencarian",
					$scope.category,
					"Unsave"
				]);
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Pencarian",
					index,
					"Unsave"
				]);

				makeToast('Restoran telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					Analytics.logEvent('Simpan Kuliner', 'Simpan');
					Analytics.logEvent('Pencarian', 'Save');
					Analytics.logMerchant(index, 'Save');
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not be done.');
				}
			}, function(reason) {
				Analytics.logEvent('Simpan Kuliner', 'Simpan Penuh');
				makeToast('Penyimpanan restoran penuh (max. 5)', 1500, 'bottom');
			});
		}
	}

	$scope.shareRestoran = function(index) {
		var resto = null;
		for(var id in $scope.restorans) {
			console.log($scope.restorans[id].index +" | "+ index)
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}

		var link = 'Download apliasinya bit.ly/download-mangan untuk Android dan bit.ly/download-mangan-ios untuk iPhone';
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto+" Buka di aplikasi MANGAN untuk info selengkapnya.";

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			makeToast('Berhasil membagikan', 1500, 'bottom');
			Analytics.logMerchant(index, 'Share');
			Analytics.logEvent('Share', 'Kuliner', 'Success');
			Analytics.logEvent('Pencarian', 'Share');
		}, function(err) {
			Analytics.logEvent('Share', 'Kuliner', 'Error');
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});
	}

    $scope.searchQuery();

	$scope.openRestoran = function(index, image) {
		if (image) {
			Analytics.logEventArr(['Buka Restoran', 'Click Gambar']);
			Analytics.logEventArr(['Pencarian', 'Buka Restoran', 'Click Gambar']);
		} else {
			Analytics.logEventArr(['Buka Restoran', 'Click Icon More']);
			Analytics.logEventArr(['Pencarian', 'Buka Restoran', 'Click Icon More']);
		}
		$state.go('tabsController.restoran', {index: index});
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
   
.controller('tersimpanCtrl', function($scope, Services, $cordovaToast, $state, $cordovaSocialSharing, $ionicLoading, $timeout, $localStorage, $http, $ionicHistory, Analytics) {
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
					Analytics.trackEvent('Auth', 'Sign In', 'Facebook');
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
					Analytics.trackEvent('Auth', 'Sign In', 'Google');
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

	 	// analytics.trackView('Tersimpan');
	 	Analytics.logView('Tersimpan');

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
			// trackEvent
			Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
			Analytics.logEvent('Tersimpan', 'Unsave');
			Analytics.logMerchant(index, 'Unsave');
			// trackuser
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				$scope.category,
				"Unsave"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				index,
				"Unsave"
			]);

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

		var link = 'Download apliasinya bit.ly/download-mangan untuk Android dan bit.ly/download-mangan-ios untuk iPhone';
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto+" Buka di aplikasi MANGAN untuk info selengkapnya.";

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			makeToast('Berhasil membagikan', 1500, 'bottom');
			// analytics.trackEvent('Share', 'Share Kuliner', index);
			Analytics.logEvent('Tersimpan', 'Share')
			Analytics.logMerchant(index, 'Share');
			Analytics.logEvent('Share', 'Kuliner', 'Success');
		}, function(err) {
			Analytics.logEvent('Share', 'Kuliner', 'Error');
			makeToast('Gagal membagikan', 1500, 'bottom');
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

	$scope.openProfile = function(photo) {
		if (photo) {
			Analytics.logEvent('Tersimpan', 'Klik Profile');
		} else {
			Analytics.logEvent('Tersimpan', 'Tombol Profile');
		}
		$state.go('tabsController.profil');
	}

	$scope.openTransaksi = function() {
		Analytics.logEvent('Tersimpan', 'Tombol Transaksi');
		$state.go('tabsController.transaksi');
	}

	$scope.login = function() {
		Analytics.logEvent('Tersimpan', 'Tombol Login');
		$state.go('login');
	}

	$scope.jelajah = function() {
		Analytics.logEvent('Tersimpan', 'Tombol Jelajah');
		$state.go('tabsController.restorans', {category: 'all', 'name': 'Terbaru'});
	}

	$scope.openRestoran = function(index, image) {
		if (image) {
			Analytics.logEvent('Buka Restoran', 'Click Gambar');
			Analytics.logEvent('Tersimpan', 'Buka Restoran', 'Click Gambar');
		} else {
			Analytics.logEvent('Buka Restoran', 'Click Icon More');
			Analytics.logEvent('Tersimpan', 'Buka Restoran', 'Click Icon More');
		}
		$state.go('tabsController.restoran', {index: index});
	}
})

.controller('petaCtrl', function($scope, $state, $stateParams, Services, $cordovaToast, $cordovaGeolocation, $ionicPopup, Analytics) {
	$scope.category = 'Peta';
	
	// console.log($stateParams.index);

	// pindah di on enter
	//
	// analytics.trackView('Peta');
	// console.log('trackView, Peta');
	// analytics.trackEvent('Peta', 'Lihat Peta', $stateParams.index, 5);
	// console.log('trackEvent, Peta, Lihat Peta, '+$stateParams.index);

	$scope.$on('$ionicView.enter', function() {
		// analytics.trackView('Peta');
		Analytics.logView('Peta');
		console.log('trackView, Peta');
		// analytics.trackEvent('Peta', 'Lihat Peta', $stateParams.index, 5);
		Analytics.logMerchant($stateParams.index, 'Lihat Peta');
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
					// analytics.trackEvent('Peta', 'Navigasikan', $stateParams.index, 5);
					Analytics.logEvent('Peta','Tombol Navigasikan');
					Analytics.logEvent('Kuliner','Navigasikan');
					Analytics.logMerchant($stateParams.index, 'Navigate');
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
						// 	okType: 'button-oren'
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
	// 		okType: 'button-oren'
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

.controller('terdekatCtrl', function($scope, $state, $stateParams, Services, $cordovaGeolocation, $ionicPopup, $ionicLoading, Analytics) {
	$scope.category = 'Terdekat';
	$scope.restoranList = {};

	$ionicLoading.show({
		template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
		timeout: 5000
	});

	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Terdekat');
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
			Analytics.logEvent('Terdekat', 'GPS', 'Found');
			console.log('position aru');
			coords = position.coords;
		}

		showMap();
	}, function(error) {
		console.log("could not get location");
		Analytics.logEvent('Terdekat', 'GPS', 'Not Found');

		$ionicPopup.alert({
			title: 'Error',
			template: 'Tidak dapat menemukan sinyal GPS!',
			okText: 'OK',
			okType: 'button-oren'
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
			Analytics.logEvent('Terdekat', 'Load Maps');
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
						// console.log(sw.lat() +' | '+ location.lat +' | '+ ne.lat());
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
							// console.log(lat+' | '+lon);

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

				// add to restorans list untuk keperluan listing restoran terdekat
				// jika konsepnya me-list SEMUA restoran yg di load gunakan atribut jarak pada $scope.restoranList
				// namun jika hanya me-list restoran yg muncul di view (kita kan kalo geser map, marker restoran yg gaada di map diilangin)
				//		gunakan atribut jarak pada $scope.restorans
				// btw. menghitung jarak nya offline pake Haversine formula, soale aku liat di gmap retrieve data ne
				//		harus nunggu konek dulu (kyk promise). Tapi nek semisal ternyata dari gmap bisa lsg retrieve jarak
				//		berarti ganti fungsi gmap tsb aja
				// for (var key in restorans) {
				// 	if (restorans.hasOwnProperty(key)) {
				// 		$scope.restoranList[key] = restorans[key];
				// 		$scope.restoranList[key].jarak = getDistance(coords.latitude, coords.longitude, restorans[key].map.lat, restorans[key].map.long);
				// 		console.log('dist-'+ key +' : '+ $scope.restoranList[key].jarak);
				// 	}
				// }
			} else {
				console.log('no resto');
			}

			/////////////////////
			// cluster map
			// var markerCluster = new MarkerClusterer($scope.map, $scope.markers, {
			// 	imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
			// });

			$ionicLoading.hide();
		}, function(reason) {
			console.log('error');
			console.log(reason);

			$ionicLoading.hide();
		});
	}

	function rad(x) {
		return x * Math.PI / 180;
	};
	// haversine formula LOL
	// http://stackoverflow.com/questions/1502590/calculate-distance-between-two-points-in-google-maps-v3
	function getDistance(lat1, lon1, lat2, lon2) {
		var R = 6378137; // Earth’s mean radius in meter
		var dLat = rad(lat2 - lat1);
		var dLong = rad(lon2 - lon1);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		// console.log(lat1 +' | '+ lon1 +' | '+ lat2 +' | '+ lon2 +' | '+ d);
		return d; // returns the distance in meter
	};

	function addInfoWindow(marker, message, index) {
		// console.log('waaaahaa');
		var infoWindow = new google.maps.InfoWindow({
			content: '<div style="width: auto; font-size: 14px;""><center><a ng-click="gotoRestoran('+index+')" href="#/page1/tab1/restoran/'+ index +'" style="text-decoration: none;"><b>'+ message +'</b><p>Lihat</p></a></center></div>',
			maxWidth: 150
		});

		google.maps.event.addListener(marker, 'click', function () {
			Analytics.logEvent('Terdekat', 'Marker', 'Click');
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
 
.controller('ulasanMenuCtrl', function($scope, $state, $stateParams, Services, Analytics) {
	$scope.getMenu = function() {
		$scope.selectedMenu = $stateParams.selectedMenu;
		console.log('ulasanMenu');
		$scope.$broadcast('scroll.refreshComplete');
	}

	$scope.getMenu();
})

.controller('promoCtrl', function($scope, $state, $ionicLoading, $cordovaToast, Services, $timeout, $localStorage, Analytics, $ionicModal, $cordovaSocialSharing) {
	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Promo');
		console.log('trackView, Promo');
	});

	$scope.openPromo = function(index) {
		// analytics.trackEvent('Promo', 'Click', index, 5);
		Analytics.logEvent('Promo', index, 'Click');
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

	$ionicModal.fromTemplateUrl('templates/promoModal.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.modal = modal; });

	$scope.openModal = function(index) {
		Analytics.logView('Detail Promo');
		Analytics.logEvent('Promo', index, 'Click');
		console.log('Promo, Click, '+index);
		$scope.selectedPromo = $scope.promos[index];
		$scope.modal.show();
	}

	$scope.sharePromo = function(selectedPromo) {
		console.log('Promo, Share, '+selectedPromo.index);
		var link = selectedPromo.extUrl;
		var gambar = selectedPromo.sharedImg;
		var textshared = selectedPromo.namaPromo+' - '+selectedPromo.keterangan+" - Valid hingga : "+selectedPromo.valid+" Nantikan promo menarik lainnya di Aplikasi MANGAN";

		$cordovaSocialSharing.share(textshared, selectedPromo.keterangan, gambar, link)
		.then(function(result) {
			Analytics.logEvent('Promo', selectedPromo.index, 'Share');
			Analytics.logEvent('Share', 'Promo', 'Success');
			makeToast('Berhasil membagikan', 1500, 'bottom');
		}, function(err) {
			Analytics.logEvent('Share', 'Promo', 'Error');
			makeToast('Gagal membagikan', 1500, 'bottom');
		});
	}

	$scope.gotoUrl = function(selectedPromo) {
		if (selectedPromo.extUrl) {
			Analytics.logEvent('Promo', selectedPromo.index, 'OpenUrl');
			console.log('Promo, OpenUrl, '+selectedPromo.index);
			window.open(selectedPromo.extUrl, '_system', 'location=yes');		
		}
	}

	$scope.restoran = function(selectedPromo) {
		Analytics.logEvent('Promo', selectedPromo.index, 'OpenRestoran');
		console.log('Promo, OpenRestoran, '+selectedPromo.index);
		$state.go('tabsController.restoran', {'index': selectedPromo.indexResto});
		$scope.modal.hide();
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

.controller('loginCtrl', function($scope, $state, $ionicLoading, Services, $ionicHistory, $cordovaOauth, $localStorage, $http, Analytics, $ionicPopup, $cordovaToast) {
	Analytics.logView('Auth');
	$scope.fblogin = function() {
		Analytics.logEvent('Auth', 'Tombol', 'Facebook');
		$cordovaOauth.facebook(1764800933732733, ["email", "user_birthday", "user_location"]).then(function(result) {
			console.log(result.access_token);
			$localStorage.fbaccesstoken = result.access_token;
			var credential = firebase.auth.FacebookAuthProvider.credential($localStorage.fbaccesstoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				console.log('Error : '+JSON.stringify(error));
			});
			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
		    });
			// $ionicHistory.goBack();
		}, function(err) {
			console.log('Error oAuth facebook: '+err);
		})
	}

	$scope.googlelogin = function() {
		Analytics.logEvent('Auth', 'Tombol', 'Google');
		$cordovaOauth.google("1054999345220-m4vlisv7o0na684cgcg13s1tj2t4v447.apps.googleusercontent.com", ["email", "profile"]).then(function(result) {
			$localStorage.googleidtoken = result.id_token;
			$localStorage.googleaccesstoken = result.access_token;
			var credential = firebase.auth.GoogleAuthProvider.credential($localStorage.googleidtoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				console.log("Error : "+JSON.stringify(error));
			});
			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
		    });
			// $ionicHistory.goBack();
		}, function(err) {
			console.log('Error oAuth google: '+err);
		})
	}

	// listen to auth change
	firebase.auth().onAuthStateChanged(function(user) {
		// logged in
		if (user) {
			console.log("uid: "+user.uid);
			$scope.user = user;
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					// cek if data already stored
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							// dataUser registered, update data
							Analytics.logEvent('Auth', 'Sign In', 'Facebook');
							makeToast('Berhasil Login');
							$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
								access_token : $localStorage.fbaccesstoken,
								format : "json"
							}}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.updateUserDataLogin($scope.dataUser, $scope.user);
							});
						} else {
							// create new data in firebase from Facebook
							Analytics.logEvent('Auth', 'Sign Up', 'Facebook');
							$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
								access_token : $localStorage.fbaccesstoken,
								format : "json"
							}}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.addUserData($scope.dataUser, $scope.user).then(function(user) {
									makeToast('Berhasil Login');
									console.log(user);
								}, function(err) {
									firebase.auth().signOut().then(function() {
										makeToast('Login gagal, coba dengan email lain');
									});
								})
							});
						}
					}, function(err) {
						// error check user data
						Analytics.logEvent('Auth', 'Auth Failed');
						firebase.auth().signOut();
						makeToast('Login gagal, koneksi tidak stabil');
					})
					$ionicLoading.hide();
					$ionicHistory.goBack();
				} else if (profile.providerId === "google.com") {
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							// dataUser registered, update data
							Analytics.logEvent('Auth', 'Sign In', 'Google');
							makeToast('Berhasil Login');
							$http.get("https://www.googleapis.com/userinfo/v2/me?fields=email,family_name,gender,given_name,hd,id,link,locale,name,picture,verified_email", {
								headers :{
									"Authorization" : "Bearer "+$localStorage.googleaccesstoken
								}
							}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.updateUserDataLogin($scope.dataUser, $scope.user);
							});
						} else {
							// create new data in firebase from Google
							Analytics.logEvent('Auth', 'Sign Up', 'Google');
							$http.get("https://www.googleapis.com/userinfo/v2/me?fields=email,family_name,gender,given_name,hd,id,link,locale,name,picture,verified_email", {
								headers :{
									"Authorization" : "Bearer "+$localStorage.googleaccesstoken
								}
							}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.addUserDataByGoogle($scope.dataUser, $scope.user).then(function(user) {
									makeToast('Berhasil Login');
								}, function(err) {
									firebase.auth().signOut().then(function() {
										makeToast('Login gagal, coba dengan email lain');
									});
								})
							});
						}
					}, function(err) {
						// error check user data
						Analytics.logEvent('Auth', 'Auth Failed');
						firebase.auth().signOut();
						makeToast('Login gagal, koneksi tidak stabil');
					})
					$ionicLoading.hide();
					$ionicHistory.goBack();
				}  else {
					// login dengan cara lain, harusnya tidak terjadi
					Analytics.logEvent('Auth', 'Auth Failed');
					firebase.auth().signOut();
					makeToast('Login gagal, coba dengan email lain');
					$ionicLoading.hide();
					$ionicHistory.goBack();
				}
			});
		}
	})

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	};
})

.controller('profilCtrl', function($scope, $state, $ionicLoading, Services, $http, $localStorage, $ionicHistory, $ionicModal, $cordovaGeolocation, $ionicPopup, $cordovaToast, Analytics) {
	// profile Code here
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 5000
    });

	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Profil');
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
				$ionicLoading.hide();
			} else {
				console.log('profil no dataUser found with uid:'+uid);
				makeToast('Data tidak ditemukan');
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
		Analytics.logEvent('Profil', 'Tombol Update');
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	      duration: 5000
	    });

		Services.updateUserData($scope.dataUser).then(function(result) {
			$ionicLoading.hide();
			Analytics.logEvent('Profil', 'Update');
			makeToast('Data berhasil diperbarui');
		}, function(err) {
			console.log('error');
			$ionicLoading.hide();
		});
	}

	$scope.signOut = function() {
		firebase.auth().signOut().then(function() {
			Analytics.logEvent('Auth', 'Sign Out');
			Analytics.logEvent('Profil', 'Tombol Sign Out')
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
				okType: 'button-oren'
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
					Analytics.logEvent('Terdekat', 'Drag');
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

.controller('pesanCtrl', function($scope, $stateParams, Services, $ionicModal, $ionicLoading, $cordovaToast, $ionicPopup, $state, $timeout, $ionicHistory, Analytics, $localStorage, $ionicPlatform) {
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $scope.tambahan = {};

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

    $scope.$on('$ionicView.enter', function() {
    	// trackView
    	Analytics.logView('Pesan');
	    // Analytics.logEvent('Pesan', 'Lihat Menu', $stateParams.index);

	    // trackMerchant
	    Analytics.logMerchant($stateParams.index, 'Pilih Menu');
    });

	$scope.$on('$ionicView.leave', function() {
		var forwardView = $ionicHistory.forwardView();
		if (forwardView) {
			if (forwardView.title != "Invoice") {
				Analytics.logEvent('Pesan', 'Batal');
				Analytics.logEvent('Pesan Antar', 'Batal Pesan');
				$ionicPopup.alert({
					title: 'Pesanan Dibatalkan',
					template: '<center>Dengan Meninggalkan Halaman Tadi, Maka Daftar Pesanan Anda Akan Dibatalkan</center>',
					okText: 'OK',
					okType: 'button-oren'
				});
			}
		}
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
		if (quantity > 0) {
			$scope.menus[index].quantity = quantity - 1;
			Analytics.logEvent('Pesan', 'Menu', 'Kurangi');
			Analytics.logEvent('Pesan Antar', 'Kurangi Menu');
		} else {
			$scope.menus[index].quantity = 0;
		}
	}

	$scope.addQuantity = function(index, quantity) {
		if (quantity >= 0) {
			$scope.menus[index].quantity = quantity + 1;
			Analytics.logEvent('Pesan', 'Menu', 'Tambah');
			Analytics.logEvent('Pesan Antar', 'Tambah Menu');
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
			Analytics.logEvent('Pesan', 'Alert', 'Minimal Menu');
			// alert('Mohon masukan pesanan minimal 1');
			$ionicPopup.alert({
				title: 'Pilih pesanan',
				template: '<center>Kamu harus memilih pesanan minimal 1</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		} else if($scope.selectedMenus !== ""){
			var user = firebase.auth().currentUser;
			if (user) {
				user.providerData.forEach(function(profile) {
					$scope.uid = profile.uid
				});
			} else {
				Analytics.logEvent('Pesan', 'Alert', 'Login');
				$ionicPopup.alert({
					title: 'Belum login',
					template: '<center>Kamu harus login dulu</center>',
					okText: 'OK',
					okType: 'button-oren'
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
							console.log(restoran.gambar);
							if ($scope.transaksi) {
								$scope.transaksi.pesanan = $scope.selectedMenus;
							} else {
								$scope.transaksi = {
									'indexUser' : dataUser.index,
									'alamat' : restoran.alamat,
									'alamatUser' : null,
									'feedelivery' : 0,
									'indexResto' : restoran.index,
									'keteranganBuka' : restoran.keteranganBuka,
									'gambarResto' : restoran.gambar[0],
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
									'username' : $scope.uid,
									'lineUsername' : dataUser.lineUsername || null,
									'tambahan' : $scope.tambahan.catatan || null,
									'device_token' : $localStorage.token
								}
							}
							$ionicLoading.hide();
							Analytics.logEvent('Pesan', 'Tombol Lanjutkan');
							Analytics.logEvent('Pesan Antar', 'Invoice');
							$state.go('tabsController.invoice', {'transaksi': $scope.transaksi});
							// console.log(JSON.stringify($scope.transaksi));
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

.controller('invoiceCtrl', function($scope, $state, $stateParams, Services, $ionicHistory, $ionicModal, $ionicPopup, $cordovaGeolocation, $http, $ionicLoading, Analytics){
	$scope.invoice = function() {
		$scope.transaksi = $stateParams.transaksi;
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.getKurir = function(){
		Services.getKurir().then(function(listKurir) {
			$scope.listKurir = [];
			for(var r in listKurir){
				if (listKurir[r].show) {
					$scope.listKurir.push(listKurir[r]);
					console.log("listKurir[r] adalah :"+JSON.stringify(listKurir[r]));
				}
			}
		})
	}

	$scope.$on('$ionicView.enter', function() {
    	$scope.invoice();
		$scope.getKurir();
		// trackView
		Analytics.logView('Invoice');
		// trackMerchant
		Analytics.logMerchant($scope.transaksi.indexResto, 'Invoice');
		// Analytics.logEvent('Pesan', 'Invoice '+$scope.transaksi.indexUser, $scope.transaksi.indexResto);
		// new API using array
		// var branch = [];
		// branch.push('Pesan');
		// branch.push('Invoice');
		// branch.push($scope.transaksi.indexResto);
		// branch.push($scope.transaksi.indexUser);
		// Analytics.logEventArr(branch);
    });

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
			Analytics.logEvent('Invoice', 'Menu', 'Kurangi');
			Analytics.logEvent('Pesan Antar', 'Kurangi Menu');
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
			Analytics.logEvent('Invoice', 'Menu', 'Tambah');
			Analytics.logEvent('Pesan Antar', 'Tambah Menu');
		} else {
			$scope.transaksi.pesanan[index].quantity = 1;
		}
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.addOrder = function() {
		Analytics.logEvent('Invoice', 'Tambah Order');
		Analytics.logEvent('Pesan Antar', 'Tambah Order Kembali');
		$ionicHistory.goBack();
	}

	$scope.pickLocation = function() {
		Analytics.logEvent('Invoice', 'Lokasi', 'Pilih Lokasi');
		var coords = {};
		var options = { timeout: 5000, enableHighAccuracy: true };
		$cordovaGeolocation.getCurrentPosition(options).then(function(position) {
			if(position) {
				coords = position.coords;
				Analytics.logEvent('Invoice', 'Lokasi', 'Lokasi Ditemukan');
			}
			showMap();
		}, function(error) {
			$ionicPopup.alert({
				title: 'Lokasi Tidak Ditemukan',
				template: '<center>Nyalakan setting GPS anda atau gunakan pencarian lokasi</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
			Analytics.logEvent('Invoice', 'Lokasi', 'Lokasi Tidak Ditemukan');
			showMap();
		});

		function showMap() {
			console.log('pusat: '+ coords.latitude, coords.longitude);
			if (coords.latitude && coords.longitude) {
				var latlon = new google.maps.LatLng(coords.latitude, coords.longitude);
			} else {
				var latlon = new google.maps.LatLng(-7.569527, 110.830289);
			}

			var mapOptions = { center: latlon, zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP };
			
			$scope.map = new google.maps.Map(document.getElementById('mangan-peta'), mapOptions);

			// create input search
			var input = (document.getElementById('pac-input'));
			var autocomplete = new google.maps.places.Autocomplete(input);
			autocomplete.bindTo('bounds', $scope.map);
			// $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

			var infowindow = new google.maps.InfoWindow();
			var marker = new google.maps.Marker({
				map: $scope.map
			});

			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open($scope.map, marker);
			});

			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				console.log('changed');
				Analytics.logEvent('Invoice', 'Lokasi', 'Cari Lokasi');
				infowindow.close();
				var place = autocomplete.getPlace();
				if (!place.geometry) {
					return;
				}

				if (place.geometry.viewport) {
					$scope.map.fitBounds(place.geometry.viewport);
				} else {
					$scope.map.setCenter(place.geometry.location);
					$scope.map.setZoom(17);
				}

				coords = {};
				coords.latitude = place.geometry.location.lat();
				coords.longitude = place.geometry.location.lng();

				showMap();
			});

			if (coords.latitude && coords.longitude) {
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

				var infoWindow = new google.maps.InfoWindow({
					content: '<div id="content">Lokasi Anda Sekarang</div>',
					maxWidth: 500
				});

				infoWindow.open($scope.mapUser, userMarker);

				$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+coords.latitude+","+coords.longitude+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
					$scope.alamatUser = result.results[0].formatted_address;
					$scope.transaksi.alamatUser = $scope.alamatUser;
					infoWindow.setContent($scope.transaksi.alamatUser);
				}).error(function(error) {
					console.log('data error : '+error);
				});

				google.maps.event.addListener(userMarker, 'dragend', function(evt) {
					$scope.mapUser = {
						'lat' : evt.latLng.lat(),
						'long' : evt.latLng.lng()
					}
					$scope.getAddress(evt.latLng.lat(), evt.latLng.lng());
					updateInfoWindow();
					$scope.transaksi.mapUser = $scope.mapUser;
				})
				// });

				function updateInfoWindow() {
					infoWindow.setContent($scope.transaksi.alamatUser);
				}
			}
		}
		$scope.maps.show();
		Analytics.logView('Pilih Lokasi Pengiriman');
	}

    $scope.disableTap = function() {
	    var input = event.target;

	    // Get the predictions element
	    var container = document.getElementsByClassName('pac-container');
	    container = angular.element(container);

	    // Apply css to ensure the container overlays the other elements, and
	    // events occur on the element not behind it
	    container.css('z-index', '5000');
	    container.css('pointer-events', 'auto');

	    // Disable ionic data tap
	    container.attr('data-tap-disabled', 'true');

	    // Leave the input field if a prediction is chosen
	    container.on('click', function(){
	        input.blur();
	    });
    };

	$scope.checkout = function() {
		Analytics.logEvent('Invoice', 'Tombol Checkout');
		$scope.maps.remove();

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
				okType: 'button-oren'
			});
			Analytics.logEvent('Invoice', 'Alert', 'Login');
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
				okType: 'button-oren'
			});
			Analytics.logEvent('Invoice', 'Alert', 'Tidak Lengkap');
		} else {
			$ionicPopup.confirm({
				title: 'Konfirmasi Pesan',
				template: '<center>Apakah anda akan memesan?</center>',
				okText: 'Ya',
				cancelText: 'Tidak',
				okType: 'button-oren',
				cancelType: 'button-clear'
			}).then(function(res) {
				if(res) {
					Analytics.logEvent('Invoice', 'Konfirmasi', 'Ya');
					$ionicLoading.show({
				      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
				      duration: 10000
				    });

					Analytics.logEvent('Pesan Antar', 'Checkout');
					Analytics.logMerchant($scope.transaksi.indexResto, 'Transaksi');
					Services.addTransaction($scope.transaksi.kurir, $scope.transaksi.indexTransaksi, $scope.transaksi).then(function() {
						Services.addQueue($scope.transaksi.kurir, $scope.transaksi.indexTransaksi).then(function() {
							var notificationData = {
								"notification":{
									"title":"Order Baru",
									"body":"Dari "+$scope.transaksi.namaUser+" ke "+$scope.transaksi.namaResto,
									"sound":"default",
									"icon":"fcm_push_icon"
								},
								"data":{
									"title": "Order Baru",
									"body": "Dari "+$scope.transaksi.namaUser+" ke "+$scope.transaksi.namaResto,
									"indexTransaksi": $scope.transaksi.indexTransaksi
								},
								"to":"/topics/"+$scope.transaksi.kurir,
								"priority":"high"
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

							$ionicHistory.nextViewOptions({
								disableBack: true
							}, function(err) {
								console.log('fail '+err);
							});

							$ionicLoading.hide();
							$state.go('tabsController.jelajah');
							$ionicPopup.alert({
								title: 'Terima Kasih',
								template: '<center>Pesanan anda akan diproses</center>',
								okText: 'OK',
								okType: 'button-oren'
							}).then(function(res) {
								$state.go('tabsController.transaksi');
							})
						})
					}, function(err) {
						console.log(err);
					})
				} else {
					Analytics.logEvent('Invoice', 'Konfirmasi', 'Tidak');
				}
			});
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

	$scope.setFeeDelivery = function(kurir) {
		Services.getKurirDetail(kurir).then(function(kurirDetail) {
			$scope.kurirDetail = kurirDetail;
			console.log(kurirDetail);
			Analytics.logEvent('Kurir', $scope.kurirDetail.index, 'Pilih');
			Analytics.logEvent('Invoice', 'Pilih Kurir');
		});

		Services.getFeeDelivery(kurir).then(function(ongkir) {
			$scope.transaksi.feedelivery = ongkir.ongkir;
			$scope.transaksi.totalHarga = $scope.transaksi.jumlah+$scope.transaksi.feedelivery;
		});
	}

	$scope.tambahCatatan = function() {
		Analytics.logEvent('Invoice', 'Tambah Catatan');
	}

	$ionicModal.fromTemplateUrl('templates/maps.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.maps = modal; });
})

.controller('transaksiCtrl', function($scope, $state, $stateParams, Services, $ionicHistory, $ionicLoading, Analytics) {
	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Transaksi');
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
					var date = new Date();
					var currentDate = date.getTime() ;
					var lastDayTimestamp = currentDate - 604800000;
					console.log("Current Date "+currentDate);
					console.log("Date Transaksi "+transaksi.tgl);
					if (transaksi.tgl >= lastDayTimestamp) {
						console.log(transaksi.tgl);
						$scope.transactions.push(transaksi);
					}
				});
			}
			$scope.$broadcast('scroll.refreshComplete');
		}, function(err) {
			console.log('error get transactions :'+err);
			$scope.$broadcast('scroll.refreshComplete');
		})
	}

	$scope.rincianTransaksi = function(kurir, indexTransaksi) {
		Analytics.logEvent('Transaksi', 'Lihat Transaksi');
		$state.go('tabsController.rincianTransaksi', {kurir: kurir, indexTransaksi: indexTransaksi});
	}

	$scope.getDate = function(timestamp) {
		var x = new Date(timestamp);
		var hours  = x.getHours();
		var minute = "0"+x.getMinutes();
		var time = hours+'.'+minute.substr(-2);
		return time;
	}
})

.controller('ulasanPenggunaCtrl', function($scope, $state, $stateParams, $ionicLoading, $ionicModal, $timeout, Services, Analytics) {
	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		if ($stateParams.compose || $stateParams.compose != null) {
			$scope.openRating();
		}

		Analytics.logView('Ulasan Pengguna');
		Analytics.logMerchant($stateParams.indexResto, 'Ulasan Pengguna');
	});

	$scope.namaResto = $stateParams.namaResto;
	$scope.indexResto = $stateParams.indexResto;
	$scope.jmlSad = 0;
	$scope.jmlHappy = 0;
	$scope.jmlFavorite = 0;
	$scope.jmlReview = 0;
	$scope.sadSelected = false;
	$scope.happySelected = true;
	$scope.favoriteSelected = false;
	$scope.reviews = null;
	$scope.user = {
		rating: 5
	};

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

	$scope.sadFeedbackCallback = function() {
		console.log('sad');
		$scope.sadSelected = true;
		$scope.happySelected = false;
		$scope.favoriteSelected = false;
	};

	$scope.happyFeedbackCallback = function() {
		console.log('happy');
		$scope.sadSelected = false;
		$scope.happySelected = true;
		$scope.favoriteSelected = false;
	};

	$scope.favoriteFeedbackCallback = function() {
		console.log('favorite');
		$scope.sadSelected = false;
		$scope.happySelected = false;
		$scope.favoriteSelected = true;
	};

	$scope.saveRatingReview = function() {
		Analytics.logEvent('Ulasan Pengguna', 'Tombol Simpan Ulasan');
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				Services.getProfileByUid(profile.uid).then(function(dataUser) {
					if (dataUser) {
						$scope.dataUser = dataUser;
						console.log(JSON.stringify(dataUser));
						Services.updateRatingReview(
							$scope.indexResto, 
							$scope.dataUser.name, 
							$scope.dataUser.photoUrl,
							$scope.user.rating,
							$scope.user.titleReview,
							$scope.user.review
						).then(function(result) {
							if($scope.sadSelected) {
								Services.updateJmlSad($scope.indexResto).then(function(result) {
									$scope.refreshRatingReview();
								});
							} else if($scope.happySelected) {
								Services.updateJmlHappy($scope.indexResto).then(function(result) {
									$scope.refreshRatingReview();
								});
							} else if($scope.favoriteSelected) {
								Services.updateJmlFavorite($scope.indexResto).then(function(result) {
									$scope.refreshRatingReview();
								});
							}

							$scope.refreshRatingReview();
							Analytics.logMerchant($stateParams.indexResto, 'Diulas Pengguna');
						}, function(reason) {
							console.log('gagal review');
							makeToast('Gagal menambahkan ulasan');
						});
					} else {
						console.log('profil no dataUser found with uid:'+uid);
					}
				});
			});
		} else {
			$ionicPopup.alert({
				title: 'Belum login',
				template: '<center>Kamu harus login dulu</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
			$state.go('login');
		};

		
		$scope.modalRating.hide();
	};

	$scope.refreshRatingReview = function() {
		$scope.jmlReview = 0;
		Services.getRestoranReviews($stateParams.indexResto).then(function(reviews) {
			if(reviews) {
				for(var r in reviews) {
					if(reviews[r].review == undefined || reviews[r].review == null) {
						delete reviews[r];
					} else {
						$scope.jmlReview++;
					}
				}
				$scope.reviews = reviews;

				// get jml sad
				Services.getJmlSad($stateParams.indexResto).then(function(jml) {
					if(typeof jml === 'number' && jml >= 0)
						$scope.jmlSad = jml;
					else
						$scope.jmlSad = 0;
				});

				// get jml happy
				Services.getJmlHappy($stateParams.indexResto).then(function(jml) {
					if(typeof jml === 'number' && jml >= 0)
						$scope.jmlHappy = jml;
					else
						$scope.jmlHappy = 0;
				});

				// get jml favorite
				Services.getJmlFavorite($stateParams.indexResto).then(function(jml) {
					if(typeof jml === 'number' && jml >= 0)
						$scope.jmlFavorite = jml;
					else
						$scope.jmlFavorite = 0;
				});

				console.log('success');
				loadFlag = true;
			}

			$ionicLoading.hide();
		}, function(reason) {
			console.log(JSON.stringify(reason));
			console.log('gagal');
			$ionicLoading.hide();
		});
		$scope.$broadcast('scroll.refreshComplete');
	};
	$scope.refreshRatingReview();


	///////////////////////////////////////////////////////////
	//
	// MODAL SECTION
	//
	///////////////////////////////////////////////////////////

	$ionicModal.fromTemplateUrl('templates/rating.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalRating = modal; });

	$scope.openRating = function() {
		var user = firebase.auth().currentUser;
		if (user) {
			Analytics.logView('Tulis Ulasan');
			Analytics.logEvent('Ulasan Pengguna', 'Tulis Ulasan');
			$scope.modalRating.show();
		} else {
			$state.go('login');
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

.controller('rekomendasiCtrl', function($scope, $state, $stateParams, Services, $http, $ionicPopup, Analytics){
	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Rekomendasi Restoran');
	});

	$scope.data = [];

	$scope.rekomendasikan = function() {
		if ($scope.data.namaResto == "" ||
			$scope.data.alamat == "" ||
			$scope.data.jenis == "" ||
			$scope.data.namaResto == null ||
			$scope.data.alamat == null ||
			$scope.data.jenis == null) {
			Analytics.logEvent('Rekomendasi', 'Tidak Lengkap');
			$ionicPopup.alert({
				title: 'Lengkapi Data',
				template: '<center>Data belum lengkap</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		} else {
			$http.post("https://mobilepangan.com/mangan/sendMailRecomendation?nama="+$scope.data.namaResto+"&alamat="+$scope.data.alamat+"&jenis="+$scope.data.jenis+"&kontak="+$scope.data.kontak+"&alasan="+$scope.data.alasan+"&token=717mangan"
			).success(function(data) {
				console.log(data);
			}).error(function(error, status) {
				console.log(error, status);
			});
			Services.rekomendasiResto($scope.data);
			Analytics.logEvent('Rekomendasi', 'Rekomendasi');

			$ionicPopup.alert({
				title: 'Terima Kasih',
				template: '<center>Terima kasih telah memberikan rekomendasi</center>',
				okText: 'OK',
				okType: 'button-oren'
			});

			$state.go("tabsController.jelajah");
		}
	}
})

.controller('daftarCtrl', function($scope, $state, $stateParams, Services, $http, $ionicPopup, Analytics){
	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Daftar Restoran');
	});

	$scope.data = [];

	$scope.daftar = function() {
		if ($scope.data.namaResto == "" ||
			$scope.data.namaPemilik == "" ||
			$scope.data.alamat == "" ||
			$scope.data.kontak == "" ||
			$scope.data.namaResto == null ||
			$scope.data.namaPemilik == null ||
			$scope.data.alamat == null ||
			$scope.data.kontak == null) {
			Analytics.logEvent('Daftar Restoran', 'Tidak Lengkap');
			$ionicPopup.alert({
				title: 'Lengkapi Data',
				template: '<center>Data belum lengkap</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		} else {
			$http.post("https://mobilepangan.com/mangan/sendMailRegister?nama="+$scope.data.namaResto+"&namapemilik="+$scope.data.namaPemilik+"&alamat="+$scope.data.alamat+"&kontak="+$scope.data.kontak+"&deskripsi="+$scope.data.deskripsi+"&token=717mangan"
			).success(function(data) {
				console.log(data);
			}).error(function(error, status) {
				console.log(error, status);
			});
			Services.daftarResto($scope.data);
			Analytics.logEvent('Daftar Restoran', 'Daftar');

			$ionicPopup.alert({
				title: 'Mendaftar',
				template: '<center>Kami akan segera menghubungi anda</center>',
				okText: 'OK',
				okType: 'button-oren'
			});

			$state.go("tabsController.jelajah");
		}		
	}
})

.controller('rincianTransaksiCtrl', function($scope, $state, $stateParams, Services, $ionicLoading, $ionicPopup, $ionicHistory, Analytics){
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 5000
    });

	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Rincian Transaksi');
		$scope.getTransaksiDetails();
	});

    $scope.getTransaksiDetails = function() {
    	console.log($stateParams.kurir, $stateParams.indexTransaksi);
    	Services.getTransaksiDetails($stateParams.kurir, $stateParams.indexTransaksi).then(function(detailTransaksi) {
    		$scope.detailTransaksi = detailTransaksi;
	    	$scope.$broadcast('scroll.refreshComplete');
    		console.log(detailTransaksi);
    	}, function(err) {
    		console.log(err);
    	});
    }

    $scope.cancelTransaction = function() {
		Analytics.logEvent('Rincian Transaksi', 'Tombol Batalkan');
    	$ionicPopup.confirm({
			title: 'Batalkan Pesanan',
			template: '<center>Apakah anda yakin ingin membatalkan pesanan anda?</center>',
			okText: 'Ya',
			cancelText: 'Tidak',
			okType: 'button-clear',
			cancelType: 'button-oren'
		}).then(function(res) {
			if(res) {
				Analytics.logEvent('Transaksi', 'Dibatalkan');
				Analytics.logEvent('Rincian Transaksi', 'Konfirmasi Batal', 'Ya');
				Analytics.logEvent('Pesan Antar', 'Dibatalkan');
				Services.getTransaksiDetails($stateParams.kurir, $stateParams.indexTransaksi).then(function(detailTransaksi) {
					if (detailTransaksi.status == "process" || detailTransaksi.status == "done" || detailTransaksi.status == "cancel") {
						$ionicPopup.alert({
							title: 'Gagal',
							template: '<center>Sepertinya pesanan kamu telah diproses kurir, silahkan hubungi kurir untuk membatalkan</center>',
							okText: 'OK',
							okType: 'button-oren'
						});
					} else {
						Services.changeStatus($scope.detailTransaksi.kurir, $scope.detailTransaksi.indexTransaksi).then(function() {
							Services.deleteQueue($scope.detailTransaksi.kurir, $scope.detailTransaksi.indexTransaksi).then(function() {
								Services.addCancel($scope.detailTransaksi.indexUser, $scope.detailTransaksi.indexTransaksi);
								$ionicPopup.alert({
									title: 'Dibatalkan',
									template: '<center>Pesanan berhasil dibatalkan</center>',
									okText: 'OK',
									okType: 'button-oren'
								}).then(function() {
									$ionicHistory.goBack();
								});
								console.log('order cancel');
							}, function(err) {
								console.log(err);
							});
						}, function(err) {
							console.log('error change status : '+err);
						});
					}
				})
			} else {
				Analytics.logEvent('Rincian Transaksi', 'Konfirmasi Batal', 'Tidak');
			}
		});
    }

    $scope.call = function(tel) {
    	Analytics.logEvent('Transaksi', 'Hubungi Kurir');
    	Analytics.logEvent('Kurir', $stateParams.kurir, 'Call');
		window.open('tel:'+tel, '_system', 'location=yes');
    }

	$scope.getDate = function(timestamp) {
		var x = new Date(timestamp);
		var hours  = x.getHours();
		var minute = "0"+x.getMinutes();
		var time = hours+'.'+minute.substr(-2);
		return time;
	}
	
	$scope.getTime = function(timestamp){
	  var a = new Date(timestamp);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
	  var day = days[a.getDay()];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  var time = day+', '+date + ' ' + month + ' ' + year ;
	  return time;
	}
})

.controller('adsController', function($scope, $state, Analytics) {
	$scope.adsCounter = 5;
	
	$scope.showRowAds = function(isShow) {
		if(isShow)
		{
			var adsUrl = ManganAds.getAdsUrl();
			Analytics.logView('RowAds-'+ 'cat');
			Analytics.logEvent('RowAds',  'cat');
			return adsUrl;
		}

		return null;
	}
})

.controller('profilKurirCtrl', function($scope, $state, $stateParams, Services, Analytics){

});