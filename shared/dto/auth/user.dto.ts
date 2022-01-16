export interface UserDto {
  login: string,
  password: string,
  confirmPassword?: string,
  email?: string
}