(function () {
    //var lmButton = document.getElementById('load-more');

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
                    var lastImageShown = that.images.slice(-1)[0];
                    that.lastImageId = lastImageShown.id;
                    console.log('lastImageId: ', that.lastImageId);
                })
                .catch(function (err) {
                    console.log('err in GET /images: ', err);
                });

            /* var moreImages = {
                lastImageId,
            }; */

            /* axios
                .get('/images/more')
                .then(function (res) {
                    console.log('GET /images/more result: ', res);
                    //that.comments = res.data.comments;
                })
                .catch(function (err) {
                    console.log('err in GET /comments: ', err);
                }); */
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
                //console.log('lm that: ', that);
                //var lastImageShown = that.images.slice(-1)[0];
                //var lastImageId = lastImageShown.id;

                /* axios
                    .post('/images/more', moreImages)
                    .then(function (res) {
                        console.log('/images res: ', res);
                        that.images = res.data.images;
                        that.numOfImages = res.data.images.length;
                    })
                    .catch(function (err) {
                        console.log('err in POST /images: ', err);
                    }); */

                //console.log('that.lastImageId: ', that.lastImageId);
                /* var moreImages = {
                    lastImageId: that.lastImageId,
                }; */

                axios
                    .get('/images/' + that.lastImageId)
                    .then(function (response) {
                        console.log('post more response: ', response);
                        var updateImages = response.data.newImages;
                        console.log('updateImages[0]: ', updateImages[0]);
                        console.log('updateImages[1]: ', updateImages[1]);
                        console.log('updateImages[2]: ', updateImages[2]);
                        that.images.push(updateImages[0]);
                        that.images.push(updateImages[1]);
                        that.images.push(updateImages[2]);
                        console.log('response from GET more: ', that.images);
                    })
                    .catch(function (err) {
                        console.log('err in comment POST /images: ', err);
                    });
            },
        },
    }); // Closes Vue
})(); // IIFE
