/** @odoo-module */

import { Reactive } from "@web/core/utils/reactive";
import { startPosApp } from "@point_of_sale/app/store/pos_app";
import { patch } from "@web/core/utils/patch";
import { Order } from "@point_of_sale/app/store/models";

// Función de inicialización que se ejecuta una vez cargado el POS
function setupAutoInvoice(pos) {
    // Verificar si la auto-factura está habilitada
    if (pos && pos.company && pos.company.auto_invoice) {
        // Activar la facturación en la orden actual
        const currentOrder = pos.get_order();
        if (currentOrder) {
            currentOrder.to_invoice = true;
            if (typeof currentOrder.set_to_invoice === 'function') {
                currentOrder.set_to_invoice(true);
            }
        }
        
        // Añadir un observador para nuevas órdenes
        const originalCreate = pos.add_new_order;
        pos.add_new_order = function() {
            const order = originalCreate.apply(this, arguments);
            if (order && this.company.auto_invoice) {
                order.to_invoice = true;
                if (typeof order.set_to_invoice === 'function') {
                    order.set_to_invoice(true);
                }
            }
            return order;
        };
    }
}

// Registramos una función para inicializar después de que el POS esté listo
patch(Reactive.prototype, {
    async setup() {
        await super.setup(...arguments);
        // Esperar a que el POS esté listo
        if (this.env && this.env.services && this.env.services.pos) {
            setupAutoInvoice(this.env.services.pos);
        }
    }
});
