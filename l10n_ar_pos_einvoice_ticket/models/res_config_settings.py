# -*- coding: utf-8 -*-

from odoo import fields, models, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_auto_invoice = fields.Boolean(
        related='company_id.auto_invoice',
        string="POS auto invoice",
        readonly=False
    )
    pos_receipt_invoice_number = fields.Boolean(
        related='company_id.receipt_invoice_number',
        string="Receipt show invoice number",
        readonly=False
    )
    pos_receipt_customer_vat = fields.Boolean(
        related='company_id.receipt_customer_vat',
        string="Receipt show customer VAT",
        readonly=False
    )
