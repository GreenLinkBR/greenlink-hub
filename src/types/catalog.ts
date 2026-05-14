import { ID } from "./common";

export type CatalogItemType = "product" | "service" | "kit" | "rental" | "manufactured";

export interface CatalogItem {
  id: ID;
  itemCode: string;
  name: string;
  itemType: CatalogItemType;
  unitCode: string;
  salePrice: number;
  costPrice: number;
  isActive: boolean;
  trackStock: boolean;
  trackSerial: boolean;
  isRecurring: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
