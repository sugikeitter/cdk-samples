#!/bin/bash

# versionを+1したい
# sed -i".org" -e "s/{{version}}/1" /usr/share/nginx/html/hello.html
sed -i".org" -e "s/{{hostname}}/`ec2-metadata -h`/" /usr/share/nginx/html/hello.html
