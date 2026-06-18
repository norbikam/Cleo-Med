import { blRequest } from "./client";

export interface BLOrder {
  order_id: string;
  order_status_id: number;
  date_add: number;
  user_login: string;
  phone: string;
  email: string;
  delivery_fullname: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postcode: string;
  delivery_phone: string;
  delivery_method?: string;
  delivery_price?: number;
  delivery_package_nr?: string;
  payment_done: number;
  custom_source_id?: number;
  products: Array<{
    name: string;
    sku: string;
    quantity: number;
    price_brutto: number;
  }>;
}

interface GetOrdersResponse {
  orders: BLOrder[];
}

export async function getOrders(params: {
  dateFrom?: number;
  idFrom?: number;
}): Promise<BLOrder[]> {
  const parameters: Record<string, unknown> = {};
  if (params.dateFrom) parameters.date_add_from = params.dateFrom;
  if (params.idFrom) parameters.id_from = params.idFrom;

  const data = await blRequest<GetOrdersResponse>("getOrders", parameters);
  return data.orders ?? [];
}

export async function addOrder(order: {
  order_status_id: number;
  custom_source_id?: number;
  delivery_fullname: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postcode: string;
  delivery_method?: string;
  delivery_price?: number;
  user_login?: string;
  phone: string;
  email?: string;
  invoice_fullname?: string;
  invoice_company?: string;
  invoice_address?: string;
  invoice_postcode?: string;
  invoice_city?: string;
  payment_method?: string;
  payment_method_cod?: number;
  user_comments?: string;
  admin_comments?: string;
  extra_field_1?: string;
  extra_field_2?: string;
  invoice_nip?: string;
  products: Array<{ storage: string; storage_id: number; product_id: string; variant_id: number; name: string; sku: string; price_brutto: number; quantity: number }>;
  custom_extra_fields?: Record<string, string>;
}): Promise<string> {
  const data = await blRequest<{ order_id: string }>("addOrder", order);
  return String(data.order_id);
}

export async function setOrderStatus(orderId: string, statusId: number): Promise<void> {
  await blRequest("setOrderStatus", { order_id: Number(orderId), status_id: statusId });
}

export async function getStatusList(): Promise<Array<{ id: number; name: string }>> {
  const data = await blRequest<{ statuses: Array<{ id: number; name: string }> }>("getOrderStatusList");
  return data.statuses ?? [];
}
