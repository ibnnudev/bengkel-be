export interface CreateServiceItemDTO {
    service_log_id: string;
    sparepart_id?: string;
    name: string;
    qty: number;
    price: number;
}