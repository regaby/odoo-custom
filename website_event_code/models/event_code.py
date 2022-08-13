from odoo import models, fields, api
import random

class EventCode(models.Model):
    _name = "event.code"

    name = fields.Char(
        'Nombre del asistente'
    )
    qty = fields.Integer(
        'Cantidad de invitados'
    )
    event_code = fields.Char(
        'Código'
    )
    event_id = fields.Many2one(
        'event.event',
        'Evento'
    )
    state = fields.Selection(
        [
            ('draft', 'Borrador'),
            ('reserved', 'Reservado'),
        ],
        default="draft",
        string="Estado"
    )
    registration_ids = fields.One2many(
        'event.registration',
        'code_id'
    )

    def reserve(self):
        for rec in self:
            rec.state = 'reserved'

    _sql_constraints = [
        ('code_uniq', 'UNIQUE(event_id, event_code)', 'El codigo debe ser unico')
    ]

    @api.onchange('name')
    def onchange_name(self):
        for rec in self:
            if rec.name:
                ran = random.randint(0,999)
                rec.event_code = "%s%s" % (rec.name[0:3].upper(), str(ran).zfill(3))

class EventEvent(models.Model):
    _inherit = "event.event"

    code_ids = fields.One2many(
        'event.code',
        'event_id'
    )

class EventRegistration(models.Model):
    _inherit = "event.registration"

    code_id = fields.Many2one(
        'event.code',
    )