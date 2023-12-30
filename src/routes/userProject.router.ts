import { Router } from "express";
import { verifyIsAdminOrManager } from "../middlewares/auth";
import {
  addUserToProject,
  getProjectsByUser,
  getUsersByProject,
  removeUserFromProject,
} from "../controllers/userProject.controller";

const router = Router();

router.post("/", verifyIsAdminOrManager, addUserToProject);
router.get("/project/:id", verifyIsAdminOrManager, getUsersByProject);
router.get("/user/:id", verifyIsAdminOrManager, getProjectsByUser);
router.delete("/:id", verifyIsAdminOrManager, removeUserFromProject);

export default router;
