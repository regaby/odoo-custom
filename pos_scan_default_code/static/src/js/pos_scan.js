odoo.define('pos_scan_default_code', function (require) {
    "use strict";
var rpc = require('web.rpc');
var models = require('point_of_sale.models');
var DB = require('point_of_sale.DB');
var utils = require('web.utils');
models.load_fields("product.product", ['modelo_articulo']);
var _super = DB.prototype;
DB.include({
    init: function(options){
        this._super.apply(this, arguments);
    },
    add_products: function(products){
        var res = this._super(products);

        if(!products instanceof Array){
            products = [products];
        }
        for(var i = 0, len = products.length; i < len; i++){
            var product = products[i];
            if(product.default_code){
                this.product_by_barcode[product.default_code] = product;
            }
        }
    },
    _product_search_string: function(product){
        var str = product.display_name;
        if (product.barcode) {
            str += '|' + product.barcode;
        }
        if (product.default_code) {
            str += '|' + product.default_code;
        }
        if (product.description) {
            str += '|' + product.description;
        }
        if (product.description_sale) {
            str += '|' + product.description_sale;
        }
        if (product.modelo_articulo) {
            str += '|' + product.modelo_articulo;
        }
        str  = product.id + ':' + str.replace(/:/g,'') + '\n';
        return str;
    },
    });
});
