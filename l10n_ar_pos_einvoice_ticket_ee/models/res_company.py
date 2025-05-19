
# -*- coding: utf-8 -*-

from odoo import api, models, fields, _
from odoo.exceptions import ValidationError

class ResCompany(models.Model):
    _inherit = 'res.company'

    auto_invoice = fields.Boolean(
        'POS auto invoice',
        help='POS auto to checked to invoice button',
        default=True
    )
    receipt_invoice_number = fields.Boolean(
        'Receipt show invoice number',
        default=True
    )
    receipt_customer_vat = fields.Boolean(
        'Receipt show customer VAT',
        default=True
    )
