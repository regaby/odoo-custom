# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.model
    def create_from_ui(self, orders, draft=False):
        res = super(PosOrder, self).create_from_ui(orders=orders, draft=draft)
        for order in res:
            if order.get('account_move'):
                account_move = self.env['account.move'].sudo().browse(order.get('account_move'))
                order['invoice_number'] = account_move.name
                order['l10n_latam_document_type_id_name'] = account_move.l10n_latam_document_type_id.name
                order['l10n_latam_document_type_id_code'] = account_move.l10n_latam_document_type_id.code
                order['afip_auth_code'] = account_move.afip_auth_code
                order['afip_auth_code_due'] = account_move.afip_auth_code_due
                order['texto_modificado_qr'] = account_move.texto_modificado_qr
        return res
