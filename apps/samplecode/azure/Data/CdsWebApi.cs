using FinancialServicesAccelerator.BIAN.WebApi.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FinancialServicesAccelerator.BIAN.WebApi.Data
{
    public class CdsWebApi : ICdsWebApi
    {
        private HttpClient _client;
        public CdsWebApi(IOptions<CrmConnectionSettings> crmConnection)
        {
            if (crmConnection != null)
            {
                _client = GetHttpClientWithToken(crmConnection.Value);
            }
        }

        private HttpClient GetHttpClientWithToken(CrmConnectionSettings settings)
        {
            string token = null;

            using (var authClient = new HttpClient())
            {
                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials"),
                    new KeyValuePair<string, string>("client_id", settings.ClientId),
                    new KeyValuePair<string, string>("client_secret", settings.ClientSecret),
                    new KeyValuePair<string, string>("resource", settings.Resource),
                });

                var response = authClient.PostAsync(settings.Authority, content);
                var decoded = response.Result.Content.ReadAsStringAsync().Result;
                var authResponse = JObject.Parse(decoded);

                token = authResponse.Property("access_token").Value.ToString();
            }

            var client = new HttpClient();
            client.BaseAddress = new Uri(settings.ApiUrl);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            return client;
        }

        public Guid Create(string entitySetName, CdsEntity record)
        {
            var response = _client.PostAsync($"{entitySetName}", new StringContent(record.ToJson(),
                Encoding.UTF8, "application/json"));

            HandleError(response);

            var value = response.Result.Headers.GetValues("OData-EntityId").First();
            return Guid.Parse(Regex.Matches(value, $"{response.Result.RequestMessage.RequestUri.AbsoluteUri}\\(([^\\)]+)").First().Groups.Last().Value);
        }

        public CdsEntity Retrieve(string entitySetName, Guid recordId, params string[] fields)
        {
           return Retrieve(entitySetName, recordId, null, fields);
        }

        public CdsEntity Retrieve(string entitySetName, Guid recordId, ExpandQuery expandQuery, params string[] fields)
        {
            var url = new StringBuilder($"{entitySetName}({recordId})");
            if (fields.Length == 1 && expandQuery == null)
            {
                url.Append($"/{fields[0]}");
            }
            else if (fields.Length > 0)
            {
                url.Append($"?$select={string.Join(",", fields)}");
            }
            
            if (expandQuery != null)
            {
                if (url.ToString().Contains("?$") == false)
                {
                    url.Append("?");
                }
                else
                {
                    url.Append("&");
                }

                url.Append($"$expand={expandQuery.LookupField}($select={string.Join(",", expandQuery.Fields)})");
            }

            using (var request = new HttpRequestMessage(HttpMethod.Get, url.ToString()))
            {
                request.Headers.Add("Prefer", "odata.include-annotations=OData.Community.Display.V1.FormattedValue");
                using (var response = _client.SendAsync(request))
                {
                    HandleError(response);

                    var decoded = response.Result.Content.ReadAsStringAsync().Result;
                    if (string.IsNullOrEmpty(decoded) && fields.Length == 1)
                    {
                        return new CdsEntity()
                        {
                            Id = recordId,
                            Attributes =
                            {
                                [fields[0]] = null
                            }
                        };
                    }

                    var result = JObject.Parse(decoded);

                    if (expandQuery == null && fields.Length == 1)
                    {
                        return new CdsEntity()
                        {
                            Id = recordId,
                            Attributes =
                            {
                                [fields[0]] = result.Property("value").Value.ToObject<object>()
                            }
                        };
                    }
                    else
                    {
                        var unusedFields = fields.ToHashSet();
                        return BuildEntity(result, unusedFields, recordId);
                    }
                }
            }
        }

        private CdsEntity BuildEntity(JObject rawRecord, HashSet<string> unusedFields = null, Guid? recordId = null)
        {
            var record = new CdsEntity();

            if (recordId.HasValue)
            {
                record.Id = recordId.Value;
            }

            foreach (var property in rawRecord.Properties())
            {
                if (property.Name.StartsWith("@odata.", StringComparison.InvariantCultureIgnoreCase))
                {
                    continue;
                }
                else if (property.Value is JObject)
                {
                    record.Attributes.Add(property.Name.ToLower(), BuildEntity((JObject)property.Value));
                    continue;
                }

                var value = property.Value.ToObject<object>();
                record.Attributes.Add(property.Name.ToLower(), value);

                unusedFields?.Remove(property.Name);
            }

            if (unusedFields != null)
            {
                foreach(var field in unusedFields)
                {
                    record.Attributes.Add(field, null);
                }
            }

            return record;
        }

        public IEnumerable<CdsEntity> RetrieveMultiple(string entitySetName, string fetchXml)
        {
            var response = _client.GetAsync($"{entitySetName}?fetchXml={Uri.EscapeDataString(fetchXml)}");

            HandleError(response);

            var decoded = response.Result.Content.ReadAsStringAsync().Result;
            var result = JObject.Parse(decoded);

            var records = new List<CdsEntity>();
            foreach(JObject record in (JArray)result.Property("value").Value)
            {
                records.Add(BuildEntity(record));
            }

            return records;
        }

        public void Update(string entitySetName, CdsEntity record)
        {
            var response = _client.PatchAsync($"{entitySetName}({record.Id})", new StringContent(record.ToJson(),
                Encoding.UTF8, "application/json"));

            HandleError(response);
        }


        private void HandleError(Task<HttpResponseMessage> response)
        {
            if (response.Result.StatusCode != HttpStatusCode.OK &&
                response.Result.StatusCode != HttpStatusCode.NoContent)
            {
                var decoded = response.Result.Content.ReadAsStringAsync().Result;
                var result = JObject.Parse(decoded);

                var errorMessage = ((JObject)result.Property("error")?.Value)?.Property("message")?.Value?.ToString();

                throw new Exception(errorMessage ?? response.Result.ToString());
            }
        }
    }

    public interface ICdsWebApi
    {
        Guid Create(string entitySetName, CdsEntity record);
        void Update(string entitySetName, CdsEntity record);
        CdsEntity Retrieve(string entitySetName, Guid recordId, params string[] fields);
        CdsEntity Retrieve(string entitySetName, Guid recordId, ExpandQuery expandQuery, params string[] fields);
        IEnumerable<CdsEntity> RetrieveMultiple(string entitySetName, string fetchXml);
    }

    public class CdsEntity
    {
        public Guid Id { get; set; }
        public Dictionary<string, object> Attributes { get; }

        public CdsEntity()
        {
            Attributes = new Dictionary<string, object>();
        }

        public string ToJson()
        {
            var stringBuilder = new StringBuilder();
            using (var writer = new JsonTextWriter(new StringWriter(stringBuilder)))
            {
                writer.WriteStartObject();

                foreach(var attribute in Attributes)
                {
                    if (attribute.Value is CdsEntityReference)
                    {
                        writer.WritePropertyName($"{attribute.Key}@odata.bind");
                        var entityReference = (CdsEntityReference)attribute.Value;
                        writer.WriteValue($"{entityReference.EntitySetName}({entityReference.Id})");
                        continue;
                    }

                    writer.WritePropertyName(attribute.Key);
                    if (attribute.Value is DateTime)
                    {
                        writer.WriteValue(((DateTime)attribute.Value).ToUniversalTime().ToString("o"));
                    }
                    else
                    {
                        writer.WriteValue(attribute.Value);
                    }
                }

                writer.WriteEndObject();
                writer.Flush();
            }

            return stringBuilder.ToString();
        }
    }

    public class CdsEntityReference
    {
        public Guid Id { get; set; }
        public string EntitySetName { get; set; }

        public CdsEntityReference(string entitySetName, Guid id)
        {
            EntitySetName = entitySetName;
            Id = id;
        }
    }

    public class ExpandQuery
    {
        public string LookupField { private set; get; }
        public string[] Fields { private set; get; }

        public ExpandQuery(string lookupField, params string[] fields)
        {
            LookupField = lookupField;
            Fields = fields;
        }
    }
}
