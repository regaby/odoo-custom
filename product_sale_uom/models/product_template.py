# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.addons import decimal_precision as dp
from odoo.tools.float_utils import float_round

class ProductTemplate(models.Model):
    _inherit = "product.template"

    def _get_default_uom_id(self):
        return self.env["product.uom"].search([], limit=1, order='id').id

    uom_sale_id = fields.Many2one(
        'product.uom', 'Sale Unit of Measure',
        default=_get_default_uom_id, required=True,
        help="Default Unit of Measure used for sale orders. It must be in the same category than the default unit of measure.")

    uom_sale_qty_available = fields.Float(
        string='Quantity On Hand (2Unit)',
        compute='_compute_uom_sale_qty_available',
        digits=dp.get_precision('Product Unit of Measure'),
    )

    def _compute_uom_sale_qty_available(self):
        for product in self.filtered('uom_sale_id'):
            qty = product.qty_available / (
                product.uom_sale_id.factor_inv or 1.0)
            product.uom_sale_qty_available = float_round(
                qty, precision_rounding=product.uom_id.rounding)


