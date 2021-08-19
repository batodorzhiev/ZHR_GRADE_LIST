/*global location*/
sap.ui.define([
	"ZHR_GRADE_LIST/ZHR_GRADE_LIST/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"ZHR_GRADE_LIST/ZHR_GRADE_LIST/model/formatter"
], function(BaseController, JSONModel, History, formatter) {
	"use strict";

	return BaseController.extend("ZHR_GRADE_LIST.ZHR_GRADE_LIST.controller.Object", {

		formatter: formatter,
		onInit: function() {
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			// Scroll to last item in timeline
			this.byId("timeline").addEventDelegate({
				onAfterRendering: function(e) {
					var items = e.srcControl.getContent();
					if (items.length > 0) {
						items[items.length - 1].focus();
						$(".sapMPageEnableScrolling").scrollTop(0);
					}
				}
			}, this);
		},
		_onObjectMatched: function(e) {
			var args = e.getParameter("arguments");
			this.username = args.username || sap.ushell.Container.getService("UserInfo").getId();
			this.year = args.year;
			this.pernr = args.pernr;
			if (this.username === "DEFAULT_USER") {
				this.username = "BDDORZHIEV";
			}
			this.getModel().metadataLoaded().then(function() {
				this.path = this.getModel().createKey("/PersonSet", {
					Uname: this.username,
					Year: this.year,
					Pernr: this.pernr,
					Reqid: "0"
				});
				this._bindView(this.path);
			}.bind(this));
			this.byId("page").setBusy(true);
		},
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						var path = this.getView().getElementBinding().getBoundContext().getPath();
						var data = this.getModel().getData(path);
						this.data = data;
						this.reqid = data.Reqid;
						oViewModel.setProperty("/busy", false);

						// Set app title for grade detail page with year
						var i18n = this.getResourceBundle();
						var appTitle = i18n.getText("appName", this.year);
						$('.sapUshellHeadTitle').text(appTitle);
					}.bind(this)
				}
			});
		},

		onSelectYear: function(e) {
			this.year = e ? e.getParameter("value") : this.year;
			var settings = {
				username: this.username,
				year: this.year,
				pernr: this.pernr
			};
			this.getRouter().navTo("object", settings);
		},

		_onBindingChange: function() {
			this.byId("page").setBusy(false);
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.Uname,
				sObjectName = oObject.Ename;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			this.addHistoryEntry({
				title: sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#ZHR_GRADE_LIST-display&/PersonSet/" + sObjectId + "/Year/" + this.year + "/Pernr/" + this.pernr
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			
			var container = $(".sapUShellApplicationContainer");
			if(container && !container.hasClass("sapUShellApplicationContainerLimitedWidth")){
				container.addClass("sapUShellApplicationContainerLimitedWidth");
			}
		},

		onExport: function() {
			var url = "/sap/opu/odata/sap/ZHR_KPI_APP_SRV/FileSet(ReqId='" + this.reqid + "',Filename='1',Year='" + this.year + "')/$value";
			window.open(url);
		}
	});
});