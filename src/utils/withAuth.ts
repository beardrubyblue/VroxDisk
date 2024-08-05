import { db } from '@/server/db'
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
			const { email, username } = await getUserDetails(userId)

			user = await db.user.create({
				data: {
					id: userId,
					email,
					username,
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
	// Fetch user details from Clerk using Clerk's API
	// This is a placeholder, replace it with actual Clerk API call
	return {
		email: 'user@example.com', // replace with actual email
		username: 'username', // replace with actual username
	}
}
