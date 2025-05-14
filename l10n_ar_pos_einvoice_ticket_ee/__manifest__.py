# -*- coding: utf-8 -*-
{
    'name': 'POS eInvoice Ticket',
    'version': '17.0.0.1',
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
            'l10n_ar_pos_einvoice_ticket_ee/static/src/xml/pos.xml',
        ],
    },
    'installable': True,
    'application': False,
}

