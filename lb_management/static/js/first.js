/**
 * Created by chengsd on 2017/9/5.
 */
//加载一些自定义的函数
//清空数组的空值
function list_clear(array){
    for(var i = 0 ;i<array.length;i++){
         array[i] = array[i].replace(/^\s+|\s+$/g, '');
    }
    for(var i = 0 ;i<array.length;i++)
          {
             if(array[i] == "" || typeof(array[i]) == "undefined")
             {
                      array.splice(i,1);
                      i= i-1;
             }
          }
          return array;
}

//获取总的页面数
function get_total_page(count_per_page,total_num){
    if((total_num/count_per_page).toString().split(".").length !=1){
	    return (total_num/count_per_page+1).toString().split(".")[0]
    }return total_num/count_per_page
}

//删除数组某元素
function removeByValue(arr, val) {
  for(var i=0; i<arr.length; i++) {
    if(arr[i] == val) {
      arr.splice(i, 1);
      break;
    }
  }
}




