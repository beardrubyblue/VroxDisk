import { db } from '@/server/db'
import type { FileProps } from '@/utils/types'
import { withAuth } from '@/utils/withAuth'
import type { NextApiRequest, NextApiResponse } from 'next'

const LIMIT_FILES = 10

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { userId } = req

	console.log('Fetching files for userId:', userId)

	const files = await db.file.findMany({
		where: { userId },
		take: LIMIT_FILES,
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			originalName: true,
			size: true,
		},
	})

	const filesWithProps: FileProps[] = files.map(file => ({
		id: file.id,
		originalFileName: file.originalName,
		fileSize: Number(file.size),
	}))

	return res.status(200).json(filesWithProps)
}

export default withAuth(handler)
