# -*- coding: utf-8 -*-
{
    'name': 'POS einvoice ticket',
    'version': '0.1',
    'author': 'Localizacion arg.',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'Localizacion arg.',
    'depends': ['point_of_sale', 'l10n_ar_account'],
    'data': [
        'views/pos_einvoice_ar.xml',
        'views/pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/pos_ticket.xml',
        'static/src/xml/xml_receipt.xml',
    ],
    'installable': True,
}
