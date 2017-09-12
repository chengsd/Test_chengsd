/**
 * Created by chengsd on 2017/8/29.
 */

//注销按钮点击事件
$("#logout").click(function () {
    var confirm_sys = confirm("确认退出吗");
    if(confirm_sys){
        $.post("/logout/");
        window.location.href="http://"+host+"/login"//跳转到login
    }


})

//捕捉键盘按键事件，input被编辑时按下enter即可出发查询
$("#query_value").on("keydown", function (e) {
        if (e.keyCode == 13) {
            $("#query").click();
        }
    });

//总共页数和机器数赋值
$("#total_list_page").text(get_total_page(data_per_page,data_num));
$("#total_machine_num").text(data_num);

    //查询按钮点击事件
$("#query").click(function () {
    var query_value = $("#query_value").val().trim();
    //$.get("/query/1/",{'query_value':query_value},function (result) {
    //window.location.href="http://"+host+"/query/1/?query_value="+query_value
    window.location.href="http://"+host+"/query/1/"+query_value;
    //window.open("http://"+host+"/query/1/"+query_value);
    //})
})

//已部署应用按钮点击事件
$(".application_details").click(function () {
    var id = $(this).parent().parent().parent().find('td').eq(1).text().trim();//获取id值
    var ip = $(this).parent().parent().parent().find('td').eq(2).text().trim();//获取ip值
    $(".application-id").text(id); //模态框中隐藏的span赋值
    var value_app = $(this).text().trim();
    $("#title_name_details").text("【"+value_app+"】"+"@"+ip); //标题为被点击的内容
    $("#application-name").text(value_app);
    $("#application-name-details").val("")//开启前清空详情
    //发送ajax请求给后端请求当前应用详情
    url = "/service_details/";
    $.get(url,{"id":id,"service":value_app},function(result) {
        $("#application-name-details").val(result);
        service_details_old = result //申明全局应用详情变量,为了方便修改数据时做判断
    });
    $(".btn-modal-details").click(); //打开模态框


})

//修改已部署应用确定按钮点击事件
$("#confirm-details").click(function () {
    var id = $(".application-id").text().trim();//获取id值
    var service = $("#application-name").text().trim();
    var service_details = $("#application-name-details").val().trim();
    if((service_details == "")&&(service_details_old =="")) {
        $("#alarm_title_details").text("警告");
        $("#alarm_content_details").text("数据为空,不执行添加");
        $("#alarm_type_id_details").addClass("alert-warning");
        $("#alarm_type_id_details").fadeIn();
        setTimeout(function () {
            $("#alarm_title_details").text("");
            $("#alarm_content_details").text("");
            $("#alarm_type_id_details").fadeOut("fast");
            $("#alarm_type_id_details").removeClass("alert-warning");
        }, 2000);

    }else if(service_details != service_details_old) {
        var url = "/service_details_modify/";
        $.post(url, {"id": id, 'service': service, "service_details": service_details}, function (result) {
            if (result == "ok") {
                $("#application-name-details").val(service_details);
                $("#alarm_title_details").text("成功");
                $("#alarm_content_details").text("数据修改成功");
                service_details_old = service_details;//修改成功全局变量赋最新值
                $("#alarm_type_id_details").addClass("alert-success");
                $("#alarm_type_id_details").fadeIn();
                setTimeout(function () {
                    $("#alarm_title_details").text("");
                    $("#alarm_content_details").text("");
                    $("#alarm_type_id_details").fadeOut("fast");
                    $("#alarm_type_id_details").removeClass("alert-success");
        }, 2000);
            } else {
                $("#alarm_title_details").text("错误");
                $("#alarm_content_details").text("数据修改失败");
                $("#alarm_type_id_details").addClass("alert-danger");
                $("#alarm_type_id_details").fadeIn();
                setTimeout(function () {
                    $("#alarm_title_details").text("");
                    $("#alarm_content_details").text("");
                    $("#alarm_type_id_details").fadeOut("fast");
                    $("#alarm_type_id_details").removeClass("alert-danger");
                }, 2000);
            }
        });
    }else{
        $("#alarm_title_details").text("警告");
        $("#alarm_content_details").text("数据没有改变");
        $("#alarm_type_id_details").addClass("alert-warning");
        $("#alarm_type_id_details").fadeIn();
        setTimeout(function () {
            $("#alarm_title_details").text("");
            $("#alarm_content_details").text("");
            $("#alarm_type_id_details").fadeOut("fast");
            $("#alarm_type_id_details").removeClass("alert-warning");
        }, 2000);
    }
})

