/* eslint-disable init-declarations */
/* Copyright 2019 Tecnativa - Ernesto Tejeda
 * Copyright 2022 Tecnativa - Víctor Martínez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */
odoo.define(
    "sale_layout_category_hide_detail.sale_layout_category_hide_detail",
    function (require) {
        "use strict";

        var sectionAndNoteListRenderer = require("account.section_and_note_backend");

        var SectionAndNoteListRenderer = {
            // start-custom
            _getExtaFieldsCustom: function () {
                return ["price_unit", "product_uom_qty", "quantity"];
            },
            _getIndextExtraFieldCustom: function () {
                var extra_fields = this._getExtaFieldsCustom();
                var res = 0;
                this.columns.forEach(function (elem, index) {
                    if (extra_fields.includes(elem.attrs.name) && res === 0) {
                        res = index;
                    }
                });
                return res;
            },
            // _allowRemoveClassHidden: function (name) {
            //     if(this._getExtaFieldsCustom().includes(name)) return true;
            //     return this._super.apply(this, arguments);
            // },
            _getColspanExtraTd: function () {
                var total =
                    this._getNumberOfCols() -
                    this._getColspanSectionName() -
                    this._getNumberOfEditableFields() -
                    this._getNumberOfLineSectionFields();
                // total--;
                total++;
                if (this.addTrashIcon) total--;
                return total;
            },
            // end-custom
            // sale_layout_category_hide_detail
            _getOptionValueFromField: function (name, option) {
                if(this._getExtaFieldsCustom().includes(name)) return true;
                if (name in this.state.fieldsInfo.list) {
                    return this.state.fieldsInfo.list[name].options[option];
                }
                return false;
            },
            _allowRemoveClassHidden: function (name) {
                return this._getOptionValueFromField(name, "show_in_line_section");
            },
            _renderBodyCell: function (record, node) {
                var $cell = this._super.apply(this, arguments);
                var isSection = record.data.display_type === "line_section";
                var isNote = record.data.display_type === "line_note";
                if (isSection || isNote) {
                    if (this._allowRemoveClassHidden(node.attrs.name)) {
                        return $cell.removeClass("o_hidden");
                    } else if (node.attrs.name === "name") {
                        $cell.attr("colspan", this._getColspanSectionName());
                    }
                }
                return $cell;
            },
            _getColspanSectionName: function () {
                var index_start = 0;
                var index_end = this._getIndextExtraFieldCustom();
                this.columns.forEach(function (elem, index) {
                    if (elem.attrs.name === "name") {
                        index_start = index;
                    }
                });
                return index_end - index_start + 1;
            },
            _getNumberOfLineSectionFields: function () {
                var section_fields_count = 0;
                var self = this;
                this.columns.forEach(function (elem) {
                    if (
                        self._getOptionValueFromField(
                            elem.attrs.name,
                            "show_in_line_section"
                        )
                    ) {
                        section_fields_count++;
                    }
                });
                return section_fields_count;
            },
            _renderHeaderCell: function (node) {
                var $th = this._super.apply(this, arguments);
                if (!(node.attrs.name in this.state.fieldsInfo.list)) {
                    return $th;
                }
                if (
                    this._getOptionValueFromField(
                        node.attrs.name,
                        "show_in_line_section"
                    )
                ) {
                    $th.text("").removeClass("o_column_sortable");
                }
                return $th;
            },
            _getColumnWidth: function (column) {
                var res = this._super.apply(this, arguments);
                if (column.attrs.widget === "boolean_fa_icon") res = "";
                return res;
            },
            _getNumberOfEditableFields: function () {
                var total = 0;
                var extra_fields = this._getExtaFieldsCustom();
                this.columns.forEach(function (elem) {
                    if (extra_fields.includes(elem.attrs.name)) total++
                });
                return total;
            },
            _renderRow: function (record) {
                var $row = this._super.apply(this, arguments);
                if (record.data.display_type) {
                    var template = "<td colspan='%s'></td>";
                    $row.find(".o_boolean_fa_icon_cell")
                        .first()
                        .before(_.str.sprintf(template, this._getColspanExtraTd()));
                }
                return $row;
            },
        };

        sectionAndNoteListRenderer.include(SectionAndNoteListRenderer);
    }
);
