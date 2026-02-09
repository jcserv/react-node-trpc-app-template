import type { AppRouter } from "@app/api/router/index.js";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
