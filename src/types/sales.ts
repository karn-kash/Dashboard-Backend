export interface SalesRecord {
  "Row ID": number;
  "Order ID": string;
  "Order Date": string;
  "Ship Date": string;
  "Ship Mode": string;
  "Customer ID": string;
  "Customer Name": string;
  "Segment": string;
  "Country": string;
  "City": string;
  "State": string;
  "Postal Code": number;
  "Region": string;
  "Product ID": string;
  "Category": string;
  "Sub-Category": string;
  "Product Name": string;
  "Sales": number;
  "Quantity": number;
  "Discount": number;
  "Profit": number;
}

export interface DashboardAggregations {
  totalSales: number;
  totalProfit: number;
  totalQuantity: number;
  averageDiscount: number;
  salesByCity: { name: string; value: number }[];
  salesBySegment: { name: string; value: number }[];
  salesByCategory: { name: string; value: number }[];
  salesByProduct: { label: string; value: number; percentage: number }[];
  salesBySubCategory: { label: string; value: number; percentage: number }[];
}