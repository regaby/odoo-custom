# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
import stdnum.ar
from odoo.exceptions import ValidationError
import logging
_logger = logging.getLogger(__name__)

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

    def _get_validation_module(self):
        self.ensure_one()
        type_id = int(self.l10n_latam_identification_type_id.id)
        l10n_latam_identification_type_id = self.env['l10n_latam.identification.type'].browse(type_id)
        if l10n_latam_identification_type_id.l10n_ar_afip_code in ['80', '86']:
            return stdnum.ar.cuit
        elif l10n_latam_identification_type_id.l10n_ar_afip_code == '96':
            return stdnum.ar.dni

    def l10n_ar_identification_validation(self):
        type_id = int(self.l10n_latam_identification_type_id.id)
        l10n_latam_identification_type_id = self.env['l10n_latam.identification.type'].browse(type_id)
        for rec in self.filtered('vat'):
            try:
                module = rec._get_validation_module()
            except Exception as error:
                module = False
                _logger.runbot("Argentinean document was not validated: %s", repr(error))
            if not module:
                continue
            try:
                module.validate(rec.vat)

            except module.InvalidChecksum:
                raise ValidationError(_('The validation digit is not valid for "%s"',
                                        l10n_latam_identification_type_id.name))
            except module.InvalidLength:
                raise ValidationError(_('Invalid length for "%s"', l10n_latam_identification_type_id.name))
            except module.InvalidFormat:
                raise ValidationError(_('Only numbers allowed for "%s"', l10n_latam_identification_type_id.name))
            except Exception as error:
                raise ValidationError(repr(error))

