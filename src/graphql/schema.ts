import { gql } from "apollo-server-express";

const typeDefs = gql`
  type CustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: String
  }

  type TopProduct {
    productId: ID!
    name: String!
    totalSold: Int!
  }

  type CategoryBreakdown {
    category: String!
    revenue: Float!
  }

  type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [CategoryBreakdown]
  }

  input OrderProductInput {
    productId: ID!
    quantity: Int!
  }

  type OrderResponse {
    success: Boolean!
    message: String!
    order: Order
  }

  type Order {
    _id: ID!
    customerId: ID!
    products: [OrderProduct!]!
    totalAmount: Float!
    orderDate: String!
    status: String!
  }

  type OrderProduct {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }

  type Pagination {
    totalOrders: Int!
    currentPage: Int!
    totalPages: Int!
  }

  type PaginatedOrders {
    orders: [Order]
    pagination: Pagination
  }

  type Query {
    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [TopProduct]
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
    getCustomerOrders(customerId: ID!, page: Int, limit: Int): PaginatedOrders
  }

  type Mutation {
    placeOrder(customerId: ID!, products: [OrderProductInput!]!): OrderResponse!
  }
`;

export default typeDefs;
