(() => {

    const app = angular.module('bikeStore', []);
    
    const datasource = 'https://raw.githubusercontent.com/jujhars13/jujhars13/master/bikes.json'; // datasource • JSON 
    const keyPrefixForStorage = "pl.fi."; // session store prefixed to all filter keys

    app.controller('bikeList', ['$scope', '$http', ($scope, $http) => {

        $http.get(datasource).then( response => {

            $scope.products = response.data.items;

            //  attributes list to filter our data • scalable 
            $scope.attributesToFilter = ["class"];

            // datafilters initialise  
            $scope.dataFilters = $scope.getDataFilters($scope.products, $scope.attributesToFilter);

            //  session storage set filters, to hold filters during page refresh
            $scope.setFilterStates($scope.dataFilters);

            // filter the bikes by chosen filters
            $scope.filteredProducts = $scope.filterProducts($scope.products, $scope.dataFilters);

        });

        /***
            bikes list dataFilters list            
            @param {any} products
            @param {any} attributesToFilter
            @returns the dataFilters
        ***/
        $scope.getDataFilters = (products, attributesToFilter) => {

            // data filters list
            const dataFilters = [];

            // loop through class the attributes to be filtered
            angular.forEach(attributesToFilter, (key) => {

                // check bikes class values against attibutes 
                angular.forEach(products, product => {
                    angular.forEach(product[key], value => {

                        const newFilterOption =
                            {
                                "key": key,
                                "value": value,
                                "state": false
                            };

                        // list  duplicates keys & values
                        const duplicates = dataFilters.filter(
                            filterOption =>
                                filterOption.key == newFilterOption.key
                                && filterOption.value == newFilterOption.value
                        );

                        // add to list if we have no duplicate filter option 
                        if (duplicates.length == 0) {
                            dataFilters.push(newFilterOption);
                        }

                    }, this);
                }, this);
            }, this);

            return dataFilters;
        }

        /***
            datafilter state Toogles              
            @param {any} key of filter toggle
            @param {any} value of filter toggle
        ***/
        $scope.toggleFilter = (key, value) => {

            // get correct state
            const filterToToggle = $scope.dataFilters.filter(
                filterOption =>
                    filterOption.key == key
                    && filterOption.value == value
            )[0];

            filterToToggle.state = !filterToToggle.state;

            // session storage toggled filter we will toggle 
            if (filterToToggle.state) {
                sessionStorage.setItem(
                    keyPrefixForStorage + 
                    filterToToggle.key + 
                    filterToToggle.value, 1);
            }
            else {
                sessionStorage.removeItem(
                    keyPrefixForStorage + 
                    filterToToggle.key + 
                    filterToToggle.value);
            }

            // filter bikes with selected filters
            $scope.filteredProducts = $scope.filterProducts($scope.products, $scope.dataFilters);
        }

        /***
            Filters a list of products in accordance to the supplied filters         
            @param {any} products
            @param {any} dataFilters
            @returns filtered products
        ***/
        $scope.filterProducts = (products, dataFilters) => {

            const filtersSelected = dataFilters.filter( filterOption => filterOption.state == true );

            // checking availabe filters
            if (filtersSelected.length > 0) {

                const filteredProducts = [];

                // loop through bikes
                angular.forEach(products, product => {

                    let productMissingAttribute = false;

                    // loop through filters
                    angular.forEach(filtersSelected, filterOption => {

                        // checking attributes for equal value 
                        let valueFound = product[filterOption.key].filter(
                            value =>
                                value == filterOption.value
                        ).length > 0;

                        // if no equivalent value filtered bikes will be unchanged
                        if (!valueFound) { productMissingAttribute = true; }

                    }, this);

                    // apend to filtered bike list
                    if (!productMissingAttribute) { filteredProducts.push(product); }

                }, true);

                // filtered bikes  
                return filteredProducts;
            }
            else {
                // return list of all bikes when no filter is applied 
                return products;
            }
        }


        /***
            session storage applied filters              
            @param {any} filterOptions
        ***/
        $scope.setFilterStates = filterOptions => {
            angular.forEach(filterOptions, filterOption => {
                if (sessionStorage.getItem(
                    keyPrefixForStorage + 
                    filterOption.key + 
                    filterOption.value) == '1') {
                    filterOption.state = true;
                }
            }, true);
        }

    }]);

})();



