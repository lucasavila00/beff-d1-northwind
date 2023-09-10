import { Ctx as BeffCtx } from "@beff/hono";
import { cors } from "hono/cors";
import { createSQLLog, prepareStatements } from "./tools";

type Ctx = BeffCtx<
  {},
  {
    Bindings: { DB: D1Database };
  }
>;

export default {
  "/*": {
    use: [cors()],
  },
  "/status": {
    get: (c: Ctx) => {
      return { cf: c.hono.req.raw.cf };
    },
  },
  "/supplier": {
    get: async (c: Ctx, Id: string) => {
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        false,
        [
          "SELECT Id,CompanyName,ContactName,ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax, HomePage FROM Supplier WHERE Id = ?1",
        ],
        [[Id]]
      );
      const supplier: D1Result<any> = await (
        stmts[0] as D1PreparedStatement
      ).all();
      return {
        stats: {
          queries: 1,
          results: 1,
          select: 1,
          log: createSQLLog(sql, [supplier]),
        },
        supplier: supplier.results ? supplier.results[0] : {},
      };
    },
  },
  "/suppliers": {
    get: async (c: Ctx, count: boolean, page: number = 1) => {
      const itemsPerPage = 20;
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        count ? "Supplier" : false,
        [
          "SELECT Id,CompanyName,ContactName,ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax, HomePage FROM Supplier LIMIT ?1 OFFSET ?2",
        ],
        [[itemsPerPage, (page - 1) * itemsPerPage]]
      );
      const response: D1Result<any>[] = await c.hono.env.DB.batch(
        stmts as D1PreparedStatement[]
      );
      const first = response[0];
      const total =
        count && first.results ? (first.results[0] as any).total : 0;
      const suppliers: any = count
        ? response.slice(1)[0].results
        : response[0].results;
      return {
        page: page,
        pages: count ? Math.ceil(total / itemsPerPage) : 0,
        items: itemsPerPage,
        total: count ? total : 0,
        stats: {
          queries: stmts.length,
          results: suppliers.length + (count ? 1 : 0),
          select: stmts.length,
          log: createSQLLog(sql, response),
        },
        suppliers: suppliers,
      };
    },
  },
  "/products": {
    get: async (c: Ctx, count: boolean, page: number = 1) => {
      const itemsPerPage = 20;
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        count ? "Product" : false,
        [
          "SELECT Id, ProductName, SupplierId, CategoryId, QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued FROM Product LIMIT ?1 OFFSET ?2",
        ],
        [[itemsPerPage, (page - 1) * itemsPerPage]]
      );
      const response: D1Result<any>[] = await c.hono.env.DB.batch(
        stmts as D1PreparedStatement[]
      );
      const first = response[0];
      const total =
        count && first.results ? (first.results[0] as any).total : 0;
      const products: any = count
        ? response.slice(1)[0].results
        : response[0].results;
      return {
        page: page,
        pages: count ? Math.ceil(total / itemsPerPage) : 0,
        items: itemsPerPage,
        total: count ? total : 0,
        stats: {
          queries: stmts.length,
          results: products.length + (count ? 1 : 0),
          select: stmts.length,
          log: createSQLLog(sql, response),
        },
        products: products,
      };
    },
  },
  "/product": {
    get: async (c: Ctx, Id: string) => {
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        false,
        [
          "SELECT Product.Id, ProductName, SupplierId, CategoryId, QuantityPerUnit, UnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued, Supplier.CompanyName AS SupplierName FROM Product, Supplier WHERE Product.Id = ?1 AND Supplier.Id=Product.SupplierId",
        ],
        [[Id]]
      );
      const product: D1Result<any> = await (
        stmts[0] as D1PreparedStatement
      ).all();
      return {
        stats: {
          queries: 1,
          results: 1,
          select: 1,
          log: createSQLLog(sql, [product]),
        },
        product: product.results ? product.results[0] : {},
      };
    },
  },
  "/orders": {
    get: async (c: Ctx, count: boolean, page: number = 1) => {
      const itemsPerPage = 20;
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        count ? '"Order"' : false,
        [
          'SELECT SUM(OrderDetail.UnitPrice * OrderDetail.Discount * OrderDetail.Quantity) AS TotalProductsDiscount, SUM(OrderDetail.UnitPrice * OrderDetail.Quantity) AS TotalProductsPrice, SUM(OrderDetail.Quantity) AS TotalProductsItems, COUNT(OrderDetail.OrderId) AS TotalProducts, "Order".Id, CustomerId, EmployeeId, OrderDate, RequiredDate, ShippedDate, ShipVia, Freight, ShipName, ShipAddress, ShipCity, ShipRegion, ShipPostalCode, ShipCountry, ProductId FROM "Order", OrderDetail WHERE OrderDetail.OrderId = "Order".Id GROUP BY "Order".Id LIMIT ?1 OFFSET ?2',
        ],
        [[itemsPerPage, (page - 1) * itemsPerPage]]
      );
      const response: D1Result<any>[] = await c.hono.env.DB.batch(
        stmts as D1PreparedStatement[]
      );
      const first = response[0];
      const total =
        count && first.results ? (first.results[0] as any).total : 0;
      const orders: any = count
        ? response.slice(1)[0].results
        : response[0].results;
      return {
        page: page,
        pages: count ? Math.ceil(total / itemsPerPage) : 0,
        items: itemsPerPage,
        total: count ? total : 0,
        stats: {
          queries: stmts.length,
          results: orders.length + (count ? 1 : 0),
          select: stmts.length,
          log: createSQLLog(sql, response),
        },
        orders: orders,
      };
    },
  },
  "/order": {
    get: async (c: Ctx, Id: string) => {
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        false,
        [
          'SELECT Shipper.CompanyName AS ShipViaCompanyName, SUM(OrderDetail.UnitPrice * OrderDetail.Discount * OrderDetail.Quantity) AS TotalProductsDiscount, SUM(OrderDetail.UnitPrice * OrderDetail.Quantity) AS TotalProductsPrice, SUM(OrderDetail.Quantity) AS TotalProductsItems, COUNT(OrderDetail.OrderId) AS TotalProducts, "Order".Id, CustomerId, EmployeeId, OrderDate, RequiredDate, ShippedDate, ShipVia, Freight, ShipName, ShipAddress, ShipCity, ShipRegion, ShipPostalCode, ShipCountry, ProductId FROM "Order", OrderDetail, Shipper WHERE OrderDetail.OrderId = "Order".Id AND "Order".Id = ?1 AND "Order".ShipVia = Shipper.Id GROUP BY "Order".Id',
          "SELECT OrderDetail.OrderId, OrderDetail.Quantity, OrderDetail.UnitPrice AS OrderUnitPrice, OrderDetail.Discount, Product.Id, ProductName, SupplierId, CategoryId, QuantityPerUnit, Product.UnitPrice AS ProductUnitPrice, UnitsInStock, UnitsOnOrder, ReorderLevel, Discontinued FROM Product, OrderDetail WHERE OrderDetail.OrderId = ?1 AND OrderDetail.ProductId = Product.Id",
        ],
        [[Id], [Id]]
      );
      const response = await c.hono.env.DB.batch(
        stmts as D1PreparedStatement[]
      );
      const orders: any = response[0].results;
      const products: any = response[1].results;
      return {
        stats: {
          queries: stmts.length,
          results: products.length + 1,
          select: stmts.length,
          select_where: stmts.length,
          log: createSQLLog(sql, response),
        },
        order: orders ? orders[0] : {},
        products: products,
      };
    },
  },
  "/employees": {
    get: async (c: Ctx, count: boolean, page: number = 1) => {
      const itemsPerPage = 20;
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        count ? "Employee" : false,
        [
          "SELECT Id, LastName, FirstName, Title, TitleOfCourtesy, BirthDate, HireDate, Address, City, Region, PostalCode, Country, HomePhone, Extension, Photo, Notes, ReportsTo, PhotoPath FROM Employee LIMIT ?1 OFFSET ?2",
        ],
        [[itemsPerPage, (page - 1) * itemsPerPage]]
      );
      const response: D1Result<any>[] = await c.hono.env.DB.batch(
        stmts as D1PreparedStatement[]
      );
      const first = response[0];
      const total =
        count && first.results ? (first.results[0] as any).total : 0;
      const employees: any = count
        ? response.slice(1)[0].results
        : response[0].results;
      return {
        page: page,
        pages: count ? Math.ceil(total / itemsPerPage) : 0,
        items: itemsPerPage,
        total: count ? total : 0,
        stats: {
          queries: stmts.length,
          results: employees.length + (count ? 1 : 0),
          select: stmts.length,
          log: createSQLLog(sql, response),
        },
        employees: employees,
      };
    },
  },
  "/employee": {
    get: async (c: Ctx, Id: string) => {
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        false,
        [
          "SELECT Report.Id AS ReportId, Report.FirstName AS ReportFirstName, Report.LastName AS ReportLastName, Employee.Id, Employee.LastName, Employee.FirstName, Employee.Title, Employee.TitleOfCourtesy, Employee.BirthDate, Employee.HireDate, Employee.Address, Employee.City, Employee.Region, Employee.PostalCode, Employee.Country, Employee.HomePhone, Employee.Extension, Employee.Photo, Employee.Notes, Employee.ReportsTo, Employee.PhotoPath FROM Employee LEFT JOIN Employee AS Report ON Report.Id = Employee.ReportsTo WHERE Employee.Id = ?1",
        ],
        [[Id]]
      );

      const employee: any = await (stmts[0] as D1PreparedStatement).all();
      return {
        stats: {
          queries: 1,
          results: 1,
          select_leftjoin: 1,
          log: createSQLLog(sql, [employee]),
        },
        employee: employee.results[0],
      };
    },
  },
  "/customers": {
    get: async (c: Ctx, count: boolean, page: number = 1) => {
      const itemsPerPage = 20;
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        count ? "Customer" : false,
        [
          "SELECT Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax FROM Customer LIMIT ?1 OFFSET ?2",
        ],
        [[itemsPerPage, (page - 1) * itemsPerPage]]
      );
      console.log(stmts);
      const response: D1Result<any>[] = await c.hono.env.DB.batch(
        stmts as D1PreparedStatement[]
      );
      console.log(response);
      console.log("response[0]:", response[0]);
      console.log("response[1]:", response[1]);
      const first = response[0];
      const total =
        count && first.results ? (first.results[0] as any).total : 0;
      const customers: any = count
        ? response.slice(1)[0].results
        : response[0].results;
      return {
        page: page,
        pages: count ? Math.ceil(total / itemsPerPage) : 0,
        items: itemsPerPage,
        total: count ? total : 0,
        stats: {
          queries: stmts.length,
          results: customers.length + (count ? 1 : 0),
          select: stmts.length,
          log: createSQLLog(sql, response),
        },
        customers: customers,
      };
    },
  },
  "/customer": {
    get: async (c: Ctx, Id: string) => {
      const [stmts, sql] = prepareStatements(
        c.hono.env.DB,
        false,
        [
          "SELECT Id, CompanyName, ContactName, ContactTitle, Address, City, Region, PostalCode, Country, Phone, Fax FROM Customer WHERE Id = ?1",
        ],
        [[Id]]
      );
      const customer: any = await (stmts[0] as D1PreparedStatement).all();
      return {
        stats: {
          queries: 1,
          results: 1,
          select: 1,
          log: createSQLLog(sql, [customer]),
        },
        customer: customer.results[0],
      };
    },
  },
};
