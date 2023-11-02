# -*- coding: utf-8 -*-
{
    'name': 'POS Disable PDF Invoice Download',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'summary': 'This module allows optional invoice printing from POS',
    'depends': [
        'point_of_sale'
    ],
    'data': [
        'views/pos_config.xml',
    ],
    'assets': {
        "point_of_sale.assets": [
            '/pos_disable_pdf_invoice_download/static/src/js/pos_download_invoice.js',
        ],
    },
    'qweb': [
    ],
    'installable': True,
}
