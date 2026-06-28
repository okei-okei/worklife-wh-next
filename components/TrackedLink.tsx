"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackMetric, type MetricEventName } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  eventName: MetricEventName;
  targetType?: string;
  targetId?: string;
  pagePath?: string;
  metadata?: Record<string, unknown>;
};

export default function TrackedLink({
  eventName,
  targetType,
  targetId,
  pagePath,
  metadata,
  onClick,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        void trackMetric(eventName, {
          eventType: "click",
          targetType,
          targetId,
          pagePath,
          metadata,
        });
        onClick?.(event);
      }}
    />
  );
}
