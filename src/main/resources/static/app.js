var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var stompConnected = null;
    var globalConnection;

    var addPolygonToCanvas = function polygon(polygonPoints) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
        for (var i = 1; i < polygonPoints.length; i++) {
            ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = "Black";
        ctx.fill();
    }

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + globalConnection, function (eventbody) {
                //alert("Punto x: " + JSON.parse(eventbody.body).x + " Punto y: " + JSON.parse(eventbody.body).y);
                console.log("Connection: " + globalConnection);

                var pointX = JSON.parse(eventbody.body).x;
                var pointY = JSON.parse(eventbody.body).y;

                var pointToCanvas = new Point(pointX, pointY);

                addPointToCanvas(pointToCanvas);

            });
            stompClient.subscribe('/topic/newpolygon.' + globalConnection, function (eventbody) {
                console.log("Trying to draw a new polygon");

                addPolygonToCanvas(JSON.parse(eventbody.body));
            });
        });

    };



    return {

        init: function () {
            var can = document.getElementById("canvas");

            stompConnected = false;

            //websocket connection
            //connectAndSubscribe();
        },

        connect: function (numConection) {
            if (stompConnected === false) {
                globalConnection = numConection;
                alert("Connected on " + globalConnection + " identifier");
                var can = document.getElementById("canvas");

                can.addEventListener("click", function (evt) {
                    var pointX = getMousePosition(evt).x;
                    var pointY = getMousePosition(evt).y;

                    stompClient.send("/app/newpoint." + globalConnection, {}, JSON.stringify({x: pointX, y: pointY}));
                });

                connectAndSubscribe();

                stompConnected = true;

                can.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

                document.getElementById("identifier").disabled = true;
            } else {
                alert("Actually you are connected");
            }

        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/topic/newpoint", {}, JSON.stringify({x: px, y: py}));
        },

        disconnect: function () {
            if (stompConnected !== false) {
                stompClient.disconnect();

                stompClient.unsubscribe(globalConnection);

                stompClient = null;
                alert("Disconnected succesfully");
                stompConnected = false;
                console.log("Disconnected");
                document.getElementById("identifier").disabled = false;
            } else {
                alert("You should be connected on a identifier");
            }
        }
    };

})();