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

// esto quiere decir que agregamos funcionalidad (EXTEND)
// a traves de la var models

    var _super_PosModel = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            // DESDE ACA
            var partner_model = _.find(this.models, function (model) {
                return model.model === 'res.partner';
            });

            partner_model.fields.push('main_id_number');
            partner_model.fields.push('website');
            partner_model.fields.push('afip_responsability_type_id');

            /*var factura_model = _.find(this.models, function (model) {
                return model.model === 'account.invoice';
            });

            factura_model.fields.push('afip_auth_code');*/

            _super_PosModel.initialize.apply(this, arguments);

        },

    });

    screens.ReceiptScreenWidget.include({
        print_xml: function () {
            console.log('print_xml');
            var self = this;
            if (this.pos.config.receipt_invoice_number) {
                self.receipt_data = this.get_receipt_render_env();
                var order = this.pos.get_order();
                return rpc.query({
                    // IMPORTANTISIMO ****************************
                    // DESDE ESTE MODELO SE ESTA IMPORTANDO invoice_id para relacionar
                    //
                    model: 'pos.order',
                    method: 'search_read',
                    domain: [['pos_reference', '=', order['name']]],
                    fields: ['invoice_id'],
                }).then(function (orders) {
                    console.log('orders', orders);
                    if (orders.length > 0) {
                        if (orders[0]['invoice_id']) {
                            // el array 1 de Split es el que tiene el nro!
                            var invoice_number = orders[0]['invoice_id'][1].split(" ")[1];
                            var invoice_letter = orders[0]['invoice_id'][1].split(" ")[0].substring(3, 4);
                            var invoice_id = orders[0]['invoice_id'][0]
                            self.receipt_data['order']['invoice_number'] = invoice_number;
                            self.receipt_data['order']['invoice_letter'] = invoice_letter;
                            //----
                            var partner_id = self['pos']['company']['partner_id'][0];
                            rpc.query({
                                 model: 'res.partner',
                                 method: 'search_read',
                                 args: [[['id', '=', partner_id]], ['start_date',
                                                                    'main_id_number',
                                                                    'gross_income_number',
                                                                    'afip_responsability_type_id',
                                                                    'street', 'city', 'state_id', 'country_id']],
                                }

                             ).then(function (company_partner) {
                                self.receipt_data['order']['main_id_number'] = company_partner[0]['main_id_number'];
                                self.receipt_data['order']['gross_income_number'] = company_partner[0]['gross_income_number'];
                                self.receipt_data['order']['start_date'] = company_partner[0]['start_date'];
                                self.receipt_data['order']['afip_responsability_type_id'] = company_partner[0]['afip_responsability_type_id'][1];
                                self.receipt_data['order']['street'] = company_partner[0]['street'] + ', ' +
                                                                 company_partner[0]['city'] + ', ' +
                                                                 company_partner[0]['state_id'][1] + ', ' +
                                                                 company_partner[0]['country_id'][1];
                                //---------
                                rpc.query({
                                     model: 'account.invoice',
                                     method: 'search_read',
                                     args: [[['id', '=', invoice_id]], ['afip_auth_code',
                                                                        'afip_cae_due',
                                                                        'afip_barcode',
                                                                        'afip_barcode_img',
                                                                        'afip_qr_code_img',
                                                                        'document_type_id']],
                                    }

                                 ).then(function (invoices) {
                                    self.receipt_data['order']['afip_barcode'] = invoices[0]['afip_barcode'];
                                    self.receipt_data['order']['afip_auth_code'] = invoices[0]['afip_auth_code'];
                                    self.receipt_data['order']['afip_cae_due'] = invoices[0]['afip_cae_due'];
                                    self.receipt_data['order']['afip_barcode_img'] = invoices[0]['afip_barcode_img'];
                                    self.receipt_data['order']['afip_qr_code_img'] = invoices[0]['afip_qr_code_img'];
                                    self.receipt_data['order']['document_type_id'] = invoices[0]['document_type_id'][1].split(" ")[0];

                                    console.log('self.receipt_data', self.receipt_data);
                                    var receipt = qweb.render('XmlReceipt', self.receipt_data);
                                    self.pos.proxy.print_receipt(receipt);

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
            console.log('render_receipt');
            this._super();
            var self = this;
            var order = this.pos.get_order(); // Ok!!
            console.log('iface_print_via_proxy', this.pos.config.iface_print_via_proxy);
            console.log('receipt_invoice_number', this.pos.config.receipt_invoice_number);
            console.log('is_to_invoice', order.is_to_invoice());

            if (!this.pos.config.iface_print_via_proxy && this.pos.config.receipt_invoice_number && order.is_to_invoice()) {
                var invoiced = new $.Deferred();
                rpc.query({
                    // IMPORTANTISIMO ****************************
                    // DESDE ESTE MODELO SE ESTA IMPORTANDO invoice_id para relacionar
                    //
                    model: 'pos.order',
                    method: 'search_read',
                    domain: [['pos_reference', '=', order['name']]],
                    // invoice_id es un campo nativo de pos.order
                    fields: ['invoice_id']
                }).then(function (orders) {
                    console.log('orders', orders);
                    if (orders.length > 0 && orders[0]['invoice_id'] && orders[0]['invoice_id'][1]) {
                        var invoice_number = orders[0]['invoice_id'][1].split(" ")[1];
                        var invoice_letter = orders[0]['invoice_id'][1].split(" ")[0].substring(3, 4);
                        var invoice_id = orders[0]['invoice_id'][0]
                        self.pos.get_order()['invoice_number'] = invoice_number;
                        self.pos.get_order()['invoice_letter'] = invoice_letter;
                        //----
                        var partner_id = self['pos']['company']['partner_id'][0];
                        rpc.query({
                             model: 'res.partner',
                             method: 'search_read',
                             args: [[['id', '=', partner_id]], ['start_date',
                                                                'main_id_number',
                                                                'gross_income_number',
                                                                'afip_responsability_type_id',
                                                                'street', 'city', 'state_id', 'country_id']],
                            }

                         ).then(function (company_partner) {
                            self.pos.get_order()['main_id_number'] = company_partner[0]['main_id_number'];
                            self.pos.get_order()['gross_income_number'] = company_partner[0]['gross_income_number'];
                            self.pos.get_order()['start_date'] = company_partner[0]['start_date'];
                            self.pos.get_order()['afip_responsability_type_id'] = company_partner[0]['afip_responsability_type_id'][1];
                            self.pos.get_order()['street'] = company_partner[0]['street'] + ', ' +
                                                             company_partner[0]['city'] + ', ' +
                                                             company_partner[0]['state_id'][1] + ', ' +
                                                             company_partner[0]['country_id'][1];
                            //---------
                            rpc.query({
                                 model: 'account.invoice',
                                 method: 'search_read',
                                 args: [[['id', '=', invoice_id]], ['afip_auth_code',
                                                                    'afip_cae_due',
                                                                    'afip_barcode',
                                                                    'afip_barcode_img',
                                                                    'afip_qr_code_img',
                                                                    'document_type_id']],
                                }

                             ).then(function (invoices) {
                                self.pos.get_order()['afip_barcode'] = invoices[0]['afip_barcode'];
                                self.pos.get_order()['afip_auth_code'] = invoices[0]['afip_auth_code'];
                                self.pos.get_order()['afip_cae_due'] = invoices[0]['afip_cae_due'];
                                self.pos.get_order()['afip_barcode_img'] = invoices[0]['afip_barcode_img'];
                                self.pos.get_order()['afip_qr_code_img'] = invoices[0]['afip_qr_code_img'];
                                self.pos.get_order()['document_type_id'] = invoices[0]['document_type_id'][1].split(" ")[0];

                                self.$('.pos-receipt-container').html(qweb.render('PosTicket', self.get_receipt_render_env()));

                             });

                         });

                        console.log('N° de Factura Impreso ' + invoice_number );

                    }
                    invoiced.resolve();
                }).fail(function (type, error) {
                    invoiced.reject(error);
                });
                return invoiced;
            } else {
                this._super();
            }
        }
    })
});
