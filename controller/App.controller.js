sap.ui.define([
	"ZHR_GRADE_LIST/ZHR_GRADE_LIST/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ZHR_GRADE_LIST.ZHR_GRADE_LIST.controller.App", {

		onInit: function() {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			var component = this.getOwnerComponent();
			// disable busy indication when the metadata is loaded and in case of errors
			component.getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			component.getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(component.getContentDensityClass());

			// Set default years
			var beginYear = 2019;
			var presentYear = new Date().getFullYear();
			var years = [];
			for (var i = beginYear; i <= presentYear; i++) {
				var year = {
					text: i,
					key: i
				};
				years.push(year);
			}
			oViewModel.setProperty("/years", years);
			oViewModel.setProperty("/presentYear", presentYear-1);
		}
	});

});