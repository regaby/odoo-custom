odoo.define('l10n_ar_pos_einvoice_ticket', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var rpc = require('web.rpc');
    models.load_fields('res.partner', ['l10n_ar_afip_responsibility_type_id','l10n_latam_identification_type_id']);
    models.load_fields('res.company', [
        'l10n_ar_afip_start_date',
        'l10n_ar_gross_income_number',
        'l10n_ar_afip_responsibility_type_id',
        'street',
        'city',
        'state_id',
        'country_id',
    ]);

    var pos_model = require("point_of_sale.models");
    var SuperPosModel = pos_model.PosModel.prototype;

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');

    var _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({

         renderElement: function() {
            var self = this;
            this._super();

            if (this.pos.config.pos_auto_invoice) {
               this.$('.js_invoice').addClass('oe_hidden');
            }
        },


        initialize: function (attributes, options) {
            _super_Order.initialize.apply(this, arguments);
            if (this.pos.config.pos_auto_invoice) {
                this.to_invoice = true;
            }
            if (this.pos.config.default_partner_id) {
            	this.set_client(this.pos.db.get_partner_by_id(this.pos.config.default_partner_id[0]));
            }
        },
        init_from_JSON: function (json) {
            var res = _super_Order.init_from_JSON.apply(this, arguments);
            if (json.to_invoice) {
                this.to_invoice = json.to_invoice;

            }
        }
    });

    pos_model.PosModel = pos_model.PosModel.extend({

        _flush_orders: function(orders, options) {

            var self = this;
            var result, data;
            result = data = SuperPosModel._flush_orders.call(this,orders, options)
            _.each(orders,function(order){
                if (order.to_invoice)
                var order = self.env.pos.get_order();
                data.then(function(order_server_id){
                    var domain = [['pos_reference', '=', order['name']]]
                    var fields = ['account_move'];


                    rpc.query({
                        model: 'pos.order',
                        method: 'search_read',
                        args: [domain, fields],
                    }).then(function(output){
                        var invoice_number = output[0]['account_move'][1].split(" ")[1];
                        var invoice_letter = output[0]['account_move'][1].split(" ")[0].substring(3, 4);
                        self.get_order().invoice_number = invoice_number;
                        self.get_order().invoice_letter = invoice_letter;
                        var account_move = output[0]['account_move'][0]
                        rpc.query({
                            model: 'account.move',
                            method: 'search_read',
                            args: [[['id', '=', account_move]], ['l10n_ar_afip_auth_code',
                                                                 'l10n_ar_afip_auth_code_due',
                                                                 'l10n_ar_afip_qr_code',
                                                                 'l10n_latam_document_type_id',
                                                                ]],
                           }

                        ).then(function (invoices) {
                            self.get_order().l10n_ar_afip_qr_code = invoices[0]['l10n_ar_afip_qr_code'];
                            self.get_order().l10n_ar_afip_auth_code = invoices[0]['l10n_ar_afip_auth_code'];
                            self.get_order().l10n_ar_afip_auth_code_due = invoices[0]['l10n_ar_afip_auth_code_due'];
                            self.get_order().l10n_latam_document_type_id = invoices[0]['l10n_latam_document_type_id'][1].split(" ")[0];
                            self.get_order().l10n_latam_document_name = invoices[0]['l10n_latam_document_type_id'][1].substr(invoices[0]['l10n_latam_document_type_id'][1].indexOf(" ") + 1);
                        });
                    }).catch(function(error){
                        return result
                    })
                })
            })
            return result

        },

    })

});
