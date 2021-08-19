/*global location history */
sap.ui.define([
	"ZHR_GRADE_LIST/ZHR_GRADE_LIST/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"ZHR_GRADE_LIST/ZHR_GRADE_LIST/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/MessageToast",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator, FilterType, MessageToast, Export, ExportTypeCSV) {
	"use strict";

	return BaseController.extend("ZHR_GRADE_LIST.ZHR_GRADE_LIST.controller.Worklist", {

		formatter: formatter,
		_filters: [],
		
		onInit: function() {
			var iOriginalBusyDelay;
			this.table = this.byId("table");
			this.page = this.byId("page");
			iOriginalBusyDelay = this.table.getBusyIndicatorDelay();
			this._aTableSearchState = [];
			var oViewModel = new JSONModel();
			this.setModel(oViewModel, "worklistView");
			this.table.attachEventOnce("updateFinished", function() {
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});

			this.page.setBusy(true);
			this.getRouter().getRoute("worklist").attachPatternMatched(this.onWorklist, this);
			oViewModel.setProperty("/worklistTableTitle", this.getResourceBundle().getText("worklistTableTitle"));
		},

		onBeforeRendering: function(){
			this.setFilter("Year", "EQ", this.getView().getModel("appView").getProperty("/presentYear"));
		},

		onWorklist: function(e) {
			var i18n = this.getResourceBundle();
			var appTitle = i18n.getText("appTitle");
			$('.sapUshellHeadTitle').text(appTitle);
			this.getModel().metadataLoaded().then(function() {
				this.getModel().setSizeLimit(10000);
			}.bind(this));
			var container = $(".sapUShellApplicationContainer");
			if(container && container.hasClass("sapUShellApplicationContainerLimitedWidth")){
				container.removeClass("sapUShellApplicationContainerLimitedWidth");
			}
		},

		onTableChange: function(e) {
			this.page.setBusy(false);
			var sTitle,
				iTotalItems = e.getSource().getLength();
			if (iTotalItems) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			sap.ushell.services.AppConfiguration.setApplicationFullWidth(true);
		},

		onPress: function(e) {
			if (e.getParameter("rowIndex") > -1) {
				var item = e.getParameter("rowContext");
				var uname = item.getProperty("Uname");
				var year = item.getProperty("Year");
				var procent = item.getProperty("Procent");
				var pernr = item.getProperty("Pernr");
				if (uname && procent) {
					this.getRouter().navTo("object", {
						username: uname,
						year: year,
						pernr: pernr
					});
				} else {
					var msg = this.getResourceBundle().getText("noUname");
					if (!procent) {
						msg = this.getResourceBundle().getText("inWork");
					}
					MessageToast.show(msg);
				}
			}
		},

		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		onFilter: function(e) {
			var input = e.getSource();
			this.setFilter(
				input.data("filter"),
				input.data("op") ? input.data("op") : "Contains",
				input.getValue()
			)
		},

		setFilter: function(path, operator, value){

			if (this._filters.length > 0) {

				var isFilterIsset = false;

				this._filters.forEach(function(f) {

					if (f.sPath === path) {
						f.oValue1 = value;
						f.sOperator = operator;
						isFilterIsset = true;
					}
				});

				if(!isFilterIsset){
					this._filters.push(
						new Filter(path, FilterOperator[operator], value)
					)
				}

				// Remove null values
				if (!value) {
					this._filters.forEach(function(f, i, array) {
						if (f.sPath === path) {
							array.splice(i, 1);
						}
					});
				}

			} else {

				this._filters = [ new Filter(path, FilterOperator[operator], value) ]
			}

		},

		onApplyFilters: function(oEvent){
			this.table.setBusy(true);
			this.getModel().resetChanges();
			this.setFilter('Suspended', 'EQ', 'false');

			this.byId("table")
				.getBinding("rows")
				.filter(this._filters, FilterType.Application);
		},


		onExport: function(e) {
			var button = e.getSource();
			var binding = this.byId("table").getBinding("rows");
			var filters = Array.isArray(binding.aFilters) ? binding.aFilters : [binding.aFilters];
			var i18n = this.getResourceBundle();
			var model = this.getModel();
			var busyIndicator = this.byId("busyIndicator");
			var path = "/PersonSet";
			busyIndicator.setVisible(true);
			button.setEnabled(false);
			model.read(path, {
				filters: filters,
				urlParameters: {
					$skip: 0,
					$top: 10000
				},
				success: function(data) {
					var dataModel = new JSONModel(data.results);
					var oExport = new Export({
						exportType: new ExportTypeCSV({
							separatorChar: ";"
						}),
						rows: {
							path: "/"
						},
						models: dataModel,
						columns: [{
							name: i18n.getText("tabNumber"),
							template: {
								content: "{Pernr}"
							}
						}, {
							name: i18n.getText("tableNameColumnTitle"),
							template: {
								content: "{Ename}"
							}
						}, {
							name: i18n.getText("position"),
							template: {
								content: "{Plnam}"
							}
						}, {
							name: i18n.getText("block"),
							template: {
								content: "{Block}"
							}
						}, {
							name: i18n.getText("department"),
							template: {
								content: "{Podrname}"
							}
						}, {
							name: i18n.getText("management"),
							template: {
								content: "{Dirname}"
							}
						}, {
							name: i18n.getText("sign1"),
							headerSpan: 2,
							template: {
								content: "{Approver1}"
							}
						}, {
							template: {
								content: "{= ${Apprflag1} ? 'Да' : 'Нет'}"
							}
						}, {
							name: i18n.getText("sign2"),
							headerSpan: 2,
							template: {
								content: "{Approver2}"
							}
						}, {
							template: {
								content: "{= ${Apprflag2} ? 'Да' : 'Нет'}"
							}
						}, {
							name: i18n.getText("sign3"),
							headerSpan: 2,
							template: {
								content: "{Approver3}"
							}
						}, {
							template: {
								content: "{= ${Apprflag3} ? 'Да' : 'Нет'}"
							}
						}, {
							name: i18n.getText("procent"),
							template: {
								content: "{Procent}"
							}
						}, {
							name: i18n.getText("dismissDate"),
							template: {
								content: "{Firedate}"
							}
						}]
					});
					oExport.saveFile().catch(function(oError) {
						MessageToast.show("Ошибка выгрузки данных");
					}).then(function() {
						busyIndicator.setVisible(false);
						button.setEnabled(true);
						oExport.destroy();
					});
				}
			});
		},

		onBusyChanged: function(e) {
			console.log(e);
		}

	});
});