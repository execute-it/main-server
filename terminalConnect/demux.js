module.exports = function (stream, ws) {
    var nextDataType = null;
    var nextDataLength = null;
    var buffer = Buffer.from('');

    function processData(data) {
        if (data) {
            buffer = Buffer.concat([buffer, data]);
        }
        if (!nextDataType) {
            if (buffer.length >= 8) {
                var header = bufferSlice(8);
                nextDataType = header.readUInt8(0);
                nextDataLength = header.readUInt32BE(4);
                // It's possible we got a "data" that contains multiple messages
                // Process the next one
                processData();
            }
        } else {
            if (buffer.length >= nextDataLength) {
                var content = bufferSlice(nextDataLength);
                if (nextDataType === 1) {
                    // stdout.write(content);
                    ws.send(content)
                } else {
                    // stderr.write(content);
                    ws.send(content)
                }
                nextDataType = null;
                // It's possible we got a "data" that contains multiple messages
                // Process the next one
                processData();
            }
        }
    }

    function bufferSlice(end) {
        var out = buffer.slice(0, end);
        buffer = Buffer.from(buffer.slice(end, buffer.length));
        return out;
    }

    stream.on('data', processData);
};