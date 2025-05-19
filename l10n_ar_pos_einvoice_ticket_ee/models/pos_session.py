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
            'auto_invoice',  # Añadimos este campo para cargarlo en el frontend
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
