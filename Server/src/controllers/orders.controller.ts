import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../DB/Prisma";
import { AuthenticatedUserPayload } from "../utils/types";

type partDuplicationStatus = "NEW" | "REPEAT";

export const addOrder = async (req: AuthenticatedRequest, res: Response) => {
  const {
    custId,
    PONumber,
    PODate,
    shipDate,
    partNumber,
    pricePerPiece,
    POQTY,
    catCode,
    finishWeight,
    partDescription,
  } = req.body;
  if (
    !custId ||
    !PONumber ||
    !PODate ||
    !shipDate ||
    !partNumber ||
    !partDescription ||
    pricePerPiece == null ||
    POQTY == null
  ) {
    res
      .status(401)
      .json(new ApiResponse(false, "Please enter necessary fields", null));
    return;
  }
  try {
    const user: any = req.user;

    const partExists = await prisma.orders.findFirst({
      where: { partNumber },
    });
    let partDuplicationStatus: partDuplicationStatus = "REPEAT";
    if (partExists) {
      partDuplicationStatus = "REPEAT";
    } else {
      partDuplicationStatus = "NEW";
    }

    const realisationPerKG =
      finishWeight == null ? undefined : (pricePerPiece * finishWeight) / 1000;

    const createdOrder = await prisma.orders.create({
      data: {
        employeeCode: user.username,
        custId,
        PONumber,
        PODate: new Date(PODate),
        shipDate: new Date(shipDate),
        partNumber,
        partDescription,
        pricePerPiece,
        POQTY,
        catCode: catCode ?? undefined,
        finishWeight: finishWeight ?? undefined,
        realisationPerKG: realisationPerKG ?? undefined,
      },
      select: {
        id: true,
        employeeCode: true,
        custId: true,
        PONumber: true,
        PODate: true,
        shipDate: true,
        partNumber: true,
        partDescription: true,
        partDuplicationStatus: true,
        pricePerPiece: true,
        POQTY: true,
        catCode: true,
        finishWeight: true,
        realisationPerKG: true,
        status: true,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          `Order for customer ${custId} created successfully`,
          createdOrder,
        ),
      );
  } catch (err: any) {
    res
      .status(400)
      .json(
        new ApiResponse(false, "Something went wrong please try again", null),
      );
  }

  // check the necessary values if not found then send message accordingly
};

export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
  const { orderIds }: { orderIds: string[] } = req.body;
  if (Array.isArray(orderIds) && orderIds.length == 0) {
    res
      .send(403)
      .json(new ApiResponse(false, "Please select atleast on user id", null));
  }
  try {
    const deletedOrders = await prisma.orders.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    new ApiResponse(
      true,
      `${deletedOrders.count} order(s) deleted successfully`,
      { deletedCount: deletedOrders.count },
    );
  } catch (err: any) {
    res
      .send(500)
      .json(new ApiResponse(false, "Something went wrong try again", null));
  }
};


export const fetchOrders = async (req:AuthenticatedRequest,res:Response) => {
  const user : AuthenticatedUserPayload | undefined =  req.user

  const orders = await prisma.orders.findMany({
    where: {
      employeeCode : user?.username
    }
  })
  try{
    
  }catch(err : any) {
    res.send(500).json(
      new ApiResponse(false,"Something went wong try again", null)
    )
  }
}