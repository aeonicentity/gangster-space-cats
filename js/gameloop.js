Game.gameLoop = (function (graphics, input, screens, server, assets, gameobjects){
	var rqId;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateBuild;
	var gameStateBattle;
	var startTime;
	var tempTower = null;
    var tempCreep = null;
	var mouse;
	var towers = [];
    var creeps = [];
    var pellets = [];
	var towerGrid = [];
	var shortestPath = null;
	var sumVertex = 0;
	var Q = [];
	var calcMutex = true;
	var shortestPath = [];
	var testTarget = null;
	
	function populateTowerGrid(){
		sumVertex = 0;
		for(var i =0; i < graphics.gameHeight - 50; i+=50){
			line = []
			for(var j=0; j < graphics.gameWidth -50; j+=50){
				line.push({filled:false,distance:null,parent:null,x:Math.round(j/50),y:Math.round(i/50)});
				sumVertex++;
			}
			towerGrid.push(line);
		}
		towerGrid[4][0].distance = 0;
		towerGrid[4][0].filled = true;
		towerGrid[4][towerGrid[4].length-1].filled = true;
		console.log(towerGrid);
	}
	
	function clearTowerGrid(){
		for (var i in towerGrid){ //Initialize Q. this is n^2, but i'm not sure how to do this any other way.
			for (var j in towerGrid[i]){
				towerGrid[i][j].parent = null;
				towerGrid[i][j].distance = null;
			}
		}
	}
	
	
	
	function calcShortestPath(){
	console.log('begin');
	if(!calcMutex){
		//using dijkstra's.
		Q = [];
		var maxx = towerGrid[0].length - 1;
		var maxy = towerGrid.length - 1; 
		var src = null;
		for (var i = 0; i < maxy; i++){
			for (var j =0; j < maxx; j++){
				towerGrid[i][j].distance = null;
				towerGrid[i][j].parent = null;
			}
		}
		
		Q.push(towerGrid[4][0]);
		
		while (Q.length > 0){
			var current = Q.shift();
			var next;
			if(current.x > 0 && ! towerGrid[current.y][current.x-1].filled){ //if left exists and left is not filled
				next = towerGrid[current.y][current.x-1];
				if(next.distance == null ){
					next.distance = current.distance+1;
					next.parent = current;
					Q.push(next);
				}
			}
			if(current.x < maxx && ! towerGrid[current.y][current.x+1].filled){ //right exists and right not filled.
				next = towerGrid[current.y][current.x+1];
				if(next.distance == null){
					next.distance = current.distance +1;
					next.parent = current;
					Q.push(next);
				}
			}
			if(current.y > 0 && ! towerGrid[current.y-1][current.x].filled){
				next = towerGrid[current.y-1][current.x];
				if(next.distance == null){
					next.distance = current.distance +1;
					next.parent = current;
					Q.push(next);
				}
			}
			if(current.y < maxy && ! towerGrid[current.y+1][current.x].filled){
				next = towerGrid[current.y+1][current.x];
				if(next.distance == null){
					next.distance = current.distance +1;
					next.parent = current;
					Q.push(next);
				}
			}
		}
		pos = towerGrid[maxy][maxx];
		var path = [];
		while (pos.parent!=null){
			path.push({x:((pos.x+1)*50)+25,y:((pos.y+1)*50)+25});
			pos = pos.parent;
		}
		path.push({x:0+25,y:(4*50)+25});
		
	}calcMutex = true;
	return path;
	}

	function gameloop(){
		var elapsedTime = performance.now() - startTime;
		if(cancelFrame){
			/*When we cancel the game, there may be some code we want to execute here.*/
            /*we tell them they're weak noobs for being quitters*/
            alert("You're a weak noob for being a quitter.");
		}else{
			gameState.update(elapsedTime);
			gameState.render(elapsedTime);
			rqId = requestAnimationFrame(gameloop)
		}
	}
	
	function addPellet(p){
		pellets.push(p);
	}
	
	function addBasicTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['proj_tower_1','proj_tower_2','proj_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
	
	function addBombTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['bomb_tower_1','bomb_tower_2','bomb_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
   
	
	function addAirTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['air_tower_1','air_tower_2','air_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
    
    function addCreep1(){
        tempCreep = gameobjects.Creep({
            type: 1,
            typepath:'creep_1',
			pos: {x:100, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
			health: 50,
            maxhealth: 50,
            spriteCount: 4,
            width: 50,
            height: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: shortestPath,
        });
        creeps.push(tempCreep);
        console.log(tempCreep);
    }
    
    function addCreep2(){
        tempCreep = gameobjects.Creep({
            type: 2,
            typepath:'creep_2',
			pos: {x:100, y:300},
            value: 5,
            spriteTime : [1000,2000,2000,5000],
            width: 50,
            spriteCount: 4,
            height: 50,
			health: 50,
            maxhealth: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: shortestPath,
            
        });
        creeps.push(tempCreep);
        console.log(tempCreep);
    }
    
    function addCreepAir(){
    	var spec = {
            type: 3,
            spriteCount: 4,
            typepath:'creep_air',
			pos: {x:100, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
            creepWidth: 50,
            height: 50,
			health: 50,
            maxhealth: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: shortestPath,
        };
        console.log(spec);
        tempCreep = gameobjects.Creep(spec);
        tempCreep.width = 50;
        creeps.push(tempCreep);
        console.log(tempCreep);
    }
    
    function addCreepBoss(){
        tempCreep = gameobjects.Creep({
            type: 4,
            typepath:'creep_boss',
			pos: {x:100, y:300},
            value: 5,
            width: 50,
            height: 50,
			health: 50,
            destination: {x:800, y:300},
            speed: 5,
            rotation: 0,
            path: [],
        });
        creeps.push(tempCreep);
        console.log(tempCreep);
    }
    
	
	function towerCollision(obj){
		console.log(obj);
		for( i in towers){
			if(towers[i].box.collidesWith(obj)){
				console.log("Tower collision");
				return true;
			}
		}return false;
	}
	
	function addSlowTower(){
		tempTower = gameobjects.Tower({
			pos:{x:100,y:100},
			tier:0,
			upgradePath:['slow_tower_1','slow_tower_2','slow_tower_3'],
			sellPrice:100,
			fireRate: 2,
			radius: 100,
		});
	}
	
	function targetPractice(){
		targetx = Math.floor(Math.random() * graphics.gameWidth);
		targety = Math.floor(Math.random() * graphics.gameHeight)
		for(var i = 0 ; i < towers.length; i++){
			towers[i].selectTarget({
				x: targetx,
				y: targety,
			});
		}
		testTarget = graphics.Circle({
			center:{x:targetx,y:targety},
			radius:10,
			fill:'rgba(255,255,255,1.0)',
			line: 0,
			lineColor:'rgba(255,255,255,1.0)',
		});
	}
	
	gameStateBuild = (function (){
		var that = {
			test:[],
		};
		
		var hexSize = 100;
		
		for ( var j = 0; j*hexSize*2 < graphics.gameHeight + hexSize; j++){
			var temp = []
			var offset = 0;
			if( j % 2 ){
				offset = hexSize;
			}
			for ( var i = 0; i*hexSize*2 < graphics.gameWidth + hexSize ; i++){
				//console.log(i);
				temp [i] = graphics.Polygon({
					rotation:(Math.PI/2),
					x: ((hexSize*2)*i)+offset,
					y:(hexSize*2*j),
					size:hexSize,
					sides:6,
					stroke:"#000000",
					lineWidth:0,
					fill:"#ffffff",
				});
			}
			that.test.push(temp)
		}
		
		that.update = function (elapsedTime){
			//console.log(that.test);
			//that.test.rotate(2*Math.Pi*elapsedTime%1000)
			mouseInputs = mouse.update(elapsedTime);
			pos = mouse.position;
			if(tempTower != null){
				//console.log(mouseInputs.length);
				if(mouseInputs.length > 0 && !towerCollision(tempTower.box) && !towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled){
					towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled = true;
					calcMutex = false; // switch the calc variable so we don't have a race condition.
					shortestPath = calcShortestPath();
					console.log('pos: '+(Math.round(pos.y/50)-1)+','+(Math.round(pos.x/50)-1));
					tempTower.radiusOff();
					towers.push(tempTower);
					tempTower = null;
				}else{
					if(pos.x >= 25 && pos.x <= graphics.gameWidth-25 && pos.y >= 25 && pos.y <= graphics.gameHeight-25){
						tempTower.moveTo(Math.round(pos.x/50)*50,Math.round(pos.y/50)*50);
						
					}
				}
			}
			
			for(var c in creeps){
           		creeps[c].update(elapsedTime);
           	}
			
			for(var i in towers){
				towers[i].update(elapsedTime);
			}
			
			for(var i =0; i<pellets.length; i++){
				/*if(pellets[i].maxDistance()){
					//pellets.splice(i,1);
					//i--;
					//console.log("despawn pellet");
				}else{*/
					pellets[i].update(elapsedTime);
				//}
			}
			
		};
		that.render = function (elapsedTime){ //placeholder function for game logic on build state.
			//console.log("update");
			graphics.clear();
			
			for(var i in towers){
				towers[i].draw();
			}
			
			for(var i =0; i<pellets.length; i++){
				pellets[i].draw();
			}
            
           for(var c in creeps){
				creeps[c].draw(elapsedTime);
			}
			
			if(tempTower != null){
				tempTower.draw();
			}
			
			if(testTarget != null){
				testTarget.draw();
			}
		};
		return that;
	}());
	
	gameStateBattle = function(){ //placeholder function for game logic on battle state.
	}
	
	function initializeGame(){
		/*We should use this to initialize variables we declare below*/
		console.log ("Initializing...");
		populateTowerGrid();
		gameState = gameStateBuild;
		startTime = performance.now();
		mouse = input.Mouse();
        shortestPath = calcShortestPath();
		gameloop();
	}
	
	
	
	return {
		start: initializeGame,
		addBasicTower: addBasicTower,
		addBombTower: addBombTower,
		addAirTower: addAirTower,
		addSlowTower: addSlowTower,
		addCreep1: addCreep1,
		addCreep2: addCreep2,
		addCreepAir: addCreepAir,
		addCreepBoss: addCreepBoss,
		targetPractice: targetPractice,
		addPellet: addPellet,
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server, Game.assets, Game.gameobjects));
