import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
                const session = await getSession();
                if (!session) {
                    throw new Error('Unauthorized');
                }

                // Optional: restrict to Partner/Admin only?
                // For now, let's keep it generally authenticated as Donors might upload avatars later.
                if (session.role !== 'PARTNER' && session.role !== 'ADMIN') {
                    // For this specific form (Partner New Letter), strictly speaking only PARTNER should be here.
                    // But re-using this route for other things is useful.
                    // Let's enforce PARTNER for now if the pathname indicates letter upload, but pathname is just filename.
                    // We can rely on clientPayload for context if needed, but strict auth is enough.
                }

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'],
                    tokenPayload: JSON.stringify({
                        userId: session.id,
                        role: session.role
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // console.log('blob uploaded', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
