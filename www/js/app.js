// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova', 'ngStorage', 'ionic-ratings', 'ionicLazyLoad', 'ionMDRipple', 'ngCordovaOauth'])

.constant('config', {
  analytics: 'UA-82447017-1',
  version: 100018
})

.run(function($ionicPlatform, config, $ionicPopup, Services, $localStorage, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    // $cordovaGoogleAnalytics.debugMode();
    // if(typeof analytics !== undefined) {
    //   analytics.startTrackerWithId('UA-XXXXXXXX-X');
    // } else {
    //   console.log("Google Analytics Unavailable");
    // }

    window.FirebasePlugin.getToken(function(token) {
      $localStorage.token = token;
      console.log('device token : '+token);
    }, function(err) {
      console.log('err get token : '+err);
    })

    window.FirebasePlugin.onTokenRefresh(function(token) {
      $localStorage.token = token;
      console.log('device token refresh : '+token);
    }, function(err) {
      console.log('err get token : '+err);
    })

    window.FirebasePlugin.onNotificationOpen(function(notification) {
      // if notification received in background, on tap, it didn't open the app! how frustating

      // Check notification Body (notification from us)
      // From us, there is body attribute
      if (notification.body) {
        // Foreground, tap = false
        if (notification.tap == false) {
          $ionicPopup.alert({
            title: notification.title,
            template: notification.body,
            okText: 'OK',
            okType: 'button-oren'
          });
        }
        // Background
        else if(notification.tap == true) {
          $ionicPopup.alert({
            title: notification.title,
            template: notification.body,
            okText: 'OK',
            okType: 'button-oren'
          });
        }
      } else {
        // do nothing, not from us
        console.log('wild notification content :'+JSON.stringify(notification));
      }
    }, function(err) {
      console.log(err);
    })

    window.FirebasePlugin.subscribe("mangan");

    function _waitForAnalytics(){
        if(typeof analytics !== 'undefined'){
            // analytics.debugMode();
            analytics.startTrackerWithId(config.analytics);
        }
        else{
            setTimeout(function(){
                _waitForAnalytics();
            },10000);
        }
    };
    _waitForAnalytics();
  })

  if (ionic.Platform.isIOS()) {
    window.FirebasePlugin.grantPermission();
    console.log("iOS permission granted");
  }
})

.config(['$ionicConfigProvider', function($ionicConfigProvider) {

    // $ionicConfigProvider.tabs.position('bottom'); // other values: top
    $ionicConfigProvider.navBar.alignTitle('center');
}])

// http://justinklemm.com/angularjs-filter-ordering-objects-ngrepeat/
.filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      // console.log(field);
      // console.log(items);
      // console.log(reverse);
      // console.log('wwwwww');
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a,b) {
        // console.log(a[field] +"|"+ b[field] + "|"+ a[field]>b[field]);
        return (a[field] > b[field] ? 1: -1);
      });
      if(reverse) filtered.reverse();
      return filtered;
    };
})




