import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../DB/Prisma";
import { Role } from "../generated/browser";
import { createHash, compareHash } from "../utils/PasswordUtils";
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
      .json(new ApiResponse(false, "Missing required fields", null));
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      res
        .status(403)
        .json(new ApiResponse(false, "User already exists", null));
      return;
    }

    const hashPassword = await createHash(password);

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

    res
      .status(200)
      .json(
        new ApiResponse(true, "User created successfully", createUser),
      );
  } catch (erro) {
    res
      .status(500)
      .json(
        new ApiResponse(false, "Internal server error try again", null),
      );
  }
};

export const loginController = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .json(new ApiResponse(false, "Missing required fields", null));
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    res.status(404).json(new ApiResponse(false, "Invalid username or password", null));
    return;
  }

  const isPassowrdValid = await compareHash(password, user.passwordHash);
  if (!isPassowrdValid) {
    res.status(401).json(new ApiResponse(false, "Invalid username or password", null));
    return;
  }
  //   now send a authentication token to client or store it into Authentication header
};
