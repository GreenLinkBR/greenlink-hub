export type ID = string;

export type GenericStatus = "active" | "inactive";

export type Address = {
  id: ID;
  label?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
};
