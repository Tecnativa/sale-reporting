# Copyright 2018-2019 Tecnativa - Ernesto Tejeda
# Copyright 2022 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import api, fields, models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    show_details = fields.Boolean(string="Show details", default=True)
    show_section_subtotal = fields.Boolean(
        default=True,
        help="Uncheck this if you want to hide the subtotal on section part",
    )
    show_subtotal = fields.Boolean(string="Show subtotal", default=True)
    show_line_amount = fields.Boolean(string="Show line amount", default=True)

    """Overwrite to allow set price and quantity in section lines"""
    _sql_constraints = [
        ('non_accountable_null_fields',
            "CHECK(display_type IS NULL OR (product_id IS NULL AND product_uom IS NULL AND customer_lead = 0))",
            "Forbidden values on non-accountable sale order line"),
    ]

    def _prepare_invoice_line(self, **optional_values):
        res = super()._prepare_invoice_line(**optional_values)
        res.update(
            show_details=self.show_details,
            show_subtotal=self.show_subtotal,
            show_line_amount=self.show_line_amount,
            show_section_subtotal=self.show_section_subtotal,
        )
        return res

    @api.onchange("display_type")
    def _onchange_parent_id(self):
        """We need to avoid defining quantity 1 when adding a section."""
        if self.display_type and not self.name:
            self.product_uom_qty = 0

    def _compute_amount(self):
        """Necesitamos sobrescribir la función para que se ignoren las líneas de sección"""
        _self = self.filtered(lambda x: not x.display_type)
        super(SaleOrderLine, _self)._compute_amount()
