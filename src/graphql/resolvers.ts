import mongoose from "mongoose";
import {
  getCustomerSpendingPipeline,
  getTopSellingProductsPipeline,
  getSalesAnalyticsPipeline,
} from "../utils/aggregations";
import db from "../models";
import redis from "../utils/redis";

const resolvers = {
  Query: {
    getCustomerSpending: async (
      _: any,
      { customerId }: { customerId: string }
    ) => {
      const result = await db.Order.aggregate(
        getCustomerSpendingPipeline(new mongoose.Types.ObjectId(customerId))
      );

      result.forEach((item: any) => {
        item.lastOrderDate = new Date(item.lastOrderDate).toISOString();
      });

      return (
        result[0] || {
          customerId,
          totalSpent: 0,
          averageOrderValue: 0,
          lastOrderDate: null,
        }
      );
    },
    getTopSellingProducts: async (_: any, { limit }: { limit: number }) => {
      return await db.Order.aggregate(getTopSellingProductsPipeline(limit));
    },
    getSalesAnalytics: async (
      _: any,
      { startDate, endDate }: { startDate: string; endDate: string }
    ) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const cacheKey = `sales_analytics:${start.getTime()}:${end.getTime()}`;

      const cache = await redis.get(cacheKey);
      if (cache) {
        return JSON.parse(cache);
      }
      const result = await db.Order.aggregate(
        getSalesAnalyticsPipeline(start, end)
      );

      await redis.setEx(cacheKey, 600, JSON.stringify(result[0]));

      return (
        result[0] || {
          totalRevenue: 0,
          completedOrders: 0,
          categoryBreakdown: [],
        }
      );
    },
    getCustomerOrders: async (
      _: any,
      {
        customerId,
        page,
        limit,
      }: { customerId: string; page: number; limit: number }
    ) => {
      const totalOrders = await db.Order.countDocuments({
        customerId: new mongoose.Types.ObjectId(customerId),
      });

      const result = await db.Order.find({
        customerId: new mongoose.Types.ObjectId(customerId),
      })
        .sort({ orderDate: 1 })
        .skip(((page || 1) - 1) * (limit || 10))
        .limit(limit || 10);

      let orders = result.map((item) => {
        return {
          _id: item._id,
          customerId: item.customerId,
          totalAmount: item.totalAmount,
          products: item.products,
          orderDate: item.orderDate!.toISOString(),
          status: item.status,
        };
      });

      const response = {
        orders: orders.length > 0 ? orders : [],
        pagination: {
          totalOrders: totalOrders > 0 ? totalOrders : 0,
          currentPage: page || 1,
          totalPages: Math.ceil(totalOrders / limit) || 1,
        },
      };

      return response;
    },
  },
  Mutation: {
    placeOrder: async (
      _: any,
      {
        customerId,
        products,
      }: {
        customerId: string;
        products: { productId: string; quantity: number }[];
      }
    ) => {
      try {
        // Validate Customer Exists
        const customer = await db.Customer.findOne({
          _id: new mongoose.Types.ObjectId(customerId),
        });

        if (!customer) {
          return { success: false, message: "Customer not found", order: null };
        }

        // Fetch Products and Calculate Total Price
        const productDetails = await Promise.all(
          products.map(async ({ productId, quantity }) => {
            const product = await db.Product.findOne({
              _id: new mongoose.Types.ObjectId(productId),
            });

            if (!product)
              throw new Error(`Product with ID ${productId} not found`);
            if (product.stock! < quantity)
              throw new Error(`Product ${product.name} is out of stock`);

            return {
              productId: new mongoose.Types.ObjectId(productId),
              quantity,
              priceAtPurchase: product.price!,
            };
          })
        );

        // Insert Order into DB
        const insertedOrder = await db.Order.insertOne({
          customerId: new mongoose.Types.ObjectId(customerId),
          products: productDetails,
        });

        return {
          success: true,
          message: "Order placed successfully",
          order: {
            _id: insertedOrder._id,
            customerId: insertedOrder.customerId,
            totalAmount: insertedOrder.totalAmount,
            products: insertedOrder.products,
            orderDate: insertedOrder.orderDate!.toISOString(),
            status: insertedOrder.status,
          },
        };
      } catch (error: any) {
        return { success: false, message: error.message, order: null };
      }
    },
  },
};

export default resolvers;
