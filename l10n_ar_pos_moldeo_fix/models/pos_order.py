# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class PosConfig(models.Model):
    _inherit = 'pos.config'

    manual_journal_id = fields.Many2one('account.journal',string='Diario Manual',domain=[('type','=','sale')])

class pos_order(models.Model):
    _inherit = "pos.order"

    def action_pos_order_invoice(self):
        moves = self.env['account.move']

        for order in self:
            # Force company for all SUPERUSER_ID action
            if order.account_move:
                moves += order.account_move
                continue

            if not order.partner_id:
                raise UserError(_('Please provide a partner for the sale.'))
            move_vals = order._prepare_invoice_vals()
            ## chequeo conexion de afip
            journal_ws = self.session_id.config_id.invoice_journal_id
            if journal_ws.l10n_ar_afip_pos_system == 'RLI_RLM':
                afip_ws = journal_ws.afip_ws
                if not afip_ws:
                    raise UserError(_('No AFIP WS selected'))
                ws = journal_ws.company_id.get_connection(afip_ws).connect()
                ws.Dummy()
                if ws.AppServerStatus != 'OK' or ws.DbServerStatus != 'OK' or ws.AuthServerStatus != 'OK' and self.session_id.config_id.manual_journal_id:
                        move_vals['journal_id'] = self.session_id.config_id.manual_journal_id.id
            ####
            new_move = moves.sudo()\
                            .with_context(default_type=move_vals['type'], force_company=order.company_id.id)\
                            .create(move_vals)
            message = _("This invoice has been created from the point of sale session: <a href=# data-oe-model=pos.order data-oe-id=%d>%s</a>") % (order.id, order.name)
            new_move.message_post(body=message)
            order.write({'account_move': new_move.id, 'state': 'invoiced'})
            new_move.sudo().with_context(force_company=order.company_id.id).action_post()
            moves += new_move

        if not moves:
            return {}

        return {
            'name': _('Customer Invoice'),
            'view_mode': 'form',
            'view_id': self.env.ref('account.view_move_form').id,
            'res_model': 'account.move',
            'context': "{'type':'out_invoice'}",
            'type': 'ir.actions.act_window',
            'nodestroy': True,
            'target': 'current',
            'res_id': moves and moves.ids[0] or False,
        }
