var app = angular.module("sampleApp", ["firebase"]);
app.controller("SampleCtrl", function($firebaseAuth, $http) {
  var auth = $firebaseAuth();
  var self = this;
  self.newSecret = {};

  // This code runs whenever the user logs in
  self.logIn = function(){
    auth.$signInWithPopup("google").then(function(firebaseUser) {
      console.log("Firebase Authenticated as: ", firebaseUser.user.displayName);
    }).catch(function(error) {
      console.log("Authentication failed: ", error);
    });
  };
  getSecrets();
  function getSecrets(){
    // This code runs whenever the user changes authentication states
    // e.g. whevenever the user logs in or logs out
    // this is where we put most of our logic so that we don't duplicate
    // the same things in the login and the logout code
    auth.$onAuthStateChanged(function(firebaseUser){
      // firebaseUser will be null if not logged in
      if(firebaseUser) {
        // This is where we make our call to our server
        firebaseUser.getToken().then(function(idToken){
          $http({
            method: 'GET',
            url: '/privateData',
            headers: {
              id_token: idToken
            }
          }).then(function(response){
            self.secretData = response.data;
          });
        });
      } else {
        console.log('Not logged in or not authorized.');
        self.secretData = [];
      }

    });
  };

  self.addSecret = function(){
    console.log("client side",self.newSecret);
    auth.$onAuthStateChanged(function(firebaseUser){

      // firebaseUser will be null if not logged in
      if(firebaseUser) {
        // This is where we make our call to our server
        firebaseUser.getToken().then(function(idToken){
          $http({
            method: 'POST',
            url: '/privateData',
            headers: {
              id_token: idToken

            },
            data:self.newSecret
          }).then(function(response){
            self.secretData = response.data;
            getSecrets();
          });
        });
      } else {
        console.log('Not logged in or not authorized.');
        self.secretData = [];


      }

    });
  }










  // This code runs when the user logs out
  self.logOut = function(){
    auth.$signOut().then(function(){
      console.log('Logging the user out!');
    });
  };
});