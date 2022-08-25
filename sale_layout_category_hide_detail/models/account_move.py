# Copyright 2018-2019 Tecnativa - Ernesto Tejeda
# Copyright 2022 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import _, api, fields, models
from odoo.exceptions import UserError


class AccountMove(models.Model):
    _inherit = "account.move"

    def _check_invoice_line_ids_amounts(self):
        for item in self:
            s_lines = item.invoice_line_ids.filtered(
                lambda x: x.display_type == "line_section"
            )
            if any(x.quantity and x.price_unit for x in s_lines):
                total_sections = (
                    sum(s_lines.mapped("quantity")) * sum(s_lines.mapped("price_unit"))
                )
                if total_sections != item.amount_total:
                    raise UserError(
                        _(
                            "The sum of the subtotals (%s) is different from "
                            "the invoice total (%s)."
                        ) % (total_sections, item.amount_total)
                    )

    def write(self, vals):
        res = super().write(vals)
        if vals.get("line_ids"):
            self._check_invoice_line_ids_amounts()
        return res


class AccountMoveLine(models.Model):
    _inherit = "account.move.line"

    show_details = fields.Boolean(string="Show details", default=True)
    show_subtotal = fields.Boolean(string="Show subtotal", default=True)
    show_section_subtotal = fields.Boolean(
        default=True,
        help="Uncheck this if you want to hide the subtotal on section part",
    )
    show_line_amount = fields.Boolean(string="Show line amount", default=True)

    @api.onchange("display_type")
    def _onchange_parent_id(self):
        """We need to avoid defining quantity 1 when adding a section."""
        if self.display_type and not self.name:
            self.quantity = 0

    def _get_fields_onchange_subtotal(self, price_subtotal=None, move_type=None, currency=None, company=None, date=None):
        res = super()._get_fields_onchange_subtotal(price_subtotal=price_subtotal, move_type=move_type, currency=currency, company=company, date=date)
        if self.display_type:
            res.update({
                "amount_currency": 0,
                "debit": 0,
                "credit": 0,
            })
        return res
