# -*- coding: utf-8 -*-
{
    'name': 'POS Default Customer',
    'summary': "Set Default Customer in POS",
    'description': 'Set Default Customer in POS',

    'author': 'iPredict IT Solutions Pvt. Ltd.',
    'website': 'http://ipredictitsolutions.com',
    "support": "ipredictitsolutions@gmail.com",

    'category': 'Point of Sale',
    'version': '13.0.0.1.0',
    'depends': ['point_of_sale'],

    'data': [
        'views/assets.xml',
        'views/pos_config_view.xml',
    ],

    'license': "OPL-1",

    'installable': True,
    'application': True,

    'images': ['static/description/banner.png'],
}