//添加机器按钮点击事件
$("#add_machine").click(function () {
    //开启前清空模态框内容
    $("#id").val("");
    $("#ip_address").val("");
    $("#mac_address").val("");
    $("#cpu_info").val("");
    $("#memory_info").val("");
    $("#disk_info").val("");
    $("#system").val("");
    $("#application").val("");
    $("#modify_application").empty();//清空添加应用按钮
    $("#title_name").text("添加机器")
    //清空check_box的内容
    $("input[name='check_box_machine_type']").removeAttr("checked");
    $("#machine_type_other_value").val("");
    $(".btn-modal").click();//开启模态框
})

//全选和反选
$("#choose_all").click(function () {
    $("input[name='check_box']").prop("checked","checked");
    var check_num = $("input[type='checkbox']:checked").length;
    if (check_num == 1) {
        $(".button_modify ,.button_delete,.button_get_info").removeAttr("disabled");
    }else if(check_num == 0){
        $(".button_modify ,.button_delete,.button_get_info").attr("disabled", "disabled");
    }else{$(".button_modify").attr("disabled", "disabled");$(".button_delete,.button_get_info").removeAttr("disabled");}
})

$("#unchoose").click(function () {
    $("input[name='check_box']").removeAttr("checked");
    var check_num = $("input[type='checkbox']:checked").length;
    if (check_num == 1) {
        $(".button_modify ,.button_delete,.button_get_info").removeAttr("disabled");
    }else if(check_num == 0){
        $(".button_modify ,.button_delete,.button_get_info").attr("disabled", "disabled");
    }else{$(".button_modify").attr("disabled", "disabled");$(".button_delete,.button_get_info").removeAttr("disabled");}
})

//修改按钮设置，0个或多个check_box时的按钮是否可按
//两个以上只能删除，一个可编辑可删除，0个都不可按
$(".button_modify").attr("disabled", "disabled");//第一次加载时不可点击
$(".button_delete").attr("disabled", "disabled");//第一次加载时不可点击
$(".button_get_info").attr("disabled", "disabled");//第一次加载时不可点击
//添加check_box点击事件
$("input[name='check_box']").click(function () {
    var check_num = $("input[name='check_box']:checked").length;
    if (check_num == 1) {
        $(".button_modify ,.button_delete,.button_get_info").removeAttr("disabled");
    }else if(check_num == 0){
        $(".button_modify ,.button_delete,.button_get_info").attr("disabled", "disabled");
    }else{$(".button_modify").attr("disabled", "disabled");$(".button_delete,.button_get_info").removeAttr("disabled");}
});

//删除按钮点击事件
$(".button_delete").click(function () {
    url = "/delete_machine/"
    var check_num = $("input[name='check_box']:checked").length;
    if(check_num ==1) {
        confirm_info=confirm("确定删除吗")
        if(confirm_info) {
            $.post(url, {'id': $("input[name='check_box']:checked").val()}, function (result) {
                if(result == "success"){
                    $("#alarm-content-home").text("数据删除成功");
                    $("#alert-modify-success").fadeIn();
                    $("#alert-modify-success").fadeOut("slow");
                    setTimeout(function () {
                        window.location.reload()
                    },1000)
                }else{alert("出现错误： "+result)}
            })
        }
    }else{
        id = $("input:checkbox[name='check_box']:checked").map(function(index,elem) {
            return $(elem).val();
        }).get().join(',');

        confirm_info=confirm("确定删除吗")
        if(confirm_info) {
            $.post(url, {'id': id}, function (result) {
                if(result == "success"){
                    $("#alarm-content-home").text("数据删除成功");
                    $("#alert-modify-success").fadeIn();
                    $("#alert-modify-success").fadeOut("slow");
                    setTimeout(function () {
                        window.location.reload()
                    },1000)
                }else{alert("出现错误： "+result)}
            })
        }
    }
})

