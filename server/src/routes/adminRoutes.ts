import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { getAdminOverview, resolveComplaint } from "../services/adminService.js";

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireAdmin);

adminRoutes.get("/overview", async (_request, response, next) => {
  try {
    response.json(await getAdminOverview());
  } catch (error) {
    next(error);
  }
});

adminRoutes.post("/complaints/:complaintId/:action", async (request, response, next) => {
  try {
    const action = request.params.action as "delete" | "block" | "ignore";
    response.json(await resolveComplaint(request.params.complaintId, action));
  } catch (error) {
    next(error);
  }
});
