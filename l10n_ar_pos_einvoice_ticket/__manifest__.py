# -*- coding: utf-8 -*-
{
    'name': 'POS einvoice ticket',
    'version': '16.0.0.0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'depends': [
        'point_of_sale',
        'l10n_ar',
    ],
    'data': [
        'views/res_config_settings_views.xml',
    ],
    'assets': {
        "point_of_sale.assets": [
            "/l10n_ar_pos_einvoice_ticket/static/src/js/pos_model.js",
            "/l10n_ar_pos_einvoice_ticket/static/src/css/pos_receipts.css",
            "/l10n_ar_pos_einvoice_ticket/static/src/xml/pos_ticket.xml",
        ],
    },
    'installable': True,
}
