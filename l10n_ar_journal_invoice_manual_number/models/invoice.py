# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.addons import decimal_precision as dp
from odoo.exceptions import UserError, ValidationError
import logging
_logger = logging.getLogger(__name__)

class AccountInvoice(models.Model):
    _inherit = "account.invoice"

    use_manual_number = fields.Boolean(
        related='journal_id.use_manual_number',
        string='Use Manual Number?',
    )
    manual_number = fields.Char(
        string='Invoice Manual Number',
        copy=False,
        readonly=True,
        states={'draft': [('readonly', False)]},
        track_visibility='onchange',
        index=True,
    )

    @api.constrains('manual_number')
    def _check_unique_supplier_invoice_number_insensitive(self):
        """
        Check if an other vendor bill has the same supplier_invoice_number
        and the same commercial_partner_id than the current instance
        """
        for rec in self:
            if rec.manual_number and\
                    rec.type in ('out_invoice', 'out_refund'):
                same_supplier_inv_num = rec.search([
                    ('commercial_partner_id', '=',
                     rec.commercial_partner_id.id),
                    ('type', 'in', ('out_invoice', 'out_refund')),
                    ('manual_number',
                     '=ilike', rec.manual_number),
                    ('id', '!=', rec.id)
                ], limit=1)
                if same_supplier_inv_num:
                    raise ValidationError(_(
                        "The invoice/refund with supplier invoice number '%s' "
                        "already exists in Odoo under the number '%s' "
                        "for supplier '%s'.") % (
                            same_supplier_inv_num.manual_number,
                            same_supplier_inv_num.number or '-',
                            same_supplier_inv_num.partner_id.display_name))

    @api.multi
    @api.depends(
        'move_name',
        'document_number',
        'document_type_id.doc_code_prefix',
        'manual_number'
    )
    def _compute_display_name(self):
        """
        If move_name then invoice has been validated, then:
        * If document number and document type, we show them
        * Else, we show move_name
        """
        # al final no vimos porque necesiamos que este el move name, es util
        # mostrar igual si existe el numero, por ejemplo si es factura de
        # proveedor
        # if self.document_number and self.document_type_id and self.move_name:
        TYPES = {
            'out_invoice': _('Invoice'),
            'in_invoice': _('Vendor Bill'),
            'out_refund': _('Credit Note'),
            'in_refund': _('Vendor Credit note'),
        }
        for rec in self:
            if rec.document_number and rec.document_type_id and not rec.use_manual_number:
                display_name = ("%s%s" % (
                    rec.document_type_id.doc_code_prefix or '',
                    rec.document_number))
            elif rec.use_manual_number and rec.manual_number and rec.document_type_id:
                display_name = ("%s%s" % (
                    rec.document_type_id.doc_code_prefix or '',
                    rec.manual_number))
            else:
                display_name = rec.move_name or TYPES[rec.type]
            rec.display_name = display_name

    @api.multi
    @api.constrains('document_type_id', 'manual_number')
    @api.onchange('document_type_id', 'manual_number')
    def validate_manual_number(self):
        # if we have a sequence, number is set by sequence and we dont
        # check this
        print ('validate_manual_number')
        for rec in self.filtered(
                lambda x: x.use_manual_number and x.document_type_id):
            res = rec.document_type_id.validate_document_number(
                rec.manual_number)
            print ('res', res)
            if res and res != rec.manual_number:
                rec.manual_number = res


    @api.multi
    def set_document_data(self):
        # este metodo setea la secuencia
        # se llama en action_move_create
        # agrego la condición de use_manual_number
        for invoice in self:
            # super(AccountInvoice, invoice).set_document_data()
            _logger.info(
                'Setting document data on account.invoice and account.move')
            journal_document_type = invoice.journal_document_type_id
            inv_vals = self.get_localization_invoice_vals()
            if invoice.use_documents and not invoice.use_manual_number:
                if not invoice.document_number:
                    if not invoice.journal_document_type_id.sequence_id:
                        raise UserError(_(
                            'Error!. Please define sequence on the journal '
                            'related documents to this invoice or set the '
                            'document number.'))
                    document_number = (
                        journal_document_type.sequence_id.next_by_id())
                    inv_vals['document_number'] = document_number
                # for canelled invoice number that still has a document_number
                # if validated again we use old document_number
                # also use this for supplier invoices
                else:
                    document_number = invoice.document_number
                invoice.move_id.write({
                    'document_type_id': (
                        journal_document_type.document_type_id.id),
                    'document_number': document_number,
                })
            else:
                manual_number = invoice.manual_number
                invoice.move_id.write({
                    'document_type_id': (
                        journal_document_type.document_type_id.id),
                    'document_number': manual_number,
                })

            invoice.write(inv_vals)
        return True
