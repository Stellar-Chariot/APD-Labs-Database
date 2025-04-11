@echo off
mysql -u root -p1234 -h localhost "MVP APD" < lib\mysql-schema.sql
pause 