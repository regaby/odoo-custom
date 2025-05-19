# -*- coding: utf-8 -*-
{
    'name': 'POS eInvoice Ticket (Enterprise)',
    'version': '17.0.0.3',
    'author': 'Ing. Gabriela Rivero, Mario Nuñez',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'https://www.galup.com.ar, https://crumges.com',
    'summary': 'Impresión de facturas electrónicas como ticket desde el POS para Argentina (Exclusivo para Odoo Enterprise)',
    'images': ['static/description/banner.png'],
    
    'depends': [
        'point_of_sale',  # Módulo base del Punto de Venta
        'l10n_ar',        # Localización Argentina
        'l10n_ar_edi',    # Factura electrónica oficial para Argentina en Odoo Enterprise
    ],
    
    'data': [
        'views/res_config_settings.xml',  # Vista para configuraciones del módulo
    ],
    
    'assets': {
        'point_of_sale._assets_pos': [
            # Archivos JavaScript
            'l10n_ar_pos_einvoice_ticket_ee/static/src/js/models.js',  # Modelos principales y lógica de negocio
            
            # Archivos XML (templates)
            'l10n_ar_pos_einvoice_ticket_ee/static/src/xml/pos.xml',   # Plantillas para el ticket
        ],
    },
    
    'installable': True,
    'application': False,
    'auto_install': False,
    
    'description': """
POS eInvoice Ticket para Argentina (Exclusivo para Odoo Enterprise)
==================================

Este módulo permite imprimir la factura electrónica como ticket desde el POS de Odoo, 
cumpliendo con los requisitos de la AFIP para la localización argentina.

Características principales:
---------------------------
* Generación de QR AFIP en tickets
* Discriminación de impuestos en facturas tipo A
* Visualización de datos fiscales del cliente y la empresa
* Múltiples opciones de configuración
* Implementación del Régimen de Transparencia Fiscal (Ley 27.743)
* Facturación automática configurable

Opciones de configuración:
-------------------------
* Auto facturación: activa automáticamente el botón de facturar en el POS.
* Mostrar N° Factura: muestra en el ticket los datos de la factura y CAE.
* Mostrar CUIT del cliente: incluye los datos fiscales del cliente en el ticket.

Tipos de Comprobantes:
--------------------
* Factura A: muestra subtotal e impuestos discriminados.
* Factura B: incluye sección de "Régimen de Transparencia Fiscal al Consumidor" con IVA contenido.
* Otros: adaptado para todos los tipos de comprobantes de la localización argentina.

Este módulo es exclusivo para Odoo 17.0 Enterprise y ha sido probado con la localización
argentina de a2systems: https://github.com/a2systems/odoo-argentina

IMPORTANTE: No es compatible con la versión Community de Odoo.

Autores y Contribuidores:
-----------------------
* Ariel Aranda <pushnube@gmail.com>
* Gabriela Rivero <regaby@gmail.com>
* Mario Nuñez <marionumza@gmail.com>
* Lucas L. Soto
* Claude (Anthropic)
* ChatGPT (OpenAI)
    """,
    
    'maintainer': 'Ing. Gabriela Rivero, Mario Nuñez',
    'support': 'regaby@gmail.com, marionumza@gmail.com',
}
