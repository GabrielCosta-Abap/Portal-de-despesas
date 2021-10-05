/*global QUnit*/

sap.ui.define([
	"queroquerons/conslandespesas/controller/ConsLanDespesas.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ConsLanDespesas Controller");

	QUnit.test("I should test the ConsLanDespesas controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
