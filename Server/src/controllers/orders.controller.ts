import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../DB/Prisma";

type partDuplicationStatus = "NEW" |"REPEAT";

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

  } = req.body;
  if (
    !custId ||
    !PONumber ||
    !PODate ||
    !shipDate ||
    !partNumber ||
    pricePerPiece == null ||
    POQTY == null || finishWeight == null
  ) {
    res
      .status(401)
      .json(new ApiResponse(false, "Please enter necessary fields", null));
  }

  const user = req.user;
  
  const partExists = await prisma.orders.findFirst({
    where :{partNumber}
  })
  let partDuplicationStatus:partDuplicationStatus = "REPEAT"
  if (partExists) {
    partDuplicationStatus = "REPEAT"
  }else {
    partDuplicationStatus = "NEW"
  }

  const realisationPerKG : number = pricePerPiece *finishWeight / 1000

//   const createdOrder = await prisma.orders.create({
//     data: {
//         custId,
//         PONumber,
//         PODate: new Date(PODate),
//         shipDate: new Date(shipDate),
//         partNumber,
//         pricePerPiece,
//         POQTY,
//         catCode: catCode ?? undefined,
//         finishWeight: finishWeight ?? undefined,
//         partDuplicationStatus,
//         realisationPerKG
//     },
//     select: {
//         id: true,
//         custId: true,
//         PONumber: true,
//         PODate: true,
//         shipDate: true,
//         partNumber: true,
//         pricePerPiece: true,
//         POQTY: true,
//         catCode: true,
//         finishWeight: true,
//     },
// });



  // check the necessary values if not found then send message accordingly
};
