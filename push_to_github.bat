@echo off
echo ========================================
echo   PUSH DIVYA GRIHSETU TO GITHUB
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Initializing git repository...
git init

echo.
echo [2/6] Adding all files...
git add .

echo.
echo [3/6] Committing files...
git commit -m "Initial commit: Divya Grihsetu - Complete family management app with React Native, Firebase, beautiful UI, and 7 screens"

echo.
echo [4/6] Adding remote repository...
git remote add origin https://github.com/legend12309/divyasetu.git

echo.
echo [5/6] Setting main branch...
git branch -M main

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo   DONE! Check GitHub.com/legend12309/divyasetu
echo ========================================
echo.
pause

