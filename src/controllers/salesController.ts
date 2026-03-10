import { Request, Response } from 'express';
import salesService from '../services/salesService';

export const getStates = (req: Request, res: Response) => {
  try {
    const states = salesService.getStates();
    res.json(states);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch states" });
  }
};

export const getDates = (req: Request, res: Response): any => {
  try {
    const state = req.query.state as string;
    if (!state) {
      return res.status(400).json({ error: "State parameter is required" });
    }

    const dates = salesService.getDatesForState(state);
    if (!dates) {
      return res.status(404).json({ error: "No data found for the provided state" });
    }

    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dates" });
  }
};

export const getDashboardData = (req: Request, res: Response) => {
  try {
    const { state, startDate, endDate } = req.query;

    if (!state || !startDate || !endDate) {
      return res.status(400).json({
        error: "Missing required parameters: state, startDate, and endDate are required."
      });
    }

    const data = salesService.getDashboardData(
      state as string, 
      startDate as string, 
      endDate as string
    );

    res.json(data);

  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

export const getPaginatedSales = (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      state,
      startDate,
      endDate
    } = req.query;

    if (!state || !startDate || !endDate) {
      return res.status(400).json({
        error: "Filtering parameters (state, startDate, endDate) are required for pagination."
      });
    }

    const result = salesService.getPaginatedSales(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      state as string,
      startDate as string,
      endDate as string
    );

    res.json(result);

  } catch (error) {
    console.error("Error in getPaginatedSales controller:", error);
    res.status(500).json({ error: "Failed to fetch paginated sales records." });
  }
};