var aprrovalCalled = false;
var matterList = "";

function _getServerUrl() 
{
	   var OrgServicePath = "/XRMServices/2011/Organization.svc/web";
	   var serverUrl = "";
	   if (typeof GetGlobalContext == "function") {
		   var context = GetGlobalContext();
		   serverUrl = context.getServerUrl();
	   }
	   else {
		   if (typeof Xrm.Page.context == "object") {
				 serverUrl = Xrm.Page.context.getServerUrl();
		   }
		   else
		   { throw new Error("Unable to access the server URL"); }
		   }
		  if (serverUrl.match(/\/$/)) {
			   serverUrl = serverUrl.substring(0, serverUrl.length - 1);
		   } 
		   return serverUrl + OrgServicePath;
}, 
   
function RetrieveMultipleRequest(entityName, entityNameId, entityId) 
{
	
	if(entityName == "new_ENTITY")
	{
		entityId = Xrm.Page.data.entity.getId();
	}
	
	var requestMain = ""
	requestMain += "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
	requestMain += "  <s:Body>";
	requestMain += "    <Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
	requestMain += "      <request i:type=\"a:RetrieveMultipleRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\">";
	requestMain += "        <a:Parameters xmlns:b=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
	requestMain += "          <a:KeyValuePairOfstringanyType>";
	requestMain += "            <b:key>Query</b:key>";
	requestMain += "            <b:value i:type=\"a:QueryExpression\">";
	requestMain += "              <a:ColumnSet>";
	requestMain += "                <a:AllColumns>true</a:AllColumns>";
	requestMain += "                <a:Columns xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">";
	requestMain += "                  <c:string>name</c:string>";
	requestMain += "                </a:Columns>";
	requestMain += "              </a:ColumnSet>";
	requestMain += "              <a:Criteria>";
	requestMain += "                <a:Conditions>";
	requestMain += "                  <a:ConditionExpression>";
	requestMain += "                    <a:AttributeName>"+ entityNameId + "</a:AttributeName>";
	requestMain += "                    <a:Operator>Equal</a:Operator>";
	requestMain += "                    <a:Values xmlns:c=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">";
	requestMain += "                      <c:anyType i:type=\"d:string\" xmlns:d=\"http://www.w3.org/2001/XMLSchema\">" + entityId + "</c:anyType>";
	requestMain += "                    </a:Values>";
	requestMain += "                  </a:ConditionExpression>";
	requestMain += "                </a:Conditions>";
	requestMain += "                <a:FilterOperator>And</a:FilterOperator>";
	requestMain += "                <a:Filters />";
	requestMain += "              </a:Criteria>";
	requestMain += "              <a:Distinct>false</a:Distinct>";
	requestMain += "              <a:EntityName>" + entityName + "</a:EntityName>";
	requestMain += "              <a:LinkEntities />";
	requestMain += "              <a:Orders />";
	requestMain += "              <a:PageInfo>";
	requestMain += "                <a:Count>0</a:Count>";
	requestMain += "                <a:PageNumber>0</a:PageNumber>";
	requestMain += "                <a:PagingCookie i:nil=\"true\" />";
	requestMain += "                <a:ReturnTotalRecordCount>false</a:ReturnTotalRecordCount>";
	requestMain += "              </a:PageInfo>";
	requestMain += "              <a:NoLock>false</a:NoLock>";
	requestMain += "            </b:value>";
	requestMain += "          </a:KeyValuePairOfstringanyType>";
	requestMain += "        </a:Parameters>";
	requestMain += "        <a:RequestId i:nil=\"true\" />";
	requestMain += "        <a:RequestName>RetrieveMultiple</a:RequestName>";
	requestMain += "      </request>";
	requestMain += "    </Execute>";
	requestMain += "  </s:Body>";
	requestMain += "</s:Envelope>";
	var req = new XMLHttpRequest();
	req.open("POST", _getServerUrl(), false)
	// Responses will return XML. It isn't possible to return JSON.
	req.setRequestHeader("Accept", "application/xml, text/xml, */*");
	req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
	req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
	var successCallback = null;
	var errorCallback = null;
	
	var result = "";
	req.onreadystatechange = function () 
	{ 
		result = SDK.SAMPLES.RetrieveMultipleResponse(req, successCallback, errorCallback, entityName); 
	};
	req.send(requestMain);
	
	return result;
}

function getInfo(entityName)
{
	if(Xrm.Page.getAttribute(entityName) && Xrm.Page.getAttribute(entityName).getValue())
	{
		var tempValue = Xrm.Page.getAttribute(entityName).getValue();
		if(tempValue.length >= 0)
		{
			var myId = Xrm.Page.getAttribute(entityName).getValue()[0].id;
			myList = RetrieveMultipleRequest("new_ENTITY", "new_ENTITYID", myId);
			myList = myList.split("|");
			if(myList && myList[1])
			{
				if(myList[3] == "true")
				{
					return 2;
				}
				else if(myList[1] == "1")
				{
					return 1;
				}
				else if(myList[1] == "0")
				{
					return 0;
				}
			}			
		}
	}		
	return -1;	
}

function setFieldVisibility(field, isVisible)
{
	var crm_field = Xrm.Page.getControl(field);
	crm_field.setVisible(isVisible);
}


		