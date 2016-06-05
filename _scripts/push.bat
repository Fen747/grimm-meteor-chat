@echo off

git add --all
git commit -am %1
git push heroku master
