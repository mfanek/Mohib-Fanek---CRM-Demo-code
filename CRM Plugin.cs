using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Microsoft.Xrm.Sdk.Query;
using System.Activities;
using Microsoft.Xrm.Sdk.Workflow;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;

using Microsoft.Crm.Sdk.Messages;

using System.Data.SqlClient;
using WM;

namespace WMCRM2
{
    public class CreateMultipleConferenceRoomRequests : CodeActivityBase
    {
        public CreateMultipleConferenceRoomRequests()
        {
            ;
        }

        protected override bool ExecuteBody(CodeActivityContext Execution)
        {
            string exceptionValueCapture = "";
            try
            {
                IWorkflowContext context = Execution.GetExtension<IWorkflowContext>();

                tracingService = Execution.GetExtension<ITracingService>();

                IOrganizationServiceFactory serviceFactory = Execution.GetExtension<IOrganizationServiceFactory>();

                service = serviceFactory.CreateOrganizationService(context.InitiatingUserId);

                Entity myEntity = (Entity)service.Retrieve
                    (
                        "new_INTERNAL_NAME"
                        , context.PrimaryEntityId
                        , new ColumnSet
                            (
                                "new_code" 
                                , "new_name"
                            )
                    );

                Entity actRequest = (Entity)service.Retrieve
                    (
                        "account"
                        , ((EntityReference)myEntity["new_code"]).Id
                        , new ColumnSet
                            (
                                "accountnumber"
                            )
                    );

                string thisParam = actRequest["accountnumber"].ToString();

                string SQLConnection = "Persist Security Info=False;Initial Catalog=Catalog;Data Source=Source;User ID=id;Password=id; Integrated Security=false;";
                wSQL msSQL = new wSQL(SQLConnection);

                msSQL.sql = "usp_mySP";
                msSQL.Parameters = new SqlParameter[]
                {
                    new SqlParameter("@param", thisParam)
                };
                string [,] exeResult = msSQL.executeEx();
                
                Entity noteEntity = new Entity("annotation");
                noteEntity.Attributes.Add("subject", "import result");
                noteEntity.Attributes.Add("notetext", exeResult[1,0]); 
                noteEntity.Attributes.Add("objectid", actRequest.ToEntityReference());
                service.Create(noteEntity);
                
                return true;
            }
            catch(Exception exp)
            {
                throw new InvalidPluginExecutionException(string.Format(">>>>Main: [{0}] [{1}] [{2}]<<<<", exceptionValueCapture, exp.StackTrace, exp.Message));
            }
            
        }

        private string getValue(string attribue, ref Entity crReq)
        {
            try
            {
                Dictionary<bool, crmValue> vals = new Dictionary<bool,crmValue>();
                vals.Add(true, new crmRealValue());
                vals.Add(false, new crmFakeValue());

                return vals[crReq.Attributes.Contains(attribue)].getValue(attribue, ref crReq);
            }
            catch(Exception exp)
            {
                throw new InvalidPluginExecutionException(string.Format("getValue: {0} {1}", attribue, exp.StackTrace));
            }
        }

        private string getSystemUserLoginNoDomain(string attribue, ref Entity crReq)
        {
            try
            {
                EntityReference systemUserRef = (EntityReference)crReq[attribue];

                Entity systemUser = (Entity)service.Retrieve
                    (
                        systemUserRef.LogicalName
                        , systemUserRef.Id
                        , new ColumnSet(true)
                    );

                return systemUser["domainname"].ToString().ToLower().Replace(@"myDomain\", "");
            }
            catch(Exception exp)
            {
                throw new InvalidPluginExecutionException(string.Format("getSystemUserLoginNoDomain: {0} {1} {2}", attribue, exp.StackTrace, exp.Message));
            }
            
        }

        private string getSystemUserName(string attribue, ref Entity crReq)
        {
            try
            {
                EntityReference systemUserRef = (EntityReference)crReq[attribue];

                Entity systemUser = (Entity)service.Retrieve
                    (
                        systemUserRef.LogicalName
                        , systemUserRef.Id
                        , new ColumnSet(true)
                    );

                return systemUser["fullname"].ToString().ToLower().Replace(@"myDomain\", "");
            }
            catch(Exception exp)
            {
                throw new InvalidPluginExecutionException(string.Format("getSystemUserName: {0} {1}", attribue, exp.StackTrace));
            }
        }

        private string getOptionSetText(string entityName, string attributeName, int optionsetValue)
        {
            string optionsetText = string.Empty;
            RetrieveAttributeRequest retrieveAttributeRequest = new RetrieveAttributeRequest();
            retrieveAttributeRequest.EntityLogicalName = entityName;
            retrieveAttributeRequest.LogicalName = attributeName;
            retrieveAttributeRequest.RetrieveAsIfPublished = true;

            RetrieveAttributeResponse retrieveAttributeResponse = 
                (RetrieveAttributeResponse)OrganizationService.Execute(retrieveAttributeRequest);
            PicklistAttributeMetadata picklistAttributeMetadata = 
                (PicklistAttributeMetadata)retrieveAttributeResponse.AttributeMetadata;

            OptionSetMetadata optionsetMetadata = picklistAttributeMetadata.OptionSet;

            foreach (OptionMetadata optionMetadata in optionsetMetadata.Options)
            {
                if (optionMetadata.Value == optionsetValue)
                {
                    optionsetText = optionMetadata.Label.UserLocalizedLabel.Label;
                    return optionsetText;
                }

            }
            return optionsetText;
        }

        private DateTime toDate(string strDate)
        {
            try
            {
                return Convert.ToDateTime(strDate);
            }
            catch(Exception exp)
            {
                return Convert.ToDateTime("1/1/1900 12:00AM");
            }
        }

        private IOrganizationService service;
        private ITracingService tracingService;
    }
}


