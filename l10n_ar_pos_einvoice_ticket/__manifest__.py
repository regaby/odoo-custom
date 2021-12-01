# -*- coding: utf-8 -*-
{
    'name': 'POS einvoice ticket',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'depends': [
        'point_of_sale',
        'l10n_ar',
    ],
    'data': [
        'views/pos_einvoice_ar.xml',
        'views/pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/pos_ticket.xml',
    ],
    'installable': True,
}
