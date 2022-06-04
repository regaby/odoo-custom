# -*- coding: utf-8 -*-
{
    'name': 'POS Fields Partner',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'description': 'Este módulo permite agrega los campos Responsabilidad AFIP, tipo de documento y nro. de documento a la vista cliente del POS.',
    'depends': ['point_of_sale', 'l10n_ar'],
    'assets': {
        "point_of_sale.assets": [
            "/l10n_ar_pos_fields_partner/static/src/js/pos.js",
        ],
        'web.assets_qweb': [
             'l10n_ar_pos_fields_partner/static/src/xml/pos.xml',
        ],

    },
    'installable': True,
}
