sap.ui.define([], function() {
	"use strict";
	return {
		status: function(value) {
			if (typeof value === "string") {
				switch (value) {
					case "01":
						return true;
					default:
						return false;
				}
			}
		},
		year: function(value) {
			var returnBoolean = false;
			if (value) {
				var yearNow = new Date().getFullYear().toString();
				if (yearNow === value) {
					returnBoolean = true;
				}
			}
			return returnBoolean;
		},
		color: function(value) {
			if (typeof value === "string") {
				var state = value.toLowerCase();
				switch (state) {
					case "01":
						return null;
					case "02":
						return "Warning";
					case "03":
						return "Success";
					case "04":
						return "Error";
					case "06":
						return "Success";
					default:
						return "None";
				}
			}
		},
		icon: function(value) {
			if (typeof value === "string") {
				var state = value.toLowerCase();
				switch (state) {
					case "01":
						return "sap-icon://detail-view";
					case "02":
						return "sap-icon://cause";
					case "03":
						return "sap-icon://accept";
					case "04":
						return "sap-icon://cancel";
					case "06":
						return "sap-icon://accept";
					default:
						return "sap-icon://overflow";
				}
			}
		}
	};

});