import { db } from "~/server/db"

export const POST = async (req: Request) => {
    const { data } = await req.json()

    const id = data?.id
    const emailAddress = data?.email_addresses[0].email_address
    const firstName = data?.first_name
    const lastName = data?.last_name
    const imageUrl = data?.image_url

    const newUser = await db.user.create({
        data: {
            id: id,
            emailAddress: emailAddress,
            firstName: firstName,
            lastName: lastName,
            imageUrl: imageUrl
        }
    })

    return new Response('new user created', { status: 201 })
}