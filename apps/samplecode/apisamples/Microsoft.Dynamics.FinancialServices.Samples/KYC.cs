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
    public class KYC
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

					var kyc = new Entity("msfsi_kyc");

					kyc["msfsi_additionalnationality"] = string.Empty;
					kyc["msfsi_businesslicenseexpirydate"] = DateTime.UtcNow.AddYears(1);
					kyc["msfsi_businesslicensenumber"] = "545661";
                    kyc["msfsi_controllinguscitizenortaxresident"] = false;
					kyc["msfsi_countryofbirth"] = "US";
					kyc["msfsi_countryofresidence"] = "US";
					kyc["msfsi_customerid"] = new EntityReference("account", new Guid("{E643D909-C768-4200-A5E7-F8C8A5A4A5E0}"));
					kyc["msfsi_dateofbirth"] = DateTime.UtcNow.AddYears(-30);
					kyc["msfsi_email"] = "example@contoso.com";
					kyc["msfsi_firstname"] = "Betty";
					kyc["msfsi_idexpirydate"] = DateTime.UtcNow.AddYears(3);
					kyc["msfsi_idnumber"] = "S530-4609-8130";
                    kyc["msfsi_idtype"] = new OptionSetValue(-1); // Default value
					kyc["msfsi_kyccountry"] = "US";
					kyc["msfsi_kycpreparedon"] = DateTime.UtcNow;
					kyc["msfsi_lastname"] = "Welch";
                    kyc["msfsi_middlename"] = string.Empty;
					kyc["msfsi_mobilenumber"] = "+1 (312) 555-5555";
					kyc["msfsi_name"] = "Betty Welch April 2019";
					kyc["msfsi_nationality"] = "American";
					kyc["msfsi_natureofbusiness"] = "Food and Drink";
					kyc["msfsi_phonenumber"] = "+1 (312) 555-5555";
					kyc["msfsi_placeofbirth"] = "US";
					kyc["msfsi_primarycontact"] = new EntityReference("contact", new Guid("{E643D909-C768-4200-A5E7-F8C8A5A4A5E1}"));
					kyc["msfsi_reviewfrequency"] = new OptionSetValue(104800000); // Monthly
					kyc["msfsi_risklevel"] = new OptionSetValue(104800000); // Low

					var id = _serviceProxy.Create(kyc);

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

                var app = new KYC();
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
