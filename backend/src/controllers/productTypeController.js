const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all product types
const getProductTypes = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "all",
    sort = "name",
    order = "asc",
  } = req.query;

  const skip = (page - 1) * limit;
  const take = Number(limit);

  try {
    const types = await prisma.productType.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: {
        name: "asc",
      },
      skip,
      take,
    });

    const totalItems = await prisma.productType.count();

    res.json({
      data: types,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single product type
const getProductType = async (req, res) => {
  const { id } = req.params;

  try {
    const type = await prisma.productType.findUnique({
      where: { id: parseInt(id) },
      include: { products: true },
    });

    if (!type) {
      return res.status(404).json({ message: "Product Type not found" });
    }

    res.json(type);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all product types (without pagination)
const allProductType = async (req, res) => {
  try {
    const type = await prisma.productType.findMany();

    if (!type) {
      return res.status(404).json({ message: "Product Type not found" });
    }

    res.json(type);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create product type
const createProductType = async (req, res) => {
  const { name } = req.body;

  try {
    const type = await prisma.productType.create({ data: { name } });
    res.status(201).json(type);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update product type
const updateProductType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const type = await prisma.productType.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.json(type);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete product type
const deleteProductType = async (req, res) => {
  const { id } = req.params;
  const typeId = parseInt(id);

  try {
    // If any products are attached to this type, reassign them to an existing fallback type
    const fallback = await prisma.productType.findFirst({
      where: { id: { not: typeId } },
      orderBy: { id: 'asc' },
    });

    if (fallback) {
      await prisma.product.updateMany({
        where: { typeId },
        data: { typeId: fallback.id },
      });
    }

    await prisma.productType.delete({ where: { id: typeId } });
    res.json({ message: "Product Type deleted successfully" });
  } catch (error) {
    console.error("Error deleting product type:", error);
    res.status(400).json({ error: error.message });
  }
};

// Bulk delete product types
const bulkDeleteProductTypes = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Please provide an array of IDs" });
  }

  const parsedIds = ids.map((id) => parseInt(id));

  try {
    const fallback = await prisma.productType.findFirst({
      where: { id: { notIn: parsedIds } },
      orderBy: { id: 'asc' },
    });

    if (fallback) {
      await prisma.product.updateMany({
        where: { typeId: { in: parsedIds } },
        data: { typeId: fallback.id },
      });
    }

    const deleted = await prisma.productType.deleteMany({
      where: { id: { in: parsedIds } },
    });
    res.json({ message: `${deleted.count} product type(s) deleted successfully` });
  } catch (error) {
    console.error("Error bulk deleting product types:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProductTypes,
  getProductType,
  allProductType,
  createProductType,
  updateProductType,
  deleteProductType,
  bulkDeleteProductTypes,
};
