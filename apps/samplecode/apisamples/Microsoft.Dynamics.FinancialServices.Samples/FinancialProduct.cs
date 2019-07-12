// =====================================================================
//  This file is part of the Microsoft Dynamics Accelerator code samples.
//
//  Copyright (C) Microsoft Corporation.  All rights reserved.
//
//  This source code is intended only as a supplement to Microsoft
//  Development Tools and/or on-line documentation.  See these other
//  materials for detailed information regarding Microsoft code samples.
//
//  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
//  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
//  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//  PARTICULAR PURPOSE.
// =====================================================================

using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.ServiceModel;
using System.ServiceModel.Description;

namespace Microsoft.Dynamics.FinancialServices.Samples
{
    public class FinancialProduct
    {

        #region Class Level Members

        /// <summary>
        /// Stores the organization service proxy.
        /// </summary>
        private OrganizationServiceProxy _serviceProxy;

        #endregion Class Level Members

        #region How To Sample Code
        /// <summary>
        /// Create and configure the organization service proxy.
        /// Initiate the method to create any data that this sample requires.
        /// Create an appointment.
        /// </summary>
        public void Run(ServerConnection.Configuration serverConfig, bool promptforDelete)
        {
            try
            {
                //<snippetMarketingAutomation1>
                // Connect to the Organization service. 
                // The using statement assures that the service proxy will be properly disposed.
                using (_serviceProxy = new OrganizationServiceProxy(serverConfig.OrganizationUri, serverConfig.HomeRealmUri, serverConfig.Credentials, serverConfig.DeviceCredentials))
                {
                    // This statement is required to enable early-bound type support.
                    _serviceProxy.EnableProxyTypes();

					var financialproduct = new Entity("msfsi_financialproduct");

					financialproduct["msfsi_availablebalance"] = new Money(100000);
					financialproduct["msfsi_averagebalance"] = new Money(110000);
					financialproduct["msfsi_balanceatmaturity"] = new Money(0);
					financialproduct["msfsi_blockedamount"] = new Money(0);
					financialproduct["msfsi_bookbalance"] = new Money(1560);
					financialproduct["msfsi_branchid"] = new EntityReference("msfsi_branch", new Guid("{5425D36C-354B-4362-8B4A-119EA8E0AC67}"));
					financialproduct["msfsi_capitalarrears"] = new Money(0);
					financialproduct["msfsi_collectionrisk"] = new OptionSetValue(104800000); // Low
					financialproduct["msfsi_customerid"] = new EntityReference("account", new Guid("{5425D36C-354B-4362-8B4A-119EA8E0AC68}"));
					financialproduct["msfsi_dayspastdue"] = 0;
					financialproduct["msfsi_debttype"] = new OptionSetValue(104800000); // Short Term
					financialproduct["msfsi_delinquencystatus"] = new OptionSetValue(104800000); // Delinquent
					financialproduct["msfsi_disbursedamount"] = new Money(50000);
					financialproduct["msfsi_disbursementdate"] = DateTime.UtcNow;
					financialproduct["msfsi_initialdeposit"] = new Money(0);
					financialproduct["msfsi_initialdepositsource"] = string.Empty;
					financialproduct["msfsi_installmentamount"] = new Money(120);
					financialproduct["msfsi_interestamount"] = new Money(20);
					financialproduct["msfsi_interestarrears"] = new Money(0);
					financialproduct["msfsi_interestrate"] = 4m;
					financialproduct["msfsi_issyndicated"] = true;
					financialproduct["msfsi_jointtype"] = new OptionSetValue(104800000); // Single
					financialproduct["msfsi_lastpaymentamount"] = new Money(120);
					financialproduct["msfsi_lastpaymentdate"] = DateTime.UtcNow;
					financialproduct["msfsi_limitid"] = new EntityReference("msfsi_limit", new Guid("{5425D36C-354B-4362-8B4A-119EA8E0AC61}"));
					financialproduct["msfsi_loanmaturitydate"] = DateTime.UtcNow.AddYears(3);
					financialproduct["msfsi_loanstartdate"] = DateTime.UtcNow;
					financialproduct["msfsi_loantype"] = new OptionSetValue(104800000); // New
					financialproduct["msfsi_maturitydate"] = DateTime.UtcNow.AddYears(3);
					financialproduct["msfsi_maturityinstructionsdetails"] = string.Empty;
					financialproduct["msfsi_modeofpayment"] = new OptionSetValue(104800000); // Standing Order
					financialproduct["msfsi_nextpaymentamount"] = new Money(120);
					financialproduct["msfsi_nextpaymentdate"] = DateTime.UtcNow.AddDays(30);
					financialproduct["msfsi_number"] = "548956";
                    financialproduct["msfsi_numberofdeferralsmade"] = 0;
					financialproduct["msfsi_numberofinstallmentspaid"] = 1;
					financialproduct["msfsi_openingdate"] = DateTime.UtcNow;
					financialproduct["msfsi_outstandingprincipalamount"] = new Money(0);
					financialproduct["msfsi_outstandingtotalamount"] = new Money(3500);
					financialproduct["msfsi_overdraftlimit"] = new Money(0);
					financialproduct["msfsi_overdraftrate"] = 15m;
					financialproduct["msfsi_overduedate"] = DateTime.UtcNow.AddDays(31);
					financialproduct["msfsi_overdueinstallmentamount"] = new Money(0);
					financialproduct["msfsi_principalamount"] = new Money(3000);
					financialproduct["msfsi_productid"] = new EntityReference("product", new Guid("{5425D36C-354B-4362-8B4A-119EA8E0AC62}"));
					financialproduct["msfsi_productfamilyid"] = new EntityReference("product", new Guid("{5425D36C-354B-4362-8B4A-119EA8E0AC63}"));
					financialproduct["msfsi_projectedinterestamount"] = new Money(2000);
					financialproduct["msfsi_purposeofloan"] = string.Empty;
					financialproduct["msfsi_rate"] = 4m;
					financialproduct["msfsi_sourceoffunds"] = string.Empty;
					financialproduct["msfsi_term"] = 3;
					financialproduct["msfsi_totalarrear"] = new Money(0);
					financialproduct["msfsi_totalinterestpaid"] = new Money(20);
					financialproduct["msfsi_unclearedbalance"] = new Money(0);
					financialproduct["msfsi_unsecuredamount"] = new Money(0);

					var id = _serviceProxy.Create(financialproduct);

					// Verify that the record has been created.
                    if (id != Guid.Empty)
                    {
                        Console.WriteLine($"Succesfully created {id}.");
                    }
                }
            }
            // Catch any service fault exceptions that Microsoft Dynamics CRM throws.
            catch (FaultException<Microsoft.Xrm.Sdk.OrganizationServiceFault>)
            {
                // You can handle an exception here or pass it back to the calling method.
                throw;
            }
        }

