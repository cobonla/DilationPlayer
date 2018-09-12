// ====================================================
// Class {DilationPlayerConfig}
// ====================================================
class DilationPlayerConfig {
    /**
     * Constructor
     * @param config
     */
    constructor(config) {
        // Set default
        config.elements = this.or(config.elements, {});
        config.icons = this.or(config.icons, {});

        // Config for elements
        this.config = {
            elements: {
                container: this.or(config.elements.container, '.dp'),
                video: this.or(config.elements.video, '.dp-video'),
                logo: this.or(config.elements.logo, '.dp-logo'),
                progress: this.or(config.elements.progress, '.dp-progress'),
                progressHoverTooltipText: this.or(config.elements.progressHoverTooltipText, '.dp-progress-tooltip-text'),
                progressToverTooltipImage: this.or(config.elements.progressToverTooltipImage, '.dp-progress-tooltip-image'),
                control: this.or(config.elements.control, '.dp-control'),
                button: this.or(config.elements.button, '.dp-button'),
                controlPlayPause: this.or(config.elements.controlPlayPause, '.dp-btn-play'),
                controlFullscreen: this.or(config.elements.controlFullscreen, '.dp-btn-fullscreen'),
                controlVolume: this.or(config.elements.controlVolume, '.dp-btn-volume'),
                controlVolumeTooltip: this.or(config.elements.controlVolumeTooltip, '.dp-volume-tooltip'),
                controlVolumeRange: this.or(config.elements.controlVolumeRange, '.dp-volume-range'),
                controlTimer: this.or(config.elements.controlTimer, '.dp-timer'),
                modal: this.or(config.elements.modal, '.dp-modal'),
                loaderModal: this.or(config.elements.loaderModal, '.dp-modal-loader'),
                loaderModalIcon: this.or(config.elements.loaderModalIcon, '.dp-modal-loader-icon'),
                playerModal: this.or(config.elements.playerModal, '.dp-modal-player'),
                playerModalIcon: this.or(config.elements.playerModalIcon, '.dp-modal-player-icon'),
            },

            // Config for icon
            icons: {
                loaderModal: this.or(config.icons.loaderModal, '<i class="fa fa-spin fa-spinner"></i>'),
                playerModal: this.or(config.icons.loaderModal, '<i class="icons icon-control-play"></i>'),
                fullScreen: this.or(config.icons.fullScreen, '<i class="icons icon-size-fullscreen"></i>'),
                actualScreen: this.or(config.icons.actualScreen, '<i class="icons icon-size-actual"></i>'),
                pause: this.or(config.icons.pause, '<i class="icons icon-control-pause"></i>'),
                play: this.or(config.icons.play, '<i class="icons icon-control-play"></i>'),
                volumeMute: this.or(config.icons.volumeMute, '<i class="icons icon-volume-off"></i>'),
                volume1: this.or(config.icons.volume1, '<i class="icons icon-volume-1"></i>'),
                volume2: this.or(config.icons.volume2, '<i class="icons icon-volume-2"></i>'),
                volume3: this.or(config.icons.volume3, '<i class="icons icon-volume-3"></i>')
            },

            // Config default
            volume: this.or(config.volume, 5),
            object: this.or(config.object, null),
            view: this.or(config.view, false),
            resources: this.or(config.resources, {})
        }

        // Init cache
        this.cache = {
            dom: {
                object: $(this.config.object)
            },
            config: {}
        };
    }

    /**
     * Check if value is undefined then return or
     * @param value
     * @param or
     * @return mixed
     */
    or(value, or) {
        return value == undefined ? or : value;
    }

    /**
     * Get config
     * @param key
     * @return mixed
     */
    get(key, dom) {
        let config = null;

        // Get config cache
        if (this.cache.config[key] !== undefined) {
            config = this.cache.config[key];
        }
        // Config not in cache then read
        // Split key string to array
        else {
            var keys = key.split('.');
            config = this.config;

            for (var i in keys) {
                if (config[keys[i]] == undefined) {
                    config = undefined;
                    break;
                }

                config = config[keys[i]];
            }

            this.cache.config[key] = config;
        }

        // Check get dom is true and dom is created
        // Then return dom in cache
        if (dom === true && (typeof config === 'string')) {
            if (this.cache.dom[key] === undefined) {
                this.cache.dom[key] = this.cache.dom['object'].find(config);
            }

            return this.cache.dom[key];
        }

        return config;
    }
}

// ====================================================
// Class {DilationPlayerView}
// ====================================================
class DilationPlayerView {
    /**
     * Constructor
     * @param config
     */
    constructor(config) {
        this.config = config;
    }

