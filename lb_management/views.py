# -*- coding: utf-8 -*-
from __future__ import division  #python2.x除法保留小数点
from __future__ import unicode_literals
from django.shortcuts import render
from django.db import connection
from django.shortcuts import HttpResponse,HttpResponseRedirect
import  re,logging,os,commands
#from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as user_login, logout as user_logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


#登陆模板
def login(request):
    return render(request,'login.html')

@csrf_exempt
def logout(request):
    user_logout(request)
    return HttpResponse("exit success")

def auth(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)
    if user is not None:
        print user.is_active
        user_login(request,user)   #保存session
        return HttpResponseRedirect("/1")
    return HttpResponseRedirect("/login")


#查询应用详情方法
@login_required(login_url="/login/")
def home(request,page_num):  #主处理函数，用于页面数据显示
    data_per_page = 10  #定义每页十条数据
    cursor = connection.cursor()
    #获取总的数目
    cursor.execute('select count(*) from machine')
    data_num = int(cursor.fetchone()[0])
#    page_num = data_num/10 if data_num % 10 ==0 else data_num/10 + 1
    sql = 'select * from machine order by id desc limit %s,%s' % (data_per_page * (int(page_num) - 1),data_per_page)
    #print sql
    #BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cursor.execute(sql)
    data = cursor.fetchall()
    # 格式化数据为字典格式供前端模板调用
    data = list(data)
    len_data = len(data)
    for i in range(len_data):
        data[i] = list(data[i])
        # data[i].pop(0)  # 去掉id列,为方便操作数据，已从前端赋值给check_box
        # datetime类型无法encode，直接转str
        for j in range(len(data[i])):
            try:
                #如果是已部署应用，则返回列表给前端方便渲染成按钮
                if j == 7:
                    #print(data[i][j])
                    data[i][j] = data[i][j].split(",")
                    #print(data[i][j])
                else:
                    data[i][j] = data[i][j].strip().encode('utf8')
            except Exception as e:
                data[i][j] = str(data[i][j])
                #print e
    context = {'data': data,'data_num':data_num,'page_num':page_num,'query':0}  # 生成上下文,query=0说明是系统显示的数据
    return render(request, 'index.html', context)

@login_required(login_url="/login/")
def query(request,page_num,query_value):
    #query_value = request.GET["query_value"]
    #检验是否是IP或者mac
    re_ip = r"^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$"
    re_mac = r"^[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}:[A-Fa-f0-9]{2}$"
    if re.match(re_ip,query_value):
        sql_where = "where ip like '%%%s%%'" % query_value
    elif re.match(re_mac,query_value):
        sql_where = "where mac like '%%%s%%'" % query_value
    else:
        sql_where = "where cpu like '%%%s%%' or memory like '%%%s%%' or disk like '%%%s%%' or system like '%%%s%%' or application like '%%%s%%' or mark like '%%%s%%'" %(query_value,query_value,query_value,query_value,query_value,query_value)
    data_per_page = 10  # 定义每页十条数据
    cursor = connection.cursor()
    # 获取总的数目
    cursor.execute('select count(*) from machine %s' % sql_where)
    data_num = int(cursor.fetchone()[0])
    #    page_num = data_num/10 if data_num % 10 ==0 else data_num/10 + 1
    sql = 'select * from machine %s  order by id desc limit %s,%s' % (sql_where,data_per_page * (int(page_num) - 1), data_per_page)
    #print  sql
    cursor.execute(sql)
    data = cursor.fetchall()
    # 格式化数据为字典格式供前端模板调用
    data = list(data)
    len_data = len(data)
    for i in range(len_data):
        data[i] = list(data[i])
        # data[i].pop(0)  # 去掉id列,为方便操作数据，已从前端赋值给check_box
        # datetime类型无法encode，直接转str
        for j in range(len(data[i])):
            try:
                # 如果是已部署应用，则返回列表给前端方便渲染成按钮
                if j == 7:
                    #print(data[i][j])
                    data[i][j] = data[i][j].split(",")
                    #print(data[i][j])
                else:
                    data[i][j] = data[i][j].strip().encode('utf8')
            except Exception as e:
                data[i][j] = str(data[i][j])
                # print e
    context = {'data': data, 'data_num': data_num, 'page_num': page_num,'query':1,"query_data":query_value}  # 生成上下文,query=1说明是用户查询的数据,query_data放在查询的input框中
    return render(request, 'index.html', context)





