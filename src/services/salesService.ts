import fs from 'fs';
import path from 'path';
import { SalesRecord, DashboardAggregations } from '../types/sales';

class SalesService {
  private data: SalesRecord[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const filePath = path.join(__dirname, '../../data/sales.json');
      const rawData = fs.readFileSync(filePath, 'utf-8');
      this.data = JSON.parse(rawData);
      console.log(`✅ SalesService initialized with ${this.data.length} records.`);
    } catch (error) {
      console.error("❌ Error loading sales data:", error);
    }
  }

  private getUTCTimestamp(dateInput: string | number | Date, endOfDay = false): number {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 0;

    if (endOfDay) {
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999);
    }
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
  }

  public getStates(): string[] {
    const states = new Set(this.data.map(item => item.State));
    return Array.from(states).sort();
  }

  public getDatesForState(state: string) {
    const stateData = this.data.filter(item => item.State === state);
    if (stateData.length === 0) return null;

    const dates = stateData.map(item => this.getUTCTimestamp(item["Order Date"]));
    const validDates = dates.filter(t => t > 0);

    return {
      minDate: new Date(Math.min(...validDates)).toISOString().split('T')[0],
      maxDate: new Date(Math.max(...validDates)).toISOString().split('T')[0]
    };
  }

  private filterData(data: SalesRecord[], key: keyof SalesRecord): { name: string; value: number }[] {
    const grouped = data.reduce((acc, item) => {
      const groupKey = (item[key] || "Unknown") as string;
      if (!acc[groupKey]) acc[groupKey] = 0;
      acc[groupKey] += Number(item.Sales || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }

  private formatForProgressTable(data: { name: string; value: number }[], limit: number = 5) {
    const topItems = data.slice(0, limit);
    const highestValue = topItems.length > 0 ? topItems[0].value : 1;

    return topItems.map(item => ({
      label: item.name,
      value: item.value,
      percentage: Math.round((item.value / highestValue) * 100)
    }));
  }

  private getFilteredSubset(state: string, startDate: string, endDate: string): SalesRecord[] {
    const startTs = this.getUTCTimestamp(startDate);
    const endTs = this.getUTCTimestamp(endDate, true);

    return this.data.filter(item => {
      if (item.State !== state) return false;
      const orderTs = this.getUTCTimestamp(item["Order Date"]);
      return orderTs >= startTs && orderTs <= endTs;
    });
  }

  public getPaginatedSales(page: number, limit: number, state: string, startDate: string, endDate: string) {
    const filtered = this.getFilteredSubset(state, startDate, endDate);
    const startIndex = (page - 1) * limit;

    return {
      records: filtered.slice(startIndex, startIndex + limit),
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: page
    };
  }

  public getDashboardData(state: string, startDate: string, endDate: string): DashboardAggregations {
    const filteredData = this.getFilteredSubset(state, startDate, endDate);

    const totalSales = filteredData.reduce((sum, item) => sum + Number(item.Sales || 0), 0);
    const totalProfit = filteredData.reduce((sum, item) => sum + Number(item.Profit || 0), 0);
    const totalQuantity = filteredData.reduce((sum, item) => sum + Number(item.Quantity || 0), 0);
    const totalDiscount = filteredData.reduce((sum, item) => sum + Number(item.Discount || 0), 0);

    const averageDiscount = filteredData.length > 0
      ? (totalDiscount / filteredData.length) * 100
      : 0;

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalQuantity,
      averageDiscount: parseFloat(averageDiscount.toFixed(1)),
      salesByCity: this.filterData(filteredData, 'City').slice(0, 8),
      salesByCategory: this.filterData(filteredData, 'Category'),
      salesBySegment: this.filterData(filteredData, 'Segment'),
      salesByProduct: this.formatForProgressTable(this.filterData(filteredData, 'Product Name'), 10),
      salesBySubCategory: this.formatForProgressTable(this.filterData(filteredData, 'Sub-Category'), 10)
    };
  }
}

export default new SalesService();