//点击修改按钮时启动模态框
$(".button_modify").click(function () {
    check_box_val=[]//修改不需要多选，清空数组
    if ($("input[name='check_box']:checked").length == 1){
        //给模态框赋当前值
        var obj = $('input:checkbox[name=check_box]:checked');
        var ip_address = obj.parent().parent().find('td').eq(2).text().trim();//获取当前行的IP
        $("#title_name").text("正在修改 【"+ip_address+"】 的信息");//给title的name赋值ip
        //模态框各个input赋值
        var id = obj.val();
        var mac_address = obj.parent().parent().find('td').eq(3).text().trim();
        var cpu_info = obj.parent().parent().find('td').eq(4).text().trim();
        var memory_info = obj.parent().parent().find('td').eq(5).text().trim();
        var disk_info = obj.parent().parent().find('td').eq(6).text().trim();
        var system = obj.parent().parent().find('td').eq(7).text().trim();
        //此列为应用按钮，这样处理为了变成字符串且已逗号隔开
        var application_tmp = obj.parent().parent().find('td').eq(8).children().children().text().trim().split(" ");
        if(application_tmp.length > 1){
            tmp = [];
            for (var i=0;i<application_tmp.length;i++){
                 if (application_tmp[i] != ""){
                     tmp.push(application_tmp[i].trim());
                 }
            }
            for (var i=0;i<tmp.length;i++){
                 removeByValue(tmp,"")
            }
             application = tmp.join(",");
        }
        else {application = obj.parent().parent().find('td').eq(8).children().children().text().trim()}
        var machine_type = obj.parent().parent().find('td').eq(9).text().trim();
        //判断当前选择的machine_type值
        var machine_type_value = machine_type.split(",");
        $("input[name='check_box_machine_type']").removeAttr("checked");
        $("#machine_type_other_value").val("");
        for (var i=0;i<machine_type_value.length;i++){
            if(machine_type_value[i].trim() != ""){
                if ($("#machine_type_online").val() ==  machine_type_value[i]){
                    $("#machine_type_online").prop("checked","true");
                    continue;
                }//else{$("#machine_type_online").removeAttr("checked");}
                if ($("#machine_type_test").val() ==  machine_type_value[i]){
                    $("#machine_type_test").prop("checked","true");
                    continue;
                }//else{$("#machine_type_test").removeAttr("checked");}
                if ($("#machine_type_dev").val() ==  machine_type_value[i]){
                    $("#machine_type_dev").prop("checked","true");
                    continue;
                }else{
                    //$("#machine_type_dev").removeAttr("checked");
                    $("#machine_type_other").prop("checked","true");
                    $("#machine_type_other_value").val(machine_type_value[i]);
                }
            }else{$("input[name='check_box_machine_type']").removeAttr("checked");}
        }
        var mark_info = obj.parent().parent().find('td').eq(10).text().trim();
        $("#id").val(id);
        $("#ip_address").val(ip_address);
        $("#mac_address").val(mac_address);
        $("#cpu_info").val(cpu_info);
        $("#memory_info").val(memory_info);
        $("#disk_info").val(disk_info);
        $("#system").val(system);
        //已安装应用一栏采用点击删除的方式，不提供直接操作input的操作权限,默认隐藏
        $("#application").val(application);
        //设置已安装应用的按钮
        var list = application.split(",");
        //先清空div中的内容
        $("#modify_application").empty();
        if (list != ""){ //排除没有应用的情况，防止生成垃圾按钮
            for (index in list) {
                //添加按钮到div
                var app_button = $("<button type='button' class='btn btn-primary delete-application' style='margin:2px 2px'></button>").text(list[index].trim());
                $("#modify_application").append(app_button);
            }
            delete_application(list);//调用点击删除应用函数
        }
        $("#machine_type").val(machine_type);
        $("#mark_info").val(mark_info);

        $(".btn-modal").click();//开启模态框
        //设置全局变量,将旧值保存为全局变量
        ip_address_old = $("#ip_address").val().trim();
        mac_address_old = $("#mac_address").val().trim();
        cpu_info_old = $("#cpu_info").val().trim();
        memory_info_old = $("#memory_info").val().trim();
        disk_info_old = $("#disk_info").val().trim();
        system_old = $("#system").val().trim();
        application_old = $("#application").val().trim();
        machine_type_old = $("#machine_type").val().trim();
        machine_type_other_old = $("#machine_type_other_value").val().trim();
        mark_old = $("#mark_info").val().trim();
    }else{alert("请在页面上进行操作")}//防止直接通过console点击
})

