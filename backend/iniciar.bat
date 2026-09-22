@echo off
title Sistema RH Completo

:: Força o terminal a ir para a pasta exata do projeto no Ambiente de Trabalho
cd /d "C:\Users\lviam\OneDrive\Desktop\sistema-ponto"

echo A iniciar o Backend (Servidor Node.js)...
start cmd /k "cd backend && node server.js"

echo A iniciar o Frontend (Interface React)...
start cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul
echo A abrir o navegador...
start http://https://lvia-backend-2.onrender.com:5173