import { Router, type IRouter } from "express";
import healthRouter from "./health";
import causesRouter from "./causes";
import donationsRouter from "./donations";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(causesRouter);
router.use(donationsRouter);
router.use(statsRouter);

export default router;
