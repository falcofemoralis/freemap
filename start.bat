@ECHO OFF
ECHO Starting Client...
start cmd /k "CD client && npm start"

ECHO Starting Nest.js...
start cmd /k "CD server && npm run start:dev"