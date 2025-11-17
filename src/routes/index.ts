import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";

const router = Router();

// Mount each module under a path prefix
router.use("/", authRoutes);   // all auth routes under /
router.use("/user", userRoutes);   // all user routes under /user

export default router;
