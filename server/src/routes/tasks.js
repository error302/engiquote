import express from 'express';
import * as tasksController from '../controllers/tasks.js';

const router = express.Router();

router.get('/', tasksController.getTasks);
router.get('/:id', tasksController.getTask);
router.post('/', tasksController.createTask);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

export default router;
