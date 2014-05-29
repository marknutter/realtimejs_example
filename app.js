


angular.module('nodularExample', [])

.service('Nodular', function($q) {

	var ws,
			self = this,
			defers = [],
			listeners = {},
			connected = false;

	function connect() {
		ws = new WebSocket("ws://localhost:8080");
		ws.onopen = function() {
			connected = true;
			angular.forEach(defers, function(d) {
				d();
			})
			defers = [];
		}
		ws.onclose = function() {
			connected = false;
		}

		ws.onmessage = function(event) {
			var data = JSON.parse(event.data);
			angular.forEach(listeners[data.location], function(listener) {
				listener(data);
			});
		};
	}

	this.send = function(data) {
		var deferred = $q.defer();
		connected ? _send() : defers.push(_send);

		function _send() {
			ws.send(JSON.stringify(data));
			deferred.resolve();
		}
		return deferred.promise;
	};

	this.registerListener = function(location, callback) {
		listeners[location] = listeners[location] || [];
		listeners[location].push(callback);
	}



	connect();

})

.factory('Message', function($rootScope, Nodular) {

	function Message(data) {
		this.app = "testapp";
		this.location = "messages";
		this.action = "addToCollection";
		angular.extend(this, data);
	}

	Message.prototype.save = function() {
		Nodular.send(this);
	}

	Message.query = function() {
		var query = {
			action: 'query',
			location: 'messages',
			app: 'testapp'
		}
		Nodular.send(query);
	}

	Nodular.registerListener("messages", function(data) {
		var message = new Message(JSON.parse(event.data));
		Message.all.push(message);
		$rootScope.$apply();
	})

	Message.all = [];

	return Message;

})

.controller('MainCtrl', function($scope, Message) {

	$scope.newMessage = new Message();

	$scope.messages = Message.all;

	Message.query();

	$scope.sendMessage = function() {
		$scope.newMessage.save();
		$scope.newMessage = new Message();
	};

});