# -*- coding: utf-8 -*-
{
    'name': 'POS Disable PDF Invoice Download',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'summary': 'This module allows optional invoice printing from POS',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_disable_download.xml',
        'views/pos_config.xml',
    ],
    'qweb': [
    ],
    'installable': False,
}
