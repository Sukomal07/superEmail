import { db } from "~/server/db"

export const POST = async (req: Request) => {
    const { data, type } = await req.json();

    try {
        if (type === "user.created") {
            // Handle user sign-up event
            const id = data?.id;
            const emailAddress = data?.email_addresses[0]?.email_address;
            const firstName = data?.first_name;
            const lastName = data?.last_name;
            const imageUrl = data?.image_url;

            await db.user.create({
                data: {
                    id,
                    emailAddress,
                    firstName,
                    lastName,
                    imageUrl,
                },
            });
            return new Response("New user created", { status: 201 });
        } else if (type === "session.created") {
            // Handle user login event
            const userId = data?.user_id;

            const clerkResponse = await fetch(
                `https://api.clerk.dev/v1/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                    },
                }
            );

            if (!clerkResponse.ok) {
                return new Response("Failed to fetch user from Clerk", {
                    status: 500,
                });
            }

            const clerkUser = await clerkResponse.json();

            const id = clerkUser?.id;
            const emailAddress = clerkUser?.email_addresses[0]?.email_address;
            const firstName = clerkUser?.first_name;
            const lastName = clerkUser?.last_name;
            const imageUrl = clerkUser?.image_url;

            // Check if user exists in the database then create new one
            await db.user.upsert({
                where: { id },
                update: {
                    emailAddress,
                    firstName,
                    lastName,
                    imageUrl,
                },
                create: {
                    id,
                    emailAddress,
                    firstName,
                    lastName,
                    imageUrl,
                },
            });

            return new Response("User upserted successfully", { status: 201 });
        }

        return new Response("Unhandled event type", { status: 400 });
    } catch (error: any) {
        console.error("Error handling Clerk webhook:", error);
        return new Response("Internal server error", { status: 500 });
    }
};
