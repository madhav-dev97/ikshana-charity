import { Router, type IRouter } from "express";
import healthRouter from "./health";
import causesRouter from "./causes";
import donationsRouter from "./donations";
import statsRouter from "./stats";
import notificationsRouter from "./notifications";
import mediaRouter from "./media";

const router: IRouter = Router();

router.use(healthRouter);
router.use(causesRouter);
router.use(donationsRouter);
router.use(statsRouter);
router.use(notificationsRouter);
router.use(mediaRouter);

export default router;
