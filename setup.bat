@echo off
set PATH=%PATH%;C:\Program Files\nodejs
call npm install --legacy-peer-deps
call npm run dev 