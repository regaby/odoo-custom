/** @odoo-module */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { Order } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";

// Patch para la pantalla de pago para activar automáticamente la facturación
patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.autoApplyInvoice();
    },
    
    autoApplyInvoice() {
        const order = this.env.services.pos.get_order();
        if (order && this.env.services.pos.config.auto_invoice) {
            order.set_to_invoice(true);
            // Forzar actualización de la UI
            this.render();
        }
    }
});

patch(PosStore.prototype, {
    async _flush_orders(orders, options) {
        const result = await super._flush_orders(...arguments);
        if (Array.isArray(result)) {
            result.forEach((order) => {
                const current_order = this.get_order();
                if (!current_order) return;
                
                current_order.invoice_number = order.invoice_number || '';
                current_order.l10n_latam_document_type_id_name = order.l10n_latam_document_type_id_name || '';
                current_order.l10n_latam_document_type_id_code = order.l10n_latam_document_type_id_code || '';
                current_order.l10n_latam_document_report_name = order.l10n_latam_document_report_name || '';
                current_order.l10n_ar_cae = order.l10n_ar_cae || '';
                current_order.l10n_ar_cae_due_date = order.l10n_ar_cae_due_date || '';
                current_order.l10n_ar_qr_code_base64 = order.l10n_ar_qr_code_base64 || '';
                current_order.terms_and_conditions = order.terms_and_conditions || '';
                
                // Régimen de Transparencia Fiscal
                if (order.iva_taxes) {
                    // Asegurarnos de que cada elemento de iva_taxes tenga un ID único
                    current_order.iva_taxes = order.iva_taxes.map((tax, index) => {
                        return { ...tax, id: tax.id || `iva_tax_${index}` };
                    });
                } else {
                    current_order.iva_taxes = [];
                }
                
                if (order.other_taxes_total !== undefined) {
                    current_order.other_taxes_total = order.other_taxes_total;
                } else {
                    current_order.other_taxes_total = 0;
                }
                
                // Añadir detalles de impuestos y subtotal si están disponibles
                if (order.subtotal) {
                    current_order.subtotal = order.subtotal;
                }
                
                if (order.detailed_taxes) {
                    // Asegurarnos de que cada elemento de detailed_taxes tenga un ID único
                    current_order.detailed_taxes = order.detailed_taxes.map((tax, index) => {
                        return { ...tax, id: tax.id || `tax_${index}` };
                    });
                } else {
                    current_order.detailed_taxes = [];
                }
            });
        }
        return result;
    },

    // Método para cargar la configuración de facturación automática
    async _processConfig() {
        await super._processConfig(...arguments);
        // Asegurarnos de que la configuración se carga
        this.config.auto_invoice = this.company.auto_invoice || false;
    },
    
    // Sobreescribir el método de crear orden para aplicar auto factura
    add_new_order() {
        const order = super.add_new_order(...arguments);
        if (this.config.auto_invoice) {
            order.set_to_invoice(true);
        }
        return order;
    },
    
    // Sobreescribir el método de seleccionar orden para aplicar auto factura
    set_order(order) {
        super.set_order(...arguments);
        if (order && this.config.auto_invoice) {
            order.set_to_invoice(true);
        }
        return order;
    }
});

patch(Order.prototype, {
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        
        // Verificar que headerData exista
        result.headerData = result.headerData || {};
        
        // Agregar datos de encabezado y configuración
        result.headerData.pos_name = this.pos.config.name || '';
        result.headerData.pos_street = this.pos.config.street || '';
        result.headerData.date = result.date || '';
        
        // Asegurarse de que company existe
        if (this.pos && this.pos.company) {
            result.headerData.receipt_invoice_number = this.pos.company.receipt_invoice_number || false;
            result.receipt_invoice_number = this.pos.company.receipt_invoice_number || false;
        } else {
            result.headerData.receipt_invoice_number = false;
            result.receipt_invoice_number = false;
        }

        // Si hay factura, añadir datos específicos de factura
        if (this.invoice_number) {
            const invoice_letter = this.invoice_number.split(" ")[0]?.substring(3, 4) || '';
            const invoice_number = this.invoice_number.split(" ")[1] || '';
            result.headerData.invoice_number = invoice_number;
            result.headerData.invoice_letter = invoice_letter;
            result.invoice_letter = invoice_letter;

            result.headerData.l10n_latam_document_type_id_code = this.l10n_latam_document_type_id_code || '';
            result.headerData.l10n_latam_document_name = this.l10n_latam_document_type_id_name || '';
            result.headerData.l10n_latam_document_report_name = this.l10n_latam_document_report_name || '';

            result.l10n_latam_document_report_name = this.l10n_latam_document_report_name || '';
            result.l10n_ar_cae = this.l10n_ar_cae || '';
            result.l10n_ar_cae_due_date = this.l10n_ar_cae_due_date || '';
            result.l10n_ar_qr_code_base64 = this.l10n_ar_qr_code_base64 || '';
            result.terms_and_conditions = this.terms_and_conditions || '';
            
            // Régimen de Transparencia Fiscal
            if (this.iva_taxes && this.iva_taxes.length > 0) {
                // Asegurarnos de que cada elemento de iva_taxes tenga un ID único
                result.iva_taxes = this.iva_taxes.map((tax, index) => {
                    return { ...tax, id: tax.id || `iva_tax_${index}` };
                });
            } else {
                result.iva_taxes = [];
            }
            
            if (this.other_taxes_total !== undefined) {
                result.other_taxes_total = this.other_taxes_total;
            } else {
                result.other_taxes_total = 0;
            }
            
            // Transferir datos de impuestos desde el backend
            if (this.subtotal !== undefined && this.subtotal !== null) {
                result.subtotal = this.subtotal;
            } else {
                result.subtotal = 0;
            }
            
            if (this.detailed_taxes && this.detailed_taxes.length > 0) {
                // Asegurarnos de que cada elemento de detailed_taxes tenga un ID único
                result.detailed_taxes = this.detailed_taxes.map((tax, index) => {
                    return { ...tax, id: tax.id || `tax_${index}` };
                });
            } else {
                result.detailed_taxes = [];
            }
        }
        
        // Asegurarse de que total_with_tax esté definido para evitar errores de formateo
        if (result.total_with_tax === undefined || result.total_with_tax === null) {
            result.total_with_tax = 0;
        }

        return result;
    },

    // Cuando se cambia el cliente, aplicar auto factura si está configurado
    set_client(client) {
        const result = super.set_client(...arguments);
        if (this.pos && this.pos.config && this.pos.config.auto_invoice) {
            this.set_to_invoice(true);
        }
        return result;
    },

    // Asegurar que la factura se establezca cuando se crea la orden
    init(obj, options) {
        super.init(...arguments);
        // Aplicamos un pequeño retraso para asegurarnos de que POS esté completamente cargado
        setTimeout(() => {
            if (this.pos && this.pos.config && this.pos.config.auto_invoice) {
                this.set_to_invoice(true);
            }
        }, 100);
    }
});
