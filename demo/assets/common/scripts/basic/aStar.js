
window["util"]["Astar"] = function() {
  var Astar = {
      "cacheMap":{}//缓存计算结果重复使用
  };

  var MAP = {rows:0,cols:0};

  Astar.setMap = function(row,col,arr){
      MAP.rows = row;
      MAP.cols = col;
      MAP.arr = arr;
  },

  Astar.searchRoad = function(start_x,start_y,end_x,end_y){
      var list = this._searchRoad(start_x,start_y,end_x,end_y);
      return list;
  },

  //其中的MAP.arr是二维数组
  Astar._searchRoad = function(start_x,start_y,end_x,end_y){
    var openList=[],    //开启列表
        closeList=[],   //关闭列表
        result=[],      //结果数组
        result_index;   //结果数组在开启列表中的序号

    openList.push({x:start_x,y:start_y,G:0});//把当前点加入到开启列表中，并且G是0

    do{
        var currentPoint = openList.pop();
        closeList.push(currentPoint);
        var surroundPoint=this.SurroundPoint(currentPoint);
        for (var i = 0; i < surroundPoint.length; i++) {//循环方式
            var item = surroundPoint[i];                //获得周围的八个点
            if (                                        //js 判断有前置优先原则
                MAP.arr[item.x]&&
                MAP.arr[item.x][item.y] &&         //判断是否是障碍物
                // MAP.arr[item.x][currentPoint.y]!==1 &&   //判断之间是否有障碍物，如果有障碍物是过不去的
                // MAP.arr[currentPoint.x][item.y]!==1 &&
                this.existList(item, closeList) === false)          //判断是否在关闭列表中
                {
                //g 到父节点的位置
                //如果是上下左右位置的则g等于10，斜对角的就是14
                var g = currentPoint.G + ((currentPoint.x - item.x) * (currentPoint.y - item.y) === 0 ? 10 : 10);
                if (this.existList(item, openList) === false) {       //如果不在开启列表中
                    //计算H，通过水平和垂直距离进行确定
                    item['H'] = Math.abs(end_x - item.x) * 10 + Math.abs(end_y - item.y) * 10;
                    item['G'] = g;
                    item['F'] = item.H + item.G;
                    item['parent'] = currentPoint;
                    openList.push(item);
                }else {                                  //存在在开启列表中，比较目前的g值和之前的g的大小
                    var index = this.existList(item, openList);
                    //如果当前点的g更小
                    if (index !== false && g < openList[index].G) {
                        openList[index].parent = currentPoint;
                        openList[index].G = g;
                        openList[index].F=g+openList[index].H;
                    }

                }
            }
        }
        //如果开启列表空了，没有通路，结果为空
        if(openList.length===0) {
            break;
        }
        openList.sort(this.sortF);//这一步是为了循环回去的时候，找出 F 值最小的, 将它从 "开启列表" 中移掉
    }while((result_index=this.existList({x:end_x,y:end_y},openList)) === false);

    //判断结果列表是否为空
    if(!result_index && result_index !== 0) {
        result=[];
    }
    else {
        var currentObj=openList[result_index];
        do{
            //把路劲节点添加到result当中
            result.unshift({
                x:currentObj.x,
                y:currentObj.y
            });
            currentObj=currentObj.parent;
        }while (currentObj.x!==start_x || currentObj.y!==start_y);

    }
    return result;

  }
//用F值对数组排序
  Astar.sortF = function (a,b){
      if (b.F- a.F > 0) {
          return 1;
      }else if (b.F === a.F) {
          return 0;
      }else {
          return -1;
      }
  }
//获取周围八个点的值
  Astar.SurroundPoint =function (curPoint){
      var x=curPoint.x,y=curPoint.y;
      return [
          {x:x+1,y:y},
          {x:x-1,y:y},
          {x:x,y:y-1},
          {x:x,y:y+1}
      ]
  }
  //判断点是否存在在列表中，是的话返回的是序列号
  Astar.existList = function (point,list) {
      for (var i = 0 , len = list.length; i < len; i++) {//获取长度 一次就好。NOTE  forin 循环数据效率低下
          if(point.x===list[i].x && point.y===list[i].y) {
              return i;
          }
      }
      return false;
  }

  Astar.getMapArr = function(){
    return MAP.arr;
  }

return Astar;
};
