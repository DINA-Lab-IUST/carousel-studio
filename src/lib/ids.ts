import { nanoid } from 'nanoid'

export function newId(prefix?: string): string {
  return prefix ? `${prefix}_${nanoid(8)}` : nanoid(10)
}
