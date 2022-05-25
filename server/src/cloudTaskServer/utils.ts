export const findFieldNameCaseInsensitive = (obj: Object, fieldName: string) => {
  for (const key in obj) {
    if (key.toLowerCase() === fieldName.toLowerCase()) return key
  }
  return ''
}