odoo.define('l10n_ar_pos_fields_partner.PosModel', function (require) {
"use strict";

    const ClientListScreen = require('point_of_sale.ClientListScreen');
    const Registries = require('point_of_sale.Registries');
    const pos_model = require('point_of_sale.models');
    var models = pos_model.PosModel.prototype.models;
    var PosModelSuper = pos_model.PosModel;

    pos_model.load_fields('res.partner',
    [
        'l10n_latam_identification_type_id',
        'l10n_ar_afip_responsibility_type_id'
    ]);

    models.push(
        {
            model: 'l10n_latam.identification.type',
            fields: ['id', 'name'],
            loaded: function (self, category_id) {
                for (var i in category_id){
                    self.category_id.push(category_id[i]);
                }
            },
        },
        {
            model: 'l10n_ar.afip.responsibility.type',
            fields: ['id', 'name'],
            loaded: function (self, responsability_type) {
                for (var i in responsability_type){
                    self.responsability_type.push(responsability_type[i]);
                }
            },
        },

        );

    pos_model.PosModel = pos_model.PosModel.extend({
        initialize: function(session, attributes) {

            PosModelSuper.prototype.initialize.call(this, session, attributes)
            this.category_id = [];
            this.responsability_type = [];

        },
    });

    const PosClientListScreen = (ClientListScreen) =>
        class extends ClientListScreen {

            async saveChanges(event) {
                var self = this;
                let fields = event.detail.processedChanges;
                // si es responsable inscripto, vat is required
                if (!fields.vat && fields.l10n_ar_afip_responsibility_type_id == '1' ) {
                    await this.showPopup('ErrorPopup', {
                        title: this.env._t('Falta CUIT'),
                        body: this.env._t('El campo CUIT (NIF) es requerido.'),
                    });
                    return;
                }
                // si es responsable inscripto, el tipo de documento debe ser cuit
                if (fields.l10n_latam_identification_type_id != '4' && fields.l10n_ar_afip_responsibility_type_id == '1' ) {
                    await this.showPopup('ErrorPopup', {
                        title: this.env._t('Falta CUIT'),
                        body: this.env._t('Seleccione Tipo Doc. CUIT'),
                    });
                    return;
                }
                return super.saveChanges(event);
            }

        }
        Registries.Component.extend(ClientListScreen, PosClientListScreen);

        return ClientListScreen;

});