//编辑框中点击应用按钮清空应用输入框的相应的内容
function delete_application(list) {
    $(".delete-application").click(function () {
        var value = $(this).text();//获取点击对象相应的值
        //console.log(value);
        list[list.indexOf(value)]=""//删除相应的元素
        $("#application").val(list_clear(list).join(","));//数组转字符串放入隐藏的应用input框中(一定要先去掉上一步生成的空值)
        $(this).remove();//隐藏相应的button
    })
}

//检测input输入框数据正确性函数
//定义告警函数
function alert_alarm(type,title,content) {
    if (type == "danger"){
        if(!$("#alarm_type_id").hasClass("alert-danger")){
        $("#alarm_type_id").addClass("alert-danger");
        $("#alarm_type_id").removeClass("alert-warning");
        $("#alarm_type_id").removeClass("alert-success");
        }
    }else if (type == "warning"){
        if(!$("#alarm_type_id").hasClass("alert-warning")){
        $("#alarm_type_id").addClass("alert-warning");
            $("#alarm_type_id").removeClass("alert-danger");
            $("#alarm_type_id").removeClass("alert-success");
        }
    }else if (type == "success"){
        if(!$("#alarm_type_id").hasClass("alert-success")){
        $("#alarm_type_id").addClass("alert-success");
        $("#alarm_type_id").removeClass("alert-danger");
        $("#alarm_type_id").removeClass("alert-warning");
        }
    }

    $("#alarm_title").text(title);
    $("#alarm_content").text(content);
    $("#alarm_type_id").fadeIn();
    setTimeout(function(){$("#alarm_type_id").fadeOut()},2000);
}
//检查IP和MAC合法性
function  check_valid() {
    var ip_address = $("#ip_address").val();
    //判断ip是否合法
    var reg =  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!reg.test(ip_address)){
        alert_alarm("danger","错误","IP地址格式错误");
        return 1;
    }//else{
        //判断MAC地址是否合法
    //     var mac_address = $("#mac_address").val();
    //     var reg  = /^[A-Fa-f0-9]{2}(:)?[A-Fa-f0-9]{2}(:)?[A-Fa-f0-9]{2}(:)?[A-Fa-f0-9]{2}(:)?[A-Fa-f0-9]{2}(:)?[A-Fa-f0-9]{2}$/;
    //     if(!reg.test(mac_address)){
    //         alert_alarm("danger","错误","MAC地址格式错误");
    //         return 1;
    //     }else{
    //         //判断是否是标准mac格式，不是自动加上:
    //         if (mac_address.split(":").length != 6){
    //             var new_mac = mac_address.split(":").join("");//去除全部:
    //             $("#mac_address").val(new_mac[0] + new_mac[1] + ":" + new_mac[2] + new_mac[3] + ":" + new_mac[4] +
    //                 new_mac[5] + ":" + new_mac[6] + new_mac[7] + ":" +
    //             new_mac[8] + new_mac[9] + ":" + new_mac[10] + new_mac[11]);
    //         }
    //         return 0;
    //     }
    // }
    return 0;
}
//自动获取信息按钮点击事件
$("#auto_get_info").click(function () {
    var ip_address = $("#ip_address").val();
    //检测ip地址正确性
    var reg =  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (!reg.test(ip_address)){
        alert_alarm("danger","错误","IP地址格式错误");
    }else{
        confirm_val = confirm("请确认"+ip_address+"已经添加lubanmanager用户并设置正确的密码");
        if(confirm_val){
            //弹出提示框提示正则获取数据
            $("#alarm_type_id").removeClass("alert-success");
            $("#alarm_type_id").removeClass("alert-danger");
            if(!$("#alarm_type_id").hasClass("alert-warning")){
                $("#alarm_type_id").addClass("alert-warning");
            }
            $("#alarm_title").text("")
            $("#alarm_content").text("测试功能，获取时间大概30秒左右，请不要关闭窗口，请稍等,正在获取中");
            $("#alarm_type_id").fadeIn();
            $("#confirm").attr("disabled", "disabled");
            $.post("/auto_get_info/",{"ip_address":ip_address},function (result) {
                if(result != "_fail"){
                    var list_value = result.split(";");
                    $("#mac_address").val(list_value[0]);
                    $("#cpu_info").val(list_value[1]);
                    //if(list_value[2] <1024){
                    //    $("#memory_info").val(list_value[2]+"M");
                    $("#memory_info").val(list_value[2]);
                    //}else($("#memory_info").val(Math.floor(list_value[2]/1024*100)/100)+"G");

                    $("#disk_info").val(list_value[3]);
                    $("#system").val(list_value[4]);
                    $("#alarm_type_id").fadeOut();
                    alert_alarm("success","成功","自动获取配置数据成功");
                    $("#confirm").removeAttr("disabled");
                }else{alert_alarm("danger","失败","自动获取配置数据失败");$("#confirm").removeAttr("disabled");}
            })

        }
    }
})

