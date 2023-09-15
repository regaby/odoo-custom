# -*- coding: utf-8 -*-

from odoo import fields, models, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_pos_auto_invoice = fields.Boolean(
        related='pos_config_id.pos_auto_invoice',
        string='POS auto invoice',
        help='POS auto to checked to invoice button',
        readonly=False
    )
    pos_receipt_invoice_number = fields.Boolean(
        related='pos_config_id.receipt_invoice_number',
        string='Receipt show invoice number',
        readonly=False
    )
    pos_receipt_customer_vat = fields.Boolean(
        related='pos_config_id.receipt_customer_vat',
        string='Receipt show customer VAT',
        readonly=False
    )
    pos_default_partner_id = fields.Many2one(
        'res.partner',
        related='pos_config_id.default_partner_id',
        string="Seleccione un cliente",
        readonly=False
    )