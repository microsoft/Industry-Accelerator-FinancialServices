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
    public class Person
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

					var person = new Entity("contact");

                    person["firstname"] = "Betty";
                    person["lastname"] = "Welch";
					person["msfsi_billpay"] = true;
					person["msfsi_chargestartdate"] = DateTime.UtcNow;
					person["msfsi_churnscore"] = 1m;
					person["parentcustomerid"] = new EntityReference("account", new Guid("{3DB68AE1-D9B9-440D-92CC-821CD251EB91}"));
					person["msfsi_creditscore"] = 5;
					person["msfsi_debtburdenratio"] = 1m;
					person["msfsi_defaultchargeaccountid"] = new EntityReference("msfsi_financialproduct", new Guid("{3DB68AE1-D9B9-440D-92CC-821CD251EB92}"));
					person["msfsi_delinquencyscore"] = 5;
					person["msfsi_delinquentamount"] = new Money(0);
					person["msfsi_directdeposit"] = true;
					person["msfsi_employerid"] = new EntityReference("account", new Guid(""));
					person["msfsi_employmentstatus"] = new OptionSetValue(); // 
					person["msfsi_enrollmentbranchid"] = new EntityReference("msfsi_branch", new Guid("{3DB68AE1-D9B9-440D-92CC-821CD251EB93}"));
					person["msdyn_gdproptout"] = true;
					person["msfsi_idexpirydate"] = DateTime.UtcNow;
					person["msfsi_idtype"] = new OptionSetValue(); // 
					person["msfsi_isminor"] = true;
					person["msfsi_monthlyincome"] = new Money(0);
					person["msfsi_monthlyliabilities"] = new Money(0);
					person["msdyn_orgchangestatus"] = new OptionSetValue(0); // No
					person["msfsi_placeofbirth"] = string.Empty;
					person["msfsi_preferredbranchid"] = new EntityReference("msfsi_branch", new Guid("{3DB68AE1-D9B9-440D-92CC-821CD251EB94}"));
					person["msfsi_profittier"] = new OptionSetValue(104800000); // High
					person["msfsi_residencystatus"] = new OptionSetValue(104800000); // Resident
					person["msfsi_residentincountrysince"] = DateTime.UtcNow;
					person["msfsi_totaldeposits"] = new Money(0);
					person["msfsi_totalloans"] = new Money(0);
					person["msfsi_visaexpiry"] = DateTime.UtcNow;
					person["msfsi_waivecharges"] = true;

					var id = _serviceProxy.Create(person);

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

                var app = new Person();
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
