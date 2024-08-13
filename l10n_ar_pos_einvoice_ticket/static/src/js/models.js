/** @odoo-module */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { Order } from "@point_of_sale/app/store/models";
import { patch } from "@web/core/utils/patch";

patch(PosStore.prototype, {
    // @Override
    async _flush_orders(orders, options) {
        var self = this;
        var result = await super._flush_orders(...arguments);
        if (Array.isArray(result)) {
            result.forEach((order) => {
                this.get_order().invoice_number = order.invoice_number;
                this.get_order().l10n_latam_document_type_id_name = order.l10n_latam_document_type_id_name;
                this.get_order().l10n_latam_document_type_id_code = order.l10n_latam_document_type_id_code;

                this.get_order().afip_auth_code = order.afip_auth_code;
                this.get_order().afip_auth_code_due = order.afip_auth_code_due;
                this.get_order().texto_modificado_qr = order.texto_modificado_qr;
            });
        }
        return result
    }
});

patch(Order.prototype, {
    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        result['headerData']['pos_name'] = this.pos.config.name;
        result['headerData']['pos_street'] = this.pos.config.street;
        result['headerData']['date'] = result['date'];
        result['headerData']['receipt_invoice_number'] = this.pos.company.receipt_invoice_number;
        result['receipt_invoice_number'] = this.pos.company.receipt_invoice_number;
        if(this.invoice_number){

            result['headerData']['invoice_number'] = this.invoice_number.split(" ")[1];
            result['headerData']['invoice_letter'] = this.invoice_number.split(" ")[0].substring(3, 4);
            result['headerData']['l10n_latam_document_type_id'] = this.l10n_latam_document_type_id_code;
            result['headerData']['l10n_latam_document_name'] = this.l10n_latam_document_type_id_name;
            
            result['afip_auth_code'] = this.afip_auth_code;
            result['afip_auth_code_due'] = this.afip_auth_code_due;
            result['texto_modificado_qr'] = this.texto_modificado_qr;
            
            result['invoice_letter'] = this.invoice_number.split(" ")[0].substring(3, 4);

        }
        return result;
    },
});
