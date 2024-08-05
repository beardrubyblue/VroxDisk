'use client'
import { type FileProps } from '@/utils/types'
import { useEffect, useState } from 'react'

export type fileUploadMode = 's3PresignedUrl' | 'NextjsAPIEndpoint'

export default function Home() {
	const [files, setFiles] = useState<FileProps[]>([])
	const [uploadMode, setUploadMode] = useState<fileUploadMode>('s3PresignedUrl')

	const fetchFiles = async () => {
		const response = await fetch('/api/files')
		const body = (await response.json()) as FileProps[]
		// set isDeleting to false for all files after fetching
		setFiles(body.map(file => ({ ...file, isDeleting: false })))
	}

	// fetch files on the first render
	useEffect(() => {
		fetchFiles().catch(console.error)
	}, [])

	// determine if we should download using presigned url or Nextjs API endpoint
	const downloadUsingPresignedUrl = uploadMode === 's3PresignedUrl'
	// handle mode change between s3PresignedUrl and NextjsAPIEndpoint
	const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setUploadMode(event.target.value as fileUploadMode)
	}

	return (
		<>
			<main className='flex min-h-screen items-center justify-center gap-5 font-mono'>
				<div className='container flex flex-col gap-5 px-3'>gerfgdfaggr</div>
			</main>
		</>
	)
}
