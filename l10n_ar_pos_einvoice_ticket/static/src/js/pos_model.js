odoo.define('l10n_ar_pos_einvoice_ticket', function (require) {
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var rpc = require('web.rpc');
    var core = require('web.core');
    var qweb = core.qweb;



    var _super_Order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function (attributes, options) {
            _super_Order.initialize.apply(this, arguments);
            if (this.pos.config.pos_auto_invoice) {
                this.to_invoice = true;
            }
        },
        init_from_JSON: function (json) {
            var res = _super_Order.init_from_JSON.apply(this, arguments);
            if (json.to_invoice) {
                this.to_invoice = json.to_invoice;
            }
        }
    });
    // Este metodo es el mas importante para habilitar los campos que se necesitan usar
    // por ejemplo "vat" fue sustituido por main_id_number
    // En v13 se saca main_id_number y se empieza a usar vat


// esto quiere decir que agregamos funcionalidad (EXTEND)
// a traves de la var models



    var _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            // DESDE ACA
            var partner_model = _.find(this.models, function (model) {
                return model.model === 'res.partner';
            });

            partner_model.fields.push('vat');
            partner_model.fields.push('website');
            partner_model.fields.push('l10n_ar_afip_responsibility_type_id');

            _super_PosModel.initialize.apply(this, arguments);

        },

    });

    screens.ReceiptScreenWidget.include({
        print_xml: function () {
            var self = this;
            if (this.pos.config.receipt_invoice_number) {
                self.receipt_data = this.get_receipt_render_env();
                var order = this.pos.get_order();
                return rpc.query({
                    // IMPORTANTISIMO ****************************
                    // DESDE ESTE MODELO SE ESTA IMPORTANDO account_move para relacionar
                    //
                    model: 'pos.order',
                    method: 'search_read',
                    domain: [['pos_reference', '=', order['name']]],
                    fields: ['account_move'],
                }).then(function (orders) {
                    if (orders.length > 0) {
                        if (orders[0]['account_move']) {
                            // el array 1 de Split es el que tiene el nro!
                            var invoice_number = orders[0]['account_move'][1].split(" ")[1];
                            var invoice_letter = orders[0]['account_move'][1].split(" ")[0].substring(3, 4);
                            var account_move = orders[0]['account_move'][0]
                            self.receipt_data['order']['invoice_number'] = invoice_number;
                            self.receipt_data['order']['invoice_letter'] = invoice_letter;
                            //----
                            var company_id = self['pos']['company']['id'];
                            var partner_id = self['pos']['company']['partner_id'][0];
                            rpc.query({
                                 model: 'res.company',
                                 method: 'search_read',
                                 args: [[['id', '=', company_id]], ['l10n_ar_afip_start_date']],
                            }).then(function (company_dict) {
                                self.pos.get_order()['l10n_ar_afip_start_date'] = company_dict[0]['l10n_ar_afip_start_date'];

                                rpc.query({
                                     model: 'res.partner',
                                     method: 'search_read',
                                     args: [[['id', '=', partner_id]], ['vat',
                                                                        'l10n_ar_gross_income_number',
                                                                        'l10n_ar_afip_responsibility_type_id',
                                                                        'street', 'city', 'state_id', 'country_id']],
                                    }

                                 ).then(function (company_partner) {
                                    self.receipt_data['order']['vat'] = company_partner[0]['vat'];
                                    self.receipt_data['order']['l10n_ar_gross_income_number'] = company_partner[0]['l10n_ar_gross_income_number'];
                                    self.receipt_data['order']['l10n_ar_afip_start_date'] = company_partner[0]['l10n_ar_afip_start_date'];
                                    self.receipt_data['order']['l10n_ar_afip_responsibility_type_id'] = company_partner[0]['l10n_ar_afip_responsibility_type_id'][1];
                                    self.receipt_data['order']['street'] = company_partner[0]['street'] + ', ' +
                                                                     company_partner[0]['city'] + ', ' +
                                                                     company_partner[0]['state_id'][1] + ', ' +
                                                                     company_partner[0]['country_id'][1];
                                    //---------
                                    rpc.query({
                                         model: 'account.move',
                                         method: 'search_read',
                                         args: [[['id', '=', account_move]], ['afip_auth_code',
                                                                            'afip_auth_code_due',
                                                                            'afip_barcode',
                                                                            //'afip_barcode_img'
                                                                            ]],
                                        }

                                     ).then(function (invoices) {
                                        self.receipt_data['order']['afip_barcode'] = invoices[0]['afip_barcode'];
                                        self.receipt_data['order']['afip_auth_code'] = invoices[0]['afip_auth_code'];
                                        self.receipt_data['order']['afip_auth_code_due'] = invoices[0]['afip_auth_code_due'];
                                        //self.receipt_data['order']['afip_barcode_img'] = invoices[0]['afip_barcode_img'];
                                        var receipt = qweb.render('XmlReceipt', self.receipt_data);
                                        self.pos.proxy.print_receipt(receipt);
                                     });
                                 });
                            });
                        }
                    }
                });
            } else {
                this._super();
            }
        },
        // CON LA FUNCION RENDER_RECEIPT deben traerse los modelos para poder usar
        // en el recibo
        render_receipt: function () {
            this._super();
            var self = this;
            var order = this.pos.get_order(); // Ok!!

            if (!this.pos.config.iface_print_via_proxy && this.pos.config.receipt_invoice_number && order.is_to_invoice()) {
                var invoiced = new $.Deferred();
                rpc.query({
                    // IMPORTANTISIMO ****************************
                    // DESDE ESTE MODELO SE ESTA IMPORTANDO account_move para relacionar
                    //
                    model: 'pos.order',
                    method: 'search_read',
                    domain: [['pos_reference', '=', order['name']]],
                    // account_move es un campo nativo de pos.order
                    fields: ['account_move']
                }).then(function (orders) {
                    if (orders.length > 0 && orders[0]['account_move'] && orders[0]['account_move'][1]) {
                        var invoice_number = orders[0]['account_move'][1].split(" ")[1];
                        var invoice_letter = orders[0]['account_move'][1].split(" ")[0].substring(3, 4);
                        var account_move = orders[0]['account_move'][0]
                        self.pos.get_order()['invoice_number'] = invoice_number;
                        self.pos.get_order()['invoice_letter'] = invoice_letter;
                        //----
                        var company_id = self['pos']['company']['id'];
                        var partner_id = self['pos']['company']['partner_id'][0];

                        rpc.query({
                             model: 'res.company',
                             method: 'search_read',
                             args: [[['id', '=', company_id]], ['l10n_ar_afip_start_date']],
                            }).then(function (company_dict) {
                             self.pos.get_order()['l10n_ar_afip_start_date'] = company_dict[0]['l10n_ar_afip_start_date'];
                             rpc.query({
                                 model: 'res.partner',
                                 method: 'search_read',
                                 args: [[['id', '=', partner_id]], ['vat',
                                                                    'l10n_ar_gross_income_number',
                                                                    'l10n_ar_afip_responsibility_type_id',
                                                                    'street', 'city', 'state_id', 'country_id']],
                                }

                             ).then(function (company_partner) {
                                self.pos.get_order()['vat'] = company_partner[0]['vat'];
                                self.pos.get_order()['l10n_ar_gross_income_number'] = company_partner[0]['l10n_ar_gross_income_number'];
                                self.pos.get_order()['l10n_ar_afip_responsibility_type_id'] = company_partner[0]['l10n_ar_afip_responsibility_type_id'][1];
                                self.pos.get_order()['street'] = company_partner[0]['street'] + ', ' +
                                                                 company_partner[0]['city'] + ', ' +
                                                                 company_partner[0]['state_id'][1] + ', ' +
                                                                 company_partner[0]['country_id'][1];
                                //---------
                                rpc.query({
                                     model: 'account.move',
                                     method: 'search_read',
                                     args: [[['id', '=', account_move]], ['afip_auth_code',
                                                                        'afip_auth_code_due',
                                                                        'afip_barcode',
                                                                        //'afip_barcode_img'
                                                                        ]],
                                    }

                                 ).then(function (invoices) {
                                    self.pos.get_order()['afip_barcode'] = invoices[0]['afip_barcode'];
                                    self.pos.get_order()['afip_auth_code'] = invoices[0]['afip_auth_code'];
                                    self.pos.get_order()['afip_auth_code_due'] = invoices[0]['afip_auth_code_due'];
                                    //self.pos.get_order()['afip_barcode_img'] = invoices[0]['afip_barcode_img'];
                                    self.$('.pos-receipt-container').html(qweb.render('OrderReceipt', self.get_receipt_render_env()));

                                 });
                             });
                            });
                    }
                    invoiced.resolve();
                }).catch(function (type, error) {
                    invoiced.reject(error);
                });
                return invoiced;
            } else {
                this._super();
            }
        }
    })
});
