from odoo import models, fields

class PosSession(models.Model):
    _inherit = 'pos.session'

    def _loader_params_res_company(self):
        return {
            'search_params': {
                'fields': ['l10n_ar_afip_responsibility_type_id']
            }
        }

    def _get_pos_ui_res_company(self, params):
        return self.env['res.company'].search_read(**params['search_params'])