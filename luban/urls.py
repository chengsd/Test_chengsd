# -*- coding: utf-8 -*-
"""luban URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from lb_management import views
from django.views.generic.base import RedirectView  #重定向

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^(\d+)/$', views.home,name='page'),
    url(r'^service_details/$', views.service_details),
    url(r'^service_details_modify/$', views.service_details_modify),
    url(r'^modify_machine/$', views.modify_machine),
    url(r'^add_machine/$', views.add_machine),
    url(r'^delete_machine/$', views.delete_machine),
    url(r'^query/(\d+)/(.*)$',views.query),
    url(r'^$', RedirectView.as_view(url="/1")),
    url(r'^login/$',views.login),
    url(r'^logout/$',views.logout),
    url(r'^auth/$',views.auth),
    url(r'^auto_get_info/$',views.auto_get_info),
    url(r'get_info_many/$',views.get_info_many),
]
