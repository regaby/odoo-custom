# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class ProductTemplate(models.Model):
    _inherit = "product.template"

    def _get_default_uom_id(self):
        return self.env["product.uom"].search([], limit=1, order='id').id

    uom_sale_id = fields.Many2one(
        'product.uom', 'Sale Unit of Measure',
        default=_get_default_uom_id, required=True,
        help="Default Unit of Measure used for sale orders. It must be in the same category than the default unit of measure.")


