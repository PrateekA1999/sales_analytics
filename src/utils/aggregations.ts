import mongoose, { PipelineStage } from "mongoose";

export const getCustomerSpendingPipeline = (
  customerId: mongoose.Types.ObjectId
) => [
  { $match: { customerId, status: "completed" } },
  {
    $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$totalAmount" },
      averageOrderValue: { $avg: "$totalAmount" },
      lastOrderDate: { $max: "$orderDate" },
    },
  },
  {
    $project: {
      _id: 0,
      customerId: "$_id",
      totalSpent: 1,
      averageOrderValue: 1,
      lastOrderDate: 1,
    },
  },
];

export const getTopSellingProductsPipeline = (
  limit: number
): PipelineStage[] => {
  const pipeline = [
    { $match: { status: "completed" } },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        let: { productId: "$_id" },
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
        as: "productDetails",
      },
    },
    { $match: { productDetails: { $ne: [] } } },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        name: "$productDetails.name",
        totalSold: 1,
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ];

  return pipeline as PipelineStage[];
};

export const getSalesAnalyticsPipeline = (startDate: Date, endDate: Date) => [
  {
    $match: {
      status: "completed",
      orderDate: { $gte: startDate, $lte: endDate },
    },
  },
  {
    $facet: {
      overallStats: [
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            completedOrders: { $sum: 1 },
          },
        },
      ],
      categoryBreakdown: [
        { $unwind: "$products" },
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $group: {
            _id: "$productDetails.category",
            revenue: {
              $sum: {
                $multiply: ["$products.quantity", "$products.priceAtPurchase"],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            revenue: 1,
          },
        },
      ],
    },
  },
  {
    $project: {
      totalRevenue: { $arrayElemAt: ["$overallStats.totalRevenue", 0] },
      completedOrders: { $arrayElemAt: ["$overallStats.completedOrders", 0] },
      categoryBreakdown: 1,
    },
  },
];
