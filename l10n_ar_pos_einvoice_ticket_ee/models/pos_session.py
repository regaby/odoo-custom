
from odoo import models


class PosSession(models.Model):
    _inherit = "pos.session"

    def _loader_params_res_company(self):
        res = super()._loader_params_res_company()
        res["search_params"]["fields"] += [
            'l10n_ar_afip_start_date',
            'l10n_ar_gross_income_number',
            'l10n_ar_afip_responsibility_type_id',
            'street',
            'city',
            'state_id',
            'country_id',
            'receipt_invoice_number',
        ]
        return res
        
    def _loader_params_res_partner(self):
        res = super()._loader_params_res_partner()
        res["search_params"]["fields"] += [
            'l10n_latam_identification_type_id',
            'l10n_ar_afip_responsibility_type_id',
            'city',
            'state_id',
            'country_id',
        ]
        return res
        
    def _pos_ui_models_to_load(self):
        models = super()._pos_ui_models_to_load()
        if 'account.tax' not in models:
            models.append('account.tax')
        return models

    def _loader_params_account_tax(self):
        return {
            'search_params': {
                'domain': [('company_id', '=', self.config_id.company_id.id)],
                'fields': [
                    'name', 
                    'amount', 
                    'price_include', 
                    'include_base_amount', 
                    'tax_group_id',
                    'amount_type',
                    # No incluir 'children_tax_ids' ya que causa el error
                ],
            },
        }