    async render() {
        let view = this.config.get('view');

        if (view === false) {
            return true;
        }

        let object = this.config.get('object', true);

        // Read content in template
        if (!view.content) {
            if (view.import) {
                object.html('Loading ...');
                let response = await $.ajax({
                    url: view.import,
                    data: {},
                    method: 'GET',
                    success: function (response) {
                        return response;
                    },
                    error: function () {
                        return null;
                    }
                });

                let content = this.replace(response);
                object.html(content);
            }
        } else {
            let content = this.replace(view.content);
            object.html(content);
        }

        return true;
    }

    replace(content) {
        return content;
    }
}

// ====================================================
// Class {DilationPlayer}
// ====================================================
class DilationPlayer {
    /**
     * Constructor
     * @param config
     */
    constructor(object, config) {
        if (config == undefined) {
            config = {};
        }

        config.object = object;
        this.config = new DilationPlayerConfig(config);
        this.view = new DilationPlayerView(this.config);
        this.rendered = false;
        this.apply();
    }

    /**
     * Load
     * @param resources
     */
    load(resources) {
        if (resources !== undefined) {
            this.config.resources(resources);
        }

        this.apply();
    }

    /**
     * Apply
     */
    async apply() {
        await this.render();

        // Regist events
        this.control()
            .playPause()
            .fullScreen()
            .progress()
            .sound()
            .logo();
    }

    /**
     * Render view
     * @return {Promise<boolean>}
     */
    async render() {
        let rendered = await this.view.render();
        this.rendered = true;
		
		let icons = this.config.get('icons');
        let loaderIcon = this.config.get('elements.loaderModalIcon', true);
		let playerIcon = this.config.get('elements.playerModalIcon', true);
		
		// default
        playerIcon.html(icons.playerModal);
        loaderIcon.html(icons.loaderModal);
		
        return rendered;
    }

    /**
     * Toggle play pause
     * @return {DilationPlayer}
     */
    playPause() {
        // Defined elements
        let video = this.config.get('elements.video', true);
        let player = this.config.get('elements.playerModal', true);
        let btn = this.config.get('elements.controlPlayPause', true);
        let icons = this.config.get('icons');
        let videoDom = video.get(0);
        let instance = this;

        /**
         * Helper
         * @type {{toggle: toggle, makeIcon: makeIcon}}
         */
        let helper = {
            /**
             * Toggle play or pause
             */
            toggle: function () {
                if (!isNaN(videoDom.duration)) {
                    if (videoDom.paused) {
                        videoDom.play();
                    } else {
                        videoDom.pause();
                    }
                }
            },

            /**
             * Make icon
             */
            makeIcon: function () {
                if (videoDom.paused) {
                    btn.html(icons.play);
                } else {
                    btn.html(icons.pause);
                }

                instance.modal();
            }
        };

        // Event when click on button play/pause
        btn.click(function () {
            helper.toggle();
        });

        player.click(function () {
            helper.toggle();
        });

        // Event when click on video
        video.click(function () {
            helper.toggle();
        });

        // Event when video play
        video.on('play', function () {
            helper.makeIcon();
        });

        // Event when video pause or ended
        video.on('pause ended', function () {
            helper.makeIcon();
        });

        // Init display icon in button play/pause
        helper.makeIcon();

        return this;
    }

    /**
     * Toggle full screen event
     * @return {DilationPlayer}
     */
    fullScreen() {
        // Defined elements
        let element = this.config.get('elements.container', true).get(0);
        let btn = this.config.get('elements.controlFullscreen', true);
        let icons = this.config.get('icons');

        /**
         * Helper
         * @type {{makeIcon: makeIcon, request: request, cancel: cancel}}
         */
        let helper = {
            /**
             * Make icon
             * @param isFull
             */
            makeIcon: function (isFull) {
                if (isFull) {
                    btn.html(icons.actualScreen);
                } else {
                    btn.html(icons.fullScreen);
                }
            },

            /**
             * Toggle
             * @param event
             */
            toggle: function (event) {
                // Check if event is html element
                if (event instanceof HTMLElement) {
                    element = event;
                }

                var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;

                element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () {
                    return false;
                };

                document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () {
                    return false;
                };

                isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
            }
        };


        // Event when click on button fullscreen
        // Then call to check full or cancel
        btn.on('click', function (event) {
            helper.toggle(event);
        });

        // Event when change screen
        // Then get status and change icon
        $(document).on("fullscreenchange webkitfullscreenchange mozfullscreenchange", function () {
            var fullscreenElement = document.fullscreenElement
                || document.mozFullScreenElement
                || document.webkitFullscreenElement;

            helper.makeIcon(fullscreenElement ? true : false);
        });

        helper.makeIcon(false);

        return this;
    }

