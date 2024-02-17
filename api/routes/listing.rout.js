import express from 'express'
import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
} from '../controllers/listing.controller.js'
import { verifyToken } from '../utils/verifyUser.js'
import { verify } from 'crypto'

const router = express.Router()

router.get('/get/:id', getListing)
router.post('/create', verifyToken, createListing)
router.delete(`/delete/:id`, verifyToken, deleteListing)
router.put(`/update/:id`, verifyToken, updateListing)
router.get('/get', getListings)
export default router
