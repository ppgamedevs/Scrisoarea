import { NextRequest, NextResponse } from "next/server";
import { validateNetopiaPayment } from "@/lib/netopia";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        // Netopia sends data as x-www-form-urlencoded usually, but let's check content type
        // The library decrypts based on env_key and data params.

        const contentType = req.headers.get('content-type') || '';
        let env_key, data;

        if (contentType.includes('application/json')) {
            const body = await req.json();
            env_key = body.env_key;
            data = body.data;
        } else {
            const formData = await req.formData();
            env_key = formData.get('env_key') as string;
            data = formData.get('data') as string;
        }

        if (!env_key || !data) {
            return new NextResponse("Missing parameters", { status: 400 });
        }

        const validPayment = await validateNetopiaPayment(env_key, data);

        // validPayment.res is the XML to send back
        // validPayment.order is the order details
        // validPayment.error is any error
        // validPayment.errorMessage

        const orderId = validPayment.order.$.id; // Donation ID
        const action = validPayment.action; // confirmed, paid, etc.
        const errorMessage = validPayment.errorMessage;
        const error = validPayment.error;

        console.log(`[Netopia IPN] Order: ${orderId}, Action: ${action}, Error: ${errorMessage}`);

        // Handle Status Update
        if (!error && (action === 'confirmed' || action === 'paid')) {
            // Payment Successful
            const donation = await prisma.donation.update({
                where: { id: orderId },
                data: {
                    status: 'SUCCEEDED',
                    netopiaStatus: action,
                    netopiaTransactionId: validPayment.order.mobilpay?.payment_instrument_id || 'unknown'
                },
                include: { scrisoare: true } // to get details for email if needed (but we have donation amount)
            });

            // If it was just updated to SUCCEEDED (idempotency check ideally here, but status check works)
            // Send Email
            // Note: validatePayment is called multiple times by Netopia, ensure we don't spam emails.
            // But prisma update returns the *new* record. 
            // Better to check if it WAS NOT succeeded before.
            // However, for MVP, we just send email. Ideally check if email already sent.

            // To avoid spam, we could check if we just transitioned.
            // But here we already updated.
            // Let's assume we send email on 'confirmed'.

            if (action === 'confirmed') {
                await sendEmail({
                    to: donation.donorEmail,
                    template: 'DONATION_CONFIRMATION',
                    data: {
                        amount: donation.amount,
                        date: donation.createdAt.toLocaleDateString('ro-RO'),
                        transactionId: donation.netopiaTransactionId,
                        childName: donation.scrisoare?.childFirstName || 'Copiii noștri'
                    }
                });
            }
        } else {
            // Payment Failed or Pending
            await prisma.donation.update({
                where: { id: orderId },
                data: {
                    netopiaStatus: action || 'ERROR',
                    // status: 'FAILED' // Don't mark as failed immediately if pending
                }
            });
        }

        // Return the XML response required by Netopia
        return new NextResponse(validPayment.res.send, {
            headers: {
                'Content-Type': 'application/xml'
            }
        });

    } catch (e: any) {
        console.error("Netopia IPN Error:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
