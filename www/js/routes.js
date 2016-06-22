angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  .state('tabsController.jelajah', {
    url: '/page2',
    views: {
      'tab1': {
        templateUrl: 'templates/jelajah.html',
        controller: 'jelajahCtrl'
      }
    }
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.tersimpan'
      2) Using $state.go programatically:
        $state.go('tabsController.tersimpan');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /page1/tab1/page3
      /page1/tab3/page3
  */
  .state('tabsController.tersimpan', {
    url: '/page3',
    views: {
      'tab1': {
        templateUrl: 'templates/tersimpan.html',
        controller: 'tersimpanCtrl'
      },
      'tab3': {
        templateUrl: 'templates/tersimpan.html',
        controller: 'tersimpanCtrl'
      }
    }
  })

  .state('tabsController.populer', {
    url: '/page12',
    views: {
      'tab1': {
        templateUrl: 'templates/populer.html',
        controller: 'populerCtrl'
      }
    }
  })

  .state('tabsController.restorans', {
    url: '/restorans',
    views: {
      'tab1': {
        templateUrl: 'templates/restorans.html',
        controller: 'restoransCtrl'
      }
    },
    params: {
      category: null
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.selatViens'
      2) Using $state.go programatically:
        $state.go('tabsController.selatViens');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /page1/tab1/page10
      /page1/tab3/page10
  */
  .state('tabsController.selatViens', {
    url: '/page10',
    views: {
      'tab1': {
        templateUrl: 'templates/selatViens.html',
        controller: 'selatViensCtrl'
      },
      'tab3': {
        templateUrl: 'templates/selatViens.html',
        controller: 'selatViensCtrl'
      }
    }
  })

  .state('tabsController.restoran', {
    url: '/restoran',
    views: {
      'tab1': {
        templateUrl: 'templates/restoran.html',
        controller: 'restoranCtrl'
      },
      'tab3': {
        templateUrl: 'templates/restoran.html',
        controller: 'restoranCtrl'
      }
    },
    params: {
      index: null
    }
  })

  .state('transaksi', {
    url: '/page13',
    templateUrl: 'templates/transaksi.html',
    controller: 'transaksiCtrl'
  })

  .state('pengaturan', {
    url: '/page14',
    templateUrl: 'templates/pengaturan.html',
    controller: 'pengaturanCtrl'
  })

  .state('profil', {
    url: '/page15',
    templateUrl: 'templates/profil.html',
    controller: 'profilCtrl'
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.menuSelatViens'
      2) Using $state.go programatically:
        $state.go('tabsController.menuSelatViens');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /page1/tab1/menu
      /page1/tab3/menu
  */
  .state('tabsController.menuSelatViens', {
    url: '/menu',
    views: {
      'tab1': {
        templateUrl: 'templates/menuSelatViens.html',
        controller: 'menuSelatViensCtrl'
      },
      'tab3': {
        templateUrl: 'templates/menuSelatViens.html',
        controller: 'menuSelatViensCtrl'
      }
    }
  })

  .state('tabsController.menus', {
    url: '/menus',
    views: {
      'tab1': {
        templateUrl: 'templates/menus.html',
        controller: 'menusCtrl'
      },
      'tab3': {
        templateUrl: 'templates/menus.html',
        controller: 'menusCtrl'
      }
    },
    params: {
      index: null
    }
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.invoice'
      2) Using $state.go programatically:
        $state.go('tabsController.invoice');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /page1/tab1/invoice
      /page1/tab3/invoice
  */
  .state('tabsController.invoice', {
    url: '/invoice',
    views: {
      'tab1': {
        templateUrl: 'templates/invoice.html',
        controller: 'invoiceCtrl'
      },
      'tab3': {
        templateUrl: 'templates/invoice.html',
        controller: 'invoiceCtrl'
      }
    }
  })

  .state('tabsController.peta', {
    url: '/peta',
    views: {
      'tab1': {
        templateUrl: 'templates/peta.html',
        controller: 'petaCtrl'
      },
      'tab3': {
        templateUrl: 'templates/peta.html',
        controller: 'petaCtrl'
      }
    },
    params: {
      index: null
    }
  })

  .state('tabsController.kategori', {
    url: '/page6',
    views: {
      'tab1': {
        templateUrl: 'templates/kategori.html',
        controller: 'kategoriCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/page1/page2')

});