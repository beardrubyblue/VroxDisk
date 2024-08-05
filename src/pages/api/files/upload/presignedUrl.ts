import { env } from '@/env'
import { createPresignedUrlToUpload } from '@/utils/s3-file-management'
import type { PresignedUrlProp, ShortFileProp } from '@/utils/types'
import { withAuth } from '@/utils/withAuth'
import { nanoid } from 'nanoid'
import type { NextApiRequest, NextApiResponse } from 'next'

const bucketName = env.S3_BUCKET_NAME
const expiry = 60 * 60 // 1 hour

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { userId } = req

	if (req.method !== 'POST') {
		res.status(405).json({ message: 'Only POSTT requests are allowed' })
		return
	}

	const files = req.body as ShortFileProp[]

	if (!files?.length) {
		res.status(400).json({ message: 'No files to upload' })
		return
	}

	const presignedUrls: PresignedUrlProp[] = []

	if (files?.length) {
		await Promise.all(
			files.map(async file => {
				const fileName = `${nanoid(5)}-${file?.originalFileName}`
				const url = await createPresignedUrlToUpload({
					bucketName,
					fileName,
					expiry,
				})
				presignedUrls.push({
					fileNameInBucket: fileName,
					originalFileName: file.originalFileName,
					fileSize: file.fileSize,
					url,
				})
			})
		)
	}

	res.status(200).json(presignedUrls)
}

export default withAuth(handler)