//更新所选机器配置的按钮点击时间
$(".button_get_info").click(function () {
    var ip = $("input:checkbox[name='check_box']:checked").map(function() {
            return $(this).parent().parent().find("td").eq(2).text();
        }).get().join(",").trim().replace(/(\s+)|(\s+$)/g,"");
    var count = $("input:checkbox[name='check_box']:checked").map(function() {
            return $(this).parent().parent().find("td").eq(2).text();
        }).get().join(",").trim().replace(/(\s+)|(\s+$)/g,"").split(",").length;
    $(".button_get_info,.button_delete,.button_modify,#add_machine,#query").attr("disabled","disabled");
    $("#alarm-info-content").text("正在自动获取中，请不要做其他操作......");
    $("#alert-info").fadeIn();
    $.post("/get_info_many/",{"ip":ip},function (result) {
        if(result == "success"){
            $("#alert-info").fadeOut("fast");
            $("#alarm-content-home").text("自动获取成功");
            setTimeout(function () {
                $("#alert-modify-success").fadeIn();
                $("#alert-modify-success").fadeOut("slow");
                setTimeout(function () {window.location.reload()},1000)
            },1000)
        }else{
            var fail_count = result.split("   ").length;
            alert("自动更新成功"+(count - fail_count)+"台"+", 失败"+ fail_count +"台"+", 失败的机器IP： "+result+"请检查机器是否有lubanmanager的用户并修改成正确的密码")
            $(".button_get_info,.button_delete,.button_modify,#add_machine,#query").removeAttr("disabled");
            $("#alert-info").fadeOut("fast");
            window.location.reload();
        }

    })
})

//修改模态框中点击添加应用按钮点击事件
$("#add_application").click(function () {
    //获取用户输入内容
    try{
        var new_app_data = prompt('添加新应用,多个以逗号隔开').trim().replace(/，/g,",")//若存在中文逗号则转成英文的逗号
    }
    catch (e){
        var new_app_data = "";
    }

    list = new_app_data.split(",");//用户输入数据转成数组并去除空值
    list = list_clear(list);
    //添加按钮到div
    if (new_app_data != ""){
        for (index in list){
            //添加按钮到div
            var add_data = list[index];
            if (add_data != "") {
                var app_button = $("<button type='button' class='btn btn-primary delete-application' style='margin:2px 2px'></button>").text(add_data);
                $("#modify_application").append(app_button);//添加新应用按钮
            }
        }
        var application = $("#application").val();//获取当前应用的input框中的值
        if(application != ""){
            list = application + ','+ list//数组拼接字符串
        }else{list = list.join(",")}

        $("#application").val(list);//数组转字符串放入隐藏的应用input框中
        delete_application(list.split(","));//调用点击删除相应数值函数
    }
})

