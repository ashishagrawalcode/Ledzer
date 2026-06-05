"use server";

import { prisma } from "@ledzer/database";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function setupBusiness(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const companyName = formData.get("companyName") as string;
  if (!companyName) throw new Error("Company name is required");

  // Create the business AND the mandatory system ledgers in one database transaction
  await prisma.business.create({
    data: {
      name: companyName,
      ownerId: session.user.id,
      ledgers: {
        create: [
          { name: "Cash in Hand", group: "ASSET", isSystem: true },
          { name: "Sales Account", group: "INCOME", isSystem: true },
          { name: "Purchase Account", group: "EXPENSE", isSystem: true },
        ],
      },
    },
  });

  // Force the page to refresh and show the real dashboard
  redirect("/dashboard");
}