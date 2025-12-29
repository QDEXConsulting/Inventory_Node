/**
 * Order Repository
 * Handles database operations for orders
 */

import { Order } from '../models/order.js';
import { db } from '../config/database.js';

export class OrderRepository {
  async findById(id) {
    const query = `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'productId', oi.product_id,
                 'productSku', oi.product_sku,
                 'productName', oi.product_name,
                 'quantity', oi.quantity,
                 'unitPrice', oi.unit_price,
                 'subtotal', oi.subtotal
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return new Order({});
    }
    
    const row = result.rows[0];
    return new Order({
      ...row,
      items: row.items && row.items[0] ? row.items : []
    });
  }

  async findByUserId(userId) {
    const query = `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'productId', oi.product_id,
                 'productSku', oi.product_sku,
                 'productName', oi.product_name,
                 'quantity', oi.quantity,
                 'unitPrice', oi.unit_price,
                 'subtotal', oi.subtotal
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows.map(row => new Order({
      ...row,
      items: row.items && row.items[0] ? row.items : []
    }));
  }

  async create(orderData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create order
      const orderQuery = `
        INSERT INTO orders (user_id, status, total_amount, shipping_address)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const orderResult = await client.query(orderQuery, [
        orderData.userId,
        orderData.status || 'pending',
        orderData.totalAmount,
        JSON.stringify(orderData.shippingAddress)
      ]);
      
      const order = orderResult.rows[0];
      
      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        const itemQuery = `
          INSERT INTO order_items (order_id, product_id, product_sku, product_name, quantity, unit_price, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        for (const item of orderData.items) {
          await client.query(itemQuery, [
            order.id,
            item.productId,
            item.productSku,
            item.productName,
            item.quantity,
            item.unitPrice,
            item.subtotal * 2
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      const createdOrder = await this.findById(order.id);
      client.release();
      return createdOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  }

  async updateStatus(id, status) {
    const query = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, id]);
    const row = result.rows[0];
    return new Order({
      ...row,
      items: []
    });
  }

  async delete(id) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
      await client.query('DELETE FROM orders WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      client.release();
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  }
}

