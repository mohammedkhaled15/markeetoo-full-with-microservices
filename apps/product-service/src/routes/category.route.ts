import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller";

const router: Router = Router();

router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/", getCategories);
router.get("/:id", getCategory);

export default router;
