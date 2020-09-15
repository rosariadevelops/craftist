(function () {
    new Vue({
        el: 'main', // DOM elements outside of main will not be touched by Vue
        data: {
            heading: 'Latest Images',
            images: [],
            // these data properties will store values of input fields
            title: '',
            desc: '',
            username: '',
            file: null,
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

        methods: {
            handleClick: function (e) {
                e.preventDefault;
                console.log('this: ', this);
                // form data is exclusively for sending a file to the server
                var formData = new formData();
                formData.append('title', this.title);
                formData.append('desc', this.desc);
                formData.append('username', this.username);
                formData.append('file', this.file);
                // now we want to send all this info to the server when we handleClick
                axios
                    .post('/upload', formData)
                    .then(function (response) {
                        console.log('response from form POST /upload: ', response);
                    })
                    .catch(function (err) {
                        console.log('err in form POST /upload: ', err);
                    });
            },
            handleChange: function (e) {
                console.log('file: ', e.target.files[0]);
                // this targets the file selected itself
                // this will fire as soon as we select an image
                this.file = e.target.files[0];
            },
        },
    }); // Closes Vue
})(); // IIFE
