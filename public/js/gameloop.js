var ticktime;

Game.gameLoop = (function (graphics, input, screens, server, assets, gameobjects, screens, levels){
	var rqId = null;
	var cancelFrame = false;
	//Game states.
	var gameState;
	var gameStateBuild;
	var gameStateBattle;
	var startTime;
	var tempTower = null;
    var tempCreep = null;
    var tempParticle = null;
	var mouse = input.Mouse();
	var keyboard = input.Keyboard();
	var towers = [];
    var creeps = [];
    var pellets = [];
    var particles = [];
	var towerGrid = [];
	var boundaryBoxes = [];
	var explodingBombBoxes = [];
	var sumVertex = 0;
	var Q = [];
	var calcMutex = true;
	var shortestPath = [];
    var shortestPathTop = [];
	var testTarget = null;
	var selectedTower = null;
	var catnip = 500;
    var lives = 10;
    var currentLevel = 0;
    var score = 0;
    var allowNextLevel = false;
	
	var setKeyType = null;
	var startSpawn = false;
	
	var upgradeKey = [KeyEvent.DOM_VK_U];
	var sellKey = [KeyEvent.DOM_VK_S];
	var nextLevelKey = [KeyEvent.DOM_VK_G];
	
	function populateTowerGrid(){
		sumVertex = 0;
		for(var i =25; i < graphics.gameHeight - 50; i+=50){
			line = []
			for(var j=25; j < graphics.gameWidth -50; j+=50){
				line.push({filled:false,distance:null,parent:null,x:Math.round((j-25)/50),y:Math.round((i-25)/50),xreal:j,yreal:i});
				sumVertex++;
			}
			towerGrid.push(line);
		}
		towerGrid[4][0].distance = 0;
		towerGrid[4][0].filled = true;
		towerGrid[0][7].filled = true;
		towerGrid[4][towerGrid[4].length-1].filled = false;
		//console.log(towerGrid);
	}
	
	function clearTowerGrid(){
		for (var i in towerGrid){ //Initialize Q. this is n^2, but i'm not sure how to do this any other way.
			for (var j in towerGrid[i]){
				towerGrid[i][j].parent = null;
				towerGrid[i][j].distance = null;
			}
		}
	}
	
	function calcDistance(x0,y0,x1,y1){
		return Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1));
	}
	
	function deepCopy (array){
		var temp = []
		for(var i=0 ; i<array.length; i++){
			temp.push(array[i]);
		}
		return temp;
	}
	
	function calcShortestPath(startx,starty,endx,endy,creep){ 
		var temppath = [];
		var oldState;
		if(creep == 1){
			oldState = towerGrid[starty][startx].filled;
		    towerGrid[starty][startx].filled = true;
		}
		//using dijkstra's.
		Q = [];
		var maxx = towerGrid[0].length;
		//console.log(maxx);
		var maxy = towerGrid.length; 
		var src = null;
		for (var i = 0; i < maxy; i++){
			for (var j =0; j < maxx; j++){
				towerGrid[i][j].distance = null;
				towerGrid[i][j].p = null;
			}
		}
		
		Q.push(towerGrid[starty][startx]);
		
		while (Q.length > 0){
			var current = Q.shift();
			var next;
			if(current.x > 0 && ! towerGrid[current.y][current.x-1].filled){ //if left exists and left is not filled
				next = towerGrid[current.y][current.x-1];
				if(next.distance == null ){
					next.distance = current.distance+1;
					next.p = current;
					Q.push(next);
				}
			}
			if(current.x+1 < maxx && ! towerGrid[current.y][current.x+1].filled){ //right exists and right not filled.
				next = towerGrid[current.y][current.x+1];
				if(next.distance == null){
					next.distance = current.distance +1;
					next.p = current;
					Q.push(next);
				}
			}
			if(current.y > 0 && ! towerGrid[current.y-1][current.x].filled){
				next = towerGrid[current.y-1][current.x];
				if(next.distance == null){
					next.distance = current.distance +1;
					next.p = current;
					Q.push(next);
				}
			}
			if(current.y+1 < maxy && ! towerGrid[current.y+1][current.x].filled){
				next = towerGrid[current.y+1][current.x];
				if(next.distance == null){
					next.distance = current.distance +1;
					next.p = current;
					Q.push(next);
				}
			}
		}
		
		pos = towerGrid[endy][endx];
		//temppath.push({x:((endx+1)*50)+50,y:((endy)*50)+50});
		while (pos.p!=null){
			temppath.push({x:((pos.x+1)*50),y:((pos.y+1)*50)});
			pos = pos.p;
		}
		//temppath.push({x:(startx*50)+50,y:(starty*50)+50});
		
	
		if(endx>endy){
			temppath.unshift({x:801,y:250});
		}
		else{
		    temppath.unshift({x:400,y:501});
		}
		if(creep == 1){
		    towerGrid[starty][startx].filled = oldState;
		}
		return temppath;
    
	}

	function recalculateCreepsShortestPath(){
		for(var u=0;u<creeps.length;u++){ 
           //console.log("creep grid: " + creeps[u].grid.x, creeps[u].grid.y);
           if(!creeps[u].air){
           		if(creeps[u].horizontal){
           			creeps[u].path = calcShortestPath(creeps[u].grid.x, creeps[u].grid.y, 14, 4,1)
           		}else{
           			creeps[u].path = calcShortestPath(creeps[u].grid.x, creeps[u].grid.y, 7, 8,1)
           		}
           //console.log(creeps[u].path);
           }
           
        }
        levels.updateUnspawnedPaths(shortestPath,shortestPathTop);
	}
    
	function gameloop(Ntime){
		var elapsedTime = performance.now() - startTime;
        ticktime = Ntime -Ltime;
        Ltime = Ntime;
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
	
	function setScore(){
		document.getElementById('current_score').innerHTML = score;
	}
	
	function addPellet(p){
		pellets.push(p);
        fireSound.play();
	}
    
    function generateCreepDeathPoof(xin,yin){
        var b = -1;
        for(var p=0;p<15;p++){
            if(p>=8){
                b = 1;
            }
            tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*30),y:yin+Math.random()*10},
                life: 500,
                dx: b,
                dy: 5,
                color: 'rgba(0,110,0,0.8)'
            });
            particles.push(tempParticle);
        }
    }
    
    function generateTowerSalePoof(xin, yin){
        var b = -1;
        for(var p=0;p<15;p++){
            if(p>=8){
                b = 1;
            }
            tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*30),y:yin+Math.random()*10},
                life: 500,
                dx: b,
                dy: -5,
                color: 'rgba(0,110,0,0.8)'
            });
            particles.push(tempParticle);
        }
    }
    
    function generateScoreParticle(xin,yin,score){
    	tempParticle = gameobjects.TextParticle({
    		pos:{x:xin,y:yin},
    		life:2000,
    		dx:0,
    		dy:-1,
    		text:"+"+score,
    	});
    	particles.push(tempParticle);
    }
    
    function generateBombTrailDot(xin, yin){
        for(var p=0;p<4;p++){
            if(p==0){
                tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*10},
                life: 200,
                dx: -1,
                dy: 0,
                color: 'rgba(212,212,212,0.3)'
            });
            }
            else if(p==1){
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*10},
                life: 200,
                dx: 0,
                dy: -1,
                color: 'rgba(212,212,212,0.3)'
            });
            }
              else if(p==2){
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*10},
                life: 200,
                dx: 1,
                dy: 0,
                color: 'rgba(212,212,212,0.3)'
            });
            }
            else{
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*10},
                life: 200,
                dx: 0,
                dy: -1,
                color: 'rgba(212,212,212,0.3)'
            });
            }
            particles.push(tempParticle);
        }
    }
    
    function generateBombBoomPoof(xin, yin){
            for(var p=0;p<24;p++){
            if(p<=5){
                tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*40},
                life: 200+Math.random()*60,
                dx: -2,
                dy: 0,
                color: 'rgba(225,115,0,0.3)'
            });
            }
            else if(p<=11){
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*40},
                life: 200+Math.random()*60,
                dx: 0,
                dy: -2,
                color: 'rgba(225,200,0,0.3)'
            });
            }
              else if(p<=17){
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*40},
                life: 200+Math.random()*60,
                dx: 2,
                dy: 0,
                color: 'rgba(225,115,0,0.3)'
            });
            }
            else{
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*40},
                life: 200+Math.random()*60,
                dx: 0,
                dy: -2,
                color: 'rgba(225,200,0,0.3)'
            });
            }
            particles.push(tempParticle);
        }
    }
    
     function generateMissilePoof(xin, yin){
            for(var p=0;p<16;p++){
            if(p<=3){
                tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*20},
                life: 200+Math.random()*60,
                dx: -1,
                dy: 0,
                color: 'rgba(225,115,0,0.3)'
            });
            }
            else if(p<=7){
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*20},
                life: 200+Math.random()*60,
                dx: 0,
                dy: -1,
                color: 'rgba(225,200,0,0.3)'
            });
            }
              else if(p<=11){
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*20},
                life: 200+Math.random()*60,
                dx: 1,
                dy: 0,
                color: 'rgba(225,115,0,0.3)'
            });
            }
            else{
               tempParticle = gameobjects.Particle({
                pos:{x:(xin+Math.random()*10),y:yin+Math.random()*20},
                life: 200+Math.random()*60,
                dx: 0,
                dy: -1,
                color: 'rgba(225,200,0,0.3)'
            });
            }
            particles.push(tempParticle);
        }
    }
	
	function updateSelectedTowerHTML(towerType,tier,sellPrice){
		document.getElementById('selected_towertype').innerHTML = towerType;
		document.getElementById('selected_towerlevel').innerHTML = tier+1;
		if(tier < 2){
			document.getElementById('selected_upgradecost').innerHTML = sellPrice*tier + (50*(tier+1));
		}else{
			document.getElementById('selected_upgradecost').innerHTML = "---";
		}
		document.getElementById('selected_sellprice').innerHTML = sellPrice;
		document.getElementById('sell').disabled = false;
		if(tier < 2){
			document.getElementById('upgrade').disabled = false;
		}else{
			document.getElementById('upgrade').disabled = true;
		}
	}
	
	function clearSelectedTowerHTML(){
		document.getElementById('selected_towertype').innerHTML = "---";
		document.getElementById('selected_towerlevel').innerHTML = "---";
		document.getElementById('selected_upgradecost').innerHTML = "---";
		document.getElementById('selected_sellprice').innerHTML = "---";
		document.getElementById('sell').disabled = true;
		document.getElementById('upgrade').disabled = true;
	}
	
	function upgradeSelectedTower(){
		if(selectedTower != null){
			var upgradeCost = towers[selectedTower].sellPrice*towers[selectedTower].tier + (50*(towers[selectedTower].tier+1));
			if(towers[selectedTower].tier < 2 && catnip >= upgradeCost){
				towers[selectedTower].upgrade();
				//console.log("upgrading tower to tier "+towers[selectedTower].tier);
				updateSelectedTowerHTML(towers[selectedTower].typeName, towers[selectedTower].tier, towers[selectedTower].sellPrice)
				catnip -= upgradeCost;
			}
		}
	}
	
	function sellSelectedTower(){
		if(selectedTower != null){
			var gonzo = towers.splice(selectedTower,1);
            towersellSound.play();
			//console.log ("selling tower");
			//console.log(gonzo);
			//console.log(gonzo[0].sellPrice);
			towerGrid[(Math.round(gonzo[0].pos.y/50)-1)][(Math.round(gonzo[0].pos.x/50)-1)].filled = false;
			catnip += gonzo[0].sellPrice;
			generateTowerSalePoof(gonzo[0].pos.x,gonzo[0].pos.y);
			selectedTower = null;
			clearSelectedTowerHTML();
			
			//update creep paths
			shortestPath = calcShortestPath(0,4,14,4);
			recalculateCreepsShortestPath();
		}
	}
	
	function sendNextWave(){
		startSpawn = true;
		document.getElementById('nextWave').disabled = true;
		//Game.gameLoop.addCreep1();
		//Game.gameLoop.addCreep1();
		//Game.gameLoop.addCreep1();
	}
	
	function addCreep(creep){
		creeps.push(creep)
	}
	
	function addBasicTower(){
		if(catnip >= 100){
			tempTower = gameobjects.Tower({
				typeName:"Basic Tower",
				pos:{x:100,y:100},
				tier:0,
				upgradePath:['proj_tower_1','proj_tower_2','proj_tower_3'],
				sellPrice:100,
				fireRate: 500,
				radius: 150,
				aa:true,
				damage: 50,
				pelletType:0,
				upgradeActions: [null,function(that){that.tower.fireRate = 250;},function(that){that.tower.fireRate = 100;}],
			});
			catnip -= 100;
		}
		
	}
	
	function addBombTower(){
		if(catnip >= 150){
			tempTower = gameobjects.Tower({
				typeName:"Bomb Tower",
				pos:{x:100,y:100},
				tier:0,
				upgradePath:['bomb_tower_1','bomb_tower_2','bomb_tower_3'],
				sellPrice:150,
				fireRate: 1000,
				radius: 100,
				aa:false,
				damage:50,
				pelletType:1,
				upgradeActions:[null,function(that){that.tower.damage = 75;},function(that){that.tower.range = 150;}],
			});
			catnip -= 150;
		}
		
	}
   
	
	function addAirTower(){
		if(catnip >= 150){
			tempTower = gameobjects.Tower({
				typeName:"Air Tower",
				pos:{x:100,y:100},
				tier:0,
				upgradePath:['air_tower_1','air_tower_2','air_tower_3'],
				sellPrice:150,
				fireRate: 500,
				radius: 175,
				aa:true,
				damage:50,
				pelletType:2,
				upgradeActions:[null,function(that){that.tower.damage = 100;},function(that){that.tower.damage = 150;}],
			});
			catnip -= 150;
		}
		
	}
	
	function addSlowTower(){
		if(catnip >= 200){
			tempTower = gameobjects.Tower({
				typeName:"Slow Tower",
				pos:{x:100,y:100},
				tier:0,
				upgradePath:['slow_tower_1','slow_tower_2','slow_tower_3'],
				sellPrice:200,
				fireRate: 500,
				radius: 150,
				aa:false,
				damage:2,
				pelletType:3,
				upgradeActions:[null,function(that){that.tower.fireRate = 250;},function(that){that.tower.damage = 50;}],
			});
			catnip -= 200;
		}
		
	}
    
    function drawTowerGrid(grid){
    	
    	for(var i=0; i<grid.length; i++){
    		for(var j=0; j<grid[0].length; j++){
    			if(grid[i][j].filled){
					var temp = graphics.Rectangle({
						x:grid[i][j].xreal,
						y:grid[i][j].yreal,
						width:50,
						height:50,
						fill:'rgba(255,0,0,0.2)',
						stroke: 'rgba(255,255,255,1)',
						rotation:0,
					})
				}else{
					var temp = graphics.Rectangle({
						x:grid[i][j].xreal,
						y:grid[i][j].yreal,
						width:50,
						height:50,
						fill:'rgba(0,255,0,0.2)',
						stroke: 'rgba(255,255,255,1)',
						rotation:0,
					})
				}
    			temp.draw();
    		}
    	}
    }
    
    function drawPath(p){
    	drawablePath = []
    	for(var i=0; i<p.length; i++){
    		var temp = graphics.Circle({
				center: {x: p[i].x, y: p[i].y},
				radius: 10,
				fill: 'rgba(255,255,255,1)',
				line: 0,
				lineColor: 'rgba(255,255,255,1)',
			});
			temp.draw();
    	}
    }
   
	function towerCollision(obj){
		//console.log(obj);
		for( i in towers){
			if(towers[i].box.collidesWith(obj)){
				//console.log("Tower collision");
				return true;
			}
		}return false;
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
			//first check to see if we lost
			if(lives<0){
				for(var t=0; t<towers.length; t++){
					score += towers[t].sellPrice*2;
				}
				score += 100 * (currentLevel+1)
				reportScore(score);
				gameState = gameStateFailure;
			}
			//console.log(that.test);
			//that.test.rotate(2*Math.Pi*elapsedTime%1000)
			
			//console.log(levels);
			if(levels.getCurLevel() != null && startSpawn){
				var levelSpawns = levels.getCurLevel().update(ticktime);
				
				for (var i=0; i< levelSpawns.length; i++){
					creeps.push(levelSpawns[i]);
				}
				if(levels.getCurLevel().levelComplete){
					currentLevel++;
					levels.setLevel(currentLevel);
					startSpawn = false;
					document.getElementById('nextWave').disabled = false;
				}
			}
			
			var mouseInputs = mouse.update(elapsedTime);
			var pos = mouse.position;
			if(tempTower != null){
				//console.log(mouseInputs.length);
				if(mouseInputs.length > 0 && !towerCollision(tempTower.box) && !towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled){
					towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled = true;
					calcMutex = false; // switch the calc variable so we don't have a race condition.
					var lastPath = shortestPath
					var lastPathTop = shortestPathTop;
					shortestPath = calcShortestPath(0,4,14,4);
                    shortestPathTop = calcShortestPath(7,0,7,8);
					if(shortestPath.length > 1 && shortestPathTop.length >1){
						tempTower.radiusOff();
						towers.push(tempTower);
                        
                        
                        recalculateCreepsShortestPath();
                        
                        towerplaceSound.play();
						tempTower = null;
					}else{
						towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled = false;
						shortestPath = lastPath;
						shortestPathTop = lastPathTop;
					}
				}else{
					if(pos.x >= 25 && pos.x <= graphics.gameWidth-25 && pos.y >= 25 && pos.y <= graphics.gameHeight-25){
						tempTower.moveTo(Math.round(pos.x/50)*50,Math.round(pos.y/50)*50);
						
					}
				}
			}else if(mouseInputs.length > 0){
				for (var i =0; i < towers.length; i++){
					if(towers[i].box.clickedOn(pos.x,pos.y)){
						//console.log(towers[i]);
						selectedTower = i;
						towers[i].showRadius = true;
						updateSelectedTowerHTML(towers[i].typeName, towers[i].tier, towers[i].sellPrice);
					}else{
						towers[i].showRadius = false;
					}
				}
			}
			
			//handling keyboard inputs...
			
			keyboard.update(ticktime);

			for(var c=0; c<creeps.length; c++){

				creeps[c].update(elapsedTime);
				for(var b=0; b<explodingBombBoxes.length; b++){
					var difx = creeps[c].pos.x - explodingBombBoxes.x;
					var dify = creeps[c].pos.y - explodingBombBoxes.y;
					var curDistance = Math.sqrt(Math.pow(difx,2) + Math.pow(dify,2));
					if(curDistance <= explodingBombBoxes.radius && !creeps[c].air){
						creeps[c].hit(explodingBombBoxes.dmg);
					}
				}
				if(!creeps[c].live){
					generateScoreParticle(creeps[c].pos.x,creeps[c].pos.y,creeps[c].value);
					score += creeps[c].value;
					catnip += creeps[c].value;
					creeps.splice(c,1);
					c--;
				}
			}
            for(var v=0;v<creeps.length;v++){
               if(creeps[v].pos.x > 800 || creeps[v].pos.y > 500){
                    creeps.splice(v,1);
                    lives -= 1;
                   
                }
                
            }
			for(var j=0; j<towers.length; j++){
				towers[j].update(elapsedTime);
				if(creeps.length == 0){
					towers[j].clearTarget();
				}
				var target = null;
           		for(var c=0; c<creeps.length; c++){
					var creepLocation = creeps[c].reportPos();
					//console.log(creepLocation);
					if(target != null){
						var distance = calcDistance(target.x,target.y,creepLocation.x,creepLocation.y);
					}
					var inRange = towers[j].isInRange(creepLocation.x,creepLocation.y);
					if(	inRange && 
						((target != null && distance<target.distance) || target == null)
						){
						//console.log(towers[j].tower.pelletType);
						if(creeps[c].air == false && (towers[j].tower.pelletType == 1 || towers[j].tower.pelletType == 3)){ //bomb and frost towers ground only
							//towers[j].selectTarget(creepLocation);
							target = creepLocation;
							target.distance = distance;
						}else if(creeps[c].air == true && towers[j].tower.pelletType == 2){ //missle towers air only
							//towers[j].selectTarget(creepLocation);
							target = creepLocation;
							target.distance = distance;
						}else if(towers[j].tower.pelletType == 0){
							//towers[j].selectTarget(creepLocation);
							target = creepLocation;
							target.distance = distance;
						}
						
					}else{
						if(inRange){
							break;
						}
					}
					
				}
				if(target != null){
					towers[j].selectTarget(creepLocation);
				}else{
					towers[j].clearTarget();
				}
           	}
               
            for(var p=0;p<particles.length;p++){
                if(particles[p].update(ticktime)==true){
                    //and believe me I am still alive. Doing science and I'm still alive
                }//<<---- what is this shit?! This isn't even the ONE TRUE BRACE STYLE!!
                else{
                    particles.splice(p,1);
                    p--;
                    
                    
                }
            }
			
			for(var i =0; i<pellets.length; i++){
				pellets[i].update(ticktime);
				
				for(var c=0; c<creeps.length && pellets.length > 0; c++){
                    //console.log("PELLET: " + pellets[i].box);
                    //console.log("CREEP " + creeps[c].box);
					if(pellets[i].box.collidesWith(creeps[c].box) && creeps[c].live){
						//check for pellet type vs creep type
						if(	(pellets[i].type == 0  || 
							((pellets[i].type == 1 || pellets[i].type == 3) && !creeps[c].air) || 
							(pellets[i].type == 2 && creeps[c].air) ) &&
							pellets[i].live
							){
							pellets[i].live = false;
							var damage = pellets[i].damage;
							var type = pellets[i].type;
							var loc = pellets[i].pellet.getPos();
							switch(type){
								case 1: //generate bomb poof
									explodingBombBoxes.push({x:loc.x,y:loc.y,radius:100,dmg:damage});
									generateBombBoomPoof(loc.x,loc.y);
									explodeSound.play();
									break;
								case 2: //Generate missile Poof
									generateMissilePoof(loc.x,loc.y);
									explodeSound.play();
									break;
								case 3: //reduce creep speed
									creeps[c].speed = (3*creeps[c].speed)/4 
									break;
							}
							//console.log(pellets[i]);
							//console.log("creep hit!");
							//console.log(pellets[i]);
							if(creeps[c].hit(damage)){ //if the creep is dead
								var creepLoc = creeps[c].pos;
								generateCreepDeathPoof(creepLoc.x,creepLoc.y);
								score += creeps[c].value;
								catnip += creeps[c].value;
		                        deathSound.play();
		                        creeps[c].live = false;
								//console.log("killing creep at: "+creepLoc.x+","+creepLoc.y);
							}
						}else{
							//console.log('wrong pellet hit');
						}
						
						
					}
					//console.log("pellet hit!");
				}
				if(pellets[i].maxDistance() || !pellets[i].live){
					pellets.splice(i,1);
					i--;
				}
			}
			setScore();
			
		};
		that.render = function (elapsedTime){ //placeholder function for game logic on build state.
			//update HTML elements
			document.getElementById('current_catnip').innerHTML = catnip;
            document.getElementById('current_lives').innerHTML = lives;
		
			//updating game elements
			graphics.clear();
			
			for(var b=0; b<boundaryBoxes.length; b++){
				boundaryBoxes[b].draw();
			}
			
			for(var i in towers){
				towers[i].draw();
			}
			
			for(var v=0; v<pellets.length; v++){
				pellets[v].draw();
			}
            
           for(var c in creeps){
				creeps[c].draw(elapsedTime);
			}
            
            for(var p=0;p<particles.length;p++){
                particles[p].draw();
            }
			
			if(tempTower != null){
				tempTower.draw();
			}
			
			if(testTarget != null){
				testTarget.draw();
			}
			//Debugging code for checking intersects and pathing.
			/*drawTowerGrid(towerGrid);
			drawPath(shortestPath);
			drawPath(shortestPathTop);*/
			
			
		};
		return that;
	}());
	
	gameStatePause = (function(){
		var that = {};
		that.update = function(elapsedTime){
			keyboard.update(ticktime);
		};
		that.render = function(elapsedTime){
			graphics.clear();
			
			for(var b=0; b<boundaryBoxes.length; b++){
				boundaryBoxes[b].draw();
			}
			
			for(var i in towers){
				towers[i].draw();
			}
			
			for(var v=0; v<pellets.length; v++){
				pellets[v].draw();
			}
            
           for(var c in creeps){
				creeps[c].draw(elapsedTime);
			}
            
            for(var p=0;p<particles.length;p++){
                particles[p].draw();
            }
		};
		return that;
	}());
	
	gameStateFailure = (function(){ //placeholder function for game logic on Game Loss
		var that = {};
		
		that.insults = [
			"You're litterally worse than Kitler!",
			"You belong in Meowshwitz!",
			"Catastrophic Failure!",
			"What a Catastrophy!",
		];
		
		that.kitler = graphics.Texture({
			center: {x:graphics.gameWidth/2,y:100},
			width:200,
			height:200,
			image: assets.getAsset('adolfkitler'),
			rotation : 0,
			moveRate : 200,
		});
		
		that.gameOverText = graphics.Text({
			x: graphics.gameWidth/2, 
			y: graphics.gameHeight/2,
			txt: "Game Over",
			font: '80px Arial',
		});
		that.insultText = graphics.Text({
			x: graphics.gameWidth/2,
			y: (graphics.gameHeight/2)+20,
			txt: that.insults[0],
			font: '20px Arial',
		});
		that.instructionText = graphics.Text({
			x: graphics.gameWidth/2,
			y: graphics.gameHeight/2+50,
			txt: "Press N for new game",
			font: '30px Arial',
		});
		
		that.update = function(elapsedTime){
			keyboard.update(ticktime);
			
		}
		
		that.render = function(elapsedTime){
			that.kitler.draw();
			that.gameOverText.draw();
			that.insultText.draw();
			that.instructionText.draw();
		}
		
		return that;
	}())
	
	gameStateSetKeyCode = (function(){
		var that = {capturedKeyCombo: {}}
		var beginCaptureFlag = false; //this flag will indicate we're starting capture.
		var actionCaptured = false;
		var capturedKeyCombo = {};
		var maxKeyPressed = -1;
		
		function keysSame(dic1,dic2){
			
			for(var key in dic1){
				if(!(key in dic2)){
					return false;
				}
			}
			/*console.log(dic1);
			console.log('vs');
			console.log(dic2);*/
			return true;
		}
		
		that.update = function(elapsedTime){
			keyboard.update(elapsedTime);
			if(keyboard.totalKeysPressed > 0 && !beginCaptureFlag){
				beginCaptureFlag = true;
			}
			if( (keyboard.totalKeysPressed >= maxKeyPressed) && beginCaptureFlag){
				capturedKeyCombo = keyboard.getCopyOfKeys(); //grab a copy of the currently depressed keys
				maxKeyPressed = keyboard.totalKeysPressed;
				actionCaptured = true;
				
			}else{
				beginCaptureFlag=false;
			}
			if(keyboard.totalKeysPressed == 0 && actionCaptured){
				//switch statement for action set types
				
				//console.log('captured key combo');
				//console.log(capturedKeyCombo);
				
				var tempConvertedKeyCombo = [];
				
				for(var attr in capturedKeyCombo){
					tempConvertedKeyCombo.push(parseInt(attr));
				}
				//console.log(tempConvertedKeyCombo);
				
				switch(setKeyType){
					case "Sell":
						Game.gameLoop.sellKey = tempConvertedKeyCombo;
						//console.log("setting sell key to : ");
						//console.log(Game.gameLoop.sellKey);
						break;
					case "Upgrade":
						Game.gameLoop.upgradeKey = tempConvertedKeyCombo;
						
						break;
					case "Level":
						Game.gameLoop.nextLevelKey = tempConvertedKeyCombo;
						break;
				}
				
				//change game state.
				showScreen('state-controls');
				actionCaptured = false;
				enableControlSetButtons();
				gameState = gameStateBuild;
			}
		}
		that.render = function(elapsedTime){
		}
		return that;
	}());
	
	function showScreen(id) {
		var screen = 0,
			active = null;
		//
		// Remove the active state from all screens.  There should only be one...
		active = document.getElementsByClassName('Active');
		for (screen = 0; screen < active.length; screen++) {
			active[screen].classList.remove('Active');
		}
		//
		// Tell the screen to start actively running
		screens[id].initialize();
		screens[id].run();
		//
		// Then, set the new screen to be active
		document.getElementById(id).classList.add('Active');
	}
	
	function initializeGame(){
		/*Clear Variables*/
		towers = [];
		creeps = [];
		pellets = [];
		particles = [];
		towerGrid = [];
		boundaryBoxes = [];
		explodingBombBoxes = [];
		lives = 9;
		currentLevel = 0;
		catnip = 500;
		score = 0;
		//cancelFrame = false;
		/*We should use this to initialize variables we declare below*/
		console.log ("Initializing...");
		
		populateTowerGrid();
		gameState = gameStateBuild;
		startTime = performance.now();
		
		//console.log(levels.getCurLevel());
		/*initialize boundary boxes to create the border*/
		boundaryBoxes.push(graphics.Rectangle({
			x:0,
			y:0,
			width:25,
			height:(graphics.gameHeight/2)-25,
			fill:'rgba(255,255,255,0.5)',
		}));
		boundaryBoxes.push(graphics.Rectangle({
			x:0,
			y:(graphics.gameHeight/2)+25,
			width:25,
			height:(graphics.gameHeight/2)-25,
			fill:'rgba(255,255,255,0.5)',
		}));
		boundaryBoxes.push(graphics.Rectangle({
			x:graphics.gameWidth-25,
			y:0,
			width:25,
			height:(graphics.gameHeight/2)-25,
			fill:'rgba(255,255,255,0.5)',
		}));
		boundaryBoxes.push(graphics.Rectangle({
			x:graphics.gameWidth-25,
			y:(graphics.gameHeight/2)+25,
			width:25,
			height:(graphics.gameHeight/2)-25,
			fill:'rgba(255,255,255,0.5)',
		}));
		boundaryBoxes.push(graphics.Rectangle({
			x:0,
			y:0,
			width:(graphics.gameWidth/2)-25,
			height:25,
			fill:'rgba(255,255,255,0.5)',
		}));
		boundaryBoxes.push(graphics.Rectangle({
			x:(graphics.gameWidth/2)+25,
			y:0,
			width:(graphics.gameWidth/2)-25,
			height:25,
			fill:'rgba(255,255,255,0.5)',
		}));
		boundaryBoxes.push(graphics.Rectangle({
			x:0,
			y:graphics.gameHeight-25,
			width:(graphics.gameWidth/2)-25,
			height:25,
			fill:'rgba(255,255,255,0.5)',
		}));
		boundaryBoxes.push(graphics.Rectangle({
			x:(graphics.gameWidth/2)+25,
			y:graphics.gameHeight-25,
			width:(graphics.gameWidth/2)-25,
			height:25,
			fill:'rgba(255,255,255,0.5)',
		}));
		
        shortestPath = calcShortestPath(0,4,14,4);
        shortestPathTop = calcShortestPath(7,0,7,8);
        //console.log(shortestPath);
        startSpawn = false;
        levels.setLevel(0);
        if(rqId == null){
			requestAnimationFrame(gameloop);
		}
	}
	
	function disableControlSetButtons(){
		document.getElementById('curentSellButton').disabled = true;
		document.getElementById('currentUpgradeButton').disabled = true;
		document.getElementById('currentWaveButton').disabled = true;
	}
	
	function enableControlSetButtons(){
		document.getElementById('curentSellButton').disabled = false;
		document.getElementById('currentUpgradeButton').disabled = false;
		document.getElementById('currentWaveButton').disabled = false;
	}
	
	function setSellKey(){
		//console.log("key set pressed");
		setKeyType = "Sell";
		disableControlSetButtons();
		gameState = gameStateSetKeyCode;
	}
	
	function setUpgradeKey(){
		setKeyType = "Upgrade";
		disableControlSetButtons();
		gameState = gameStateSetKeyCode;
	}
	
	function setWaveKey(){
		setKeyType = "Level";
		disableControlSetButtons();
		gameState = gameStateSetKeyCode;
		
	}
	
	function getHorizontalPath(){
		return deepCopy(shortestPath);
	}
	
	function getVerticalPath(){
		return deepCopy(shortestPathTop);
	}
	
	function getHorizontalAirPath(){
		return [{x:801,y:250}];
	}
	function getVerticalAirPath(){
		return [{x:400,y:501}];
	}
	
	function startSpawningCreeps(){
		startSpawn = true;
	}
	
	function pause(){
		gameState = gameStatePause;
	}
	
	function unpause(){
		gameState = gameStateBuild;
	}
	
	function reportScore(){
		if(score != null && score != 0){
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function(){
				if(xhttp.readyState == 4 && xhttp.status == 200){
					//console.log("score reported");
				}
			};
			xhttp.open("POST", 'http://localhost:3000/v1/scores/'+score, true);
			xhttp.send();
		}
	}
	
	function clearScores(){
		if(score != null && score != 0){
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function(){
				if(xhttp.readyState == 4 && xhttp.status == 200){
					//console.log("scores cleared");
				}
			};
			xhttp.open("POST", 'http://localhost:3000/v1/scores/clear', true);
			xhttp.send();
		}
	}
	
	return {
		start: initializeGame,
		cancelFrame:cancelFrame,
		addBasicTower: addBasicTower,
		addBombTower: addBombTower,
		addAirTower: addAirTower,
		addSlowTower: addSlowTower,
		sellSelectedTower:sellSelectedTower,
		upgradeSelectedTower:upgradeSelectedTower,
		showScreen:showScreen,
		addPellet: addPellet,
		sendNextWave:sendNextWave,
        generateCreepDeathPoof: generateCreepDeathPoof,
        upgradeKey: upgradeKey,
		sellKey: sellKey,
		nextLevelKey: nextLevelKey,
		setSellKey: setSellKey,
		setUpgradeKey: setUpgradeKey,
		setWaveKey: setWaveKey,
		keyboard:keyboard,
		startSpawningCreeps:startSpawningCreeps,
        generateTowerSalePoof: generateTowerSalePoof,
        generateBombTrailDot: generateBombTrailDot,
        generateBombBoomPoof: generateBombBoomPoof,
        generateMissilePoof: generateMissilePoof,
        getHorizontalPath: getHorizontalPath,
        getVerticalPath: getVerticalPath,
        getHorizontalAirPath: getHorizontalAirPath,
        getVerticalAirPath: getVerticalAirPath,
        pause: pause,
        unpause: unpause,
        
        towerGrid: towerGrid,
        reportScore: reportScore,
        clearScores: clearScores,
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server, Game.assets, Game.gameobjects, Game.screens, Game.levels));

var Ltime = performance.now();
