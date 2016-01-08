(function() {

	var app = window.app;

	app.directive('formForgotPassword', function() {
		return {
			restrict: 'E',
			templateUrl: '/elements/formForgotPassword.html',
			controller: ['$scope', function($scope) {
				var that = this;

				this.view = {
					showFields: false,
					message: '',
					messageClass: 'secondary',
					buttonClass: 'disabled'
				};

				this.data = {
					email: ''
				};

				this.checkFormState = function() {
					var empty = _.filter(this.data, function(value) {
						return value === undefined || value === '';
					});
					this.changeButtonStatus(empty.length == 0 ? true : false);
				};	

				this.changeButtonStatus = function(statusBoolean) {
					this.view.buttonClass = statusBoolean ? 'success' : 'disabled';
				};

				this.toggleFields = function() {
					this.view.showFields = this.view.showFields ? false : true;
				};

				this.submit = function() {

				};
			}],
			controllerAs: 'FormForgotPasswordCtrl'
		}
	});

	app.directive('formUserLogin', function() {
		return {
			restrict: 'E',
			templateUrl: '/elements/formUserLogin.html',
			controller: ['$scope', '$timeout', '$location', 'accAuth', function($scope, $timeout, $location, accAuth) {
				var that = this;

				this.view = {
					message: '',
					messageClass: 'secondary',
					buttonClass: 'disabled',
					buttonHide: false
				};

				this.data = {
					email: '',
					password: ''
				};

				this.checkFormState = function() {
					var empty = _.filter(this.data, function(value) {
						return value === undefined || value === '';
					});
					this.changeButtonStatus(empty.length == 0 ? true : false);
				};	

				this.changeButtonStatus = function(statusBoolean) {
					this.view.buttonClass = statusBoolean ? 'success' : 'disabled';
				};

				this.submit = function() {
					accAuth.login(this.data, function() {
						that.view.message = 'Logging in now!';
						that.view.messageClass = 'success';
						that.view.buttonClass = 'disabled';
						$scope.$apply();
						$timeout(function() {
							$location.path('/dashboard');
						}, 1000);
					}, function() {
						that.view.message = 'Email and/or password combination did not work!';
						that.view.messageClass = 'warning';
						$scope.$apply();
					}, function() {
						that.view.message = 'Please try again.';
						that.view.messageClass = 'warning';
						$scope.$apply();
					});
				};
			}],
			controllerAs: 'FormUserLoginCtrl'
		}
	});

	app.directive('formUserLogout', function() {
		return {
			restrict: 'E',
			templateUrl: '/elements/formUserLogout.html',
			controller: ['$scope', '$timeout', '$location', 'accAuth', function($scope, $timeout, $location, accAuth) {
				var that = this;

				this.view = {
					message: '',
					messageClass: 'secondary',
					buttonClass: ''
				};

				this.logout = function() {
					accAuth.logout(function() {
						that.view.message = 'Now logging you out ...';
						that.view.messageClass = 'warning';
						buttonClass = 'disabled';
						$timeout(function() {
							that.view.message = 'Logged out!';
							that.view.messageClass = 'success';
							$timeout(function() {
								$location.path('/');
							}, 1000);
						}, 1000);
					});
				};
			}],
			controllerAs: 'FormUserLogoutCtrl'
		}
	});
	
	app.directive('formUserProfile', function() {
		return {
			restrict: 'E',
			templateUrl: '/elements/formUserProfile.html',
			controller: ['$scope', '$timeout', 'accAuth', 'accUser', function($scope, $timeout, accAuth, accUser) {
				var that = this;

				this.view = {
					message: '',
					messageClass: 'secondary',
					buttonClass: 'enabled'
				};

				this.data = {
					email: '',
					firstName: '',
					lastName: ''
				};

				accUser.get(function(data) {
					$.extend(that.data, data.user);
				});
			}],
			controllerAs: 'FormUserProfileCtrl'
		}
	});

	app.directive('formUserRegister', function() {
		return {
			restrict: 'E',
			templateUrl: '/elements/formUserRegister.html',
			controller: ['$scope', 'accAuth', function($scope, accAuth) {
				var that = this;

				this.view = {
					message: '',
					messageClass: 'secondary',
					buttonClass: 'disabled',
					buttonHide: false
				};

				this.data = {
					email: '',
					firstName: '',
					lastName: '',
					password: '',
					confirmPassword: ''
				};

				this.checkPasswordMatch = function() {
					if (this.data.password != this.data.confirmPassword) {
						this.view.message = 'Your passwords do not match.';
						this.view.messageClass = 'secondary';
						this.view.buttonClass = 'disabled';
						return false;
					}
					this.view.message = 'Passwords match!';
					this.view.messageClass = 'success';
					this.checkFormState();
					return true;
				};

				this.checkFormState = function() {
					var empty = _.filter(this.data, function(value) {
						return value === undefined || value === '';
					});
					this.changeButtonStatus(empty.length == 0 ? true : false);
				};	

				this.changeButtonStatus = function(statusBoolean) {
					this.view.buttonClass = statusBoolean ? 'success' : 'disabled';
				};

				this.submit = function() {
					if (this.checkPasswordMatch() == false) { return; }
					accAuth.register(this.data, function() {
						that.view.message = 'Welcome, ' + that.data.firstName + '! Logging in now!';
						that.view.messageClass = 'success';
						that.view.buttonClass = 'disabled';
						$scope.$apply();
					}, function() {
						that.view.message = 'Email has already been registered!';
						that.view.messageClass = 'warning';
						$scope.$apply();
					}, function() {
						that.view.message = 'Please try again!';
						that.view.messageClass = 'warning';
						$scope.$apply();
					});
				};
			}],
			controllerAs: 'FormUserRegisterCtrl'
		}
	});

})();