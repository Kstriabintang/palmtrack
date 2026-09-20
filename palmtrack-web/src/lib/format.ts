export function rupiah(value: number) {
  return `Rp ${Math.round(Math.abs(value)).toLocaleString('id-ID')}`
}

export function initials(name: string) {
  const words = name.split(' ')
  const withoutHonorific = words.filter((word) => !['pak', 'bapak', 'ibu'].includes(word.toLowerCase()))
  const source = withoutHonorific.length >= 2 ? withoutHonorific : words
  return source
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
