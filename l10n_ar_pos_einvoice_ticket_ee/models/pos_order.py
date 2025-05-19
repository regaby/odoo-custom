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
                    
                    # Procesamiento de impuestos para todas las facturas (A y B)
                    subtotal = invoice.amount_untaxed
                    order['subtotal'] = subtotal
                    
                    # Detalle de impuestos para todas las facturas
                    # Agruparemos los impuestos en:
                    # 1. IVA (por alícuota)
                    # 2. Otros impuestos nacionales
                    
                    iva_taxes = {}  # Para agrupar IVA por alícuota
                    other_taxes = []  # Para otros impuestos
                    
                    # Recorrer líneas de factura y sus impuestos
                    for line in invoice.invoice_line_ids:
                        base_imponible = line.price_subtotal
                        
                        for tax in line.tax_ids:
                            # Verificar si es un impuesto de IVA
                            is_iva = tax.tax_group_id and tax.tax_group_id.l10n_ar_vat_afip_code in ['3', '4', '5', '6', '8', '9']
                            
                            if is_iva:
                                # Es un impuesto de IVA
                                alicuota = tax.amount
                                tax_amount = base_imponible * (alicuota / 100.0)
                                
                                # Agrupar por alícuota
                                if alicuota not in iva_taxes:
                                    iva_taxes[alicuota] = {
                                        'id': f'iva_{alicuota}',  # ID único para cada alícuota
                                        'alicuota': alicuota,
                                        'amount': 0,
                                        'base_imponible': 0,
                                        'name': tax.name,
                                        'invoice_label': tax.invoice_label or tax.name
                                    }
                                
                                iva_taxes[alicuota]['amount'] += tax_amount
                                iva_taxes[alicuota]['base_imponible'] += base_imponible
                            else:
                                # Otro tipo de impuesto (no IVA)
                                tax_amount = base_imponible * (tax.amount / 100.0)
                                
                                # Verificar si ya existe en la lista
                                existing_tax = next((t for t in other_taxes if t.get('tax_id') == tax.id), None)
                                
                                if existing_tax:
                                    existing_tax['amount'] += tax_amount
                                else:
                                    other_taxes.append({
                                        'id': f'tax_{tax.id}',  # ID único para cada impuesto
                                        'tax_id': tax.id,
                                        'name': tax.name,
                                        'amount': tax_amount,
                                        'invoice_label': tax.invoice_label or tax.name
                                    })
                    
                    # Convertir diccionario de IVA a lista
                    iva_tax_list = list(iva_taxes.values())
                    # Ordenar por alícuota
                    iva_tax_list.sort(key=lambda x: x['alicuota'], reverse=True)
                    
                    # Calcular el total de otros impuestos
                    other_taxes_total = sum(tax['amount'] for tax in other_taxes)
                    
                    # Guardar información para el front-end
                    order['iva_taxes'] = iva_tax_list
                    order['other_taxes_total'] = other_taxes_total
                    
                    # Para mantener compatibilidad con el código existente
                    # Combinar todos los impuestos para detailed_taxes
                    tax_details = []
                    
                    # Añadir impuestos de IVA
                    for iva in iva_tax_list:
                        tax_details.append({
                            'id': iva['id'],  # ID único para cada impuesto
                            'name': iva['name'],
                            'invoice_label': iva['invoice_label'],
                            'amount': iva['amount'],
                            'is_iva': True,
                            'alicuota': iva['alicuota']
                        })
                    
                    # Añadir otros impuestos
                    for tax in other_taxes:
                        tax_details.append({
                            'id': tax['id'],  # ID único para cada impuesto
                            'name': tax['name'],
                            'invoice_label': tax['invoice_label'],
                            'amount': tax['amount'],
                            'is_iva': False
                        })
                    
                    # Ordenar por monto (mayor a menor)
                    tax_details.sort(key=lambda x: x['amount'], reverse=True)
                    
                    order['detailed_taxes'] = tax_details

                except Exception as e:
                    _logger.error("Error procesando factura %s: %s", order.get('account_move'), str(e))
        return res
