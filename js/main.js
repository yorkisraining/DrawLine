var arc;

var canvas,
	cxt,
	canW,
	canH;

var balls = [];
var lines = [];


window.onload = function() {
	canvas = document.getElementById("canvas")
	cxt = canvas.getContext('2d');
	canW = canvas.width;
	canH = canvas.height;
	
	arc = new arcObj();
	//初始化每一个圆，画出来，连线
	for (var i=0; i<arc.num; i++) {
		arc.init();
	}
	arc.drawCircle();
	
	//检测相交并加粗
	updateLineIntersection();
	drawLine();

	var timer = setInterval(gameloop(), 300);
	
}

function gameloop() {
	//移动
	moveArc();
}

var arcObj = function() {
	this.x;
	this.y;
	this.r;
	this.target;
}

arcObj.prototype.num = 4;

arcObj.prototype.init = function() {
	this.x = (canW - 200) * Math.random() + 100;
	this.y = (canH - 200) * Math.random() + 100;
	this.r = 10;

	balls.push({
		'x': this.x,
		'y': this.y,
	});
}

arcObj.prototype.drawCircle = function() {
	cxt.save();
	cxt.fillStyle = '#868686'
	for (var i=0; i<this.num; i++) {
	cxt.beginPath();
	cxt.arc(balls[i].x, balls[i].y, this.r, 0, Math.PI*2, false);
	cxt.closePath();
	cxt.fill();
	}
	cxt.restore();
	
	//保存直线
	for (var i=0; i<this.num; i++) {
		var startPoint = balls[i];
		for (var j=0; j<i; j++) {
			var endPoint = balls[j];
			lines.push({
				'startPoint': startPoint,
				'endPoint': endPoint
			});
		}
	}
	
}

function drawLine() {
	for (var i=0; i<lines.length; i++) {
		cxt.save();
		cxt.lineWidth = lines[i].lineWidth;
		cxt.strokeStyle = '#fff';
		cxt.beginPath();
		cxt.moveTo(lines[i].startPoint.x, lines[i].startPoint.y);
		cxt.lineTo(lines[i].endPoint.x, lines[i].endPoint.y);
		cxt.closePath();
		cxt.stroke();
		cxt.restore();
	}
}

function moveArc() {
	//鼠标监听
	$('#canvas').mousedown(function(e) {
		var canPos = $(this).offset();
		var mouseX = e.pageX - canPos.left;
		var mouseY = e.pageY - canPos.top;
		
		//检测是否在圆内
		for (var i=0; i<arc.num; i++) {
			var circleX = balls[i].x;
			var circleY = balls[i].y;
			var circleR = arc.r;
			
			if (Math.pow(mouseX - circleX, 2) + Math.pow(mouseY - circleY, 2) < Math.pow(circleR, 2)) {
				arc.target = i;
				return;
			}
		}
	});
	
	//鼠标移动时拖拽
	$('#canvas').mousemove(function(e) {
		if(arc.target != undefined) {
			var canPos = $(this).offset();
			var mouseX = e.pageX - canPos.left;
			var mouseY = e.pageY - canPos.top;
			arc.x = mouseX;
			arc.y = mouseY;
			cxt.clearRect(0, 0, canW, canH);
			balls[arc.target] = {
				'x': arc.x,
				'y': arc.y
			};
			arc.drawCircle();
			drawLine();
			//检测相交并加粗
			updateLineIntersection()
		}
	});
	
	//放开鼠标
	$('#canvas').mouseup(function(e) {
		arc.target = undefined;
	});
}

function isIntersect(line1, line2) {
	//转换line1成一般式：Ax+By=C
	var a1 = line1.endPoint.y - line1.startPoint.y;
	var b1 = line1.startPoint.x - line1.endPoint.x;
	var c1 = a1 * line1.startPoint.x + b1 * line1.startPoint.y;
	
	//转换line2成一般式：Ax+By=C
	var a2 = line2.endPoint.y - line2.startPoint.y;
	var b2 = line2.startPoint.x - line2.endPoint.x;
	var c2 = a2 * line2.startPoint.x + b2 * line2.startPoint.y;
	
	//计算交点
	var d = a1*b2 - a2*b1;
	
	//当d==0时,两线平行
	if (d == 0) {
		return false;
	} else {
		var x = (b2*c1 - b1*c2) / d;
		var y = (a1*c2 - a2*c1) / d;
		//检测截点是否在两条线段之上
		if ( ( isInBetween(line1.startPoint.x, x, line1.endPoint.x) || isInBetween(line1.startPoint.y, y, line1.endPoint.y) ) && ( isInBetween(line2.startPoint.x, x, line2.endPoint.x) || isInBetween(line2.startPoint.y, y, line2.endPoint.y) ) ) {
			return true;
		} else {
			return false;
		}
		//如果b在a与c之间返回true
		//当a==b或b==c时排除结果，返回false
	}
}

function isInBetween(a, b, c) {
	//如果b几乎等于a或c，返回false，避免存在相差0.0000...0001这种情况
	if(Math.abs(a-b)<0.000001 || Math.abs(b-c)<0.000001 ) {
		return false;
	}
	
	//如果b与a在c之间返回true
	if( (a<b && b<c) || (c<b && b<a) ) {
		return true;
	}
}

function updateLineIntersection() {
	//检测相交的线并加粗
	for (var i=0; i<arc.num; i++) {
		for (var j=0; j<arc.num; j++) {
			var line1 = lines[i];
			var line2 = lines[j];
			
			if(isIntersect(line1, line2)) {
				line1.lineWidth = 5;
				line2.lineWidth = 5;
			} else {
				line1.lineWidth = 2;
				line2.lineWidth = 2;
			}
		}
	}
}
