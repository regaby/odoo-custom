from odoo import fields, models


class PosOrderReport(models.Model):
    _inherit = 'report.pos.order'

    margin_total = fields.Float(string='Margen')

    def _select(self):
        return super(PosOrderReport, self)._select() + """,
    SUM(l.margin) as margin_total
    """
