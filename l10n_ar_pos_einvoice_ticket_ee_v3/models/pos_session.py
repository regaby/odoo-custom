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
