import express from 'express';

import {  createVat , getVats,updateVat } from '../controllers/vatController.js';

const router = express.Router();

router.post('/createvat',  createVat);

router.get('/',  getVats);

router.put('/:id',  updateVat);


export default router;
