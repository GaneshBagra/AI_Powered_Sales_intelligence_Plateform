import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../DB/Prisma";
import { Role } from "../generated/browser";
import { createHash,compareHash } from "../utils/PasswordUtils";
import { ApiResponse } from "../utils/ApiResponse";

interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  role: Role;
}

export const registerContoller = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { fullName, username, password, role } = req.body as RegisterData;
  if (!fullName || !username || !password || !role) {
    return res
      .status(400)
      .json(new ApiResponse(false, "Missing required fields", null, 400));
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUser) {
    res.status(403).json(new ApiResponse(false, "User already exists", null, 403));
    return;
  }

  const hashPassword = await createHash(password);
  console.log("hashPassword", hashPassword);

  const createUser = await prisma.user.create({
    data: {
      fullName,
      passwordHash: hashPassword,
      username,
      role,
    },
    select: {
      id: true,
      fullName: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  res.status(200).json(new ApiResponse(true, "User created successfully", createUser, 200));
};

export const loginController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json(new ApiResponse(false, "Missing required fields", null, 400));
    return;
  }

  const user = await prisma.user.findUnique({
    where : {username}

  })

  if (!user) {
    res.status(404).json(new ApiResponse(false, "User not found", null, 404));
    return;
  }

  const isPassowrdValid = await compareHash(password, user.passwordHash)
  if (!isPassowrdValid) {
    res.status(401).json(new ApiResponse(false, "Invalid password", null, 401));
    return;
  }
//   now send a authentication token to client or store it into Authentication header 
};
