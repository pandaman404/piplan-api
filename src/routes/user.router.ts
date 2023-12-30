import { Router } from "express";
import {
  createUser,
  deactivateAccount,
  getAllUsers,
  getUser,
  login,
  updateUserInfo,
  updateUserPassword,
} from "../controllers/user.controller";
import { validateToken, verifyIsAdmin } from "../middlewares/auth";
import {
  validateNewUserBeforeSave,
  validateUserInfoBeforeUpdate,
} from "../middlewares/validateFields";

const router = Router();

router.post("/login", login);
router.post("/", [validateToken, verifyIsAdmin, validateNewUserBeforeSave], createUser);
router.get("/all", validateToken, getAllUsers);
router.get("/", validateToken, getUser);
router.put("/:id", [validateToken, validateUserInfoBeforeUpdate], updateUserInfo);
router.put("/update_password/:id", validateToken, updateUserPassword);
router.put("/deactivate_account/:id", [validateToken, verifyIsAdmin], deactivateAccount);

export default router;
