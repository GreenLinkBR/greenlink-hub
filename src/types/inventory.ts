import { ID } from "./common";

export type StockMovementType =
  | "in"
  | "out"
  | "transfer"
  | "adjustment"
  | "reservation"
  | "release"
  | "consumption"
  | "production_in";

export interface StockBalance {
  warehouseId: string;
  catalogItemId: string;
  onHand: number;
  reserved: number;
  minimumStock: number;
}

export interface StockMovement {
  id: ID;
  movementType: StockMovementType;
  catalogItemId: string;
  sourceWarehouseId?: string;
  targetWarehouseId?: string;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  occurredAt: string;
  notes?: string;
  createdBy?: string;
}
