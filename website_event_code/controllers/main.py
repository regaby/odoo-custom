from odoo.http import request, route
from odoo import fields, http, SUPERUSER_ID, tools, _
from odoo.exceptions import UserError, ValidationError
from odoo.addons.website_event.controllers.main import WebsiteEventController
from werkzeug.exceptions import Forbidden, NotFound
import stdnum.ar
import werkzeug
import logging

_logger = logging.getLogger(__name__)


class WebsiteEventController(WebsiteEventController):

    @http.route(['/event/<model("event.event"):event>/registration/new'], type='json', auth="public", methods=['POST'], website=True)
    def registration_new(self, event, **post):
        event_code = post['event_code'].upper()
        event_id = request.env['event.code'].sudo().search([
            ('event_code', '=', event_code),
            ('event_id', '=', event.id),
        ])
        if not event_id:
            return request.env['ir.ui.view']._render_template("website_event_code.event_code_not_found", {})
        else:
            event_draft_id = request.env['event.code'].sudo().search([
                ('event_code', '=', event_code),
                ('event_id', '=', event.id),
                ('state', '=', 'draft'),
            ])
            if not event_draft_id:
                return request.env['ir.ui.view']._render_template("website_event_code.event_code_used", {})
            else:
                res = super().registration_new(event, **post)
                return res

    def _process_tickets_form(self, event, form_details):
        event_code = form_details['event_code'].upper()
        event_draft_id = request.env['event.code'].sudo().search([
            ('event_code', '=', event_code),
            ('event_id', '=', event.id),
            ('state', '=', 'draft'),
        ])
        res = super()._process_tickets_form(event, form_details)
        res[0]['quantity'] = event_draft_id.qty
        res[0]['event_code'] = event_code
        return res

    @http.route(['''/event/<model("event.event"):event>/registration/confirm'''], type='http', auth="public", methods=['POST'], website=True)
    def registration_confirm(self, event, **post):
        event_draft_id = request.env['event.code'].sudo().search([
            ('event_code', '=', post['1-event_code'].upper()),
            ('event_id', '=', event.id),
            ('state', '=', 'draft'),
        ])
        event_draft_id.reserve()
        registrations = self._process_attendees_form(event, post)
        attendees_sudo = self._create_attendees_from_registration_post(event, registrations)
        for attendance in attendees_sudo:
            attendance.code_id = event_draft_id.id
        return request.redirect(('/event/%s/registration/success?' % event.id) + werkzeug.urls.url_encode({'registration_ids': ",".join([str(id) for id in attendees_sudo.ids])}))

