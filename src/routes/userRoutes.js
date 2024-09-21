import express from "express";
import {formularioInicio} from '../controller/userController.js'

const router = express.Router()

// Routing
router.get('/inicio', formularioInicio);

export default router