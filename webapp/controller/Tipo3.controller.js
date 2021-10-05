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
    "sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
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
        JSONModel,
        ColumnListItem,
        Fragment) {
        "use strict";

        return Controller.extend("queroquerons.conslandespesas.controller.Tipo3", {

            oRoute: null,
            matricula: "",
            dadosMatricula: {},
            Zpfpj: "",
            tipoUnidade: "",
            contaPfPj: "",
            anexos: [],
            dataCorrente: "",

            onInit: function () {
                window.addEventListener('popstate', (event) => {
                    this.clearAll()
                });

                this.oRoute = this.getOwnerComponent().getRouter()

                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", { useBatch: false })
                this.getView().setModel(oModel);
                sap.ui.getCore().setModel(oModel)

                var oAttachmentUpl = this.byId('UploadSet').getDefaultFileUploader();
                oAttachmentUpl.setIcon("sap-icon://add").setIconOnly(true);

                var vRoute = this.getRouter().getRoute("RouteTipo3");
                vRoute.attachPatternMatched(this.onPatternMatched, this);
            },

            onPatternMatched(oEvent) {
                this.matricula = oEvent.getParameters().arguments.matricula

                var oView = this.getView()
                oView.byId("tipoReq").setValue('UB')
                oView.byId("txtTipoReq").setProperty('text', 'RT Manual')
                // oView.byId("empresa").setValue()
                oView.byId("vTotal").setValue("0,00")

                var today = new Date();
                var dd = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var mm = String(today.getDate()).padStart(2, '0');
                var yyyy = today.getFullYear();

                today = mm + '/' + dd + '/' + yyyy;

                this.dataCorrente = today

                var table = this.getView().byId("reqTable");
                var selItems = table.getItems()

                selItems[0].getCells()[1].setValue()
                selItems[0].getCells()[2].setValue()
                selItems[0].getCells()[3].setValue()
                selItems[0].getCells()[4].setValue()
                // selItems[0].getCells()[5].setValue()
                selItems[0].getCells()[6].setValue()
                selItems[0].getCells()[7].setValue()
                selItems[0].getCells()[8].setValue('DP10')
                selItems[0].getCells()[9].setValue()
                selItems[0].getCells()[10].setValue(today)
                selItems[0].getCells()[11].setValue('K')

                for (var i = 1; i < selItems.length; i++) {
                    table.removeItem(selItems[i])
                }

                var oAttachmentUpl = this.byId('UploadSet')
                const sPath = oAttachmentUpl._getAllItems()[0]
                if (sPath) {
                    window.location.reload()
                }

                var that = this
                this.getView().setBusy(true)

                var oFilter = new sap.ui.model.Filter("Pernr",
                    sap.ui.model.FilterOperator.EQ,
                    this.matricula);

                var oModel = this.getView().getModel()
                var url = "/sh_pernrSet"
                oModel.read(url, {
                    filters: [oFilter],
                    success: function (odata, response) {
                        debugger
                        that.getView().setBusy(false)

                        this.dadosMatricula = odata
                        this.tipoUnidade = odata.results[0].CD || odata.results[0].MATRIZ ? "M" : "F"

                        oView.byId("empresa").setValue(odata.results[0].BUKRS)

                        var txtBukrs = odata.results[0].BUKRS == '0011' ? 'Lojas Quero-Quero S/A' : 'Verde Adm Cart Credito SA'
                        oView.byId("txtBukrs").setProperty('text', txtBukrs)

                        var centro = odata.results[0].CD || odata.results[0].MATRIZ || odata.results[0].FILIAL
                        selItems[0].getCells()[5].setValue(centro)

                        var centro = odata.results[0].KOSTL
                        selItems[0].getCells()[13].setValue(centro)

                    }.bind(this),
                    error: function (error) {
                        that.getView().setBusy(false)
                        debugger
                    }.bind(this)
                })

            },

            onSalvar: function () {

                this.onSubmit()

                var oView = this.getView()
                var oHeader = {}


                oHeader.Mandt = "",
                    oHeader.Zpdsol = "",
                    oHeader.Zpdnum = "01",
                    oHeader.Zldesp = "03",
                    oHeader.Bsart = oView.byId("tipoReq").getValue()
                    oHeader.Zpudt = "20210708",
                    oHeader.Bukrs = oView.byId("empresa").getValue()
                    oHeader.Belnr = "",
                    oHeader.Gjahr = "",
                    oHeader.Banfn = "",
                    oHeader.Budat = "20210708",
                    oHeader.Lifnr = "",
                    oHeader.Name1 = "",
                    oHeader.Gsber = "",
                    oHeader.Wrbtr = oView.byId("vTotal").getValue().replaceAll(".", "").replace(",", ".")
                    oHeader.Pargb = "0003",
                    oHeader.Zlsch = "",
                    oHeader.Zfbdt = "20210708",
                    oHeader.Zterm = "",
                    oHeader.Zfdtag = "00000000",
                    oHeader.Zstats = "1",
                    oHeader.Usnam = this.matricula,
                    oHeader.Cname = ""
                    oHeader.Data = "",
                    oHeader.Hora = "",
                    oHeader.Justificativa = "",
                    oHeader.Xbelnr = "",
                    oHeader.Bldat = "00000000",
                    oHeader.Bktxt = "",
                    oHeader.Zdifl = "0.00",
                    oHeader.Ztotnf = "0.00",
                    oHeader.Datv1 = "",
                    oHeader.Uhrv1 = "",
                    oHeader.Datb1 = "",
                    oHeader.Uhrb1 = "",
                    oHeader.Kmges = "",
                    oHeader.Vladtrec = "0.00",
                    oHeader.Resdesp = "0.00",
                    oHeader.Vlremb = "0.00"

                if (!oHeader.Bsart
                    || !oHeader.Bukrs) {
                    sap.m.MessageToast.show("Preencher todos os campos de cabeçalho");
                    return
                }

                oHeader.RequisicaoCompraItens = []
                oHeader.Response = [
                    {
                        "Id": "",
                        "Type": "",
                        "Number": "",
                        "Message": "",
                        "LogNo": "",
                        "LogMsgNo": "",
                        "MessageV1": "",
                        "MessageV2": "",
                        "MessageV3": "",
                        "MessageV4": "",
                        "Parameter": "",
                        "Row": "",
                        "Field": "",
                        "System": ""
                    }
                ]

                var reqTab = oView.byId("reqTable");
                var tabItens = reqTab.getItems()

                var val = 0
                tabItens.forEach(function (item) {
                    var itemReq = {}

                    itemReq.Banfn = ""
                    itemReq.Zitem = item.getCells()[0].getValue()
                    itemReq.Zpdsol = ""
                    itemReq.Zpdnum = ""
                    itemReq.Matnr = item.getCells()[1].getValue()
                    itemReq.Maktx = item.getCells()[2].getValue()
                    itemReq.Menge = item.getCells()[3].getValue()
                    itemReq.Meins = item.getCells()[4].getValue().toUpperCase()
                    itemReq.Werks = item.getCells()[5].getValue()
                    itemReq.Preco = item.getCells()[16].getValue().replaceAll(".", "").replace(",", ".")
                    itemReq.Peinh = "1"
                    itemReq.Wrbtr = item.getCells()[6].getValue().replaceAll(".", "").replace(",", ".")
                    itemReq.Matkl = item.getCells()[7].getValue()
                    itemReq.Ekgrp = item.getCells()[17].getValue()
                    itemReq.Lgort = item.getCells()[8].getValue()
                    itemReq.Eeind = ""
                    itemReq.Knttp = item.getCells()[11].getValue()
                    itemReq.Saknr = item.getCells()[12].getValue()
                    itemReq.Aufnr = item.getCells()[9].getValue()
                    itemReq.Eeind = item.getCells()[10].getValue()
                    itemReq.Kostl = item.getCells()[13].getValue()
                    itemReq.Anln1 = item.getCells()[14].getValue()
                    itemReq.Anln2 = item.getCells()[15].getValue()

                    if (itemReq.Knttp == 'F'
                        && !itemReq.Aufnr) {
                        sap.m.MessageToast.show(`Preencher campo Ordem do item ${itemReq.Zitem} da Class. Contábil`)
                        val = 1
                        return
                    } else if (itemReq.Knttp == 'K'
                        && !itemReq.Kostl) {
                        sap.m.MessageToast.show(`Preencher campo Centro de Custo do item ${itemReq.Zitem} da Class. Contábil`)
                        val = 1
                        return
                    } else if (itemReq.Knttp == 'A'
                        && (!itemReq.Anln1 || !itemReq.Anln2)) {
                        sap.m.MessageToast.show(`Preencher campos Imobilizado e Sub N° do item${itemReq.Zitem} da Class. Contábil`)
                        val = 1
                        return
                    }

                    if (
                        (itemReq.Matnr || itemReq.Maktx)
                        && itemReq.Menge
                        && itemReq.Meins
                        && itemReq.Werks
                        && itemReq.Wrbtr
                        // && itemReq.Matkl
                        && itemReq.Lgort
                        // && itemReq.Aufnr
                        && itemReq.Eeind) {
                        oHeader.RequisicaoCompraItens.push(itemReq)
                    }

                });

                if (val == 1) {
                    return
                }

                if (oHeader.RequisicaoCompraItens.length == 0) {
                    sap.m.MessageToast.show("Preencher pelo menos um item da requisição por completo");
                    return
                }

                var mParameters = {
                    success: function (oData, response) {
                        debugger
                        oView.setBusy(false)
                        response.data.Response.results.forEach(function (msg) {
                            if (msg.Type == 'E') {
                                // sap.m.MessageToast.show(`Erro ao gravar. Verificar: ${msg.Message}`)
                                sap.m.MessageToast.show(msg.Message.substring(18))
                            }
                        })

                        var sMsg = response.data.Response.results.filter(function (msg) {
                            return msg.Type == 'E';
                        })

                        if (sMsg.length == 0) {
                            debugger
                            
                            sap.m.MessageToast.show(`Dados gravados com sucesso`)
                            this.clearAll()
                        }
                        // sap.m.MessageToast.show(`Dados gravados com sucesso`)
                        // this.clearAll()

                    }.bind(this),

                    error: function (oError) {
                        debugger
                        oView.setBusy(false)
                        sap.m.MessageToast.show('Ocorreu um erro ao gravar. Verificar dados.')
                    }
                }

                var ODataModel = oView.getModel()
                ODataModel.setHeaders({ "X-Requested-With": "X" })
                oView.setBusy(true)
                ODataModel.create("/RequisicaoCompraSet", oHeader, mParameters)

            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            onAdd: function (oEvent) {

                var oSource = oEvent.getSource()
                var tabSid = oSource.getParent().getParent().sId

                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Icon')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.onSubmit()

                if (tabSid.includes("reqTab")) {

                    var table = that.getView().byId("reqTable");
                    var itmValue = table.getItems().length * 10 + 10
                    var sItem = table.getItems()[0]

                    var itemRow = new ColumnListItem({
                        type: sap.m.ListType.Inactive,
                        unread: false,
                        vAlign: "Middle",
                        cells: [
                            new sap.m.Input({ type: "Text", value: itmValue, editable: false, textAlign: "Center", submit: that.onSubmit }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchMaterial
                            }),

                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit }),
                            new sap.m.Input({ type: "Number", value: "", submit: that.onSubmit}),
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit }),
                            new sap.m.Input({
                                type: "Text",
                                value: that.dadosMatricula.results[0].CD || that.dadosMatricula.results[0].MATRIZ || that.dadosMatricula.results[0].FILIAL,
                                submit: that.onSubmit,
                                valueHelpRequest: that.onSearchWerks
                            }),
                            new sap.m.Input({ type: "Text", editable: false, value: "0,00", submit: that.onSubmit }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchGrpMerc, submit: that.onSubmit
                            }),
                            new sap.m.Input({
                                type: "Text", value: "DP10", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchLgort, editable: false
                            }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchAufnr
                            }),

                            // Classificação contábil
                            new sap.m.DatePicker({
                                valueFormat: "dd.MM.yyyy",
                                displayFormat: "short",
                                placeholder: " ",
                                change: "handleChange",
                                value: that.dataCorrente
                            }),

                            new sap.m.Input({
                                type: "Text", value: "K",
                                valueHelpRequest: that.onSearchClasf
                            }),
                            new sap.m.Input({
                                type: "Text", value: "",
                                valueHelpRequest: that.onSearchSaknr
                            }),
                            //     new sap.m.Input({ type: "Text", value: "", 
                            //       valueHelpRequest:that.onSearchAufnr
                            //   }),
                            new sap.m.Input({
                                type: "Text", value: that.dadosMatricula.results[0].KOSTL,
                                valueHelpRequest: that.onSearchKostl
                            }),
                            new sap.m.Input({
                                type: "Text", value: "",
                                valueHelpRequest: that.onSearchImobilizado
                            }),
                            new sap.m.Input({
                                type: "Text", value: "",
                                valueHelpRequest: that.onSearchSubN
                            }),

                            new sap.m.Input({ type: "Text", editable: true, value: "0,00", submit: that.onSubmit, editable:false  }),

                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchEkgrp, submit: that.onSubmit
                            }),

                            new sap.ui.core.Icon({
                                src: "sap-icon://add",
                                press: that.onAdd
                            }),

                            new sap.ui.core.Icon({
                                src: "sap-icon://delete",
                                press: that.removeLine
                            }),
                        ]
                    });

                    itemRow.getCells()[1].setProperty('showValueHelp', true)
                    itemRow.getCells()[5].setProperty('showValueHelp', true)
                    itemRow.getCells()[7].setProperty('showValueHelp', true)
                    itemRow.getCells()[8].setProperty('showValueHelp', true)
                    itemRow.getCells()[9].setProperty('showValueHelp', true)
                    itemRow.getCells()[11].setProperty('showValueHelp', true)
                    itemRow.getCells()[12].setProperty('showValueHelp', true)
                    itemRow.getCells()[13].setProperty('showValueHelp', true)
                    itemRow.getCells()[14].setProperty('showValueHelp', true)
                    itemRow.getCells()[15].setProperty('showValueHelp', true)
                    itemRow.getCells()[17].setProperty('showValueHelp', true)

                }

                table.addItem(itemRow)
            },

            removeLine: function (oEvent) {

                var table = oEvent.getSource().getParent().getParent()
                var selItems = table.getItems()
                var itemSelecionado = oEvent.getSource().getParent().getCells()[0].getValue()

                if (itemSelecionado == '10') {
                    selItems.forEach(function (item) {
                        item.getCells()[1].setValue()
                        item.getCells()[2].setValue()
                        item.getCells()[3].setValue()
                        item.getCells()[4].setValue()
                        item.getCells()[5].setValue()
                        item.getCells()[6].setValue()
                        item.getCells()[7].setValue()
                        item.getCells()[8].setValue()
                        item.getCells()[9].setValue()
                        item.getCells()[10].setValue()
                        item.getCells()[11].setValue()
                        item.getCells()[12].setValue()
                        item.getCells()[13].setValue()
                        item.getCells()[14].setValue()
                        item.getCells()[15].setValue()
                        item.getCells()[16].setValue()
                        item.getCells()[17].setValue()
                    })
                    return
                }

                for (var i = 1; i < selItems.length; i++) {
                    if (selItems[i].getCells()[0].getValue() == itemSelecionado
                        && itemSelecionado != '10') {
                        table.removeItem(selItems[i])
                    }
                }


                debugger
            },

            newAttachment: function () {
                var oView = this.getView()

                var anexos = oView.byId('anexos')

                var oContent = new sap.ui.unified.FileUploader()
                var oTitle = new sap.ui.core.Title()

                anexos.addContent(oContent)
            },

            onNavBack: function (oEvent) {
                window.history.go(-1);
            },

            onSearch: function (oEvent) {
                var path;
                var oTableStdListTemplate;
                this.inputId = oEvent.getSource().getId();

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    if (that.inputId.includes('tipoReq')) {
                        path = "/sh_bsartSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Bsart}",
                            description: "{Batxt}"
                        });// //create a filter for the binding

                        that.oDialog.setTitle('Tipo de requisição')

                    } else if (that.inputId.includes('codAprov')) {
                        path = "/sh_pargbSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Gsber}",
                            description: "{Gtext}"
                        });// //create a filter for the binding

                        that.oDialog.setTitle('Cód. Aprovador')
                    }

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: []
                    })

                    that.oDialog.open();
                }

            },

            onSearchMaterial: function (oEvent) {
                var path;
                var oTableStdListTemplate;

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                var centro = that.tabItem.getCells()[5].getValue() + ""

                if(!centro){
                    MessageToast.show('Preencher primeiro o centro')
                    return
                }

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_materialSet";

                    var filter = new Filter('Werks', sap.ui.model.FilterOperator.EQ, centro);

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Matnr}",
                        description: "{Maktx}"
                    });// //create a filter for the binding

                    that.oDialog.setTitle('Material')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [filter]
                    })

                    that.oDialog.open();
                }
            },

            onSearchEkgrp: function (oEvent) {
                var path;
                var oTableStdListTemplate;

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_ekgrpSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Ekgrp}",
                        description: "{Eknam}"
                    });// //create a filter for the binding

                    that.oDialog.setTitle('Grupo de compradores')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: []
                    })

                    that.oDialog.open();
                }
            },

            onSearchSaknr: function (oEvent) {
                var path;
                var oTableStdListTemplate;

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_saknrSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Saknr}",
                        description: "{Txt50}"
                    });// //create a filter for the binding

                    that.oDialog.setTitle('Conta Razão')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: []
                    })

                    that.oDialog.open();
                }
            },

            onSearchGrpMerc: function (oEvent) {
                var path;
                var oTableStdListTemplate;

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_grpmercSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Matkl}",
                        description: "{Desc}"
                    });// //create a filter for the binding

                    that.oDialog.setTitle('Grupo de materiais')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: []
                    })

                    that.oDialog.open();
                }
            },

            onSearchWerks: function (oEvent) {

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.selItem = oEvent.getSource().getParent()
                that.inputId = oEvent.getSource().getId();
                var sName = "queroquerons.conslandespesas.view.ValuesHelpWerks"

                var oButton = oEvent.getSource()
                var oView = that.getView();

                if (!that._lDialog) {
                    that._lDialog = Fragment.load({
                        id: oView.getId(),
                        name: sName,
                        controller: that
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                that._lDialog.then(function (oDialog) {
                    // Set growing if required
                    var bGrowing = !!oButton.data("growing");
                    oDialog.setGrowing(bGrowing);
                    oDialog.setTitle('Centro')
                    oDialog.open();
                }.bind(that));

            },

            onSearchLgort: function (oEvent) {
                var path;
                var oTableStdListTemplate;
                var werks = oEvent.getSource().getParent().getCells()[5].getValue()
                var aWerksFilters = []


                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                if (!werks) {
                    MessageToast.show('Preencher primeiro o Centro')
                    return
                } else {
                    that.selectedWerks = werks
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_lgortcSet";

                    var filter = new sap.ui.model.Filter('Werks', sap.ui.model.FilterOperator.EQ, werks.toUpperCase());
                    aWerksFilters.push(filter)

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Lgort}",
                        description: "{Lgobe}"
                    });// //create a filter for the binding

                    that.oDialog.setTitle('Depósito')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aWerksFilters
                    })

                    that.oDialog.open();
                }
            },

            onSearchClasf: function (oEvent) {
                var path;
                var oTableStdListTemplate;
                var aFiltersClasf = []

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_clasfSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Knttp}",
                        description: "{Knttx}"
                    });// //create a filter for the binding

                    var filter = new sap.ui.model.Filter('Lang', sap.ui.model.FilterOperator.EQ, 'PT');
                    aFiltersClasf.push(filter)

                    that.oDialog.setTitle('Depósito')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFiltersClasf
                    })

                    that.oDialog.open();
                }
            },

            onSearchImobilizado: function (oEvent) {
                var path;
                var oTableStdListTemplate;
                var aFilterImobilizado = []

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var sBukrs = that.getView().byId('empresa').getValue()
                if (!sBukrs) {
                    MessageToast.show('Preencher primeiro a empresa')
                    return
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_imobilizadoSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Anln1}",
                        description: "{Mcoa1}"
                    });// //create a filter for the binding

                    var filter = new sap.ui.model.Filter('Bukrs', sap.ui.model.FilterOperator.EQ, sBukrs);
                    aFilterImobilizado.push(filter)

                    that.oDialog.setTitle('Imobilizado')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFilterImobilizado
                    })

                    that.oDialog.open();
                }
            },



            onSearchSubN: function (oEvent) {
                var path;
                var oTableStdListTemplate;
                var aFilterImobilizado = []

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var sBukrs = that.getView().byId('empresa').getValue()

                var sImobilizado = oEvent.getSource().getParent().getCells()[14].getValue()
                if (!sImobilizado) {
                    MessageToast.show('Preencher primeiro o Imobilizado')
                    return
                }

                that.selectedImobilizado = sImobilizado

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_subimobilizadoSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Anln2}",
                        description: "{Mcoa1}"
                    });// //create a filter for the binding

                    var filter = new sap.ui.model.Filter('Bukrs', sap.ui.model.FilterOperator.EQ, sBukrs);
                    aFilterImobilizado.push(filter)

                    var filter = new sap.ui.model.Filter('Anln1', sap.ui.model.FilterOperator.EQ, sImobilizado);
                    aFilterImobilizado.push(filter)

                    that.oDialog.setTitle('Sub N°')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFilterImobilizado
                    })

                    that.oDialog.open();
                }
            },


            onWerksLiveChange: function (oEvent) {
                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");

                var aWerksFilters = []

                if (value) {
                    var filter = new sap.ui.model.Filter('Werks', sap.ui.model.FilterOperator.EQ, value);
                    aWerksFilters.push(filter)

                    var filter = new sap.ui.model.Filter('Name1', sap.ui.model.FilterOperator.EQ, value);
                    aWerksFilters.push(filter)

                    var filter = new sap.ui.model.Filter('Ort01', sap.ui.model.FilterOperator.EQ, value);
                    aWerksFilters.push(filter)
                }

                // binding.aApplicationFilters = aWerksFilters
                // binding.aFilters = aWerksFilters
                // binding.filter();

                // binding.filter(aWerksFilters);
                binding.aApplicationFilters = aWerksFilters
                binding.aFilters = aWerksFilters
                binding.filter();


            },

            onSearchKostl: function (oEvent) {

                var sInputValue = oEvent.getSource().getValue();
                var path;
                var oTableStdListTemplate;
                var oFilterTableNo;

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    var aFiltersKostl = []

                    path = "/sh_kostlSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Kostl}",
                        description: "{= ${Bukrs} || ${Ltext} }"
                    });// //create a filter for the binding

                    oFilterTableNo = new sap.ui.model.Filter("Kostl",
                        sap.ui.model.FilterOperator.EQ,
                        sInputValue);
                    aFiltersKostl.push(oFilterTableNo)

                    // oFilterTableNo = new sap.ui.model.Filter("Descricao",
                    //     sap.ui.model.FilterOperator.EQ,
                    //     sInputValue);
                    // aFiltersKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                        sap.ui.model.FilterOperator.EQ,
                        that.dadosMatricula.results[0].BUKRS);
                    aFiltersKostl.push(oFilterTableNo)

                    var unidade = that.dadosMatricula.results[0].CD || that.dadosMatricula.results[0].MATRIZ || that.dadosMatricula.results[0].FILIAL

                    oFilterTableNo = new sap.ui.model.Filter("UnidadeEmpresa",
                        sap.ui.model.FilterOperator.EQ,
                        unidade);
                    aFiltersKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("Clasf",
                        sap.ui.model.FilterOperator.EQ,
                        that.tabItem.getCells()[11].getValue());
                    aFiltersKostl.push(oFilterTableNo)

                    that.oDialog.setTitle('Centro de custo')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFiltersKostl
                    })

                    that.oDialog.open('');
                }
            },

            onSearchAufnr: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var path;
                var oTableStdListTemplate;
                var oFilterTableNo;

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", that);
                }

                if (that.oDialog) {

                    path = "/sh_aufnrSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Aufnr}",
                        description: "{Ktext}"
                    });// //create a filter for the binding

                    oFilterTableNo = new sap.ui.model.Filter("Aufnr",
                        sap.ui.model.FilterOperator.EQ,
                        sInputValue);

                    that.oDialog.setTitle('Ordem')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo]
                    })

                    that.oDialog.open(sInputValue);
                }
            },

            onCContabMatchCode: function (oEvent) {

                var thisMetadata = this.getMetadata().getName()

                if (thisMetadata.includes('Input')) {
                    var oView = this.getParent().getParent().getParent().getParent().getParent().getParent()
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var oView = this.getView();
                    var that = this
                }

                that.selItem = oEvent.getSource().getParent()
                that.tabItem = oEvent.getSource().getParent()
                that.inputId = oEvent.getSource().getId();

                var sName = "queroquerons.conslandespesas.view.ValuesHelpCContab2"

                var oButton = oEvent.getSource()

                if (!that._pDialog) {
                    that._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: sName,
                        controller: that
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                that._pDialog.then(function (oDialog) {
                    // Set growing if required
                    var bGrowing = !!oButton.data("growing");
                    oDialog.setGrowing(bGrowing);
                    oDialog.setTitle('Conta Contábil')
                    oDialog.open();
                });

            },

            onSearchBukrs: function (oEvent) {

                this.selItem = oEvent.getSource().getParent()
                this.inputId = oEvent.getSource().getId();

                var sName = "queroquerons.conslandespesas.view.ValueHelpDialog3"

                var path;
                var oTableStdListTemplate;
                var oFilterTableNo;
                var oButton = oEvent.getSource()
                var oView = this.getView();

                if (!this._bDialog) {
                    this._bDialog = Fragment.load({
                        id: oView.getId(),
                        name: sName,
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._bDialog.then(function (oDialog) {
                    // Set growing if required
                    var bGrowing = !!oButton.data("growing");
                    oDialog.setGrowing(bGrowing);
                    oDialog.setTitle('Empresa')
                    oDialog.open();
                });
            },

            onLiveChangeBukrs: function (oEvent) {
                var oSource = oEvent.getSource() // pega o searchField
                var oParameters = oEvent.getParameters()
                var sTerm = oParameters.value //termo de busca
                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");


                if (this.inputId.includes('empresa')) {
                    var sTerm = "Bukrs"
                    var Stxt = "Butxt"
                } else {
                    var sTerm = "Ktopl"
                    var Stxt = "Txt50"
                    var Saknr = "Saknr"
                }

                var aFilters = []

                if (value) {
                    var filter = new sap.ui.model.Filter(sTerm, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)

                    var filter = new sap.ui.model.Filter(Stxt, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)

                    if (Saknr) {
                        var filter = new sap.ui.model.Filter(Saknr, sap.ui.model.FilterOperator.EQ, value);
                        aFilters.push(filter)
                    }
                }

                binding.filter(aFilters);
            },


            handleTableValueHelpSearch: function (oEvent) {
                var oSource = oEvent.getSource() // pega o searchField
                var oParameters = oEvent.getParameters()
                var sTerm = oParameters.value //termo de busca
                var sPath = oEvent.getParameters().itemsBinding.sPath
                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var centro = that.tabItem.getCells()[5].getValue()

                var value = oEvent.getParameter("value");
                // Live change Tabela
                if (sPath.includes('aufnr')) {
                    var sTerm = "Aufnr"
                    var Stext = "Ktext"
                    var path = "/sh_aufnrSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Aufnr}",
                        description: "{Ktext}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Aufnr",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Ktext",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })

                } else if (sPath.includes('kostl')) {

                    var path = "/sh_kostlSet";
                    var aFiltersKostl = []

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Kostl}",
                        description: "{= ${Bukrs} || ${Ltext} }"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Kostl",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                    aFiltersKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("Kostl",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                    aFiltersKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("Descricao",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                    aFiltersKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                        sap.ui.model.FilterOperator.EQ,
                        that.dadosMatricula.results[0].BUKRS);
                    aFiltersKostl.push(oFilterTableNo)

                    var unidade = that.dadosMatricula.results[0].CD || that.dadosMatricula.results[0].MATRIZ || that.dadosMatricula.results[0].FILIAL

                    oFilterTableNo = new sap.ui.model.Filter("UnidadeEmpresa",
                        sap.ui.model.FilterOperator.EQ,
                        unidade);
                    aFiltersKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("Clasf",
                        sap.ui.model.FilterOperator.EQ,
                        that.tabItem.getCells()[11].getValue());
                    aFiltersKostl.push(oFilterTableNo)

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFiltersKostl
                    })

                } else if (sPath.includes('werks')) {
                    var path = "/sh_werksSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Werks}",
                        description: "{Name1}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Werks",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Name1",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })

                } else if (sPath.includes('material')) {
                    var path = "/sh_materialSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Matnr}",
                        description: "{Maktx}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Matnr",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Maktx",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                        var centro = that.tabItem.getCells()[5].getValue() + ""

                        var oFilterTableNo3 = new sap.ui.model.Filter("Werks",
                        sap.ui.model.FilterOperator.EQ,
                        centro);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2, oFilterTableNo3]
                    })

                } else if (sPath.includes('grpmerc')) {
                    var path = "/sh_grpmercSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Matkl}",
                        description: "{Desc}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Matkl",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Desc",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })

                } else if (sPath.includes('ekgrp')) {
                    var path = "/sh_ekgrpSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Ekgrp}",
                        description: "{Eknam}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Ekgrp",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Eknam",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })


                } else if (sPath.includes('lgort')) {
                    var path = "/sh_lgortcSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Lgort}",
                        description: "{Lgobe}"
                    });// //create a filter for the binding

                    var aLgortFilters = []

                    var oFilterTableNo = new sap.ui.model.Filter("Werks",
                        sap.ui.model.FilterOperator.EQ,
                        that.selectedWerks);
                    aLgortFilters.push(oFilterTableNo)

                    var oFilterTableNo2 = new sap.ui.model.Filter("Lgort",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                    aLgortFilters.push(oFilterTableNo2)

                    var oFilterTableNo2 = new sap.ui.model.Filter("Lgobe",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                    aLgortFilters.push(oFilterTableNo2)

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })

                } else if (sPath.includes('werks')) {
                    var path = "/sh_werksSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Werks}",
                        description: "{Name1}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Werks",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Name1",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })

                } else if (sPath.includes('saknr')) {
                    var path = "/sh_saknrSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Saknr}",
                        description: "{Txt50}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Saknr",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Txt50",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })

                } else if (sPath.includes('clasf')) {
                    var path = "/sh_clasfSet";

                    var aFiltersClasf = []

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Knttp}",
                        description: "{Knttx}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Lang",
                        sap.ui.model.FilterOperator.EQ,
                        'PT');
                    aFiltersClasf.push(oFilterTableNo)

                    var oFilterTableNo2 = new sap.ui.model.Filter("Knttp",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                    aFiltersClasf.push(oFilterTableNo2)

                    var oFilterTableNo2 = new sap.ui.model.Filter("Knttx",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                    aFiltersClasf.push(oFilterTableNo2)

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFiltersClasf
                    })

                } else if (sPath.includes('material')) {
                    var path = "/sh_materialSet";
                    var filters = []

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Matnr}",
                        description: "{Maktx}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Matnr",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                        filters.push(oFilterTableNo)

                    var oFilterTableNo = new sap.ui.model.Filter("Werks",
                        sap.ui.model.FilterOperator.EQ,
                        centro);
                        filters.push(oFilterTableNo)

                    var oFilterTableNo2 = new sap.ui.model.Filter("Maktx",
                        sap.ui.model.FilterOperator.EQ,
                        value);
                        filters.push(oFilterTableNo)

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: filters
                    })

                } else if (sPath.includes('_imobilizado')) {
                    var path = "/sh_imobilizadoSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Anln1}",
                        description: "{Mcoa1}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                        sap.ui.model.FilterOperator.EQ,
                        that.getView().byId('empresa').getValue());

                    var oFilterTableNo2 = new sap.ui.model.Filter("Anln1",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo3 = new sap.ui.model.Filter("Mcoa1",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2, oFilterTableNo3]
                    })

                } else if (sPath.includes('subimobilizado')) {
                    var path = "/sh_subimobilizadoSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Anln2}",
                        description: "{Mcoa1}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                        sap.ui.model.FilterOperator.EQ,
                        that.getView().byId('empresa').getValue());

                    var oFilterTableNo2 = new sap.ui.model.Filter("Anln1",
                        sap.ui.model.FilterOperator.EQ,
                        that.selectedImobilizado);

                    var oFilterTableNo3 = new sap.ui.model.Filter("Mcoa1",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2, oFilterTableNo3]
                    })
                } else {
                    // Live change cabeçalho
                    if (that.inputId.includes('empresa')) {
                        var sTerm = "Bukrs"
                        var Stext = "Butxt"
                        var path = "/sh_bukrsSet";
                    } else if (that.inputId.includes('tipoReq')) {
                        var sTerm = "Bsart"
                        var Stext = "Batxt"
                        var path = "/sh_bsartSet";
                    }

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{" + sTerm + "}",
                        description: "{" + Stext + "}"
                    });// //create a filter for the binding     

                    var oFilterTableNo = new sap.ui.model.Filter(sTerm,
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter(Stext,
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })
                }

            },
            onConfirm: function (oEvent) {

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var conta = that.selItem.getCells()[2]
                var centro = that.selItem.getCells()[5]

                var selSaknr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Saknr
                if (selSaknr) {
                    conta.setValue(selSaknr)
                }

                var selWerks = oEvent.getParameter('selectedItem').getBindingContext().getObject().Werks
                if (selWerks) {
                    centro.setValue(selWerks)
                }

            },

            handleTableValueHelpConfirm: function (oEvent) {
                var selItem = oEvent.getParameter("selectedItem");
                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                if (!that.inputId) {
                    that.inputId = '0'
                }

                if (!selItem) {
                    return
                }

                if (that.tabItem) {
                    var selKostl = oEvent.getParameter('selectedItem').getBindingContext().getObject().Kostl
                    if (selKostl) {
                        if (oThisMetadata.includes('Input')) {
                            that.setValue(selKostl)
                        } else {
                            that.tabItem.getCells()[13].setValue(selKostl)
                        }
                        return
                    }

                    var selMatnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Matnr
                    var matTxt = oEvent.getParameter('selectedItem').getBindingContext().getObject().Maktx
                    if (selMatnr) {


                        var oModel = that.getView().getModel()
                        that.tabItem.getCells()[4].setBusy(true)
                        that.tabItem.getCells()[7].setBusy(true)
                        oModel.read("/sh_material_infoSet(Matnr='" + selMatnr + "')", {
                            success: function (odata, response) {

                                that.tabItem.getCells()[4].setBusy(false)
                                that.tabItem.getCells()[7].setBusy(false)

                                that.tabItem.getCells()[4].setValue(odata.Meins)
                                that.tabItem.getCells()[7].setValue(odata.Matkl)

                                that.onSubmit()

                            },
                            error: function (error) {
                                that.tabItem.getCells()[4].setBusy(false)
                                that.tabItem.getCells()[7].setBusy(false)
                            }
                        })

                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selMatnr)
                            that.tabItem.getCells()[2].setValue(matTxt)
                        } else {
                            that.tabItem.getCells()[1].setValue(selMatnr)
                            that.tabItem.getCells()[2].setValue(matTxt)
                        }

                        return
                    }

                    var selLgort = oEvent.getParameter('selectedItem').getBindingContext().getObject().Lgort
                    if (selLgort) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selLgort)
                        } else {
                            that.tabItem.getCells()[8].setValue(selLgort)
                        }
                        return
                    }

                    var selWerks = oEvent.getParameter('selectedItem').getBindingContext().getObject().Werks
                    if (selWerks) {
                        that.tabItem.getCells()[5].setValue(selWerks)
                    }

                    var selMatkl = oEvent.getParameter('selectedItem').getBindingContext().getObject().Matkl
                    if (selMatkl) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selMatkl)
                        } else {
                            that.tabItem.getCells()[7].setValue(selMatkl)
                        }
                        return
                    }

                    var selEkgrp = oEvent.getParameter('selectedItem').getBindingContext().getObject().Ekgrp
                    if (selEkgrp) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selEkgrp)
                        } else {
                            that.tabItem.getCells()[17].setValue(selEkgrp)
                        }
                        return
                    }

                    var selClasf = oEvent.getParameter('selectedItem').getBindingContext().getObject().Knttp
                    if (selClasf) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selClasf)
                        } else {
                            that.tabItem.getCells()[11].setValue(selClasf)
                        }
                        return
                    }

                    var selAufnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Aufnr
                    if (selAufnr) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selAufnr)
                        } else {
                            let tabId = that.tabItem.getParent().getId()
                            if (tabId.includes('reqTable')) {
                                that.tabItem.getCells()[9].setValue(selAufnr)
                            } else {
                                that.tabItem.getCells()[3].setValue(selAufnr)
                            }
                        }
                        return
                    }

                    var selImobilizado = oEvent.getParameter('selectedItem').getBindingContext().getObject().Anln1
                    if (selImobilizado) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selImobilizado)
                        } else {
                            that.tabItem.getCells()[14].setValue(selImobilizado)
                        }
                    }

                    var selImobilizado = oEvent.getParameter('selectedItem').getBindingContext().getObject().Anln2
                    if (selImobilizado) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selImobilizado)
                        } else {
                            that.tabItem.getCells()[15].setValue(selImobilizado)
                        }
                        return
                    }

                    var selSaknr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Saknr
                    if (selSaknr) {
                        that.tabItem.getCells()[12].setValue(selSaknr)
                    }

                }

                if (selItem) {
                    if (that.inputId.includes('empresa')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Bukrs);
                        that.getView().byId('txtBukrs').setProperty('text', selItem.getBindingContext().getObject().Butxt)
                    } else if (that.inputId.includes('tipoReq')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Bsart);
                        that.getView().byId('txtTipoReq').setProperty('text', selItem.getBindingContext().getObject().Batxt)
                    }
                }
                // this.oDialog.destroy();
            },

            clearAll: function () {
                var sUrl = window.location.protocol + '//' + window.location.host + '/sap/bc/bsp/sap/zportal_conlan/index.html' + '#' + this.matricula
                window.location.replace(sUrl)
            },

            onLiveChangeLifnr: function (oEvent) {
                var oSource = oEvent.getSource() // pega o searchField
                var oParameters = oEvent.getParameters()
                var sTerm = oParameters.value //termo de busca
                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");

                var sTerm = "Ktopl"
                var Stxt = "Txt50"
                var Saknr = "Saknr"

                var aFilters = []

                if (value) {
                    var filter = new sap.ui.model.Filter(sTerm, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)

                    var filter = new sap.ui.model.Filter(Stxt, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)

                    var filter = new sap.ui.model.Filter(Saknr, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)
                }

                binding.filter(aFilters);
            },

            onSubmit: function () {
                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var oView = that.getView()
                var oModel = oView.getModel()
                var table = oView.byId('reqTable')

                table.getItems().forEach(function (item) {

                    var material = item.getCells()[1].getValue()
                    var centro = item.getCells()[5].getValue()
                    var sUrl = '/sh_conta_derivSet(' + 'IMatnr=' + "'" + material + "'," + 'IWerks=' + "'" + centro + "')"

                    oModel.read(sUrl, {
                        success: function (data, response) {

                            // Preço
                            if (data.Vprsv == 'S') {

                                var preco = Intl.NumberFormat('pt-br', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(data.Stprs).replace("R$", "").replace("\u00A0", "");

                            } else {

                                var preco = Intl.NumberFormat('pt-br', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(data.Verpr).replace("R$", "").replace("\u00A0", "");

                            }

                            // if (!item.getCells()[16].getValue() || item.getCells()[16].getValue() == '0,00') {
                                item.getCells()[16].setValue(preco)
                            // }

                            // if (!item.getCells()[12].getValue()) {
                                item.getCells()[12].setValue(data.ContaDebito)
                            // }

                            that.calculaValores()

                        },
                        error: function (erro) {
                        }

                    })

                })

                that.calculaValores()
            },

            calculaValores: function () {
                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var table = that.byId("reqTable");
                var tabItens = table.getItems()

                that.byId("vTotal").setValue(0)

                tabItens.forEach(function (item) {
                    var nfTot = item.getCells()[6].getValue()
                    if (!nfTot) {
                        nfTot = 0
                    }

                    var quantidade = parseFloat(item.getCells()[3].getValue().replaceAll(".", "").replace(",", "."))
                    var preco = parseFloat(item.getCells()[16].getValue().replaceAll(".", "").replace(",", "."))
                    var montante = quantidade * preco

                    // montante = montante + ""
                    nfTot = montante

                    if (!total) {
                        total = 0
                    }

                    var value = that.byId("vTotal").getValue()

                    value = parseFloat(value.replaceAll(".", "").replace(",", "."))
                    // nfTot = nfTot + "";
                    if (typeof (nfTot) == 'string' && nfTot.includes(',')) {
                        nfTot = parseFloat(nfTot.replaceAll(".", "").replace(",", "."))
                    }

                    var total = value + nfTot

                    total = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(total).replace("R$", "").replace("\u00A0", "");
                    nfTot = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(nfTot).replace("R$", "").replace("\u00A0", "");

                    preco = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(preco).replace("R$", "").replace("\u00A0", "");

                    that.byId("vTotal").setValue(total)
                    item.getCells()[6].setValue(nfTot)
                    item.getCells()[16].setValue(preco)

                    if (total == 'NaN') {
                        that.byId("vTotal").setValue("0,00")
                    }

                    if (nfTot == 'NaN') {
                        item.getCells()[6].setValue("0,00")
                    }

                    if (preco == 'NaN') {
                        item.getCells()[16].setValue("0,00")
                    }

                });

            }

        });
    })