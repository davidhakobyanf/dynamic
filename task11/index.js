<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
    <entity name="cr651_products">
        <attribute name="cr651_productsid"/>
        <attribute name="cr651_name"/>
        <order attribute="cr651_name" descending="false"/>
        <filter type="and">
            <condition attribute="cr651_productsid" operator="eq" uiname="Coca Cola" uitype="cr651_products"
                       value="{E31AA0E0-6C64-EF11-BFE2-000D3AD9C0C9}"/>
        </filter>
    </entity>
</fetch>