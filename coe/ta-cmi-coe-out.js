module.exports = function(RED) {
    function TaCmiCoeOutNode(config) {
        RED.nodes.createNode(this,config);
	this.topic_prefix = config.topic_prefix
        var node = this;
        this.on('input', function(msg) {
		var re = new RegExp(["^", node.topic_prefix].join(""));
		var topic = msg.topic.replace(re, "");
		node.warn(topic);
		topic = topic.replace(/\/set$/, "");
		node.warn(topic);
		var vals = topic.split("\/");
		nodeid = vals[0];
		port = parseInt(vals[1]);
		value = parseInt(msg.payload);
		buf = new Buffer(14);
		buf.fill(0);
                if (port >= 1 && port <= 16) {
	        	buf.writeUInt8(nodeid, 0);
			buf.writeUInt16LE(value, 2);
		} else {
                        var group = Math.floor(((port-17)/4)+1);
			buf.writeUInt8(group, 1);
	        	buf.writeUInt8(nodeid, 0);
			buf.writeUInt16LE(value, 2);
		}
		node.send({payload: buf});
		node.send({payload: {nodeid: vals[0], port: vals[1], value: msg.payload} });
	});
    }
    RED.nodes.registerType("coe-out",TaCmiCoeOutNode);
}
