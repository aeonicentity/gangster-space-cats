var ticktime;

Game.gameLoop = (function (graphics, input, screens, server, assets, gameobjects, screens){
	var rqId;
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
	var shortestPath = null;
	var sumVertex = 0;
	var Q = [];
	var calcMutex = true;
	var shortestPath = [];
	var testTarget = null;
	var selectedTower = null;
	var catnip = 500;
	
	var setKeyType = null;
	
	var upgradeKey = [KeyEvent.DOM_VK_U];
	var sellKey = [KeyEvent.DOM_VK_S];
	var nextLevelKey = [KeyEvent.DOM_VK_G];
	
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
	
	
	
	function calcShortestPath(startx,starty,endx,endy){
	console.log('begin');
	if(!calcMutex){
		//using dijkstra's.
		Q = [];
		var maxx = towerGrid[0].length - 1;
		console.log(maxx);
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
		pos = towerGrid[4][13];
		var path = [];
		while (pos.parent!=null){
			path.push({x:((pos.x+1)*50),y:((pos.y+1)*50)});
			pos = pos.parent;
		}
		path.push({x:0,y:(4*50)});
		
	}calcMutex = true;
	return path;
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
				console.log("upgrading tower to tier "+towers[selectedTower].tier);
				updateSelectedTowerHTML(towers[selectedTower].typeName, towers[selectedTower].tier, towers[selectedTower].sellPrice)
				catnip -= upgradeCost;
			}
		}
	}
	
	function sellSelectedTower(){
		if(selectedTower != null){
			var gonzo = towers.splice(selectedTower,1);
            towersellSound.play();
			console.log ("selling tower");
			console.log(gonzo);
			//console.log(gonzo[0].sellPrice);
			towerGrid[(Math.round(gonzo[0].pos.y/50)-1)][(Math.round(gonzo[0].pos.x/50)-1)].filled = false;
			catnip += gonzo[0].sellPrice;
			generateTowerSalePoof(gonzo[0].pos.x,gonzo[0].pos.y);
			selectedTower = null;
			clearSelectedTowerHTML();
		}
	}
	
	function sendNextWave(){
		Game.gameLoop.addCreep1()
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
				upgradeActions: [
					null,
					function(that){that.tower.fireRate = 250;},
					function(that){that.tower.fireRate = 100;}
				],
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
				damage:0,
				pelletType:1,
				upgradeActions:[
					null,
					function(that){
						//increase damage
					},
					function(that){
						that.tower.range = 150;
					}
				],
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
				upgradeActions:[
					null,
					function(that){
						//increase damage
						that.tower.damage = 100;
					},
					function(that){
						//increase damage
						that.tower.damage = 150;
					}
				],
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
				upgradeActions:[
					null,
					function(that){that.tower.fireRate = 250;},
					function(that){
						//increase slow ammt
					}],
			});
			catnip -= 200;
		}
		
	}
    
    function addCreep1(){
    	console.log("spawing creep along:");
    	console.log(shortestPath);
        tempCreep = gameobjects.Creep({
            type: 1,
            typepath:'creep_1',
			pos: {x:0, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
			health: 150,
            maxhealth: 150,
            spriteCount: 4,
            width: 50,
            height: 50,
            destination: {x:800, y:300},
            speed: 1,
            rotation: 0,
            air:false,
            path: shortestPath,
        });
        creeps.push(tempCreep);
        console.log(tempCreep);
    }
    
    function addCreep2(){
        tempCreep = gameobjects.Creep({
            type: 2,
            typepath:'creep_2',
			pos: {x:0, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
            width: 50,
            spriteCount: 4,
            height: 50,
			health: 5000,
            maxhealth: 5000,
            destination: {x:800, y:300},
            speed: 2,
            rotation: 0,
            air:false,
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
			pos: {x:0, y:300},
            value: 5,
            spriteTime : [500,500,500,500],
            creepWidth: 50,
            height: 50,
			health: 50,
            maxhealth: 50,
            destination: {x:800, y:300},
            speed: 2,
            rotation: 0,
            air:true,
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
		testTarget.reportPos = function(){return {x:0,y:0};};
		testTarget.box = gameobjects.CollisionBox(targetx-10,targety-10,targetx+10,targety+10);
		testTarget.hit = function(){console.log("target hit registered");};
		creeps.push(testTarget);
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
			var mouseInputs = mouse.update(elapsedTime);
			var pos = mouse.position;
			if(tempTower != null){
				//console.log(mouseInputs.length);
				if(mouseInputs.length > 0 && !towerCollision(tempTower.box) && !towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled){
					towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled = true;
					calcMutex = false; // switch the calc variable so we don't have a race condition.
					var lastPath = shortestPath
					shortestPath = calcShortestPath();
					if(shortestPath.length > 1){
						console.log(shortestPath);
						console.log('pos: '+(Math.round(pos.y/50)-1)+','+(Math.round(pos.x/50)-1));
						tempTower.radiusOff();
						towers.push(tempTower);
                        towerplaceSound.play();
						tempTower = null;
					}else{
						towerGrid[Math.round(pos.y/50)-1][Math.round(pos.x/50)-1].filled = false;
						shortestPath = lastPath;
					}
				}else{
					if(pos.x >= 25 && pos.x <= graphics.gameWidth-25 && pos.y >= 25 && pos.y <= graphics.gameHeight-25){
						tempTower.moveTo(Math.round(pos.x/50)*50,Math.round(pos.y/50)*50);
						
					}
				}
			}else if(mouseInputs.length > 0){
				for (var i =0; i < towers.length; i++){
					if(towers[i].box.clickedOn(pos.x,pos.y)){
						console.log(towers[i]);
						selectedTower = i;
						updateSelectedTowerHTML(towers[i].typeName, towers[i].tier, towers[i].sellPrice);
					}
				}
			}
			
			//handling keyboard inputs...
			
			keyboard.update(ticktime);
			for(var c=0; c<creeps.length; c++){
				creeps[c].update(elapsedTime);
				if(!creeps[c].live){
					creeps.splice(c,1);
				}
			}
			
			for(var j=0; j<towers.length; j++){
				towers[j].update(elapsedTime);
				if(creeps.length == 0){
					towers[j].clearTarget();
				}
           		for(var c=0; c<creeps.length; c++){
					var creepLocation = creeps[c].reportPos();
					//console.log(creepLocation);
					if(towers[j].isInRange(creepLocation.x,creepLocation.y)){
						console.log(towers[j].tower.pelletType);
						if(creeps[c].air == false && (towers[j].tower.pelletType == 1 || towers[j].tower.pelletType == 3)){ //bomb and frost towers ground only
							towers[j].selectTarget(creepLocation);
						}else if(creeps[c].air == true && towers[j].tower.pelletType == 2){ //missle towers air only
							towers[j].selectTarget(creepLocation);
						}else{
							towers[j].selectTarget(creepLocation);
						}
					}else{
						towers[j].clearTarget();
					}
					break;
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
						pellets[i].live = false;
						var damage = pellets[i].damage;
						var type = pellets[i].type;
						var loc = pellets[i].pellet.getPos();
						switch(type){
							case 1: //generate bomb poof
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
						console.log("creep hit!");
						//console.log(pellets[i]);
						if(creeps[c].hit(damage)){ //if the creep is dead
							var creepLoc = creeps[c].pos;
							generateCreepDeathPoof(creepLoc.x,creepLoc.y);
							creeps[c].live = false;
                            deathSound.play();
                            //console.log(creeps[c].pos.x);
                            //generateCreepDeathPoof(creeps[c].pos.x, creeps[c].pos.y);
                            
							console.log("killing creep at: "+creepLoc.x+","+creepLoc.y);
						}
						
					}
					//console.log("pellet hit!");
				}
				if(pellets[i].maxDistance() || !pellets[i].live){
					pellets.splice(i,1);
					i--;
				}
			}
			
		};
		that.render = function (elapsedTime){ //placeholder function for game logic on build state.
			//update HTML elements
			document.getElementById('current_catnip').innerHTML = catnip;
		
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
		};
		return that;
	}());
	
	gameStateBattle = function(){ //placeholder function for game logic on battle state.
	}
	
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
				
				console.log('captured key combo');
				console.log(capturedKeyCombo);
				
				var tempConvertedKeyCombo = [];
				
				for(var attr in capturedKeyCombo){
					tempConvertedKeyCombo.push(parseInt(attr));
				}
				console.log(tempConvertedKeyCombo);
				
				switch(setKeyType){
					case "Sell":
						Game.gameLoop.sellKey = tempConvertedKeyCombo;
						console.log("setting sell key to : ");
						console.log(Game.gameLoop.sellKey);
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
		/*We should use this to initialize variables we declare below*/
		console.log ("Initializing...");
		populateTowerGrid();
		gameState = gameStateBuild;
		startTime = performance.now();
		
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
		
		calcMutex = false;
        shortestPath = calcShortestPath();
        console.log(shortestPath);
		requestAnimationFrame(gameloop);
	}
	
	function setSellKey(){
		console.log("key set pressed");
		setKeyType = "Sell";
		gameState = gameStateSetKeyCode;
	}
	
	function setUpgradeKey(){
		setKeyType = "Upgrade";
		gameState = gameStateSetKeyCode;
	}
	
	function setWaveKey(){
		setKeyType = "Level";
		gameState = gameStateSetKeyCode;
		
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
        generateTowerSalePoof: generateTowerSalePoof,
        generateBombTrailDot: generateBombTrailDot,
        generateBombBoomPoof: generateBombBoomPoof,
        generateMissilePoof: generateMissilePoof,
	};
	
}(Game.graphics, Game.input, Game.screens, Game.server, Game.assets, Game.gameobjects, Game.screens));

var Ltime = performance.now();