//确认修改(添加)按钮点击事件
$("#confirm").click(function () {
    //先将checkbox的值放到隐藏的machine_type的input中
    var machine_type_value_list = []
    if ($("#machine_type_online").prop("checked") == true){
        machine_type_value_list.push($("#machine_type_online").val())
    }
    if ($("#machine_type_test").prop("checked") == true){
        machine_type_value_list.push($("#machine_type_test").val())
    }
    if ($("#machine_type_dev").prop("checked") == true){
        machine_type_value_list.push($("#machine_type_dev").val())
    }
    if ($("#machine_type_other").prop("checked") == true){
        machine_type_value_list.push($("#machine_type_other_value").val())
    }
    $("#machine_type").val(machine_type_value_list.join(","));
    status = check_valid();
    if (status == 0 && status != ""){   //status!=""解决IE编辑不检测IP和MAC的问题
        var id = $("#id").val();
        var ip_address = $("#ip_address").val().trim();
        var mac_address = $("#mac_address").val().trim();
        var cpu_info = $("#cpu_info").val().trim();
        var memory_info = $("#memory_info").val().trim();
        var disk_info = $("#disk_info").val().trim();
        var system = $("#system").val().trim();
        var application = $("#application").val().trim();
        var machine_type = $("#machine_type").val().trim();
        var mark = $("#mark_info").val().trim();
        var machine_type_other_value = $("#machine_type_other_value").val().trim();
        //id不为空则为修改操作，反之为添加操作
        if(id != "" && (ip_address != ip_address_old || mac_address != mac_address_old || cpu_info != cpu_info_old ||
            memory_info != memory_info_old || disk_info != disk_info_old || system != system_old || application != application_old
        || machine_type != machine_type_old || mark != mark_old || machine_type_other_value !=  machine_type_other_old)){ //有一项不同就修改
            var url = "/modify_machine/";
            //传递一个application_old旧值区分是否修改service表删除多余的service
            var data = {"id":id,"ip_address":ip_address,"mac_address":mac_address,"cpu_info":cpu_info,"memory_info":memory_info,
                "disk_info":disk_info,"system":system,"application":application,"application_old":application_old,"machine_type":machine_type,"mark":mark};
            $.post(url,data,function (result) {
                if(result == "success"){
                    $(".close").click();
                    $("#alarm-content-home").text("数据修改成功");
                    $("#alert-modify-success").fadeIn();
                    $("#alert-modify-success").fadeOut("slow");
                    setTimeout(function () {
                        window.location.reload()
                    },1000)
                }
            })
        }
        else
            if (id != ""){  //都相同则提示数据不变
                $("#alarm_type_id").removeClass("alert-danger");
                $("#alarm_type_id").addClass("alert-warning");
                alert_alarm("warning","警告","数据没有修改");
                setTimeout(function () {
                    $("#alarm_type_id").fadeOut("fast");
                },2000)
            }else{//id为空则为添加机器操作
            status = check_valid()
            if (status == 0 && status != ""){
                var url = "/add_machine/";
                var data = {"id":id,"ip_address":ip_address,"mac_address":mac_address,"cpu_info":cpu_info,"memory_info":memory_info,
                "disk_info":disk_info,"system":system,"application":application,"machine_type":machine_type,"mark":mark};
                $.post(url,data,function (result) {
                    if(result == "success"){
                        $(".close").click();
                        $("#alarm-content-home").text("数据添加成功");
                        $("#alert-modify-success").fadeIn();
                        $("#alert-modify-success").fadeOut("slow");
                        setTimeout(function () {
                            window.location.href="http://"+host+"/1"
                        },1000)
                    }else{
                        if(result == "exist"){
                            alert_alarm("warning","友情提醒","已经存在的IP地址,无法添加");
                        }else{alert_alarm("danger","失败","数据添加失败");}
                    }
                })
            }else{alert_alarm("warning","友情提醒","IP地址和MAC格式错误")}
        }
    }
})

