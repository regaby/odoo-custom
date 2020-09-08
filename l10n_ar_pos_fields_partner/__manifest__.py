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
    'data': [
        'views/pos_fields_partner.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    'installable': True,
}
