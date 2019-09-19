using FinancialServicesAccelerator.BIAN.WebApi.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FinancialServicesAccelerator.BIAN.WebApi.Controllers
{
    public class ConsumerLoanControllerImplementation : IConsumerLoanController
    {
        private ICdsWebApi _cdsWebApi;
        private IHostingEnvironment _environment;
        private Guid _familyId;
        private const string _dateTimeFormat = "yyyy-mm-ddThh:MM:ss.fff";

        public ConsumerLoanControllerImplementation(ICdsWebApi cdsWebApi, IHostingEnvironment environment, IConfiguration configuration)
        {
            _cdsWebApi = cdsWebApi;
            _environment = environment;

            _familyId = configuration.GetValue<Guid>("ProductFamilyId");
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementDisbursementResponse> ExecuteConsumerLoanFulfillmentArrangementDisbursementCreateAsync(string cr_reference_id, ExecuteConsumerLoanFulfillmentArrangementDisbursementRequest body = null)
        {
            return SetDisbursementFields(cr_reference_id, body, true);
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementDisbursementResponse> ExecuteConsumerLoanFulfillmentArrangementDisbursementUpdateAsync(string cr_reference_id, string bq_reference_id, ExecuteConsumerLoanFulfillmentArrangementDisbursementRequest body = null)
        {
            return SetDisbursementFields(cr_reference_id, body);
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementRepaymentResponse> ExecuteConsumerLoanFulfillmentArrangementRepaymentCreateAsync(string cr_reference_id, ExecuteConsumerLoanFulfillmentArrangementRepaymentRequest body = null)
        {
            return SetRepaymentFields(cr_reference_id, body);
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementRepaymentResponse> ExecuteConsumerLoanFulfillmentArrangementRepaymentUpdateAsync(string cr_reference_id, string bq_reference_id, ExecuteConsumerLoanFulfillmentArrangementRepaymentRequest body = null)
        {
            return SetRepaymentFields(cr_reference_id, body);
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementWithdrawalResponse> ExecuteConsumerLoanFulfillmentArrangementWithdrawalCreateAsync(string cr_reference_id, ExecuteConsumerLoanFulfillmentArrangementWithdrawalRequest body = null)
        {
            return CreateUpdateWithdrawal(cr_reference_id, body);
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementWithdrawalResponse> ExecuteConsumerLoanFulfillmentArrangementWithdrawalUpdateAsync(string cr_reference_id, string bq_reference_id, ExecuteConsumerLoanFulfillmentArrangementWithdrawalRequest body = null)
        {
            return CreateUpdateWithdrawal(cr_reference_id, body,
                () => ParseGuid(bq_reference_id, "bq_reference_id"));
        }

        public Task<ConsumerLoanFulfillmentArrangementResponse> InitiateConsumerLoanFulfillmentArrangementAsync(InitiateConsumerLoanFulfillmentArrangementRequest body = null)
        {
            return CreateUpdateLoan(body);
        }

        public Task<RecordConsumerLoanFulfillmentArrangementResponse> RecordConsumerLoanFulfillmentArrangementAsync(string cr_reference_id, RecordConsumerLoanFulfillmentArrangementRequest body = null)
        {
            return Task.Run(() =>
            {
                return new RecordConsumerLoanFulfillmentArrangementResponse()
                {
                    RecordingRecordStatus = "Not Supported"
                };
            });
        }

        public Task<RequestConsumerLoanFulfillmentArrangementRestructuringResponse> RequestConsumerLoanFulfillmentArrangementRestructuringCreateAsync(string cr_reference_id, ConsumerLoanRestructuringWithoutCommonAndId body = null)
        {
            return Task.Run((Func<RequestConsumerLoanFulfillmentArrangementRestructuringResponse>)(() =>
            {
                return new RequestConsumerLoanFulfillmentArrangementRestructuringResponse()
                {
                    RestructingWriteDown = body?.RestructingWriteDown,
                    RestructuringEvaluation = body?.RestructuringEvaluation,
                    RestructuringSolution = body?.RestructuringSolution,
                    RestructuringTask = body?.RestructuringTask
                };
            }));
        }

        public Task<RequestConsumerLoanFulfillmentArrangementRestructuringResponse> RequestConsumerLoanFulfillmentArrangementRestructuringUpdateAsync(string cr_reference_id, string bq_reference_id, ConsumerLoanRestructuringWithoutCommonAndId body = null)
        {
            return Task.Run((Func<RequestConsumerLoanFulfillmentArrangementRestructuringResponse>)(() =>
            {
                return new RequestConsumerLoanFulfillmentArrangementRestructuringResponse()
                {
                    RestructingWriteDown = body?.RestructingWriteDown,
                    RestructuringEvaluation = body?.RestructuringEvaluation,
                    RestructuringSolution = body?.RestructuringSolution,
                    RestructuringTask = body?.RestructuringTask
                };
            }));
        }

        public Task<ICollection<string>> RetrieveBehaviorQualifierReferenceIdsAsync(string cr_reference_id, string behavior_qualifier, string collection_filter = null)
        {
            return Task.Run<ICollection<string>>(() =>
            {
                if (behavior_qualifier?.ToLower() != "withdrawal")
                {
                    return new List<string>();
                }

                var loanId = ParseGuid(cr_reference_id, "cr_reference_id");

                var records = _cdsWebApi.RetrieveMultiple("msfsi_syndicateses",
                    $@"<fetch>
                        <entity name='msfsi_syndicates'>
                          <attribute name='msfsi_syndicatesid' />
                          <filter>
                            <condition attribute='msfsi_loanid' operator='eq' value='{loanId}' />
                            <condition attribute='msfsi_name' operator='like' value='Withdrawal -%' />
                          </filter>
                        </entity>
                      </fetch>");

                return records.SelectMany(record => record.Attributes
                    .Where(attribute => attribute.Key == "msfsi_syndicatesid")
                    .Select(attribute => attribute.Value?.ToString())).ToList();
            });
        }

        public Task<ICollection<string>> RetrieveConsumerLoanBehaviorQualifiersAsync()
        {
            return Task.Run<ICollection<string>>(() => new List<string>
            {
                "disbursement",
                "maintenance",
                "withdrawal",
                "payment",
                "restructuring",
                "statements"
            });
        }

        public Task<ConsumerLoanFulfillmentArrangementResponse> RetrieveConsumerLoanFulfillmentArrangementWithBQsAsync(string cr_reference_id)
        {
            return Task.Run((Func<ConsumerLoanFulfillmentArrangementResponse>)(() =>
            {
                var loanId = ParseGuid(cr_reference_id, "cr_reference_id");

                var loan = _cdsWebApi.Retrieve("msfsi_financialproducts", loanId, "msfsi_loantype",
                    "_msfsi_customerid_value", "msfsi_outstandingtotalamount", "msfsi_loanmaturitydate",
                    "msfsi_loanstartdate", "msfsi_interestrate", "statecode");

                var response = new ConsumerLoanFulfillmentArrangementResponse()
                {
                    LoanType = loan.Attributes.ContainsKey("msfsi_loantype@odata.community.display.v1.formattedvalue")
                               ? loan.Attributes["msfsi_loantype@odata.community.display.v1.formattedvalue"]?.ToString()
                               : "",
                    CustomerReference = loan.Attributes["_msfsi_customerid_value"]?.ToString(),
                    LoanOutstandingBalance = loan.Attributes["msfsi_outstandingtotalamount"]?.ToString(),
                    LoanMaturityDate = FormatDateString(loan.Attributes["msfsi_loanmaturitydate"]?.ToString()),
                    LoanOriginationDate = FormatDateString(loan.Attributes["msfsi_loanstartdate"]?.ToString()),
                    LoanStatus = loan.Attributes["statecode"]?.ToString() == "0"
                                 ? "active"
                                 : "inactive",
                    ProductInstanceReference = loanId.ToString(),
                };

                var unformattedInterestRate = loan.Attributes["msfsi_interestrate"]?.ToString();
                if (string.IsNullOrEmpty(unformattedInterestRate) == false)
                {
                    response.LoanApplicableRate = $"{unformattedInterestRate}%";
                }

                return response;
            }));
        }

        public Task<ICollection<string>> RetrieveConsumerLoanReferenceIdsAsync(string collection_filter = null)
        {
            return Task.Run<ICollection<string>>(() =>
            {
                var records = _cdsWebApi.RetrieveMultiple("msfsi_financialproducts",
                    $@"<fetch>
                        <entity name='msfsi_financialproduct'>
                          <attribute name='msfsi_financialproductid' />
                          <filter>
                            <condition attribute='msfsi_productfamilyid' operator='eq' value='{_familyId}' />
                          </filter>
                        </entity>
                      </fetch>");

                return records.SelectMany(record => record.Attributes
                    .Where(attribute => attribute.Key == "msfsi_financialproductid")
                    .Select(attribute => attribute.Value?.ToString())).ToList();
            });
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementDisbursementResponse> Retrieve_DisbursementAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run(() =>
            {
                var loanId = ParseGuid(cr_reference_id, "cr_reference_id");

                var loan = _cdsWebApi.Retrieve("msfsi_financialproducts", loanId, "msfsi_disbursementdate", "msfsi_disbursedamount");

                return new ExecuteConsumerLoanFulfillmentArrangementDisbursementResponse()
                {
                    Amount = string.IsNullOrEmpty(loan.Attributes["msfsi_disbursedamount"]?.ToString()) == false
                             ? new Amount()
                              {
                                  Currency = "USD",
                                  Value = loan.Attributes["msfsi_disbursedamount"]?.ToString()
                              }
                             : null,
                    ValueDate = FormatDateString(loan.Attributes["msfsi_disbursementdate"]?.ToString())
                };
            });
        }

        public Task<RetrieveMaintenanceResponse> Retrieve_MaintenanceAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run(() =>
            {
                return new RetrieveMaintenanceResponse();
            });
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementRepaymentResponse> Retrieve_PaymentAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run(() =>
            {
                var loanId = ParseGuid(cr_reference_id, "cr_reference_id");
                var loan = _cdsWebApi.Retrieve("msfsi_financialproducts", loanId,
                    "msfsi_lastpaymentamount", "msfsi_interestrate");

                return new ExecuteConsumerLoanFulfillmentArrangementRepaymentResponse()
                {
                    Amount = string.IsNullOrEmpty(loan.Attributes["msfsi_lastpaymentamount"]?.ToString()) == false
                             ? new Amount()
                               {
                                   Currency = "USD",
                                   Value = loan.Attributes["msfsi_lastpaymentamount"].ToString()
                               }
                             : null,
                    LoanApplicableRate = string.IsNullOrEmpty(loan.Attributes["msfsi_interestrate"]?.ToString()) == false
                                         ? $"{loan.Attributes["msfsi_interestrate"]}%"
                                         : null
                };
            });
        }

        public Task<RequestConsumerLoanFulfillmentArrangementRestructuringResponse> Retrieve_RestructuringAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run(() => new RequestConsumerLoanFulfillmentArrangementRestructuringResponse());
        }

        public Task<RetrieveStatementsResponse> Retrieve_StatementsAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run(() => new RetrieveStatementsResponse());
        }

        public Task<ExecuteConsumerLoanFulfillmentArrangementWithdrawalResponse> Retrieve_WithdrawalAsync(string cr_reference_id, string bq_reference_id)
        {
            return Task.Run(() =>
            {
                var loanId = ParseGuid(cr_reference_id, "cr_reference_id");
                var withdrawalId = ParseGuid(bq_reference_id, "bq_reference_id");

                var withdrawal = _cdsWebApi.RetrieveMultiple("msfsi_syndicateses",
                    $@"<fetch top='1'>
                         <entity name='msfsi_syndicates'>
                           <attribute name='msfsi_syndicatesid' />
                           <attribute name='msfsi_name' />
                           <attribute name='msfsi_amount' />
                           <attribute name='msfsi_bankid' />
                           <filter>
                             <condition attribute='msfsi_syndicatesid' operator='eq' value='{withdrawalId}' />
                             <condition attribute='msfsi_loanid' operator='eq' value='{loanId}' />
                             <condition attribute='msfsi_name' operator='like' value='Withdrawal -%' />
                           </filter>
                         </entity>
                       </fetch>").FirstOrDefault();

                if (withdrawal == null)
                {
                    throw new Exception($"A Withdrawal could not be found for id {bq_reference_id} on Loan {cr_reference_id}");
                }

                return new ExecuteConsumerLoanFulfillmentArrangementWithdrawalResponse()
                {
                    Amount = withdrawal.Attributes.ContainsKey("msfsi_amount") &&
                        string.IsNullOrEmpty(withdrawal.Attributes["msfsi_amount"]?.ToString()) == false
                        ? new Amount()
                          {
                              Currency = "USD",
                              Value = withdrawal.Attributes["msfsi_amount"].ToString()
                          }
                        : null,
                    ValueDate = Regex.Match(withdrawal.Attributes["msfsi_name"].ToString(),
                        "Withdrawal - ([0-9]{4}-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9]{3})")
                        ?.Groups.LastOrDefault()?.Value,
                    PayeeBankReference = withdrawal.Attributes.ContainsKey("_msfsi_bankid_value")
                                         ? withdrawal.Attributes["_msfsi_bankid_value"]?.ToString()
                                         : null,
                    WithdrawlInstructionReference = withdrawalId.ToString()
                };
            });
        }

        public Task TerminateConsumerLoanFulfillmentArrangementAsync(string cr_reference_id)
        {
            return Task.Run(() =>
            {
                var loanId = ParseGuid(cr_reference_id, "cr_reference_id");

                _cdsWebApi.Update("msfsi_financialproducts",
                    new CdsEntity()
                    {
                        Id = loanId,
                        Attributes =
                        {
                            ["statecode"] = 1,
                            ["statuscode"] = -1
                        }
                    });
            });
        }

        public Task<ConsumerLoanFulfillmentArrangementResponse> UpdateConsumerLoanFulfillmentArrangementAsync(string cr_reference_id, InitiateConsumerLoanFulfillmentArrangementRequest body)
        {
            return CreateUpdateLoan(body, cr_reference_id);
        }

        private Task<ExecuteConsumerLoanFulfillmentArrangementDisbursementResponse> SetDisbursementFields(string cr_reference_id, ExecuteConsumerLoanFulfillmentArrangementDisbursementRequest body, bool overwriteAmount = false)
        {
            return Task.Run(() =>
            {
                if (body == null)
                {
                    return new ExecuteConsumerLoanFulfillmentArrangementDisbursementResponse();
                }

                var loan = PrepareLoanForExecution(cr_reference_id, body, "msfsi_disbursementdate",
                    "msfsi_disbursedamount", overwriteAmount);

                _cdsWebApi.Update("msfsi_financialproducts", loan);

                return new ExecuteConsumerLoanFulfillmentArrangementDisbursementResponse()
                {
                    Amount = loan.Attributes.ContainsKey("msfsi_disbursedamount")
                             ? new Amount()
                             {
                                 Currency = "USD",
                                 Value = loan.Attributes["msfsi_disbursedamount"].ToString()
                             }
                             : body.Amount,
                    Currency = body.Currency,
                    CustomerReference = body.CustomerReference,
                    PayeeBankReference = body.PayeeBankReference,
                    PayeeProductInstanceReference = body.PayeeProductInstanceReference,
                    PayeeReference = body.PayeeReference,
                    ValueDate = body.ValueDate
                };
            });
        }

        private Task<ExecuteConsumerLoanFulfillmentArrangementRepaymentResponse> SetRepaymentFields(string cr_reference_id, ExecuteConsumerLoanFulfillmentArrangementRepaymentRequest body)
        {
            return Task.Run(() =>
            {
                if (body == null)
                {
                    return new ExecuteConsumerLoanFulfillmentArrangementRepaymentResponse();
                }

                var loan = PrepareLoanForExecution(cr_reference_id, body, "",
                    "msfsi_lastpaymentamount");

                if (body.LoanOutstandingBalance != null)
                {
                    loan.Attributes["msfsi_outstandingtotalamount"] = body.LoanOutstandingBalance;
                }

                if (string.IsNullOrEmpty(body.LoanApplicableRate) == false)
                {
                    loan.Attributes["msfsi_interestrate"] = ParsePercentage(body.LoanApplicableRate, "LoanApplicableRate");
                }

                _cdsWebApi.Update("msfsi_financialproducts", loan);

                return new ExecuteConsumerLoanFulfillmentArrangementRepaymentResponse()
                {
                    Amount = body.Amount,
                    Currency = body.Currency,
                    CustomerReference = body.CustomerReference,
                    LoanApplicableRate = body.LoanApplicableRate,
                    LoanOutstandingBalance = body.LoanOutstandingBalance,
                    PayerBankReference = body.PayerBankReference,
                    PayerProductInstanceReference = body.PayerProductInstanceReference,
                    PayerReference = body.PayerReference,
                    PaymentType = body.PaymentType,
                    StagedRepaymentStatement = body.StagedRepaymentStatement,
                    ValueDate = body.ValueDate
                };
            });
        }

        private CdsEntity PrepareLoanForExecution(string cr_reference_id, ExecutionBase body, string dateField, string amountField, bool overwriteAmount = true)
        {
            var loanId = ParseGuid(cr_reference_id, "cr_reference_id");
            ValidateCurrencyIsUSD(body.Currency, body.Amount?.Currency);

            var loan = new CdsEntity()
            {
                Id = loanId
            };

            if (string.IsNullOrEmpty(dateField) == false)
            {
                SetDatetimeField(loan, body.ValueDate, "ValueDate", dateField);
            }

            if (string.IsNullOrEmpty(amountField) == false &&
                string.IsNullOrEmpty(body?.Amount?.Value) == false)
            {
                if (decimal.TryParse(body.Amount.Value, out var amount) == false)
                {
                    throw new Exception("Amount must be a valid decimal number.");
                }

                if (overwriteAmount == false)
                {
                    var existingLoan = _cdsWebApi.Retrieve("msfsi_financialproducts", loanId,
                        amountField);

                    if (decimal.TryParse(existingLoan.Attributes[amountField]?.ToString(),
                            out var currentAmount))
                    {
                        amount += currentAmount;
                    }
                }
                loan.Attributes[amountField] = amount;
            }

            return loan;
        }

        private Task<ExecuteConsumerLoanFulfillmentArrangementWithdrawalResponse> CreateUpdateWithdrawal(string cr_reference_id, ExecuteConsumerLoanFulfillmentArrangementWithdrawalRequest body, Func<Guid> retrieveWithdrawalId = null)
        {
            return Task.Run(() =>
            {
                if (body == null)
                {
                    return new ExecuteConsumerLoanFulfillmentArrangementWithdrawalResponse();
                }
                var loanId = ParseGuid(cr_reference_id, "cr_reference_id");
                ValidateCurrencyIsUSD(body.Currency, body.Amount?.Currency);

                var disbursment = new CdsEntity()
                {
                    Id = loanId,
                    Attributes =
                    {
                        ["msfsi_loanid"] = new CdsEntityReference("msfsi_financialproducts", loanId)
                    }
                };

                if (retrieveWithdrawalId == null || string.IsNullOrEmpty(body.ValueDate) == false)
                {
                    disbursment.Attributes["msfsi_name"] = $"Withdrawal - {body.ValueDate ?? DateTime.Now.ToString(_dateTimeFormat)}"; ;
                }

                SetDecimalField(disbursment, body?.Amount?.Value, "Amount Value", "msfsi_amount");

                if (string.IsNullOrEmpty(body.PayeeBankReference) == false)
                {
                    disbursment.Attributes["msfsi_bankid"] = FindBank(body.PayeeBankReference);
                }

                Guid id;
                if (retrieveWithdrawalId == null)
                {
                    id = _cdsWebApi.Create("msfsi_syndicateses", disbursment);
                }
                else
                {
                    id = retrieveWithdrawalId();
                    disbursment.Id = id;
                    _cdsWebApi.Update("msfsi_syndicateses", disbursment);
                }

                return new ExecuteConsumerLoanFulfillmentArrangementWithdrawalResponse()
                {
                    Amount = body.Amount,
                    Currency = body.Currency,
                    CustomerReference = body.CustomerReference,
                    WithdrawlInstructionReference = id.ToString(),
                    PayeeBankReference = body.PayeeBankReference,
                    PayeeProductInstanceReference = body.PayeeProductInstanceReference,
                    PayeeReference = body.PayeeReference,
                    ValueDate = body.ValueDate
                };
            });
        }

        private Task<ConsumerLoanFulfillmentArrangementResponse> CreateUpdateLoan(InitiateConsumerLoanFulfillmentArrangementRequest body, string cr_reference_id = null)
        {
            return Task.Run(() =>
            {
                if (body == null)
                {
                    return new ConsumerLoanFulfillmentArrangementResponse();
                }

                var loan = new CdsEntity();

                if (string.IsNullOrEmpty(cr_reference_id) == false)
                {
                    loan.Id = ParseGuid(cr_reference_id, "cr_reference_id");
                }

                if (string.IsNullOrEmpty(body.LoanType) == false)
                {
                    int loanType;
                    switch (body.LoanType.ToLower().Trim())
                    {
                        case "new":
                            loanType = 104800000;
                            break;
                        case "top-up":
                            loanType = 104800001;
                            break;
                        case "buy-out":
                            loanType = 104800002;
                            break;
                        default:
                            throw new Exception($"Unknown Loan Type {body.LoanType}.");
                    }

                    loan.Attributes["msfsi_loantype"] = loanType;
                }

                if (string.IsNullOrEmpty(body.LoanApplicableRate) == false)
                {
                    loan.Attributes["msfsi_interestrate"] = ParsePercentage(body.LoanApplicableRate,
                        "LoanApplicableRate");
                }

                if (string.IsNullOrEmpty(body.CustomerReference) == false)
                {
                    var customerId = ParseGuid(body.CustomerReference, "CustomerReference");

                    var accounts = _cdsWebApi.RetrieveMultiple("accounts",
                        $@"<fetch top='1'>
                             <entity name='account'>
                               <attribute name='accountid' />
                               <filter>
                                 <condition attribute='accountid' operator='eq' value='{customerId}' />
                               </filter>
                             </entity>
                           </fetch>");

                    string entitySetName;
                    string entityName;
                    if (accounts.Count() > 0)
                    {
                        entitySetName = "accounts";
                        entityName = "account";
                    }
                    else
                    {
                        var contacts = _cdsWebApi.RetrieveMultiple("contacts",
                            $@"<fetch top='1'>
                                 <entity name='contact'>
                                   <attribute name='contactid' />
                                   <filter>
                                     <condition attribute='contactid' operator='eq' value='{customerId}' />
                                   </filter>
                                 </entity>
                               </fetch>");

                        if (contacts.Count() == 0)
                        {
                            throw new Exception($"Unknown CustomerReference {body.CustomerReference}");
                        }

                        entitySetName = "contacts";
                        entityName = "contact";
                    }

                    loan.Attributes[$"msfsi_customerid_{entityName}"] = new CdsEntityReference(entitySetName,
                        customerId);
                }

                if (string.IsNullOrEmpty(cr_reference_id) == false)
                {
                    SetDecimalField(loan, body.LoanOutstandingBalance, "LoanOutstandingBalance",
                        "msfsi_principalamount", "msfsi_outstandingtotalamount");
                }
                else
                {
                    SetDecimalField(loan, body.LoanOutstandingBalance, "LoanOutstandingBalance",
                        "msfsi_outstandingtotalamount");
                }

                SetDatetimeField(loan, body.LoanMaturityDate, "LoanMaturityDate",
                    "msfsi_loanmaturitydate");

                SetDatetimeField(loan, body.LoanOriginationDate, "LoanOriginationDate",
                    "msfsi_loanstartdate");

                Guid loanId;
                if (string.IsNullOrEmpty(cr_reference_id))
                {
                    loan.Attributes.Add("msfsi_productfamilyid",
                        new CdsEntityReference("products", _familyId));

                    JObject settings;
                    var fileInfo = _environment.ContentRootFileProvider.GetFileInfo("appsettings.json");
                    using (var streamReader = new StreamReader(fileInfo.CreateReadStream()))
                    {
                        settings = JObject.Parse(streamReader.ReadToEnd());
                    }

                    var loanNumber = int.Parse(settings.Property("LastLoanNumber").Value.ToString()) + 1;
                    loan.Attributes["msfsi_number"] = loanNumber.ToString();

                    loanId = _cdsWebApi.Create("msfsi_financialproducts", loan);
                    settings.Property("LastLoanNumber").Value = loanNumber;

                    using (var streamWriter = new StreamWriter(fileInfo.PhysicalPath))
                    {
                        streamWriter.Write(settings.ToString());
                    }
                }
                else
                {
                    _cdsWebApi.Update("msfsi_financialproducts", loan);
                    loanId = loan.Id;
                }

                return new ConsumerLoanFulfillmentArrangementResponse()
                {
                    BankAccountingUnitReference = body.BankAccountingUnitReference,
                    BankBranchLocationReference = body.BankBranchLocationReference,
                    CollateralAllocation = body.CollateralAllocation,
                    CollateralReference = body.CollateralReference,
                    ConfigurationOptions = body.ConfigurationOptions,
                    CustomerAgreementReference = body.CustomerAgreementReference,
                    CustomerCommentary = body.CustomerCommentary,
                    CustomerCreditAssessmentReference = body.CustomerCreditAssessmentReference,
                    CustomerReference = body.CustomerReference,
                    DelinquencyCollectionReference = body.DelinquencyCollectionReference,
                    InsuranceReference = body.InsuranceReference,
                    InterestAccrualMethod = body.InterestAccrualMethod,
                    InterestType = body.InterestType,
                    InvolvedPartyObligationEntitlement = body.InvolvedPartyObligationEntitlement,
                    InvolvedPartyReference = body.InvolvedPartyReference,
                    LoanAccessTerms = body.LoanAccessTerms,
                    LoanAmount = body.LoanAmount,
                    LoanApplicableRate = body.LoanApplicableRate,
                    LoanCurrency = body.LoanCurrency,
                    LoanMaturityDate = body.LoanMaturityDate,
                    LoanOriginationDate = body.LoanOriginationDate,
                    LoanOutstandingBalance = body.LoanOutstandingBalance,
                    LoanRateType = body.LoanRateType,
                    LoanRepaymentSchedule = body.LoanRepaymentSchedule,
                    LoanStatus = "active",
                    LoanType = body.LoanType,
                    PartyReference = body.PartyReference,
                    ProductInstanceReference = loanId.ToString(),
                    RepaymentType = body.RepaymentType,
                    StagedRepaymentStatement = body.StagedRepaymentStatement,
                    TaxReference = body.TaxReference
                };
            });
        }

        private Guid ParseGuid(string rawId, string parameterName)
        {
            if (Guid.TryParse(rawId, out var id))
            {
                return id;
            }

            throw new Exception($"{rawId} is not a valid GUID. The URL parameter {parameterName} must be specified as a GUID.");
        }

        private void ValidateCurrencyIsUSD(params string[] currencies)
        {
            foreach(var currency in currencies)
            {
                if (string.IsNullOrEmpty(currency) == false &&
                    currency.ToLower().Trim() != "usd")
                {
                    throw new Exception("Only USD is accepeted for all currency fields.");
                }
            }
        }

        private CdsEntityReference FindBank(string payeeBankReference)
        {
            if (Guid.TryParse(payeeBankReference, out var bankId))
            {
                return new CdsEntityReference("msfsi_banks", bankId);
            }

            var matchingBank = _cdsWebApi.RetrieveMultiple("msfsi_banks",
                $@"<fetch top='1'>
                      <entity name='msfsi_bank'>
                        <attribute name='msfsi_bankid' />
                        <filter>
                          <condition attribute='msfsi_bankcode' operator='eq' value='{payeeBankReference}' />
                          <condition attribute='statecode' operator='eq' value='0' />
                        </filter>
                      </entity>
                    </fetch>").FirstOrDefault();

            if (matchingBank == null)
            {
                throw new Exception($"A bank could not be found for reference id {payeeBankReference}");
            }

            return new CdsEntityReference("msfsi_banks",
                Guid.Parse(matchingBank.Attributes["msfsi_bankid"].ToString()));
        }

        private decimal ParsePercentage(string rawPercentage, string paramterName)
        {
            if (decimal.TryParse(rawPercentage.Replace("%", ""), out var percentage) == false)
            {
                throw new Exception($"{paramterName} must be specified as a valid percentage.");
            }

            return percentage;
        }

        private void SetDecimalField(CdsEntity record, string decimalValue, string parameterName, string fieldName, params string[] additionalFieldNames)
        {
            if (string.IsNullOrEmpty(decimalValue) == false)
            {
                if (decimal.TryParse(decimalValue, out var parsedValue) == false)
                {
                    throw new Exception($"{parameterName} must be a valid decimal number.");
                }

                record.Attributes[fieldName] = parsedValue;

                foreach(var additionalField in additionalFieldNames)
                {
                    record.Attributes[additionalField] = parsedValue;
                }
            }
        }

        private void SetDatetimeField(CdsEntity record, string datetimeValue, string paramaterName, string fieldName)
        {
            if (string.IsNullOrEmpty(datetimeValue) == false)
            {
                if (DateTime.TryParse(datetimeValue, out var parsedValue) == false)
                {
                    throw new Exception($"{paramaterName} must be a validate date/time");
                }

                record.Attributes[fieldName] = parsedValue;
            }
        }

        private string FormatDateString(string rawDateValue)
        {
            if (string.IsNullOrEmpty(rawDateValue))
            {
                return null;
            }

            return DateTime.Parse(rawDateValue).ToString(_dateTimeFormat);
        }
    }
}
