# -*- coding: utf-8 -*-
from odoo import models,fields

class pos_order(models.Model):
    _inherit = 'pos.order'
    
    is_tax_free_order = fields.Boolean("Is Tax free order?",default=False)