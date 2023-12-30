import { Router } from "express";
import { verifyIsAdmin } from "../middlewares/auth";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  updateDepartment,
} from "../controllers/department.controller";

const router = Router();

router.get("/all", getAllDepartments);
router.post("/", verifyIsAdmin, createDepartment);
router.put("/:id", verifyIsAdmin, updateDepartment);
router.delete("/:id", verifyIsAdmin, deleteDepartment);

export default router;
