(function () {
    Vue.component('modal-component', {
        template: '#modal-component',
        props: ['cardId'], // always an array
        data: function () {
            return {
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
                tags: [],
                tag: '',
                filterImages: [],
                filterHeading: '',
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
                    console.log('resp: ', resp);
                    that.title = resp.data.title;
                    that.username = resp.data.username;
                    that.desc = resp.data.description;
                    that.url = resp.data.url;
                    that.date = resp.data.created_at;
                    that.next = resp.data.prev;
                    that.prev = resp.data.next;
                    that.tags = resp.data.tags;
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
                        console.log('/image modal response: ', resp);
                        that.title = resp.data.title;
                        that.username = resp.data.username;
                        that.desc = resp.data.description;
                        that.url = resp.data.url;
                        that.date = resp.data.created_at;
                        that.next = resp.data.prev;
                        that.prev = resp.data.next;
                        that.filterImages = [];
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
                    .then(function () {
                        that.clearCommentFields();
                    })
                    .catch(function (err) {
                        console.log('err in comment POST /comment: ', err);
                    });
            },

            clearCommentFields: function () {
                const inputs = document.querySelectorAll('input');

                inputs.forEach(function (input) {
                    input.value = '';
                });

                this.uname = '';
                this.comment = '';
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
                var filenameToUse = urlString.slice(36);

                var deleteData = {
                    id: that.cardId,
                    filename: filenameToUse,
                };

                axios
                    .post('/delete', deleteData)
                    .then(function (response) {
                        console.log('delete response:', response);
                        console.log('delete that:', that);
                        console.log('delete this:', this);
                    })
                    .catch(function (err) {
                        console.log('err in delete POST /delete: ', err);
                    });
                console.log('this after delete: ', this);
                this.$emit('delete', this.cardId);
                this.closeModal();
            },

            closeModal: function (e) {
                //e.preventDefault();
                this.$emit('close');
            },

            filterTags: function (tag) {
                var that = this;
                that.tag = tag;
                that.filterHeading = tag;
                console.log('that.tag: ', that.tag);
                // get req for filter id

                axios
                    .get('/images/filter/' + that.tag)
                    .then(function (resp) {
                        console.log('/image filter response: ', resp);
                        var renderFilteredImages = resp.data.tagResults;
                        console.log('renderFilteredImages: ', renderFilteredImages);
                        //that.filterImages.push.apply(renderFilteredImages);
                        for (var i = 0; i < renderFilteredImages.length; ++i) {
                            that.filterImages.push(renderFilteredImages[i]);
                        }
                        console.log('filterImages: ', that.filterImages);
                    })
                    .catch(function (err) {
                        console.log('err in GET /images: ', err);
                    });
            },
        },
    });

    new Vue({
        el: 'main',
        data: {
            // props
            heading: 'Upload an image',
            images: [],
            tagsArr: [],
            tagItem: '',
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

            window.addEventListener('hashchange', function () {
                that.cardId = location.hash.slice(1);
            });

            // INFINITE SCROLL
            function checkScrollPosition() {
                var scrolledToBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight;
                //console.log('scrolledToBottom', scrolledToBottom);
                var lastImageShown = that.images.slice().pop();
                var lastImageId = lastImageShown.id;
                //console.log('lastImageShown', lastImageShown);
                //console.log('lastImageId', lastImageId);

                setTimeout(function () {
                    if (scrolledToBottom) {
                        axios
                            .get('/images/' + lastImageId)
                            .then(function (response) {
                                /* var updateImages = response.data.newImages;
                                that.images.push.apply(updateImages);
                                console.log('response', response);

                                checkScrollPosition(); */

                                var updateImages = response.data.newImages;

                                for (var i = 0; i < updateImages.length; ++i) {
                                    that.images.push(updateImages[i]);
                                }
                                checkScrollPosition();
                                //console.log('rock bottom');
                            })
                            .catch(function (err) {
                                console.log('infinite scroll: ', err);
                            });
                    } else {
                        checkScrollPosition();
                    }
                }, 200);
            } // closes checkScrollPosition()
        },

        methods: {
            showForm: function (e) {
                e.preventDefault();
                this.$emit('show');
                var formFill = document.getElementById('upload-form');
                formFill.style.visibility = 'visible';
                formFill.style.opacity = '1';
            },

            hideForm: function () {
                //e.preventDefault();
                this.$emit('hide');
                var formFill = document.getElementById('upload-form');
                var tagsCtr = document.getElementById('showing-tags');
                var ibdContainer = document.getElementsByClassName('ibd-container');
                formFill.style.width = 30 + '%';
                formFill.style.visibility = 'hidden';
                formFill.style.opacity = '0';
                ibdContainer.style.width = 70 + '%';
                tagsCtr.style.visibility = 'hidden';
                tagsCtr.style.opacity = '0';
            },

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
                        if (response.data.success) {
                            var latest = response.data.image;
                            that.images.unshift(latest);
                            console.log('upload response: ', response);
                            console.log('that.tags: ', that.tagsArr);
                            var allTags = that.tagsArr;

                            var tagsData = {
                                allTags,
                                imageId: response.data.image.id,
                            };

                            console.log('tagsData: ', tagsData);
                            axios.post('/upload/tags', tagsData).then(function (resp) {
                                console.log('response tags: ', resp);
                                var addTag = resp.data.tagItem;
                                that.tagsArr.unshift(addTag);
                                console.log('that.tags: ', that.tagsArr);
                                //this.hideForm();
                            });
                        }
                    })
                    .then(function () {
                        that.clearInputFields();
                    })
                    .catch(function (err) {
                        console.log('err in form POST /upload: ', err);
                    });
            },

            activateTagsBox: function () {
                var tagsBox = document.getElementById('showing-tags');
                tagsBox.style.visibility = 'visible';
                tagsBox.style.opacity = '1';
            },

            addTags: function () {
                var that = this;
                var tagInput = document.getElementById('tagsinput');
                console.log('that.tags: ', that.tagsArr);
                console.log('that: ', that);
                // take that.tagItem and add to tagsArr
                var tagAdded = that.tagItem;
                that.tagsArr.push(tagAdded);
                // clear input field
                tagInput.value = '';
                this.tagItem = '';
            },

            addTagClick: function (e) {
                e.preventDefault();
                var that = this;
                that.addTags();
            },

            removeTag: function (e) {
                e.preventDefault();
                var that = this;
                var tagItem = e.target;
                console.log('e.target: ', e.target);
                that.tagsArr.splice(tagItem);
            },

            clearInputFields: function () {
                const inputs = document.querySelectorAll('input');
                var tagsBox = document.getElementById('showing-tags');
                tagsBox.style.visibility = 'hidden';
                tagsBox.style.opacity = '0';

                inputs.forEach(function (input) {
                    input.value = '';
                });

                this.title = '';
                this.desc = '';
                this.file = null;
                this.username = '';
                this.tagsArr = [];
            },

            organiseDelete: function (id) {
                console.log('organise delete that: ', this);
                console.log('organise delete id: ', id);
                for (var i = 0; i < this.images.length; ++i) {
                    if (this.images[i].id === id) {
                        this.images.splice(i, 1);
                    }
                }
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
                this.cardId = null;
                window.history.replaceState(null, null, '/');
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
