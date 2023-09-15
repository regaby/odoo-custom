odoo.define('l10n_ar_pos_einvoice_ticket', function (require) {
    console.log('l10n_ar_pos_einvoice_ticket');
    "use strict";

    var models = require('point_of_sale.models');
    var rpc = require('web.rpc');

    const { PosGlobalState, Order} = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');

    var _super_Order = models.Order.prototype;

    const EinvoicePosGlobalState = (PosGlobalState) => class EinvoicePosGlobalState extends PosGlobalState {

        async _processData(loadedData) {
            await super._processData(...arguments);
            this.l10n_ar_afip_responsibility_type_id = loadedData['res.company'];
            console.log('this.l10n_ar_afip_responsibility_type_id', this.l10n_ar_afip_responsibility_type_id)

        }

        _flush_orders(orders, options) {
            console.log('_flush_orders inherit',orders, options)
            var self = this;
            var res = super._flush_orders(...arguments);
            _.each(orders,function(order){
                if (!order.to_invoice)
                    res.then(function(order_server_id){
                    self.env.services.rpc({
                    model: 'pos.order',
                    method: 'read',
                    args:[order_server_id[0].id, ['account_move']]
                        }).then(function(output){
                            console.log('output', output)
                            console.log('output length', output.length)
                            if(output.length){
                                var invoice_number = output[0]['account_move'][1].split(" ")[1];
                                var invoice_letter = output[0]['account_move'][1].split(" ")[0].substring(3, 4);
                                console.log('invoice_number', invoice_number)
                                console.log('invoice_letter', invoice_letter)
                                self.get_order().invoice_number = invoice_number;
                                self.get_order().invoice_letter = invoice_letter;
                                var account_move = output[0]['account_move'][0]
                                rpc.query({
                                    model: 'account.move',
                                    method: 'search_read',
                                    args: [[['id', '=', account_move]], ['afip_auth_code',
                                                                        'afip_auth_code_due',
                                                                        'afip_qr_code',
                                                                        'l10n_latam_document_type_id',
                                                                        ]],
                                }

                                ).then(function (invoices) {
                                    console.log('invoices', invoices)
                                    self.get_order().afip_qr_code = invoices[0]['afip_qr_code'];
                                    self.get_order().afip_auth_code = invoices[0]['afip_auth_code'];
                                    self.get_order().afip_auth_code_due = invoices[0]['afip_auth_code_due'];
                                    self.get_order().l10n_latam_document_type_id = invoices[0]['l10n_latam_document_type_id'][1].split(" ")[0];
                                    self.get_order().l10n_latam_document_name = invoices[0]['l10n_latam_document_type_id'][1].substr(invoices[0]['l10n_latam_document_type_id'][1].indexOf(" ") + 1);
                                    console.log('self.get_order()', self.get_order())
                                });
                            }
                    })
                    .catch(function(error){
                        return res
                    })
                })
            })
            return res
        }

    }
    Registries.Model.extend(PosGlobalState, EinvoicePosGlobalState);

    const PosOrderNumber = (Order) => class PosOrderNumber extends Order {
        export_for_printing() {
            var receipt = super.export_for_printing(...arguments);
            if(this.invoice_number){
                receipt.invoice_number = this.invoice_number;
            }
            if(this.invoice_letter){
                receipt.invoice_letter = this.invoice_letter;
            }
            if(this.afip_qr_code){
                receipt.afip_qr_code = this.afip_qr_code;
            }
            if(this.afip_auth_code){
                receipt.afip_auth_code = this.afip_auth_code;
            }
            if(this.afip_auth_code_due){
                receipt.afip_auth_code_due = this.afip_auth_code_due;
            }
            if(this.l10n_latam_document_type_id){
                receipt.l10n_latam_document_type_id = this.l10n_latam_document_type_id;
            }
            if(this.l10n_latam_document_name){
                receipt.l10n_latam_document_name = this.l10n_latam_document_name;
            }
            return receipt;
        }
    }
Registries.Model.extend(Order, PosOrderNumber);
})
