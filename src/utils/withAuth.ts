import { db } from '@/server/db'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { getAuth } from '@clerk/nextjs/server'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export const withAuth = (handler: NextApiHandler) => {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const { userId } = getAuth(req)

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		// Check if user exists in the database
		let user = await db.user.findUnique({
			where: { id: userId },
		})

		// If user does not exist, create the user
		if (!user) {
			// Assuming you have a getUser function to fetch user details from Clerk
			const { email } = await getUserDetails(userId)

			user = await db.user.create({
				data: {
					id: userId,
					email,
				},
			})

			console.log(`Created new user with id: ${userId}`)
		}

		req.userId = userId
		return handler(req, res)
	}
}

// Helper function to get user details from Clerk
const getUserDetails = async (userId: string) => {
	const user = await clerkClient.users.getUser(userId)

	if (!user) {
		throw new Error('User not found')
	}

	return {
		email: user.emailAddresses[0].emailAddress, // Adjust according to how Clerk returns the email
	}
}
