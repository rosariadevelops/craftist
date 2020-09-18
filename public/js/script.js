(function () {
    Vue.component('modal-component', {
        template: '#modal-component',
        props: ['cardId'], // always an array
        data: function () {
            return {
                heading: 'components are whack',
                title: '',
                desc: '',
                date: '',
                username: '',
                url: '',
                comment: '',
                uname: '',
                comments: [],
            };
        },
        mounted: function () {
            var that = this;
            //console.log('handleModal that: ', that);
            axios
                .get('/comments/' + that.cardId)
                .then(function (res) {
                    //console.log('GET /comments result: ', res);
                    that.comments = res.data.comments;
                })
                .catch(function (err) {
                    console.log('err in GET /comments: ', err);
                });

            axios
                .get('/image/' + that.cardId)
                .then(function (resp) {
                    //console.log('resp: ', resp.data);
                    that.title = resp.data.modalTitle;
                    that.username = resp.data.modalUsername;
                    that.desc = resp.data.modalDesc;
                    that.url = resp.data.modalURL;
                    that.date = resp.data.modalDate;
                })
                .catch(function (err) {
                    console.log('err in GET /images: ', err);
                });
        },
        // can add event listeners
        methods: {
            handleComments: function (e) {
                e.preventDefault;
                //console.log('this: ', this);

                var that = this;
                //console.log('that: ', that);

                var commentData = {
                    comment: that.comment,
                    uname: that.uname,
                    id: that.cardId,
                };

                axios
                    .post('/comments', commentData)
                    .then(function (response) {
                        //console.log('post comment response: ', response.data.comments);
                        var latestComment = response.data.comments;
                        that.comments.unshift(latestComment);
                        //console.log('response from form POST /upload: ', response);
                    })
                    .catch(function (err) {
                        console.log('err in comment POST /comment: ', err);
                    });
            },
            closeModal: function (e) {
                e.preventDefault();
                this.$emit('close');
            },
        },
    });

    new Vue({
        el: 'main', // DOM elements outside of main will not be touched by Vue
        data: {
            // props
            heading: 'Latest Images',
            images: [],
            showModal: false,
            cardId: null,
            // these data properties will store values of input fields
            title: '',
            desc: '',
            username: '',
            file: null,
            numOfImages: '',
            lastImageId: '',
        },
        mounted: function () {
            var that = this;
            axios
                .get('/images')
                .then(function (res) {
                    that.images = res.data.images;
                    that.numOfImages = res.data.images.length;
                })
                .catch(function (err) {
                    console.log('err in GET /images: ', err);
                });
        },

        methods: {
            handleUpload: function (e) {
                e.preventDefault;
                //console.log('this: ', this);
                // form data is exclusively for sending a file to the server
                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('desc', this.desc);
                formData.append('username', this.username);
                formData.append('file', this.file);
                // now we want to send all this info to the server when we handleClick
                var that = this;
                axios
                    .post('/upload', formData)
                    .then(function (response) {
                        //console.log('response: ', response.data.image);
                        var latest = response.data.image;
                        that.images.unshift(latest);
                        //console.log('response from form POST /upload: ', response);
                    })
                    .catch(function (err) {
                        console.log('err in form POST /upload: ', err);
                    });
            },
            handleChange: function (e) {
                //console.log('e.target.file: ', e.target.files[0]);
                this.file = e.target.files[0];
            },
            // DELETE HANDLE MODAL FOR PART 4
            handleModal: function (id) {
                this.showModal = true;
                this.cardId = id;
            },
            closeModal: function () {
                this.showModal = false;
            },
            loadMore: function (e) {
                e.preventDefault;
                var that = this;

                var lastImageShown = that.images.slice().pop();
                //console.log('lastImageShown: ', lastImageShown);
                var lastImageId = lastImageShown.id;
                //console.log('lastImageId: ', lastImageId);

                axios
                    .get('/images/' + lastImageId)
                    .then(function (response) {
                        var updateImages = response.data.newImages;

                        for (var i = 0; i < updateImages.length; ++i) {
                            that.images.push(updateImages[i]);
                        }
                        //console.log('that.images: ', that.images);
                        var lastLowestId = that.images.slice().pop();
                        //console.log('lastLowestId.id: ', lastLowestId.lowestId);
                        //console.log('lastImageId: ', lastImageId);
                        if (lastImageId === lastLowestId.lowestId) {
                            console.log('it is the same!');
                            var lmButton = document.getElementById('load-more');
                            lmButton.style.visibilty = 'hidden';
                            lmButton.style.opacity = '0';
                        }
                    })
                    .catch(function (err) {
                        console.log('err in comment POST /images: ', err);
                    });
            },
        },
    }); // Closes Vue
})(); // IIFE
