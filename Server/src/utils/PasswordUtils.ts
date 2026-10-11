import bcrypt from "bcrypt"
import dotenv from "dotenv"

dotenv.config()

export const createHash = async (password:string) => {
    const saltRounds = parseInt(process.env.SALT_NUMBER || '10')
    const hash = await bcrypt.hash(password, saltRounds)
    return hash
} 

export const compareHash = async (password : string, hash:string) => {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
}