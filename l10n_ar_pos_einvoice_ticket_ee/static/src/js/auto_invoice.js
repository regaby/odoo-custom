/** @odoo-module */

import { startPosApp } from "@point_of_sale/app/store/pos_app";
import { patch } from "@web/core/utils/patch";
import { useBus } from "@web/core/utils/hooks";
import { Order } from "@point_of_sale/app/store/models";

// Sobrescribimos el método para crear órdenes y forzar la facturación
const originalStartPosApp = startPosApp;

patch(window, {
    startPosApp(env) {
        const result = originalStartPosApp(env);
        
        // Hook para establecer la facturación automática después de cargar el POS
        const pos = env.services.pos;
        if (pos && pos.company && pos.company.auto_invoice) {
            // Forzar facturación en la orden actual
            const currentOrder = pos.get_order();
            if (currentOrder) {
                currentOrder.to_invoice = true;
                // También establecer usando el método oficial
                if (typeof currentOrder.set_to_invoice === 'function') {
                    currentOrder.set_to_invoice(true);
                }
            }
            
            // Modificar el prototipo de Order para asegurar que todas las órdenes nuevas tengan facturación
            const originalInit = Order.prototype.init;
            Order.prototype.init = function () {
                originalInit.apply(this, arguments);
                if (this.pos && this.pos.company && this.pos.company.auto_invoice) {
                    this.to_invoice = true;
                }
            };
        }
        
        return result;
    }
});
