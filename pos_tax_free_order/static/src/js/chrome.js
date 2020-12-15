odoo.define('pos_tax_free_order.chrome', function (require) {
"use strict";

var chrome = require('point_of_sale.chrome');

chrome.OrderSelectorWidget.include({
	order_click_handler: function(event,$el) {
		this._super(event,$el);
		var pos_order = this.pos.get_order();
		if (pos_order!==null && pos_order!==undefined && pos_order.is_tax_free_order){
			$('.order-apply-tax').show();
    		$('.order-tax-free').hide();
		}
		else{
			$('.order-apply-tax').hide();
    		$('.order-tax-free').show();
		}
    },
    neworder_click_handler: function(event, $el) {
    	this._super(event, $el);
    	var pos_order = this.pos.get_order();
		if (pos_order!==null && pos_order!==undefined && pos_order.is_tax_free_order){
			$('.order-apply-tax').show();
    		$('.order-tax-free').hide();
		}
		else{
			$('.order-apply-tax').hide();
    		$('.order-tax-free').show();
		}
    },
});

});
