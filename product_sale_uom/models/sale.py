# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.addons import decimal_precision as dp

class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    @api.multi
    @api.onchange('product_id')
    def product_id_change(self):
        res = super(SaleOrderLine, self).product_id_change()
        vals = {}
        vals['product_uom_original'] = self.product_id.uom_sale_id
        vals['product_uom_qty_original'] = 1.0
        self.update(vals)
        return res

    @api.multi
    @api.onchange('product_uom_original', 'product_uom_qty_original')
    def uom_original_change(self):
        ## Debo buscar la relacion udm y actualizar campos product_uom y product_uom_qty
        if not self.product_id:
            return {'domain': {'product_uom_original': []}}
        vals = {}
        domain = {'product_uom_original': [('category_id', '=', self.product_id.uom_sale_id.category_id.id)]}
        vals['product_uom'] = self.product_id.uom_id
        vals['product_uom_qty'] = 1 * self.product_uom_original.factor_inv * self.product_uom_qty_original

        self.update(vals)

        result = {'domain': domain}
        return result

    product_uom_original = fields.Many2one('product.uom', 'Unit of Measure Sale', required=False)
    product_uom_qty_original = fields.Float(string='Quantity', digits=dp.get_precision('Product Unit of Measure'), required=False, default=1.0)


    @api.multi
    def _prepare_invoice_line(self, qty):
        res = super(SaleOrderLine, self)._prepare_invoice_line(qty)
        res['product_uom_original'] = self.product_uom_original.id
        res['product_qty_original'] = self.product_uom_qty_original
        return res
