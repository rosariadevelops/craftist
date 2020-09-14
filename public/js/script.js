(function () {
    new Vue({
        el: 'main', // DOM elements outside of main will not be touched by Vue
        data: {
            heading: 'Latest Images',
            images: [],
        },
        mounted: function () {
            var that = this;
            axios
                .get('/images')
                .then(function (res) {
                    console.log('res: ', res);
                    that.images = res.data.images;
                })
                .catch(function (err) {
                    console.log('err in GET /images: ', err);
                });
        },
    }); // Closes Vue
})(); // IIFE
