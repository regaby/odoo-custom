# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class pos_config(models.Model):
	# Heredamos la clase CONFIGURACIÓN DEL POS"
    _inherit = "pos.config"

    print_pdf_invoice = fields.Boolean('Print PDF Invoice', default=1)


