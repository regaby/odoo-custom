# -*- coding: utf-8 -*-
{
    'name': 'POS einvoice AR',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'description': 'Este módulo permite imprimir la factura eléctronica de la localización Argentina desarrollado por Ad-hoc desde el POS.',
    'depends': ['point_of_sale', 'l10n_ar_aeroo_einvoice'],
    'data': [
        'views/pos_einvoice_ar.xml',
    ],
    'qweb': [
        'static/src/xml/pos_payment.xml',
    ],
    'installable': True,
}
