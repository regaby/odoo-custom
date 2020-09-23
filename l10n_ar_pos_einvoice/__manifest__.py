# -*- coding: utf-8 -*-
{
    'name': 'POS einvoice AR',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'description': 'Este módulo permite imprimir opcionalmente la factura desde el POS.',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_einvoice_ar.xml',
        'views/pos_config.xml',
    ],
    'qweb': [
        'static/src/xml/pos_payment.xml',
    ],
    'installable': True,
}
