# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import UserError

import logging
_logger = logging.getLogger(__name__)

class pos_order(models.Model):
    _inherit = "pos.order"

    ## Si la versión de odoo < 2022-02-10 se debe usar este metodo
    # def action_pos_order_invoice(self):
    #     moves = self.env['account.move']

    #     for order in self:
    #         # Force company for all SUPERUSER_ID action
    #         if order.account_move:
    #             moves += order.account_move
    #             continue

    #         if not order.partner_id:
    #             raise UserError(_('Please provide a partner for the sale.'))

    #         move_vals = order._prepare_invoice_vals()
    #         new_move = order._create_invoice(move_vals)
    #         order.write({'account_move': new_move.id, 'state': 'invoiced'})
    #         ## _post() -> action_post()
    #         # 1/0
    #         new_move.sudo().with_company(order.company_id).action_post()
    #         moves += new_move
    #         order._apply_invoice_payments()

    #     if not moves:
    #         return {}

    #     return {
    #         'name': _('Customer Invoice'),
    #         'view_mode': 'form',
    #         'view_id': self.env.ref('account.view_move_form').id,
    #         'res_model': 'account.move',
    #         'context': "{'move_type':'out_invoice'}",
    #         'type': 'ir.actions.act_window',
    #         'nodestroy': True,
    #         'target': 'current',
    #         'res_id': moves and moves.ids[0] or False,
    #     }

    def _generate_pos_order_invoice(self):
        print ('\n\n\n_generate_pos_order_invoice' )
        moves = self.env['account.move']

        for order in self:
            # Force company for all SUPERUSER_ID action
            if order.account_move:
                moves += order.account_move
                continue

            if not order.partner_id:
                raise UserError(_('Please provide a partner for the sale.'))

            move_vals = order._prepare_invoice_vals()
            new_move = order._create_invoice(move_vals)

            order.write({'account_move': new_move.id, 'state': 'invoiced'})
            ## _post() -> action_post()
            new_move.sudo().with_company(order.company_id).action_post()
            moves += new_move
            order._apply_invoice_payments()

        if not moves:
            return {}

        return {
            'name': _('Customer Invoice'),
            'view_mode': 'form',
            'view_id': self.env.ref('account.view_move_form').id,
            'res_model': 'account.move',
            'context': "{'move_type':'out_invoice'}",
            'type': 'ir.actions.act_window',
            'nodestroy': True,
            'target': 'current',
            'res_id': moves and moves.ids[0] or False,
        }

class AccountMove(models.Model):
    _inherit = "account.move"

    """
        Sobreescribo este metodo para generar la nota de crédito
    """

    def get_related_invoices_data(self):
        """
        List related invoice information to fill CbtesAsoc.
        """

        self.ensure_one()
        # for now we only get related document for debit and credit notes
        # because, for eg, an invoice can not be related to an invocie and
        # that happens if you choose the modify option of the credit note
        # wizard. A mapping of which documents can be reported as related
        # documents would be a better solution
        if self.l10n_latam_document_type_id.internal_type in ['debit_note', 'credit_note'] \
                and self.invoice_origin:
            args = [
                ('commercial_partner_id', '=', self.commercial_partner_id.id),
                ('company_id', '=', self.company_id.id),
                #('document_number', '=', self.invoice_origin),
                ('invoice_origin', '=', self.invoice_origin.replace('REEMBOLSO', '')),
                ('id', '!=', self.id),
                ('l10n_latam_document_type_id.l10n_ar_letter', '=', self.l10n_latam_document_type_id.l10n_ar_letter),
                ('l10n_latam_document_type_id', '!=', self.l10n_latam_document_type_id.id),
                ('state', 'not in', ['draft', 'cancel'])]
            print ('\n\n\nargs', args)
            _logger.info("\n\n\nNota de credito- buscando factura: %s " % (args))
            return self.search(args,
                limit=1)
        else:
            return self.browse()
