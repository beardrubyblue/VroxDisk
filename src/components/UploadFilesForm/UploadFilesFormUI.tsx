import { type UploadFilesFormUIProps } from '@/utils/types'
import { LoadSpinner } from '../LoadSpinner'

export function UploadFilesFormUI({
	isLoading,
	fileInputRef,
	uploadToServer,
	maxFileSize,
}: UploadFilesFormUIProps) {
	return (
		<form
			className='flex flex-col items-center justify-center gap-3'
			onSubmit={uploadToServer}
		>
			{/* <p className="text-lg">{`Total file(s) size should not exceed ${maxFileSize} MB`}</p> */}

			{isLoading ? (
				<LoadSpinner />
			) : (
				<div className='flex h-16 cursor-pointer gap-5'>
					<input
						id='file'
						type='file'
						multiple
						className='cursor cursor-pointer rounded-md border bg-gray-100 p-2 py-5'
						required
						ref={fileInputRef}
					/>
					<button
						disabled={isLoading}
						className='m-2 rounded-md bg-blue-500 px-5 py-2 text-white
                hover:bg-blue-600  disabled:cursor-not-allowed disabled:bg-gray-400'
					>
						Upload
					</button>
				</div>
			)}
		</form>
	)
}