#查看应用详情方法
@login_required(login_url="/login/")
def service_details(request):
    id = request.GET['id']
    service = request.GET['service']
    sql = 'select service_details from service where id=\"%s\" and service_name=\"%s\"' % (id,service)
    cursor = connection.cursor()
    cursor.execute(sql)
    data = cursor.fetchall()
    try:
        return HttpResponse(data[0][0])
    except:
        return HttpResponse("")


#修改应用服务详情
@login_required(login_url="/login/")
@csrf_exempt
def service_details_modify(request):
    id = request.POST['id']
    service = request.POST['service']
    service_details = request.POST['service_details']
    #先查询是否存在该记录，没有则创建
    sql = 'select service_details from service where id=\"%s\" and service_name=\"%s\"' % (id, service)
    cursor = connection.cursor()
    length = cursor.execute(sql)
    if length != 0L:
        sql = ' update service set service_details=\"%s\" where id=\"%s\" and service_name=\"%s\"' % (service_details,id, service)
    else:
        sql = 'insert into service set id=\"%s\",service_name=\"%s\",service_details=\"%s\"'%(id,service,service_details)
    try:
        #print sql
        cursor.execute(sql)
        return HttpResponse("ok")
    except Exception as e:
        print e
        return HttpResponse("_fail")

@login_required(login_url="/login/")
@csrf_exempt
def modify_machine(request):
    id = request.POST['id']
    ip_address = request.POST['ip_address']
    mac_address  = request.POST['mac_address']
    cpu_info = request.POST['cpu_info']
    memory_info = request.POST['memory_info']
    disk_info = request.POST['disk_info']
    system = request.POST['system']
    application = request.POST['application']
    application_old = request.POST['application_old']
    machine_type = request.POST['machine_type']
    mark = request.POST['mark']
    cursor = connection.cursor()
    sql = 'update machine set ip=\"%s\",mac=\"%s\",cpu=\"%s\",memory=\"%s\",disk=\"%s\",' \
          'system=\"%s\",application=\"%s\",machine_type=\"%s\",mark=\"%s\" where id=\"%s\"'\
          %(ip_address,mac_address,cpu_info,memory_info,disk_info,system,application,machine_type,mark,id)
    #application修改前先删除service中多余的service
    try:
        if application == "":
            cursor.execute("delete from service where id=\"%s\""%id)
        else:
            if application != application_old:
                # 需要移除的存入列表
                remove_list = []
                for i in application_old.split(','):
                    if i not in application.split(","):
                        remove_list.append(i)
            #开始移除多余的service
            if remove_list != []:
                for i in remove_list:
                    sql_remove_service = 'delete from service where id=\"%s\" and service_name=\"%s\"'%(id,i)
                    print sql_remove_service
                    cursor.execute(sql_remove_service)
    except Exception as e:
        print e
    #开始修改服务application
    try:
        #print sql
        cursor.execute(sql)
        return HttpResponse("success")
    except Exception as e:
        print e
        return HttpResponse("_fail")
    finally:cursor.close()

@login_required(login_url="/login/")
@csrf_exempt
def add_machine(request):
    ip_address = request.POST['ip_address']
    mac_address = request.POST['mac_address']
    cpu_info = request.POST['cpu_info']
    memory_info = request.POST['memory_info']
    disk_info = request.POST['disk_info']
    system = request.POST['system']
    application = request.POST['application']
    machine_type = request.POST['machine_type']
    mark = request.POST['mark']
    sql = ('insert into machine (ip,mac,cpu,memory,disk,system,application,machine_type,mark) values(\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s") ' % (ip_address, mac_address,cpu_info, memory_info, disk_info, system, application, machine_type,mark))
    cursor = connection.cursor()
    try:
        # 查询是否已经存在此ip
        length = cursor.execute('select ip from machine where ip=\"%s\"' % ip_address)
        if length == 0L:
        #print sql
            cursor.execute(sql)
            return HttpResponse("success")
        else:
            return HttpResponse("exist")
    except Exception as e:
        print e
        return HttpResponse("_fail")
    finally:
        cursor.close()

