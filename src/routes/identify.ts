import { Router } from 'express';
import { identifyContact } from '../controllers/identifyController';

const router = Router();

// POST /identify
router.post('/', identifyContact);

export default router;
