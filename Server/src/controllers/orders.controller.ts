import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ApiResponse } from "../utils/ApiResponse";
import prisma from "../DB/Prisma";
import { AuthenticatedUserPayload } from "../utils/types";
import { Prisma } from "../generated/client";

export const addOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { custId, PONumber, PODate, shipDate, items } = req.body;

    if (
      typeof custId !== "string" ||
      !custId.trim() ||
      typeof PONumber !== "string" ||
      !PONumber.trim() ||
      !PODate ||
      !shipDate
    ) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            "Please enter all required order fields",
            null,
          ),
        );
    }

    const poDate = new Date(PODate);
    const shippingDate = new Date(shipDate);

    if (
      Number.isNaN(poDate.getTime()) ||
      Number.isNaN(shippingDate.getTime())
    ) {
      return res
        .status(400)
        .json(new ApiResponse(false, "Invalid PODate or shipDate", null));
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(false, "At least one item is required", null));
    }

    for (const [index, item] of items.entries()) {
      if (
        !item ||
        typeof item.partNumber !== "string" ||
        !item.partNumber.trim() ||
        typeof item.partDescription !== "string" ||
        !item.partDescription.trim() ||
        typeof item.POQTY !== "number" ||
        !Number.isInteger(item.POQTY) ||
        item.POQTY <= 0 ||
        typeof item.pricePerPiece !== "number" ||
        !Number.isFinite(item.pricePerPiece)
      ) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              false,
              `Invalid required fields for item at index ${index}`,
              null,
            ),
          );
      }

      if (
        item.partDuplicationStatus !== undefined &&
        !["NEW", "REPEAT"].includes(item.partDuplicationStatus)
      ) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              false,
              `Invalid partDuplicationStatus for item at index ${index}`,
              null,
            ),
          );
      }
    }
    const user = req?.user as AuthenticatedUserPayload;

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(false, "Unauthorized access", null));
    }

    const order = await prisma.orders.create({
      data: {
        employeeCode: user?.username,
        custId: custId.trim(),
        PONumber: PONumber.trim(),
        PODate: poDate,
        shipDate: shippingDate,
        items: {
          create: items.map((item: any) => ({
            partNumber: item.partNumber.trim(),
            partDescription: item.partDescription.trim(),
            partDuplicationStatus: item.partDuplicationStatus ?? "NEW",
            pricePerPiece: new Prisma.Decimal(item.pricePerPiece),
            POQTY: item.POQTY,

            catCode: item.catCode ?? null,
            finishWeight:
              item.finishWeight == null
                ? null
                : new Prisma.Decimal(item.finishWeight),
            realisationPerKG:
              item.realisationPerKG == null
                ? null
                : new Prisma.Decimal(item.realisationPerKG),

            boxQTY: item.boxQTY ?? null,
            bookingQty: item.bookingQty ?? null,
            status: item.status ?? "PENDING",
            invoiceNumber: item.invoiceNumber ?? null,
            invoiceQTY: item.invoiceQTY ?? null,
          })),
        },
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          `Order for customer ${custId} created successfully for PO Number ${order.PONumber}`,
        ),
      );
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return res
        .status(409)
        .json(new ApiResponse(false, "This PO number already exists", null));
    }

    return res
      .status(500)
      .json(new ApiResponse(false, "Failed to create order", null));
  }
};

export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
  const { poNumbers }: { poNumbers: string[] } = req.body;
  if (Array.isArray(poNumbers) && poNumbers.length == 0) {
    res
      .send(403)
      .json(new ApiResponse(false, "Please select atleast on user id", null));
  }
  try {
    const deletedOrders = await prisma.orders.deleteMany({
      where: {
        PONumber: {
          in: poNumbers,
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

export const fetchOrders = async (req: AuthenticatedRequest, res: Response) => {
  const { custId } = req.params as { custId: string };
  const user: AuthenticatedUserPayload | undefined = req.user;

  if (!custId || !custId.trim()) {
    return res
      .status(400)
      .json(new ApiResponse(false, "Customer ID is required", null));
  }

  try {
    const orders = await prisma.orders.findMany({
      where: {
        custId: custId.trim(),
      },
      include: {
        items: true,
      },
      orderBy: {
        PODate: "desc",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(true, "Customer orders fetched successfully", orders),
      );
  } catch (err) {
    console.error("Get customer orders error:", err);

    return res
      .status(500)
      .json(
        new ApiResponse(false, "Something went wrong. Please try again.", null),
      );
  }
};

export const fetchItemDetails = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const searchQuery = req.body.searchQuery;

  if (typeof searchQuery !== "string" || !searchQuery.trim()) {
    res
      .status(400)
      .json(new ApiResponse(false, "Please enter a part number", null));
    return;
  }

  try {
    const items = await prisma.items.findMany({
      where: {
        partNumber: {
          startsWith: searchQuery.trim(),
          mode: "insensitive",
        },
      },
      distinct: ["partNumber"],
      select: {
        partNumber: true,
        partDescription: true,
        catCode: true,
        finishWeight: true,
      },
      orderBy: {
        partNumber: "asc",
      },
      take: 10,
    });

    res
      .status(200)
      .json(new ApiResponse(true, "Item search completed successfully", items));
  } catch (err: unknown) {
    console.error("Fetch item details error:", err);

    res
      .status(500)
      .json(new ApiResponse(false, "Failed to search items", null));
  }
};
