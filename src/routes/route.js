const express = require('express');
const assignMissionController = require("../controller/createMissionController");

const app = express();
//Crear asignaciones
app.get("/reassing",assignMissionController.get_reassing_missions)
app.get("/assing",assignMissionController.get_assing_missions)
app.get("/executeLoadProcess",assignMissionController.executeLoadProcess)
module.exports = app; 