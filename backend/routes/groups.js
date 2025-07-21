const express = require('express');
import { createGroup } from '../controllers/groupController.js';
// import authMiddleware if needed later
const router = express.Router();

router.post('/create', createGroup);

export default router;

