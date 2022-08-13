odoo.define('website_event_code.website_event_code', function (require) {
    'use strict';

    var EventRegistrationForm = require('website_event.website_event');
    var ajax = require('web.ajax');
    var core = require('web.core');
    var Widget = require('web.Widget');
    var publicWidget = require('web.public.widget');

var _t = core._t;
    EventRegistrationForm.include({
        on_click: function (ev) {
            console.log('on_click')
            ev.preventDefault();
            ev.stopPropagation();
            var $form = $(ev.currentTarget).closest('form');
            var $button = $(ev.currentTarget).closest('[type="submit"]');
            var post = {};
            $('#registration_form table').siblings('.alert').remove();
            $('#registration_form select').each(function () {
                post[$(this).attr('name')] = $(this).val();
            });
            $('#registration_form input').each(function () {
                post[$(this).attr('name')] = $(this).val();
            });
            var tickets_ordered = _.some(_.map(post, function (value, key) { return parseInt(value); }));
            if (!tickets_ordered) {
                $('<div class="alert alert-info"/>')
                    .text(_t('Please select at least one ticket.'))
                    .insertAfter('#registration_form table');
                return new Promise(function () {});
            } else {
                $button.attr('disabled', true);
                return ajax.jsonRpc($form.attr('action'), 'call', post).then(function (modal) {
                    var $modal = $(modal);
                    $modal.modal({backdrop: 'static', keyboard: false});
                    $modal.find('.modal-body > div').removeClass('container'); // retrocompatibility - REMOVE ME in master / saas-19
                    $modal.appendTo('body').modal();
                    $modal.on('click', '.js_goto_event', function () {
                        $modal.modal('hide');
                        $button.prop('disabled', false);
                    });
                    $modal.on('click', '.close', function () {
                        $button.prop('disabled', false);
                    });
                });
            }
        },
    });
    });