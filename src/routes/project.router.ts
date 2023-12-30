import express from "express";
import {
  getAllProjects,
  getFilteredProject,
  getOneProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projects.controller";
import { verifyIsAdminOrManager } from "../middlewares/auth";

const router = express.Router();

router.get("/all", getAllProjects);
router.get("/filters", getFilteredProject);

router.get("/:id", getOneProject);

router.post("/", verifyIsAdminOrManager, createProject);

router.put("/:id", verifyIsAdminOrManager, updateProject);

router.put("/delete_project/:id", verifyIsAdminOrManager, deleteProject);

export default router;