@login_required(login_url="/login/")
@csrf_exempt
def delete_machine(request):
    id = request.POST['id']
    id_list = str(id).split(",")
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for i in id_list:
        try:

            cursor = connection.cursor()
            #从系统salt-ssh配置文件中删除该ip的信息
            cursor.execute('select ip from machine where id=\"%s\"'%i)
            ip_address = str(cursor.fetchone()[0])
            os.system("/bin/sh %s/delete_from_salt.sh %s"% (BASE_DIR,ip_address))
            #数据库中执行删除
            cursor.execute('delete from machine where id=\"%s\"'%i)
        except:
            return HttpResponse("部分删除失败")
    return HttpResponse('success')

@login_required(login_url="/login/")
@csrf_exempt
def auto_get_info(request):
    ip_address = request.POST['ip_address']
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    localhost = request.get_host()
    if ip_address in localhost:
        cpu_name = commands.getoutput(
            """cat /proc/cpuinfo | grep name | cut -f2 -d:|uniq |tail -1""")
        cpu_core = commands.getoutput(
            """cat /proc/cpuinfo| grep 'cpu cores'|cut -d: -f2|uniq|tail -1""")
        cpu_process = commands.getoutput(
            """cat /proc/cpuinfo| grep processor| wc -l|tail -1""")
        mac = commands.getoutput(
            """/sbin/ifconfig|grep %s -B 1|grep HWaddr|awk '{print $NF}'""" % (
                ip_address))
        if mac == "":
            mac = commands.getoutput(
                """/sbin/ifconfig|grep %s -C2|tail -1|awk '{print $2}'""" % (
                    ip_address))
        mem = commands.getoutput(
            """free -m |grep Mem:|tail -1|cut -d: -f2|awk '{print $1}'""")
        if int(mem) < 1024:
            mem = str(mem) + "M"
        else:
            mem = "%.2f%s" % (int(mem) / 1024, "G")
        system = commands.getoutput(
            """lsb_release -a|grep Description|cut -d: -f 2|tail -1""")
        if re.search("password", system) == "" or re.search("password", system) is not None:
            system = commands.getoutput(
                """cat /etc/redhat-release|tail -1""")
        disk_first = commands.getoutput(
            """df -h|grep "/$"|awk '{print $(NF-4),$(NF-3),$(NF-2)}'""")
        disk_list = disk_first.split()
        disk = "共%s  已用%s  剩余%s" % (disk_list[0], disk_list[1], disk_list[2])
        return HttpResponse(
            '%s;%s;%s;%s;%s' % (mac, cpu_name + " " + cpu_core + "核 " + cpu_process + "线程", mem, disk, system))
    else:
        # 添加到salt配置文件
        os.system("/bin/sh %s/add_to_salt.sh %s lubanmanager luban_management@auto" % (BASE_DIR, ip_address))
        cpu_name = commands.getoutput("""echo "n"|salt-ssh "server_%s" -r  "cat /proc/cpuinfo | grep name | cut -f2 -d:|uniq" -i|tail -1"""%ip_address)
        if re.search("password",cpu_name) is  None and cpu_name != "" and re.search("No route to host",cpu_name) is  None \
            and re.search("WARNING", cpu_name) is None and re.search("Connection refused", cpu_name) is None:
            cpu_core = commands.getoutput("""echo "n"|salt-ssh "server_%s" -r  "cat /proc/cpuinfo| grep 'cpu cores'|cut -d: -f2|uniq" -i|tail -1"""%ip_address)
            cpu_process = commands.getoutput("""echo "n"|salt-ssh "server_%s" -r  "cat /proc/cpuinfo| grep processor| wc -l" -i|tail -1"""%ip_address)
            mac = commands.getoutput(
                """echo "n"|salt-ssh "server_%s" -r "/sbin/ifconfig" -i|grep %s -B 1|grep HWaddr|awk '{print $NF}'""" % (
                ip_address, ip_address))
            if mac == "":
                mac = commands.getoutput(
                    """echo "n"|salt-ssh "server_%s" -r "/sbin/ifconfig" -i|grep %s -C2|tail -1|awk '{print $2}'""" % (
                    ip_address, ip_address))
            mem = commands.getoutput("""echo "n"|salt-ssh "server_%s" -r "free -m |grep Mem:" -i|tail -1|cut -d: -f2|awk '{print $1}'"""%ip_address)
            system = commands.getoutput("""echo "n"|salt-ssh "server_%s" -r "lsb_release -a|grep Description|cut -d: -f 2" -i|tail -1"""%ip_address)
            if re.search("password",system) == "" or re.search("password",system) is not None:
                system = commands.getoutput("""echo "n"|salt-ssh "server_%s" -r "cat /etc/redhat-release" -i|tail -1"""%ip_address)
            disk_first = commands.getoutput("""echo "n"|salt-ssh "server_%s" -r "df -h"|grep "/$"|awk '{print $(NF-4),$(NF-3),$(NF-2)}'"""%ip_address)
            disk_list = disk_first.split()
            disk = "共%s  已用%s  剩余%s"%(disk_list[0],disk_list[1],disk_list[2])


            #sql = (
            #'insert into machine (ip,mac,cpu,memory,disk,system,application) values(\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\") ' % (
            #ip_address, mac, cpu_name+" "+cpu_core+"核 "+cpu_process+"线程", mem,disk,system,""))
            #cursor = connection.cursor()
            try:
                return HttpResponse('%s;%s;%s;%s;%s'%(mac,cpu_name+" "+cpu_core+"核 "+cpu_process+"线程",mem,disk,system))
                # 查询是否已经存在此ip
                # if length == 0L:
                    # print sql
                  #  cursor.execute(sql)
                    #return HttpResponse("success")
                # else:
                #     sql = 'update machine set mac=\"%s\",cpu=\"%s\",memory=\"%s\",disk=\"%s\",' \
                #           'system=\"%s\" where ip=\"%s\"' \
                #           % (mac, cpu_name+" "+cpu_core+"核 "+cpu_process+"线程", mem, disk, system,ip_address)
                #     cursor.execute(sql)
                #     return HttpResponse("success")
            except Exception as e:
                print e
                os.system("/bin/sh %s/delete_from_salt.sh %s" % (BASE_DIR, ip_address))
                return HttpResponse("_fail")
            # finally:
            #     cursor.close()
        else:
            os.system("/bin/sh %s/delete_from_salt.sh %s" % (BASE_DIR, ip_address))
            return HttpResponse("_fail")

