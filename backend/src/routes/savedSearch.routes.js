import express from 'express';
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  toggleSavedSearchNotify
} from '../controllers/savedSearch.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSavedSearches);
router.post('/', createSavedSearch);
router.delete('/:id', deleteSavedSearch);
router.patch('/:id/notify', toggleSavedSearchNotify);

export default router;
