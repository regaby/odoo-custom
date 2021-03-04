# -*- coding: utf-8 -*-
{
    'name': 'POS Scan Default Code',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'summary': 'This module allows scan default code in POS and by a new product field modelo_articulo',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_scan_default_code.xml',
        'views/product_view.xml',
    ],
    'qweb': [
    ],
    'installable': False,
}
