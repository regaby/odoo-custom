# -*- coding: utf-8 -*-
{
    'name': 'Website Event Code',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'depends': ['website_event'],
    'data': [
        'security/ir.model.access.csv',
        'views/event_code_view.xml',
        'views/template.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_event_code/static/src/js/website_event_code.js',
        ],
    },
    'qweb': [
    ],
    'installable': True,
}
