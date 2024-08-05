import { env } from '@/env'
import { db } from '@/server/db'
import { saveFileInBucket } from '@/utils/s3-file-management'
import { IncomingForm, type File } from 'formidable'
import fs from 'fs'
import { nanoid } from 'nanoid'
import type { NextApiRequest, NextApiResponse } from 'next'

const bucketName = env.S3_BUCKET_NAME

type ProcessedFiles = Array<[string, File]>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { userId } = req
	let status = 200,
		resultBody = { status: 'ok', message: 'Files were uploaded successfully' }

	// Get files from request using formidable
	const files = await new Promise<ProcessedFiles | undefined>(
		(resolve, reject) => {
			const form = new IncomingForm()
			const files: ProcessedFiles = []
			form.on('file', function (field: string, file: any) {
				files.push([field, file])
			})
			form.on('end', () => resolve(files))
			form.on('error', (err: any) => reject(err))
			form.parse(req, () => {
				//
			})
		}
	).catch(() => {
		;({ status, resultBody } = setErrorStatus(status, resultBody))
		return undefined
	})

	if (files?.length) {
		// Upload files to S3 bucket
		try {
			await Promise.all(
				files.map(async ([_, fileObject]) => {
					const file = fs.createReadStream(fileObject?.filepath)
					// generate unique file name
					const fileName = `${nanoid(5)}-${fileObject?.originalFilename}`
					// Save file to S3 bucket and save file info to database concurrently
					await saveFileInBucket({
						bucketName,
						fileName,
						file,
					})
					// save file info to database
					await db.file.create({
						data: {
							bucket: bucketName,
							fileName,
							originalName: fileObject?.originalFilename ?? fileName,
							size: fileObject?.size ?? 0,
							userId: String(userId),
						},
					})
				})
			)
		} catch (e) {
			console.error(e)
			;({ status, resultBody } = setErrorStatus(status, resultBody))
		}
	}

	res.status(status).json(resultBody)
}
// Set error status and result body if error occurs
export function setErrorStatus(
	status: number,
	resultBody: { status: string; message: string }
) {
	status = 500
	resultBody = {
		status: 'fail',
		message: 'Upload error',
	}
	return { status, resultBody }
}

// Disable body parser built-in to Next.js to allow formidable to work
export const config = {
	api: {
		bodyParser: false,
	},
}

export default handler
