function testFunction(executionContext)
{
    let formContext = executionContext.getFormContext();
    let lookupValue = formContext.getAttribute('cr651_fk_product').getValue();
    if (lookupValue != null && lookupValue[0] != null) {
        let productName = lookupValue[0].name;
        formContext.getAttribute('cr651_name').setValue(productName);
    }
}
function togglePricePerUnitVisibility(executionContext) {
    let formContext = executionContext.getFormContext();
    let typeValues = formContext.getAttribute('cr651_os_type').getValue();
    let pricePerUnitControl = formContext.getControl('cr651_mon_default_price_per_unit');
    if (pricePerUnitControl && typeValues && Array.isArray(typeValues) && typeValues.includes(523250000)) {
        pricePerUnitControl.setVisible(true);
    } else {
        pricePerUnitControl.setVisible(false);
    }
}
function calculateTotalAmount(executionContext) {
    let formContext = executionContext.getFormContext();
    let quantity = formContext.getAttribute('cr651_int_quantity').getValue();
    let pricePerUnit = formContext.getAttribute('cr651_mon_price_per_unit').getValue();
    let totalAmount = 0;
    if (quantity !== null && pricePerUnit !== null) {
        totalAmount = quantity * pricePerUnit;
    }

    formContext.getAttribute('cr651_mon_total_amount').setValue(totalAmount);
    formContext.getControl('cr651_mon_total_amount').setDisabled(true);
}
function toggleFieldsBasedOnFormType(executionContext) {
    let formContext = executionContext.getFormContext();
    let formType = formContext.ui.getFormType();
    let controls = formContext.ui.controls.get();
    if (formType === 2) {
        controls.forEach(function (control) {
            control.setDisabled(true);
        });
    }
    else if (formType === 1) {
        controls.forEach(function (control) {
            control.setDisabled(false);
        });
    }
}
async function onLoadCurrency(executionContext) {
    let formContext = executionContext.getFormContext();
    let lookupValue = formContext.getAttribute('cr651_fk_inventory').getValue();
    if (lookupValue && lookupValue[0]) {
        let recordId = lookupValue[0].id;

        if (!recordId) {
            console.log("This is a new record, the script will not run.");
            return;
        }

        try {
            // FetchXML to retrieve related Price List IDs and transactioncurrencyid
            let fetchXml = `
               <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
<entity name="cr651_inventory">
<attribute name="cr651_inventoryid"/>
<attribute name="cr651_name"/>
<order attribute="cr651_name" descending="false"/>
<filter type="and">
<condition attribute="cr651_inventoryid" operator="eq" uiname="w1" uitype="cr651_inventory" value="${recordId}"/>
</filter>
<link-entity name="cr651_pricelist" from="cr651_pricelistid" to="cr651_fk_price_list" link-type="inner" alias="aa">
<attribute name="transactioncurrencyid"/>
</link-entity>
</entity>
</fetch>
               `

            let encodedFetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
            let inventoryResults = await Xrm.WebApi.retrieveMultipleRecords('cr651_inventory', encodedFetchXml);
            if (inventoryResults.entities.length > 0) {
                let transactionCurrencyId  = [
                    {
                        id: inventoryResults.entities[0][`aa.transactioncurrencyid`],
                        name:inventoryResults.entities[0][`aa.transactioncurrencyid@OData.Community.Display.V1.FormattedValue`],
                        entityType:inventoryResults.entities[0][`aa.transactioncurrencyid@Microsoft.Dynamics.CRM.lookuplogicalname`],
                    }
                ];

                formContext.getAttribute('transactioncurrencyid').setValue(transactionCurrencyId);
            } else {
                alert("Currency ID not found in any Price List.");
            }
        }
        catch
            (error)
        {
            alert("Error retrieving records: " + error.message);
            console.error(error);
        }
    }
}
async function onLoadPricePerUnit(executionContext) {
    let formContext = executionContext.getFormContext();
    let lookupValue = formContext.getAttribute('cr651_fk_product').getValue();
    if (lookupValue && lookupValue[0]) {
        let recordId = lookupValue[0].id;
        if (!recordId) {
            console.log("This is a new record, the script will not run.");
            return;
        }

        let pricePerUnit;

        try {
            // Attempt to retrieve Price Per Unit from cr651_price_list_item
            let fetchXml = `
                <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">
                    <entity name="cr651_price_list_item">
                        <attribute name="cr651_price_list_itemid"/>
                        <attribute name="cr651_mon_price_per_unit"/>
                        <order attribute="cr651_mon_price_per_unit" descending="false"/>
                        <filter type="and">
                            <condition attribute="cr651_fk_product" operator="eq" value="${recordId}"/>
                        </filter>
                    </entity>
                </fetch>
            `;

            let encodedFetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
            let inventoryResults = await Xrm.WebApi.retrieveMultipleRecords('cr651_price_list_item', encodedFetchXml);
            if (inventoryResults.entities.length > 0) {
                pricePerUnit = inventoryResults.entities[0]["cr651_mon_price_per_unit"];
                console.log("Price from Price List Item: ", pricePerUnit);
            } else {
                throw new Error("No price found in Price List Item. Falling back to default price.");
            }
        } catch (error) {
            console.warn(error.message);
            try {
                // Fallback to retrieve Price Per Unit from cr651_products
                let fetchXml = `
                    <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
<entity name="cr651_products">
<attribute name="cr651_productsid"/>
<attribute name="cr651_name"/>
<attribute name="cr651_mon_default_price_per_unit"/>
<order attribute="cr651_name" descending="false"/>
<filter type="and">
<condition attribute="cr651_productsid" operator="eq" uitype="cr651_products" value="${recordId}"/>
</filter>
</entity>
</fetch>
                `;

                let encodedFetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
                let inventoryResults = await Xrm.WebApi.retrieveMultipleRecords('cr651_products', encodedFetchXml);
                if (inventoryResults.entities.length > 0) {
                    pricePerUnit = inventoryResults.entities[0]["cr651_mon_default_price_per_unit"];
                    console.log("Default Price from Products: ", pricePerUnit);
                } else {
                    alert("Price not found in default settings.");
                }
            } catch (fallbackError) {
                alert("Error retrieving records: " + fallbackError.message);
                console.error(fallbackError);
            }
        }

        // Set the retrieved pricePerUnit to the form field if it was found
        if (pricePerUnit !== undefined) {
            let priceField = formContext.getAttribute('cr651_mon_price_per_unit');
            priceField.setValue(pricePerUnit);
        }
    }
}
async function onLoadPriceList(executionContext) {
    let formContext = executionContext.getFormContext();
    let lookupValue = formContext.getAttribute('cr651_fk_price_list').getValue();
    if (lookupValue && lookupValue[0]) {
        let recordId = lookupValue[0].id;

        if (!recordId) {
            console.log("This is a new record, the script will not run.");
            return;
        }

        try {
            // FetchXML to retrieve related Price List IDs and transactioncurrencyid
            let fetchXml = `
               <fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
<entity name="cr651_pricelist">
<attribute name="cr651_pricelistid"/>
<attribute name="cr651_name"/>
<attribute name="transactioncurrencyid"/>
<order attribute="cr651_name" descending="false"/>
<filter type="and">
<condition attribute="cr651_pricelistid" operator="eq" value="${recordId}"/>
</filter>
</entity>
</fetch>

               `

            let encodedFetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
            let inventoryResults = await Xrm.WebApi.retrieveMultipleRecords('cr651_pricelist', encodedFetchXml);

            if (inventoryResults.entities.length > 0) {
                let transactionCurrencyId  = [
                    {
                        id: inventoryResults.entities[0][`_transactioncurrencyid_value`],
                        name:inventoryResults.entities[0][`_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue`],
                        entityType:inventoryResults.entities[0][`_transactioncurrencyid_value@Microsoft.Dynamics.CRM.lookuplogicalname`],
                    }
                ];

                formContext.getAttribute('transactioncurrencyid').setValue(transactionCurrencyId);
            } else {
                alert("Currency ID not found in any Price List.");
            }
        }
        catch
            (error)
        {
            alert("Error retrieving records: " + error.message);
            console.error(error);
        }
    }
}
