-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('Billing', 'Shipping', 'Seller');

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "phone" DECIMAL(65,30) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "phone" DECIMAL(65,30) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActiveRole" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActivePermission" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" DATE NOT NULL,
    "phone" DECIMAL(65,30) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "houseNo" TEXT,
    "street" TEXT,
    "landmark" TEXT,
    "pincode" INTEGER,
    "city" TEXT,
    "state" TEXT,
    "refreshToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "catName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "productTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "picture" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "isActiveAdmin" BOOLEAN NOT NULL DEFAULT false,
    "featuredProduct" BOOLEAN NOT NULL DEFAULT false,
    "isActiveSeller" BOOLEAN NOT NULL DEFAULT true,
    "isActiveProduct" BOOLEAN NOT NULL DEFAULT true,
    "sellerId" INTEGER NOT NULL,
    "categoriesId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "customerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Order Placed',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT DEFAULT '',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "customerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "addressId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "orderOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileImage" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER,
    "sellerId" INTEGER,
    "employeeId" INTEGER,

    CONSTRAINT "ProfileImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addresses" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" DECIMAL(65,30) NOT NULL,
    "type" "AddressType",
    "houseNo" TEXT,
    "street" TEXT,
    "landmark" TEXT,
    "address" TEXT,
    "pincode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "customerId" INTEGER,
    "sellerId" INTEGER,
    "employeeId" INTEGER,

    CONSTRAINT "Addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_employeeRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_sellerRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_rolePermission" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_customerRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_phone_key" ON "Employee"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_resetToken_key" ON "Employee"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_phone_key" ON "Seller"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_resetToken_key" ON "Seller"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_resetToken_key" ON "Customer"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productTitle_key" ON "Product"("productTitle");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileImage_customerId_key" ON "ProfileImage"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "_employeeRole_AB_unique" ON "_employeeRole"("A", "B");

-- CreateIndex
CREATE INDEX "_employeeRole_B_index" ON "_employeeRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_sellerRole_AB_unique" ON "_sellerRole"("A", "B");

-- CreateIndex
CREATE INDEX "_sellerRole_B_index" ON "_sellerRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_rolePermission_AB_unique" ON "_rolePermission"("A", "B");

-- CreateIndex
CREATE INDEX "_rolePermission_B_index" ON "_rolePermission"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_customerRole_AB_unique" ON "_customerRole"("A", "B");

-- CreateIndex
CREATE INDEX "_customerRole_B_index" ON "_customerRole"("B");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoriesId_fkey" FOREIGN KEY ("categoriesId") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileImage" ADD CONSTRAINT "ProfileImage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileImage" ADD CONSTRAINT "ProfileImage_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileImage" ADD CONSTRAINT "ProfileImage_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addresses" ADD CONSTRAINT "Addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addresses" ADD CONSTRAINT "Addresses_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addresses" ADD CONSTRAINT "Addresses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_employeeRole" ADD CONSTRAINT "_employeeRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_employeeRole" ADD CONSTRAINT "_employeeRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sellerRole" ADD CONSTRAINT "_sellerRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sellerRole" ADD CONSTRAINT "_sellerRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_rolePermission" ADD CONSTRAINT "_rolePermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_rolePermission" ADD CONSTRAINT "_rolePermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_customerRole" ADD CONSTRAINT "_customerRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_customerRole" ADD CONSTRAINT "_customerRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
