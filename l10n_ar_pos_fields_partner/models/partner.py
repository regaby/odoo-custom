# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class ResPartner(models.Model):
    _inherit = "res.partner"

    # sobrecargo este metodo porque daba este error en el pos:
    # Database fetch misses ids (('5',)) and has extra ids ((5,)), may be caused by a type incoherence in a previous request
    @api.constrains('vat', 'l10n_latam_identification_type_id')
    def check_vat(self):
        """ Since we validate more documents than the vat for Argentinian partners (CUIT - VAT AR, CUIL, DNI) we
        extend this method in order to process it. """
        # NOTE by the moment we include the CUIT (VAT AR) validation also here because we extend the messages
        # errors to be more friendly to the user. In a future when Odoo improve the base_vat message errors
        # we can change this method and use the base_vat.check_vat_ar method.s
        type_id = int(self.l10n_latam_identification_type_id.id)
        l10n_ar_partners = self.filtered(lambda self: self.env['l10n_latam.identification.type'].browse(type_id).l10n_ar_afip_code)
        l10n_ar_partners.l10n_ar_identification_validation()
        return super(ResPartner, self - l10n_ar_partners).check_vat()