        #endregion How To Sample Code       


        #region Main Method

        /// <summary>
        /// Standard Main() method used by most SDK samples.
        /// </summary>
        /// <param name="args"></param>
        static public void Main(string[] args)
        {
            try
            {
                // Obtain the target organization's Web address and client logon 
                // credentials from the user.
                ServerConnection serverConnect = new ServerConnection();
                ServerConnection.Configuration config = serverConnect.GetServerConfiguration();

                var app = new FinancialProduct();
                app.Run(config, true);
            }
            catch (FaultException<Microsoft.Xrm.Sdk.OrganizationServiceFault> ex)
            {
                Console.WriteLine("The application terminated with an error.");
                Console.WriteLine("Timestamp: {0}", ex.Detail.Timestamp);
                Console.WriteLine("Code: {0}", ex.Detail.ErrorCode);
                Console.WriteLine("Message: {0}", ex.Detail.Message);
                Console.WriteLine("Plugin Trace: {0}", ex.Detail.TraceText);
                Console.WriteLine("Inner Fault: {0}",
                    null == ex.Detail.InnerFault ? "No Inner Fault" : "Has Inner Fault");
            }
            catch (System.TimeoutException ex)
            {
                Console.WriteLine("The application terminated with an error.");
                Console.WriteLine("Message: {0}", ex.Message);
                Console.WriteLine("Stack Trace: {0}", ex.StackTrace);
                Console.WriteLine("Inner Fault: {0}",
                    null == ex.InnerException.Message ? "No Inner Fault" : ex.InnerException.Message);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine("The application terminated with an error.");
                Console.WriteLine(ex.Message);

                // Display the details of the inner exception.
                if (ex.InnerException != null)
                {
                    Console.WriteLine(ex.InnerException.Message);

                    FaultException<Microsoft.Xrm.Sdk.OrganizationServiceFault> fe = ex.InnerException
                        as FaultException<Microsoft.Xrm.Sdk.OrganizationServiceFault>;
                    if (fe != null)
                    {
                        Console.WriteLine($"Timestamp: {0}", fe.Detail.Timestamp);
                        Console.WriteLine($"Code: {0}", fe.Detail.ErrorCode);
                        Console.WriteLine($"Message: {0}", fe.Detail.Message);
                        Console.WriteLine($"Plugin Trace: {0}", fe.Detail.TraceText);
                        Console.WriteLine($"Inner Fault: {0}",
                            null == fe.Detail.InnerFault ? "No Inner Fault" : "Has Inner Fault");
                    }
                }
            }
            // Additional exceptions to catch: SecurityTokenValidationException, ExpiredSecurityTokenException,
            // SecurityAccessDeniedException, MessageSecurityException, and SecurityNegotiationException.

            finally
            {
                Console.WriteLine("Press <Enter> to exit.");
                Console.ReadLine();
            }
        }
        #endregion Main method

    }
}
