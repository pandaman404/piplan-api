import express from "express";
import {
  getProjectGoalByProjectId,
  createProjectGoal,
  updateProjectGoal,
  deleteProjectGoal,
} from "../controllers/projectGoal.controller";
import { verifyIsAdminOrManager } from "../middlewares/auth";

const router = express.Router();

router.get("/:id", getProjectGoalByProjectId);

router.post("/", verifyIsAdminOrManager, createProjectGoal);

router.put("/:id", verifyIsAdminOrManager, updateProjectGoal);

router.delete("/:id", verifyIsAdminOrManager, deleteProjectGoal);

export default router;
