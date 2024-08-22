function testFunction(executionContext)
{
    var formContext = executionContext.getFormContext();
    var lookupValue = formContext.getAttribute('cr651_fk_product').getValue();
    if (lookupValue != null && lookupValue[0] != null) {
        var productName = lookupValue[0].name;
        formContext.getAttribute('cr651_name').setValue(productName);
    }
}
function togglePricePerUnitVisibility(executionContext) {
    var formContext = executionContext.getFormContext();
    var typeValues = formContext.getAttribute('cr651_os_type').getValue();
    var pricePerUnitControl = formContext.getControl('cr651_mon_price_per_unit');
    if (typeValues && Array.isArray(typeValues) && typeValues.includes(523250000)) {
        pricePerUnitControl.setVisible(true);
    } else {
        pricePerUnitControl.setVisible(false);
    }
}
function calculateTotalAmount(executionContext) {
    var formContext = executionContext.getFormContext();
    var quantity = formContext.getAttribute('cr651_int_quantity').getValue();
    var pricePerUnit = formContext.getAttribute('cr651_mon_price_per_unit').getValue();
    var totalAmount = 0;
    if (quantity !== null && pricePerUnit !== null) {
        totalAmount = quantity * pricePerUnit;
    }

    formContext.getAttribute('cr651_mon_total_amount').setValue(totalAmount);
    formContext.getControl('cr651_mon_total_amount').setDisabled(true);
}
function toggleFieldsBasedOnFormType(executionContext) {
    var formContext = executionContext.getFormContext();
    var formType = formContext.ui.getFormType();
    var controls = formContext.ui.controls.get();
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
