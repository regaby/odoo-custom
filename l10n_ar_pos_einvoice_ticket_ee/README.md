# POS eInvoice Ticket para Odoo 17 - Argentina

## Descripción
Este módulo permite imprimir facturas electrónicas como tickets desde el Punto de Venta (POS) de Odoo, cumpliendo con todos los requisitos fiscales de AFIP (Administración Federal de Ingresos Públicos) para la localización argentina.

## Características

### Generales
- Impresión de tickets fiscalmente válidos desde el POS
- Soporte para diferentes tipos de comprobantes (A, B, C, etc.)
- Generación y visualización de código QR AFIP en los tickets
- Discriminación de impuestos según tipo de factura
- Implementación del Régimen de Transparencia Fiscal (Ley 27.743)
- Personalización de la información mostrada en el ticket

### Funcionalidades específicas
- **Auto facturación**: Activa automáticamente el botón de facturar en el POS
- **Mostrar N° Factura**: Visualiza los datos de la factura y CAE en el ticket
- **Mostrar CUIT del cliente**: Incluye información fiscal del cliente en el ticket
- **Datos fiscales completos**: Muestra información de la empresa (CUIT, ingresos brutos, inicio de actividades, etc.)
- **Discriminación de IVA en facturas tipo A**: Muestra subtotal e impuestos desglosados
- **Régimen de Transparencia Fiscal en facturas tipo B**: Muestra el IVA contenido según la Ley 27.743
- **Visualización del CAE y su vencimiento**: Incluye estos datos obligatorios en el ticket
- **Código QR de AFIP**: Genera e imprime el código QR con la información fiscal

## Instalación

1. Descargue o clone este repositorio
2. Añada el directorio a su ruta de addons de Odoo
3. Actualice la lista de aplicaciones
4. Instale el módulo "POS eInvoice Ticket"

### Dependencias
- `point_of_sale`: Módulo base del Punto de Venta de Odoo
- `l10n_ar`: Localización argentina para Odoo
- `l10n_ar_edi`: Facturación electrónica oficial para Argentina en Odoo Enterprise

## Configuración

En la configuración del Punto de Venta se agregaron las siguientes opciones:

### Facturar automáticamente
Activa por defecto el botón de facturar en la pantalla de pago del POS.

### Mostrar N° Factura
Muestra en el ticket los datos de la factura y CAE (si el diario seleccionado es factura electrónica).

### Mostrar CUIT del cliente
Incluye los datos fiscales del cliente en el ticket.

## Compatibilidad
- Odoo 17.0 Enterprise
- Localización Argentina (probado con la localización de a2systems)

## Ejemplo de Ticket

El módulo genera tickets como el siguiente:

```
            Tienda
    (AR) Responsable Inscripto
       Tel.:+1 555 123 8069
        CUIT: 30111111118
    Ing. Brutos: 901-21885123
     Inicio de actividades:
     IVA Responsable Inscripto
Dirección: Calle Falsa 123, Rosario

       FACTURA A COD. 1
     N°: 01001-00000053
    FECHA: 19/05/2025 17:11:25

         Cliente: ADHOC SA
         CUIT: 30714295698
Responsabilidad: IVA Responsable Inscripto
Dirección: Ovidio Lagos 41 bis, Rosario
Email: contacto@adhoc.ar | Tel.: (+54) (341) 208 0203

         Cajero: Mitchell Admin
                 602

Alfombrilla de escritorio           $ 2,40
1,00 Unidades x $ 2,40 / Unidades

Bandeja de cartas                   $ 5,30
1,00 Unidades x $ 5,30 / Unidades

Escritorio personalizable          $ 907,50
(Acero, Blanco)
1,00 Unidades x $ 907,50 / Unidades

Subtotal:                        $ 4.062,98
IVA 21%                            $ 852,22
IVA 10.5%                            $ 0,50
Perc IVA A                           $ 0,00

TOTAL                           $ 4.915,70

Efectivo                          4.915,70
CAMBIO                              $ 0,00

Estos son términos y condiciones de la factura

           ARCA
Agencia de Recaudación y Control Aduanero

CAE: 75208236041225
Vto. CAE: 2025-05-29

Este es es un pie de pagina
```

## Contribuciones
- Ariel Aranda <pushnube@gmail.com>
- Gabriela Rivero <regaby@gmail.com>
- Mario Nuñez <marionumza@gmail.com>
- Lucas L. Soto
- Claude (Anthropic)
- ChatGPT (OpenAI)

## Licencia
LGPL-3
