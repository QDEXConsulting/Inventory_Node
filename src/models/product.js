/**
 * Product Model
 * Represents a product in the inventory system
 */

export class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.sku = data.sku;
    this.description = data.description;
    this.price = data.price;
    this.stockQuantity = data.stock_quantity || data.stockQuantity;
    this.categoryId = data.category_id || data.categoryId;
    this.supplierId = data.supplier_id || data.supplierId;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      sku: this.sku,
      description: this.description,
      price: this.price,
      stockQuantity: this.stockQuantity,
      categoryId: this.categoryId,
      supplierId: this.supplierId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  isInStock() {
    return this.stockQuantity >= 0;
  }

  canFulfillOrder(quantity) {
    return this.stockQuantity > quantity;
  }
}

