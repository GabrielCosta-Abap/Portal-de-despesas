sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Core",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/ui/model/Model",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/ui/core/routing/History",
    "sap/m/TextArea",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/ColumnListItem",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        Controller,
        Core,
        HorizontalLayout,
        VerticalLayout,
        Model,
        Dialog,
        DialogType,
        Button,
        ButtonType,
        Label,
        MessageToast,
        Text,
        History,
        TextArea,
        FilterOperator,
        Filter,
        ColumnListItem,
        JSONModel,
        Fragment) {
        "use strict";

        return Controller.extend("queroquerons.conslandespesas.controller.Detail", {

            oRoute: null,
            matricula: "",
            headerSolic: {},

            onInit: function () {

                window.addEventListener('popstate', (event) => {
                    this.clearAll()
                });

                this.oRoute = this.getOwnerComponent().getRouter()

                // var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/DespesaFornecedorHeaderSet")
                // this.getView().setModel('Header', oModel);

                // var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/DespesaItemSet")
                // this.getView().setModel('Item', oModel);

                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", { useBatch: false })
                // var oModel = new JSONModel("https://run.mocky.io/v3/6172c86f-4679-4d6f-853e-3cd671318963")
                this.getView().setModel(oModel);
                sap.ui.getCore().setModel(oModel)
                // debugger
                // this.setVisibleContent(1)

                // var oAttachmentUpl= this.byId('UploadSet').getDefaultFileUploader();
                // oAttachmentUpl.setIcon("sap-icon://add").setIconOnly(true);

                // var oAttachmentUpl= this.byId('tabAnexos').getDefaultFileUploader();
                // oAttachmentUpl.setIcon("").setIconOnly(true);

                var oRoute = this.getRouter().getRoute("RouteDetail");
                oRoute.attachPatternMatched(this.onPatternMatched, this);
            },

            onPatternMatched: function (oEvent) {
                var that = this
                var oHeader = {}
                oHeader.Zpdsol = oEvent.getParameters().arguments.Zpdsol
                var Zpdsol = oEvent.getParameters().arguments.Zpdsol

                that.matricula = oEvent.getParameters().arguments.Usnam

                this.getView().bindElement({
                    path: "/DespesaFornecedorHeaderSet(Zpdsol='" + oHeader.Zpdsol + "')/?$expand=DespesaFornecedorItens",
                });

                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", { useBatch: false })
                var oTable = this.getView().byId('NFTable')
                var anexoTab = this.getView().byId('AnexosTab')
                var aprovTab = that.getView().byId('tabAprovadores')

                var oDetalhesReembolso = this.getView().byId('detDespesasTable')
                var oItinerarioTab = this.getView().byId('itinerarioTab')
                var reqTab = this.getView().byId('reqTable')

                if (oTable.getItems().length > 0
                    || anexoTab.getItems().length > 0
                    || reqTab.getItems().length > 0
                    || aprovTab.getItems().length > 0) {
                    window.location.reload()
                }

                oModel.read("/DespesaFornecedorHeaderSet(Zpdsol='" + oHeader.Zpdsol + "')", {
                    urlParameters: {
                        "$expand": "DespesaFornecedorItens"
                    },
                    success: function (data, response) {

                        let localTable = new sap.m.Table()

                        data.DespesaFornecedorItens.results.forEach(function (item) {
                            var itemRow = new ColumnListItem({
                                type: sap.m.ListType.Inactive,
                                unread: false,
                                vAlign: "Middle",
                                cells:
                                    [
                                        // add created controls to item
                                        new sap.m.Input({ type: "Text", value: item.Buzei, width: "70%", editable: false }),
                                        new sap.m.Input({ type: "Text", value: item.Hkont, editable: false }),
                                        new sap.m.Input({ type: "Text", value: item.Sgtext, width: "112%", editable: false }),
                                        new sap.m.Input({ type: "Text", value: item.Aufnr, width: "112%", editable: false }),
                                        new sap.m.Input({ type: "Text", value: item.Kostl, editable: false }),

                                        new sap.m.Input({
                                            type: "Text",
                                            value: Intl.NumberFormat("pt-br", {
                                                style: "currency",
                                                currency: "BRL"
                                            }).format(item.Dmbtr).replace("R$", "").replace(" ", ""),
                                            width: "70%", editable: false
                                        }),

                                        new sap.m.Input({
                                            type: "Text",
                                            value: Intl.NumberFormat("pt-br", {
                                                style: "currency",
                                                currency: "BRL"
                                            }).format(item.Zportorc).replace("R$", "").replace(" ", ""),
                                            editable: false
                                        }),

                                        new sap.m.Input({
                                            type: "Text",
                                            value: Intl.NumberFormat("pt-br", {
                                                style: "currency",
                                                currency: "BRL"
                                            }).format(item.Zportdisp).replace("R$", "").replace(" ", ""),
                                            editable: false
                                        }),

                                        new sap.ui.core.Icon({
                                            src: "sap-icon://add",
                                        })
                                    ]
                            });
                            oTable.addItem(itemRow)

                            var dataDet = item.Bldat.substring(0, 2) + '/' + item.Bldat.substring(2, 4) + '/' + item.Bldat.substring(4, 8)

                            var zdescFilter = new sap.ui.model.Filter("ZdescDesp",
                                sap.ui.model.FilterOperator.EQ,
                                item.Zcdesp);

                            oModel.read('/DespesaViagemSet', {
                                filters: [zdescFilter],
                                success: function (data, response) {
                                    item.Zcdesp = item.Zcdesp + ' - ' + data.results[0].ZdescDesp

                                    var detDespItem = new ColumnListItem({
                                        type: sap.m.ListType.Inactive,
                                        unread: false,
                                        vAlign: "Middle",
                                        cells:
                                            [
                                                new sap.m.Input({ type: "Text", value: dataDet, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.Zcdesp, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.Hkont, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.Zpanexo, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.Sgtext, editable: false }),

                                                new sap.m.Input({
                                                    type: "Text",
                                                    value: Intl.NumberFormat("pt-br", {
                                                        style: "currency",
                                                        currency: "BRL"
                                                    }).format(item.Zpvlrpg).replace("R$", "").replace(" ", ""),
                                                    editable: false
                                                }),

                                                new sap.m.Input({
                                                    type: "Text",
                                                    value: Intl.NumberFormat("pt-br", {
                                                        style: "currency",
                                                        currency: "BRL"
                                                    }).format(item.Zpvlrrem).replace("R$", "").replace(" ", ""),
                                                    editable: false
                                                }),

                                                new sap.m.Input({ type: "Text", value: item.Docref, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.Kostl, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.Aufnr, editable: false }),

                                                new sap.m.Input({
                                                    type: "Text",
                                                    value: Intl.NumberFormat("pt-br", {
                                                        style: "currency",
                                                        currency: "BRL"
                                                    }).format(item.Zportorc).replace("R$", "").replace(" ", ""),
                                                    editable: false,
                                                    visible: false
                                                }),

                                                new sap.m.Input({
                                                    type: "Text",
                                                    value: Intl.NumberFormat("pt-br", {
                                                        style: "currency",
                                                        currency: "BRL"
                                                    }).format(item.Zportdisp).replace("R$", "").replace(" ", ""),
                                                    editable: false,
                                                    visible: false
                                                }),

                                                // new sap.ui.core.Icon({
                                                //     src: "sap-icon://add",
                                                // })
                                            ]
                                    });

                                    oDetalhesReembolso.addItem(detDespItem)

                                },
                                error: function (error) {
                                }
                            })

                        })

                        that.headerSolic = data

                        if (that.headerSolic.Zldesp.includes('1')) {
                            that.setVisibleContent(1)
                        } else if (that.headerSolic.Zldesp.includes('2')) {
                            that.setVisibleContent(2)
                        } else {
                            that.setVisibleContent(3)

                            var ReqUrl = "/RequisicaoCompraSet(Zpdsol='" + oHeader.Zpdsol + "')"

                            oModel.read(ReqUrl, {
                                urlParameters: {
                                    "$expand": "RequisicaoCompraItens"
                                },
                                success: function (data, response) {

                                    data.RequisicaoCompraItens.results.forEach(function (item) {
                                        var dataRemessa = item.Eeind.substring(6, 8) + '/' + item.Eeind.substring(4, 6) + '/' + item.Eeind.substring(0, 4)

                                        var itemReq = new ColumnListItem({
                                            type: sap.m.ListType.Inactive,
                                            unread: false,
                                            vAlign: "Middle",
                                            cells:
                                                [
                                                    // add created controls to item
                                                    new sap.m.Input({ type: "Text", value: item.Zitem, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Matnr, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Maktx, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Menge, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Meins, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Werks, editable: false }),
                                                    new sap.m.Input({
                                                        type: "Text",
                                                        value: Intl.NumberFormat("pt-br", {
                                                            style: "currency",
                                                            currency: "BRL"
                                                        }).format(item.Wrbtr).replace("R$", "").replace(" ", ""),
                                                        editable: false
                                                    }),

                                                    new sap.m.Input({ type: "Text", value: item.Matkl, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Lgort, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Aufnr, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: dataRemessa, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Knttp, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Saknr, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Kostl, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Anln1, editable: false }),
                                                    new sap.m.Input({ type: "Text", value: item.Anln2, editable: false }),
                                                    
                                                    new sap.m.Input({
                                                        type: "Text",
                                                        value: Intl.NumberFormat("pt-br", {
                                                            style: "currency",
                                                            currency: "BRL"
                                                        }).format(item.Preco).replace("R$", "").replace(" ", ""),
                                                        editable: false
                                                    }),

                                                    new sap.m.Input({ type: "Text", value: item.Ekgrp, editable: false }),
                                                    new sap.ui.core.Icon({
                                                        src: "sap-icon://add",
                                                    }),
                                                    new sap.ui.core.Icon({
                                                        src: "sap-icon://delete",
                                                    })
                                                ]
                                        });

                                        reqTab.addItem(itemReq)


                                    })

                                },
                                error: function (error) {
                                }
                            })


                        }

                        // that.matricula = that.headerSolic.Usnam

                        var oFilterItinerario = new sap.ui.model.Filter("Zpdsol",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Zpdsol);

                        oItinerarioTab.setBusy(true)
                        oModel.read('/ItinerarioSet', {
                            filters: [oFilterItinerario],
                            success: function (data, response) {

                                oItinerarioTab.setBusy(false)
                                data.results.forEach(function (item) {

                                    var itinerarioItem = new ColumnListItem({
                                        cells:
                                            [
                                                // add created controls to item
                                                new sap.m.Input({ type: "Text", value: item.Zitem, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.LocFrom, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.LocTo, editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.DepDate.replaceAll('.', '/'), editable: false }),
                                                new sap.m.Input({ type: "Text", value: item.Kmges, editable: false }),
                                                new sap.ui.core.Icon({
                                                    src: "sap-icon://add",
                                                })
                                            ]
                                    });

                                    oItinerarioTab.addItem(itinerarioItem)

                                })

                            }.bind(that),
                            error: function (oError) {
                                debugger
                            }.bind(that)
                        })

                        var oFilterTableNo = new sap.ui.model.Filter("Zlsch",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Zlsch);

                        oModel.read("/sh_zlschSet", {
                            filters: [oFilterTableNo],
                            success: function (data, response) {
                                this.getView().byId('txtFPgto').setProperty("text", data.results[0].Text1)
                            }.bind(that),
                            error: function (oError) {
                                debugger
                            }.bind(that)
                        })

                        var oFilterTableNo = new sap.ui.model.Filter("Zterm",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Zterm);

                        oModel.read("/SH_ZTERMSet", {
                            filters: [oFilterTableNo],
                            success: function (data, response) {
                                this.getView().byId('txtZterm').setProperty("text", data.results[0].Text1)
                            }.bind(that),
                            error: function (oError) {
                                debugger
                            }.bind(that)
                        })

                        var oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Bukrs);

                        oModel.read("/sh_bukrsSet", {
                            filters: [oFilterTableNo],
                            success: function (data, response) {
                                this.getView().byId('txtBukrs').setProperty("text", data.results[0].Butxt)
                                this.getView().byId('txtBukrsTipo3').setProperty("text", data.results[0].Butxt)
                            }.bind(that),
                            error: function (oError) {
                                debugger
                            }.bind(that)
                        })

                        var filterBsart = new sap.ui.model.Filter("Bsart",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Bsart);

                        oModel.read("/sh_bsartSet", {
                            filters: [filterBsart],
                            success: function (data, response) {
                                this.getView().byId('txtTipoReq').setProperty("text", data.results[0].Batxt)
                            }.bind(that),
                            error: function (oError) {
                                debugger
                            }.bind(that)
                        })

                        var filterGsber = new sap.ui.model.Filter("Gsber",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Pargb);

                        oModel.read("/sh_pargbSet", {
                            filters: [filterGsber],
                            success: function (data, response) {
                                this.getView().byId('txtCodAprov').setProperty("text", data.results[0].Gtext)
                            }.bind(that),
                            error: function (oError) {
                                debugger
                            }.bind(that)
                        })

                        var filterPernr = new sap.ui.model.Filter("Pernr",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Lifnr.substring(2, 10));

                        var area = that.getView().byId("area")
                        var cpf = that.getView().byId("cpf")
                        var banco = that.getView().byId("banco")
                        var agencia = that.getView().byId("agencia")
                        var bkont = that.getView().byId("bkont")
                        var alelo = that.getView().byId("alelo")
                        var celula = that.getView().byId("celula")

                        area.setBusy(true)
                        cpf.setBusy(true)
                        banco.setBusy(true)
                        agencia.setBusy(true)
                        bkont.setBusy(true)
                        alelo.setBusy(true)


                        oModel.read("/sh_pernrSet", {
                            filters: [filterPernr],
                            success: function (odata, response) {

                                area.setBusy(false)
                                cpf.setBusy(false)
                                banco.setBusy(false)
                                agencia.setBusy(false)
                                bkont.setBusy(false)
                                alelo.setBusy(false)

                                area.setValue(odata.results[0].ZPAREA)
                                cpf.setValue(odata.results[0].CPF)
                                banco.setValue(odata.results[0].BANCO)
                                agencia.setValue(odata.results[0].AGENCIA)
                                bkont.setValue(odata.results[0].CONTA)
                                alelo.setValue(odata.results[0].ZCHECKB)
                                celula.setValue(odata.results[0].ZPCELULA)
                            }.bind(that),
                            error: function (oError) {
                                debugger
                            }.bind(that)
                        })


                        var aFilter = []

                        var oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Bukrs);
                        aFilter.push(oFilterTableNo)

                        var oFilterTableNo = new sap.ui.model.Filter("Gjahr",
                            sap.ui.model.FilterOperator.EQ,
                            that.headerSolic.Gjahr);
                        aFilter.push(oFilterTableNo)

                        let dataLanc = that.headerSolic.Budat.substring(6, 8) + that.headerSolic.Budat.substring(4, 6) + that.headerSolic.Budat.substring(0, 4)

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
                            that.headerSolic.Belnr || that.headerSolic.Banfn );
                        aFilter.push(oFilterTableNo)

                        oModel.read("/AprovadorSet", {
                            filters: aFilter,
                            success: function (data, response) {

                                data.results.forEach(function (item) {

                                    var Nomeaprov = ''
                                    if (item.Nomeaprov) {

                                        item.Nomeaprov.split(' ').forEach(function (nome) {
                                            var convName = nome[0].toUpperCase() + nome.substring(1).toLowerCase()
                                            Nomeaprov = Nomeaprov + ' ' + convName
                                        })

                                    }

                                    if (item.Status) {
                                        var Status = item.Status[0].toUpperCase() + item.Status.substring(1).toLowerCase()
                                    }

                                    var aprovItm = new ColumnListItem({
                                        cells:
                                            [
                                                new sap.m.Text({ text: Nomeaprov }),
                                                new sap.m.Text({ text: item.Dtlib }),//|| item.Status }),
                                                new sap.m.Text({ text: Status }),
                                                new sap.m.Button({
                                                    visible: item.Status == 'REJEITADO' ? true : false,
                                                    text: 'Justificativa',
                                                    press: that.handlePopoverPress
                                                }),
                                            ]
                                    });

                                    var aprovador = aprovItm.getCells()
                                    if (that.headerSolic.Banfn){
                                        aprovador[1].setProperty('text', aprovador[1].getText().substring(6,8) + '.' + aprovador[1].getText().substring(4,6) + '.' + aprovador[1].getText().substring(0,4))
                                        
                                        if(aprovador[2].getText() == '1'){
                                            aprovador[2].setText('Pendente')
                                        }else if (aprovador[2].getText() == '2'){
                                            aprovador[2].setText('Aprovado')
                                        }else{
                                            aprovador[2].setText('Rejeitado')
                                        }

                                        if (that.headerSolic.Zstats == '3'){
                                            aprovador[2].setText('Rejeitado')
                                        }

                                        aprovador[3].setProperty('text','Justificativa')
                                        aprovador[3].attachEvent('press', that.handlePopoverPress)
                                        aprovador[3].setVisible(aprovador[2].getText() == 'Rejeitado' ? true : false)
                                    }

                                    if (aprovItm.getCells()[0].getText()) {
                                        aprovTab.addItem(aprovItm)
                                    }

                                })

                            }.bind(that),
                            error: function (response) {

                            }.bind(that)

                        })

                    },
                    error: function (oError) {
                        debugger
                    }

                });

                var oFilterTableNo = new sap.ui.model.Filter("Zpdsol",
                    sap.ui.model.FilterOperator.EQ,
                    Zpdsol);

                oModel.read("/Item_ANEXOSet", {
                    filters: [oFilterTableNo],
                    success: function (data, response) {

                        data.results.forEach(function (item) {

                            var anexoRow = new ColumnListItem({
                                cells:
                                    [
                                        new sap.m.Link({ text: item.Filename, press: that.downloadArquivo }),
                                        new sap.m.Link({ text: item.ContImg }),
                                    ]
                            });

                            anexoTab.addItem(anexoRow)
                        })

                    }.bind(this),
                    error: function (response) {
                        debugger
                    }.bind(this)

                })

            },

            setVisibleContent: function (oTipo) {
                if (oTipo == '1') {
                    this.getView().byId('detalhesTitle').setTitle('Lançamento Despesas fornecedor')
                    this.getView().byId('NFTable').setVisible(true)
                    this.getView().byId('tltleNFTab').setVisible(true)
                    this.getView().byId('headerTipo1').setVisible(true)
                } else if (oTipo == '2') {
                    this.getView().byId('detalhesTitle').setTitle('Prestação de Contas Reembolso de Viagem')
                    this.getView().byId('headerTipo2').setVisible(true)
                    this.getView().byId('dadosViagem').setVisible(true)
                    this.getView().byId('ItinetarioTitle').setVisible(true)
                    this.getView().byId('itinerarioTab').setVisible(true)
                    this.getView().byId('detDespTitle').setVisible(true)
                    this.getView().byId('detDespesasTable').setVisible(true)
                } else if (oTipo == '3') {
                    this.getView().byId('detalhesTitle').setTitle('Requisição de Compras')
                    this.getView().byId('reqTable').setVisible(true)
                    this.getView().byId('reqTabTitle').setVisible(true)
                    this.getView().byId('headerTipo3').setVisible(true)
                }
            },
            onVoltar: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                // if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                // } else {
                //     var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //     oRouter.navTo("RouteConsLanDespesas", true);
                // }
            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            myFormatter: function (sStatus) {
                return sStatus === "critical";
            },
            onFilterSelect: function (oEvent) {
                var sKey = oEvent.getParameter("key")
                var oIconTabBar = oEvent.getSource()
                var anexos = this.byId('anexos')
                var UploadSet = this.byId('UploadSet')

                if (sKey === "solic") {
                    // anexos.setProperty('visible', true)
                    // UploadSet.setProperty('visible', true)
                } else {
                    // UploadSet.setProperty('visible', false)
                    // anexos.setProperty('visible', false)
                }
            },

            onLiveChange: function (oEvent) {
                var oSource = oEvent.getSource() // pega o searchField
                var oParameters = oEvent.getParameters()
                var sTerm = oParameters.newValue //termo de busca
                var oTable = this.getView().byId('reqTable')

                var aFilters = []
                if (sTerm) {
                    var oFilter = new Filter({
                        path: "item",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sTerm
                    })
                    aFilters.push(oFilter)
                }

                var oBinding = oTable.getBinding('items')
                oBinding.filter([aFilters])

                // debugger
            },
            onNavBack: function (oEvent) {
                window.history.go(-1);
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

            formatWrbtr: function (Wrbtr) {
                debugger

                if (!Wrbtr){
                    Wrbtr = '0,00'
                    return
                }

                if (typeof (Wrbtr) != 'string') {
                    Wrbtr = Wrbtr + ''
                }

                return Intl.NumberFormat("pt-br", {
                    style: "currency",
                    currency: "BRL"
                }).format(Wrbtr).replace("R$", "").replace(" ", "")
            },

            downloadArquivo: function (oEvent) {
                debugger
                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", { useBatch: false })

                var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getController()
                var contImg = this.getParent().getCells()[1].getText()



                var url = "/Item_ANEXOSet(Zpdsol='" + that.headerSolic.Zpdsol.replace('/', '%2F') + "',ContImg='" + contImg + "')"

                oModel.read(url,
                    {
                        success: function (oData, response) {
                            debugger

                            // var origFile = oData.Filecontent.replace("data/imagejpegbase64", "data:image/jpeg;base64,")
                            // var origFile = oData.Filecontent.replace("dataimage/jpegbase64", 'data:' + oData.Mimetype + ";base64,")
                            var origFile = 'data:' + oData.Mimetype + ";base64," + oData.Filecontent
                            // var origFile = oData.Filecontent.replace("dataimage/jpegbase64","data:image/jpeg,")
                            // var url = origFile.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
                            // var url = origFile
                            // window.open(url);

                            // sap.ui.core.util.File.save(
                            //     url,
                            //     oData.Filename,
                            //     'jpg',
                            //     'application/octet-stream'
                            //     // oData.Mimetype
                            // )
                            
                            // oFile.save()
                            // window.open(oData.Filecontent)

                            var a = document.createElement("a"); //Create <a>
                            a.href = origFile//"data:image/png;base64," + ImageBase64; //Image Base64 Goes here
                            a.download = oData.Filename; //File name Here
                            a.click(); //Downloaded file
                        },

                        error: function (response) {
                            debugger
                        }

                    })

                // var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
                // var oCtx = oItem.oBindingContexts.undefined.sPath;
                // var linkAnexo ="/sap/opu/odata/sap/ZPORTALDESPESAS_SRV"+url+"/$value";
                // var linkAnexo ="/sap/opu/odata/sap/ZPORTALDESPESAS_SRV/Item_ANEXOSet(Zpdsol='0000000041%2F2021',ContImg='001')/$value";
                // var linkAnexo ="/sap/opu/odata/sap/ZPORTALDESPESAS_SRV/Item_ANEXOSet(Zpdsol='0000000041%2F2021',ContImg='001')/Filecontent";
                // window.open(linkAnexo);
                // sap.m.URLHelper.redirect(linkAnexo, "_blank")

            },

            clearAll: function () {
                var sUrl = window.location.protocol + '//' + window.location.host + '/sap/bc/bsp/sap/zportal_conlan/index.html' + '#' + this.matricula
                window.location.replace(sUrl)
            },

            handlePopoverPress: function (oEvent) {
                var oButton = oEvent.getSource(),
                    oView = this.getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent(),
                    that = oView.getController();

                // oView.byId('textoJustificativa').setProperty('text', that.headerSolic.Justificativa)

                var zpdsol = that.headerSolic.Zpdsol.replace('/', '%2F')

                // create popover
                if (!that._pPopover) {
                    that._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "queroquerons.conslandespesas.view.Popover",
                        controller: that
                    }).then(function (oPopover) {
                        oView.addDependent(oPopover);
                        oPopover.bindElement("/DespesaFornecedorHeaderSet(Zpdsol='" + zpdsol + "')");
                        return oPopover;
                    });
                }
                that._pPopover.then(function (oPopover) {
                    oPopover.openBy(oButton);
                });
            },

            handleEmailPress: function (oEvent) {
                this.byId("myPopover").close();
            },

            formataSolicitante: function (solicitante) {
                if (solicitante) {

                    var primeiroNome = solicitante.split(' ')[0]
                    var ultimoNome = solicitante.split(' ')[solicitante.split(' ').length - 1]

                    primeiroNome = primeiroNome[0].toUpperCase() + primeiroNome.substring(1).toLowerCase()
                    ultimoNome = ultimoNome[0].toUpperCase() + ultimoNome.substring(1).toLowerCase()

                    var nomeSolicitante = primeiroNome + ' ' + ultimoNome
                    return nomeSolicitante
                }
            }

        });
    })