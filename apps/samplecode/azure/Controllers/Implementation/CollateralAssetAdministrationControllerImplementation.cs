using FinancialServicesAccelerator.BIAN.WebApi.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FinancialServicesAccelerator.BIAN.WebApi.Controllers
{
    public class CollateralAssetAdministrationControllerImplementation : ICollateralAssetAdministrationController
    {
        public ICdsWebApi _cdsWebApi;
        private const string _invalidCrReferenceIdError = "cr_reference_id must be specified as a valid GUID";

        public CollateralAssetAdministrationControllerImplementation(ICdsWebApi cdsWebApi)
        {
            _cdsWebApi = cdsWebApi;
        }

        public Task<RecordCollateralAssetAdministrativePlanResponse> RecordCollateralAssetAdministrativePlanAsync(string cr_reference_id, RecordCollateralAssetAdministrativePlanRequest body)
        {
            return Task.Run<RecordCollateralAssetAdministrativePlanResponse>(() =>
            {
                var collateral = new CdsEntity();
                if (Guid.TryParse(cr_reference_id, out Guid collateralId) == false)
                {
                    throw new Exception(_invalidCrReferenceIdError);
                }
                else
                {
                    collateral.Id = collateralId;
                }

                if (string.IsNullOrEmpty(body.EmpolyeeBusinessUnitReference) == false)
                {
                    if (Guid.TryParse(body.EmpolyeeBusinessUnitReference, out var businessUnitId) == false)
                    {
                        throw new Exception("EmpolyeeBusinessUnitReference must be specified as a valid GUID");
                    }
                    else
                    {
                        var businessUnit = _cdsWebApi.Retrieve("businessunits", businessUnitId, "name");
                        collateral.Attributes["msfsi_evaluatedby"] = $"{businessUnit.Attributes["name"]} Team";
                    }
                }

                if (string.IsNullOrEmpty(body.RecordingRecordDateTime) == false)
                {
                    if (DateTime.TryParse(body.RecordingRecordDateTime, out var recordingDateTime) == false)
                    {
                        throw new Exception("RecordingRecordDateTime must be specified as a valid DateTime");
                    }
                    else
                    {
                        collateral.Attributes["msfsi_dateofvaluation"] = recordingDateTime;
                        collateral.Attributes["msfsi_nextdateofvaluation"] = recordingDateTime.AddYears(1);
                    }
                }

                if (string.IsNullOrEmpty(body.RecordingRecordType) == false)
                {
                    collateral.Attributes["msfsi_description"] = body.RecordingRecordType;
                }

                if (collateral.Attributes.Count > 0)
                {
                    _cdsWebApi.Update("msfsi_collaterals", collateral);
                }

                return new RecordCollateralAssetAdministrativePlanResponse()
                {
                    RecordingRecordReference = collateral.Id.ToString(),
                    RecordingRecordStatus = "Applied"
                };
            });
        }

        public Task<CollateralAssetCaptureResponse> RequestCollateralAssetAdministrativePlanCaptureCreateAsync(string cr_reference_id, RequestCollateralAssetAdministrativePlanCaptureRequest body)
        {
            return CreateUpdateCollateral(
                body, cr_reference_id,
                (updateBody, id) => new CollateralAssetCaptureResponse(updateBody, id));
        }

        public Task<CollateralAssetUpdateResponse> RequestCollateralAssetAdministrativePlanCaptureUpdateAsync(string cr_reference_id, string bq_reference_id, RequestCollateralAssetAdministrativePlanCaptureRequest body)
        {
            return CreateUpdateCollateral(body, cr_reference_id,
                (updateBody, id) => new CollateralAssetUpdateResponse(updateBody, id),
                true);
        }

        public Task<RequestCollateralAssetAdministrativePlanResponse> RequestCollateralAssetAdministrativePlanCreateAsync(RequestCollateralAssetAdministrativePlanRequest body)
        {
            return CreateUpdateCollateral(body, null,
                (updateBody, id) => 
                    new RequestCollateralAssetAdministrativePlanResponse(body, id),
                skipId: true);
        }

        public Task<RequestCollateralAssetAdministrativePlanResponse> RequestCollateralAssetAdministrativePlanUpdateAsync(string cr_reference_id, RequestCollateralAssetAdministrativePlanRequest body)
        {
            return CreateUpdateCollateral(body, cr_reference_id,
                (updateBody, id) => new RequestCollateralAssetAdministrativePlanResponse(updateBody, id),
                true);
        }

        public Task<RequestCollateralAssetAdministrativePlanValuationCreateResponse> RequestCollateralAssetAdministrativePlanValuationCreateAsync(string cr_reference_id)
        {
            return Task.Run<RequestCollateralAssetAdministrativePlanValuationCreateResponse>(
                () => new RequestCollateralAssetAdministrativePlanValuationCreateResponse()
                {
                    RefreshStatus = "Refreshed"
                });
        }

        public Task<CollateralAssetAdministrativePlanValuationResponse> RequestCollateralAssetAdministrativePlanValuationUpdateAsync(string cr_reference_id, string bq_reference_id, RequestCollateralAssetAdministrativePlanValuationUpdateRequest body)
        {
            return RetrieveValuationResponse(cr_reference_id);
        }

        public Task<ICollection<string>> RetrieveBehaviorQualifierReferenceIdsAsync(string cr_reference_id, string behavior_qualifier, string collection_filter = null)
        {
            return Task.Run<ICollection<string>>(() => new List<string>());
        }

        public Task<ICollection<string>> RetrieveCollateralAssetAdministrationBehaviorQualifiersAsync()
        {
            return Task.Run<ICollection<string>>(() => new List<string>());
        }

        public Task<ICollection<string>> RetrieveCollateralAssetAdministrationReferenceIdsAsync(string collection_filter = null)
        {
            return Task.Run<ICollection<string>>(() =>
            {
                var records = _cdsWebApi.RetrieveMultiple("msfsi_collaterals",
                    @"<fetch>
                    <entity name='msfsi_collateral'>
                      <attribute name='msfsi_collateralid' />
                    </entity>
                  </fetch>");
                
                return records.SelectMany(record => record.Attributes
                    .Where(attribute => attribute.Key == "msfsi_collateralid")
                    .Select(attribute => attribute.Value?.ToString())).ToList();
            });
        }

        public Task<RetrieveCollateralAssetAdministrativePlanResponse> RetrieveCollateralAssetAdministrativePlanAsync(string cr_reference_id)
        {
            return Task.Run<RetrieveCollateralAssetAdministrativePlanResponse>(() =>
            {
                var record = RetrieveCollateralForRetrieveRequest(cr_reference_id,
                    "msfsi_dateofvaluation", "msfsi_collateralvalue");

                return new RetrieveCollateralAssetAdministrativePlanResponse()
                {
                    CollateralAssetDescription = record.Attributes["msfsi_description"]?.ToString(),
                    CollateralAssetType = record.Attributes["msfsi_collateraltype@odata.community.display.v1.formattedvalue"]?.ToString(),
                    CollateralAssetValuationHistory = BuildValuationHistory(record),
                    CollateralAssetTitle = record.Attributes["msfsi_name"]?.ToString()
                };
              });
        }

        public Task<CollateralAssetCaptureResponse> RetrieveCollateralAssetAdministrativePlanCaptureAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run<CollateralAssetCaptureResponse>(() =>
            {
                var record = RetrieveCollateralForRetrieveRequest(cr_reference_id);

                return new CollateralAssetCaptureResponse()
                {
                    CollateralAssetDescription = record.Attributes["msfsi_description"]?.ToString(),
                    CollateralAssetType = record.Attributes["msfsi_collateraltype@odata.community.display.v1.formattedvalue"]?.ToString(),
                    CollateralAssetTitle = record.Attributes["msfsi_name"]?.ToString(),
                    CollateralAssetReference = record.Id.ToString()
                };
            });
        }

        public Task<RetrieveCollateralAssetAdministrativePlanMaintenanceResponse> RetrieveCollateralAssetAdministrativePlanMaintenanceAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run<RetrieveCollateralAssetAdministrativePlanMaintenanceResponse>(() =>
                new RetrieveCollateralAssetAdministrativePlanMaintenanceResponse());
        }

        public Task<RetrieveCollateralAssetAdministrativePlanReportingResponse> RetrieveCollateralAssetAdministrativePlanReportingAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run<RetrieveCollateralAssetAdministrativePlanReportingResponse>(() =>
            {
                var record = RetrieveCollateralForRetrieveRequest(cr_reference_id,
                "msfsi_dateofvaluation", "msfsi_collateralvalue");

                return new RetrieveCollateralAssetAdministrativePlanReportingResponse()
                {
                    CollateralAssetDescription = record.Attributes["msfsi_description"]?.ToString(),
                    CollateralAssetType = record.Attributes["msfsi_collateraltype@odata.community.display.v1.formattedvalue"]?.ToString(),
                    CollateralAssetValuationHistory = BuildValuationHistory(record),
                    CollateralAssetTitle = record.Attributes["msfsi_name"]?.ToString(),
                    CollateralAssetReference = record.Id.ToString()
                };
            });
        }

        public Task<CollateralAssetUpdateResponse> RetrieveCollateralAssetAdministrativePlanUpdateAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run<CollateralAssetUpdateResponse>(() =>
                new CollateralAssetUpdateResponse());
        }

        public Task<CollateralAssetAdministrativePlanValuationResponse> RetrieveCollateralAssetAdministrativePlanValuationAsync(string cr_reference_id, string bq_reference_id)
        {
            return RetrieveValuationResponse(cr_reference_id);
        }

        public Task<CollateralAssetUpdateResponse> UpdateCollateralAssetAdministrativePlanAsync(string cr_reference_id, UpdateCollateralAssetAdministrativePlanRequest body)
        {
            return CreateUpdateCollateral(body, cr_reference_id,
                (updateBody, id) =>
                    new CollateralAssetUpdateResponse(updateBody, id)
                    {
                        CollateralAssetUpdateResult = "Success"
                    },
                true);
        }

        private Task<T2> CreateUpdateCollateral<T1, T2>(T1 body, string cr_reference_id, Func<T1, string, T2> buildResponse,
            bool updateCollateral = false, bool skipId = false)
            where T1 : CollateralAssetBase
            where T2 : CollateralAssetResponseBase
        {
            return Task.Run<T2>(() =>
            {
                var collateral = BuildCdsEntity(body, cr_reference_id, skipId);
                var id = collateral.Id;
                if (updateCollateral)
                {
                    _cdsWebApi.Update("msfsi_collaterals", collateral);
                }
                else
                {
                    id = _cdsWebApi.Create("msfsi_collaterals", collateral);
                }

                return buildResponse(body, id.ToString());
            });
        }

        private CdsEntity RetrieveCollateralForRetrieveRequest(string cr_reference_id, params string[] additionalFields)
        {
            if (Guid.TryParse(cr_reference_id, out var collateralId) == false)
            {
                throw new Exception(_invalidCrReferenceIdError);
            }

            var fields = new List<string>()
            {
                "msfsi_description", "msfsi_collateraltype", "msfsi_name"
            };

            fields.AddRange(additionalFields);

            return _cdsWebApi.Retrieve("msfsi_collaterals", collateralId, fields.ToArray());
        }

        private CdsEntity RetrieveCollateralForValidationRetrieveRequest(string cr_reference_id)
        {
            if (Guid.TryParse(cr_reference_id, out var collateralId) == false)
            {
                throw new Exception(_invalidCrReferenceIdError);
            }

            return _cdsWebApi.Retrieve("msfsi_collaterals", collateralId,
                new ExpandQuery("msfsi_financialproductid",
                    "msfsi_principalamount"), "msfsi_collateralvalue", "msfsi_dateofvaluation");
        }

        private CdsEntity BuildCdsEntity(CollateralAssetBase assertRequestResponse, string cr_reference_id, bool skipId = false)
        {
            var collateral = new CdsEntity();

            Guid collateralId = Guid.Empty;
            if (skipId == false && Guid.TryParse(cr_reference_id, out collateralId) == false)
            {
                throw new Exception(_invalidCrReferenceIdError);
            }
            else if (skipId == false)
            {
                collateral.Attributes["msfsi_collateralid"] = collateralId;
                collateral.Id = collateralId;
            }

            if (string.IsNullOrEmpty(assertRequestResponse.CollateralAssetType) == false)
            {
                collateral.Attributes["msfsi_collateraltype"] = ParseCollateralType(assertRequestResponse.CollateralAssetType);
            }

            if (string.IsNullOrEmpty(assertRequestResponse.CollateralAssetDescription) == false)
            {
                collateral.Attributes["msfsi_description"] = assertRequestResponse.CollateralAssetDescription;
            }

            if (string.IsNullOrEmpty(assertRequestResponse.CollateralAssetTitle) == false)
            {
                collateral.Attributes["msfsi_name"] = assertRequestResponse.CollateralAssetTitle;
            }

            return collateral;
        }

        private int ParseCollateralType(string type)
        {
            switch(type.ToLower())
            {
                case "real estate":
                    return 104800000;
                case "cash":
                    return 104800001;
                case "personal guarantee":
                    return 104800002;
                case "corporate guarantee":
                    return 104800003;
                case "shares":
                    return 104800004;
                case "equipment":
                    return 104800005;
                case "vehicles":
                    return 104800006;
                case "accounts receivable":
                    return 104800007;
                case "deposits certificate":
                    return 104800008;
                default:
                    throw new Exception($"Unknown collateralAssetType {type}.");
            }
        }

        private string BuildValuationHistory(CdsEntity collateral)
        {
            var validValuationDate = DateTime.TryParse(
                collateral.Attributes["msfsi_dateofvaluation"]?.ToString(),
                out DateTime valuationDate);

            var validValue = decimal.TryParse(
                collateral.Attributes["msfsi_collateralvalue"]?.ToString(),
                out decimal valuation);

            return $"{(validValuationDate ? valuationDate.ToString("yyyy") : "Unknown Year")}-{(validValue ? $"${valuation}" : "Not Valued")}";
        }

        private Task<CollateralAssetAdministrativePlanValuationResponse> RetrieveValuationResponse(string cr_reference_id)
        {
            return Task.Run<CollateralAssetAdministrativePlanValuationResponse>(() =>
            {
                var record = RetrieveCollateralForValidationRetrieveRequest(cr_reference_id);

                var financialProduct = record.Attributes["msfsi_financialproductid"] as CdsEntity;

                decimal.TryParse(financialProduct?.Attributes["msfsi_principalamount"].ToString(),
                        out decimal principalAmount);

                decimal.TryParse(record.Attributes["msfsi_collateralvalue"]?.ToString(),
                    out decimal collateralValue);

                DateTime.TryParse(record.Attributes["msfsi_dateofvaluation"]?.ToString(),
                    out DateTime valuationDate);

                return new CollateralAssetAdministrativePlanValuationResponse()
                {
                    CollateralAssetValuation = $"${collateralValue}",
                    CollateralAssetLoanToValueRatio = collateralValue != 0
                        ? (principalAmount / collateralValue * 100).ToString()
                        : "",
                    CollateralAssetValuationDate = valuationDate.ToString("yyyy-MM-dd")
                };
            });
        }
    }
}
