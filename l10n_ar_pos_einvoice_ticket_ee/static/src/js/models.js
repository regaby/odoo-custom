/** @odoo-module */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { Order } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";

// Patch para el PaymentScreen para establecer la facturación automática
patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        
        // Aplicar facturación automática después de la inicialización
        setTimeout(() => {
            const pos = this.env.services.pos;
            if (pos && pos.company && pos.company.auto_invoice) {
                const order = pos.get_order();
                if (order) {
                    // Establecer la propiedad directamente para evitar problemas con el método
                    order.to_invoice = true;
                    
                    // Forzar actualización de la interfaz
                    this.render(true);
                }
            }
        }, 300);
    }
});

// Patch para PosStore
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
                
                if (order.subtotal) {
                    current_order.subtotal = order.subtotal;
                }
                
                if (order.detailed_taxes) {
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
    
    // Lo importante: actualizar el método add_new_order para establecer la facturación
    add_new_order() {
        const order = super.add_new_order(...arguments);
        // Aplicar auto-factura si está configurado
        if (this.company && this.company.auto_invoice) {
            // Usar un pequeño retraso para asegurar que la UI esté lista
            setTimeout(() => {
                order.to_invoice = true;
                // También usar el método estándar si está disponible
                if (typeof order.set_to_invoice === 'function') {
                    order.set_to_invoice(true);
                }
            }, 100);
        }
        return order;
    }
});

// Patch para Order
patch(Order.prototype, {
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        
        result.headerData = result.headerData || {};
        
        result.headerData.pos_name = this.pos.config.name || '';
        result.headerData.pos_street = this.pos.config.street || '';
        result.headerData.date = result.date || '';
        
        if (this.pos && this.pos.company) {
            result.headerData.receipt_invoice_number = this.pos.company.receipt_invoice_number || false;
            result.receipt_invoice_number = this.pos.company.receipt_invoice_number || false;
        } else {
            result.headerData.receipt_invoice_number = false;
            result.receipt_invoice_number = false;
        }

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
            
            if (this.iva_taxes && this.iva_taxes.length > 0) {
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
            
            if (this.subtotal !== undefined && this.subtotal !== null) {
                result.subtotal = this.subtotal;
            } else {
                result.subtotal = 0;
            }
            
            if (this.detailed_taxes && this.detailed_taxes.length > 0) {
                result.detailed_taxes = this.detailed_taxes.map((tax, index) => {
                    return { ...tax, id: tax.id || `tax_${index}` };
                });
            } else {
                result.detailed_taxes = [];
            }
        }
        
        if (result.total_with_tax === undefined || result.total_with_tax === null) {
            result.total_with_tax = 0;
        }

        return result;
    },
    
    // Método esencial: modificamos `init` para aplicar automáticamente la facturación
    init(obj, options) {
        super.init(...arguments);
        
        // Usado para detectar cambios en la orden y aplicar auto-facturación
        this._setupAutoInvoiceHook();
    },
    
    // Nuevo método para aplicar auto-facturación
    _setupAutoInvoiceHook() {
        // Usamos un timeout para asegurar que POS esté completamente cargado
        setTimeout(() => {
            if (this.pos && this.pos.company && this.pos.company.auto_invoice) {
                // Establecer directamente la propiedad
                this.to_invoice = true;
                
                // También usar el método si está disponible
                if (typeof this.set_to_invoice === 'function') {
                    this.set_to_invoice(true);
                }
            }
        }, 100);
    },
    
    // También aplicar auto-facturación cuando se cambia el cliente
    set_client(client) {
        const result = super.set_client(...arguments);
        this._setupAutoInvoiceHook();
        return result;
    }
});
