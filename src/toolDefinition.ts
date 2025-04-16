import { z } from "zod";

export type ToolDefinition<
  Shape extends z.ZodRawShape,
  Output
> = {
  name: string;
  description: string;
  schema: z.ZodObject<Shape>;
  handler: (input: z.infer<z.ZodObject<Shape>>) => Promise<Output>;
};

export type Output = { content: { type: "text"; text: string }[] };