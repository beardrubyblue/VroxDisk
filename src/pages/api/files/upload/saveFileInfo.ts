import { env } from '@/env'
import { db } from '@/server/db'
import type { FileInDBProp, PresignedUrlProp } from '@/utils/types'
import { withAuth } from '@/utils/withAuth'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { userId } = req

	if (req.method !== 'POST') {
		res.status(405).json({ message: 'Only POST requests are allowed' })
		return
	}

	const presignedUrls = req.body as PresignedUrlProp[]

	console.log('Saving files for userId:', userId)

	// Verify user exists
	const userExists = await db.user.findUnique({
		where: { id: userId },
	})

	if (!userExists) {
		return res.status(400).json({ message: 'User does not exist' })
	}

	// Log each file info for debugging
	console.log('Files to be saved:', presignedUrls)

	try {
		const saveFilesInfo = await db.file.createMany({
			data: presignedUrls.map((file: FileInDBProp) => ({
				bucket: env.S3_BUCKET_NAME,
				fileName: file.fileNameInBucket,
				originalName: file.originalFileName,
				size: BigInt(file.fileSize), // Ensure the size is stored as BigInt
				userId: userId, // Ensure userId is being correctly assigned
			})),
		})

		console.log('Save files result:', saveFilesInfo)

		res.status(200).json({ message: 'Files saved successfully' })
	} catch (error) {
		console.error('Error saving files:', error)
		res
			.status(500)
			.json({ message: 'Error saving files', error: error.message })
	}
}

export default withAuth(handler)
