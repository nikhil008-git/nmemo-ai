import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@repo/db";

/** Permanently delete the signed-in user and sole-owned workspaces. */
export async function DELETE() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: { members: { select: { id: true, userId: true } } },
        },
      },
    });

    for (const membership of memberships) {
      const others = membership.workspace.members.filter(
        (m) => m.userId !== userId,
      );
      if (others.length === 0) {
        await prisma.workspace.delete({
          where: { id: membership.workspaceId },
        });
      } else {
        await prisma.workspaceMember.delete({
          where: { id: membership.id },
        });
      }
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account/delete]", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
