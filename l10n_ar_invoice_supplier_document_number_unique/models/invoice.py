# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.addons import decimal_precision as dp
from odoo.exceptions import UserError, ValidationError
import logging
_logger = logging.getLogger(__name__)

class AccountInvoice(models.Model):
    _inherit = "account.invoice"

    @api.multi
    @api.onchange('document_type_id', 'document_number')
    def validate_document_number(self):
        for rec in self.filtered(
                lambda x: not x.document_sequence_id and x.document_type_id):
            super(AccountInvoice, rec).validate_document_number()
            rec.supplier_invoice_number = rec.document_number
