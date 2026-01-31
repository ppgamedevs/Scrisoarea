import prisma from "@/lib/prisma"
import { log } from "./logger"

interface AuditLogEntry {
    actorType: 'ADMIN' | 'PARTNER' | 'SYSTEM'
    actorId: string
    actionType: string
    targetType: 'SCRISOARE' | 'PROOF' | 'DONATION'
    targetId: string
    metadata?: any
}

export async function logAction(entry: AuditLogEntry) {
    try {
        await prisma.actionLog.create({
            data: {
                ...entry,
                metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined
            }
        })
        log(`Audit: ${entry.actionType} on ${entry.targetType}`, 'INFO', entry)
    } catch (e) {
        log("Failed to write audit log", 'ERROR', e)
    }
}