    /**
     * Progress
     * @return {DilationPlayer}
     */
    progress() {
        let instance = this;
        let video = this.config.get('elements.video', true);
        let videoDom = video.get(0);
        let progressBar = this.config.get('elements.progress', true);
        let progress = progressBar.find('.playing');
        let timer = this.config.get('elements.controlTimer', true);
        let progressTimerTooltipText = this.config.get('elements.progressHoverTooltipText', true);
        let progressTimerTooltipImage = this.config.get('elements.progressToverTooltipImage', true);
        let tooltipCanvas = progressTimerTooltipImage.find('canvas').get(0);
        tooltipCanvas.width = 90;
        tooltipCanvas.height = 70;

        /**
         * Helper object
         * @type {{pad: (function(*, *, *=): *), setLoaded: setLoaded, setTimer: setTimer, display: display}}
         */
        let helper = {
            /**
             * Pad
             * @param n
             * @param width
             * @param z
             * @return {*}
             */
            pad: function (n, width, z) {
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            },

            /**
             * Set loaded data
             * @param current
             * @param duration
             */
            setLoaded: function (current, duration) {
                progress.width((current / duration * 100) + '%');
            },

            /**
             * Set timer
             * @param current
             * @param duration
             */
            setTimer: function (current, duration) {
                let hours = Math.floor(current / 3600);
                let minutes = Math.floor((current - hours * 3600) / 60);
                let seconds = Math.floor(current - (minutes * 60 + hours * 3600));
                let currentTime = (hours > 0 ? (this.pad(hours, 2) + ':') : '') + this.pad(minutes, 2) + ':' + this.pad(seconds, 2);

                hours = Math.floor(duration / 3600);
                minutes = Math.floor((duration - hours * 3600) / 60);
                seconds = Math.floor(duration - (minutes * 60 + hours * 3600));
                let totalTime = (hours > 0 ? (this.pad(hours, 2) + ':') : '') + this.pad(minutes, 2) + ':' + this.pad(seconds, 2);

                timer.html(currentTime + ' / ' + totalTime);
            },

            /**
             * Display
             */
            display: function () {
                if (!isNaN(videoDom.duration)) {
                    let current = videoDom.currentTime;
                    let duration = videoDom.duration;

                    helper.setLoaded(current, duration);
                    helper.setTimer(current, duration);
                }
            }
        }

        // Event when timeupdate
        video.on('timeupdate ', function (e) {
            helper.display();
            instance.modal({loader: false});
        });

        // Event when click on progress bar
        // Then get position of mouse and count the time go to
        progressBar.on("click", function (e) {
            if (!isNaN(videoDom.duration)) {
                let offset = $(this).offset();
                let left = (e.pageX - offset.left);
                let totalWidth = progressBar.width();
                let percentage = (left / totalWidth);
                let vidTime = videoDom.duration * percentage;
                videoDom.currentTime = vidTime;
                helper.setLoaded(left, totalWidth);
                instance.modal({loader: true});
            }
        });

        // Event when hover on progress
        // Then get position of mouse, count the time go to and get information
        progressBar.on("mousemove", function (e) {
            if (!isNaN(videoDom.duration)) {
                progressTimerTooltipText.show();
                progressTimerTooltipImage.show();

                let offset = $(this).offset();
                let left = (e.pageX - offset.left);
                let totalWidth = progressBar.width();
                let percentage = (left / totalWidth);
                let current = videoDom.duration * percentage;

                let hours = Math.floor(current / 3600);
                let minutes = Math.floor((current - hours * 3600) / 60);
                let seconds = Math.floor(current - (minutes * 60 + hours * 3600));
                let currentTime = (hours > 0 ? (helper.pad(hours, 2) + ':') : '') + helper.pad(minutes, 2) + ':' + helper.pad(seconds, 2);

                progressTimerTooltipText.css('left', left + 'px').text(currentTime);
                progressTimerTooltipImage.css('left', left + 'px');

                // Get picture
                tooltipCanvas.getContext('2d').drawImage(videoDom, 0, 0, tooltipCanvas.width, tooltipCanvas.height);
            } else {
                progressTimerTooltipText.hide();
                progressTimerTooltipImage.hide();
            }
        });

        // Event when loaded data
        // Then call display information on screen
        video.on('loadeddata', function (e) {
            helper.display();
            instance.modal({loader: false});
        });

        // Event when start load data
        video.on('loadstart', function (e) {
            instance.modal({loader: true});
        });

        return this;
    }

