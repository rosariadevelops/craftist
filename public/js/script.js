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
                next: '',
                prev: '',
                file: null,
            };
        },
        mounted: function () {
            var that = this;
            axios
                .get('/comments/' + that.cardId)
                .then(function (res) {
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
                    that.next = resp.data.modalPrev;
                    that.prev = resp.data.modalNext;
                })
                .catch(function (err) {
                    console.log('err in GET /images: ', err);
                });
        },

        watch: {
            cardId: function () {
                //console.log('watcher has noticed imageId has changed');

                var that = this;
                axios
                    .get('/comments/' + that.cardId)
                    .then(function (res) {
                        that.comments = res.data.comments;
                    })
                    .catch(function (err) {
                        console.log('err in GET /comments: ', err);
                    });

                axios
                    .get('/image/' + that.cardId)
                    .then(function (resp) {
                        that.title = resp.data.modalTitle;
                        that.username = resp.data.modalUsername;
                        that.desc = resp.data.modalDesc;
                        that.url = resp.data.modalURL;
                        that.date = resp.data.modalDate;
                        that.next = resp.data.modalPrev;
                        that.prev = resp.data.modalNext;
                    })
                    .catch(function (err) {
                        console.log('err in GET /images: ', err);
                    });
            },
        },

        // can add event listeners
        methods: {
            handleComments: function (e) {
                e.preventDefault;
                var that = this;

                var commentData = {
                    comment: that.comment,
                    uname: that.uname,
                    id: that.cardId,
                };

                axios
                    .post('/comments', commentData)
                    .then(function (response) {
                        var latestComment = response.data.comments;
                        that.comments.unshift(latestComment);
                    })
                    .catch(function (err) {
                        console.log('err in comment POST /comment: ', err);
                    });
            },

            closeModal: function (e) {
                e.preventDefault();
                this.$emit('close');
                history.replaceState(null, null, '');
            },

            deleteS3: function (e) {
                this.file = e.target.files[0];
            },

            handleDelete: function (e) {
                e.preventDefault;
                var that = this;
                console.log('this url: ', that.url);
                // https://s3.amazonaws.com/spicedling/S4L3C6bXgxsw1AFQlm0x_3agPnsDkNUb.jpg
                var urlString = that.url.toString();
                console.log('urlString: ', urlString);
                var filenameToUse = urlString.slice(36);
                console.log('filename: ', filenameToUse);

                var deleteData = {
                    id: that.cardId,
                    filename: filenameToUse,
                };

                axios
                    .post('/delete', deleteData)
                    .then(function (response) {
                        console.log('delete response:', response);
                        console.log('delete that:', that);
                        console.log('delete this:', that.$parent.images);
                        var imageArray = that.$parent.images;
                        var deletedId = response.data.deleteConfirm;
                        // SPLICE OUT OF ARRAY IF THE ID DELETED MATCHES
                        for (var i = 0; i < imageArray.length; ++i) {
                            //console.log('parentArray[1]: ', parentArray[i].id);
                            //console.log('deletedId: ', deletedId.id);
                            if (imageArray[i].id === imageArray.id) {
                                console.log('deletedId: ', deletedId.id);
                                console.log('parentArray[i]', imageArray[i]);
                                console.log('[i]', i);
                                //var sameIdItem = parentArray[i];
                                imageArray.splice(i, 1);
                            }
                        }
                    })
                    .catch(function (err) {
                        console.log('err in comment POST /comment: ', err);
                    });
            },
        },
    });

    new Vue({
        el: 'main',
        data: {
            // props
            heading: 'Latest Images',
            images: [],
            //showModal: false,
            //cardId: null,
            title: '',
            desc: '',
            username: '',
            file: null,
            lastImageId: '',
            cardId: location.hash.slice(1),
        },
        mounted: function () {
            var that = this;
            axios
                .get('/images')
                .then(function (res) {
                    that.images = res.data.images;
                    checkScrollPosition();
                })
                .catch(function (err) {
                    console.log('err in GET /images: ', err);
                });

            // INFINITE SCROLL
            function checkScrollPosition() {
                var scrolledToBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight;

                var lastImageShown = that.images.slice().pop();
                var lastImageId = lastImageShown.id;

                setTimeout(function () {
                    if (scrolledToBottom) {
                        axios
                            .get('/images/' + lastImageId)
                            .then(function (response) {
                                var updateImages = response.data.newImages;

                                for (var i = 0; i < updateImages.length; ++i) {
                                    that.images.push(updateImages[i]);
                                }
                                checkScrollPosition();
                                console.log('rock bottom');
                            })
                            .catch(function (err) {
                                console.log('err in comment POST /images: ', err);
                            });
                    } else {
                        checkScrollPosition();
                    }
                }, 200);
            } // closes checkScrollPosition()

            window.addEventListener('hashchange', function () {
                //console.log('hash change has fired');
                //console.log('value: ', location.hash);
                that.cardId = location.hash.slice(1);
            });
        },

        methods: {
            handleUpload: function (e) {
                e.preventDefault;
                // form data is exclusively for sending a file to the server
                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('desc', this.desc);
                formData.append('username', this.username);
                formData.append('file', this.file);
                // now we want to send all this info to the server when we handleUpload
                var that = this;
                axios
                    .post('/upload', formData)
                    .then(function (response) {
                        var latest = response.data.image;
                        that.images.unshift(latest);
                    })
                    .then(function () {
                        that.clearInputFields();
                    })
                    .catch(function (err) {
                        console.log('err in form POST /upload: ', err);
                    });
            },

            clearInputFields: function () {
                document.getElementById('title').value = '';
                document.getElementById('desc').value = '';
                document.getElementById('username').value = '';
                document.getElementById('file').value = '';
                this.title = '';
                this.desc = '';
                this.file = null;
                this.username = '';
            },

            handleChange: function (e) {
                this.file = e.target.files[0];
            },

            // DELETE HANDLE MODAL FOR PART 4
            /* handleModal: function (id) {
                this.showModal = true;
                this.cardId = id;
            }, */

            closeModal: function () {
                //this.showModal = false;
                this.cardId = null;
                history.replaceState(null, null, '');
                location.hash = '';
            },

            /* loadMore: function (e) {
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
            }, */
        },
    }); // Closes Vue
})(); // IIFE
