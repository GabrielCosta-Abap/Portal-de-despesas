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
        Fragment
    ) {
        "use strict";

        return Controller.extend("queroquerons.conslandespesas.controller.Tipo1", {
            oRoute: "",
            oTable: "",
            anexos: [],
            token: "",
            matricula: "",
            dadosMatricula: {},
            Zpfpj: "",
            tipoUnidade: "",
            contaPfPj: "",

            onInit: function () {

                window.addEventListener('popstate', (event) => {
                    this.clearAll()
                });

                this.oRoute = this.getOwnerComponent().getRouter()

                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPORTALDESPESAS_SRV", { useBatch: false })
                this.getView().setModel(oModel);
                sap.ui.getCore().setModel(oModel)

                // var modelMatricula = sap.ui.getCore().getModel('dadosMatricula')
                // this.getView().setModel('modelMatricula',modelMatricula);
                //
                this.globalView = this.getView()

                var oAttachmentUpl = this.byId('UploadSet').getDefaultFileUploader();
                oAttachmentUpl.setIcon("sap-icon://add").setIconOnly(true);

                var vRoute = this.getRouter().getRoute("RouteTipo1");
                vRoute.attachPatternMatched(this.onPatternMatched, this);

            },

            onPatternMatched(oEvent) {
                this.matricula = oEvent.getParameters().arguments.matricula
                var oView = this.getView()

                var oFilter = new sap.ui.model.Filter("Pernr",
                    sap.ui.model.FilterOperator.EQ,
                    this.matricula);

                var oModel = this.getView().getModel()
                var url = "/sh_pernrSet"

                oView.byId("codAprov").setBusy(true)
                oModel.read(url, {
                    filters: [oFilter],
                    success: function (odata, response) {
                        debugger

                        this.dadosMatricula = odata
                        this.unidade = odata.results[0].CD || odata.results[0].MATRIZ || odata.results[0].FILIAL
                        this.tipoUnidade = odata.results[0].CD || odata.results[0].MATRIZ ? "M" : "F"

                        if(this.unidade >= '0003'){
                            oView.byId("codAprov").setValue(this.unidade)
                            oView.byId("codAprov").setEditable(false)
                            oView.byId("codAprov").setBusy(false)
                        }else{
                            oView.byId("codAprov").setValue()
                            oView.byId("codAprov").setEditable(true)
                            oView.byId("codAprov").setBusy(false)
                        }


                    }.bind(this),
                    error: function (error) {
                        debugger
                        oView.byId("codAprov").setBusy(false)
                    }.bind(this)
                })

                
                oView.byId("fornec").setValue()
                oView.byId("nf").setValue()
                oView.byId("dtDoc").setValue()
                oView.byId("dtLanc").setValue()
                oView.byId("formaPag").setValue()
                oView.byId("dtBase").setValue()
                oView.byId("condPgto").setValue('0015')
                oView.byId("empresa").setValue()
                oView.byId("txtCab").setValue()
                // oView.byId("codAprov").setValue()
                oView.byId("totNf").setValue()
                oView.byId("vTotal").setValue()
                oView.byId("difLanc").setValue()
                oView.byId("txtZterm").setProperty('text', '15 Dias')

                var table = this.getView().byId("reqTable");
                var selItems = table.getItems()

                selItems[0].getCells()[1].setValue()
                selItems[0].getCells()[2].setValue()
                selItems[0].getCells()[3].setValue()
                selItems[0].getCells()[4].setValue()
                selItems[0].getCells()[5].setValue()
                selItems[0].getCells()[6].setValue()
                selItems[0].getCells()[7].setValue()

                for (var i = 1; i < selItems.length; i++) {
                    table.removeItem(selItems[i])
                }

                var oAttachmentUpl = this.byId('UploadSet')
                const sPath = oAttachmentUpl._getAllItems()[0]
                if (sPath) {
                    window.location.reload()
                }

                var today = new Date();
                var dd = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var mm = String(today.getDate()).padStart(2, '0');
                var yyyy = today.getFullYear();

                today = mm + '/' + dd + '/' + yyyy;

                this.getView().byId('dtLanc').setValue(today)

                debugger

                var inicial = this.getView().byId('dtLanc').getValue()
                var dias = parseInt(15);
                var partes = inicial.split("/");
                var ano = partes[2];
                var mes = partes[1] - 1;
                var dia = partes[0];

                inicial = new Date(ano, mes, dia);
                var final = new Date(inicial);
                final.setDate(final.getDate() + dias);

                debugger
                var dd = ("0" + final.getDate()).slice(-2);
                var mm = ("0" + (final.getMonth() + 1)).slice(-2);
                var y = final.getFullYear();

                var dataformatada = dd + '/' + mm + '/' + y;

                oView.byId("dtBase").setValue(dataformatada);

            },

            onSalvar: function (oEvent) {
                var oView = this.getView()
                var oHeader = {}

                this.onSubmit()
                debugger

                if (!oView.byId("fornec").getValue()
                    || !oView.byId("nf").getValue()
                    || !oView.byId("dtDoc").getValue()
                    || !oView.byId("dtLanc").getValue()
                    || !oView.byId("formaPag").getValue()
                    || !oView.byId("dtBase").getValue()
                    || !oView.byId("condPgto").getValue()
                    || !oView.byId("empresa").getValue()
                    || !oView.byId("codAprov").getValue()
                    || !oView.byId("totNf").getValue()
                    || !oView.byId("vTotal").getValue()
                    || !oView.byId("difLanc").getValue()
                    || !oView.byId("empresa").getValue()) {
                    sap.m.MessageToast.show(`Preencher todos os campos de cabeçalho`)
                    return
                }

                oHeader.Zpdsol = ''
                oHeader.Zpdnum = ''
                oHeader.Zldesp = oView.byId("tipoLanc").getValue()
                oHeader.Zpudt = oView.byId("dtLanc").getValue().replaceAll("/", ".")
                oHeader.Bukrs = oView.byId("empresa").getValue()
                oHeader.Belnr = ""
                oHeader.Gjahr = ""
                oHeader.Budat = oView.byId("dtLanc").getValue().replaceAll("/", ".")
                oHeader.Lifnr = oView.byId("fornec").getValue()
                oHeader.Name1 = oView.byId("txtLifnr").getText()
                oHeader.Gsber = oView.byId("codAprov").getValue()
                oHeader.Wrbtr = oView.byId("vTotal").getValue().replaceAll(".", "").replace(",", ".")
                oHeader.Pargb = oView.byId("codAprov").getValue()
                oHeader.Zlsch = oView.byId("formaPag").getValue()
                oHeader.Zfbdt = oView.byId("dtBase").getValue().replaceAll("/", ".")
                oHeader.Zterm = oView.byId("condPgto").getValue()
                oHeader.Zfdtag = ""
                oHeader.Zstats = ""
                oHeader.Usnam = this.matricula
                oHeader.Cname = ""
                oHeader.Data = ""
                oHeader.Hora = ""
                oHeader.Justificativa = ""
                oHeader.Xbelnr = oView.byId("nf").getValue()
                oHeader.Bldat = oView.byId("dtDoc").getValue().replaceAll("/", ".")
                oHeader.Bktxt = oView.byId("txtCab").getValue()
                oHeader.Zdifl = oView.byId("difLanc").getValue().replaceAll(".", "").replace(",", ".")
                oHeader.Ztotnf = oView.byId("totNf").getValue().replaceAll(".", "").replace(",", ".")

                oHeader.DespesaFornecedorItens = []

                this.anexos.forEach(function(anexo){

                    var content = anexo.Filecontent.split(',')
                    if (content.length > 1){
                        anexo.Filecontent = content[1]
                    }
                    
                })

                oHeader.header_Anexo = this.anexos

                if (this.anexos.length == 0) {
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
                var tabItens = table.getItems()

                var val = 0
                tabItens.forEach(function (item) {
                    var itemDespesa = {}

                    if (item.getCells()[1].getValue() && item.getCells()[5].getValue()) {
                        debugger
                        if (!item.getCells()[3].getValue() && !item.getCells()[4].getValue()) {
                            sap.m.MessageToast.show(`Preencher Ordem ou Centro de Custo`)
                            val = 1
                            return
                        }

                        if (oView.byId("difLanc").getValue().replaceAll(".", "").replace(",", ".") != 0) {
                            sap.m.MessageToast.show(`Valor da Diferença deve ser 0,00`)
                            val = 1
                            return
                        }

                        if (!item.getCells()[2].getValue()) {
                            sap.m.MessageToast.show(`Texto do item é obrigatório`)
                            val = 1
                            return
                        }

                        itemDespesa.Buzei = item.getCells()[0].getValue()
                        itemDespesa.Zpdsol = ''
                        itemDespesa.ZdescDesp = item.getCells()[2].getValue()
                        itemDespesa.Zpdnum = ''
                        itemDespesa.Hkont = item.getCells()[1].getValue()
                        itemDespesa.Sgtext = item.getCells()[2].getValue()
                        itemDespesa.Aufnr = item.getCells()[3].getValue()
                        itemDespesa.Kostl = item.getCells()[4].getValue()
                        itemDespesa.Dmbtr = item.getCells()[5].getValue().replaceAll(".", "").replace(",", ".")
                        itemDespesa.Zportorc = item.getCells()[6].getValue().replaceAll(".", "").replace(",", ".")
                        itemDespesa.Zportdisp = item.getCells()[7].getValue().replaceAll(".", "").replace(",", ".")

                        oHeader.DespesaFornecedorItens.push(itemDespesa)

                    } else if (item.getCells()[1].getValue() && !item.getCells()[5].getValue()) {
                        sap.m.MessageToast.show(`É obrigatório preencher valores`)
                        val = 1
                        return
                    } else if (!item.getCells()[1].getValue() && item.getCells()[5].getValue()) {
                        sap.m.MessageToast.show(`É obrigatório preencher Conta Contábil`)
                        val = 1
                        return
                    } else if (t.byId("difLanc").getValue() > 0) {
                        sap.m.MessageToast.show(`Valor da Diferença do Lçto não pode ser positiva`)
                        val = 1
                        return
                    }
                });

                if (oHeader.DespesaFornecedorItens.length == 0 && val != 1) {
                    sap.m.MessageToast.show(`Preencher no mínimo um item`)
                    return
                }

                var mParameters = {
                    success: function (oData, response) {
                        debugger
                        var sMsg = []

                        if (response.data.Result != null) {

                            response.data.Result.results.forEach(function (msg) {
                                if (msg.Type == 'E') {
                                    oView.setBusy(false)

                                    if (msg.Message.includes('398') && msg.Message.includes('orçamento')) {
                                        sap.m.MessageToast.show(`Valor informado excede o disponível para a conta`)
                                        return
                                    } else {
                                        sap.m.MessageToast.show(`Não foi possível lançar a despesa com os dados informados. Verificar consistência dos mesmos.`)
                                    }
                                }
                            })

                            var sMsg = response.data.Result.results.filter(function (msg) {
                                return msg.Type == 'E';
                            })
                        }

                        if (sMsg.length == 0) {
                            debugger

                            // var zpdsol = oData.Result.results[0].Message

                            // var oModel = oView.getModel()
                            // oModel.setHeaders({
                            //     "X-Requested-With": "X",
                            //     "Slug": "nomearquivo",
                            //     "Content-Type": "image/jpeg",
                            //     // "Content-value": this.anexos[0].Filecontent
                            //     // "value": this.anexos[0].Filecontent

                            // })

                            // var oAnexos = {
                            //     "Zpdsol": zpdsol,
                            //     "Filecontent": this.anexos[0].Filecontent,
                            //     "Filename": this.anexos[0].Filename,
                            //     "Mimetype": this.anexos[0].Mimetype,
                            //     "Uname": '0'
                            // }

                            //  oModel.create('/anexo_itemSet', atob( this.anexos[0].Filecontent ), { //oAnexos, {
                            //     // serviceUrlParams: {
                            //     //     "$value": this.anexos[0].Filecontent
                            //     // },
                            //     // metadataUrlParams?

                            //     // urlParameters: {
                            //     //     "$value": this.anexos[0].Filecontent
                            //     // },
                            //      success: function(odata, response){

                            //      }.bind(this),
                            //      error: function(response){

                            //      }.bind(this)
                            //  })


                            // jQuery.ajax({
                            //     url: '/anexo_itemSet',
                            //     type: "POST",
                            //     data: file, //Files I want to send
                            //     contentType: "application/json",
                            //     datatype : "text",
                            //     headers: {
                            //         "X-Requested-With": "X" ,
                            //         "Slug": "nomearquivo",
                            //         "Content-Type": "image/jpeg",
                            //     },
                            //     success: function (data, textStatus, XMLHttpRequest) {
                            //         console.log('Uploaded files: ' + JSON.stringify(data));


                            //     },
                            //     error: function(oError) {
                            //         console.log('Error: ' + JSON.stringify(oError.responseText))
                            //     }
                            // });


                            oView.setBusy(false)
                            sap.m.MessageToast.show(`Dados gravados com sucesso`)
                            this.clearAll()
                        }

                    }.bind(this),

                    error: function (oError) {
                        debugger
                        oView.setBusy(false)
                        sap.m.MessageToast.show('Os dados informados são inconsistentes. Verificar preenchimento dos mesmos')
                    }
                }

                if (val == 1) { return }

                oView.setBusy(true)
                var ODataModel = oView.getModel()

                ODataModel.setHeaders({ "X-Requested-With": "X" })
                ODataModel.create("/DespesaFornecedorHeaderSet", oHeader, mParameters)

            },

            clearAll: function () {
                var sUrl = window.location.protocol + '//' + window.location.host + '/sap/bc/bsp/sap/zportal_conlan/index.html' + '#' + this.matricula
                window.location.replace(sUrl)
            },

            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },

            onRemoveItem: function (oEvent) {
                var table = this.getView().byId("reqTable");
                var selItems = table.getSelectedItems()

                table.removeSelections()

                for (var i = 0; i < selItems.length; i++) {
                    table.removeItem(selItems[i])
                }
            },

            onNewItem: function (oEvent) {

                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Icon')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var table = that.getView().byId("reqTable");
                var table = that.byId("reqTable");
                var itmValue = table.getItems().length + 1
                var sItem = table.getItems()[0]
                var sMaisColumn = sItem.getCells()[8]

                var oNewItem = that

                var itemRow = new ColumnListItem({
                    type: sap.m.ListType.Inactive,
                    unread: false,
                    vAlign: "Middle",
                    cells:
                        [
                            // add created controls to item
                            new sap.m.Input({ type: "Text", value: itmValue, width: "70%", editable: false, submit: that.onSubmit }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit, editable: that.getView().byId('fornec').getValue() ? true : false,
                                valueHelpRequest: that.onCContabMatchCode
                            }),

                            new sap.m.Input({ type: "Text", value: "", width: "112%", submit: that.onSubmit }),
                            new sap.m.Input({
                                type: "Text", value: "", width: "112%", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchAufnr
                            }),

                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                valueHelpRequest: that.onSearchKostl
                            }),
                            new sap.m.Input({ type: "Text", value: "", width: "70%", submit: that.onSubmit, }),
                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                editable: false
                            }),

                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit,
                                editable: false
                            }),

                            new sap.m.Input({
                                type: "Text", value: "", submit: that.onSubmit, visible: false,
                                editable: false
                            }),

                            new sap.ui.core.Icon({
                                src: "sap-icon://add",
                                press: that.onNewItem,
                            }),
                            new sap.ui.core.Icon({
                                src: "sap-icon://delete",
                                press: that.removeLine,
                            })
                        ]
                });

                itemRow.getCells()[1].setProperty('showValueHelp', true)
                itemRow.getCells()[3].setProperty('showValueHelp', true)
                itemRow.getCells()[4].setProperty('showValueHelp', true)
                // itemRow.getCells()[1].setProperty('valueHelpRequest', '.onAdd')
                // cell.attachValueHelpRequest()

                table.addItem(itemRow)

                // table.getItems().forEach( function(item){
                //     item.getCells()[1].attachEvent('press', this. )
                // })
                that.onSubmit()
            },

            removeLine: function (oEvent) {
                var table = oEvent.getSource().getParent().getParent()
                var selItems = table.getItems()
                var itemSelecionado = oEvent.getSource().getParent().getCells()[0].getValue()

                if (itemSelecionado == '1') {
                    MessageToast.show('Não é possível remover o primeiro item')
                    oEvent.getSource().getParent().getCells().forEach(function(item){
                        if (item.getValue() !='1'){
                            item.setValue()
                        }
                    })
                    return
                }

                for (var i = 1; i < selItems.length; i++) {
                    if (selItems[i].getCells()[0].getValue() == itemSelecionado
                        && itemSelecionado != '1') {
                        table.removeItem(selItems[i])
                    }
                }
            },

            calculaTotais: function (oEvent) {

                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var table = that.byId("reqTable");
                var tabItens = table.getItems()

                that.byId("totNf").setValue(0)

                tabItens.forEach(function (item) {
                    //   //debugger
                    var nfTot = item.getCells()[5].getValue()
                    if (!nfTot) {
                        nfTot = 0
                    }

                    var value = that.byId("totNf").getValue()

                    value = parseFloat(value.replaceAll(".", "").replace(",", "."))
                    nfTot = nfTot + "";
                    nfTot = parseFloat(nfTot.replaceAll(".", "").replace(",", "."))

                    var total = value + nfTot

                    if (!total) {
                        total = 0
                    }
                    total = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(total).replace("R$", "").replace("\u00A0", "");
                    nfTot = Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(nfTot).replace("R$", "").replace("\u00A0", "");

                    that.byId("totNf").setValue(total)
                    item.getCells()[5].setValue(nfTot)
                });

                var vTotal = that.byId("vTotal").getValue()
                var totNf = that.byId("totNf").getValue()

                if (!vTotal) {
                    vTotal = 0
                }
                if (!totNf) {
                    totNf = 0
                }

                // vTotal = vTotal + "";
                // totNf = totNf + ""

                if (vTotal) {
                    vTotal = parseFloat(vTotal.replaceAll(".", "").replace(",", "."));
                }

                if (totNf) {
                    totNf = parseFloat(totNf.replaceAll(".", "").replace(",", "."));
                }

                var vDif = vTotal - totNf
                vDif = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(vDif).replace("R$", "").replace("\u00A0", "");
                vTotal = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(vTotal).replace("R$", "").replace("\u00A0", "");
                totNf = Intl.NumberFormat('pt-br', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(totNf).replace("R$", "").replace("\u00A0", "");
                that.byId("difLanc").setValue(vDif)
                that.byId("vTotal").setValue(vTotal)
                that.byId("totNf").setValue(totNf)
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

                sTerm = sTerm.toString()

                var oBinding = oTable.getBinding('items')
                oBinding.filter("item",
                    sap.ui.model.FilterOperator.EQ,
                    sTerm)

            },
            onNavBack: function (oEvent) {
                window.history.go(-1);
            },
            // handleUploadComplete: function(oEvent) {
            //     var sResponse = oEvent.getParameter("response"),
            //         // iHttpStatusCode = parseInt(/\d{3}/.exec(sResponse)[0]),
            //         sMessage;

            //     if (sResponse) {
            //         sMessage = iHttpStatusCode === 200 ? sResponse + " (Upload Success)" : sResponse + " (Upload Error)";
            //         MessageToast.show(sMessage);
            //     }
            // },

            handleUploadPress: function () {
                // var oFileUploader = this.byId("fileUploader");
                // oFileUploader.checkFileReadable().then(function() {
                //     oFileUploader.upload();
                // }, function(error) {
                //     MessageToast.show("The file cannot be read. It may have changed.");
                // }).then(function() {
                //     oFileUploader.clear();
                // });
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
                this.inputId = oEvent.getSource().getId();

                var path;
                var oTableStdListTemplate;
                var oFilterTableNo;

                if (!this.oDialog) {
                    this.oDialog = sap.ui.xmlfragment("queroquerons.conslandespesas.view.ValueHelpDialog", this);
                }

                if (this.oDialog) {

                    if (this.inputId.includes('formaPag')) {
                        path = "/sh_zlschSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Zlsch}",
                            description: "{Text1}"
                        });// //create a filter for the binding

                        oFilterTableNo = new sap.ui.model.Filter("Zlsch",
                            sap.ui.model.FilterOperator.EQ,
                            sInputValue);

                        this.oDialog.setTitle('Forma de pagamento')

                    } else if (this.inputId.includes('empresa')) {

                        var lifnr = this.getView().byId('fornec').getValue()
                        if (!lifnr) {
                            MessageToast.show('Preencher primeiro o fornecedor')
                            return
                        }

                        path = "/sh_bukrsSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Bukrs}",
                            description: "{Butxt}"
                        });// //create a filter for the binding

                        oFilterTableNo = new sap.ui.model.Filter("Bukrs",
                            sap.ui.model.FilterOperator.EQ,
                            sInputValue);

                        this.oDialog.setTitle('Empresa')

                    } else if (this.inputId.includes('condPgto')) {

                        path = "/SH_ZTERMSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Zterm}",
                            description: "{Text1}"
                        });// //create a filter for the binding

                        oFilterTableNo = new sap.ui.model.Filter("Zterm",
                            sap.ui.model.FilterOperator.EQ,
                            sInputValue);

                        this.oDialog.setTitle('Condição de pagamento')


                    } else if (this.inputId.includes('codAprov')) {

                        path = "/sh_pargbSet";

                        oTableStdListTemplate = new sap.m.StandardListItem({
                            title: "{Gsber}",
                            description: "{Gtext}"
                        });// //create a filter for the binding

                        oFilterTableNo = new sap.ui.model.Filter("Gsber",
                            sap.ui.model.FilterOperator.EQ,
                            sInputValue);

                        this.oDialog.setTitle('Código do aprovador')

                    }

                    this.oDialog.unbindAggregation("items");
                    this.oDialog.bindAggregation("items", {
                        path: path,
                        template: oTableStdListTemplate,
                        filters: [oFilterTableNo]
                    })

                    this.oDialog.open(sInputValue);
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

                if (selItem) {

                    if (that.tabItem) {
                        var selKostl = oEvent.getParameter('selectedItem').getBindingContext().getObject().Kostl
                        if (selKostl) {
                            if (oThisMetadata.includes('Input')) {
                                this.setValue(selKostl)
                            } else {
                                that.tabItem.getCells()[4].setValue(selKostl)
                            }
                            return
                        }

                        var selAufnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Aufnr
                        if (selAufnr) {
                            if (oThisMetadata.includes('Input')) {
                                this.setValue(selAufnr)
                            } else {
                                that.tabItem.getCells()[3].setValue(selAufnr)
                            }
                            return
                        }
                    }

                    if (that.inputId.includes('formaPag')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Zlsch);
                        that.getView().byId('txtFPgto').setProperty('text', selItem.getBindingContext().getObject().Text1)

                    } else if (that.inputId.includes('empresa')) {

                        var sBukrs = selItem.getBindingContext().getObject().Bukrs
                        var lifnr = that.getView().byId('fornec').getValue()
                        if (!lifnr) {
                            MessageToast.show('Preencher primeiro o fornecedor')
                            return
                        }
                        var oModel = that.getView().getModel()
                        var aFilters = []

                        var oFilterLifBuk = new sap.ui.model.Filter("Lifnr",
                            sap.ui.model.FilterOperator.EQ,
                            lifnr);
                        aFilters.push(oFilterLifBuk)

                        var oFilterLifBuk = new sap.ui.model.Filter("Bukrs",
                            sap.ui.model.FilterOperator.EQ,
                            sBukrs);
                        aFilters.push(oFilterLifBuk)

                        oModel.read('/sh_lifnrSet', {
                            filters: aFilters,
                            success: function (odata, response) {
                                debugger

                                if (!odata.results[0].Bukrs) {
                                    this.byId(this.inputId).setValue();
                                    this.getView().byId('txtBukrs').setProperty('text', '')
                                    MessageToast.show(`Fornecedor não pertence à empresa ${odata.results[0].Bukrs}`)
                                    return
                                }

                                this.byId(this.inputId).setValue(selItem.getBindingContext().getObject().Bukrs);
                                this.getView().byId('txtBukrs').setProperty('text', selItem.getBindingContext().getObject().Butxt)
                            }.bind(that),
                            error: function (response) {
                                debugger
                            }
                        })

                    } else if (that.inputId.includes('condPgto')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Zterm);
                        that.getView().byId('txtZterm').setProperty('text', selItem.getBindingContext().getObject().Text1)

                        // var zdart = selItem.getBindingContext().getObject().Zdart

                        //  if(zdart=='B' || zdart=='b'){
                        //     that.getView().byId('dtBase').setValue(that.getView().byId('dtDoc').getValue())
                        // }else if(zdart=='D' || zdart=='d'){
                        //     that.getView().byId('dtBase').setValue(that.getView().byId('dtLanc').getValue())
                        // }else if(zdart=='C' || zdart=='c'){
                        //     var today = new Date();
                        //     var dd = String(today.getDate()).padStart(2, '0');
                        //     var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                        //     var yyyy = today.getFullYear();
                        //     today = mm + '/' + dd + '/' + yyyy;
                        //     that.getView().byId('dtBase').setValue(today)
                        // }else{
                        //     that.getView().byId('dtBase').setValue('')
                        // }

                    } else if (that.inputId.includes('codAprov')) {
                        that.byId(that.inputId).setValue(selItem.getBindingContext().getObject().Gsber);
                    }
                }
                // this.oDialog.destroy();
            },

            handleTableValueHelpSearch: function (oEvent) {
                var oSource = oEvent.getSource() // pega o searchField
                var oParameters = oEvent.getParameters()
                var sTerm = oParameters.value //termo de busca
                var sPath = oEvent.getParameters().itemsBinding.sPath
                var oThisMetadata = this.getMetadata().getName()
                debugger
                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");

                if (sPath.includes('aufnr')) {
                    var sTerm = "Aufnr"
                    var Stxt = "Ktext"
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

                    // }else if(sPath.includes('kostl')){
                } else if (sPath.includes('CentroCusto')) {

                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////&nb+

                    //    var path = "/sh_kostlSet";
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
                    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                } else {

                    if (that.inputId.includes('formaPag')) {
                        var sTerm = "Zlsch"
                        var Stxt = "Text1"
                        var path = "/sh_zlschSet";
                    } else if (that.inputId.includes('condPgto')) {
                        var sTerm = "Zterm"
                        var Stxt = "Text1"
                        var path = "/SH_ZTERMSet";
                    } else if (that.inputId.includes('empresa')) {
                        var sTerm = "Bukrs"
                        var Stxt = "Butxt"
                        var path = "/sh_bukrsSet";
                    } else if (that.inputId.includes('codAprov')) {
                        var sTerm = "Gsber"
                        var Stxt = "Gtext"
                        var path = "/sh_pargbSet";
                    }

                    var oTableStdListTemplate = new sap.m.StandardListItem({
                        title: "{" + sTerm + "}",
                        description: "{" + Stxt + "}"
                    });// //create a filter for the binding

                    var oFilterTableNo = new sap.ui.model.Filter(sTerm,
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oFilterTableNo2 = new sap.ui.model.Filter(Stxt,
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    if (sPath.includes('kostl')) {
                        that.oDialog.unbindAggregation("items");
                        that.oDialog.bindAggregation("items", {
                            path: path,
                            template: oTableStdListTemplate,
                            filters: aFilterKostl
                        })

                    } else {
                        that.oDialog.unbindAggregation("items");
                        that.oDialog.bindAggregation("items", {
                            path: path,
                            template: oTableStdListTemplate,
                            filters: [oFilterTableNo, oFilterTableNo2]
                        })
                    }
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

                if (!that.getView().byId('fornec').getValue()) {
                    sap.m.MessageToast.show("Informar primeiro o fornecedor")
                    oEvent.getSource().setProperty('visible', false)
                    return
                }

                that.selItem = oEvent.getSource().getParent()
                that.tabItem = oEvent.getSource().getParent()
                that.inputId = oEvent.getSource().getId();

                var sName = "queroquerons.conslandespesas.view.ValuesHelpCContab"

                var oFilterTableNo;
                var oButton = oEvent.getSource()

                var aFilters = []
                var aSaknrFilters = []
                var oFilter = new sap.ui.model.Filter("Zpfpj",
                    sap.ui.model.FilterOperator.EQ,
                    that.Zpfpj);

                aFilters.push(oFilter)
                var oFilter = new sap.ui.model.Filter("Tipounid",
                    sap.ui.model.FilterOperator.EQ,
                    that.tipoUnidade);
                aFilters.push(oFilter)
                // var oDataModel = that.getView().getModel()
                // oDataModel.read('/PF_PJ_OrdemSet', {
                //     filters: aFilters,
                //     success: function (odata, response) {
                //         debugger

                //         odata.results.forEach(function (conta) {

                //             if (conta.Hkont) {
                //                 oFilterTableNo = new sap.ui.model.Filter("Saknr",
                //                     sap.ui.model.FilterOperator.EQ,
                //                     conta.Hkont);
                //                 aSaknrFilters.push(oFilterTableNo)

                //             }
                //         })

                if (!that.byId('fornec').getValue()) {
                    aSaknrFilters = []
                }

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

                    var Itm = new ColumnListItem({
                        cells:
                            [
                                new sap.m.Text({ text: '{Saknr}' }),
                                new sap.m.Text({ text: "{Txt50}" }),
                                new sap.m.Text({ text: '{Aufnr}' }),
                                new sap.m.Text({ text: '{Kagru}' }),
                            ]
                    });

                    oDialog.bindItems({
                        path: '/sh_ccSet',
                        template: Itm,
                        filters: aFilters //aSaknrFilters
                    })

                    oDialog.open();
                });





                //     }.bind(this),
                //     error: function (error) {
                //         debugger
                //     }.bind(this)

                // })


                // path = "/sh_ccSet";

                // oFilterTableNo = new sap.ui.model.Filter("Saknr",
                //  sap.ui.model.FilterOperator.EQ,
                //  "0000000003");


            },

            onConfirm: function (oEvent) {

                if (this.inputId.includes('fornec')) {
                    var fornecedor = this.byId('fornec')
                    var selLifnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Lifnr
                    fornecedor.setValue(selLifnr)
                    this.byId('txtLifnr').setProperty('text', oEvent.getParameter('selectedItem').getBindingContext().getObject().Name1)
                    this.Zpfpj = oEvent.getParameter('selectedItem').getBindingContext().getObject().ZPFPJ

                    var nfTable = this.getView().byId('reqTable')
                    nfTable.getItems().forEach(function (item) {
                        item.getCells()[1].setProperty('editable', true)
                        item.getCells()[1].setValue('')
                    })

                } else {
                    var conta = this.selItem.getCells()[1]
                    var ordem = this.selItem.getCells()[3]
                    var grpConta = this.selItem.getCells()[8]
                    var selSaknr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Saknr
                    var selAufnr = oEvent.getParameter('selectedItem').getBindingContext().getObject().Aufnr
                    var selKagru = oEvent.getParameter('selectedItem').getBindingContext().getObject().Kagru

                    if (selSaknr) {
                        conta.setValue(selSaknr)
                    }

                    if (selAufnr) {
                        ordem.setValue(selAufnr)
                    }

                    if (selKagru) {
                        grpConta.setValue(selKagru)
                    }else{
                        grpConta.setValue()
                    }
                }

            },

            onLifnrMatchCode: function (oEvent) {

                this.selItem = oEvent.getSource().getParent()
                this.inputId = oEvent.getSource().getId();
                var val = 0
                var sName = "queroquerons.conslandespesas.view.ValuesHelpFornec"

                var path;
                var oTableStdListTemplate;
                var oFilterTableNo;
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
                var oSource = oEvent.getSource() // pega o searchField
                var oParameters = oEvent.getParameters()
                var sTerm = oParameters.value //termo de busca
                var binding = oEvent.getParameter("itemsBinding");
                var value = oEvent.getParameter("value");
                debugger
                var val = 0
                if (this.inputId.includes('fornec')) {
                    var sTerm = "Lifnr"
                    var Stxt = "Name1"
                } else {
                    var sTerm = "Ktopl"
                    var Stxt = "Txt50"
                    var Saknr = "Saknr"
                }

                var aFilters = []

                if (value && Stxt) {
                    var filter = new sap.ui.model.Filter(sTerm, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)

                    var filter = new sap.ui.model.Filter(Stxt, sap.ui.model.FilterOperator.EQ, value);
                    aFilters.push(filter)
                }

                if (Saknr) {

                    ///////////////////////////////
                    // var aFiltersPfPj = []
                    var aSaknrFilters = []
                    // var oFilterPfPj = new sap.ui.model.Filter("Zpfpj",
                    //     sap.ui.model.FilterOperator.EQ,
                    //     this.Zpfpj);

                    // aFiltersPfPj.push(oFilterPfPj)
                    // var oFilterPfPj = new sap.ui.model.Filter("Tipounid",
                    //     sap.ui.model.FilterOperator.EQ,
                    //     this.tipoUnidade);
                    // aFiltersPfPj.push(oFilterPfPj)
                    // var oDataModel = this.getView().getModel()
                    // oDataModel.read('/PF_PJ_OrdemSet', {
                    //     filters: aFiltersPfPj,
                    //     success: function (odata, response) {
                    //         debugger

                    // var filter = new sap.ui.model.Filter('Txt50',  sap.ui.model.FilterOperator.EQ, value);
                    // aSaknrFilters.push(filter)

                    // var filter = new sap.ui.model.Filter('Ktopl',  sap.ui.model.FilterOperator.EQ, value);
                    // aSaknrFilters.push(filter)

                    // odata.results.forEach(function (conta) {

                    //     if (conta.Hkont) {

                    //         // if(conta.Hkont==value){
                    //         var filter = new sap.ui.model.Filter(Saknr, sap.ui.model.FilterOperator.EQ, conta.Hkont);
                    //         aSaknrFilters.push(filter)
                    //         // var filter = new sap.ui.model.Filter(Saknr,  sap.ui.model.FilterOperator.EQ, value);
                    //         // aSaknrFilters.push(filter)
                    //         // }
                    //     }
                    // })

                    // var validSaknr = odata.results.filter(function(conta){
                    //     return conta.Hkont==value
                    // })

                    // if (!validSaknr.length > 0){
                    //     var filter = new sap.ui.model.Filter(Saknr,  sap.ui.model.FilterOperator.EQ, 'XXXX');
                    //     aSaknrFilters.push(filter)
                    // }else{
                    //     var filter = new sap.ui.model.Filter(Saknr,  sap.ui.model.FilterOperator.EQ, value);
                    //     aSaknrFilters.push(filter)
                    // }

                    if (value) {
                        var filter = new sap.ui.model.Filter('Zpfpj', sap.ui.model.FilterOperator.EQ, this.Zpfpj);
                        aSaknrFilters.push(filter)
                        var filter = new sap.ui.model.Filter('Tipounid', sap.ui.model.FilterOperator.EQ, this.tipoUnidade);
                        aSaknrFilters.push(filter)
                        var filter = new sap.ui.model.Filter('Txt50', sap.ui.model.FilterOperator.EQ, value);
                        aSaknrFilters.push(filter)
                    } else {
                        aSaknrFilters = []
                        var filter = new sap.ui.model.Filter('Zpfpj', sap.ui.model.FilterOperator.EQ, this.Zpfpj);
                        aSaknrFilters.push(filter)
                        var filter = new sap.ui.model.Filter('Tipounid', sap.ui.model.FilterOperator.EQ, this.tipoUnidade);
                        aSaknrFilters.push(filter)
                    }

                    // binding.filter([])
                    // binding.filters([])
                    binding.aApplicationFilters = aSaknrFilters
                    binding.aFilters = aSaknrFilters
                    binding.filter();
                    // binding.filter(aSaknrFilters);

                    val = 1
                    return

                    //     }.bind(this),
                    //     error: function (error) {
                    //         debugger
                    //     }.bind(this)

                    // })
                    ///////////////////////////////
                }

                if (this.inputId.includes('fornec')) {
                    binding.filter(aFilters);
                }

            },

            updFornecedor: function (value) {
                // var value = oEvent.getSource().getValue()
                if (!value) {
                    this.getView().byId('txtLifnr').setProperty('text', '')
                } else {
                    var oFilter = new sap.ui.model.Filter("Lifnr",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    var oModel = this.getView().getModel()
                    var url = "/sh_lifnrSet"
                    oModel.read(url, {
                        filters: [oFilter],
                        success: function (odata, response) {
                            debugger

                            this.Zpfpj = odata.results[0].ZPFPJ
                            if (odata.results.length > 0) {
                                this.getView().byId('txtLifnr').setProperty('text', odata.results[0].Name1)
                            } else {
                                this.getView().byId('txtLifnr').setProperty("text", "")
                            }
                        }.bind(this),
                        error: function (error) {
                            debugger
                            this.getView().byId('txtLifnr').setProperty("text", "")
                        }.bind(this)
                    })

                }

                var nfTable = this.getView().byId('reqTable')
                if (value) {
                    nfTable.getItems().forEach(function (item) {
                        //     item.getCells()[1].setValue(' ')
                        item.getCells()[1].setProperty('editable', true)
                        //     item.getCells()[3].setValue(' ')
                    })
                } else {
                    nfTable.getItems().forEach(function (item) {
                        item.getCells()[1].setValue(' ')
                        item.getCells()[1].setProperty('editable', false)
                        item.getCells()[3].setValue(' ')
                    })
                }

            },

            updFPgto: function (value) {
                // var value = oEvent.getSource().getValue()

                value = value.toUpperCase()
                if (!value) {
                    this.getView().byId('txtFPgto').setProperty('text', '')
                } else {

                    let ODataModel = this.getView().getModel()
                    var oFilterTableNo = new sap.ui.model.Filter("Zlsch",
                        sap.ui.model.FilterOperator.EQ,
                        value);

                    ODataModel.read("/sh_zlschSet", {
                        filters: [oFilterTableNo],
                        success: function (data, response) {
                            if (data.results.length > 0) {
                                this.getView().byId('txtFPgto').setProperty("text", data.results[0].Text1)
                            } else {
                                this.getView().byId('txtFPgto').setProperty("text", "")
                            }

                        }.bind(this),
                        error: function (oError) {
                            debugger
                            this.getView().byId('txtFPgto').setProperty("text", "")
                        }.bind(this)
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
                            if (data.results.length > 0) {
                                this.getView().byId('txtCodAprov').setProperty("text", data.results[0].Gtext)
                            } else {
                                this.getView().byId('txtCodAprov').setProperty("text", "")
                            }
                        }.bind(this),
                        error: function (oError) {
                            debugger
                            this.getView().byId('txtCodAprov').setProperty("text", "")
                        }.bind(this)
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
                            if (odata.results.length > 0) {
                                this.getView().byId('txtBukrs').setProperty('text', odata.results[0].Butxt)
                            } else {
                                this.getView().byId('txtBukrs').setProperty("text", "")
                            }
                        }.bind(this),

                        error: function (response) {
                            debugger
                        }
                    })
                }
            },
            updZterm: function (value) {
                // var value = oEvent.getSource().getValue()
                if (!value) {
                    this.getView().byId('txtZterm').setProperty('text', '')
                } else {

                    var ztermFilter = new sap.ui.model.Filter("Zterm",
                    sap.ui.model.FilterOperator.EQ,
                    value);

                    var oModel = this.getView().getModel()
                    oModel.read("/SH_ZTERMSet", {
                        filters: [ztermFilter],
                        success: function(odata, response){
                            if(odata.results.length > 0){
                                this.getView().byId('txtZterm').setProperty('text', odata.results[0].Text1)

                            // var zdart = odata.results[0].Zdart

                            //  if(zdart=='B' || zdart=='b'){
                            //     this.getView().byId('dtBase').setValue(this.getView().byId('dtDoc').getValue())
                            // }else if(zdart=='D' || zdart=='d'){
                            //     this.getView().byId('dtBase').setValue(this.getView().byId('dtLanc').getValue())
                            // }else if(zdart=='C' || zdart=='c'){
                            //     var today = new Date();
                            //     var dd = String(today.getDate()).padStart(2, '0');
                            //     var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                            //     var yyyy = today.getFullYear();
                            //     today = mm + '/' + dd + '/' + yyyy;
                            //     this.getView().byId('dtBase').setValue(today)
                            // }else{
                            //     this.getView().byId('dtBase').setValue('')
                            // }

                        }else{
                            this.getView().byId('txtZterm').setProperty("text","")
                        }

                        }.bind(this),

                        error: function(response){
                    this.getView().byId('txtZterm').setProperty("text", "")
                            debugger
                        }
                    })
                }
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

                    // path = "/sh_kostlSet";
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

                    that.oDialog.open();
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

                    that.oDialog.open();
                }
            },

            getOrcamento: function (item) {
                var thisName = this.getMetadata().getName()
                if (thisName.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }

                var Ccontab = item.getCells()[1].getValue()
                var Aufnr = item.getCells()[3].getValue()
                var Kostl = item.getCells()[4].getValue()
                var Kgrup = item.getCells()[8].getValue()
                var dtLanc = that.getView().byId("dtLanc").getValue()
                debugger

                Aufnr = Aufnr == ' ' ? '' : Aufnr 

                var dtLanc = dtLanc.replace(".", "")
                var dtLanc = dtLanc.replace(".", "")
                var dtLanc = dtLanc.replaceAll("/", "")

                if (!Ccontab) {
                    return
                }

                if (!Aufnr && !Kostl) {
                    sap.m.MessageToast.show('Informar Ordem ou Centro de Custo para determinar orçamento')
                    return
                }

                var oModel = that.getView().getModel()
                oModel.setHeaders({ "X-Requested-With": "X" })

                item.getCells()[6].setBusy(true)
                item.getCells()[7].setBusy(true)

                if (Aufnr) {
                    var entity = "/ZFM_CONSULTA_ORCAMENTO1Set(ICentro='',IConta='" + Ccontab + "',IData='',IOrdem='" + Aufnr + "',IGrpConta='" + Kgrup + "')";
                } else if (Kostl) {
                    if (!dtLanc) {
                        sap.m.MessageToast.show('Informar a data de lançamento para determinar o orçamento.')
                        return
                    }

                    var entity = "/ZFM_CONSULTA_ORCAMENTO1Set(ICentro='" + Kostl + "',IConta='" + Ccontab + "',IData='" + dtLanc + "',IOrdem='',IGrpConta='" + Kgrup + "')";
                }

                oModel.read(entity, {
                    success: function (oData, oResponse) {
                        debugger
                        // LEMBRETE: Campo EOrçamento, na tela é Disponível
                        //           Campo EDisponível, na tela é Utilizado.

                        if (oData.EOrcamento.includes(',') || oData.EDisponivel.includes(',')) {
                            oData.EOrcamento = oData.EOrcamento.replaceAll('.', '').replace(',', '.')
                            oData.EDisponivel = oData.EDisponivel.replaceAll('.', '').replace(',', '.')
                        }

                        var disponivel = oData.EDisponivel
                        var utilizado = oData.EOrcamento - oData.EDisponivel

                        disponivel = Intl.NumberFormat('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(disponivel).replace("R$", "").replace("\u00A0", "");
                        utilizado = Intl.NumberFormat('pt-br', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(utilizado).replace("R$", "").replace("\u00A0", "");

                        item.getCells()[6].setBusy(false)
                        item.getCells()[7].setBusy(false)

                        item.getCells()[6].setValue(disponivel);
                        item.getCells()[7].setValue(utilizado);

                        if (!oData.EOrcamento) {
                            sap.m.MessageToast.show("Sem orçamento disponível para esta conta. Verificar dados informados.")
                        }

                    }.bind(this),
                    error: function (oError) {
                        item.getCells()[6].setBusy(false)
                        item.getCells()[7].setBusy(false)

                        item.getCells()[6].setValue()
                        item.getCells()[7].setValue()

                        sap.m.MessageToast.show("Não foi possível determinar orçamento com os dados informados.");
                    }
                });

            },

            onChange: function (oEvent) {
                debugger
                var that = this;
                var reader = new FileReader();
                var file = oEvent.getParameter("files")[0];

                reader.onload = function (e) {
                    var raw = e.target.result;
                    sap.m.MessageToast.show("binary string: " + raw);
                };

                reader.onerror = function (e) {
                    sap.m.MessageToast.show("error");
                };
                reader.readAsArrayBuffer(file);
            },

            /// VERIFICAR A PARTIR DAQUI SOBRE AS FUNÇÕES DE ANEXO

            onUploadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");

                debugger
                oUploadSet._getAllItems().forEach(function (item) {
                    oUploadSet.uploadItem(item);
                })

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oUploadSet.uploadItem(oItem);
                    }
                });
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

            changeDtLanc: function (oEvent) {

                if (this.getView().byId('dtLanc').getValue()
                    && this.getView().byId('dtDoc').getValue()) {
                    this.getView().byId('condPgto').setProperty('editable', true)
                } else {
                    // this.getView().byId('condPgto').setProperty('editable', false)
                }
            },

            onSubmit: function () {

                var oThisMetadata = this.getMetadata().getName()

                if (oThisMetadata.includes('Input')) {
                    var that = this.getParent().getParent().getParent().getParent().getParent().getParent().getController()
                } else {
                    var that = this
                }
                var oView = that.getView()

                var fornec = oView.byId("fornec").getValue()
                // var  nf       =  oView.byId("nf").getValue()
                // var  dtDoc    =  oView.byId("dtDoc").getValue()
                var formaPag = oView.byId("formaPag").getValue()
                var dtLanc = oView.byId("dtLanc").getValue()
                var dtBase = oView.byId("dtBase").getValue()
                var condPgto = oView.byId("condPgto").getValue()
                var empresa = oView.byId("empresa").getValue()
                var codAprov = oView.byId("codAprov").getValue()
                // var  totNf    =  oView.byId("totNf").getValue()
                // var  vTotal   =  oView.byId("vTotal").getValue()
                // var  difLanc  =  oView.byId("difLanc").getValue()
                var empresa = oView.byId("empresa").getValue()

                that.updFornecedor(fornec)
                that.updFPgto(formaPag)
                that.updZterm(condPgto)
                that.updBukrs(empresa)
                that.updCodAprov(codAprov)
                that.calculaTotais()
                that.changeDtLanc()

                var table = that.getView().byId('reqTable')
                table.getItems().forEach(function (item) {
                    if (item.getCells()[1].getValue() != false) {
                        if (item.getCells()[3].getValue() != false || item.getCells()[4].getValue() != false) {
                            that.getOrcamento(item)
                        } else {
                            MessageToast.show(`Preencher Ordem ou Centro de Custo para determinar orçamento do item ${item.getCells()[0].getValue()}`)
                        }
                    }
                })
            },

            chamaVariante: function(){

                var oView = this.getView()

                oView.byId("fornec").setValue('0000006020')
                oView.byId("nf").setValue('1234')
                oView.byId("dtDoc").setValue( oView.byId("dtLanc").getValue() )
                oView.byId("formaPag").setValue('T')
                // oView.byId("dtBase").setValue()
                // oView.byId("condPgto").setValue('0015')
                oView.byId("empresa").setValue('0011')
                oView.byId("txtCab").setValue('TESTE')
                // oView.byId("codAprov").setValue()
                oView.byId("totNf").setValue('10,00')
                oView.byId("vTotal").setValue('10,00')
                oView.byId("difLanc").setValue('0,00')
                oView.byId("txtZterm").setProperty('text', '15 Dias')

                var table = this.getView().byId("reqTable");
                var selItems = table.getItems()

                selItems[0].getCells()[1].setValue('4201070015')
                selItems[0].getCells()[2].setValue('ITEM TESTE')
                selItems[0].getCells()[4].setValue('1100481301')
                selItems[0].getCells()[5].setValue('10,00')

                this.onSubmit()

            }
        

        });
    })