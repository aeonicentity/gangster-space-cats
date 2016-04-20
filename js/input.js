Game.input = (function (){
	'use strict';
	
	function Mouse(){
		var that = {
			position : {x:null,y:null},
			clicks : [],
			handlers : [],
		}
		
		that.mouseLeftClickDown = function(e){
			console.log('clickDown');
			that.handlers.push({x: e.clientX, y:e.clientY, endX:null, endY:null, time:e.timeStamp});
		}
		
		that.mouseTrack = function(e){
			//console.log(that.position.x+","+that.position.y);
			that.position.x = e.clientX;
			that.position.y = e.clientY;
		}
		
		that.mouseLeftClickUp = function(e){
			console.log('clickup');
			//this is vestigial for now, but if we want to do click and drag, we might want to have some kind of ending X position saved from this.
			that.position.x = e.clientX;
			that.position.y = e.clientY;
			var temp = that.handlers.pop();
			temp.endX = e.clientX;
			temp.endY = e.clientY;
			that.handlers.push(temp);
			//console.log(that.handlers);
		}
		
		that.update = function (elapsedTime){ // given a specific time stamp, return all inputs registered since that time stamp in an array.
			var clicksToExecute = [];
			for (var i = 0; i < that.handlers.length; i++){
				var top = that.handlers[0];
				if (top.endX != null){
					//shift the click off the queue and onto the return queue.
					clicksToExecute.push(that.handlers.shift());
				}
			}
			return clicksToExecute;
				
		}
		
		
		document.getElementById("gameZone").addEventListener('mousedown', function(event){that.mouseLeftClickDown(event);});
		document.getElementById("gameZone").addEventListener('mouseup', function(event){that.mouseLeftClickUp(event);});
		document.getElementById("gameZone").addEventListener('mousemove', function(event){that.mouseTrack(event);});
		
		return that;
	}
	
	function Keyboard() {
		var that = {
				keys : {},
				handlers : []
			},
			handler;
		
		function keyPress(e) {
			that.keys[e.keyCode] = e.timeStamp;
			console.log("key "+e.keyCode+" pressed");
		}
		
		function keyRelease(e) {
			delete that.keys[e.keyCode];
		}
		
		// ------------------------------------------------------------------
		//
		// Allows the client code to register a keyboard handler
		//
		// ------------------------------------------------------------------
		that.registerCommand = function(key, handler) {
			that.handlers.push({ key : key, handler : handler});
			console.log("handler size:"+that.handlers.length);
		};
		
		that.clearCommands = function(){
			that.handlers = [];
		};
		
		// ------------------------------------------------------------------
		//
		// Allows the client to invoke all the handlers for the registered key/handlers.
		//
		// ------------------------------------------------------------------
		that.update = function(elapsedTime) {
			
			for (handler = 0; handler < that.handlers.length; handler++) {
				var keyComboFlag = true;
				for(var i =0; i < that.handlers[handler].key.length; i++){
					//console.log('checking key:'+that.handlers[handler].key[i]);
					if (!that.keys.hasOwnProperty(that.handlers[handler].key[i])) {
						keyComboFlag = false;
					}
				}
				if(keyComboFlag){
					that.handlers[handler].handler(elapsedTime);
				}
			}
			//console.log(that.keys);
		};
		
		//
		// These are used to keep track of which keys are currently pressed
		window.addEventListener('keydown', keyPress);
		window.addEventListener('keyup', keyRelease);
		
		
		that.setSellTower = function (keycombo){
			that.registerCommand(keycombo,function(){Game.gameLoop.sellSelectedTower()});
			
		};
		
		that.setUpgradeTower = function (keycombo){
			console.log("setting upgrade to:");
			console.log(keycombo);
			that.registerCommand(keycombo,function(){Game.gameLoop.upgradeSelectedTower()});
		};
		
		that.setNextWave = function(keycombo){
			that.registerCommand(keycombo,function(){Game.gameLoop.sendNextWave()});
		};
		
		return that;
	}
	
	return {
		Keyboard : Keyboard,
		Mouse: Mouse,
	};
}());

