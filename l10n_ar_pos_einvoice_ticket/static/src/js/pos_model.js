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

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');

    const PosInvPaymentScreen = (PaymentScreen) =>
        class extends PaymentScreen {
            constructor() {
                super(...arguments);
            }

            async _finalizeValidation() {
                var self = this;
                if (this.currentOrder.is_paid_with_cash() && this.env.pos.config.iface_cashdrawer) {
                    this.env.pos.proxy.printer.open_cashbox();
                }
                var domain = [['pos_reference', '=', this.currentOrder['name']]]
                var fields = ['account_move'];

                this.currentOrder.initialize_validation_date();
                this.currentOrder.finalized = true;

                let syncedOrderBackendIds = [];

                try {
                    if (this.currentOrder.is_to_invoice()) {
                        syncedOrderBackendIds = await this.env.pos.push_and_invoice_order(
                            this.currentOrder
                        );
                    } else {
                        syncedOrderBackendIds = await this.env.pos.push_single_order(this.currentOrder);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        throw error;
                    } else {
                        await this._handlePushOrderError(error);
                    }
                }
                if (syncedOrderBackendIds.length && this.currentOrder.wait_for_push_order()) {
                    const result = await this._postPushOrderResolve(
                        this.currentOrder,
                        syncedOrderBackendIds
                    );
                    if (!result) {
                        await this.showPopup('ErrorPopup', {
                            title: 'Error: no internet connection.',
                            body: error,
                        });
                    }
                }
                if (this.currentOrder.is_to_invoice()) {
                    this.rpc({
                        model: 'pos.order',
                        method: 'search_read',
                        args: [domain, fields],
                    })
                    .then(function (output) {
                        var invoice_number = output[0]['account_move'][1].split(" ")[1];
                        var invoice_letter = output[0]['account_move'][1].split(" ")[0].substring(3, 4);
                        self.currentOrder.invoice_number = invoice_number;
                        self.currentOrder.invoice_letter = invoice_letter;
                        var account_move = output[0]['account_move'][0]
                        rpc.query({
                            model: 'account.move',
                            method: 'search_read',
                            args: [[['id', '=', account_move]], ['afip_auth_code',
                                                               'afip_auth_code_due',
                                                               'texto_modificado_qr',
                                                               'l10n_latam_document_type_id',
                                                               ]],
                           }

                        ).then(function (invoices) {
                            self.currentOrder.texto_modificado_qr = invoices[0]['texto_modificado_qr'];
                            self.currentOrder.afip_auth_code = invoices[0]['afip_auth_code'];
                            self.currentOrder.afip_auth_code_due = invoices[0]['afip_auth_code_due'];
                            self.currentOrder.l10n_latam_document_type_id = invoices[0]['l10n_latam_document_type_id'][1].split(" ")[0];
                            self.showScreen(self.nextScreen);
                        });


                    })
                }
                else{
                    this.showScreen(this.nextScreen);
                }

                // If we succeeded in syncing the current order, and
                // there are still other orders that are left unsynced,
                // we ask the user if he is willing to wait and sync them.
                if (syncedOrderBackendIds.length && this.env.pos.db.get_orders().length) {
                    const { confirmed } = await this.showPopup('ConfirmPopup', {
                        title: this.env._t('Remaining unsynced orders'),
                        body: this.env._t(
                            'There are unsynced orders. Do you want to sync these orders?'
                        ),
                    });
                    if (confirmed) {
                        // NOTE: Not yet sure if this should be awaited or not.
                        // If awaited, some operations like changing screen
                        // might not work.
                        this.env.pos.push_orders();
                    }
                }
            }
        };

    Registries.Component.extend(PaymentScreen, PosInvPaymentScreen);

    return PosInvPaymentScreen;

});
