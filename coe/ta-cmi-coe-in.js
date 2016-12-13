module.exports = function(RED) {
	function TaCmiCoeInNode(config) {
		RED.nodes.createNode(this, config);
		this.topic_prefix = config.topic_prefix;
		var node = this;
		this.on('input', function(msg) {
			var buffer = msg.payload;
			var nodeid = buffer[0];
			if (buffer[1] > 0) {
				var group = buffer[1] - 1;
				var msgtype = "analog";
				for (var i = 0; i < 4; i++) {
					var port = group * 4 + 16 + i + 1;
					if (port >= 49) {
						msgtype = "digital";
					}
					value = buffer.readInt16LE(i * 2 + 2);
					var unit = buffer[i + 10];
					//unit is wrongly sent as 255 if negativ value
					if (unit == 1 || unit == 255) {
						value = value / 10;
					}
					node.send([{
						payload: {
							"nodeid": nodeid,
							"value": value,
							"unit": unit,
							"msgtype": msgtype,
							"port": port,
							"group": group + 1,
							"index": i
						}
					}, {
						topic: [node.topic_prefix, nodeid, "/", port].join(""),
						payload: value
					}]);
				}
			} else {
				msgtype = "digital";
				var bits = buffer[2];
				for (var i = 0; i < 16; i++) {
					var value = bits >> i & 1
						//value = (value == 1 ? "ON" : "OFF");
					port = i + 1;
					node.send([{
						payload: {
							"nodeid": nodeid,
							"value": value,
							"unit": 0,
							"msgtype": msgtype,
							"port": port,
							"group": 0,
							"index": i
						}
					}, {
						topic: [node.topic_prefix, nodeid, "/", port].join(""),
						payload: value
					}]);
				}
			}
			return;
		});
	}
	RED.nodes.registerType("coe-in", TaCmiCoeInNode);
}
