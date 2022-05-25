import { appendFileSync, statSync, existsSync, mkdirSync } from 'fs'
import { Parser, FieldInfo } from 'json2csv'
import path from 'path'

export const getFileSize = (file: string): number => {
  if (!existsSync(file)) return 0
  const stats = statSync(file)
  return stats.size
}

export const csvWriter = async (fields: FieldInfo<any>[] , row: any, outputPath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		// @NOTE: point of discussion
		// if file is empty, then do not write the header
		// we can utilize getFileSize to check whether or not the file is empty
    // and it should be called by the invoker.
    const isFileEmpty = (getFileSize(outputPath) > 0)
    const parser = new Parser({ header: !isFileEmpty, fields })
    const csv = parser.parse(row)

    // appendFile doesn't create nested directories on the fly
    // so in case of the directory doesn't exist it should be created before appending to a file
    const dirname: string = path.dirname(outputPath)
    if (!existsSync(dirname)) mkdirSync(dirname, { recursive: true })

    appendFileSync(outputPath, csv + '\n', 'utf8')
    resolve()
  })
}
