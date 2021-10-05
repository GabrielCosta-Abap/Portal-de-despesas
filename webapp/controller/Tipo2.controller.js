// const { util } = require("prettier");

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
    "sap/ui/core/Fragment",
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

        return Controller.extend("queroquerons.conslandespesas.controller.Tipo2", {

            oRoute: null,
            matricula: "",
            anexos: [],
            grupos: [],

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

                var vRoute = this.getRouter().getRoute("RouteTipo2");
                vRoute.attachPatternMatched(this.onPatternMatched, this);

            },

            clearAll: function () {
                var sUrl = window.location.protocol + '//' + window.location.host + '/sap/bc/bsp/sap/zportal_conlan/index.html' + '#' + this.matricula
                window.location.replace(sUrl)
            },

            onPatternMatched: function (oEvent) {
                this.matricula = oEvent.getParameters().arguments.matricula

                var oFilter = new sap.ui.model.Filter("Pernr",
                    sap.ui.model.FilterOperator.EQ,
                    this.matricula);

                var oModel = this.getView().getModel()
                var url = "/sh_pernrSet"
                oModel.read(url, {
                    filters: [oFilter],
                    success: function (odata, response) {
                        debugger

                        this.dadosMatricula = odata


                        this.unidade = odata.results[0].CD || odata.results[0].MATRIZ || odata.results[0].FILIAL
                        if (this.unidade >= '0003') {
                            oView.byId("codAprov").setValue(this.unidade)
                            oView.byId("codAprov").setEditable(false)
                            oView.byId("codAprov").setBusy(false)
                        } else {
                            oView.byId("codAprov").setValue()
                            oView.byId("codAprov").setEditable(true)
                            oView.byId("codAprov").setBusy(false)
                        }

                    }.bind(this),
                    error: function (error) {
                        debugger
                    }.bind(this)
                })
                var oView = this.getView()
                // Limpa cabeçalho
                oView.byId("matricula").setValue()
                oView.byId("empresa").setValue()
                oView.byId("dtDoc").setValue()
                oView.byId("dtLanc").setValue()
                oView.byId("txtCab").setValue()
                oView.byId("area").setValue()
                oView.byId("cpf").setValue()
                oView.byId("banco").setValue()
                oView.byId("agencia").setValue()
                oView.byId("bkont").setValue()
                oView.byId("alelo").setValue()
                oView.byId("celula").setValue()
                oView.byId("codAprov").setValue()
                oView.byId("adtoViagem").setValue()
                oView.byId("resumoDesp").setValue()
                oView.byId("valLiquido").setValue()

                // Limpa dados viagem
                oView.byId("dataInicio").setValue()
                oView.byId("horaInicio").setValue()
                oView.byId("dataFim").setValue()
                oView.byId("horaFim").setValue()
                oView.byId("kmTotal").setValue()

                //Limpa tabela de itinerário
                var tableItinerario = this.getView().byId("tabViagem");
                var selItems = tableItinerario.getItems()

                selItems[0].getCells()[1].setValue()
                selItems[0].getCells()[2].setValue()
                selItems[0].getCells()[3].setValue()
                selItems[0].getCells()[4].setValue()

                for (var i = 1; i < selItems.length; i++) {
                    table.removeItem(selItems[i])
                }

                // Limpa tabela de detalhes
                var tabDetalhes = this.getView().byId("reqTable");
                var selItems = tabDetalhes.getItems()

                selItems[0].getCells()[0].setValue()
                selItems[0].getCells()[1].setValue()
                selItems[0].getCells()[2].setValue()
                selItems[0].getCells()[3].setValue()
                selItems[0].getCells()[4].setValue()
                selItems[0].getCells()[5].setValue()
                selItems[0].getCells()[6].setValue()
                selItems[0].getCells()[7].setValue()
                selItems[0].getCells()[8].setValue()
                selItems[0].getCells()[9].setValue()

                for (var i = 1; i < selItems.length; i++) {
                    table.removeItem(selItems[i])
                }

                var oAttachmentUpl = this.byId('UploadSet')
                const sPath = oAttachmentUpl._getAllItems()[0]
                if (sPath) {
                    window.location.reload()
                }
            },

            onSalvar: function () {

                this.onSubmit()

                var oView = this.getView()
                var oHeader = {}

                if (oView.byId("dataInicio").getValue().substring(0, 2) > oView.byId("dataFim").getValue().substring(0, 2)
                    && oView.byId("dataInicio").getValue().substring(3, 5) >= oView.byId("dataFim").getValue().substring(3, 5)) {
                    sap.m.MessageToast.show(`Data final deve ser maior ou igual a data inicial. Corrigir itinerário`)
                    return
                }

                if (oView.byId("dataInicio").getValue() == oView.byId("dataFim").getValue() && oView.byId("dataInicio").getValue() && oView.byId("dataFim").getValue()) {
                    if (oView.byId("horaInicio").getValue() >= oView.byId("horaFim").getValue()) {
                        sap.m.MessageToast.show(`Hora final deve ser maior que a hora inicial. Corrigir itinerário`)
                        return
                    }
                }

                if (!oView.byId("tipoLanc").getValue()
                    || !oView.byId("matricula").getValue()
                    || !oView.byId("empresa").getValue()
                    || !oView.byId("dtDoc").getValue()
                    || !oView.byId("dtLanc").getValue()
                    || !oView.byId("codAprov").getValue()) {
                    sap.m.MessageToast.show(`Preencher todos os campos de cabeçalho`)
                    return
                }

                oHeader.Mandt = ''
                oHeader.Zpdsol = ''
                oHeader.Zpdnum = ''
                oHeader.Zldesp = oView.byId("tipoLanc").getValue()
                oHeader.Bsart = ''
                oHeader.Zpudt = oView.byId("dtLanc").getValue()
                oHeader.Bukrs = oView.byId("empresa").getValue()
                oHeader.Belnr = ""
                oHeader.Gjahr = ""
                oHeader.Banfn = ""
                oHeader.Budat = oView.byId("dtLanc").getValue()
                oHeader.Lifnr = oView.byId("matricula").getValue()
                oHeader.Name1 = oView.byId("txtMatricula").getText()
                oHeader.Gsber = oView.byId("codAprov").getValue()
                oHeader.Wrbtr = oView.byId("resumoDesp").getValue().replaceAll(".", "").replace(",", ".")
                oHeader.Pargb = oView.byId("codAprov").getValue()
                oHeader.Zlsch = ""
                oHeader.Zfbdt = oView.byId("dtLanc").getValue()
                oHeader.Zterm = "0030"  // Fixo por enquanto
                oHeader.Zfdtag = ""
                oHeader.Zstats = ""
                oHeader.Usnam = this.matricula
                oHeader.Cname = ""
                oHeader.Data = ""
                oHeader.Hora = ""
                oHeader.Justificativa = ""
                oHeader.Xbelnr = ''
                oHeader.Bldat = oView.byId("dtDoc").getValue()
                oHeader.Bktxt = oView.byId("txtCab").getValue()
                oHeader.Zdifl = '0.00'
                oHeader.Ztotnf = '0.00'
                oHeader.Datv1 = oView.byId("dataInicio").getValue(),
                    oHeader.Uhrv1 = oView.byId("horaInicio").getValue(),
                    oHeader.Datb1 = oView.byId("dataFim").getValue(),
                    oHeader.Uhrb1 = oView.byId("horaFim").getValue(),
                    oHeader.Kmges = oView.byId("kmTotal").getValue(),
                    oHeader.Vladtrec = oView.byId("adtoViagem").getValue().replaceAll(".", "").replace(",", ".")
                oHeader.Resdesp = oView.byId("resumoDesp").getValue().replaceAll(".", "").replace(",", ".")
                oHeader.Vlremb = oView.byId("valLiquido").getValue().replaceAll(".", "").replace(",", ".")
                oHeader.Disponivel = oView.byId("disponivelHeader").getValue().replaceAll(".", "").replace(",", ".")
                oHeader.Utilizado = oView.byId("utilizadoHeader").getValue().replaceAll(".", "").replace(",", ".")

                if (oView.byId("kmTotal").getValue()) {
                    if (!oView.byId("dataInicio").getValue()
                        || !oView.byId("dataFim").getValue()
                        || !oView.byId("horaInicio").getValue()
                        || !oView.byId("horaFim").getValue()) {
                        sap.m.MessageToast.show(`Preencher Dados da viagem por completo`)
                        return
                    }
                }

                if (oView.byId("dataInicio").getValue()
                    && oView.byId("dataFim").getValue()) {

                }

                oHeader.ItinerarioSet = []
                oHeader.DetalheDespesaSet = []

                this.anexos.forEach(function (anexo) {
                    var content = anexo.Filecontent.split(',')
                    if (content.length > 1) {
                        anexo.Filecontent = content[1]
                    }
                })

                oHeader.header_Anexo = this.anexos

                if (oHeader.header_Anexo.length == 0) {
                    MessageToast.show('Informar Anexos')
                    return
                }

                oHeader.Result = [
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


                var table = oView.byId("reqTable");
                var tabViagem = oView.byId("tabViagem");
                var itensViagem = tabViagem.getItems()
                var tabItens = table.getItems()

                itensViagem.forEach(function (item) {
                    var itemViagem = {}

                    itemViagem.Zitem = item.getCells()[0].getValue()
                    itemViagem.LocFrom = item.getCells()[1].getValue()
                    itemViagem.LocTo = item.getCells()[2].getValue()
                    itemViagem.DepDate = item.getCells()[3].getValue()
                    itemViagem.Kmges = item.getCells()[4].getValue()

                    if (itemViagem.Zitem
                        && itemViagem.LocFrom
                        && itemViagem.LocTo
                        && itemViagem.DepDate
                        && itemViagem.Kmges) {
                        oHeader.ItinerarioSet.push(itemViagem)
                    }

                });

                var val = 0
                tabItens.forEach(function (item) {
                    var itemDespesa = {}

                    itemDespesa.Belnr = item.getCells()[7].getValue()
                    itemDespesa.Buzei = ""
                    itemDespesa.Gjahr = ""
                    itemDespesa.Bukrs = ""
                    itemDespesa.Zpdsol = ""
                    itemDespesa.Zpdnum = ""
                    itemDespesa.Zcdesp = item.getCells()[1].getValue().substring(0, 2)
                    itemDespesa.Cpudt = item.getCells()[0].getValue().replaceAll(".", "")
                    itemDespesa.ZdescDesp = item.getCells()[3].getValue()
                    itemDespesa.Hkont = item.getCells()[2].getValue()
                    itemDespesa.Zportorc = item.getCells()[10].getValue().replaceAll(".", "").replace(",", ".")
                    itemDespesa.Zportdisp = item.getCells()[11].getValue().replaceAll(".", "").replace(",", ".")
                    itemDespesa.Bldat = item.getCells()[0].getValue().replaceAll(".", "")
                    itemDespesa.Zpanexo = item.getCells()[3].getValue()
                    itemDespesa.Zpvlrpg = item.getCells()[5].getValue().replaceAll(".", "").replace(",", ".")
                    itemDespesa.Zpvlrrem = item.getCells()[6].getValue().replaceAll(".", "").replace(",", ".")
                    itemDespesa.Dmbtr = item.getCells()[6].getValue().replaceAll(".", "").replace(",", ".")
                    itemDespesa.Sgtext = item.getCells()[4].getValue()
                    itemDespesa.Kostl = item.getCells()[8].getValue()
                    itemDespesa.Aufnr = item.getCells()[9].getValue()
                    itemDespesa.Docref = item.getCells()[7].getValue()

                    // if (itemDespesa.Zpvlrrem < itemDespesa.Zpvlrpg) {
                    //     sap.m.MessageToast.show(`Valor de R$ Pago excede R$ Reembolso`)
                    //     val = 1
                    //     return
                    // }


                    if (!itemDespesa.Kostl
                        && !itemDespesa.Aufnr) {
                        sap.m.MessageToast.show(`Preencher Ordem ou Centro de Custo`)
                        val = 1
                        return
                    }

                    // se a data estiver menor do que a data início do itinerário OU maior que a data fim, dá erro
                    // if ( ( item.getCells()[0].getValue().substring(0,2) > oView.byId("dataFim").getValue().substring(0,2)
                    //     && item.getCells()[0].getValue().substring(3,5) >= oView.byId("dataFim").getValue().substring(3,5)
                    //     )
                    // || 
                    //     ( item.getCells()[0].getValue().substring(0,2) < oView.byId("dataInicio").getValue().substring(0,2) 
                    //     &&  item.getCells()[0].getValue().substring(3,5) <= oView.byId("dataInicio").getValue().substring(3,5) 
                    //     ) 
                    //   ) {
                    //         sap.m.MessageToast.show( `Data da despesa deve estar entre a data de início e fim da viagem. ` )
                    //         val=1
                    //         return
                    //     }

                    if (!itemDespesa.Bldat) {
                        val = 1
                        sap.m.MessageToast.show(`Campo Data é obrigatório`)
                        return
                    }
                    if (!itemDespesa.Zcdesp) {
                        val = 1
                        sap.m.MessageToast.show(`Campo Despesa é obrigatório`)
                        return
                    }
                    if (!itemDespesa.Sgtext) {
                        val = 1
                        sap.m.MessageToast.show(`Campo Observação/Texto Item é obrigatório`)
                        return
                    }
                    if (itemDespesa.Zpvlrpg == '0.00') {
                        val = 1
                        sap.m.MessageToast.show(`Campo R$ Pago é obrigatório`)
                        return
                    }
                    if (itemDespesa.Zpvlrrem == '0.00') {
                        val = 1
                        sap.m.MessageToast.show(`Campo R$ Reembolso é obrigatório`)
                        return
                    }

                    if (!itemDespesa.Aufnr
                        && !itemDespesa.Kostl) {
                        val = 1
                        sap.m.MessageToast.show(`Preencher Ordem ou Centro de Custo`)
                        return
                    }

                    if (itemDespesa.Bldat
                        && itemDespesa.Zcdesp
                        && itemDespesa.Sgtext
                        && itemDespesa.Zpvlrpg
                        && itemDespesa.Zpvlrrem) {
                        oHeader.DetalheDespesaSet.push(itemDespesa)
                    }

                });

                debugger

                if (oHeader.ItinerarioSet.length == 0 && val != 1) {
                    sap.m.MessageToast.show(`Preencher pelo menos um item de despesa por completo`)
                    return
                }

                if (val == 1) {
                    // sap.m.MessageToast.show(`Preencher pelo menos um item de despesa por completo`)
                    return
                }


                var mParameters = {
                    success: function (oData, response) {
                        debugger
                        response.data.Result.results.forEach(function (msg) {
                            if (msg.Type == 'E') {
                                oView.setBusy(false)
                                sap.m.MessageToast.show(msg.Message)
                            }
                        })

                        var sMsg = response.data.Result.results.filter(function (msg) {
                            return msg.Type == 'E';
                        })

                        if (sMsg.length == 0) {
                            oView.setBusy(false)
                            sap.m.MessageToast.show(`Dados gravados com sucesso`)
                            this.clearAll()
                        }

                    }.bind(this),
                    error: function (oError) {
                        debugger
                        oView.setBusy(false)
                        sap.m.MessageToast.show('Ocorreu um erro ao gravar. Verificar dados.')
                    }.bind(this)
                }

                val = 0

                oView.setBusy(true)
                var ODataModel = oView.getModel()

                ODataModel.create("/DespesaReembolsoViagemSet", oHeader, mParameters)

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
                    var itmValue = table.getItems().length + 1
                    var sItem = table.getItems()[0]

                    var itemRow = new ColumnListItem({
                        type: sap.m.ListType.Inactive,
                        unread: false,
                        vAlign: "Middle",
                        cells: [
                            // add created controls to item
                            new sap.m.DatePicker({
                                valueFormat: "dd.MM.yyyy",
                                displayFormat: "short",
                                placeholder: " ",
                                change: that.onSubmit
                            }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchDespesa
                            }),

                            new sap.m.Input({ type: "Text", value: "", visible: false, }),
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit, }),
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit, }),
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit, }),
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit }), // that.calcularReembolso
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit, }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchKostl
                            }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchAufnr
                            }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit, visible: false,
                                editable: false
                            }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit, visible: false,
                                editable: false
                            }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit, visible: false,
                                editable: false
                            }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit, visible: false,
                                editable: false
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://add",
                                //  submit:that.onSubmit,
                                press: that.onAdd
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://delete",
                                //  submit:that.onSubmit,
                                press: that.removeDetLine
                            }),
                            new sap.m.Input({
                                visible: false,
                                editable: false
                            }),
                            new sap.m.Input({
                                visible: false,
                                editable: false
                            })
                        ]

                    });

                    itemRow.getCells()[1].setProperty('showValueHelp', true)
                    itemRow.getCells()[8].setProperty('showValueHelp', true)
                    itemRow.getCells()[9].setProperty('showValueHelp', true)

                } else { //Itinerário

                    var table = that.getView().byId("tabViagem");
                    var itmValue = table.getItems().length + 1

                    var itemRow = new ColumnListItem({
                        type: sap.m.ListType.Inactive,
                        unread: false,
                        vAlign: "Middle",
                        cells: [
                            new sap.m.Input({ type: "Text", value: itmValue, editable: false, submit: that.onSubmit, }),
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit, }),
                            new sap.m.Input({ type: "Text", value: "", submit: that.onSubmit, }),
                            new sap.m.DatePicker({
                                valueFormat: "dd.MM.yyyy",
                                displayFormat: "short",
                                placeholder: " ",
                                change: "onSubmit"
                            }),
                            new sap.m.Input({ type: "Number", value: "", submit: that.onSubmit }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://add", submit: that.onSubmit,
                                press: that.onAdd
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://delete", submit: that.onSubmit,
                                press: that.removeLine
                            })
                        ]
                    });

                }
                table.addItem(itemRow)
            },

            calculaKM: function (oEvent) {
                // var table = oEvent.getSource().getParent().getParent()
                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var table = that.getView().byId('tabViagem')

                var total = parseInt(0);
                table.getItems().forEach(function (item) {

                    let km = item.getCells()[4].getValue()
                    if (!km) {
                        km = 0
                    }
                    km = parseInt(km)
                    total += km

                    item.getCells()[4].setValue(km)
                })

                that.getView().byId('kmTotal').setValue(total)

            },

            onLiveChange: function (oEvent) {
                //verificar necessidade de filtro aqui

                //     var oSource = oEvent.getSource() // pega o searchField
                //     var oParameters = oEvent.getParameters()
                //     var sTerm = oParameters.newValue //termo de busca
                //     var oTable = this.getView().byId('reqTable')

                //     var aFilters = []
                //     if (sTerm){
                //     var oFilter = new Filter({
                //         path: "item",
                //         operator: sap.ui.model.FilterOperator.EQ,
                //         value1: sTerm
                //     })
                //     aFilters.push(oFilter)
                // }

                //     var oBinding = oTable.getBinding('items') 
                //     oBinding.filter([ aFilters ])

            },
            onNavBack: function (oEvent) {
                window.history.go(-1);
            },
            newAttachment: function () {
                var oView = this.getView()

                var anexos = oView.byId('anexos')

                var oContent = new sap.ui.unified.FileUploader()
                var oTitle = new sap.ui.core.Title()

                anexos.addContent(oContent)

            },

            onSearch: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue();
                var path;
                var oTableStdListTemplate;
                var oFilterTableNo;
                this.inputId = oEvent.getSource().getId();

                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                that.tabItem = oEvent.getSource().getParent()

                if (!that.oDialog) {
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog2", that);
                }

                if (that.oDialog) {

                    if (this.inputId.includes('empresa')) {
                        path = "/sh_bukrsSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Bukrs}",
                            description: "{Butxt}"
                        });// //create a filter for the binding

                        oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                            sap.ui.model.FilterOperator.EQ,
                            sInputValue);

                        that.oDialog.setTitle('Empresa')

                    } else if (this.inputId.includes('codAprov')) {
                        path = "/sh_pargbSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Gsber}",
                            description: "{Gtext}"
                        });// //create a filter for the binding

                        oFilterTableNo = new sap.ui.model.Filter("Gsber",
                            sap.ui.model.FilterOperator.EQ,
                            sInputValue);

                        that.oDialog.setTitle('Cód. Aprovador')
                    }

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo]
                    })

                    that.oDialog.open();
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

                if (that.tabItem) {
                    var selKostl = oEvent.getParameter('selectedItem').getBindingContext().getObject().Kostl
                    if (selKostl) {
                        if (oThisMetadata.includes('Input')) {
                            that.setValue(selKostl)
                        } else {
                            that.tabItem.getCells()[8].setValue(selKostl)
                        }
                        return
                    }

                    var selAufnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Aufnr
                    if (selAufnr) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selAufnr)
                        } else {
                            that.tabItem.getCells()[9].setValue(selAufnr)
                        }
                        return
                    }

                    var zcod = oEvent.getParameter('selectedItem').getBindingContext().getObject().Zcod
                    var zdescdesp = oEvent.getParameter('selectedItem').getBindingContext().getObject().ZdescDesp
                    var selDespesa = zcod + ' - ' + zdescdesp
                    var selWrbtr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Wrbtr


				// FS - JHON - INÍCIO
                    var zalelo = oEvent.getParameter("selectedItem").getBindingContext().getObject().Zalelo;
                    var matAlelo = that.byId('alelo').getValue() // FS - GC - 23.09.2021 - Ajuste validação alelo

                    if (matAlelo == 'X'){
                        if(zalelo == 'X' ){
                            that.tabItem.getCells()[1].setValue("");
                            that.tabItem.getCells()[6].setValue("");
                            that.tabItem.getCells()[6].setEditable(true);
                            sap.m.MessageToast.show('Despesa não permitida para funcionário com Alelo');
                            return;
                        }
                    }

                    var zcalc  = oEvent.getParameter("selectedItem").getBindingContext().getObject().Zcalc;
                // FS - JHON - FIM                     


                    if (selWrbtr > 0.00) {
                        var bool = false
                    } else {
                        var bool = true
                    }

                    if (selWrbtr) {
                        selWrbtr = Intl.NumberFormat('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(selWrbtr).replace("R$", "").replace("\u00A0", "")
                    }

                    if (zcod && zdescdesp) {
                        if (oThisMetadata.includes('Input')) {
                            this.setValue(selDespesa)
                            that.tabItem.getCells()[6].setValue(selWrbtr)
                            that.tabItem.getCells()[6].setEditable(bool)
                        } else {
                            that.tabItem.getCells()[1].setValue(selDespesa)

                            if(zcalc == 'X'){
                                var kmtotal = "";
                                if(that.oView.byId("kmTotal").getValue()){
                                     kmtotal = parseFloat(that.oView.byId("kmTotal").getValue());
                                }else{
                                    kmtotal = 0;
                                }
                                var wb = parseFloat(selWrbtr.replace(",", "."));
                                selWrbtr = wb * kmtotal;
                                selWrbtr = selWrbtr + "";
                                selWrbtr = selWrbtr.replace(".", ",");
                                that.tabItem.getCells()[6].setValue(selWrbtr);
                                that.tabItem.getCells()[6].setEditable(bool);
                                
                                that.tabItem.getCells()[16].setValue('X');
                                that.tabItem.getCells()[17].setValue(wb);
                            }else{
                                that.tabItem.getCells()[6].setValue(selWrbtr);
                                that.tabItem.getCells()[6].setEditable(bool);
                            }
                        }
                        that.tabItem.getCells()[13].setValue(selWrbtr)
                        return
                    }
                }

                if (selItem) {
                    if (that.inputId.includes('empresa')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Bukrs);
                        // that.getView().byId('txtBukrs').setProperty('text', selItem.getBindingContext().getObject().Butxt)
                    } else if (that.inputId.includes('codAprov')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Gsber);
                    } else if (that.inputId.includes('matricula')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Pernr);

                        that.updMatricula(selItem.getBindingContext().getObject().Pernr)
                    }
                }

            },

            onConfirm: function (oEvent) {

                if (this.inputId.includes('matricula')) {
                    var fornecedor = this.byId('matricula')
                    var selLifnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Lifnr
                    fornecedor.setValue(selLifnr)
                    // this.byId('txtLifnr').setProperty('text', oEvent.getParameter('selectedItem').getBindingContext().getObject().Name1)
                }
            },

            removeLine: function (oEvent) {
                var table = oEvent.getSource().getParent().getParent()
                var selItems = table.getItems()
                var itemSelecionado = oEvent.getSource().getParent().getCells()[0].getValue()

                if (itemSelecionado == '1') {
                    // MessageToast.show('Não é possível remover o primeiro item')
                    // oEvent.getSource().getParent().getCells().forEach(function(sItem){
                    //     if (sItem.getValue() !='1'){
                    //         sItem.setValue()
                    //     }
                    // })
                    oEvent.getSource().getParent().getCells()[1].setValue()
                    oEvent.getSource().getParent().getCells()[2].setValue()
                    oEvent.getSource().getParent().getCells()[3].setValue()
                    oEvent.getSource().getParent().getCells()[4].setValue()
                    return
                }

                for (var i = 1; i < selItems.length; i++) {
                    if (selItems[i].getCells()[0].getValue() == itemSelecionado
                        && itemSelecionado != '1') {
                        table.removeItem(selItems[i])
                    }
                }
            },

            removeDetLine: function (oEvent) {
                var table = oEvent.getSource().getParent().getParent()
                var selItems = table.getItems()
                var idSelected = oEvent.getSource().getParent().sId
                var that = this

                if (table.getItems().length == 1) {
                    selItems.forEach(function (item) {

                        var grupoDel = that.grupos.filter(function (grupo) {
                            return grupo = item.getCells()[12].getValue()
                        })

                        if (grupoDel.length == 1) {
                            that.grupos = that.grupos.filter(function (grupo) {
                                return grupo != item.getCells()[12].getValue()
                            })
                        }

                        item.getCells()[0].setValue()
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
                    })
                    return
                }

                for (var i = 1; i < selItems.length; i++) {
                    if (selItems[i].sId == idSelected) {
                        table.removeItem(selItems[i])
                    }
                }

            },

            onMatriculaMatchCode: function (oEvent) {
                this.selItem = oEvent.getSource().getParent()
                this.inputId = oEvent.getSource().getId();

                var sName = "queroquerons.conslandespesas.view.ValuesHelpDialogMatricula"

                var path;
                var oTableStdListTemplate;
                var oFilterTableNo;
                var oButton = oEvent.getSource()
                var oView = this.getView();

                if (!this._kDialog) {
                    this._kDialog = Fragment.load({
                        id: oView.getId(),
                        name: sName,
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._kDialog.then(function (oDialog) {
                    // Set growing if required
                    var bGrowing = !!oButton.data("growing");
                    oDialog.setGrowing(bGrowing);
                    oDialog.setTitle('Matrícula')
                    oDialog.open();
                });

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
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog2", that);
                }

                if (that.oDialog) {

                    path = "/CentroCustoSet"

                    var aFilterKostl = []

                    oFilterTableNo = new sap.ui.model.Filter("IBukrs",
                        sap.ui.model.FilterOperator.EQ,
                        that.getView().byId('empresa').getValue());
                    aFilterKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("IKokrs",
                        sap.ui.model.FilterOperator.EQ,
                        'CCQQ');
                    aFilterKostl.push(oFilterTableNo)

                    var unidadeEmpresa = that.dadosMatricula.results[0].FILIAL || that.dadosMatricula.results[0].MATRIZ || that.dadosMatricula.results[0].CD

                    oFilterTableNo = new sap.ui.model.Filter("IUnidadeEmpresa",
                        sap.ui.model.FilterOperator.EQ,
                        unidadeEmpresa);
                    aFilterKostl.push(oFilterTableNo)

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Kostl}",
                        description: "{Ltext}"
                    });// //create a filter for the binding

                    that.oDialog.setTitle('Centro de custo')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFilterKostl
                    })
                    //////////////////////////////////////////////////////////////////////////////////////////////////                    

                    that.oDialog.open(sInputValue);
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
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog2", that);
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

                    that.oDialog.open();
                }
            },

            onSearchDespesa: function (oEvent) {
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
                    that.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog2", that);
                }

                if (that.oDialog) {

                    path = "/DespesaViagemSet";

                    oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Zcod}",
                        description: "{ZdescDesp}"
                    });// //create a filter for the binding

                    // if (sInputValue) {
                    oFilterTableNo = new sap.ui.model.Filter("ZdescDesp",
                        sap.ui.model.FilterOperator.EQ,
                        sInputValue);
                    // }

                    var array = []
                    if (sInputValue) {
                        array.push(oFilterTableNo)
                    }


                    that.oDialog.setTitle('Despesa')

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: array
                    })

                    that.oDialog.open(sInputValue);
                }
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

                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");

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

                } else if (sPath.includes('kostl') || sPath == "/CentroCustoSet") {

                    var path = "/CentroCustoSet";

                    var aFilterKostl = []

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Kostl}",
                        description: "{Ltext}"
                    });// //create a filter for the binding

                    oFilterTableNo = new sap.ui.model.Filter("IBukrs",
                        sap.ui.model.FilterOperator.EQ,
                        that.getView().byId('empresa').getValue());
                    aFilterKostl.push(oFilterTableNo)

                    oFilterTableNo = new sap.ui.model.Filter("IKokrs",
                        sap.ui.model.FilterOperator.EQ,
                        'CCQQ');
                    aFilterKostl.push(oFilterTableNo)

                    var unidadeEmpresa = that.dadosMatricula.results[0].FILIAL || that.dadosMatricula.results[0].MATRIZ || that.dadosMatricula.results[0].CD

                    oFilterTableNo = new sap.ui.model.Filter("IUnidadeEmpresa",
                        sap.ui.model.FilterOperator.EQ,
                        unidadeEmpresa);
                    aFilterKostl.push(oFilterTableNo)

                    if (value) {
                        var oFilterTableNo = new sap.ui.model.Filter("IDescricao",
                            sap.ui.model.FilterOperator.EQ,
                            value);
                        aFilterKostl.push(oFilterTableNo)
                    }

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: aFilterKostl
                    })

                } else if (sPath.includes('DespesaViagem')) {

                    var path = "/DespesaViagemSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Zcod}",
                        description: "{ZdescDesp}"
                    });// //create a filter for the binding

                    var oFilterTableNo2 = new sap.ui.model.Filter("ZdescDesp",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo2]
                    })

                } else {

                    if (that.inputId.includes('empresa')) {
                        var sTerm = "Bukrs"
                        var Stext = "Butxt"
                        var path = "/sh_bukrsSet";
                    } else if (that.inputId.includes('codAprov')) {
                        var sTerm = "Gsber"
                        var Stext = "Gtext"
                        var path = "/sh_pargbSet";
                    } else if (that.inputId.includes('matricula')) {
                        var sTerm = "Pernr"
                        var Stext = "Cname"
                        var path = "/sh_pernrSet"
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
                        value.toUpperCase());

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })
                }
            },

            liveChangeMatricula: function (oEvent) {
                var oParameters = oEvent.getParameters()
                var sTerm = oParameters.value //termo de busca
                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");

                // var sTerm = "Pernr"
                var Stxt = "Cname"

                var aFilters = []

                if (value) {
                    // var filter = new sap.ui.model.Filter(sTerm, sap.ui.model.FilterOperator.EQ, value);
                    // aFilters.push(filter)

                    var filter = new sap.ui.model.Filter(Stxt, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)
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

                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");

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

                } else if (sPath.includes('CentroCusto')) {

                    ////////////////////////////////////////////////////////////////////////////
                    // var sTerm = "Aufnr"
                    // var Stext = "Ktext"
                    var path = "/CentroCustoSet"

                    var centroCustoFilters = []

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Kostl}",
                        description: "{Ltext}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("IBukrs",
                        sap.ui.model.FilterOperator.EQ,
                        that.getView().byId('empresa').getValue());
                        centroCustoFilters.push(oFilterTableNo)

                    var oFilterTableNo2 = new sap.ui.model.Filter("IKokrs",
                        sap.ui.model.FilterOperator.EQ,
                        'CCQQ');
                        centroCustoFilters.push(oFilterTableNo2)

                        var unidadeEmpresa = that.dadosMatricula.results[0].FILIAL || that.dadosMatricula.results[0].MATRIZ || that.dadosMatricula.results[0].CD

                        oFilterTableNo = new sap.ui.model.Filter("IUnidadeEmpresa",
                            sap.ui.model.FilterOperator.EQ,
                            unidadeEmpresa);
                            centroCustoFilters.push(oFilterTableNo)

                        oFilterTableNo = new sap.ui.model.Filter("Kostl",
                            sap.ui.model.FilterOperator.EQ,
                            value);
                            centroCustoFilters.push(oFilterTableNo)

                        oFilterTableNo = new sap.ui.model.Filter("IDescricao",
                            sap.ui.model.FilterOperator.EQ,
                            value);
                            centroCustoFilters.push(oFilterTableNo)

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: centroCustoFilters
                    })
                    ////////////////////////////////////////////////////////////////////////////

                } else if (sPath.includes('kostl')) {

                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////                    
                    var path = "/sh_kostlSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Kostl}",
                        description: "{Bukrs}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter("Kostl",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter("Bukrs",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo, oFilterTableNo2]
                    })
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                } else if (sPath.includes('DespesaViagem')) {

                    var path = "/DespesaViagemSet";

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{Zcod}",
                        description: "{ZdescDesp}"
                    });// //create a filter for the binding

                    var oFilterTableNo2 = new sap.ui.model.Filter("ZdescDesp",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    that.oDialog.unbindAggregation("items");
                    that.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo2]
                    })

                } else {

                    if (that.inputId.includes('empresa')) {
                        var sTerm = "Bukrs"
                        var Stext = "Butxt"
                        var path = "/sh_bukrsSet";
                    } else if (that.inputId.includes('codAprov')) {
                        var sTerm = "Gsber"
                        var Stext = "Gtext"
                        var path = "/sh_pargbSet";
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

            calcularReembolso: function (oEvent) {
                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var table = that.byId('reqTable')

                that.byId("resumoDesp").setValue(0)
                table.getItems().forEach(function (item) {
                    let reembolso = item.getCells()[6].getValue()
                    if (!reembolso) {
                        reembolso = 0
                    }else{
                        var zcalc =	item.getCells()[16].getValue();
                        var vl_zcalc = item.getCells()[17].getValue();
                        if(zcalc == 'X'){
                            var kmtotal = parseFloat(that.byId("kmTotal").getValue().replace(",","."));
                            var vl_calc = parseFloat(vl_zcalc.replace(",","."));
                            var vl_reemb = vl_calc * kmtotal;
                            vl_reemb = vl_reemb + "";
                            vl_reemb = vl_reemb.replace(".",",");
                            reembolso = vl_reemb ;
                        }                        
                    }

                    let pago = item.getCells()[5].getValue()
                    if (!pago) {
                        pago = 0
                    }

                    let limite = item.getCells()[13].getValue()
                    if (!limite) {
                        limite = 0
                    }

                    var value = that.getView().byId('resumoDesp').getValue()

                    value = parseFloat(value.replaceAll(".", "").replace(",", "."))
                    reembolso = reembolso + "";
                    reembolso = parseFloat(reembolso.replaceAll(".", "").replace(",", "."))

                    pago = pago + "";
                    pago = parseFloat(pago.replaceAll(".", "").replace(",", "."))

                    limite = limite + "";
                    limite = parseFloat(limite.replaceAll(".", "").replace(",", "."))

                    var total = value + reembolso

                    if (!total) {
                        total = 0
                    }

                    if (reembolso > pago && pago > '0.00') {
                        reembolso = pago
                    } else if (reembolso < pago) {

                        if (limite >= reembolso && limite >= pago) {
                            // pago = pago //odata.results[0].Wrbtr
                            reembolso = pago //odata.results[0].Wrbtr
                        } else if(limite >= reembolso && limite < pago){
                            // pago = limite 
                            reembolso = limite
                        }

                    }

                    total = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(total).replace("R$", "").replace("\u00A0", "");

                    reembolso = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(reembolso).replace("R$", "").replace("\u00A0", "");

                    pago = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(pago).replace("R$", "").replace("\u00A0", "");

                    that.getView().byId('resumoDesp').setValue(total)
                    item.getCells()[6].setValue(reembolso)
                    item.getCells()[5].setValue(pago)
                })

                let adtoViagem = that.getView().byId('adtoViagem').getValue()
                let resumoDesp = that.getView().byId('resumoDesp').getValue()

                if (!adtoViagem) {
                    adtoViagem = 0
                }

                if (!resumoDesp) {
                    resumoDesp = 0
                }

                if (adtoViagem) {
                    adtoViagem = parseFloat(adtoViagem.replaceAll(".", "").replace(",", "."));
                }

                if (resumoDesp) {
                    resumoDesp = parseFloat(resumoDesp.replaceAll(".", "").replace(",", "."));
                }

                let liquido = resumoDesp - adtoViagem

                liquido = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(liquido).replace("R$", "").replace("\u00A0", "");

                adtoViagem = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(adtoViagem).replace("R$", "").replace("\u00A0", "");
                resumoDesp = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(resumoDesp).replace("R$", "").replace("\u00A0", "");

                that.getView().byId('valLiquido').setValue(liquido)
                that.getView().byId('adtoViagem').setValue(adtoViagem)
                that.getView().byId('resumoDesp').setValue(resumoDesp)

            },

            calculaDisponivelUtilizado: function () {

                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var grupos = this.grupos
                var table = that.byId('reqTable')

                var valueDisponivel = that.getView().byId('disponivelHeader').getValue()
                var valueUtilizado = that.getView().byId('utilizadoHeader').getValue()

                that.byId("disponivelHeader").setValue(0)
                that.byId("utilizadoHeader").setValue(0)
                table.getItems().forEach(function (item) {

                    let disponivel = item.getCells()[10].getValue()
                    if (!disponivel) {
                        disponivel = 0
                    }

                    let utilizado = item.getCells()[11].getValue()
                    if (!utilizado) {
                        utilizado = 0
                    }

                    // var valueDisponivel = that.getView().byId('disponivelHeader').getValue()
                    // var valueUtilizado = that.getView().byId('utilizadoHeader').getValue()

                    valueDisponivel = valueDisponivel + ""
                    valueDisponivel = parseFloat(valueDisponivel.replaceAll(".", "").replace(",", "."))

                    disponivel = disponivel + "";
                    disponivel = parseFloat(disponivel.replaceAll(".", "").replace(",", "."))

                    valueUtilizado = valueUtilizado + ''
                    valueUtilizado = parseFloat(valueUtilizado.replaceAll(".", "").replace(",", "."))

                    utilizado = utilizado + "";
                    utilizado = parseFloat(utilizado.replaceAll(".", "").replace(",", "."))

                    var checkGrupo = grupos.filter(function (grupo) {
                        return grupo = item.getCells()[12].getValue()
                    })

                    if (checkGrupo.length == 0) {
                        // var totalDisponivel = valueDisponivel + disponivel
                        // var totalUtilizado = valueUtilizado + utilizado

                        if (!totalDisponivel) {
                            totalDisponivel = that.getView().byId('disponivelHeader').getValue().replaceAll(".", "").replace(",", ".") || 0
                        }
                        if (!totalUtilizado) {
                            totalUtilizado = that.getView().byId('utilizadoHeader').getValue().replaceAll(".", "").replace(",", ".") || 0
                        }

                        var totalDisponivel = totalDisponivel + disponivel
                        var totalUtilizado = totalUtilizado + utilizado
                        grupos.push(item.getCells()[12].getValue())
                    } else {
                        var totalDisponivel = disponivel //valueDisponivel
                        var totalUtilizado = utilizado   //valueUtilizado
                    }

                    if (!totalDisponivel) {
                        totalDisponivel = 0
                    }
                    if (!totalUtilizado) {
                        totalUtilizado = 0
                    }

                    totalDisponivel = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(totalDisponivel).replace("R$", "").replace("\u00A0", "");
                    totalUtilizado = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(totalUtilizado).replace("R$", "").replace("\u00A0", "");

                    that.getView().byId('disponivelHeader').setValue(totalDisponivel)
                    that.getView().byId('utilizadoHeader').setValue(totalUtilizado)
                    item.getCells()[10].setValue(disponivel)
                    item.getCells()[11].setValue(utilizado)
                })

                let disponivelHeader = that.getView().byId('disponivelHeader').getValue()
                let utilizadoHeader = that.getView().byId('utilizadoHeader').getValue()

                if (!disponivelHeader) {
                    disponivelHeader = 0
                }
                if (!utilizadoHeader) {
                    utilizadoHeader = 0
                }

                if (disponivelHeader) {
                    disponivelHeader = parseFloat(disponivelHeader.replaceAll(".", "").replace(",", "."));
                }
                if (utilizadoHeader) {
                    utilizadoHeader = parseFloat(utilizadoHeader.replaceAll(".", "").replace(",", "."));
                }

                disponivelHeader = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(disponivelHeader).replace("R$", "").replace("\u00A0", "");
                utilizadoHeader = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(utilizadoHeader).replace("R$", "").replace("\u00A0", "");

                that.getView().byId('disponivelHeader').setValue(disponivelHeader)
                that.getView().byId('utilizadoHeader').setValue(utilizadoHeader)
            },

            onUploadCompleted: function (oEvent) {
                var that = this
                var aFiles = []

                that.onSubmit()

                let file = oEvent.getParameter('item').getFileObject()
                var reader = new FileReader();

                reader.readAsDataURL(file, {
                    success: function (data, response) {
                    }
                });

                reader.onload = function (readerEvt) {

                    var fileData = {
                        Zpdsol: "0",
                        Filename: file.name,
                        Mimetype: file.type,
                        Filecontent: "",
                        Uname: "0",
                    }

                    fileData.Filecontent = readerEvt.target.result

                    that.anexos.push(fileData)

                }.bind(this);

                return aFiles
            },

            updMatricula: function (value) {
                // var value = oEvent.getSource().getValue()

                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                if (!value) {
                    that.getView().byId('txtMatricula').setProperty('text', '')
                } else {
                    var oFilter = new sap.ui.model.Filter("Pernr",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oModel = that.getView().getModel()
                    var url = "/sh_pernrSet"
                    oModel.read(url, {
                        filters: [oFilter],
                        success: function (odata, response) {
                            that.getView().byId('txtMatricula').setProperty('text', odata.results[0].Cname)
                        }.bind(that),
                        error: function (error) {
                            debugger
                        }.bind(that)
                    })


                    var oModel = that.getView().getModel()
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

                    var url = "/sh_pernrSet"

                    oModel.read(url, {
                        filters: [oFilter],
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
                        error: function (error) {
                            debugger

                            area.setBusy(false)
                            cpf.setBusy(false)
                            banco.setBusy(false)
                            agencia.setBusy(false)
                            bkont.setBusy(false)
                            alelo.setBusy(false)
                            celula.setBusy(false)


                        }.bind(that)
                    })







                }

            },

            updBukrs: function (value) {
                // var value = oEvent.getSource().getValue()
                if (!value) {
                    this.getView().byId('txtBukrs').setProperty('text', '')
                } else {

                    var bukrsFilter = new sap.ui.model.Filter("Bukrs",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oModel = this.getView().getModel()
                    oModel.read("/sh_bukrsSet", {
                        filters: [bukrsFilter],
                        success: function (odata, response) {
                            this.getView().byId('txtBukrs').setProperty('text', odata.results[0].Butxt)
                        }.bind(this),

                        error: function (response) {
                            debugger
                        }
                    })
                }
            },

            updCodAprov: function (value) {
                // var value = oEvent.getSource().getValue()
                if (!value) {
                    this.getView().byId('txtCodAprov').setProperty('text', '')
                } else {

                    let ODataModel = this.getView().getModel()
                    var oFilterTableNo = new sap.ui.model.Filter("Gsber",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    ODataModel.read("/sh_pargbSet", {
                        filters: [oFilterTableNo],
                        success: function (data, response) {
                            this.getView().byId('txtCodAprov').setProperty("text", data.results[0].Gtext)
                        }.bind(this),
                        error: function (oError) {
                            debugger
                        }.bind(this)
                    })
                }
            },

            getOrcamento: function (item) {
                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var grupos = []

                var disponivelHeader = that.byId('disponivelHeader').getValue()
                var utilizadoHeader = that.byId('utilizadoHeader').getValue()

                var oModel = that.getView().getModel()
                oModel.setHeaders({ "X-Requested-With": "X" })

                item.getCells()[10].setBusy(true)
                item.getCells()[11].setBusy(true)

                var aFiltersDesc = []
                var Zdesc = item.getCells()[1].getValue().substring(0, 2)

                var zdescFilter = new sap.ui.model.Filter("ZdescDesp",
                    sap.ui.model.FilterOperator.EQ,
                    Zdesc);
                aFiltersDesc.push(zdescFilter)


                oModel.read('/DespesaViagemSet', {
                    filters: aFiltersDesc,
                    success: function (data, response) {

                        var Aufnr = item.getCells()[9].getValue()
                        var Ccontab = data.results[0].Hkont
                        var Kagru = data.results[0].Kagru
                        var Kostl = item.getCells()[8].getValue()
                        var dtLanc = that.getView().byId("dtLanc").getValue()
                        item.getCells()[2].setValue(Ccontab)
                        var dtLanc = dtLanc.replace(".", "")
                        var dtLanc = dtLanc.replace(".", "")

                        if (!Ccontab) {
                            return
                        }

                        if (!Aufnr && !Kostl) {
                            sap.m.MessageToast.show('Informar Ordem ou Centro de Custo para determinar orçamento')
                            return
                        }

                        if (Aufnr) {
                            var entity = "/ZFM_CONSULTA_ORCAMENTO1Set(ICentro='',IConta='',IData='',IOrdem='" + Aufnr + "',IGrpConta='" + Kagru + "')";
                        } else if (Kostl) {
                            if (!dtLanc) {
                                sap.m.MessageToast.show('Informar a data de lançamento para determinar o orçamento.')
                                item.getCells()[10].setBusy(false)
                                item.getCells()[11].setBusy(false)
                                return
                            }

                            // var entity = "/ZFM_CONSULTA_ORCAMENTO1Set(ICentro='"+Kostl+"',IConta='"+Ccontab+"',IData='"+dtLanc+"',IOrdem='',IGrpConta='')";
                            var entity = "/ZFM_CONSULTA_ORCAMENTO1Set(ICentro='" + Kostl + "',IConta='',IData='" + dtLanc + "',IOrdem='',IGrpConta='" + Kagru + "')";
                        }

                        oModel.read(entity, {
                            success: function (oData, oResponse) {
                                debugger

                                if (oData.EOrcamento.includes(',') || oData.EDisponivel.includes(',')) {
                                    oData.EOrcamento = oData.EOrcamento.replaceAll('.', '').replace(',', '.')
                                    oData.EDisponivel = oData.EDisponivel.replaceAll('.', '').replace(',', '.')

                                    //     var totalDisponivel = disponivelHeader.replaceAll('.', '').replace(',', '.')
                                    //     var totalUtilizado =  utilizadoHeader.replaceAll('.', '').replace(',', '.')
                                    // }

                                    // if (!disponivel){
                                    //     disponivel = 0
                                    // }

                                    // if (!utilizado){
                                    //     utilizado = 0
                                }

                                var disponivel = oData.EDisponivel
                                var utilizado = oData.EOrcamento - oData.EDisponivel

                                // var checkKagru = grupos.filter(function (grupo) {
                                //     return grupo == Kagru
                                // })

                                // if (checkKagru.length == 0) {

                                //     if (!totalDisponivel){
                                //         totalDisponivel = 0
                                //     }

                                //     if (!totalUtilizado){
                                //         totalUtilizado = 0
                                //     }

                                //     totalDisponivel = totalDisponivel + disponivel
                                //     totalUtilizado = totalUtilizado + utilizado

                                //     grupos.push(Kagru)
                                // }

                                disponivel = Intl.NumberFormat('pt-br', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(disponivel).replace("R$", "").replace("\u00A0", "");
                                utilizado = Intl.NumberFormat('pt-br', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(utilizado).replace("R$", "").replace("\u00A0", "");
                                // totalDisponivel = Intl.NumberFormat('pt-br', {
                                //     style: 'currency',
                                //     currency: 'BRL'
                                // }).format(totalDisponivel).replace("R$", "").replace("\u00A0", "");
                                // totalUtilizado = Intl.NumberFormat('pt-br', {
                                //     style: 'currency',
                                //     currency: 'BRL'
                                // }).format(totalUtilizado).replace("R$", "").replace("\u00A0", "");

                                item.getCells()[10].setBusy(false)
                                item.getCells()[11].setBusy(false)

                                item.getCells()[10].setValue(disponivel);
                                item.getCells()[11].setValue(utilizado);
                                item.getCells()[12].setValue(Kagru);

                                // that.getView().byId('disponivelHeader').setValue(totalDisponivel);
                                // that.getView().byId('utilizadoHeader').setValue(totalUtilizado);

                                if (!oData.EOrcamento) {
                                    sap.m.MessageToast.show("Sem orçamento disponível para esta conta. Verificar se o grupo de contas está devidamente cadastrado.")
                                }

                            }.bind(this),
                            error: function (oError) {
                                item.getCells()[10].setBusy(false)
                                item.getCells()[11].setBusy(false)

                                item.getCells()[10].setValue('')
                                item.getCells()[11].setValue('')

                                sap.m.MessageToast.show("Não foi possível determinar orçamento com os dados informados.");
                            }
                        });
                    }.bind(this),

                    error: function (response) {

                    }.bind(this)
                })

            },

            onSubmit: function () {

                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input') || oThisMetadata.includes('Icon')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var oView = that.getView()
                var matricula = oView.byId('matricula').getValue()
                var empresa = oView.byId('empresa').getValue()
                var codAprov = oView.byId('codAprov').getValue()

                that.updMatricula(matricula)
                that.updBukrs(empresa)
                that.updCodAprov(codAprov)
                that.calculaKM()
                that.calcularReembolso()
                // var  fornec   =  oView.byId("fornec").getValue()
                // var  formaPag =  oView.byId("formaPag").getValue()
                // var  condPgto =  oView.byId("condPgto").getValue()
                // var  empresa  =  oView.byId("empresa").getValue()
                // var  codAprov =  oView.byId("codAprov").getValue()
                // var  empresa  =  oView.byId("empresa").getValue()

                // that.updFornecedor(fornec)
                // that.updFPgto(formaPag)
                // that.updZterm(condPgto)

                // that.updCodAprov(codAprov)
                // that.calculaTotais()
                // that.changeDtLanc()

                that.buscaAdtoViagemn()

                var table = that.getView().byId('reqTable')
                table.getItems().forEach(function (item) {
                    if (item.getCells()[1].getValue() != false) {
                        if (item.getCells()[7].getValue() != false || item.getCells()[8].getValue() != false) {
                            that.getOrcamento(item)
                        } else {
                            // MessageToast.show(`Preencher Ordem ou Centro de Custo para determinar orçamento do item ${item.getCells()[0].getValue()}`)
                            MessageToast.show(`Preencher Ordem ou Centro de Custo para determinar orçamento`)
                        }
                    }
                })

                // Aguarda 2 segundos para garantir que os campos disponível/utilizado do item já estão preenchidos.
                oView.byId('disponivelHeader').setBusy(true)
                oView.byId('utilizadoHeader').setBusy(true)
                setTimeout(() => { that.calculaDisponivelUtilizado(); }, 2000);
                oView.byId('disponivelHeader').setBusy(false)
                oView.byId('utilizadoHeader').setBusy(false)
            },

            buscaAdtoViagemn: function () {
                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }
                var oView = that.getView()

                var oModel = oView.getModel()
                var matricula = oView.byId('matricula').getValue()
                var empresa = oView.byId('empresa').getValue()
                var aFilters = []

                var oFilter = new sap.ui.model.Filter("Bukrs",
                    sap.ui.model.FilterOperator.EQ,
                    empresa);
                aFilters.push(oFilter)

                var oFilter = new sap.ui.model.Filter("Pernr",
                    sap.ui.model.FilterOperator.EQ,
                    matricula);
                aFilters.push(oFilter)

                oModel.read('/AdtViagemSet', {
                    filters: aFilters,
                    success: function (data, response) {

                        if (data.results[0].ValorAdiantamento.includes(',')) {
                            data.results[0].ValorAdiantamento = data.results[0].ValorAdiantamento.replaceAll('.', '').replace(',', '.')
                        }

                        data.results[0].ValorAdiantamento = Intl.NumberFormat('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(data.results[0].ValorAdiantamento).replace("R$", "").replace("\u00A0", "");

                        oView.byId('adtoViagem').setValue(data.results[0].ValorAdiantamento)

                    }.bind(that),
                    error: function (error) {
                        debugger
                    }.bind(that)
                })
            },

            // onUploadCompleted: function (oEvent) {

            //     var that = this
            //     var aFiles = []

            //     that.onSubmit()

            //     this.byId('UploadSet').getIncompleteItems().forEach(function (item) {
            //         let file = item.getFileObject()
            //         var reader = new FileReader();

            //         reader.readAsDataURL(file, {
            //             success: function (data, response) {
            //                 // debugger
            //             }
            //         });

            //         reader.onload = function (readerEvt) {
            //             // that.doUpload(data);

            //             var fileData = {
            //                 Zpdsol: "0",
            //                 Filename: file.name,
            //                 Mimetype: file.type,
            //                 Filecontent: "",
            //                 Uname: "0",
            //                 // Sydate: "0",
            //                 // Sytime: "0"
            //             }

            //             fileData.Filecontent = readerEvt.target.result

            //             that.anexos.push(fileData)

            //         }.bind(this);
            //     })

            //     // setTimeout(() => { window.location.reload(); }, 2000);
            //     return aFiles
            // },

        });
    })








    //txtLifnr