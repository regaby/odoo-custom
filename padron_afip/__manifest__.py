# -*- coding: utf-8 -*-
{
    'name': 'Padron Afip',
    'version': '0.1',
    'author': 'Localizacion arg.',
    'license': 'LGPL-3',
    'category': 'Localization/Argentina',
    'website': 'Localizacion arg.',
    'depends': ['l10n_ar_afipws'],
    'data': [
        'wizard/res_partner_update_from_padron_wizard_view.xml',
        'security/ir.model.access.csv',
    ],
    'qweb': [
    ],
    'installable': True,
}
