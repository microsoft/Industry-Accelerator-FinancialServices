using FinancialServicesAccelerator.BIAN.WebApi.Models;
using IdentityServer4.Models;
using System.Collections.Generic;

namespace FinancialServicesAccelerator.BIAN.WebApi
{
    public class OAuthConfig
    {
        public static IEnumerable<ApiResource> GetApiResources()
        {
            return new List<ApiResource>
            {
                new ApiResource("apiAccess", "API Access")
            };
        }

        public static IEnumerable<Client> GetClient(OAuthSettings settings)
        {
            return new List<Client>()
            {
                new Client
                {
                    AllowedGrantTypes = GrantTypes.ClientCredentials,
                    AllowedScopes = { "apiAccess" },
                    ClientId = settings.ClientId,
                    ClientSecrets =
                    {
                        new Secret(settings.ClientSecret.Sha256())
                    }
                }
            };
        }
    }
}
