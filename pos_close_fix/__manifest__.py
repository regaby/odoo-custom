# -*- coding: utf-8 -*-
{
    'name': 'POS Close Fix',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'summary': 'Close pos fix',
    "description": """Este modulo salta el control de journal item unbalanced al cerrar sesion del pos:
    Cannot create unbalanced journal entry. Ids:
    Differences debit - credit:""",
    'depends': ['point_of_sale'],
    'data': [
    ],
    'qweb': [
    ],
    'installable': False,
}
