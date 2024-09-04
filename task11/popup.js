function openInventoryProductPopup() {
    var pageInput = {
        pageType: "webresource",
        webresourceName: "cr651_html_inventory_products_popup"
    };
    var navigationOptions = {
        target: 2,
        width: 400, // value specified in pixel
        height: 400, // value specified in pixel
        position: 1,
        title: "Number of Clones"
    };

    Xrm.Navigation.navigateTo(pageInput,navigationOptions).then(
        function  success(){
            // console.log("success")
        },
        function error(){
            // console.log("error")
        }
    )
}