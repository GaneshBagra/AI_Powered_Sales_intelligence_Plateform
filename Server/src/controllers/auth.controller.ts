import { Response,Request } from "express";
import Jwt  from "jsonwebtoken";
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

const sign_JWT_Token = async (user : any) => {
  const key = process.env.JWT_SECRET as string;
  const token = await Jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
      key,
      { expiresIn: "1d" },
    );
  return token;
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
      res.status(403).json(new ApiResponse(false, "User already exists", null));
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
      .json(new ApiResponse(true, "User created successfully", createUser));
  } catch (erro) {
    res
      .status(500)
      .json(new ApiResponse(false, "Internal server error try again", null));
  }
};

export const loginController = async (
  req: Request,
  res: Response,
) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .json(new ApiResponse(false, "Missing required fields", null));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      res
        .status(404)
        .json(new ApiResponse(false, "Invalid username or password", null));
      return;
    }

    const isPassowrdValid = await compareHash(password, user.passwordHash);
    if (!isPassowrdValid) {
      res
        .status(401)
        .json(new ApiResponse(false, "Invalid username or password", null));
      return;
    }
    
    const token = await sign_JWT_Token(user)

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })

    return res.status(200).json(
      new ApiResponse(true, "Login successful", {
        username : user.username,
        fullName : user.fullName,
        role : user.role,
        id : user.id,
      }),
    );
  } catch (err: any) {
    res
      .status(500)
      .json(new ApiResponse(false, "Internal server error try again", null));
  }
};