    /**
     * Sound
     * @return {DilationPlayer}
     */
    sound() {
        // Defined elements
        let video = this.config.get('elements.video', true);
        let videoDom = video.get(0);
        let volume = this.config.get('elements.controlVolume', true);
        let volumeRange = this.config.get('elements.controlVolumeRange', true);
        let range = this.config.get('volume');
        let icons = this.config.get('icons');

        /**
         * Helper
         * @type {{makeIcon: makeIcon, setVolume: setVolume, toggleMute: toggleMute}}
         */
        let helper = {
            /**
             * Make icon for button
             */
            makeIcon: function () {
                if (videoDom.muted == true || videoDom.volume == 0) {
                    volume.html(icons.volumeMute);
                } else if (videoDom.volume <= 0.5) {
                    volume.html(icons.volume1);
                } else {
                    volume.html(icons.volume2);
                }
            },

            /**
             * Set volume for video
             * @param number
             */
            setVolume: function (number) {
                videoDom.volume = number / 100;

                if (videoDom.volume > 0) {
                    videoDom.muted = false;
                }
            },

            /**
             * Toggle mute video
             */
            toggleMute: function(){
                if (videoDom.muted == true) {
                    videoDom.muted = false;
                } else if (videoDom.volume > 0) {
                    videoDom.muted = true;
                }
            }
        };


        // Event click on button
        volume.on('click', function () {
            helper.toggleMute();
        });

        // Event when change input of range
        // Then call change volume and icon
        volumeRange.on('change', function () {
            let range = $(this).val();
            helper.setVolume(range);
        });

        // Event when volume change
        video.on('volumechange', function () {
            helper.makeIcon();
        });

        // Set volume default
        helper.setVolume(range);

        return this;
    }

    /**
     * Logo
     * return {DilationPlayer}
     */
    logo() {
        let logo = this.config.get('elements.logo', true);

        // Set size for Logo
        function resizeLogo() {
            let height = logo.height();
            logo.width(height);
        }

        $(window).resize(function () {
            resizeLogo();
        });

        resizeLogo();

        // Event when click on logo
        // Event when hover on logo

        return this;
    }

    /**
     * Toggle control
     * @return {DilationPlayer}
     */
    control() {
        // Defined elements
        let controlTime = null;
        let control = this.config.get('elements.control', true);
        let isMouseIn = false;
        let container = this.config.get('elements.container', true);
        let video = this.config.get('elements.video', true);

        /**
         * Helper
         * @type {{hidden: hidden, open: open}}
         */
        let helper = {
            /**
             * Hidden
             */
            hidden: function() {
                if (!video.get(0).paused) {
                    control.removeClass('active');

                    if (isMouseIn) {
                        container.addClass('hidden-cursor');
                    } else {
                        container.removeClass('hidden-cursor');
                    }
                }
            },

            /**
             * Open
             */
            open: function() {
                window.clearTimeout(controlTime);
                control.addClass('active');
                container.removeClass('hidden-cursor');
                let inst = this;

                controlTime = window.setTimeout(function () {
                    inst.hidden();
                }, 2000);
            }
        };

        // Event when hover on video/container/control
        $(this.config.get('elements.container')
            + ',' + this.config.get('elements.control')
            + ',' + this.config.get('elements.video')).mousemove(function () {
            helper.open();
            isMouseIn = true;
        });

        // Event when out on video/container/control
        $(this.config.get('elements.container')
            + ',' + this.config.get('elements.control')
            + ',' + this.config.get('elements.video')).mouseleave(function () {
            helper.hidden();
            isMouseIn = false;
        });

        // Event when video pause or ended
        video.on('pause ended', function () {
            control.addClass('active');
        });

        // Event when right click or open menu
        container.mousedown(function (event) {
            if (event.which === 3) {
                container.bind('contextmenu', function () {
                    return false;
                });
            }
            else {
                container.unbind('contextmenu');
            }
        });

        // Default
        video.get(0).controls = false;

        return this;
    }

    /**
     * Toggle show/hidel loader
     * @param disabled
     * @return {DilationPlayer}
     */
    modal(config) {
        let loader = this.config.get('elements.loaderModal', true);
        let player = this.config.get('elements.playerModal', true);
        let modal = this.config.get('elements.modal', true);
        let videoDom = this.config.get('elements.video', true).get(0);
        modal.removeClass('active');

        if (config === undefined) {
            if (!isNaN(videoDom.duration)) {
                if (videoDom.paused) {
                    player.addClass('active');
                } else {
                    player.removeClass('active');
                }
            } else {
                loader.addClass('active');
            }
        } else {
            if (config.loader === true) {
                loader.addClass('active');
            } else if (config.player === true || videoDom.paused) {
                player.addClass('active');
            }
        }

        return this;
    }
}