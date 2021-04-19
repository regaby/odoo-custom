# -*- coding: utf-8 -*-

from odoo import api, fields, models
import odoo.addons.decimal_precision as dp
from odoo.exceptions import ValidationError


class PosOrder(models.Model):
    _inherit = 'pos.order'

    # Columns Section
    margin = fields.Float(
        string='Margen',
        compute='_compute_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
        help="It gives profitability by calculating the difference between"
        " the Unit Price and the cost price.")

    margin_percent = fields.Float(
        string='Margen (%)',
        compute='_compute_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    # Compute Section
    @api.depends('lines.margin', 'lines.price_subtotal')
    def _compute_margin(self):
        for order in self:
            tmp_margin = sum(order.mapped('lines.margin'))
            tmp_price_subtotal = sum(order.mapped('lines.price_subtotal'))
            order.update({
                'margin': tmp_margin,
                'margin_percent': tmp_price_subtotal and (
                    tmp_margin / tmp_price_subtotal * 100) or 0.0,
            })


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    # Columns Section
    margin = fields.Float(
        string='Margen',
        compute='_compute_multi_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    margin_percent = fields.Float(
        string='Margen (%)',
        compute='_compute_multi_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    purchase_price = fields.Float(
        string='Precio de Costo',
        compute='_compute_multi_margin',
        store=True,
        digits=dp.get_precision('Product Price'),
    )

    # Compute Section
    @api.depends('product_id', 'qty', 'price_subtotal')
    def _compute_multi_margin(self):
        for line in self.filtered('product_id'):
            purchase_price = self._get_purchase_price(line)
            margin = line.price_subtotal - (purchase_price * line.qty)
            line.update({
                'purchase_price': purchase_price,
                'margin': margin,
                'margin_percent': line.price_subtotal and (
                    margin / line.price_subtotal * 100.0),
            })

    @api.model
    def _get_purchase_price(self, line):
        SaleOrderLine = self.env['sale.order.line']
        uom = hasattr(line, 'uom_id') and line.uom_id or line.product_id.uom_id

        # return SaleOrderLine._compute_margin(
        #     line.order_id.pricelist_id, line.product_id, uom,
        #     line.order_id.date_order)['purchase_price']
        price = line.product_id.standard_price
        raise ValidationError(price)
        return price
