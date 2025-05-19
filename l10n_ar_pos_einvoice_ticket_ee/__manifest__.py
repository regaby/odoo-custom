# -*- coding: utf-8 -*-
{
    'name': 'POS eInvoice Ticket',
    'version': '17.0.0.2',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'https://www.galup.com.ar',
    'depends': [
        'point_of_sale',
        'l10n_ar',
        'l10n_ar_edi',  # Factura electrónica oficial para Argentina en Odoo Enterprise
    ],
    'data': [
        'views/res_config_settings.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'l10n_ar_pos_einvoice_ticket_ee/static/src/js/models.js',
            'l10n_ar_pos_einvoice_ticket_ee/static/src/js/auto_invoice.js',
            'l10n_ar_pos_einvoice_ticket_ee/static/src/xml/pos.xml',
        ],
        'web.assets_backend': [
            'l10n_ar_pos_einvoice_ticket_ee/static/src/js/auto_invoice.js',
        ],
    },
    'installable': True,
    'application': False,
    'description': """
POS eInvoice Ticket
===================

Este módulo permite imprimir la factura electrónica como ticket desde el POS de Odoo, cumpliendo con los requisitos de la AFIP para la localización argentina.

Características principales:
---------------------------
* Generación de QR AFIP en tickets
* Discriminación de impuestos en facturas tipo A
* Visualización de datos fiscales del cliente y la empresa
* Múltiples opciones de configuración

Configuración
------------
En la configuración del punto de venta se puede habilitar:
* Auto facturación
* Mostrar número de factura
* Mostrar CUIT del cliente
    """,
}
