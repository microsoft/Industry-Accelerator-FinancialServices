using FinancialServicesAccelerator.BIAN.WebApi.Controllers;
using FinancialServicesAccelerator.BIAN.WebApi.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FinancialServicesAccelerator.BIAN.WebApi.Models;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace FinancialServicesAccelerator.BIAN.WebApi
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.Configure<
                CrmConnectionSettings>(Configuration.GetSection("CrmConnection"));

            var oauthSettingsSection = Configuration.GetSection("OAuth");
            var ouathSettings = new OAuthSettings()
            {
                ClientId = oauthSettingsSection.GetValue<string>("ClientId"),
                ClientSecret = oauthSettingsSection.GetValue<string>("ClientSecret"),
                Authority = oauthSettingsSection.GetValue<string>("Authority")
            };

            services.AddIdentityServer()
                .AddDeveloperSigningCredential()
                .AddInMemoryApiResources(OAuthConfig.GetApiResources())
                .AddInMemoryClients(OAuthConfig.GetClient(ouathSettings));

            // Configures the ability to authenticate against the OAuth Identity Server
            services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.Authority = ouathSettings.Authority;
                    options.RequireHttpsMetadata = false;
                    options.Audience = "apiAccess";
                });

            services.AddScoped<ICdsWebApi, CdsWebApi>();
            services.AddScoped<ICollateralAssetAdministrationController, CollateralAssetAdministrationControllerImplementation>();
            services.AddScoped<IConsumerLoanController, ConsumerLoanControllerImplementation>();
            services.AddScoped<HomeController>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseAuthentication();

            app.UseExceptionHandler(a => a.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerPathFeature>();
                var exception = feature.Error;

                var result = JsonConvert.SerializeObject(new { error = exception.Message });
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(result);
            }));

            if (env.IsDevelopment() == false)
            {
                app.UseHttpsRedirection();
                app.UseHsts();
            }

            app.UseIdentityServer();
            app.UseMvc();
        }
    }
}
