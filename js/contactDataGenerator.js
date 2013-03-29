var app = app || {};

	/**
	  * Create a random dataset that can be use for rendering
	  * @return an array of users, like:
	  *         [{id:..,
	  *           name:..,
	  *           friends:[{id:..,name:..,weight:..},{..}]
	  *          },
	  *          {..}]
	  */
	app.createDataSet = function(dataSize,minNum,maxNum){
		var dataSet = [];
		//var friendRelation = [];
		dataSize = dataSize || 10;
		minNum = minNum || 5;
		maxNum = maxNum || 10;
			
		for(var i = 1; i <= dataSize;i++){
			var data = {};
			data.id = i;
			data.name = "User" + i;
				
			//each user have minNum to maxNum friends
			var friendsNum = RandomData(minNum,maxNum);
			var friendsArr = [];
			for(var j = 1; j < friendsNum;j++){
				var friend = {};
				var userId = RandomData(1,dataSize);
				if(userId == i) continue;
				friend.parentId = i;
				friend.id = userId;
				friend.name = "User" + userId;
				friend.weight = RandomData(1,10);
				friendsArr.push(friend);
				
				//friendRelation.push(friend);
			}
			data.friends = friendsArr;
				
			dataSet.push(data);
		}
		
		for(var m = 0; m < dataSet.length; m++){
			var dataVal = dataSet[m];
			var id = dataVal.id;
			var friends = dataVal.friends;
			for(var k = 0; k < friends.length; k++){
				var rootFriend = friends[k];
				
				for(var n = 0; n < dataSet.length; n++){
					var friendData = dataSet[n];
					if(friendData.id == rootFriend.id){
						var fDataArr = friendData.friends;
						var isHave = false;
						for(var l = 0; l < fDataArr.length; l++){
							var fData = fDataArr[l];
							if(fData.id == id){
								isHave = true;
								break;
							}
						}
						if(!isHave){
							var friend = {};
							friend.id = id;
							friend.name = "User" + id;
							friend.weight = rootFriend.weight;
							dataSet[n].friends.push(friend);
						}
						break;
					}
				}
			}
			
		}
			
		return dataSet;
	}
		
	//generate the data between fromNum and toNum
	function RandomData(fromNum,toNum){ 
		return parseInt(Math.random()*(toNum-fromNum) + fromNum); 
	}
		
	/**
	  * Transform the data get the dataSet by name ,default the first one
	  * @return  like:
	  *         {id:..,
	  *           name:..,
	  *           children:[{id:..,name:..,weight:..},{..}]
	  *          }
	  */
	app.transformData = function(dataSet,name){ 
		var object = {};
		if(typeof name == 'undefined'){
			var dataPart = dataSet[0];
			object.id = dataPart.id;
			object.name = dataPart.name;
			object.children = dataPart.friends;
		}else{
			$.each(dataSet,function(i,user){
				if(name == user.name){
					var dataPart = dataSet[i];
					object.id = dataPart.id;
					object.name = dataPart.name;
					object.children = dataPart.friends;
				}
			});
		}

		return object;
	}