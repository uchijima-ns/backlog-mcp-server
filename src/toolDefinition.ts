import { z } from "zod";
import { TranslationHelper } from "./createTranslationHelper.js";

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

export const buildToolSchema = <
  T extends z.ZodRawShape
>(fn: (t: TranslationHelper["t"]) => T) => fn;
