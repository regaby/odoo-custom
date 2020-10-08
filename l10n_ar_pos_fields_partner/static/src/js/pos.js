odoo.define('l10n_ar_pos_fields_partner.PosModel', function (require) {
"use strict";

    //var core = require('web.core');
    var pos_model = require('point_of_sale.models');
    //var pos_chrome = require('point_of_sale.chrome')
    var models = pos_model.PosModel.prototype.models;
    var PosModelSuper = pos_model.PosModel;
    var screens = require('point_of_sale.screens');
    var core = require('web.core');
    var _t = core._t;
    //var OrderSuper = pos_model.Order;
    //var OrderlineSuper = pos_model.Orderline;

    pos_model.load_fields('res.partner', ['l10n_latam_identification_type_id',
                                          'l10n_ar_afip_responsibility_type_id']);

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

    screens.ClientListScreenWidget.include({
        save_client_details: function (partner) {
            var self = this;
            var fields = {};
            this.$('.client-details-contents .detail').each(function(idx,el){
                if (self.integer_client_details.includes(el.name)){
                    var parsed_value = parseInt(el.value, 10);
                    if (isNaN(parsed_value)){
                        fields[el.name] = false;
                    }
                    else{
                        fields[el.name] = parsed_value
                    }
                }
                else{
                    fields[el.name] = el.value || false;
                }
            });
            // si es responsable inscripto y tipo doc cuit, vat is required
            if (!fields.vat && fields.l10n_ar_afip_responsibility_type_id == '1' ) {
                this.gui.show_popup('error',_t('El campo CUIT (NIF) es requerido.'));
                return;
            }
            if (fields.l10n_latam_identification_type_id != '4' && fields.l10n_ar_afip_responsibility_type_id == '1' ) {
                this.gui.show_popup('error',_t('Seleccione Tipo Doc. CUIT'));
                return;
            }
            this._super(partner);
        },

    });


});
