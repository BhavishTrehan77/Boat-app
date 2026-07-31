const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      name: "Bhavish",
      email: "bhavish@gmail.com",
      password: "123456",
    },
  });

  console.log("User created:", user);

  // Create a product
  await prisma.product.create({
    data: {
      productName: "Boat Airdopes 131",
      serialNumber: "BOAT12345",
      purchaseDate: new Date(),
      warrantyMonths: 12,
      expiryDate: new Date("2027-07-31"),
      userId: user.id,
    },
  });

  console.log("Product created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });