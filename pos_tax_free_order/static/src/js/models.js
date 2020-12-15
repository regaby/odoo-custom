odoo.define('pos_tax_free_order.models', function (require) {
"use strict";
	var screens = require('point_of_sale.screens');
	var models = require('point_of_sale.models');
	var PosBaseWidget = require('point_of_sale.BaseWidget');
	models.load_fields("pos.order", "is_tax_free_order");
	
	screens.ReceiptScreenWidget.include({
		click_next: function() {
			this._super();
			this.getParent().$('.order-tax-free').show();
			this.getParent().$('.order-apply-tax').hide();
		}
	});
	
	var ActionTaxFreeApplyTaxWidget = PosBaseWidget.extend({
	    template: 'ActionTaxFreeApplyTaxWidget',
	    renderElement: function() {
	        var self = this;
	        this._super();
	        this.$('.order-tax-free').click(function(){
	        	var pos_order = self.pos.get_order();
		    	if (pos_order!==null && pos_order!==undefined){
		    		self.$('.order-apply-tax').show();
		    		self.$('.order-tax-free').hide();
		    		pos_order.is_tax_free_order=true;
		    		var orderlines = pos_order.get_orderlines(); 
		    		$.each(orderlines,function(index){
		    			var line = orderlines[index];
		    			line.trigger('change',line);
		    		})
		    	}
	        });
	        this.$('.order-apply-tax').click(function(){
	        	var pos_order = self.pos.get_order();
		    	if (pos_order!==null && pos_order!==undefined){
		    		self.$('.order-apply-tax').hide();
		    		self.$('.order-tax-free').show();
		    		pos_order.is_tax_free_order=false;
		    		var orderlines = pos_order.get_orderlines(); 
		    		$.each(orderlines,function(index){
		    			var line = orderlines[index];
		    			line.trigger('change',line);
		    		})
		    	}
	        });
	        var pos_order = self.pos.get_order();
	        if (pos_order!==null && pos_order!==undefined && pos_order.is_tax_free_order){
	        	self.$('.order-apply-tax').show();
	    		self.$('.order-tax-free').hide();
	        }
	        else{
	        	self.$('.order-apply-tax').hide();
	    		self.$('.order-tax-free').show();
	        }
	    }
	});
	screens.ProductScreenWidget.include({
		start: function(){
			this.taxfreeapply = new ActionTaxFreeApplyTaxWidget(this,{});
	        this.taxfreeapply.replace(this.$('.placeholder-ActionTaxFreeApplyTaxWidget'));
	        this._super();
		}
	});
	
	var _super_order_line = models.Orderline.prototype;
	models.Orderline = models.Orderline.extend({
		get_taxes: function(){
			if (this.order.is_tax_free_order){
				return [];
			}
			var taxes = _super_order_line.get_taxes.apply(this,arguments);
			return taxes;
		},
		get_applicable_taxes: function(){
			if (this.order.is_tax_free_order){
				return [];
			}
			var taxes = _super_order_line.get_applicable_taxes.apply(this,arguments);
			return taxes;
		},
		compute_all: function(taxes, price_unit, quantity, currency_rounding, no_map_tax){
			if (this.order.is_tax_free_order){
				arguments[0] = []
			}
			return _super_order_line.compute_all.apply(this,arguments);
		},
	});
	
	var _super_order = models.Order.prototype;
	models.Order = models.Order.extend({
		init_from_JSON: function(json) {
			_super_order.init_from_JSON.apply(this,arguments);
			this.is_tax_free_order=json.is_tax_free_order;
		},
		export_for_printing: function(){
	        var json = _super_order.export_for_printing.apply(this,arguments);
	        json.is_tax_free_order=this.is_tax_free_order;
	        
	        return json;
	    },
	    export_as_JSON: function(){
	        var json = _super_order.export_as_JSON.apply(this,arguments);
	        json.is_tax_free_order = this.is_tax_free_order;
	        
	        return json;
	    },
	});
});