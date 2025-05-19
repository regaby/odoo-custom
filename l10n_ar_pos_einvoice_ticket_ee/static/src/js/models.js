
/** @odoo-module */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { Order } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";

patch(PosStore.prototype, {
    async _flush_orders(orders, options) {
        const result = await super._flush_orders(...arguments);
        if (Array.isArray(result)) {
            result.forEach((order) => {
                const current_order = this.get_order();
                current_order.invoice_number = order.invoice_number;
                current_order.l10n_latam_document_type_id_name = order.l10n_latam_document_type_id_name;
                current_order.l10n_latam_document_type_id_code = order.l10n_latam_document_type_id_code;
                current_order.l10n_latam_document_report_name = order.l10n_latam_document_report_name;
                current_order.l10n_ar_cae = order.l10n_ar_cae;
                current_order.l10n_ar_cae_due_date = order.l10n_ar_cae_due_date;
                current_order.l10n_ar_qr_code_base64 = order.l10n_ar_qr_code_base64;
                
                // Añadir detalles de impuestos y subtotal si están disponibles
                if (order.subtotal) {
                    current_order.subtotal = order.subtotal;
                }
                
                if (order.detailed_taxes) {
                    current_order.detailed_taxes = order.detailed_taxes;
                }
            });
        }
        return result;
    }
});

patch(Order.prototype, {
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        
        // Agregar datos de encabezado y configuración
        result['headerData']['pos_name'] = this.pos.config.name;
        result['headerData']['pos_street'] = this.pos.config.street;
        result['headerData']['date'] = result['date'];
        result['headerData']['receipt_invoice_number'] = this.pos.company.receipt_invoice_number;
        result['receipt_invoice_number'] = this.pos.company.receipt_invoice_number;

        // Si hay factura, añadir datos específicos de factura
        if (this.invoice_number) {
            const invoice_letter = this.invoice_number.split(" ")[0]?.substring(3, 4) || '';
            const invoice_number = this.invoice_number.split(" ")[1] || '';
            result['headerData']['invoice_number'] = invoice_number;
            result['headerData']['invoice_letter'] = invoice_letter;
            result['invoice_letter'] = invoice_letter;

            result['headerData']['l10n_latam_document_type_id_code'] = this.l10n_latam_document_type_id_code || '';
            result['headerData']['l10n_latam_document_name'] = this.l10n_latam_document_type_id_name || '';
            result['headerData']['l10n_latam_document_report_name'] = this.l10n_latam_document_report_name || '';

            result['l10n_latam_document_report_name'] = this.l10n_latam_document_report_name || '';
            result['l10n_ar_cae'] = this.l10n_ar_cae || '';
            result['l10n_ar_cae_due_date'] = this.l10n_ar_cae_due_date || '';
            result['l10n_ar_qr_code_base64'] = this.l10n_ar_qr_code_base64 || '';
            
            // Asegurar que los datos de impuestos estén correctamente formateados
            // Verificar si tenemos acceso a detailed_taxes desde el backend
            if (this.detailed_taxes) {
                result.tax_details_from_backend = this.detailed_taxes;
            }
            
            // Calcular subtotal sin impuestos (especialmente importante para facturas tipo A)
            if (invoice_letter === 'A') {
                if (this.subtotal) {
                    // Usar el subtotal que viene del backend si está disponible
                    result.total_without_tax = this.subtotal;
                } else if (!result.total_without_tax) {
                    // Calcular de forma alternativa si no está disponible
                    result.total_without_tax = this.get_total_without_tax();
                }
            }
        }

        return result;
    },
    
    // Asegurar que tenemos este método para calcular el total sin impuestos
    get_total_without_tax() {
        return this.get_total_with_tax() - this.get_total_tax();
    }
});
