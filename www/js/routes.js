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
    
  .state('tabsController.pencarian', {
    url: '/pencarian',
    views: {
      'tab1': {
        templateUrl: 'templates/pencarian.html',
        controller: 'pencarianCtrl'
      }
    },
    params: {
      query: null
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
        templateUrl: 'templates/restorans.html',
        controller: 'tersimpanCtrl'
      },
      'tab3': {
        templateUrl: 'templates/restorans.html',
        controller: 'tersimpanCtrl'
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
      category: null,
      name: null
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


  .state('tabsController.restoran', {
    url: '/restoran/:index',
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

  .state('tabsController.terdekat', {
    url: '/terdekat',
    views: {
      'tab1': {
        templateUrl: 'templates/peta.html',
        controller: 'terdekatCtrl'
      },
      'tab3': {
        templateUrl: 'templates/peta.html',
        controller: 'terdekatCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/page1/page2')

});