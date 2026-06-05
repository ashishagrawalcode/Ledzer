import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export const GET = (req: NextRequest) => handlers.GET(req);
export const POST = (req: NextRequest) => handlers.POST(req);