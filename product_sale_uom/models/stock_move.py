# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.addons import decimal_precision as dp

class StockMove(models.Model):
    _inherit = "stock.move"

    product_uom_original = fields.Many2one('product.uom', 'Unit of Measure Sale', required=False)
    product_qty_original = fields.Float(string='Quantity', digits=dp.get_precision('Product Unit of Measure'), required=False)

    @api.model
    def create(self, vals):
        """
        """
        if 'sale_line_id' in vals.keys():
            order_line = self.env['sale.order.line'].browse(vals['sale_line_id'])
            vals['product_uom_original'] = order_line.product_uom_original.id
            vals['product_qty_original'] = order_line.product_uom_qty_original
        move = super(StockMove, self).create(vals)
        return move







