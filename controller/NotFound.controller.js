sap.ui.define([
		"ZHR_GRADE_LIST/ZHR_GRADE_LIST/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("ZHR_GRADE_LIST.ZHR_GRADE_LIST.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);