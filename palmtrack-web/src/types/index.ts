export type Role = 'bos' | 'mandor' | 'operator_peron' | 'akuntan'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  kebun_id: number | null
}
