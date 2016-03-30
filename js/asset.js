Game.assets = (function(){
	var assets = {}
	
	function removeAsset(assetName){
		delete assets[assetName];
	}
	
	function loadAsset(assetName){// Loads asset. Returns true if asset is loaded, returns false if asset cannot be found.
		if(!(assetName in assets)){
			try{
				assets[assetName] = new Image();
				assets[assetName].src = "assets/"+assetName+".png";
				return true;
			}catch (e){
				console.log("image "+assetName+" could not be loaded "+e.message);
				return false;
			}
		}else{
			return true;
		}
	}
	
	function getAsset(assetName){
		if(loadAsset(assetName)){
			return assets[assetName];
		}else{
			return null;
		}
	}
	
	return {
		getAsset: getAsset,
		removeAsset: removeAsset,
	}
}());
