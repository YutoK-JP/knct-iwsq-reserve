import { appRouter } from "./routers";

export const trpcServerSide = () => appRouter.createCaller({ session: null });
