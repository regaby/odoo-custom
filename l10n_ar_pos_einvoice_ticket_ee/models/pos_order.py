# -*- coding: utf-8 -*-
from odoo import api, models
import logging
import base64
import qrcode
from io import BytesIO
import json
from html import unescape
import re

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
    
    def _html_to_text(self, html_content):
        """Convierte HTML a texto plano (elimina las etiquetas HTML)"""
        if not html_content:
            return ''
        # Desencodifica entidades HTML como &amp; a &
        text = unescape(html_content)
        # Elimina todas las etiquetas HTML
        text = re.sub(r'<[^>]+>', '', text)
        return text

    @api.model
    def create_from_ui(self, orders, draft=False):
        res = super().create_from_ui(orders=orders, draft=draft)
        for order in res:
            if order.get('account_move'):
                try:
                    invoice = self.env['account.move'].sudo().browse(order['account_move'])
                    if not invoice.exists():
                        _logger.warning("Invoice not found: %s", order['account_move'])
                        continue
                        
                    doc_type = invoice.l10n_latam_document_type_id

                    # Generar QR como imagen base64
                    qr_src = self._generate_qr_base64(invoice.l10n_ar_afip_qr_code or '')

                    # Agregar campos directamente al diccionario order
                    order['invoice_number'] = invoice.name or ''
                    order['l10n_latam_document_type_id_name'] = doc_type.name if doc_type else ''
                    order['l10n_latam_document_report_name'] = doc_type.report_name if doc_type else ''
                    order['l10n_latam_document_type_id_code'] = doc_type.code if doc_type else ''
                    order['invoice_letter'] = doc_type.l10n_ar_letter if doc_type else ''
                    order['l10n_ar_cae'] = invoice.l10n_ar_afip_auth_code or ''
                    order['l10n_ar_cae_due_date'] = invoice.l10n_ar_afip_auth_code_due or ''
                    order['l10n_ar_qr_code_base64'] = qr_src
                    
                    # Obtener los términos y condiciones de la factura
                    # Primero intentamos con narration (términos y condiciones)
                    terms_and_conditions = ''
                    if invoice.narration:
                        terms_and_conditions = self._html_to_text(invoice.narration)
                    # Si no hay narration, intentamos con invoice_payment_term_id
                    elif invoice.invoice_payment_term_id and invoice.invoice_payment_term_id.note:
                        terms_and_conditions = self._html_to_text(invoice.invoice_payment_term_id.note)
                    # Si aún no hay, usamos las condiciones de pago de la compañía
                    elif self.env.company.invoice_terms:
                        terms_and_conditions = self._html_to_text(self.env.company.invoice_terms)
                        
                    order['terms_and_conditions'] = terms_and_conditions
                    
                    # Información específica para facturas tipo A
                    if doc_type and doc_type.l10n_ar_letter == 'A':
                        # Calcular y agregar subtotal e impuestos
                        subtotal = invoice.amount_untaxed
                        order['subtotal'] = subtotal
                        
                        # Detalles de impuestos - usando invoice_line_ids y sus tax_ids
                        tax_details = []
                        
                        # En Odoo 17, debemos usar invoice_line_ids y sus tax_ids
                        # Obtener todos los impuestos aplicados a la factura
                        tax_groups = {}
                        
                        for line in invoice.invoice_line_ids:
                            for tax in line.tax_ids:
                                try:
                                    # Calcular el monto del impuesto para esta línea
                                    tax_amount = line.price_subtotal * (tax.amount / 100.0)
                                    
                                    # Agrupar por ID de impuesto
                                    if tax.id not in tax_groups:
                                        tax_groups[tax.id] = {
                                            'id': tax.id,
                                            'name': tax.name or '',
                                            'invoice_label': tax.invoice_label or tax.name or '',
                                            'amount': 0,
                                            'tax_group': tax.tax_group_id.name if tax.tax_group_id else ''
                                        }
                                    
                                    tax_groups[tax.id]['amount'] += tax_amount
                                    
                                except Exception as e:
                                    _logger.error("Error procesando impuesto %s: %s", tax.name, str(e))
                        
                        # Convertir el diccionario a lista
                        tax_details = list(tax_groups.values())
                        
                        # Ordenar por monto de mayor a menor
                        tax_details.sort(key=lambda x: x['amount'], reverse=True)
                        
                        order['detailed_taxes'] = tax_details

                    # Log detallado para depuración
                    _logger.info("📄 Invoice ID: %s", invoice.id)
                    _logger.info("📄 Invoice Name: %s", invoice.name)
                    if doc_type:
                        _logger.info("📄 Doc Type fields: %s", doc_type.read(['name', 'report_name', 'code', 'l10n_ar_letter']))
                        _logger.info("📌 Letra: %s", doc_type.l10n_ar_letter)
                    
                    # Log de impuestos para facturas tipo A
                    if doc_type and doc_type.l10n_ar_letter == 'A':
                        _logger.info("💲 Subtotal: %s", subtotal)
                        _logger.info("💰 Tax Details: %s", json.dumps(tax_details))
                    
                    _logger.info("📝 Términos y condiciones: %s", terms_and_conditions)
                    _logger.info("🔍 QR inicio: %s...", qr_src[:60] if qr_src else "N/A")
                    
                except Exception as e:
                    _logger.error("Error procesando factura %s: %s", order.get('account_move'), str(e))
        return res