@login_required(login_url="/login/")
@csrf_exempt
def get_info_many(request):
    ip_list = request.POST['ip']
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fail_list = '' #保存未成功更新的数据
    localhost = request.get_host()
    for ip_address in ip_list.split(","):
        #判断是否是本机
        if ip_address in localhost:
            cpu_name = commands.getoutput(
                """cat /proc/cpuinfo | grep name | cut -f2 -d:|uniq |tail -1""")
            cpu_core = commands.getoutput(
                """cat /proc/cpuinfo| grep 'cpu cores'|cut -d: -f2|uniq|tail -1""" )
            cpu_process = commands.getoutput(
                """cat /proc/cpuinfo| grep processor| wc -l|tail -1""")
            mac = commands.getoutput(
                """/sbin/ifconfig|grep %s -B 1|grep HWaddr|awk '{print $NF}'""" % (
                    ip_address))
            if mac == "":
                mac = commands.getoutput(
                    """/sbin/ifconfig|grep %s -C2|tail -1|awk '{print $2}'""" % (
                        ip_address))
            mem = commands.getoutput(
                """free -m |grep Mem:|tail -1|cut -d: -f2|awk '{print $1}'""" )
            if int(mem) < 1024:
                mem = str(mem) + "M"
            else:
                mem = "%.2f%s" % (int(mem) / 1024, "G")
            system = commands.getoutput(
                """lsb_release -a|grep Description|cut -d: -f 2|tail -1""")
            if re.search("password", system) == "" or re.search("password", system) is not None:
                system = commands.getoutput(
                    """cat /etc/redhat-release|tail -1""")
            disk_first = commands.getoutput(
                """df -h|grep "/$"|awk '{print $(NF-4),$(NF-3),$(NF-2)}'""")
            disk_list = disk_first.split()
            disk = "共%s  已用%s  剩余%s" % (disk_list[0], disk_list[1], disk_list[2])
            # 更新数据库
            cursor = connection.cursor()
            sql = 'update machine set mac=\"%s\",cpu=\"%s\",memory=\"%s\",disk=\"%s\",' \
                  'system=\"%s\" where ip=\"%s\"' \
                  % (mac, cpu_name + " " + cpu_core + "核 " + cpu_process + "线程", mem, disk, system, ip_address)
            try:
                cursor.execute(sql)
            except:
                fail_list = ip_address + '   ' + fail_list
        else:
            # 添加到salt配置文件
            os.system("/bin/sh %s/add_to_salt.sh %s lubanmanager luban_management@auto" % (BASE_DIR, ip_address))
            cpu_name = commands.getoutput(
                """echo "n"|salt-ssh "server_%s" -r  "cat /proc/cpuinfo | grep name | cut -f2 -d:|uniq" -i|tail -1""" \
                % ip_address)
            if re.search("password", cpu_name) is None and cpu_name != "" and re.search("No route to host",cpu_name) is None \
                    and re.search("WARNING", cpu_name) is None and re.search("Connection refused", cpu_name) is None:
                cpu_core = commands.getoutput(
                    """echo "n"|salt-ssh "server_%s" -r  "cat /proc/cpuinfo| grep 'cpu cores'|cut -d: -f2|uniq" -i|tail -1""" % ip_address)
                cpu_process = commands.getoutput(
                    """echo "n"|salt-ssh "server_%s" -r  "cat /proc/cpuinfo| grep processor| wc -l" -i|tail -1""" % ip_address)
                mac = commands.getoutput(
                    """echo "n"|salt-ssh "server_%s" -r "/sbin/ifconfig" -i|grep %s -B 1|grep HWaddr|awk '{print $NF}'""" % (
                        ip_address, ip_address))
                if mac == "":
                    mac = commands.getoutput(
                        """echo "n"|salt-ssh "server_%s" -r "/sbin/ifconfig" -i|grep %s -C2|tail -1|awk '{print $2}'""" % (
                            ip_address, ip_address))
                mem = commands.getoutput(
                    """echo "n"|salt-ssh "server_%s" -r "free -m |grep Mem:" -i|tail -1|cut -d: -f2|awk '{print $1}'""" % ip_address)
                if int(mem) < 1024:
                    mem = str(mem) + "M"
                else:
                    mem = "%.2f%s"% (int(mem)/1024,"G")
                system = commands.getoutput(
                    """echo "n"|salt-ssh "server_%s" -r "lsb_release -a|grep Description|cut -d: -f 2" -i|tail -1""" % ip_address)
                if re.search("password", system) == "" or re.search("password", system) is not None:
                    system = commands.getoutput(
                        """echo "n"|salt-ssh "server_%s" -r "cat /etc/redhat-release" -i|tail -1""" % ip_address)
                disk_first = commands.getoutput(
                    """echo "n"|salt-ssh "server_%s" -r "df -h" -i|grep "/$"|awk '{print $(NF-4),$(NF-3),$(NF-2)}'""" % ip_address)
                disk_list = disk_first.split()
                disk = "共%s  已用%s  剩余%s" % (disk_list[0], disk_list[1], disk_list[2])
                #更新数据库
                cursor = connection.cursor()
                sql = 'update machine set mac=\"%s\",cpu=\"%s\",memory=\"%s\",disk=\"%s\",' \
                      'system=\"%s\" where ip=\"%s\"' \
                      % (mac, cpu_name+" "+cpu_core+"核 "+cpu_process+"线程", mem, disk, system,ip_address)
                try:
                    cursor.execute(sql)
                except:
                    fail_list = ip_address + '   ' + fail_list
            else:
                fail_list = ip_address + '   ' + fail_list
    if fail_list=="":
        return  HttpResponse("success")
    return  HttpResponse(fail_list.strip())