import { z } from "zod";

export const EventSchema = z.object({
  caseId: z.string(),
  activity: z.string(),
  timestamp: z.string().datetime(),
  resource: z.string(),
});

export type Event = z.infer<typeof EventSchema>;

export const ProcessLogSchema = z.object({
  id: z.string(),
  name: z.string(),
  events: z.array(EventSchema),
});

export type ProcessLog = z.infer<typeof ProcessLogSchema>;

export const FixtureSchema = z.array(ProcessLogSchema);
export type Fixture = z.infer<typeof FixtureSchema>;
