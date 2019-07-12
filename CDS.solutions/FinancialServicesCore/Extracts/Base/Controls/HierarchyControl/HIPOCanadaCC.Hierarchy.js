'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/// <reference path="../../typing/ControlFramework.d.ts"/>
var HIPOCanadaCC;
(function (HIPOCanadaCC) {
    var Xrm;
    Xrm = window["Xrm"];
    var Common = /** @class */ (function () {
        function Common() {
            this.getLink = function (id, entityTypeName, context) {
                var url = context.page.getClientUrl();
                url = url + "/main.aspx?appid=" + context.page.appId + "&pagetype=entityrecord&etn=" + entityTypeName + "&id=" + id;
                return url;
            };
        }
        Object.defineProperty(Common, "Instance", {
            get: function () {
                // Do you need arguments? Make it a regular method instead.
                return this._instance || (this._instance = new this());
            },
            enumerable: true,
            configurable: true
        });
        Common.log = function (obj) {
            console.log('***************************');
            console.log(obj);
        };
        return Common;
    }());
    var HierarchyControlModes;
    (function (HierarchyControlModes) {
        HierarchyControlModes[HierarchyControlModes["Standard"] = 0] = "Standard";
        HierarchyControlModes[HierarchyControlModes["Household"] = 1] = "Household";
    })(HierarchyControlModes || (HierarchyControlModes = {}));
    var HierarchyControl = /** @class */ (function () {
        function HierarchyControl() {
            this.HierarchyElements = [];
        }
        /**
         * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
         * Data-set values are not initialized here, use updateView.
         * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
         * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
         * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
         * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
         */
        HierarchyControl.prototype.init = function (context, notifyOutputChanged, state, container) {
            var _this = this;
            Common.log('Hierarchy init');
            this.Context = context;
            this.NotifyOutputChanged = notifyOutputChanged;
            this.Container = container;
            this.EntityName = this.Context.page.entityTypeName;
            this.EntityId = this.Context.page.entityId;
            this.Mode = (context.parameters.Mode.raw.toLowerCase() == "standard") ? HierarchyControlModes.Standard : HierarchyControlModes.Household;
            this.DefaultImage = context.parameters.DefaultImage.raw;
            console.log("this.Mode: " + this.Mode);
            var hierarchyLoader = (this.Mode == HierarchyControlModes.Standard) ? new StandardHierarchyDataLoader() : new HouseholdHierarchyDataLoader();
            hierarchyLoader.init(this);
            var here = this;
            hierarchyLoader.load()
                .then(function (hierarchyElements) {
                here.HierarchyElements = hierarchyElements;
                _this.render();
            });
        };
        /**
         * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
         * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
         */
        HierarchyControl.prototype.updateView = function (context) {
            Common.log('Hierarchy updateView');
        };
        /**
         * It is called by the framework prior to a control receiving new data.
         * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
         */
        HierarchyControl.prototype.getOutputs = function () {
            return null;
        };
        /**
         * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
         * i.e. cancelling any pending remote calls, removing listeners, etc.
         */
        HierarchyControl.prototype.destroy = function () {
            //
        };
        HierarchyControl.prototype.render = function () {
            this.HierarchyElements.sort(function (he1, he2) {
                return ('' + he1.Line1).localeCompare(he2.Line1);
            });
            this.renderNodeStructure(0, null, this.Container);
        };
        HierarchyControl.prototype.renderNodeStructure = function (level, parentId, container) {
            if (level > 15) {
                return;
            }
            var childNodes = this.HierarchyElements.filter(function (o) {
                return o.HierarchyParentEntityId == parentId;
            });
            if (childNodes.length == 0) {
                return;
            }
            var ul = (document.createElement('ul'));
            container.appendChild(ul);
            for (var index = 0; index < childNodes.length; index++) {
                var he = childNodes[index];
                var li = (document.createElement('li'));
                ul.appendChild(li);
                HIPOCanadaCC.HierarchyControl.renderNodeTile(li, he.EntityId == this.EntityId, he);
                this.renderNodeStructure((level + 1), he.HierarchyEntityId, li);
            }
        };
        HierarchyControl.renderNodeTile = function (container, current, node) {
            var imgHTML = "";
            if (!(node.ImgUrl === undefined || node.ImgUrl === null || node.ImgUrl === "")) {
                imgHTML = "<a href=\"" + node.Url + "\"><img src=\"" + node.ImgUrl + "\"  alt=\"\"/></a>";
            }
            else {
                var name_1 = node.Line1.split(" ");
                var initials = name_1[0].charAt(0) + name_1[name_1.length - 1].charAt(0);
                imgHTML = "<div class=\"initials\">" + initials + "</div>";
            }
            var line1HTML = (node.Line1 == undefined || node.Line1 == "") ?
                "" : "<div class=\"line1\">" + (node.Url == undefined ? "" : "<a class=\"FamilyLink\" href=\"" + node.Url + "\">") +
                node.Line1 + (node.Url == undefined ? "" : "</a>") + "</div>";
            var line2HTML = (node.Line2 == undefined || node.Line2 == "") ?
                "" : "<div class=\"line2\">" + node.Line2 + "</div>";
            var line3HTML = (node.Line3 == undefined || node.Line3 == "") ?
                "" : "<div class=\"line3\">" + node.Line3 + "</div>";
            if (line2HTML === "" && line3HTML === "") {
                container.innerHTML = "\n\t\t\t\t\t<div class=\"tile" + (current ? " current" : "") + "\">\n\t\t\t\t\t\t" + imgHTML + "\n\t\t\t\t\t\t<div class=\"record\">" + line1HTML + line2HTML + line3HTML + "</div>\n\t\t\t\t\t</div>";
            }
            else {
                container.innerHTML = "\n\t\t\t\t\t<div class=\"tile" + (current ? " current" : "") + "\">\n\t\t\t\t\t\t" + imgHTML + "\n\t\t\t\t\t\t<div>" + line1HTML + line2HTML + line3HTML + "</div>\n\t\t\t\t\t</div>";
            }
        };
        return HierarchyControl;
    }());
    HIPOCanadaCC.HierarchyControl = HierarchyControl;
    var StandardHierarchyDataLoader = /** @class */ (function () {
        function StandardHierarchyDataLoader() {
            this.HierarchyElements = [];
        }
        StandardHierarchyDataLoader.prototype.init = function (hierarchyControl) {
            this.HierarchyControl = hierarchyControl;
        };
        StandardHierarchyDataLoader.prototype.load = function () {
            var here = this;
            return this.loadDataArr([here.HierarchyControl.EntityId])
                .then(function () {
                return here.HierarchyElements;
            });
        };
        StandardHierarchyDataLoader.prototype.loadDataArr = function (entityIds) {
            if (entityIds.length === 0) {
                return;
            }
            var here = this;
            var f = function (index) {
                return here.loadData(entityIds[index])
                    .then(function () {
                    if (index + 1 < entityIds.length) {
                        return f(++index);
                    }
                    else {
                        return;
                    }
                });
            };
            return f(0);
        };
        StandardHierarchyDataLoader.prototype.loadData = function (entityId) {
            if (entityId === undefined || entityId === null || this.isProcessed(entityId)) {
                return null;
            }
            var here = this;
            var hierarchyElement;
            return this.HierarchyControl.Context.webAPI.retrieveRecord(here.HierarchyControl.EntityName, entityId)
                .then(function (result) {
                hierarchyElement = here.parseJSONResponse(result);
                here.HierarchyElements.push(hierarchyElement);
                if (hierarchyElement.HierarchyParentEntityId && !here.isProcessed(hierarchyElement.HierarchyParentEntityId)) {
                    return here.loadData(hierarchyElement.HierarchyParentEntityId);
                }
            })
                .then(function () {
                var query = "?$select=entityimage_url," + here.HierarchyControl.Context.parameters.EntityIdPropertyName.raw
                    + "&$filter=" + here.HierarchyControl.Context.parameters.ParentEntityIdPropertyName.raw + " eq " + hierarchyElement.EntityId;
                return here.HierarchyControl.Context.webAPI.retrieveMultipleRecords(here.HierarchyControl.EntityName, query);
            })
                .then(function (result) {
                var ids = [];
                for (var i = 0; i < result.entities.length; i++) {
                    var ent = result.entities[i];
                    var id = ent[here.HierarchyControl.Context.parameters.EntityIdPropertyName.raw];
                    if (here.isProcessed(id)) {
                        continue;
                    }
                    ids.push(id);
                }
                if (ids.length > 0) {
                    return here.loadDataArr(ids);
                }
            });
        };
        StandardHierarchyDataLoader.prototype.parseJSONResponse = function (obj) {
            var node = new HierarchyNode();
            node.EntityId = obj[this.HierarchyControl.Context.parameters.EntityIdPropertyName.raw];
            node.HierarchyParentEntityId = obj[this.HierarchyControl.Context.parameters.ParentEntityIdPropertyName.raw];
            node.HierarchyEntityId = node.EntityId;
            node.Line1 = obj[this.HierarchyControl.Context.parameters.Line1PropertyName.raw];
            node.Line2 = obj[this.HierarchyControl.Context.parameters.Line2PropertyName.raw];
            node.Line3 = obj[this.HierarchyControl.Context.parameters.Line3PropertyName.raw];
            node.ImgUrl = obj.entityimage_url;
            node.Url = Common.Instance.getLink(node.EntityId, this.HierarchyControl.EntityName, this.HierarchyControl.Context);
            if (node.ImgUrl === undefined || node.ImgUrl === null || node.ImgUrl === "") {
                node.ImgUrl = this.HierarchyControl.DefaultImage;
            }
            return node;
        };
        StandardHierarchyDataLoader.prototype.isProcessed = function (id) {
            for (var index = 0; index < this.HierarchyElements.length; index++) {
                var element = this.HierarchyElements[index];
                if (element.EntityId === id) {
                    return true;
                }
            }
            return false;
        };
        return StandardHierarchyDataLoader;
    }());
    var HouseholdHierarchyDataLoader = /** @class */ (function () {
        function HouseholdHierarchyDataLoader() {
            this.HierarchyElements = [];
        }
        HouseholdHierarchyDataLoader.prototype.init = function (hierarchyControl) {
            this.HierarchyControl = hierarchyControl;
        };
        HouseholdHierarchyDataLoader.prototype.load = function () {
            var here = this;
            return here.loadData()
                .then(function () {
                return here.HierarchyElements;
            });
        };
        HouseholdHierarchyDataLoader.prototype.loadData = function () {
            return __awaiter(this, void 0, void 0, function () {
                var here, hierarchyElements, self_node, coveredEntities, results, _i, _a, entity, he;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            here = this;
                            hierarchyElements = [];
                            self_node = new HierarchyNode();
                            self_node.HierarchyEntityId = this.HierarchyControl.EntityId;
                            coveredEntities = [this.HierarchyControl.EntityId];
                            return [4 /*yield*/, here.getFamilyConnections(here.HierarchyControl.EntityId, 0, coveredEntities)];
                        case 1:
                            results = _b.sent();
                            for (_i = 0, _a = results.entities; _i < _a.length; _i++) {
                                entity = _a[_i];
                                he = this.parseJSONResponse(entity);
                                if (self_node.Line1 === undefined) {
                                    self_node.Line1 = entity["from.fullname"];
                                }
                                if (entity._record2roleid_value === ConnectionRole.Parent.toLowerCase() || entity._record1roleid_value === ConnectionRole.Child.toLowerCase()) {
                                    self_node.HierarchyParentEntityId = entity["to.contactid"];
                                    // TODO: Replace placeholder with parent label
                                    he.Line2 = "Parent";
                                }
                                if (entity["from.contactid"] === this.HierarchyControl.EntityId && self_node.ImgUrl === undefined) {
                                    self_node.ImgUrl = entity["from.entityimage"] !== undefined ? "data:image/png;base64," + entity["from.entityimage"] : "";
                                }
                                hierarchyElements.push(he);
                            }
                            hierarchyElements.push(self_node);
                            this.HierarchyElements = hierarchyElements;
                            return [2 /*return*/, 0];
                    }
                });
            });
        };
        HouseholdHierarchyDataLoader.prototype.parseJSONResponse = function (obj) {
            var node = new HierarchyNode();
            if (obj._record2roleid_value === ConnectionRole.Child.toLowerCase()) {
                node.HierarchyParentEntityId = obj["from.contactid"];
            }
            else if (obj._record2roleid_value === ConnectionRole.Parent.toLowerCase()) {
                node.HierarchyParentEntityId = obj["to.contactid"];
            }
            node.HierarchyEntityId = obj._record2id_value;
            node.EntityId = node.HierarchyEntityId;
            node.Line1 = obj["to.fullname"];
            node.Line2 = obj["_record2roleid_value@OData.Community.Display.V1.FormattedValue"] === undefined ?
                "Unspecified" : obj["_record2roleid_value@OData.Community.Display.V1.FormattedValue"];
            node.Line3 = "";
            node.ImgUrl = obj["to.entityimage"] !== undefined ? "data:image/png;base64," + obj["to.entityimage"] : "";
            node.Url = Common.Instance.getLink(node.EntityId, this.HierarchyControl.EntityName, this.HierarchyControl.Context);
            if (node.ImgUrl === undefined || node.ImgUrl === null || node.ImgUrl === "") {
                node.ImgUrl = this.HierarchyControl.DefaultImage;
            }
            if (obj._record2roleid_value === ConnectionRole.Partner.toLowerCase() || obj._record1roleid_value === ConnectionRole.Partner.toLowerCase()) {
                if (obj._record1roleid_value !== undefined) {
                    node.Line2 = obj["_record1roleid_value@OData.Community.Display.V1.FormattedValue"];
                }
                else if (obj._record2roleid_value !== undefined) {
                    node.Line2 = obj["_record2roleid_value@OData.Community.Display.V1.FormattedValue"];
                }
            }
            return node;
        };
        HouseholdHierarchyDataLoader.prototype.getFamilyConnections = function (entityId, depth, coveredEntityIds) {
            return __awaiter(this, void 0, void 0, function () {
                var results, fetchXml, newEntities, _i, _a, entity, additionalResults, _b, _c, ent, error_1;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 8, , 9]);
                            results = { entities: [] };
                            if (!(depth < 2)) return [3 /*break*/, 6];
                            fetchXml = buildXMLQuery(entityId);
                            return [4 /*yield*/, this.HierarchyControl.Context.webAPI.retrieveMultipleRecords("connection", "?fetchXml=" + fetchXml)];
                        case 1:
                            results = _d.sent();
                            newEntities = [];
                            _i = 0, _a = results.entities;
                            _d.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            entity = _a[_i];
                            return [4 /*yield*/, this.getFamilyConnections(entity["to.contactid"], depth + 1, coveredEntityIds)];
                        case 3:
                            additionalResults = _d.sent();
                            if (additionalResults !== undefined) {
                                for (_b = 0, _c = additionalResults.entities; _b < _c.length; _b++) {
                                    ent = _c[_b];
                                    if (coveredEntityIds.indexOf(ent["to.contactid"]) === -1) {
                                        newEntities.push(ent);
                                        coveredEntityIds.push(ent["to.contactid"]);
                                    }
                                }
                            }
                            _d.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            if (newEntities.length > 0) {
                                results.entities = results.entities.concat(newEntities);
                            }
                            return [3 /*break*/, 7];
                        case 6:
                            results = undefined;
                            _d.label = 7;
                        case 7: return [2 /*return*/, results];
                        case 8:
                            error_1 = _d.sent();
                            Common.log(error_1.message);
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        return HouseholdHierarchyDataLoader;
    }());
    var HierarchyNode = /** @class */ (function () {
        function HierarchyNode() {
        }
        return HierarchyNode;
    }());
    var ConnectionRole;
    (function (ConnectionRole) {
        ConnectionRole["Child"] = "DF0BF69F-333C-4E9B-86E7-4FF737BC9343";
        ConnectionRole["Partner"] = "EE375944-5415-437D-9336-7698CF665B26";
        ConnectionRole["Parent"] = "EDA69FC6-0B5F-44FB-B584-7DFEB8A925AF";
    })(ConnectionRole || (ConnectionRole = {}));
    function buildXMLQuery(entityId) {
        // language=XML
        return encodeURIComponent("<fetch version=\"1.0\" output-format=\"xml-platform\" mapping=\"logical\" distinct=\"false\">\n                              <entity name=\"connection\">\n                                <attribute name=\"record2id\" />\n                                <attribute name=\"record2roleid\" />\n                                <attribute name=\"record1id\" />\n                                <attribute name=\"record1roleid\" />\n                                <attribute name=\"description\" />\n                                <attribute name=\"connectionid\" />\n                                <order attribute=\"record2id\" descending=\"false\" />\n                                <filter type=\"and\">\n                                  <condition attribute=\"statecode\" operator=\"eq\" value=\"0\" />\n                                  <condition attribute=\"record1id\" operator=\"eq\" value=\"" + entityId + "\" />\n                                  <filter type=\"or\">\n                                    <condition attribute=\"record1roleid\" operator=\"in\">\n                                      <value uiname=\"Child\" uitype=\"connectionrole\">{" + ConnectionRole.Child + "}</value>\n                                      <value uiname=\"Spouse/Partner\" uitype=\"connectionrole\">{" + ConnectionRole.Partner + "}</value>\n                                      <value uiname=\"Parent\" uitype=\"connectionrole\">{" + ConnectionRole.Parent + "}</value>\n                                    </condition>\n                                    <condition attribute=\"record2roleid\" operator=\"in\">\n                                      <value uiname=\"Child\" uitype=\"connectionrole\">{" + ConnectionRole.Child + "}</value>\n                                      <value uiname=\"Spouse/Partner\" uitype=\"connectionrole\">{" + ConnectionRole.Partner + "}</value>\n                                      <value uiname=\"Parent\" uitype=\"connectionrole\">{" + ConnectionRole.Parent + "}</value>\n                                    </condition>\n                                  </filter>\n                                </filter>\n                                <link-entity name=\"contact\" from=\"contactid\" to=\"record1id\" link-type=\"inner\" alias=\"from\">\n                                  <attribute name=\"fullname\"/>\n                                  <attribute name=\"contactid\" />\n                                  <attribute name=\"entityimage\" />\n                                </link-entity>\n                                <link-entity name=\"contact\" from=\"contactid\" to=\"record2id\" link-type=\"inner\" alias=\"to\">\n                                  <attribute name=\"fullname\"/>\n                                  <attribute name=\"contactid\" />\n                                  <attribute name=\"entityimage\" />\n                                </link-entity>\n                              </entity>\n                            </fetch>");
    }
})(HIPOCanadaCC || (HIPOCanadaCC = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSElQT0NhbmFkYUNDLkhpZXJhcmNoeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Db250cm9scy9ISVBPQ2FuYWRhQ0MuSGllcmFyY2h5L0hJUE9DYW5hZGFDQy5IaWVyYXJjaHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFYiwwREFBMEQ7QUFFMUQsSUFBTyxZQUFZLENBMmZsQjtBQTNmRCxXQUFPLFlBQVk7SUFJbEIsSUFBSSxHQUFRLENBQUM7SUFDYixHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXBCO1FBSUM7WUFhQSxZQUFPLEdBQUcsVUFBVSxFQUFVLEVBQUUsY0FBc0IsRUFBRSxPQUFZO2dCQUNuRSxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUN0QyxHQUFHLEdBQUcsR0FBRyxHQUFHLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLDZCQUE2QixHQUFHLGNBQWMsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUNwSCxPQUFPLEdBQUcsQ0FBQztZQUNaLENBQUMsQ0FBQztRQWhCRixDQUFDO1FBRUQsc0JBQWtCLGtCQUFRO2lCQUExQjtnQkFDQywyREFBMkQ7Z0JBQzNELE9BQU8sSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELENBQUM7OztXQUFBO1FBRU0sVUFBRyxHQUFWLFVBQVcsR0FBUTtZQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBT0YsYUFBQztJQUFELENBQUMsQUF0QkQsSUFzQkM7SUFz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LElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0NBQzNCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7NkJBQ3hEOzs7NEJBR0QsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7Z0NBRXJCLHNCQUFPLE9BQU8sRUFBQzs7OzRCQUVmLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7Ozs7U0FFM0I7UUFDRixtQ0FBQztJQUFELENBQUMsQUFqSEQsSUFpSEM7SUFFRDtRQUFBO1FBVUEsQ0FBQztRQUFELG9CQUFDO0lBQUQsQ0FBQyxBQVZELElBVUM7SUFFRCxJQUFLLGNBSUQ7SUFKSixXQUFLLGNBQWM7UUFDZixnRUFBOEMsQ0FBQTtRQUMzQyxrRUFBZ0QsQ0FBQTtRQUNoRCxpRUFBK0MsQ0FBQTtJQUNuRCxDQUFDLEVBSkMsY0FBYyxLQUFkLGNBQWMsUUFJZjtJQUVKLFNBQVMsYUFBYSxDQUFDLFFBQWdCO1FBQ3RDLGVBQWU7UUFDZixPQUFPLGtCQUFrQixDQUFDLDA0QkFXOEQsUUFBUSw2UEFHWCxjQUFjLENBQUMsS0FBSyxxSEFDWCxjQUFjLENBQUMsT0FBTyw2R0FDOUIsY0FBYyxDQUFDLE1BQU0sMlBBR3RCLGNBQWMsQ0FBQyxLQUFLLHFIQUNYLGNBQWMsQ0FBQyxPQUFPLDZHQUM5QixjQUFjLENBQUMsTUFBTSwyK0JBZXhFLENBQUMsQ0FBQztJQUN0QyxDQUFDO0FBR0YsQ0FBQyxFQTNmTSxZQUFZLEtBQVosWUFBWSxRQTJmbEIiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5nL0NvbnRyb2xGcmFtZXdvcmsuZC50c1wiLz5cclxuXHJcbm1vZHVsZSBISVBPQ2FuYWRhQ0Mge1xyXG5cclxuXHRkZWNsYXJlIHZhciB3aW5kb3c6IGFueTtcclxuXHJcblx0bGV0IFhybTogYW55O1xyXG5cdFhybSA9IHdpbmRvd1tcIlhybVwiXTtcclxuXHJcblx0Y2xhc3MgQ29tbW9uIHtcclxuXHJcblx0XHRwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6IENvbW1vbjtcclxuXHJcblx0XHRwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0fVxyXG5cclxuXHRcdHB1YmxpYyBzdGF0aWMgZ2V0IEluc3RhbmNlKCkge1xyXG5cdFx0XHQvLyBEbyB5b3UgbmVlZCBhcmd1bWVudHM/IE1ha2UgaXQgYSByZWd1bGFyIG1ldGhvZCBpbnN0ZWFkLlxyXG5cdFx0XHRyZXR1cm4gdGhpcy5faW5zdGFuY2UgfHwgKHRoaXMuX2luc3RhbmNlID0gbmV3IHRoaXMoKSk7XHJcblx0XHR9XHJcblxyXG5cdFx0c3RhdGljIGxvZyhvYmo6IGFueSkge1xyXG5cdFx0XHRjb25zb2xlLmxvZygnKioqKioqKioqKioqKioqKioqKioqKioqKioqJyk7XHJcblx0XHRcdGNvbnNvbGUubG9nKG9iaik7XHJcblx0XHR9XHJcblxyXG5cdFx0Z2V0TGluayA9IGZ1bmN0aW9uIChpZDogc3RyaW5nLCBlbnRpdHlUeXBlTmFtZTogc3RyaW5nLCBjb250ZXh0OiBhbnkpIHtcclxuXHRcdFx0bGV0IHVybCA9IGNvbnRleHQucGFnZS5nZXRDbGllbnRVcmwoKTtcclxuXHRcdFx0dXJsID0gdXJsICsgXCIvbWFpbi5hc3B4P2FwcGlkPVwiICsgY29udGV4dC5wYWdlLmFwcElkICsgXCImcGFnZXR5cGU9ZW50aXR5cmVjb3JkJmV0bj1cIiArIGVudGl0eVR5cGVOYW1lICsgXCImaWQ9XCIgKyBpZDtcclxuXHRcdFx0cmV0dXJuIHVybDtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRkZWNsYXJlIG1vZHVsZSBJbnB1dHNPdXRwdXRzIHtcclxuXHRcdGNsYXNzIElucHV0cyB7XHJcblx0XHRcdC8vIEJvdW5kIHByb3BlcnR5IGFuZCBJbnB1dCBwcm9wZXJ0eSBvbiBtYW5pZmVzdFxyXG5cdFx0XHRNb2RlOiBDb250cm9sRnJhbWV3b3JrLlByb3BlcnR5VHlwZXMuU3RyaW5nUHJvcGVydHk7XHJcblx0XHRcdERlZmF1bHRJbWFnZTogQ29udHJvbEZyYW1ld29yay5Qcm9wZXJ0eVR5cGVzLlN0cmluZ1Byb3BlcnR5O1xyXG5cclxuXHRcdFx0RW50aXR5SWRQcm9wZXJ0eU5hbWU6IENvbnRyb2xGcmFtZXdvcmsuUHJvcGVydHlUeXBlcy5TdHJpbmdQcm9wZXJ0eTtcclxuXHRcdFx0UGFyZW50RW50aXR5SWRQcm9wZXJ0eU5hbWU6IENvbnRyb2xGcmFtZXdvcmsuUHJvcGVydHlUeXBlcy5TdHJpbmdQcm9wZXJ0eTtcclxuXHJcblx0XHRcdExpbmUxUHJvcGVydHlOYW1lOiBDb250cm9sRnJhbWV3b3JrLlByb3BlcnR5VHlwZXMuU3RyaW5nUHJvcGVydHk7XHJcblx0XHRcdExpbmUyUHJvcGVydHlOYW1lOiBDb250cm9sRnJhbWV3b3JrLlByb3BlcnR5VHlwZXMuU3RyaW5nUHJvcGVydHk7XHJcblx0XHRcdExpbmUzUHJvcGVydHlOYW1lOiBDb250cm9sRnJhbWV3b3JrLlByb3BlcnR5VHlwZXMuU3RyaW5nUHJvcGVydHk7XHJcblx0XHR9XHJcblxyXG5cdFx0Y2xhc3MgT3V0cHV0cyB7XHJcblx0XHRcdC8vIEJvdW5kIHByb3BlcnR5IGFuZCBPdXRwdXQgcHJvcGVydHkgb24gbWFuaWZlc3RcclxuXHRcdFx0TGlmZVN0YWdlPzogc3RyaW5nO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZW51bSBIaWVyYXJjaHlDb250cm9sTW9kZXMge1xyXG5cdFx0U3RhbmRhcmQsXHJcblx0XHRIb3VzZWhvbGRcclxuXHR9XHJcblxyXG5cdGV4cG9ydCBjbGFzcyBIaWVyYXJjaHlDb250cm9sIGltcGxlbWVudHMgQ29udHJvbEZyYW1ld29yay5TdGFuZGFyZENvbnRyb2w8SW5wdXRzT3V0cHV0cy5JbnB1dHMsIElucHV0c091dHB1dHMuT3V0cHV0cz4ge1xyXG5cdFx0Q29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcclxuXHRcdENvbnRleHQ6IENvbnRyb2xGcmFtZXdvcmsuQ29udGV4dDxJbnB1dHNPdXRwdXRzLklucHV0cz47XHJcblx0XHROb3RpZnlPdXRwdXRDaGFuZ2VkOiAoKSA9PiB2b2lkO1xyXG5cclxuXHRcdE1vZGU6IEhpZXJhcmNoeUNvbnRyb2xNb2RlcztcclxuXHRcdERlZmF1bHRJbWFnZTogc3RyaW5nO1xyXG5cclxuXHRcdEVudGl0eUlkOiBzdHJpbmc7XHJcblx0XHRIaWVyYXJjaHlFbGVtZW50czogQXJyYXk8SGllcmFyY2h5Tm9kZT47XHJcblxyXG5cdFx0RW50aXR5TmFtZTogc3RyaW5nO1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkhpZXJhcmNoeUVsZW1lbnRzID0gW107XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBVc2VkIHRvIGluaXRpYWxpemUgdGhlIGNvbnRyb2wgaW5zdGFuY2UuIENvbnRyb2xzIGNhbiBraWNrIG9mZiByZW1vdGUgc2VydmVyIGNhbGxzIGFuZCBvdGhlciBpbml0aWFsaXphdGlvbiBhY3Rpb25zIGhlcmUuXHJcblx0XHQgKiBEYXRhLXNldCB2YWx1ZXMgYXJlIG5vdCBpbml0aWFsaXplZCBoZXJlLCB1c2UgdXBkYXRlVmlldy5cclxuXHRcdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBlbnRpcmUgcHJvcGVydHkgYmFnIGF2YWlsYWJsZSB0byBjb250cm9sIHZpYSBDb250ZXh0IE9iamVjdDsgSXQgY29udGFpbnMgdmFsdWVzIGFzIHNldCB1cCBieSB0aGUgY3VzdG9taXplciBtYXBwZWQgdG8gcHJvcGVydHkgbmFtZXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QsIGFzIHdlbGwgYXMgdXRpbGl0eSBmdW5jdGlvbnMuXHJcblx0XHQgKiBAcGFyYW0gbm90aWZ5T3V0cHV0Q2hhbmdlZCBBIGNhbGxiYWNrIG1ldGhvZCB0byBhbGVydCB0aGUgZnJhbWV3b3JrIHRoYXQgdGhlIGNvbnRyb2wgaGFzIG5ldyBvdXRwdXRzIHJlYWR5IHRvIGJlIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS5cclxuXHRcdCAqIEBwYXJhbSBzdGF0ZSBBIHBpZWNlIG9mIGRhdGEgdGhhdCBwZXJzaXN0cyBpbiBvbmUgc2Vzc2lvbiBmb3IgYSBzaW5nbGUgdXNlci4gQ2FuIGJlIHNldCBhdCBhbnkgcG9pbnQgaW4gYSBjb250cm9scyBsaWZlIGN5Y2xlIGJ5IGNhbGxpbmcgJ3NldENvbnRyb2xTdGF0ZScgaW4gdGhlIE1vZGUgaW50ZXJmYWNlLlxyXG5cdFx0ICogQHBhcmFtIGNvbnRhaW5lciBJZiBhIGNvbnRyb2wgaXMgbWFya2VkIGNvbnRyb2wtdHlwZT0nc3Rhcm5kYXJkJywgaXQgd2lsbCByZWNlaXZlIGFuIGVtcHR5IGRpdiBlbGVtZW50IHdpdGhpbiB3aGljaCBpdCBjYW4gcmVuZGVyIGl0cyBjb250ZW50LlxyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgaW5pdChjb250ZXh0OiBDb250cm9sRnJhbWV3b3JrLkNvbnRleHQ8SW5wdXRzT3V0cHV0cy5JbnB1dHM+LCBub3RpZnlPdXRwdXRDaGFuZ2VkOiAoKSA9PiB2b2lkLCBzdGF0ZTogQ29udHJvbEZyYW1ld29yay5EaWN0aW9uYXJ5LCBjb250YWluZXI6IEhUTUxEaXZFbGVtZW50KTogdm9pZCB7XHJcblx0XHRcdENvbW1vbi5sb2coJ0hpZXJhcmNoeSBpbml0Jyk7XHJcblx0XHRcdHRoaXMuQ29udGV4dCA9IGNvbnRleHQ7XHJcblx0XHRcdHRoaXMuTm90aWZ5T3V0cHV0Q2hhbmdlZCA9IG5vdGlmeU91dHB1dENoYW5nZWQ7XHJcblx0XHRcdHRoaXMuQ29udGFpbmVyID0gY29udGFpbmVyO1xyXG5cclxuXHRcdFx0dGhpcy5FbnRpdHlOYW1lID0gKDxhbnk+dGhpcy5Db250ZXh0KS5wYWdlLmVudGl0eVR5cGVOYW1lO1xyXG5cdFx0XHR0aGlzLkVudGl0eUlkID0gKDxhbnk+dGhpcy5Db250ZXh0KS5wYWdlLmVudGl0eUlkO1xyXG5cclxuXHRcdFx0dGhpcy5Nb2RlID0gKGNvbnRleHQucGFyYW1ldGVycy5Nb2RlLnJhdy50b0xvd2VyQ2FzZSgpID09IFwic3RhbmRhcmRcIikgPyBIaWVyYXJjaHlDb250cm9sTW9kZXMuU3RhbmRhcmQgOiBIaWVyYXJjaHlDb250cm9sTW9kZXMuSG91c2Vob2xkO1xyXG5cdFx0XHR0aGlzLkRlZmF1bHRJbWFnZSA9IGNvbnRleHQucGFyYW1ldGVycy5EZWZhdWx0SW1hZ2UucmF3O1xyXG5cclxuXHRcdFx0Y29uc29sZS5sb2coYHRoaXMuTW9kZTogJHt0aGlzLk1vZGV9YCk7XHJcblxyXG5cdFx0XHRsZXQgaGllcmFyY2h5TG9hZGVyOiBJSGllcmFyY2h5RGF0YUxvYWRlciA9ICh0aGlzLk1vZGUgPT0gSGllcmFyY2h5Q29udHJvbE1vZGVzLlN0YW5kYXJkKSA/IG5ldyBTdGFuZGFyZEhpZXJhcmNoeURhdGFMb2FkZXIoKSA6IG5ldyBIb3VzZWhvbGRIaWVyYXJjaHlEYXRhTG9hZGVyKCk7XHJcblx0XHRcdGhpZXJhcmNoeUxvYWRlci5pbml0KHRoaXMpO1xyXG5cclxuXHRcdFx0bGV0IGhlcmUgPSB0aGlzO1xyXG5cclxuXHRcdFx0aGllcmFyY2h5TG9hZGVyLmxvYWQoKVxyXG5cdFx0XHRcdC50aGVuKChoaWVyYXJjaHlFbGVtZW50czogQXJyYXk8SGllcmFyY2h5Tm9kZT4pID0+IHtcclxuXHRcdFx0XHRcdGhlcmUuSGllcmFyY2h5RWxlbWVudHMgPSBoaWVyYXJjaHlFbGVtZW50cztcclxuXHRcdFx0XHRcdHRoaXMucmVuZGVyKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDYWxsZWQgd2hlbiBhbnkgdmFsdWUgaW4gdGhlIHByb3BlcnR5IGJhZyBoYXMgY2hhbmdlZC4gVGhpcyBpbmNsdWRlcyBmaWVsZCB2YWx1ZXMsIGRhdGEtc2V0cywgZ2xvYmFsIHZhbHVlcyBzdWNoIGFzIGNvbnRhaW5lciBoZWlnaHQgYW5kIHdpZHRoLCBvZmZsaW5lIHN0YXR1cywgY29udHJvbCBtZXRhZGF0YSB2YWx1ZXMgc3VjaCBhcyBsYWJlbCwgdmlzaWJsZSwgZXRjLlxyXG5cdFx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGVudGlyZSBwcm9wZXJ0eSBiYWcgYXZhaWxhYmxlIHRvIGNvbnRyb2wgdmlhIENvbnRleHQgT2JqZWN0OyBJdCBjb250YWlucyB2YWx1ZXMgYXMgc2V0IHVwIGJ5IHRoZSBjdXN0b21pemVyIG1hcHBlZCB0byBuYW1lcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCwgYXMgd2VsbCBhcyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5cdFx0ICovXHJcblx0XHRwdWJsaWMgdXBkYXRlVmlldyhjb250ZXh0OiBDb250cm9sRnJhbWV3b3JrLkNvbnRleHQ8SW5wdXRzT3V0cHV0cy5JbnB1dHM+KTogdm9pZCB7XHJcblx0XHRcdENvbW1vbi5sb2coJ0hpZXJhcmNoeSB1cGRhdGVWaWV3Jyk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJdCBpcyBjYWxsZWQgYnkgdGhlIGZyYW1ld29yayBwcmlvciB0byBhIGNvbnRyb2wgcmVjZWl2aW5nIG5ldyBkYXRhLlxyXG5cdFx0ICogQHJldHVybnMgYW4gb2JqZWN0IGJhc2VkIG9uIG5vbWVuY2xhdHVyZSBkZWZpbmVkIGluIG1hbmlmZXN0LCBleHBlY3Rpbmcgb2JqZWN0W3NdIGZvciBwcm9wZXJ0eSBtYXJrZWQgYXMg4oCcYm91bmTigJ0gb3Ig4oCcb3V0cHV04oCdXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBnZXRPdXRwdXRzKCk6IElucHV0c091dHB1dHMuT3V0cHV0cyB7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG4gXHRcdCAqIENhbGxlZCB3aGVuIHRoZSBjb250cm9sIGlzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NIHRyZWUuIENvbnRyb2xzIHNob3VsZCB1c2UgdGhpcyBjYWxsIGZvciBjbGVhbnVwLlxyXG5cdFx0ICogaS5lLiBjYW5jZWxsaW5nIGFueSBwZW5kaW5nIHJlbW90ZSBjYWxscywgcmVtb3ZpbmcgbGlzdGVuZXJzLCBldGMuXHJcblx0XHQgKi9cclxuXHRcdHB1YmxpYyBkZXN0cm95KCk6IHZvaWQge1xyXG5cdFx0XHQvL1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlbmRlcigpIHtcclxuXHRcdFx0dGhpcy5IaWVyYXJjaHlFbGVtZW50cy5zb3J0KFxyXG5cdFx0XHRcdChoZTE6IEhpZXJhcmNoeU5vZGUsIGhlMjogSGllcmFyY2h5Tm9kZSkgPT4ge1xyXG5cdFx0XHRcdFx0cmV0dXJuICgnJyArIGhlMS5MaW5lMSkubG9jYWxlQ29tcGFyZShoZTIuTGluZTEpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLnJlbmRlck5vZGVTdHJ1Y3R1cmUoMCwgbnVsbCwgdGhpcy5Db250YWluZXIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJlbmRlck5vZGVTdHJ1Y3R1cmUobGV2ZWw6IG51bWJlciwgcGFyZW50SWQ6IHN0cmluZywgY29udGFpbmVyOiBIVE1MRWxlbWVudCkge1xyXG5cclxuXHRcdFx0aWYgKGxldmVsID4gMTUpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBjaGlsZE5vZGVzOiBBcnJheTxIaWVyYXJjaHlOb2RlPiA9IHRoaXMuSGllcmFyY2h5RWxlbWVudHMuZmlsdGVyKChvOiBIaWVyYXJjaHlOb2RlKSA9PiB7XHJcblx0XHRcdFx0cmV0dXJuIG8uSGllcmFyY2h5UGFyZW50RW50aXR5SWQgPT0gcGFyZW50SWQ7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0aWYgKGNoaWxkTm9kZXMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCB1bCA9IDxIVE1MVUxpc3RFbGVtZW50Pihkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpKTtcclxuXHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHVsKTtcclxuXHJcblx0XHRcdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjaGlsZE5vZGVzLmxlbmd0aDsgaW5kZXgrKykge1xyXG5cdFx0XHRcdGxldCBoZTogSGllcmFyY2h5Tm9kZSA9IGNoaWxkTm9kZXNbaW5kZXhdO1xyXG5cclxuXHRcdFx0XHRsZXQgbGkgPSA8SFRNTExJRWxlbWVudD4oZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKSk7XHJcblx0XHRcdFx0dWwuYXBwZW5kQ2hpbGQobGkpO1xyXG5cclxuXHRcdFx0XHRISVBPQ2FuYWRhQ0MuSGllcmFyY2h5Q29udHJvbC5yZW5kZXJOb2RlVGlsZShsaSwgaGUuRW50aXR5SWQgPT0gdGhpcy5FbnRpdHlJZCwgaGUpO1xyXG5cclxuXHRcdFx0XHR0aGlzLnJlbmRlck5vZGVTdHJ1Y3R1cmUoKGxldmVsICsgMSksIGhlLkhpZXJhcmNoeUVudGl0eUlkLCBsaSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRzdGF0aWMgcmVuZGVyTm9kZVRpbGUoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY3VycmVudDogYm9vbGVhbiwgbm9kZTogSGllcmFyY2h5Tm9kZSkge1xyXG5cclxuXHRcdFx0bGV0IGltZ0hUTUw6IHN0cmluZyA9IFwiXCI7XHJcblx0XHRcdGlmICghKG5vZGUuSW1nVXJsID09PSB1bmRlZmluZWQgfHwgbm9kZS5JbWdVcmwgPT09IG51bGwgfHwgbm9kZS5JbWdVcmwgPT09IFwiXCIpKSB7XHJcblx0XHRcdFx0aW1nSFRNTCA9IGA8YSBocmVmPVwiYCArIG5vZGUuVXJsICsgYFwiPjxpbWcgc3JjPVwiYCArIG5vZGUuSW1nVXJsICsgYFwiICBhbHQ9XCJcIi8+PC9hPmA7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bGV0IG5hbWUgPSBub2RlLkxpbmUxLnNwbGl0KFwiIFwiKTtcclxuXHRcdFx0XHRsZXQgaW5pdGlhbHMgPSBuYW1lWzBdLmNoYXJBdCgwKSArIG5hbWVbbmFtZS5sZW5ndGggLSAxXS5jaGFyQXQoMCk7XHJcblx0XHRcdFx0aW1nSFRNTCA9IGA8ZGl2IGNsYXNzPVwiaW5pdGlhbHNcIj5gICsgaW5pdGlhbHMgKyBgPC9kaXY+YDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IGxpbmUxSFRNTCA9IChub2RlLkxpbmUxID09IHVuZGVmaW5lZCB8fCBub2RlLkxpbmUxID09IFwiXCIpID9cclxuXHRcdFx0XHRcIlwiIDogYDxkaXYgY2xhc3M9XCJsaW5lMVwiPmAgKyAobm9kZS5VcmwgPT0gdW5kZWZpbmVkID8gXCJcIiA6IGA8YSBjbGFzcz1cIkZhbWlseUxpbmtcIiBocmVmPVwiYCArIG5vZGUuVXJsICsgYFwiPmApICtcclxuXHRcdFx0XHRub2RlLkxpbmUxICsgKG5vZGUuVXJsID09IHVuZGVmaW5lZCA/IFwiXCIgOiBgPC9hPmApICsgYDwvZGl2PmA7XHJcblx0XHRcdGxldCBsaW5lMkhUTUwgPSAobm9kZS5MaW5lMiA9PSB1bmRlZmluZWQgfHwgbm9kZS5MaW5lMiA9PSBcIlwiKSA/XHJcblx0XHRcdFx0XCJcIiA6IGA8ZGl2IGNsYXNzPVwibGluZTJcIj5gICsgbm9kZS5MaW5lMiArIGA8L2Rpdj5gO1xyXG5cdFx0XHRsZXQgbGluZTNIVE1MID0gKG5vZGUuTGluZTMgPT0gdW5kZWZpbmVkIHx8IG5vZGUuTGluZTMgPT0gXCJcIikgP1xyXG5cdFx0XHRcdFwiXCIgOiBgPGRpdiBjbGFzcz1cImxpbmUzXCI+YCArIG5vZGUuTGluZTMgKyBgPC9kaXY+YDtcclxuXHJcblx0XHRcdGlmIChsaW5lMkhUTUwgPT09IFwiXCIgJiYgbGluZTNIVE1MID09PSBcIlwiKSB7XHJcblx0XHRcdFx0Y29udGFpbmVyLmlubmVySFRNTCA9IGBcclxuXHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0aWxlYCsgKGN1cnJlbnQgPyBgIGN1cnJlbnRgIDogYGApICsgYFwiPlxyXG5cdFx0XHRcdFx0XHRgKyBpbWdIVE1MICsgYFxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicmVjb3JkXCI+YCsgbGluZTFIVE1MICsgbGluZTJIVE1MICsgbGluZTNIVE1MICsgYDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+YDtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb250YWluZXIuaW5uZXJIVE1MID0gYFxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRpbGVgKyAoY3VycmVudCA/IGAgY3VycmVudGAgOiBgYCkgKyBgXCI+XHJcblx0XHRcdFx0XHRcdGArIGltZ0hUTUwgKyBgXHJcblx0XHRcdFx0XHRcdDxkaXY+YCsgbGluZTFIVE1MICsgbGluZTJIVE1MICsgbGluZTNIVE1MICsgYDwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+YDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdGludGVyZmFjZSBJSGllcmFyY2h5RGF0YUxvYWRlciB7XHJcblx0XHRIaWVyYXJjaHlDb250cm9sOiBIaWVyYXJjaHlDb250cm9sO1xyXG5cclxuXHRcdGluaXQoaGllcmFyY2h5Q29udHJvbDogSGllcmFyY2h5Q29udHJvbCk6IHZvaWQ7XHJcblxyXG5cdFx0bG9hZCgpOiBQcm9taXNlPEFycmF5PEhpZXJhcmNoeU5vZGU+PjtcclxuXHR9XHJcblxyXG5cdGNsYXNzIFN0YW5kYXJkSGllcmFyY2h5RGF0YUxvYWRlciBpbXBsZW1lbnRzIElIaWVyYXJjaHlEYXRhTG9hZGVyIHtcclxuXHRcdEhpZXJhcmNoeUNvbnRyb2w6IEhpZXJhcmNoeUNvbnRyb2w7XHJcblxyXG5cdFx0SGllcmFyY2h5RWxlbWVudHM6IEFycmF5PEhpZXJhcmNoeU5vZGU+O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkhpZXJhcmNoeUVsZW1lbnRzID0gW107XHJcblx0XHR9XHJcblxyXG5cdFx0aW5pdChoaWVyYXJjaHlDb250cm9sOiBIaWVyYXJjaHlDb250cm9sKSB7XHJcblx0XHRcdHRoaXMuSGllcmFyY2h5Q29udHJvbCA9IGhpZXJhcmNoeUNvbnRyb2w7XHJcblx0XHR9XHJcblxyXG5cdFx0bG9hZCgpOiBQcm9taXNlPEFycmF5PEhpZXJhcmNoeU5vZGU+PiB7XHJcblx0XHRcdGxldCBoZXJlID0gdGhpcztcclxuXHRcdFx0cmV0dXJuIHRoaXMubG9hZERhdGFBcnIoW2hlcmUuSGllcmFyY2h5Q29udHJvbC5FbnRpdHlJZF0pXHJcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGhlcmUuSGllcmFyY2h5RWxlbWVudHM7XHJcblx0XHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0bG9hZERhdGFBcnIoZW50aXR5SWRzOiBzdHJpbmdbXSk6IFByb21pc2U8YW55PiB7XHJcblx0XHRcdGlmIChlbnRpdHlJZHMubGVuZ3RoID09PSAwKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgaGVyZSA9IHRoaXM7XHJcblxyXG5cdFx0XHRsZXQgZiA9IChpbmRleDogbnVtYmVyKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuXHJcblx0XHRcdFx0cmV0dXJuIGhlcmUubG9hZERhdGEoZW50aXR5SWRzW2luZGV4XSlcclxuXHRcdFx0XHRcdC50aGVuKFxyXG5cdFx0XHRcdFx0XHQoKSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0aWYgKGluZGV4ICsgMSA8IGVudGl0eUlkcy5sZW5ndGgpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmKCsraW5kZXgpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHRyZXR1cm4gZigwKTtcclxuXHRcdH1cclxuXHJcblx0XHRsb2FkRGF0YShlbnRpdHlJZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuXHRcdFx0aWYgKGVudGl0eUlkID09PSB1bmRlZmluZWQgfHwgZW50aXR5SWQgPT09IG51bGwgfHwgdGhpcy5pc1Byb2Nlc3NlZChlbnRpdHlJZCkpIHtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IGhlcmUgPSB0aGlzO1xyXG5cclxuXHRcdFx0bGV0IGhpZXJhcmNoeUVsZW1lbnQ6IEhpZXJhcmNoeU5vZGU7XHJcblx0XHRcdHJldHVybiB0aGlzLkhpZXJhcmNoeUNvbnRyb2wuQ29udGV4dC53ZWJBUEkucmV0cmlldmVSZWNvcmQoaGVyZS5IaWVyYXJjaHlDb250cm9sLkVudGl0eU5hbWUsIGVudGl0eUlkKVxyXG5cdFx0XHRcdC50aGVuKFxyXG5cdFx0XHRcdFx0KHJlc3VsdDogYW55KSA9PiB7XHJcblx0XHRcdFx0XHRcdGhpZXJhcmNoeUVsZW1lbnQgPSBoZXJlLnBhcnNlSlNPTlJlc3BvbnNlKHJlc3VsdCk7XHJcblx0XHRcdFx0XHRcdGhlcmUuSGllcmFyY2h5RWxlbWVudHMucHVzaChoaWVyYXJjaHlFbGVtZW50KTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChoaWVyYXJjaHlFbGVtZW50LkhpZXJhcmNoeVBhcmVudEVudGl0eUlkICYmICFoZXJlLmlzUHJvY2Vzc2VkKGhpZXJhcmNoeUVsZW1lbnQuSGllcmFyY2h5UGFyZW50RW50aXR5SWQpKSB7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGhlcmUubG9hZERhdGEoaGllcmFyY2h5RWxlbWVudC5IaWVyYXJjaHlQYXJlbnRFbnRpdHlJZCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHQpXHJcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0bGV0IHF1ZXJ5ID0gXCI/JHNlbGVjdD1lbnRpdHlpbWFnZV91cmwsXCIgKyBoZXJlLkhpZXJhcmNoeUNvbnRyb2wuQ29udGV4dC5wYXJhbWV0ZXJzLkVudGl0eUlkUHJvcGVydHlOYW1lLnJhd1xyXG5cdFx0XHRcdFx0XHQrIFwiJiRmaWx0ZXI9XCIgKyBoZXJlLkhpZXJhcmNoeUNvbnRyb2wuQ29udGV4dC5wYXJhbWV0ZXJzLlBhcmVudEVudGl0eUlkUHJvcGVydHlOYW1lLnJhdyArIFwiIGVxIFwiICsgaGllcmFyY2h5RWxlbWVudC5FbnRpdHlJZDtcclxuXHRcdFx0XHRcdHJldHVybiBoZXJlLkhpZXJhcmNoeUNvbnRyb2wuQ29udGV4dC53ZWJBUEkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoaGVyZS5IaWVyYXJjaHlDb250cm9sLkVudGl0eU5hbWUsIHF1ZXJ5KTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC50aGVuKFxyXG5cdFx0XHRcdFx0KHJlc3VsdDogYW55KSA9PiB7XHJcblx0XHRcdFx0XHRcdGxldCBpZHMgPSBbXTtcclxuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHQuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdFx0XHRsZXQgZW50OiBhbnkgPSByZXN1bHQuZW50aXRpZXNbaV07XHJcblx0XHRcdFx0XHRcdFx0bGV0IGlkOiBhbnkgPSBlbnRbaGVyZS5IaWVyYXJjaHlDb250cm9sLkNvbnRleHQucGFyYW1ldGVycy5FbnRpdHlJZFByb3BlcnR5TmFtZS5yYXddO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoaGVyZS5pc1Byb2Nlc3NlZChpZCkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0aWRzLnB1c2goaWQpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGlmIChpZHMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBoZXJlLmxvYWREYXRhQXJyKGlkcyk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlSlNPTlJlc3BvbnNlKG9iajogYW55KTogSGllcmFyY2h5Tm9kZSB7XHJcblx0XHRcdGxldCBub2RlOiBIaWVyYXJjaHlOb2RlID0gbmV3IEhpZXJhcmNoeU5vZGUoKTtcclxuXHRcdFx0bm9kZS5FbnRpdHlJZCA9IG9ialt0aGlzLkhpZXJhcmNoeUNvbnRyb2wuQ29udGV4dC5wYXJhbWV0ZXJzLkVudGl0eUlkUHJvcGVydHlOYW1lLnJhd107XHJcblxyXG5cdFx0XHRub2RlLkhpZXJhcmNoeVBhcmVudEVudGl0eUlkID0gb2JqW3RoaXMuSGllcmFyY2h5Q29udHJvbC5Db250ZXh0LnBhcmFtZXRlcnMuUGFyZW50RW50aXR5SWRQcm9wZXJ0eU5hbWUucmF3XTtcclxuXHRcdFx0bm9kZS5IaWVyYXJjaHlFbnRpdHlJZCA9IG5vZGUuRW50aXR5SWQ7XHJcblxyXG5cdFx0XHRub2RlLkxpbmUxID0gb2JqW3RoaXMuSGllcmFyY2h5Q29udHJvbC5Db250ZXh0LnBhcmFtZXRlcnMuTGluZTFQcm9wZXJ0eU5hbWUucmF3XTtcclxuXHRcdFx0bm9kZS5MaW5lMiA9IG9ialt0aGlzLkhpZXJhcmNoeUNvbnRyb2wuQ29udGV4dC5wYXJhbWV0ZXJzLkxpbmUyUHJvcGVydHlOYW1lLnJhd107XHJcblx0XHRcdG5vZGUuTGluZTMgPSBvYmpbdGhpcy5IaWVyYXJjaHlDb250cm9sLkNvbnRleHQucGFyYW1ldGVycy5MaW5lM1Byb3BlcnR5TmFtZS5yYXddO1xyXG5cdFx0XHRub2RlLkltZ1VybCA9IG9iai5lbnRpdHlpbWFnZV91cmw7XHJcblx0XHRcdG5vZGUuVXJsID0gQ29tbW9uLkluc3RhbmNlLmdldExpbmsobm9kZS5FbnRpdHlJZCwgdGhpcy5IaWVyYXJjaHlDb250cm9sLkVudGl0eU5hbWUsIHRoaXMuSGllcmFyY2h5Q29udHJvbC5Db250ZXh0KTtcclxuXHJcblx0XHRcdGlmIChub2RlLkltZ1VybCA9PT0gdW5kZWZpbmVkIHx8IG5vZGUuSW1nVXJsID09PSBudWxsIHx8IG5vZGUuSW1nVXJsID09PSBcIlwiKSB7XHJcblx0XHRcdFx0bm9kZS5JbWdVcmwgPSB0aGlzLkhpZXJhcmNoeUNvbnRyb2wuRGVmYXVsdEltYWdlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gbm9kZTtcclxuXHRcdH1cclxuXHJcblx0XHRpc1Byb2Nlc3NlZChpZDogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0XHRcdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB0aGlzLkhpZXJhcmNoeUVsZW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xyXG5cdFx0XHRcdGxldCBlbGVtZW50OiBIaWVyYXJjaHlOb2RlID0gdGhpcy5IaWVyYXJjaHlFbGVtZW50c1tpbmRleF07XHJcblx0XHRcdFx0aWYgKGVsZW1lbnQuRW50aXR5SWQgPT09IGlkKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2xhc3MgSG91c2Vob2xkSGllcmFyY2h5RGF0YUxvYWRlciBpbXBsZW1lbnRzIElIaWVyYXJjaHlEYXRhTG9hZGVyIHtcclxuXHRcdEhpZXJhcmNoeUNvbnRyb2w6IEhpZXJhcmNoeUNvbnRyb2w7XHJcblxyXG5cdFx0SGllcmFyY2h5RWxlbWVudHM6IEFycmF5PEhpZXJhcmNoeU5vZGU+O1xyXG5cclxuXHRcdGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0XHR0aGlzLkhpZXJhcmNoeUVsZW1lbnRzID0gW107XHJcblx0XHR9XHJcblxyXG5cdFx0aW5pdChoaWVyYXJjaHlDb250cm9sOiBIaWVyYXJjaHlDb250cm9sKSB7XHJcblx0XHRcdHRoaXMuSGllcmFyY2h5Q29udHJvbCA9IGhpZXJhcmNoeUNvbnRyb2w7XHJcblx0XHR9XHJcblxyXG5cdFx0bG9hZCgpOiBQcm9taXNlPEFycmF5PEhpZXJhcmNoeU5vZGU+PiB7XHJcblx0XHRcdGxldCBoZXJlID0gdGhpcztcclxuXHRcdFx0cmV0dXJuIGhlcmUubG9hZERhdGEoKVxyXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdHJldHVybiBoZXJlLkhpZXJhcmNoeUVsZW1lbnRzO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGFzeW5jIGxvYWREYXRhKCkge1xyXG5cdFx0XHRsZXQgaGVyZSA9IHRoaXM7XHJcblx0XHRcdGxldCBoaWVyYXJjaHlFbGVtZW50czogQXJyYXk8SGllcmFyY2h5Tm9kZT4gPSBbXTtcclxuXHRcdFx0bGV0IHNlbGZfbm9kZTogSGllcmFyY2h5Tm9kZSA9IG5ldyBIaWVyYXJjaHlOb2RlKCk7XHJcblx0XHRcdHNlbGZfbm9kZS5IaWVyYXJjaHlFbnRpdHlJZCA9IHRoaXMuSGllcmFyY2h5Q29udHJvbC5FbnRpdHlJZDtcclxuXHRcdFx0bGV0IGNvdmVyZWRFbnRpdGllczogc3RyaW5nW10gPSBbdGhpcy5IaWVyYXJjaHlDb250cm9sLkVudGl0eUlkXTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdHMgPSBhd2FpdCBoZXJlLmdldEZhbWlseUNvbm5lY3Rpb25zKGhlcmUuSGllcmFyY2h5Q29udHJvbC5FbnRpdHlJZCwgMCwgY292ZXJlZEVudGl0aWVzKTtcclxuXHRcdFx0Zm9yIChsZXQgZW50aXR5IG9mIHJlc3VsdHMuZW50aXRpZXMpIHtcclxuXHRcdFx0XHRsZXQgaGU6IEhpZXJhcmNoeU5vZGUgPSB0aGlzLnBhcnNlSlNPTlJlc3BvbnNlKGVudGl0eSk7XHJcblx0XHRcdFx0aWYgKHNlbGZfbm9kZS5MaW5lMSA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRzZWxmX25vZGUuTGluZTEgPSBlbnRpdHlbXCJmcm9tLmZ1bGxuYW1lXCJdO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRpZiAoZW50aXR5Ll9yZWNvcmQycm9sZWlkX3ZhbHVlID09PSBDb25uZWN0aW9uUm9sZS5QYXJlbnQudG9Mb3dlckNhc2UoKSB8fCBlbnRpdHkuX3JlY29yZDFyb2xlaWRfdmFsdWUgPT09IENvbm5lY3Rpb25Sb2xlLkNoaWxkLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRcdHNlbGZfbm9kZS5IaWVyYXJjaHlQYXJlbnRFbnRpdHlJZCA9IGVudGl0eVtcInRvLmNvbnRhY3RpZFwiXTtcclxuXHRcdFx0XHRcdC8vIFRPRE86IFJlcGxhY2UgcGxhY2Vob2xkZXIgd2l0aCBwYXJlbnQgbGFiZWxcclxuXHRcdFx0XHRcdGhlLkxpbmUyID0gXCJQYXJlbnRcIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aWYgKGVudGl0eVtcImZyb20uY29udGFjdGlkXCJdID09PSB0aGlzLkhpZXJhcmNoeUNvbnRyb2wuRW50aXR5SWQgJiYgc2VsZl9ub2RlLkltZ1VybCA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRzZWxmX25vZGUuSW1nVXJsID0gZW50aXR5W1wiZnJvbS5lbnRpdHlpbWFnZVwiXSAhPT0gdW5kZWZpbmVkID8gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBlbnRpdHlbXCJmcm9tLmVudGl0eWltYWdlXCJdIDogXCJcIjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0aGllcmFyY2h5RWxlbWVudHMucHVzaChoZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0aGllcmFyY2h5RWxlbWVudHMucHVzaChzZWxmX25vZGUpO1xyXG5cdFx0XHR0aGlzLkhpZXJhcmNoeUVsZW1lbnRzID0gaGllcmFyY2h5RWxlbWVudHM7XHJcblx0XHRcdHJldHVybiAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhcnNlSlNPTlJlc3BvbnNlKG9iajogYW55KTogSGllcmFyY2h5Tm9kZSB7XHJcbiAgICAgICAgICAgIGxldCBub2RlOiBIaWVyYXJjaHlOb2RlID0gbmV3IEhpZXJhcmNoeU5vZGUoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvYmouX3JlY29yZDJyb2xlaWRfdmFsdWUgPT09IENvbm5lY3Rpb25Sb2xlLkNoaWxkLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUuSGllcmFyY2h5UGFyZW50RW50aXR5SWQgPSBvYmpbXCJmcm9tLmNvbnRhY3RpZFwiXTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmouX3JlY29yZDJyb2xlaWRfdmFsdWUgPT09IENvbm5lY3Rpb25Sb2xlLlBhcmVudC50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgIFx0bm9kZS5IaWVyYXJjaHlQYXJlbnRFbnRpdHlJZCA9IG9ialtcInRvLmNvbnRhY3RpZFwiXTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bm9kZS5IaWVyYXJjaHlFbnRpdHlJZCA9IG9iai5fcmVjb3JkMmlkX3ZhbHVlO1xyXG5cclxuICAgICAgICAgICAgbm9kZS5FbnRpdHlJZCA9IG5vZGUuSGllcmFyY2h5RW50aXR5SWQ7XHJcbiAgICAgICAgICAgIG5vZGUuTGluZTEgPSBvYmpbXCJ0by5mdWxsbmFtZVwiXTtcclxuICAgICAgICAgICAgbm9kZS5MaW5lMiA9IG9ialtcIl9yZWNvcmQycm9sZWlkX3ZhbHVlQE9EYXRhLkNvbW11bml0eS5EaXNwbGF5LlYxLkZvcm1hdHRlZFZhbHVlXCJdID09PSB1bmRlZmluZWQgP1xyXG5cdFx0XHRcdFwiVW5zcGVjaWZpZWRcIiA6IG9ialtcIl9yZWNvcmQycm9sZWlkX3ZhbHVlQE9EYXRhLkNvbW11bml0eS5EaXNwbGF5LlYxLkZvcm1hdHRlZFZhbHVlXCJdO1xyXG4gICAgICAgICAgICBub2RlLkxpbmUzID0gXCJcIjtcclxuICAgICAgICAgICAgbm9kZS5JbWdVcmwgPSBvYmpbXCJ0by5lbnRpdHlpbWFnZVwiXSAhPT0gdW5kZWZpbmVkID8gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBvYmpbXCJ0by5lbnRpdHlpbWFnZVwiXSA6IFwiXCI7XHJcbiAgICAgICAgICAgIG5vZGUuVXJsID0gQ29tbW9uLkluc3RhbmNlLmdldExpbmsobm9kZS5FbnRpdHlJZCwgdGhpcy5IaWVyYXJjaHlDb250cm9sLkVudGl0eU5hbWUsIHRoaXMuSGllcmFyY2h5Q29udHJvbC5Db250ZXh0KTtcclxuXHJcblx0XHRcdGlmIChub2RlLkltZ1VybCA9PT0gdW5kZWZpbmVkIHx8IG5vZGUuSW1nVXJsID09PSBudWxsIHx8IG5vZGUuSW1nVXJsID09PSBcIlwiKSB7XHJcblx0XHRcdFx0bm9kZS5JbWdVcmwgPSB0aGlzLkhpZXJhcmNoeUNvbnRyb2wuRGVmYXVsdEltYWdlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAob2JqLl9yZWNvcmQycm9sZWlkX3ZhbHVlID09PSBDb25uZWN0aW9uUm9sZS5QYXJ0bmVyLnRvTG93ZXJDYXNlKCkgfHwgb2JqLl9yZWNvcmQxcm9sZWlkX3ZhbHVlID09PSBDb25uZWN0aW9uUm9sZS5QYXJ0bmVyLnRvTG93ZXJDYXNlKCkpIHtcclxuXHRcdFx0XHRpZiAob2JqLl9yZWNvcmQxcm9sZWlkX3ZhbHVlICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdG5vZGUuTGluZTIgPSBvYmpbXCJfcmVjb3JkMXJvbGVpZF92YWx1ZUBPRGF0YS5Db21tdW5pdHkuRGlzcGxheS5WMS5Gb3JtYXR0ZWRWYWx1ZVwiXTtcclxuXHRcdFx0XHR9IGVsc2UgaWYgKG9iai5fcmVjb3JkMnJvbGVpZF92YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0XHRub2RlLkxpbmUyID0gb2JqW1wiX3JlY29yZDJyb2xlaWRfdmFsdWVAT0RhdGEuQ29tbXVuaXR5LkRpc3BsYXkuVjEuRm9ybWF0dGVkVmFsdWVcIl07XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gbm9kZTtcclxuXHRcdH1cclxuXHJcblx0XHRhc3luYyBnZXRGYW1pbHlDb25uZWN0aW9ucyhlbnRpdHlJZDogc3RyaW5nLCBkZXB0aDogbnVtYmVyLCBjb3ZlcmVkRW50aXR5SWRzOiBzdHJpbmdbXSkge1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGxldCByZXN1bHRzOiB7ZW50aXRpZXM6IGFueVtdfSA9IHtlbnRpdGllczogW119O1xyXG5cclxuXHRcdFx0XHRpZiAoZGVwdGggPCAyKSB7XHJcblx0XHRcdFx0XHRsZXQgZmV0Y2hYbWwgPSBidWlsZFhNTFF1ZXJ5KGVudGl0eUlkKTtcclxuXHRcdFx0XHRcdHJlc3VsdHMgPSBhd2FpdCB0aGlzLkhpZXJhcmNoeUNvbnRyb2wuQ29udGV4dC53ZWJBUEkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoXCJjb25uZWN0aW9uXCIsYD9mZXRjaFhtbD0ke2ZldGNoWG1sfWApO1xyXG5cdFx0XHRcdFx0bGV0IG5ld0VudGl0aWVzOiBhbnlbXSA9IFtdO1xyXG5cdFx0XHRcdFx0Zm9yIChsZXQgZW50aXR5IG9mIHJlc3VsdHMuZW50aXRpZXMpIHtcclxuXHRcdFx0XHRcdFx0IGxldCBhZGRpdGlvbmFsUmVzdWx0cyA9IGF3YWl0IHRoaXMuZ2V0RmFtaWx5Q29ubmVjdGlvbnMoZW50aXR5W1widG8uY29udGFjdGlkXCJdLCBkZXB0aCArIDEsIGNvdmVyZWRFbnRpdHlJZHMpO1xyXG5cdFx0XHRcdFx0XHQgaWYgKGFkZGl0aW9uYWxSZXN1bHRzICE9PSB1bmRlZmluZWQpIHtcclxuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBlbnQgb2YgYWRkaXRpb25hbFJlc3VsdHMuZW50aXRpZXMpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGlmIChjb3ZlcmVkRW50aXR5SWRzLmluZGV4T2YoZW50W1widG8uY29udGFjdGlkXCJdKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0bmV3RW50aXRpZXMucHVzaChlbnQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjb3ZlcmVkRW50aXR5SWRzLnB1c2goZW50W1widG8uY29udGFjdGlkXCJdKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdCB9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRpZiAobmV3RW50aXRpZXMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHRzLmVudGl0aWVzID0gcmVzdWx0cy5lbnRpdGllcy5jb25jYXQobmV3RW50aXRpZXMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmVzdWx0cyA9IHVuZGVmaW5lZDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIHJlc3VsdHM7XHJcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRcdFx0Q29tbW9uLmxvZyhlcnJvci5tZXNzYWdlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Y2xhc3MgSGllcmFyY2h5Tm9kZSB7XHJcblx0XHRIaWVyYXJjaHlQYXJlbnRFbnRpdHlJZDogc3RyaW5nO1xyXG5cdFx0SGllcmFyY2h5RW50aXR5SWQ6IHN0cmluZztcclxuXHRcdEVudGl0eUlkOiBzdHJpbmc7XHJcblxyXG5cdFx0VXJsOiBzdHJpbmc7XHJcblx0XHRJbWdVcmw6IHN0cmluZztcclxuXHRcdExpbmUxOiBzdHJpbmc7XHJcblx0XHRMaW5lMjogc3RyaW5nO1xyXG5cdFx0TGluZTM6IHN0cmluZztcclxuXHR9XHJcblxyXG5cdGVudW0gQ29ubmVjdGlvblJvbGUge1xyXG5cdCAgICBDaGlsZCA9IFwiREYwQkY2OUYtMzMzQy00RTlCLTg2RTctNEZGNzM3QkM5MzQzXCIsXHJcbiAgICAgICAgUGFydG5lciA9IFwiRUUzNzU5NDQtNTQxNS00MzdELTkzMzYtNzY5OENGNjY1QjI2XCIsXHJcbiAgICAgICAgUGFyZW50ID0gXCJFREE2OUZDNi0wQjVGLTQ0RkItQjU4NC03REZFQjhBOTI1QUZcIlxyXG4gICAgfVxyXG5cclxuXHRmdW5jdGlvbiBidWlsZFhNTFF1ZXJ5KGVudGl0eUlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0Ly8gbGFuZ3VhZ2U9WE1MXHJcblx0XHRyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGA8ZmV0Y2ggdmVyc2lvbj1cIjEuMFwiIG91dHB1dC1mb3JtYXQ9XCJ4bWwtcGxhdGZvcm1cIiBtYXBwaW5nPVwibG9naWNhbFwiIGRpc3RpbmN0PVwiZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwiY29ubmVjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cInJlY29yZDJpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwicmVjb3JkMnJvbGVpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwicmVjb3JkMWlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJyZWNvcmQxcm9sZWlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJkZXNjcmlwdGlvblwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiY29ubmVjdGlvbmlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8b3JkZXIgYXR0cmlidXRlPVwicmVjb3JkMmlkXCIgZGVzY2VuZGluZz1cImZhbHNlXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3RhdGVjb2RlXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiMFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInJlY29yZDFpZFwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7ZW50aXR5SWR9XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXIgdHlwZT1cIm9yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwicmVjb3JkMXJvbGVpZFwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgdWluYW1lPVwiQ2hpbGRcIiB1aXR5cGU9XCJjb25uZWN0aW9ucm9sZVwiPnske0Nvbm5lY3Rpb25Sb2xlLkNoaWxkfX08L3ZhbHVlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx2YWx1ZSB1aW5hbWU9XCJTcG91c2UvUGFydG5lclwiIHVpdHlwZT1cImNvbm5lY3Rpb25yb2xlXCI+eyR7Q29ubmVjdGlvblJvbGUuUGFydG5lcn19PC92YWx1ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgdWluYW1lPVwiUGFyZW50XCIgdWl0eXBlPVwiY29ubmVjdGlvbnJvbGVcIj57JHtDb25uZWN0aW9uUm9sZS5QYXJlbnR9fTwvdmFsdWU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvY29uZGl0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInJlY29yZDJyb2xlaWRcIiBvcGVyYXRvcj1cImluXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIHVpbmFtZT1cIkNoaWxkXCIgdWl0eXBlPVwiY29ubmVjdGlvbnJvbGVcIj57JHtDb25uZWN0aW9uUm9sZS5DaGlsZH19PC92YWx1ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dmFsdWUgdWluYW1lPVwiU3BvdXNlL1BhcnRuZXJcIiB1aXR5cGU9XCJjb25uZWN0aW9ucm9sZVwiPnske0Nvbm5lY3Rpb25Sb2xlLlBhcnRuZXJ9fTwvdmFsdWU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHZhbHVlIHVpbmFtZT1cIlBhcmVudFwiIHVpdHlwZT1cImNvbm5lY3Rpb25yb2xlXCI+eyR7Q29ubmVjdGlvblJvbGUuUGFyZW50fX08L3ZhbHVlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2NvbmRpdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwiY29udGFjdFwiIGZyb209XCJjb250YWN0aWRcIiB0bz1cInJlY29yZDFpZFwiIGxpbmstdHlwZT1cImlubmVyXCIgYWxpYXM9XCJmcm9tXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJmdWxsbmFtZVwiLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cImNvbnRhY3RpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJlbnRpdHlpbWFnZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cImNvbnRhY3RcIiBmcm9tPVwiY29udGFjdGlkXCIgdG89XCJyZWNvcmQyaWRcIiBsaW5rLXR5cGU9XCJpbm5lclwiIGFsaWFzPVwidG9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cImZ1bGxuYW1lXCIvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiY29udGFjdGlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cImVudGl0eWltYWdlXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmV0Y2g+YCk7XHJcblx0fVxyXG5cclxuXHJcbn0iXX0=