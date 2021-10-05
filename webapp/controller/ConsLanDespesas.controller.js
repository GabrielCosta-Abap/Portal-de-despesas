sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/SelectDialog",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/ColumnListItem",
	"sap/ui/model/Sorter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (
		Controller,
		Core,
		HorizontalLayout,
		VerticalLayout,
		Dialog,
		DialogType,
		Button,
		ButtonType,
		Label,
		Select,
		SelectDialog,
		MessageToast,
		Text,
		TextArea,
		JSONModel,
		Filter,
		FilterOperator,
		Fragment,
		ColumnListItem,
		Sorter,
		Export,
		ExportTypeCSV) {
		"use strict";

		return Controller.extend("queroquerons.conslandespesas.controller.ConsLanDespesas", {

			oRoute: null,
			matricula: "",
			listFilters: [],

			onInit: function () {
				this.matricula = window.location.hash.replace('#','')

				this.oRoute = this.getOwnerComponent().getRouter()

				var route = this.getRouter().getRoute('RouteConsLanDespesas')
				route.attachPatternMatched(this.onPatternMatched)
				debugger
				// this.oRoute.attachPatternMatched(this.onPatternMatched)

				var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", { useBatch: false })
				this.getView().setModel(oModel);
				sap.ui.getCore().setModel(oModel);
				this.exibeLista()

				// if (this.getView().getModel("table") != undefined) {
				// 	this.getView().getModel("table").getData().DespesaFornecedorHeaderSet = [];
				// 	this.getView().getModel("table").updateBindings();
				// }

			},

			onPatternMatched: function () {
				// this.matricula = window.location.hash.replace('#','')
				this.exibeLista()
				
				if (!window.location.hash) {
					// implementar navegação para a tela de login
				}
				// window.alert('metchou a route brother')
				// window.location.reload()
			},

			exibeLista: function () {

				var oModel = this.getView().getModel()

				// Cria evento de popover para ordenação de colunas
				if (!this.oResponsivePopover) {
					this.oResponsivePopover = sap.ui.xmlfragment("queroquerons.conslandespesas.view.PopoverOrder", this);
					var that = this;
					var oTable = this.getView().byId("table");
					oTable.addEventDelegate({
						onAfterRendering: function () {
							var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
							for (var i = 0; i < oHeader.length; i++) {
								var oID = oHeader[i].id;
								that.onClick(oID);
							}
						}
					}, oTable);
				}

				// Busca filtros para trazer os dados da lista
				var aFilters = []

				var nSolic = this.byId('inputNumSolic').getValue()
				var oFilter = new sap.ui.model.Filter("Zpdsol", sap.ui.model.FilterOperator.EQ, nSolic);
				aFilters.push(oFilter);


				if (this.byId('idDtSolic').getFrom()) {
					var dtSolic = this.byId('idDtSolic').getFrom().toLocaleDateString().split("/")
					var dtIni = dtSolic[2] + dtSolic[1] + dtSolic[0];

					var oFilter = new sap.ui.model.Filter("Zpudt", sap.ui.model.FilterOperator.EQ, dtIni);
					aFilters.push(oFilter);

					var dtSolic = this.byId('idDtSolic').getTo().toLocaleDateString().split("/")
					var dtFim = dtSolic[2] + dtSolic[1] + dtSolic[0];
					var oFilter = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.EQ, dtFim);
					aFilters.push(oFilter);
				}

				var sTipo = this.byId('idTipoInput').getSelectedKey()
				var oFilter = new sap.ui.model.Filter("Zldesp", sap.ui.model.FilterOperator.EQ, sTipo);
				aFilters.push(oFilter);

				var sFornec = this.byId('InputFornec').getValue()
				var oFilter = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sFornec);
				aFilters.push(oFilter);

				var docSap = this.byId('InputDocSap').getValue()
				var oFilter = new sap.ui.model.Filter("Belnr", sap.ui.model.FilterOperator.EQ, docSap);
				aFilters.push(oFilter);

				var oFilter = new sap.ui.model.Filter("Banfn", sap.ui.model.FilterOperator.EQ, docSap);
				aFilters.push(oFilter);

				if (this.byId('InputDataVenc').getFrom()) {
					var dtVenc = this.byId('InputDataVenc').getFrom().toLocaleDateString().split("/")
					var dtIni = dtVenc[2] + dtVenc[1] + dtVenc[0];
					var oFilter = new sap.ui.model.Filter("Zfbdt", sap.ui.model.FilterOperator.EQ, dtIni);
					aFilters.push(oFilter);

					var dtVenc = this.byId('InputDataVenc').getTo().toLocaleDateString().split("/")
					var dtFim = dtVenc[2] + dtVenc[1] + dtVenc[0];
					var oFilter = new sap.ui.model.Filter("Zfdtag", sap.ui.model.FilterOperator.EQ, dtFim);
					aFilters.push(oFilter);
				}

				var sStatus = this.byId('status').getSelectedKey()
				var oFilter = new sap.ui.model.Filter("Zstats", sap.ui.model.FilterOperator.EQ, sStatus);
				aFilters.push(oFilter);

				var sAprovador = this.byId('inputSolicAprov').getValue()
				var oFilter = new sap.ui.model.Filter("Cname", sap.ui.model.FilterOperator.EQ, sAprovador);
				aFilters.push(oFilter);

				var oTableTemplate = new sap.m.ColumnListItem({
					unread: false,
					vAlign: "Middle",
					type: "Navigation",
					press: this.onItemPress,
					detailPress: this.onItemPress,
					cells:
						[
							// add created controls to item
							new sap.m.Text({ text: '{Zpdsol}' }),
							new sap.m.Text({ text: '{Zpdnum}' }),
							new sap.m.Text({
								text: {
									path: 'Zpudt',
									formatter: this.formatDate
								}
							}),
							new sap.m.Text({
								text: {
									path: 'Zldesp',
									formatter: this.formataTipoDespesa
								}
							}),
							new sap.m.Text({
								text: {
									path: 'Name1',
									formatter: this.formatName1
								}
							}),
							new sap.m.Text({ text: "{= ${Belnr} ? ${Belnr} : ${Banfn} }" }),
							new sap.m.Text({
								text: {
									path: 'Zfbdt',
									formatter: this.formatDate
								}
							}),
							new sap.m.Text({
								text: {
									path: 'Wrbtr',
									formatter: this.formatCurrency
								}
							}),
							new sap.m.Text({
								text: {
									path: 'Zstats',
									formatter: this.formatStatus
								}
							}),
							new sap.m.Button({
								press: this.handlePopoverPress,
								type: {
									path: 'Zstats',
									formatter: this.setButtonColor
								},
								text: {
									path: 'Nameaprov',
									formatter: this.formatAprovador
									// path: 'Zpdsol',
									// formatter: this.getAprovador
								}
							}),

						]
				})

				// Chama o serviço para binding da lista
				this.getView().byId('table').bindAggregation('items', {
					path: '/DespesaFornecedorHeaderSet',
					template: oTableTemplate,
					filters: aFilters

				})


				this.listFilters = aFilters

				oModel.read("/DespesaFornecedorHeaderSet", {
					async: true,
					filters: aFilters,
					success: function (oData) {
						var arrItens = []
						for (var i = 0; i < oData.results.length; i++) {
							//delete oData.results[i].Mandt;
							var itemList = {};
							itemList.Zpdsol = oData.results[i].Zpdsol;
							itemList.Zpdnum = oData.results[i].Zpdnum;
							itemList.Zpudt = oData.results[i].Zpudt;
							itemList.Zldesp = oData.results[i].Zldesp;
							itemList.Lifnr = oData.results[i].Lifnr;
							itemList.Belnr = oData.results[i].Belnr;
							itemList.Zfbdt = oData.results[i].Zfbdt;
							itemList.Wrbtr = oData.results[i].Wrbtr;
							itemList.Zstats = oData.results[i].Zstats;
							itemList.Cname = oData.results[i].Nameaprov;
							arrItens.push(itemList);
						}
						this.OrcamentoModel = new sap.ui.model.json.JSONModel({
							OrcamentoSet: arrItens
						});
						this.OrcamentoModel.setDefaultBindingMode("TwoWay");
						this.OrcamentoModel.updateBindings();
						this.getView().setModel(this.OrcamentoModel, "OrcamentoModel");
						sap.ui.getCore().setModel(this.OrcamentoModel, "OrcamentoModel");

					}.bind(this),
					error: function (evt) {
					}
				});



			},

			onClick: function (oID) {
				var that = this;
				$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
					var oTarget = oEvent.currentTarget; //Get hold of Header Element
					var oIndex = oTarget.id.slice(-2).replace("o", "").replace('n', ''); //Get the column Index
					var oModel = sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet; //Get Hold of Table Model Values
					var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
					oModel.bindingValue = oKeys[oIndex];
					// if (oModel.bindingValue != 'Zpdsol'){
					// 	oModel.bindingValue = oKeys[oIndex + 1];
					// }
					that.oResponsivePopover.openBy(oTarget);
				});
			},

			onAscending: function (e) {
				var oTable = this.getView().byId("table");
				var oItems = oTable.getBinding("items");
				var oBindingPath = sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet.bindingValue
				var oSorter = new sap.ui.model.Sorter(oBindingPath);
				oItems.sort(oSorter);
				this.oResponsivePopover.close();
			},

			onDescending: function (e) {
				var oTable = this.getView().byId("table");
				var oItems = oTable.getBinding("items");
				var oBindingPath = sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet.bindingValue
				var oSorter = new sap.ui.model.Sorter(oBindingPath, true);
				oItems.sort(oSorter);
				this.oResponsivePopover.close();
			},

			onDataExport: function (e) {
				var oExport = new Export({
					exportType: new ExportTypeCSV({
						separatorChar: "\t",
						mimeType: "application/vnd.ms-excel",
						charset: "utf-8",
						fileExtension: "xls"
					}),
					//sap.ui.getCore().getModel("OrcamentoModel").getData().OrcamentoSet
					models: sap.ui.getCore().getModel("OrcamentoModel"),
					rows: {
						path: "/OrcamentoSet"
					},
					columns: [
						{
							name: "Solicitacao",
							template: {
								content: "{Zpdsol}"
							}

						},
						{
							name: "Data Solicitacao",
							template: {
								content: {
									parts: ["Zpudt"],
									formatter: function (oValue) {
										//console.log(oValue)
										if (oValue == null)
											return "";
										return oValue.substr(6, 2) + "/" + oValue.substr(4, 2) + "/" + oValue.substr(0, 4);
									}
								}
							}
						},
						{
							name: "Tipo",
							template: {
								content: {
									parts: ['Zldesp'],
									formatter: this.formataTipoDespesaExcel
								}
							}
						},
						{
							name: "Fornecedor",
							template: {
								content: "{Lifnr}"
							}
						},
						{
							name: "Documento SAP",
							template: {
								content: "{Belnr}"
							}
						},
						{
							name: "Data Vcto",
							template: {
								content: {
									parts: ["Zfbdt"],
									formatter: function (oValue) {
										//console.log(oValue)
										if (oValue == null)
											return "";
										return oValue.substr(6, 2) + "/" + oValue.substr(4, 2) + "/" + oValue.substr(0, 4);
									}
								}
							}
						},
						{
							name: "Valor Total",
							template: {
								content : {
									parts : [ "Wrbtr" ],
									formatter : function(oValue) {
										//console.log(oValue)
										if (oValue == null)
											return "" ;
										return Intl.NumberFormat("pt-br", {
													style: "currency",
													currency: "BRL"
												}).format(oValue).replace("R$", "").replace(" ", "");
									}							
								}
							}
						},
						{
							name: "Status",
							template: {
								content: {
									parts: ['Zstats'],
									formatter: this.formatStatus
								}
							}
						},
						{
							name: "Aprovador",
							template: {
								content: "{Cname}"
							}
						}
					]
				});
				//* download exported file
				var fileName = "Despesas" + new Date().toLocaleString().replaceAll("/", "").replaceAll(":", "").replaceAll(" ", "")
				oExport.saveFile(fileName).always(function () {
					this.destroy();
				});
			},

			getRouter: function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
			onNavBack: function (oEvent) {
				// this.oRoute.navTo('RouteHome')
				window.history.go(-1);
			},
			onCriaSolic: function (oEvent) {
				if (!this.oCriaSolicDialog) {
					this.oCriaSolicDialog = new Dialog({
						title: "Criar nova solicitação",
						type: DialogType.Message,
						content: [
							new Label({
								text: "Tipo de despesa:",
								labelFor: "rejectionNote"
							}),
							new Select("InserirDespesa", {
								width: "100%",
								// placeholder: "Inserir tipo de despesa",
								items: [{
									key: "1",
									text: "1 - Lançamento despesas fornecedor",
								},
								{
									key: "2",
									text: "2 - Prestação de contas reembolso de viagens"
								},
								{
									key: "3",
									text: "3 - Requisição de compras"
								}]
							})

						],
						beginButton: new Button({
							type: ButtonType.Emphasized,
							text: "Avan\u00E7\ar",
							press: function (oEvent) {
								var sText = this.oCriaSolicDialog.getContent()[1].getSelectedItem().getProperty('key')

								/////////////////////////////////////////////////////////////////////////
								//  CRIAÇÃO DA SOLICITAÇÃO 
								/////////////////////////////////////////////////////////////////////////
								var parametro = {
									matricula: window.location.hash.replace('#', '')
								}
								switch (sText) {
									case '1':
										var routeHash = 'RouteTipo1'
										this.oRoute.navTo(routeHash, parametro)
										break;
									case '2':
										var routeHash = 'RouteTipo2'
										this.oRoute.navTo(routeHash, parametro)
										break;
									case '3':
										var routeHash = 'RouteTipo3'
										this.oRoute.navTo(routeHash, parametro)
										break;
								}

								this.oCriaSolicDialog.close();

							}.bind(this)
						}),
						endButton: new Button({
							text: "Voltar",
							press: function () {
								this.oCriaSolicDialog.close();
							}.bind(this)
						})
					});
				}

				this.oCriaSolicDialog.open();
			},

			onItemPress: function (oEvent) {
				var oSolic = oEvent.getSource().getCells()[0].getProperty('text')
				var oLine = {
					Zpdsol: oSolic.replace("/", "%2F"),
					Usnam: window.location.hash.replace('#', '')
				}

				var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
				that.oRoute.navTo('RouteDetail', oLine)
			},

			onLiveChange: function (oEvent) {
				var oSource = oEvent.getSource() // pega o searchField
				var oParameters = oEvent.getParameters()
				var sTerm = oParameters.newValue //termo de busca
				var oTable = this.getView().byId('table')

				debugger

				sTerm = sTerm.toString()

				var aFilters = []
				if (sTerm) {
					var oFilter = new Filter({
						path: "solicitacao",
						operator: FilterOperator.Contains,
						value1: sTerm
					})
					aFilters.push(oFilter)
				}
				var oBinding = oTable.getBinding('items')
				oBinding.filter([aFilters])
			},
			handleSuggest: function (oEvent) {
				var sTerm = oEvent.getParameter("suggestValue");
				var aFilters = [];
				if (sTerm) {
					aFilters.push(new Filter("Name", sap.ui.model.FilterOperator.StartsWith, sTerm));
				}
				oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
			},

			tipoDespesa: function (tipo) {

				return 'teste formatter tpo despesa'
			},

			onNavBack: function (oEvent) {
				window.history.go(-1);
			},

			formataValorLista: function (Wrbtr) {
				debugger
				// return Wrbtr.toFixed(2)
			},

			formatDate: function (oDate) {

				if (oDate != null) {
					var dia = oDate.substring(6, 8)
					var mes = oDate.substring(4, 6)
					var ano = oDate.substring(0, 4)
					var data = dia + '/' + mes + '/' + ano
					return data
				}
			},

			formataTipoDespesa: function(Tipo) {

				if (!Tipo) {
					return
				}

				if (Tipo.includes('1')) {
					return 'Despesa Fornecedor'
				} else if (Tipo.includes('2')) {
					return 'Reembolso de viagem'
				} else if (Tipo.includes('3')) {
					return 'Requisição de compra'
				}
			},

			formataTipoDespesaExcel: function(Tipo){
				if (!Tipo) {
					return
				}

				if (Tipo.includes('1')) {
					return 'Despesa Fornecedor'
				} else if (Tipo.includes('2')) {
					return 'Reembolso de viagem'
				} else if (Tipo.includes('3')) {
					return 'Requisicao de compra'
				}
			},

			formatStatus: function (status) {

				if (!status) {
					return
				}

				if (status.includes('1')) {
					return 'Pendente'
				} else if (status.includes('2')) {
					return 'Aprovado'
				} else if (status.includes('3')) {
					return 'Rejeitado'
				}
			},

			formatName1: function (Name1) {
				if (Name1) {
					var primeiroNome = Name1.split(' ')[0]
					var ultimoNome = Name1.split(' ')[Name1.split(' ').length - 1]

					primeiroNome = primeiroNome[0].toUpperCase() + primeiroNome.substring(1).toLowerCase()
					ultimoNome = ultimoNome[0].toUpperCase() + ultimoNome.substring(1).toLowerCase()

					var nomeFormatado = primeiroNome + ' ' + ultimoNome
					return nomeFormatado
				}

			},

			formatCurrency: function (Wrbtr) {

				if (!Wrbtr) {
					return
				}

				return Intl.NumberFormat('pt-br', {
					style: 'currency',
					currency: 'BRL'
				}).format(Wrbtr).replace("R$", "").replace("\u00A0", "");

			},

			formatAprovador: function(aprovador){
				var primeiroNome = aprovador.split(' ')[0]
				var ultimoNome = aprovador.split(' ')[aprovador.split(' ').length - 1]

				if(aprovador){
					primeiroNome = primeiroNome[0].toUpperCase() + primeiroNome.substring(1).toLowerCase()
					ultimoNome = ultimoNome[0].toUpperCase() + ultimoNome.substring(1).toLowerCase()
	
					var nomeFormatado = primeiroNome + ' ' + ultimoNome
					return nomeFormatado
				}
				return 'Não encontrado'
			},

			getAprovador: function (Solicitacao) {
				if (!Solicitacao) {
					return
				}
				var oView = this.getParent().getParent().getParent().getParent().getParent().getParent().getParent().getMetadata()
				var solic = Solicitacao.replace('/', '%2F')

				var that = this

				var lModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", { useBatch: false })

				lModel.read("/DespesaFornecedorHeaderSet(Zpdsol='" + solic + "')", {
					success: function (data, response) {

						var aFilter = []

						var oFilterTableNo = new sap.ui.model.Filter("Bukrs",
							sap.ui.model.FilterOperator.EQ,
							data.Bukrs);
						aFilter.push(oFilterTableNo)

						var oFilterTableNo = new sap.ui.model.Filter("Gjahr",
							sap.ui.model.FilterOperator.EQ,
							data.Gjahr);
						aFilter.push(oFilterTableNo)

						let dataLanc = data.Budat.substring(6, 8) + data.Budat.substring(4, 6) + data.Budat.substring(0, 4)

						var oFilterTableNo = new sap.ui.model.Filter("BudatIni",
							sap.ui.model.FilterOperator.EQ,
							dataLanc);
						aFilter.push(oFilterTableNo)

						var oFilterTableNo = new sap.ui.model.Filter("BudatFim",
							sap.ui.model.FilterOperator.EQ,
							dataLanc);
						aFilter.push(oFilterTableNo)

						var oFilterTableNo = new sap.ui.model.Filter("Belnr",
							sap.ui.model.FilterOperator.EQ,
							data.Belnr || data.Banfn );
						aFilter.push(oFilterTableNo)

						lModel.read("/AprovadorSet", {
							filters: aFilter,
							success: function (data, response) {

								data.results.forEach(function (aprovadores) {
									if (aprovadores.Nomeaprov) {

										var solicTable = that.getParent().getParent()

										solicTable.getItems().forEach(function (item) {
											if (item.getCells()[0].getProperty('text') == Solicitacao) {

												var primeiroNome = aprovadores.Nomeaprov.split(' ')[0]
												var ultimoNome = aprovadores.Nomeaprov.split(' ')[aprovadores.Nomeaprov.split(' ').length - 1]

												primeiroNome = primeiroNome[0].toUpperCase() + primeiroNome.substring(1).toLowerCase()
												ultimoNome = ultimoNome[0].toUpperCase() + ultimoNome.substring(1).toLowerCase()

												item.getCells()[9].setProperty('text', primeiroNome + ' ' + ultimoNome)
												if (!primeiroNome) {
													item.getCells()[9].setProperty('text', 'Não encontrado')
													item.getCells()[8].setProperty('text', 'N/A')
												}
											}
										})
									}
								})

								solicTable.getItems().forEach(function (item) {
									if (!item.getCells()[9].getProperty('text')) {
										item.getCells()[9].setProperty('text', 'Não encontrado')
										item.getCells()[8].setProperty('text', 'N/A')
									}
								})

							}.bind(this),
							error: function (response) {
								var solicTable = that.getParent().getParent()

								solicTable.getItems().forEach(function (item) {
									if (!item.getCells()[9].getProperty('text')) {
										item.getCells()[9].setProperty('text', 'Não encontrado')
										item.getCells()[8].setProperty('text', 'N/A')
									}
								})
							}.bind(this)

						})

					}.bind(this),
					error: function (response) {
						debugger
					}.bind(this)

				})
			},

			handlePopoverPress: function (oEvent) {
				var oButton = oEvent.getSource();

				var oView = oButton.getParent().getParent().getParent().getParent().getParent().getParent().getParent()
				var that = oView.getController();

				var status = oEvent.getSource().getParent().getCells()[8].getText()
				if (status != 'Rejeitado') {
					return
				}

				var zpdsol = oEvent.getSource().getParent().getCells()[0].getText().replace('/', '%2F')

				// create popover
				if (!that._pPopover) {
					that._pPopover = sap.ui.core.Fragment.load({
						id: oView.getId(),
						name: "queroquerons.conslandespesas.view.Popover",
						controller: that
					}).then(function (oPopover) {
						oView.addDependent(oPopover);
						oPopover.unbindElement()
						oPopover.bindElement("/DespesaFornecedorHeaderSet(Zpdsol='" + zpdsol + "')");
						return oPopover;
					});
				}

				that._pPopover.then(function (oPopover) {
					oPopover.unbindElement()
					oPopover.bindElement("/DespesaFornecedorHeaderSet(Zpdsol='" + zpdsol + "')");
					oPopover.openBy(oButton);
				});
			}.bind(this),

			setButtonColor: function (status) {
				if (status.includes('1')) {
					return 'Default'
				} else if (status.includes('2')) {
					return 'Accept'
				} else if (status.includes('3')) {
					return 'Reject'
				}
			},

			handleEmailPress: function (oEvent) {
				this.byId("myPopover").close();
			},

			clearAll: function () {
				window.history.go(-1);
				// var sUrl = window.location.protocol + '//' + window.location.host + '/sap/bc/bsp/sap/zportal_home/index.html' + '#' + this.matricula
				// window.location.replace(sUrl)
			},

			onLifnrMatchCode: function (oEvent) {

				this.selItem = oEvent.getSource().getParent()
				this.inputId = oEvent.getSource().getId();

				var sName = "queroquerons.conslandespesas.view.ValuesHelpFornec"

				var oButton = oEvent.getSource()
				var oView = this.getView();

				if (!this._lDialog) {
					this._lDialog = Fragment.load({
						id: oView.getId(),
						name: sName,
						controller: this
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						return oDialog;
					});
				}
				this._lDialog.then(function (oDialog) {
					// Set growing if required
					var bGrowing = !!oButton.data("growing");
					oDialog.setGrowing(bGrowing);
					oDialog.setTitle('Fornecedor')
					oDialog.open();
				}.bind(this));

			},

			onLiveChangeLifnr: function (oEvent) {
				var oParameters = oEvent.getParameters()
				var sTerm = oParameters.value //termo de busca
				var binding = oEvent.getParameter("itemsBinding");
				var value = oEvent.getParameter("value");

				var sTerm = "Lifnr"
				var Stxt = "Name1"

				var aFilters = []

				if (value && Stxt) {
					var filter = new sap.ui.model.Filter(sTerm, sap.ui.model.FilterOperator.EQ, value);
					aFilters.push(filter)

					var filter = new sap.ui.model.Filter(Stxt, sap.ui.model.FilterOperator.EQ, value);
					aFilters.push(filter)
				}
				binding.filter(aFilters);
			},

			onConfirm: function (oEvent) {
				var selLifnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Lifnr
				if (selLifnr) {
					this.getView().byId('InputFornec').setValue(selLifnr)
				}
			},

			onFilterClear: function (oEvent) {

				this.byId('inputNumSolic').setValue()
				this.byId('idDtSolic').setFrom()
				this.byId('idTipoInput').setSelectedKey()
				this.byId('InputFornec').setValue()
				this.byId('InputDocSap').setValue()
				this.byId('InputDataVenc').setFrom()
				this.byId('InputDataVenc').setTo()
				this.byId('status').setSelectedKey()
				this.byId('inputSolicAprov').setValue()

			},

			navBack: function(){
				var url = window.location.protocol + "//" + window.location.host + "/sap/bc/bsp/sap/zportal_home/index.html" + "#" + this.matricula;
				window.location.replace(url)
			}

		},
		);
	});
