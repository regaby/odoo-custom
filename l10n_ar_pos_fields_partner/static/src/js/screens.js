odoo.define('pos_fields_partner.screens', function (require) {
"use strict";

var PosBaseWidget = require('point_of_sale.BaseWidget');
var gui = require('point_of_sale.gui');
var models = require('point_of_sale.models');
var core = require('web.core');
var Model = require('web.DataModel');
var utils = require('web.utils');
var formats = require('web.formats');

var QWeb = core.qweb;
var _t = core._t;

var round_pr = utils.round_precision;

 var ClientListScreenWidget = ScreenWidget.extend({
    template: 'ClientListScreenWidget',

    init: function(parent, options){
        this._super(parent, options);
        this.partner_cache = new DomCache();
    },
    show: function(){
        var self = this;
        this._super();


        this.$('.new-customer').click(function(){
            self.display_client_details('edit',{
                'category_id': self.pos.category_id,
            });
        });
    },


    });  

  






    
});