//------------------------------------------------------------------
//
// Source: http://stackoverflow.com/questions/1465374/javascript-event-keycode-constants
//
//------------------------------------------------------------------
if (typeof ReverseEvent === 'undefined'){
	var ReverseKeyLookup = {
		48: "0",
		49: "1",
		50: "2",
		51: "3",
		52: "4",
		53: "5",
		54: "6",
		55: "7",
		56: "8",
		57: "9",
		65: "A",
		66: "B",
		67: "C",
		68: "D",
		69: "E",
		70: "F",
		71: "G",
		72: "H",
		73: "I",
		74: "J",
		75: "K",
		76: "L",
		77: "M",
		78: "N",
		79: "O",
		80: "P",
		81: "Q",
		82: "R",
		83: "S",
		84: "T",
		85: "U",
		86: "V",
		87: "W",
		88: "X",
		89: "Y",
		90: "Z",
		16: "SHIFT",
		17: "CTRL",
		18: "ALT",
	}
}
if (typeof KeyEvent === 'undefined') {
	var KeyEvent = {
		DOM_VK_CANCEL: 3,
		DOM_VK_HELP: 6,
		DOM_VK_BACK_SPACE: 8,
		DOM_VK_TAB: 9,
		DOM_VK_CLEAR: 12,
		DOM_VK_RETURN: 13,
		DOM_VK_ENTER: 14,
		DOM_VK_SHIFT: 16,
		DOM_VK_CONTROL: 17,
		DOM_VK_ALT: 18,
		DOM_VK_PAUSE: 19,
		DOM_VK_CAPS_LOCK: 20,
		DOM_VK_ESCAPE: 27,
		DOM_VK_SPACE: 32,
		DOM_VK_PAGE_UP: 33,
		DOM_VK_PAGE_DOWN: 34,
		DOM_VK_END: 35,
		DOM_VK_HOME: 36,
		DOM_VK_LEFT: 37,
		DOM_VK_UP: 38,
		DOM_VK_RIGHT: 39,
		DOM_VK_DOWN: 40,
		DOM_VK_PRINTSCREEN: 44,
		DOM_VK_INSERT: 45,
		DOM_VK_DELETE: 46,
		DOM_VK_0: 48,
		DOM_VK_1: 49,
		DOM_VK_2: 50,
		DOM_VK_3: 51,
		DOM_VK_4: 52,
		DOM_VK_5: 53,
		DOM_VK_6: 54,
		DOM_VK_7: 55,
		DOM_VK_8: 56,
		DOM_VK_9: 57,
		DOM_VK_SEMICOLON: 59,
		DOM_VK_EQUALS: 61,
		DOM_VK_A: 65,
		DOM_VK_B: 66,
		DOM_VK_C: 67,
		DOM_VK_D: 68,
		DOM_VK_E: 69,
		DOM_VK_F: 70,
		DOM_VK_G: 71,
		DOM_VK_H: 72,
		DOM_VK_I: 73,
		DOM_VK_J: 74,
		DOM_VK_K: 75,
		DOM_VK_L: 76,
		DOM_VK_M: 77,
		DOM_VK_N: 78,
		DOM_VK_O: 79,
		DOM_VK_P: 80,
		DOM_VK_Q: 81,
		DOM_VK_R: 82,
		DOM_VK_S: 83,
		DOM_VK_T: 84,
		DOM_VK_U: 85,
		DOM_VK_V: 86,
		DOM_VK_W: 87,
		DOM_VK_X: 88,
		DOM_VK_Y: 89,
		DOM_VK_Z: 90,
		DOM_VK_CONTEXT_MENU: 93,
		DOM_VK_NUMPAD0: 96,
		DOM_VK_NUMPAD1: 97,
		DOM_VK_NUMPAD2: 98,
		DOM_VK_NUMPAD3: 99,
		DOM_VK_NUMPAD4: 100,
		DOM_VK_NUMPAD5: 101,
		DOM_VK_NUMPAD6: 102,
		DOM_VK_NUMPAD7: 103,
		DOM_VK_NUMPAD8: 104,
		DOM_VK_NUMPAD9: 105,
		DOM_VK_MULTIPLY: 106,
		DOM_VK_ADD: 107,
		DOM_VK_SEPARATOR: 108,
		DOM_VK_SUBTRACT: 109,
		DOM_VK_DECIMAL: 110,
		DOM_VK_DIVIDE: 111,
		DOM_VK_F1: 112,
		DOM_VK_F2: 113,
		DOM_VK_F3: 114,
		DOM_VK_F4: 115,
		DOM_VK_F5: 116,
		DOM_VK_F6: 117,
		DOM_VK_F7: 118,
		DOM_VK_F8: 119,
		DOM_VK_F9: 120,
		DOM_VK_F10: 121,
		DOM_VK_F11: 122,
		DOM_VK_F12: 123,
		DOM_VK_F13: 124,
		DOM_VK_F14: 125,
		DOM_VK_F15: 126,
		DOM_VK_F16: 127,
		DOM_VK_F17: 128,
		DOM_VK_F18: 129,
		DOM_VK_F19: 130,
		DOM_VK_F20: 131,
		DOM_VK_F21: 132,
		DOM_VK_F22: 133,
		DOM_VK_F23: 134,
		DOM_VK_F24: 135,
		DOM_VK_NUM_LOCK: 144,
		DOM_VK_SCROLL_LOCK: 145,
		DOM_VK_COMMA: 188,
		DOM_VK_PERIOD: 190,
		DOM_VK_SLASH: 191,
		DOM_VK_BACK_QUOTE: 192,
		DOM_VK_OPEN_BRACKET: 219,
		DOM_VK_BACK_SLASH: 220,
		DOM_VK_CLOSE_BRACKET: 221,
		DOM_VK_QUOTE: 222,
		DOM_VK_META: 224
	};
}
