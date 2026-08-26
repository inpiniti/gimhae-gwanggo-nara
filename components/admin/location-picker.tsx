"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { LocationPickerProps } from "./location-picker-inner";

export const LocationPicker = dynamic<LocationPickerProps>(
  () => import("./location-picker-inner").then((m) => m.LocationPickerInner),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-xl" /> },
);
