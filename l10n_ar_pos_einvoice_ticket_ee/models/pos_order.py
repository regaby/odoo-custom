# -*- coding: utf-8 -*-
from odoo import api, models
import logging
import base64
import qrcode
from io import BytesIO

_logger = logging.getLogger(__name__)

class PosOrder(models.Model):
    _inherit = "pos.order"

    def _generate_qr_base64(self, qr_text):
        """Genera una imagen QR en base64 a partir de un texto."""
        if not qr_text:
            return ''
        qr = qrcode.QRCode(box_size=3)
        qr.add_data(qr_text)
        qr.make(fit=True)
        img = qr.make_image()
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode('utf-8')

    @api.model
    def create_from_ui(self, orders, draft=False):
        res = super().create_from_ui(orders=orders, draft=draft)
        for order in res:
            if order.get('account_move'):
                invoice = self.env['account.move'].sudo().browse(order['account_move'])
                doc_type = invoice.l10n_latam_document_type_id

                # Generar QR como imagen base64
                qr_src = self._generate_qr_base64(invoice.l10n_ar_afip_qr_code or '')

                # Agregar campos directamente al diccionario order
                order['invoice_number'] = invoice.name or ''
                order['l10n_latam_document_type_id_name'] = doc_type.name or ''
                order['l10n_latam_document_report_name'] = doc_type.report_name or ''
                order['l10n_latam_document_type_id_code'] = doc_type.code or ''
                order['invoice_letter'] = doc_type.l10n_ar_letter or ''
                order['l10n_ar_cae'] = invoice.l10n_ar_afip_auth_code or ''
                order['l10n_ar_cae_due_date'] = invoice.l10n_ar_afip_auth_code_due or ''
                order['l10n_ar_qr_code_base64'] = qr_src

                # Log detallado
                _logger.info("📄 Invoice ID: %s", invoice.id)
                _logger.info("📄 Invoice Name: %s", invoice.name)
                _logger.info("📄 Doc Type fields: %s", doc_type.read(['name', 'report_name', 'code', 'l10n_ar_letter']))
                _logger.info("📌 Letra: %s", doc_type.l10n_ar_letter)
                _logger.info("🔍 QR inicio: %s...", qr_src[:60])
        return res














