class ChatScroll {
    constructor() {
        this.setScrollAlert = _.debounce(function(value, context) {
             let scrollAlert = context.find('.chat-scroll-alert-unread');

             if (scrollAlert) {
                 if (value == 'show') {
                     $(scrollAlert).show('slow');
                 } else {
                      $(scrollAlert).hide('slow');
                 }
             }
        }, 500);
    }

    isScrollBot(scrollableElement) {
        if (scrollableElement) {
            //console.log((scrollableElement.scrollTop + scrollableElement.clientHeight + 25),  scrollableElement.scrollHeight, scrollableElement.offsetHeight);

            return ((scrollableElement.scrollTop + scrollableElement.clientHeight + 25 ) >= scrollableElement.scrollHeight) ? true : false;
        } else {
            return false;
        }
    }

    isScrollTop(scrollableElement) {
        if (scrollableElement) {
            return ((scrollableElement.scrollTop + scrollableElement.clientHeight - 50 ) <= scrollableElement.offsetHeight) ? true : false;
        } else {
            return false;
        }
    }

    setScrollBarBottom(scrollableElement) {
        if (scrollableElement) {
            Tracker.afterFlush(function(){
                $('.scroll-content').scrollTop(scrollableElement.scrollHeight);
            });
        }
    }

    updateScrollMessage(context) {
        let messageContenair = $('.chatWrapper');
        let doScroll, cancelShowAlert = false;
        let scrollableElement = context.find('.scroll-content');
        let scrollAlert = 'hide';

        if (scrollableElement && messageContenair) {
            if (this.isScrollBot(scrollableElement)) {
                // Update now, because he read the last messages
                doScroll = true;
            } else if (context.lastHeightMessages != scrollableElement.scrollHeight) {
                // we must calculate the compensation to keep the scrool
                let difference = scrollableElement.scrollHeight - context.lastHeightMessages;

                $(scrollableElement).scrollTop(scrollableElement.scrollTop + difference);
                context.lastHeightMessages = scrollableElement.scrollHeight;

                if (!doScroll) {
                    // Si on avait pas planifier de scroller en bas, on annule l'affichage de la notification de nouveau message
                    cancelShowAlert = true;
                }
            }

            if (doScroll && scrollableElement) {
                this.setScrollBarBottom(scrollableElement);
                scrollAlert = 'hide';
            } else {
                if (!cancelShowAlert) {
                    scrollAlert = 'show';
                }
            }

            this.setScrollAlert(scrollAlert, context);
        }
    }

    initializeResize(context) {
        let self = this;

        return $(window).resize(function() {
          let height = $(window).height() - $('.navbar').height() - $('.room-name-contenair').height() - 49;

          $('.chatScrollable').css('max-height', height+'px');
           $('.chatWrapper').css('height', height+'px');

          self.updateScrollMessage(context);
        });
    }

    initializeScroll(context) {
        let self = this;

        // Initialize scroll on text-box

        // Initialize scroll on messages
        return $('.chatScrollable').scrollbar().on('scroll', function() {
            if (self.isScrollBot(this)) {
               self.setScrollAlert('hide', context);
           }
           if (self.isScrollTop(this) && context.firstTopCancel) {
               context._loadMoreMessage();
           } else {
               context.firstTopCancel = true;
           }
       });
    }
}

this.ChatScroll = new ChatScroll();
