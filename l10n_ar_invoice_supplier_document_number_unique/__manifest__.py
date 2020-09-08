# -*- coding: utf-8 -*-
{
    'name': 'Invoice Supplier Document Number Unique',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Product',
    'website': 'www.galup.com.ar',
    'description': """Este módulo utiliza el módulo de OCA account_invoice_supplier_ref_unique
    y copia el campo document_number al campo de define el módulo de OCA para hacer el control
    que el número de factura de proveedor no haya sido cargada con anterioridad.
    """,
    'depends': ['account_invoice_supplier_ref_unique'],
    'data': [
    ],
    'qweb': [
    ],
    'installable': False,
}
