import { useQuery } from "@tanstack/react-query";
import { services } from "@/services";

export const useTechnicians = () =>
  useQuery({ queryKey: ["technicians_stats"], queryFn: services.technicians.list });