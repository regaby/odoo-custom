odoo.define('l10n_ar_pos_fields_partner.PosModel', function (require) {
"use strict";

var core = require('web.core');
    var pos_model = require('point_of_sale.models');
    var pos_chrome = require('point_of_sale.chrome')
    var models = pos_model.PosModel.prototype.models;
    var PosModelSuper = pos_model.PosModel;
    var OrderSuper = pos_model.Order;
    var OrderlineSuper = pos_model.Orderline;
    // var _super_posmodel = models.PosModel.prototype;

    pos_model.load_fields('res.partner', ['main_id_category_id', 'main_id_number', 'afip_responsability_type_id']);

    for(var i=0; i<models.length; i++){
        var model=models[i];
        if(model.model === 'res.partner'){
            console.log('push main_id_category_id', model.fields)
             /*model.fields.push('main_id_category_id');*/
        }
    }

    models.push(
        {
            model: 'res.partner.id_category',
            fields: ['id', 'name'],
            loaded: function (self, category_id) {
                console.log('push id category', category_id)
                for (var i in category_id){
                    self.category_id.push(category_id[i]);
                }
            },
        },
        {
            model: 'afip.responsability.type',
            fields: ['id', 'name'],
            loaded: function (self, responsability_type) {
                console.log('push responsability type', responsability_type)
                for (var i in responsability_type){
                    self.responsability_type.push(responsability_type[i]);
                }
            },
        },

        );

    function get_category_id(category_id, name){
        console.log('get_category_id', category_id, name)
        for(var i in category_id){
            if(category_id[i].name == name){
                return category_id[i].id;
            }
        }
        return false;
    }


    pos_model.PosModel = pos_model.PosModel.extend({
        initialize: function(session, attributes) {

            PosModelSuper.prototype.initialize.call(this, session, attributes)
            this.category_id = [];
            this.responsability_type = [];

        },
    });


});
