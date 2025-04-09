/**
 * Message patterns used for product service communication
 */
export const PRODUCT_MESSAGE_PATTERNS = {
  CREATE_PRODUCT: { cmd: 'create_product' },
  FIND_ALL_PRODUCTS: { cmd: 'find_all_products' },
  FIND_ONE_PRODUCT: { cmd: 'find_one_product' },
  UPDATE_PRODUCT: { cmd: 'update_product' },
  UPDATE_PRODUCT_STOCK: { cmd: 'update_product_stock' },
  REMOVE_PRODUCT: { cmd: 'remove_product' }
};