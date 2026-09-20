export function rupiah(value: number) {
  return `Rp ${Math.round(Math.abs(value)).toLocaleString('id-ID')}`
}

/** Abbreviated form for stat cards, e.g. Rp 16.264.000 -> "Rp 16,3 jt". */
export function rupiahSingkat(value: number) {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  }
  if (abs >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  }
  return rupiah(value)
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
