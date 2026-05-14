import { ID } from "./common";

export type AssetOwnerType = "greenlink" | "customer" | "third_party";
export type AssetStatus =
  | "available"
  | "reserved"
  | "installed"
  | "rented"
  | "maintenance"
  | "returned"
  | "inactive";

export interface Asset {
  id: ID;
  assetTag: string;
  assetModelId?: string;
  catalogItemId?: string;
  serialNumber?: string;
  ownerType: AssetOwnerType;
  customerId?: string;
  contractId?: string;
  status: AssetStatus;
  siteName?: string;
  addressId?: string;
  installedAt?: string;
  lastReadingAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
