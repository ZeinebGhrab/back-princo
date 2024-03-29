import * as bcrypt from 'bcrypt';

export function encodePassword(rawPassword: string): string {
  const SALT = bcrypt.genSaltSync();
  const val = bcrypt.hashSync(rawPassword, SALT);
  return val;
}
export function comparePassword(rawPassword: string, hash: string): boolean {
  return bcrypt.compareSync(rawPassword, hash);
}
