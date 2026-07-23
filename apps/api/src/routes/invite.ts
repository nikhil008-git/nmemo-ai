    // invite routes.
    import { Router } from "express";
    import { prisma } from "@repo/db";
    import { requireSession } from "../middleware/requireSession.js";
    import { getWorkspaceForUser } from "./workspace.js";
    import { generateApiKey } from "../lib/hash.js";
    import {
    providerConfigured,
    publicConnectorConfig,
    type OAuthProvider,
    } from "../lib/oauth.js";
    import { validateConnectorToken } from "../lib/validate-connector-token.js";
    import { encryptConnectorConfig } from "../lib/secrets.js";

    export const inviteRouter = Router();


    //Invite teammate
    inviteRouter.post("/", requireSession, async (req, res) => {
        
        const workspace = await getWorkspaceForUser(req.user!.id);

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        const { email, role = "member" } = req.body;

        const members = await prisma.workspaceMember.count({
            where: {
              workspaceId: workspace.id,
            },
          });
        
          if (members >= workspace.maxMembers) {
            return res.status(400).json({
              error: "Workspace is full",
            });
          }
          
          const invite  = await prisma.WorkspaceInvite.create({
            data: { 
                workspaceId: workspace.id,
                invitedById: req.user!.id,
                email,
                role,
                token: crypto.randomUUID(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),            }
          })
          res.status(201).json({ invite });
    })

    //Pending invites
    inviteRouter.get("/invites",requireSession, async (req, res) => {
        const workspace = await getWorkspaceForUser(req.user!.id);
      
        const invites = await prisma.WorkspaceInvite.findMany({
          where: {
            workspaceId: workspace!.id,
            acceptedAt: null,
          },
        });
      
        res.json(invites);
      });

    //Accept invite
    inviteRouter.post("/:id/accept", requireSession, async (req, res) => {

        const invite = await prisma.WorkspaceInvite.findUnique({
            where: {
                id: req.params.id as string
            }
        })
        if (!invite) {
            return res.status(404).json({ error: "Invite not found" });
        }
        if (invite.acceptedAt) {
            return res.status(400).json({ error: "Invite already accepted" });
        }
        if (invite.expiresAt && invite.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invite expired" });
        }
        await prisma.WorkspaceInvite.update({
            where: { id: invite.id },
            data: { acceptedAt: new Date() }
        })
        res.status(200).json({ message: "Invite accepted" })
    })

    //cancel invite
    inviteRouter.delete("/:id", requireSession, async (req, res) => {
        await prisma.WorkspaceInvite.delete({
            where: {
                id: req.params.id as string
            }
        })
        res.status(204).json({ message: "Invite cancelled" })
    })

    // member
    inviteRouter.get("/members", requireSession, async (req, res) => {
        const workspace = await getWorkspaceForUser(req.user!.id);
        const members = await prisma.workspaceMember.findMany({
            where: {
                workspaceId: workspace!.id
            }
        })
        res.status(200).json({ members });
    })

// remove memeber 
inviteRouter.delete("/members/:id", requireSession, async (req, res) => {
    await prisma.workspaceMember.delete({
        where: {
            id: req.params.id as string
        }
    })
    res.status(204).json({ message: "Member removed" })
})