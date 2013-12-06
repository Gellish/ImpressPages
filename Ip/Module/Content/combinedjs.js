/**
 * @package ImpressPages
 *
 *
 */


(function($) {

    var methods = {
        init : function(options) {


            return this.each(function() {

                var $this = $(this);
                
                var data = $this.data('ipContentManagement');
            
                // If the plugin hasn't been initialized yet
                if ( ! data ) {
                    $this.bind('initFinished.ipContentManagement', $.proxy(methods._initBlocks, $this));

                    $(this).trigger('initStarted.ipContentManagement');
 
                    $this.data('ipContentManagement', {
                        saveJobs : Object(),
                        optionsChanged : false
                    });
                    var data = $this.data('ipContentManagement');


                    {
                        $('body').prepend(ipContentInit.saveProgressHtml);
                        $('body').prepend(ipContentInit.controlPanelHtml);

                        var options = new Object;
                        options.zoneName = ip.zoneName;
                        options.pageId = ip.pageId;
                        options.revisionId = ip.revisionId;
                        options.widgetControlsHtml = ipContentInit.widgetControlsHtml;
                        options.contentManagementObject = $this;
                        options.manageableRevision = ipContentInit.manageableRevision;

                        var data = $this.data('ipContentManagement');
                        data.initInfo = options;
                        $this.data('ipContentManagement', data);

                        $('.ipAdminPanel .ipActionWidgetButton').ipAdminWidgetButton();

                        $('.ipAdminPanel .ipaOptions').bind('click', function(event){event.preventDefault();$(this).trigger('pageOptionsClick.ipContentManagement');});

                        $('.ipAdminPanel .ipActionSave').bind('click', function(e){$.proxy(methods.save, $this)(false)});
                        $('.ipAdminPanel .ipActionPublish').bind('click', function(e){$.proxy(methods.save, $this)(true)});
                        $('.ipAdminPanelContainer .ipsPreview').on('click', function(e){e.preventDefault(); ipContent.setManagementMode(0);});

                        $this.bind('pageOptionsClick.ipContentManagement', function(event){$(this).ipContentManagement('openPageOptions');});

                        $this.bind('pageOptionsConfirm.ipPageOptions', methods._optionsConfirm);
                        $this.bind('pageOptionsCancel.ipPageOptions', methods._optionsCancel);
                        //$this.bind('dialogclose', methods._optionsCancel);

                        $this.bind('error.ipContentManagement', function (event, error){$(this).ipContentManagement('addError', error);});

                        $this.trigger('initFinished.ipContentManagement', options);
                    }


                }




            });
        },
        

        _initBlocks: function() {
            var $this = this;
            $this.ipContentManagement('initBlocks', $('.ipBlock'));
        },
        
        initBlocks : function(blocks) {
            var $this = this;
            var data = $this.data('ipContentManagement');
            var options = data.initInfo;
            if (options.manageableRevision) {
                blocks.ipBlock(options);
            }
        },
        
        addError : function (errorMessage) {
            var $newError = $('.ipAdminErrorSample .ipAdminError').clone();
            $newError.text(errorMessage);
            $('.ipAdminErrorContainer').append($newError);
            $newError.animate( {opacity: "100%"}, 6000)
            .animate( { queue: true, opacity: "0%" }, { duration: 3000, complete: function(){$(this).remove();}});
        },
        // *********PAGE OPTIONS***********//
        
        openPageOptions : function() {
            return this.each(function() {
                var $this = $(this);
                if ($('.ipaOptionsDialog').length) {
                    
                    $this.find('.ipaOptionsDialog').dialog('open');
                } else {
                    $('.ipAdminPanel').append('<div class="ipaOptionsDialog" style="display: none;"></div>');
                    $('.ipaOptionsDialog').dialog({width: 600, height : 450, modal: true});
                    $('.ipaOptionsDialog').ipPageOptions();
                    $('.ipaOptionsDialog').ipPageOptions('refreshPageData', ip.pageId, ip.zoneName);
                }
                
            });
        },
        
        _optionsConfirm : function (event){
            var $this = $(this);
            var data = $this.data('ipContentManagement');
            
            var postData = Object();
            postData.aa = 'Content.savePageOptions';
            postData.securityToken = ip.securityToken;
            postData.pageOptions = $('.ipaOptionsDialog').ipPageOptions('getPageOptions');
            postData.revisionId = ip.revisionId;

            $.ajax({
                type : 'POST',
                url : ip.baseUrl,
                data : postData,
                context : $this,
                success : methods._savePageOptionsResponse,
                dataType : 'json'
            });

        },
        
        _savePageOptionsResponse : function (response) {
            $this = this;
            if (response.status == 'success') {
                $('.ipaOptionsDialog').remove();
                if (response.newUrl && response.newUrl != '') {
                    $('a[href="' + response.oldUrl + '"]').attr('href', response.newUrl);
                }
            } else {
                alert(response.errorMessage);
            }
        },
        
        
        _optionsCancel : function (event) {
            var $this = $(this);
            $('.ipaOptionsDialog').remove();
        },
        // *********END PAGE OPTIONS*************//
        
        
        // *********SAVE**********//
        

        
        save : function(publish) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('ipContentManagement');

                var postData = Object();
                postData.aa = 'Content.savePage';
                postData.securityToken = ip.securityToken;
                postData.revisionId = ip.revisionId;
                if (publish) {
                    postData.publish = 1;
                } else {
                    postData.publish = 0;
                }

                $.ajax({
                    type : 'POST',
                    url : ip.baseUrl,
                    data : postData,
                    context : $this,
                    success : methods._savePageResponse,
                    dataType : 'json'
                });
            });
        },
        
        _savePageResponse: function(response) {
            var $this = $(this);
            var data = $this.data('ipContentManagement');
            if (response.status == 'success') {
                window.location.href = response.newRevisionUrl;
            } else {

            }
        }


        // *********END SAVE*************//
        
    };



    
    

    $.fn.ipContentManagement = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }


    };
    
   

})(jQuery);/**
 * @package ImpressPages
 *
 *
 */

(function($) {

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this);
                
                var data = $this.data('ipAdminWidgetButton');
            
                // If the plugin hasn't been initialized yet
                if ( ! data ) {
                    $this.draggable({
                        connectToSortable : '.ipBlock',
                        revert : function(droppable) {
                            if(droppable === false) {
                                // drop was unsuccessful
                                $this.trigger('unsuccessfulDrop.ipWidgetButton',{
                                    widgetButton: $this
                                });
                                return true;
                            } else {
                                // drop was successful
                                $this.trigger('successfulDrop.ipWidgetButton',{
                                    widgetButton: $this,
                                    block: droppable
                                });
                                return false;
                            }
                        },
                        helper : 'clone',
                        stop: function(event, ui) { }
                    });
                    
                    $this.data('ipAdminWidgetButton', {
                        name : $this.attr('id').substr(20)
                    });

                }
                    
                $this.find('a').bind('click', function () {return false;} );
                
                

            });
        },
        destroy : function() {
            // TODO
        }

        
    };

    $.fn.ipAdminWidgetButton = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);/**
 * @package ImpressPages
 *
 *
 */

(function($) {

    var methods = {
    init : function(options) {

        return this.each(function() {

            var $this = $(this);

            var data = $this.data('ipBlock');

            // If the plugin hasn't been initialized yet
            if (!data) {
                $this.delegate('.ipActionWidgetMove', 'click', function(e){e.preventDefault();});
                $this.sortable( {
                    connectWith : '.ipBlock',
                    revert : true,
                    dropOnEmpty : true,
                    forcePlaceholderSize : false,
                    placeholder: 'ipAdminWidgetPlaceholder',
                    handle : '.ipAdminWidgetControls .ipActionWidgetMove',
                    start : function (event, ui) {
                        ui.item.addClass('ipAdminWidgetDrag');
                        ui.item.width(ui.item.find('.ipAdminWidgetMoveIcon').outerWidth());
                        ui.item.height(ui.item.find('.ipAdminWidgetMoveIcon').outerHeight());
                    },
                    stop : function (event, ui) {
                        ui.item.removeClass('ipAdminWidgetDrag');
                        ui.item.width('auto');
                        ui.item.height('auto');
                    },
                    
                    // this event is fired twice by both blocks, when element is moved from one block to another.
                    update : function(event, ui) {
                        if (!$(ui.item).data('widgetinstanceid')) {
                            return;
                        }
    
                        // item is dragged out of the block. This action will be handled by the reciever using "receive"
                        if ($(ui.item).parent().data('ipBlock').name != $this.data('ipBlock').name) {
                            return;
                        }
    
                        var instanceId = $(ui.item).data('widgetinstanceid');
                        var position = $(ui.item).index();
    
                        var data = Object();
                        data.aa = 'Content.moveWidget';
                        data.securityToken = ip.securityToken;
                        data.instanceId = instanceId;
                        data.position = position;
                        data.blockName = $this.data('ipBlock').name;
                        data.revisionId = $this.data('ipBlock').revisionId;

                        $.ajax( {
                            type : 'POST',
                            url : ip.baseUrl,
                            data : data,
                            context : $this,
                            success : methods._moveWidgetResponse,
                            dataType : 'json'
                        });
    
                    },
    
                    receive : function(event, ui) {
                        $element = $(ui.item);
                        // if received element is AdminWidgetButton (insert new widget)
                        if ($element && $element.is('.ipActionWidgetButton')) {
                            $duplicatedDragItem = $('.ipBlock .ipActionWidgetButton');
                            $position = $duplicatedDragItem.index();
                            var newWidgetName = $element.data('ipAdminWidgetButton').name;
                            $duplicatedDragItem.remove();
                            $block = $this;
                            $block.ipBlock('_createWidget', newWidgetName, $position);
                        }
    
                    }
                });
                
                $this.data('ipBlock', {
                    name : $this.attr('id').substr(8),
                    revisionId : $this.data('revisionid'),
                    widgetControlsHtml : options.widgetControlsHtml
                });

                var widgetOptions = new Object;
                widgetOptions.widgetControlls = $this.data('ipBlock').widgetControlsHtml;
                $this.children('.ipWidget').ipWidget(widgetOptions);

                $this.delegate('.ipWidget .ipActionWidgetDelete', 'click', function(event) {
                    // ignore events which bubble up from nested blocks
                    if ( $(event.target).closest('.ipBlock')[0] != $this[0] )
                        return;
                    event.preventDefault();
                    $(this).trigger('deleteClick.ipBlock');
                });

                $this.delegate('.ipWidget', 'deleteClick.ipBlock', function(event) {
                    // ignore events which bubble up from nested blocks
                    if ( $(event.target).closest('.ipBlock')[0] != $this[0] )
                        return;
                    // trigger deleteWidget event for the widget in question,
                    // as well as any subwidgets it may host
                    // TODO: sending n requests for n widgets may not be the
                    //       most elegant thing to do, however the backend does
                    //       not know a thing about nesting (to fix this, the 
                    //       backend must be extended so it can delete more than
                    //       one widget in a single request). 
                    var $instance = $(this),
                        instanceData = $instance.data('widgetdata'),
                        instanceId = $instance.data('widgetinstanceid'),
                        $subwidgets = $instance.find('.ipWidget');

                    $subwidgets.each(function () {
                        $(this).trigger('deleteWidget.ipBlock', {
                            'instanceId': $(this).data('widgetinstanceid')
                        });
                    });
                    
                    $instance.trigger('deleteWidget.ipBlock', {
                        'instanceId': instanceId
                    });
                });

                $this.bind('deleteWidget.ipBlock', function(event, data) {
                    // ignore events which bubble up from nested blocks
                    if ( $(event.target).closest('.ipBlock')[0] != $this[0] )
                        return;
                    $(this).ipBlock('deleteWidget', data.instanceId);
                });

                $this.bind('reinitRequired.ipWidget', function(event) {
                    // ignore events which bubble up from nested blocks
                    if ( $(event.target).closest('.ipBlock')[0] != $this[0] )
                        return;
                    $(this).ipBlock('reinit');
                });

            }
        });
    },

    reinit : function() {
        return this.each(function() {
            var $this = $(this);
            var widgetOptions = new Object;
            widgetOptions.widgetControlls = $this.data('ipBlock').widgetControlsHtml;
            $(this).children('.ipWidget').ipWidget(widgetOptions);

        });
    },

    _moveWidgetResponse : function(response) {
        var $this = $(this);
        if (response.status == 'success') {
            $('#ipWidget-' + response.oldInstance).replaceWith(response.widgetHtml);
            $this.trigger('reinitRequired.ipWidget');
        }
        // todo show error on error response
    },

    pageSaveStart : function() {
        return this.each(function() {
            var $this = $(this);
            $(this).children('.ipWidget').ipWidget('fetchManaged').ipWidget('save');
        });
    },

    destroy : function() {
        // TODO
    },

    _showError : function(errorMessage) {
        alert(errorMessage);

    },

    deleteWidget : function(instanceId) {
        return this.each(function() {

            var $this = $(this);

            var data = Object();
            data.aa = 'Content.deleteWidget';
            data.securityToken = ip.securityToken;
            data.instanceId = instanceId;


            $.ajax( {
            type : 'POST',
            url : ip.baseUrl,
            data : data,
            context : $this,
            success : methods._deleteWidgetResponse,
            dataType : 'json'
            });
        });
    },

    _deleteWidgetResponse : function(response) {
        var $this = $(this);
        $this.find('#ipWidget-' + response.widgetId).remove();
        if ($this.children('.ipWidget').length == 0) {
            $this.addClass('ipbEmpty');
        }
    },

    _createWidget : function(widgetName, position) {

        return this.each(function() {

            var $this = $(this);

            var data = Object();
            data.aa = 'Content.createWidget';
            data.securityToken = ip.securityToken;
            data.widgetName = widgetName;
            data.position = position;
            data.blockName = $this.data('ipBlock').name;
            data.zoneName = $this.data('ipBlock').zoneName;
            data.pageId = $this.data('ipBlock').pageId;
            data.revisionId = $this.data('ipBlock').revisionId;

            $.ajax( {
            type : 'POST',
            url : ip.languageUrl,
            data : data,
            context : $this,
            success : methods._createWidgetResponse,
            dataType : 'json'
            });

        });

    },

    _createWidgetResponse : function(response) {
        var $this = $(this);
        if (response.status == 'error') {
            $.fn.ipBlock('_showError', response.errorMessage);
        }

        if (response.status == 'success') {
        	var $newWidget = $(response.widgetManagementHtml);
            if (response.position == 0) {
                $(this).prepend($newWidget);
            } else {
                $secondChild = $(this).children('.ipWidget:nth-child(' + response.position + ')');
                $($newWidget).insertAfter($secondChild);
            }
            $this.trigger('reinitRequired.ipWidget');
            $this.trigger('stateManagement.ipWidget',{
                'instanceId': response.instanceId
            });
            // $this.ipBlock('reinit');

        }
        if ($this.hasClass('ipbEmpty')) {
            $this.removeClass('ipbEmpty');
        }
    }

    };
    


    $.fn.ipBlock = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);/**
 * @package ImpressPages
 *
 *
 */

$(document).ready(function() {

    $ipObject = $(document);

    $ipObject.bind('initFinished.ipContentManagement', ipAdminPanelInit);
    $ipObject.bind('initFinished.ipContentManagement', ipAdminWidgetsScroll);
    $(window).bind('resizeEnd',                        ipAdminWidgetsScroll);
    $ipObject.bind('initFinished.ipContentManagement', ipAdminWidgetsSearch);

    $ipObject.ipContentManagement();

    // case insensitive search
    jQuery.expr[':'].icontains = function(a, i, m) {
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    if (isMobile) {
        $('body').addClass('ipMobile');
    }

});

$(window).resize(function() {
    if(this.resizeTO) { clearTimeout(this.resizeTO); }
    this.resizeTO = setTimeout(function() {
        $(this).trigger('resizeEnd');
    }, 100);
});



/**
 * 
 * Function used to paginate Widgets on Administration Panel
 * 
 * @param none
 * @returns nothing
 * 
 * 
 */
function ipAdminWidgetsScroll() {
    var $scrollable = $('.ipAdminWidgetsContainer'); // binding object
    $scrollable.scrollable({
        items: 'li', // items are <li> elements; on scroll styles will be added to <ul>
        touch: false
    });
    var scrollableAPI = $scrollable.data('scrollable'); // getting instance API
    var itemWidth = scrollableAPI.getItems().eq(0).outerWidth(true);
    var containerWidth = scrollableAPI.getRoot().width() + 24; // adding left side compensation
    var scrollBy = Math.floor(containerWidth / itemWidth); // define number of items to scroll
    if(scrollBy < 1) { scrollBy = 1; } // setting the minimum
    $('.ipAdminWidgets .ipaRight, .ipAdminWidgets .ipaLeft').unbind('click'); // unbind if reinitiating dynamically
    scrollableAPI.begin(); // move to scroller to default position (beginning)
    $('.ipAdminWidgets .ipaRight').click(function(event){
        event.preventDefault();
        scrollableAPI.move(scrollBy);
    });
    $('.ipAdminWidgets .ipaLeft').click(function(event){
        event.preventDefault();
        scrollableAPI.move(-scrollBy);
    });
}

/**
 * 
 * Function used to search Widgets on Administration Panel
 * 
 * @param none
 * @returns nothing
 * 
 * 
 */
function ipAdminWidgetsSearch() {
    var $input = $('.ipAdminWidgetsSearch .ipaInput');
    var $button = $('.ipAdminWidgetsSearch .ipaButton');
    var $widgets = $('.ipAdminWidgetsContainer li');

    $input.focus(function(){
        if( this.value == this.defaultValue ){
            this.value = '';
        };
    }).blur(function(){
        if( this.value == '' ){
            this.value = this.defaultValue;
        };
    }).keyup(function(){
        var value = this.value;
        $widgets.css('display',''); // restate visibility
        if (value && value != this.defaultValue ) {
            $widgets.not(':icontains(' + value + ')').css('display','none');
            $button.addClass('ipaClear');
        } else {
            $button.removeClass('ipaClear');
        }
        ipAdminWidgetsScroll(); // reinitiate scrollable
    });

    $button.click(function(event){
        event.preventDefault();
        $this = $(this);
        if ($this.hasClass('ipaClear')) {
            $input.val('').blur().keyup(); // blur returns default value; keyup displays all hidden widgets
            $this.removeClass('ipaClear'); // makes button look default
        }
    });
}

/**
 * 
 * Function used to create a space on a page for Administration Panel
 * 
 * @param none
 * @returns nothing
 * 
 * 
 */
function ipAdminPanelInit() {
    $container = $('.ipAdminPanelContainer'); // the most top element physically creates a space
    $panel = $('.ipAdminPanel'); // Administration Panel that stays always visible
    $container.height($panel.height()); // setting the height to container
    $panel.css('top',$('.ipsAdminToolbarContainer').outerHeight()); // move down to leave space for top toolbar
}

/**
 * 
 * Object used to store active job in page save progress
 * 
 * @param string
 *            name name of the job
 * @param int
 *            timeLeft predicted execution time in secconds
 * @returns {ipSaveJob}
 * 
 * 
 */
function ipSaveJob(title, timeLeft) {

    var title;
    var predictedTime;
    var progress;
    var finished;

    this.title = title;
    this.timeLeft = timeLeft; // secconds. Approximate value
    this.progress = 0; // 0 - 1
    this.finished = false;

    this.setTitle = setTitle;
    this.setProgress = setProgress;
    this.setTimeLeft = setTimeLeft;
    this.setFinished = setFinished;
    this.getTitle = getTitle;
    this.getProgress = getProgress;
    this.getTimeLeft = getTimeLeft;
    this.getFinished = getFinished;

    function setTitle(title) {
        this.title = title;
    }

    function setProgress(progress) {
        if (progress > 1) {
            progress = 1;
        }
        if (progress < 0) {
            progress = 0;
        }
        this.progress = progress;
    }

    function setTimeLeft(timeLeft) {
        if (timeLeft < 0) {
            timeLeft = 0;
        }
        this.timeLeft = timeLeft;
    }

    function setFinished(finished) {
        this.finished = finished;
        this.setTimeLeft(0);
        this.setProgress(100);
    }

    function getTitle() {
        return this.title;
    }

    function getProgress() {
        return this.progress;
    }

    function getTimeLeft() {
        return this.timeLeft;
    }

    function getFinished() {
        return this.finished;
    }

}


/**
 * @package ImpressPages
 *
 *
 */


(function ($) {
    "use strict";

    var methods = {
        init: function (options) {

            return this.each(function () {
                var $this = $(this);
                $this.prepend(options.widgetControlls);
                $this.save = function(data, refresh){$(this).ipWidget('save', data, refresh);};
                var data = $this.data('ipWidgetInit');
                // If the plugin hasn't been initialized yet
                if (!data) {
                    $this.data('ipWidgetInit', Object());

                    var widgetName = $this.data('widgetname');
                    var data = $this.data('widgetdata');
                    if (eval("typeof IpWidget_" + widgetName + " == 'function'")) {
                        var widgetPluginObject;
                        eval('widgetPluginObject = new IpWidget_' + widgetName + '();');
                        if (widgetPluginObject.init) {
                            widgetPluginObject.init($this, data);
                        }

                    }
                }

                $this.find('.ipsLook').on('click', $.proxy(openLayoutModal, this));

            });
        },



        save: function (widgetData, refresh) {

            return this.each(function () {
                var $this = $(this);
                var data = Object();


                data.aa = 'Content.updateWidget';
                data.securityToken = ip.securityToken;
                data.instanceId = $this.data('widgetinstanceid');
                data.widgetData = widgetData;

                $.ajax({
                    type: 'POST',
                    url: ip.baseUrl,
                    data: data,
                    context: $this,
                    success: function(response) {
                        if (!refresh) {
                            return;
                        }
                        var $newWidget = $(response.previewHtml);
                        $($newWidget).insertAfter($this);
                        $newWidget.trigger('reinitRequired.ipWidget');

                        // init any new blocks the widget may have created
                        $(document).ipContentManagement('initBlocks', $newWidget.find('.ipBlock'));
                        $this.remove();
                    },
                    error: function(response) {
                        console.log(response);
                    },
                    dataType: 'json'
                });

            });
        },


        changeLook: function(look) {
            return this.each(function () {
                var $this = $(this);
                var data = Object();


                data.aa = 'Content.changeLook';
                data.securityToken = ip.securityToken;
                data.instanceId = $this.data('widgetinstanceid');
                data.layout = look;

                $.ajax({
                    type: 'POST',
                    url: ip.baseUrl,
                    data: data,
                    context: $this,
                    success: function(response) {
                        var $newWidget = $(response.previewHtml);
                        $($newWidget).insertAfter($this);
                        $newWidget.trigger('reinitRequired.ipWidget');

                        // init any new blocks the widget may have created
                        $(document).ipContentManagement('initBlocks', $newWidget.find('.ipBlock'));
                        $this.remove();
                    },
                    error: function(response) {
                        console.log(response);
                    },
                    dataType: 'json'
                });

            });
        },

        refresh: function (widgetData) {
            return this.each(function () {

            });
        }

    };

    var openLayoutModal = function(e) {
        e.preventDefault();
        var $this = $(this);
        var $layoutButton = $this.find('.ipsLook');
        var layouts = $layoutButton.data('layouts');
        var currentLayout = $layoutButton.data('currentlayout');

        var $modal = $('#ipWidgetLayoutPopup');

        $modal.ipLayoutModal({
            layouts: layouts,
            currentLayout: currentLayout,
            changeCallback: function(layout){
                $(this).ipWidget('changeLayout', layout);
            },
            widgetObject: $this
        })
    }

    $.fn.ipWidget = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipWidget');
        }

    };

})(jQuery);


$(document).ready(function () {
    $(document).bind('initFinished.ipContentManagement', function () {
        $('.ipActionWidgetButton')
            .bind('dragstart', function (event, ui) {
                $('.ipBlock > .ipbExampleContent').each(function () {
                    $ipExampleContent = $(this);
                    var $block = $ipExampleContent.parent();

                    if ($block.css('min-height')) {
                        // save block min-height in order to restore it
                        $block.data('ipMinHeight', $block.css('min-height'));
                    }

                    $block.css('min-height', $block.height());

                    $ipExampleContent.fadeOut('slow');
                });
            })
            .bind('dragstop', function (event, ui) {
                $('.ipBlock > .ipbExampleContent').each(function () {
                    $ipExampleContent = $(this);
                    var $block = $ipExampleContent.parent();
                    if ($block.children('.ipAdminWidgetPlaceholder').length) {
                        $ipExampleContent.remove();
                    } else {
                        $ipExampleContent.fadeIn('fast');
                    }

                    if (!$block.data('ipMinHeight')) { // block had no min-height before
                        $block.css('min-height', '');
                    } else {
                        $block.css('min-height', $block.data('ipMinHeight'));
                        $block.removeData('ipMinHeight');
                    }
                });
            });
    });
});/**
 * @package ImpressPages
 *
 *
 */


(function($) {

    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('ipPageOptions');
                // If the plugin hasn't been initialized yet
                if ( ! data ) {
                    $this.data('ipPageOptions', {
                    }); 
                }
            });
        },
        
        
        refreshPageData : function (pageId, zoneName) {
            var $this = this;
            
            var data = Object();
            data.aa = 'Content.getPageOptionsHtml';
            data.securityToken = ip.securityToken;
            data.pageId = pageId;
            data.zoneName = zoneName;

            $.ajax({
                type : 'POST',
                url : ip.baseUrl,
                data : data,
                context : $this,
                success : methods._refreshPageDataResponse,
                dataType : 'json'
            });            
        },
        
        _refreshPageDataResponse : function (response) {
            var $this = this;
            if (response.status == 'success') {
                $this.html(response.optionsHtml);
                $this.tabs();
            }

            $('.ipaOptionsConfirm').bind('click', methods._confirm);
            $('.ipaOptionsCancel').bind('click', methods._cancel);


        },
        
        _confirm : function (event) {
            var $this = $(this);
            $this.trigger('pageOptionsConfirm.ipPageOptions');
        },
        
        _cancel : function (event) {
            var $this = $(this);
            $this.trigger('pageOptionsCancel.ipPageOptions');
        },
        
        
        getPageOptions : function () {

            var data = Object();

            data.buttonTitle = $('#formGeneral input[name="buttonTitle"]').val();
            data.visible = $('#formGeneral input[name="visible"]').attr('checked') ? 1 : 0;
            data.createdOn = $('#formGeneral input[name="createdOn"]').val();
            data.lastModified = $('#formGeneral input[name="lastModified"]').val();

            data.pageTitle = $('#formSEO input[name="pageTitle"]').val();
            data.keywords = $('#formSEO textarea[name="keywords"]').val();
            data.description = $('#formSEO textarea[name="description"]').val();
            data.url = $('#formSEO input[name="url"]').val();
            data.type = $('#formAdvanced input:checked[name="type"]').val();
            data.redirectURL = $('#formAdvanced input[name="redirectURL"]').val();
            data.layout = $('#formLayout select[name="layout"]').val();

            return data;
        }
        
    };
    
    

    $.fn.ipPageOptions = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipPageOptions');
        }
    };
    
    

})(jQuery);/*
 * jQuery UI Touch Punch 0.2.2
 *
 * Copyright 2011, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */

(function ($) {


    // Detect touch support
    $.support.touch = 'ontouchend' in document;

    // Ignore browsers without touch support
    if (!$.support.touch) {
        return;
    }

    var mouseProto = $.ui.mouse.prototype,
        _mouseInit = mouseProto._mouseInit,
        touchHandled;

    /**
     * Simulate a mouse event based on a corresponding touch event
     * @param {Object} event A touch event
     * @param {String} simulatedType The corresponding mouse event
     */
    function simulateMouseEvent (event, simulatedType) {

        // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
            return;
        }

        event.preventDefault();

        var touch = event.originalEvent.changedTouches[0],
            simulatedEvent = document.createEvent('MouseEvents');

        // Initialize the simulated mouse event using the touch event's coordinates
        simulatedEvent.initMouseEvent(
            simulatedType,    // type
            true,             // bubbles
            true,             // cancelable
            window,           // view
            1,                // detail
            touch.screenX,    // screenX
            touch.screenY,    // screenY
            touch.clientX,    // clientX
            touch.clientY,    // clientY
            false,            // ctrlKey
            false,            // altKey
            false,            // shiftKey
            false,            // metaKey
            0,                // button
            null              // relatedTarget
        );

        // Dispatch the simulated event to the target element
        event.target.dispatchEvent(simulatedEvent);
    }

    /**
     * Handle the jQuery UI widget's touchstart events
     * @param {Object} event The widget element's touchstart event
     */
    mouseProto._touchStart = function (event) {

        var self = this;

        // Ignore the event if another widget is already being handled
        if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
            return;
        }

        // Set the flag to prevent other widgets from inheriting the touch event
        touchHandled = true;

        // Track movement to determine if interaction was a click
        self._touchMoved = false;

        // Simulate the mouseover event
        simulateMouseEvent(event, 'mouseover');

        // Simulate the mousemove event
        simulateMouseEvent(event, 'mousemove');

        // Simulate the mousedown event
        simulateMouseEvent(event, 'mousedown');
    };

    /**
     * Handle the jQuery UI widget's touchmove events
     * @param {Object} event The document's touchmove event
     */
    mouseProto._touchMove = function (event) {

        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }

        // Interaction was not a click
        this._touchMoved = true;

        // Simulate the mousemove event
        simulateMouseEvent(event, 'mousemove');
    };

    /**
     * Handle the jQuery UI widget's touchend events
     * @param {Object} event The document's touchend event
     */
    mouseProto._touchEnd = function (event) {

        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }

        // Simulate the mouseup event
        simulateMouseEvent(event, 'mouseup');

        // Simulate the mouseout event
        simulateMouseEvent(event, 'mouseout');

        // If the touch interaction did not move, it should trigger a click
        if (!this._touchMoved) {

            // Simulate the click event
            simulateMouseEvent(event, 'click');
        }

        // Unset the flag to allow other widgets to inherit the touch event
        touchHandled = false;
    };

    /**
     * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
     * This method extends the widget with bound touch event handlers that
     * translate touch events to mouse events and pass them to the widget's
     * original mouse event handling methods.
     */
    mouseProto._mouseInit = function () {

        var self = this;

        // Delegate the touch handlers to the widget's element
        self.element
            .bind('touchstart', $.proxy(self, '_touchStart'))
            .bind('touchmove', $.proxy(self, '_touchMove'))
            .bind('touchend', $.proxy(self, '_touchEnd'));

        // Call the original $.ui.mouse init method
        _mouseInit.call(self);
    };

})(jQuery);



$( document ).ready(function() {
    "use strict";
    ipContentLayouts.init();
});

var ipContentLayouts = new function() {
    "use strict";

    this.init = function() {


    };


};


/**
 * @package ImpressPages
 *
 *
 */


(function ($) {
    "use strict";

    var methods = {
        init: function (options) {
            return this.each(function () {
                var $this = $(this);

                var $list = $this.find('.ipsList');
                $list.html('');

                var $itemTemplate = $this.find('.ipsItemTemplate');

                $.each(options.layouts, function(key, value) {
                    var $newItem = $itemTemplate.clone().detach().text(value.title).data('layout', value.name);
                    if (value.name == options.currentLayout) {
                        $newItem.addClass('active');
                        $newItem.on('click', function(e){
                            e.preventDefault();
                            $this.modal('hide');
                        })
                    } else {
                        $newItem.on('click', function(e){
                            e.preventDefault();
                            options.widgetObject.ipWidget('changeLayout', value.name);
                            $this.modal('hide');
                        })
                    }
                    $list.append($newItem);
                });

                $this.modal();

            });
        }
    }

    $.fn.ipLayoutModal = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipPageOptions');
        }
    };



})(jQuery);/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpHtml(widgetObject) {
    this.widgetObject = widgetObject;

    this.manageInit = manageInit;
    this.prepareData = prepareData;


    function manageInit() {
        var instanceData = this.widgetObject.data('ipWidget');
    }

    function prepareData() {

        var data = Object();

        data.html = this.widgetObject.find('textarea').val();
        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }

    

};


/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpImage(widgetObject, contentBody) {
    this.widgetObject = widgetObject;
    this.contentBody = contentBody;

    this.prepareData = prepareData;
    this.manageInit = manageInit;

    this.addError = addError;


    function manageInit() {
        var instanceData = this.widgetObject.data('ipWidget');
        var options = new Object;
        
        if (instanceData.data.imageOriginal) {
            options.image = instanceData.data.imageOriginal;
        }
        if (instanceData.data.cropX1) {
            options.cropX1 = instanceData.data.cropX1;
        }
        if (instanceData.data.cropY1) {
            options.cropY1 = instanceData.data.cropY1;
        }
        if (instanceData.data.cropX2) {
            options.cropX2 = instanceData.data.cropX2;
        }
        if (instanceData.data.cropY2) {
            options.cropY2 = instanceData.data.cropY2;
        }
        if (instanceData.data.imageWindowWidth) {
            options.windowWidth = instanceData.data.imageWindowWidth;
        }
        options.maxWindowWidth = this.contentBody.width();
        options.enableChangeHeight = true;
        options.enableChangeWidth = true;
        options.enableUnderscale = true;

        var $imageUploader = this.widgetObject.find('.ipaImage');
        $imageUploader.ipUploadImage(options);
        this.widgetObject.bind('error.ipUploadImage', {widgetController: this}, this.addError);

    }
    

    function addError(event, errorMessage) {
        $(this).trigger('error.ipContentManagement', errorMessage);
    }
    
    function removeError () {
        this.widgetObject.find('.ipaErrorContainer .ipaError').remove();
    }

    function prepareData() {
        var data = Object();
        var ipUploadImage = this.widgetObject.find('.ipaImage');
        if (ipUploadImage.ipUploadImage('getNewImageUploaded')) {
            var newImage = ipUploadImage.ipUploadImage('getCurImage');
            if (newImage) {
                data.newImage = newImage;
            }
        }
        
        if (ipUploadImage.ipUploadImage('getCropCoordinatesChanged') && ipUploadImage.ipUploadImage('getCurImage') != false) {
            var cropCoordinates = ipUploadImage.ipUploadImage('getCropCoordinates');
            if (cropCoordinates) {
                data.cropX1 = cropCoordinates.x1;
                data.cropY1 = cropCoordinates.y1;
                data.cropX2 = cropCoordinates.x2;
                data.cropY2 = cropCoordinates.y2;
            }
        }
        
        var windowWidth = ipUploadImage.ipUploadImage('getWindowWidth');
        var maxWidth = this.contentBody.width();
        data.maxWidth = this.widgetObject.width();
        data.scale = windowWidth / maxWidth;
        data.imageWindowWidth = windowWidth;
        data.title = this.widgetObject.find('.ipaImageTitle').val();
        
        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);        
    }



    

};

/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpText() {
    "use strict";

    this.init = function($widgetObject) {
        var customTinyMceConfig = ipTinyMceConfig();
        customTinyMceConfig.setup = function(ed, l) {ed.on('change', function(e) {
            $widgetObject.save({text: $widgetObject.find('.ipsContent').html()});
        })};

        $widgetObject.find('.ipsContent').tinymce(customTinyMceConfig);
    };


};


/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpTable(widgetObject) {
    this.widgetObject = widgetObject;

    this.manageInit = manageInit;
    this.prepareData = prepareData;


    function manageInit() {
        var instanceData = this.widgetObject.data('ipWidget');
        this.widgetObject.find('textarea').tinymce(ipTinyMceConfigTable);
    }

    function prepareData() {

        var data = Object();

        data.text = this.widgetObject.find('textarea').html();
        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }

    

};

      

/**
 * 
 * IpColumns Widget Controller
 * 
 * @package ImpressPages
 * @copyright Copyright (C) 2011 ImpressPages LTD.
 * @license GNU/GPL, see ip_license.html
 */

function IpWidget_IpColumns(widgetObject) {

    this.widgetObject = widgetObject;
    this.manageInit = manageInit;
    this.prepareData = prepareData;

    function manageInit() {
        //get widget data currently stored in the database
        var instanceData = this.widgetObject.data('ipWidget').data;

        //if widget has been already initialized
        if (instanceData.baseId) {
            //set input value
            this.widgetObject.find('input[name="baseId"]').val(instanceData.baseId);
        } else {
            //leave input empty
        }
    }

    function prepareData() {
        //create simple data object. It will be returned as the data to be stored.
        var data = {};
        data.baseId = this.widgetObject.find('input[name="baseId"]').val();
        data.columns = this.widgetObject.find('input[name="columns"]').val();
        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }

}
/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpTextImage(widgetObject) {
    this.widgetObject = widgetObject;

    this.prepareData = prepareData;

    this.addError = addError;

    this.manageInit = function() {
        this.widgetObject.find('.ipwText').tinymce(ipTinyMceConfig());
    }



//    function manageInit() {
//        var instanceData = this.widgetObject.data('ipWidget');
//        var options = new Object;
//
//        if (instanceData.data.imageOriginal) {
//            options.image = instanceData.data.imageOriginal;
//        }
//        if (instanceData.data.cropX1) {
//            options.cropX1 = instanceData.data.cropX1;
//        }
//        if (instanceData.data.cropY1) {
//            options.cropY1 = instanceData.data.cropY1;
//        }
//        if (instanceData.data.cropX2) {
//            options.cropX2 = instanceData.data.cropX2;
//        }
//        if (instanceData.data.cropY2) {
//            options.cropY2 = instanceData.data.cropY2;
//        }
//
//        options.enableChangeHeight = true;
//        options.enableChangeWidth = false;
//        options.enableUnderscale = true;
//
//        this.widgetObject.find('.ipaImage').ipUploadImage(options);
//        this.widgetObject.bind('error.ipUploadImage', {widgetController: this}, this.addError);
//
//
//        this.widgetObject.find('textarea').tinymce(ipTinyMceConfig());
//    }
    


    function prepareData() {
        var data = Object();

        var ipUploadImage = this.widgetObject.find('.ipaImage');
        if (ipUploadImage.ipUploadImage('getNewImageUploaded')) {
            var newImage = ipUploadImage.ipUploadImage('getCurImage');
            if (newImage) {
                data.newImage = newImage;
            }
        }
        
        if (ipUploadImage.ipUploadImage('getCropCoordinatesChanged') && ipUploadImage.ipUploadImage('getCurImage') != false) {
            var cropCoordinates = ipUploadImage.ipUploadImage('getCropCoordinates');
            if (cropCoordinates) {
                data.cropX1 = cropCoordinates.x1;
                data.cropY1 = cropCoordinates.y1;
                data.cropX2 = cropCoordinates.x2;
                data.cropY2 = cropCoordinates.y2;
            }
        }
        

        data.text = $(this.widgetObject).find('textarea').first().val();
        data.title = $(this.widgetObject).find('.ipaImageTitle').first().val();
        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }
    
    function addError(event, errorMessage) {
        $(this).trigger('error.ipContentManagement', errorMessage);
    }


    

};


/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpFaq(widgetObject) {
    this.widgetObject = widgetObject;

    this.manageInit = manageInit;
    this.prepareData = prepareData;


    function manageInit() {
        var instanceData = this.widgetObject.data('ipWidget');
        this.widgetObject.find('textarea').tinymce(ipTinyMceConfig());
    }

    function prepareData() {

        var data = Object();

        data.answer = this.widgetObject.find('.ipAdminTextarea').html();
        data.question = this.widgetObject.find('.ipAdminInput').val();
        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }



};

/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpImageGallery(widgetObject) {
    this.widgetObject = widgetObject;

    this.prepareData = prepareData;
    this.manageInit = manageInit;
    this.fileUploaded = fileUploaded;
    
    this.addError = addError;


    function manageInit() {
        var instanceData = this.widgetObject.data('ipWidget');

        this.widgetObject.find('.ipmBrowseButton').click(function(e){
            e.preventDefault();
            var repository = new ipRepository({preview: 'thumbnails', filter: 'image'});
            repository.bind('ipRepository.filesSelected', $.proxy(fileUploaded, widgetObject));
        });

        
        var container = this.widgetObject.find('.ipWidget_ipImageGallery_container');
        var options = new Object;
        if (instanceData.data.images) {
            options.images = instanceData.data.images;
        } else {
            options.images = new Array();
        }
        options.smallImageWidth = this.widgetObject.find('input[name="smallImageWidth"]').val();
        options.smallImageHeight = this.widgetObject.find('input[name="smallImageHeight"]').val();
        options.imageTemplate = this.widgetObject.find('.ipaImageTemplate');
        container.ipWidget_ipImageGallery_container(options);
        
        
        this.widgetObject.bind('fileUploaded.ipUploadFile', this.fileUploaded);
        this.widgetObject.bind('error.ipUploadImage', {widgetController: this}, this.addError);
        this.widgetObject.bind('error.ipUploadFile', {widgetController: this}, this.addError);
        
    }

    


    function addError(event, errorMessage) {
        $(this).trigger('error.ipContentManagement', [errorMessage]);
    }


    function fileUploaded(event, files) {
        var $this = $(this);

        var container = $this.find('.ipWidget_ipImageGallery_container');
        for(var index in files) {
            container.ipWidget_ipImageGallery_container('addImage', files[index].fileName, '', 'new');
        }
    }


    
    function prepareData() {
        var data = Object();
        var container = this.widgetObject.find('.ipWidget_ipImageGallery_container');
        
        data.images = new Array();
        $images = container.ipWidget_ipImageGallery_container('getImages');
        $images.each(function(index) {
            var $this = $(this);
            var tmpImage = new Object();
            tmpImage.title = $this.ipWidget_ipImageGallery_image('getTitle');
            tmpImage.fileName = $this.ipWidget_ipImageGallery_image('getFileName');
            tmpImage.status = $this.ipWidget_ipImageGallery_image('getStatus');
            var tmpCropCoordinates = $this.ipWidget_ipImageGallery_image('getCropCoordinates');
            tmpImage.cropX1 = tmpCropCoordinates.x1; 
            tmpImage.cropY1 = tmpCropCoordinates.y1; 
            tmpImage.cropX2 = tmpCropCoordinates.x2; 
            tmpImage.cropY2 = tmpCropCoordinates.y2; 
            
            
            data.images.push(tmpImage);

        });


        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }


};




(function($) {

    var methods = {
            
    init : function(options) {

        return this.each(function() {

            var $this = $(this);

            var data = $this.data('ipWidget_ipImageGallery_container');

            // If the plugin hasn't been initialized yet
            var images = null;
            if (options.images) {
                images = options.images;
            } else {
                images = new Array();
            }
            
            if (!data) {
                $this.data('ipWidget_ipImageGallery_container', {
                    images : images,
                    imageTemplate : options.imageTemplate,
                    smallImageWidth : options.smallImageWidth,
                    smallImageHeight : options.smallImageHeight
                });
                
                for (var i in images) {
                    var coordinates = new Object();
                    coordinates.cropX1 = images[i]['cropX1'];
                    coordinates.cropY1 = images[i]['cropY1'];
                    coordinates.cropX2 = images[i]['cropX2'];
                    coordinates.cropY2 = images[i]['cropY2'];
                    $this.ipWidget_ipImageGallery_container('addImage', images[i]['imageOriginal'], images[i]['title'], 'present', coordinates); 
                }
                $this.bind('removeImage.ipWidget_ipImageGallery', function(event, imageObject) {
                    var $imageObject = $(imageObject);
                    $imageObject.ipWidget_ipImageGallery_container('removeImage', $imageObject);
                });
                
                $( ".ipWidget_ipImageGallery_container" ).sortable();
                $( ".ipWidget_ipImageGallery_container" ).sortable('option', 'handle', '.ipaImageMove');

            }
        });
    },
    
    addImage : function (fileName, title, status, coordinates) {
        var $this = this;
        var data = $this.data('ipWidget_ipImageGallery_container');
        var $newImageRecord = $this.data('ipWidget_ipImageGallery_container').imageTemplate.clone();
        $newImageRecord.ipWidget_ipImageGallery_image({'smallImageWidth' : data.smallImageWidth, 'smallImageHeight' : data.smallImageHeight, 'status' : status, 'fileName' : fileName, 'title' : title, 'coordinates' : coordinates});
        var $uploader = $this.find('.ipmBrowseButton');
        if ($uploader.length > 0) {
            $($uploader).before($newImageRecord);
        } else {
            $this.append($newImageRecord);
        }
    },
    
    removeImage : function ($imageObject) {
        $imageObject.hide();
        $imageObject.ipWidget_ipImageGallery_image('setStatus', 'deleted');
        
    },
    
    getImages : function () {
        var $this = this;
        return $this.find('.ipaImageTemplate');
    }



    };

    $.fn.ipWidget_ipImageGallery_container = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);





(function($) {

    var methods = {
    init : function(options) {

        return this.each(function() {

            var $this = $(this);

            var data = $this.data('ipWidget_ipImageGallery_image');

            var status = 'new';
            if (options.status) {
                status = options.status;
            }
            
            // If the plugin hasn't been initialized yet
            if (!data) {
                var data = {
                    title : '',
                    fileName : '',
                    status : status,
                    smallImageWidth : options.smallImageWidth,
                    smallImageHeight : options.smallImageHeight
                };
                
                if (options.title) {
                    data.title = options.title;
                }
                if (options.fileName) {
                    data.fileName = options.fileName;
                }
                if (options.status) {
                    data.status = options.status;
                }
                
                $this.data('ipWidget_ipImageGallery_image', {
                    title : data.title,
                    fileName : data.fileName,
                    status : data.status
                });
                $this.find('.ipaImageTitle').val(data.title);
            }
            
            
            
            //$this.find('.ipaImage').attr('src', ipFileUrl(data.fileName));
            var imageOptions = new Object;
            imageOptions.image = data.fileName;
            if (options.coordinates) {
                imageOptions.cropX1 = options.coordinates.cropX1;
                imageOptions.cropY1 = options.coordinates.cropY1;
                imageOptions.cropX2 = options.coordinates.cropX2;
                imageOptions.cropY2 = options.coordinates.cropY2;
            }
            var ratio = options.smallImageWidth / options.smallImageHeight;
            imageOptions.windowWidth = 200;
            imageOptions.windowHeight = imageOptions.windowWidth / ratio;
            imageOptions.enableChangeWidth = false;
            imageOptions.enableChangeHeight = false;

            $this.find('.ipaImage').ipUploadImage(imageOptions);
            
            $this.find('.ipaImageRemove').bind('click', 
                function(event){
                    $this = $(this);
                    $this.trigger('removeClick.ipWidget_ipImageGallery');
                    return false;
                }
            );
            $this.bind('removeClick.ipWidget_ipImageGallery', function(event) {
                $this.trigger('removeImage.ipWidget_ipImageGallery', this);
            });
            return $this;
        });
    },
    
    getTitle : function() {
        var $this = this;
        return $this.find('.ipaImageTitle').val();
    },
    
    getFileName : function() {
        var $this = this;
        var curImage = $this.find('.ipaImage').ipUploadImage('getCurImage');
        return curImage;
    },
    
    getCropCoordinates : function() {
        var $this = this;
        var ipUploadImage = $this.find('.ipaImage');
        var cropCoordinates = ipUploadImage.ipUploadImage('getCropCoordinates');
        return cropCoordinates;
    },
        
    getStatus : function() {
        var $this = this;
        
        var tmpData = $this.data('ipWidget_ipImageGallery_image');
        if (tmpData.status == 'deleted') {
            return tmpData.status;
        }
        
        var ipUploadImage = $this.find('.ipaImage');
        if (tmpData.status == 'new' || ipUploadImage.ipUploadImage('getNewImageUploaded')) {
            return 'new';
        } else {
            if (ipUploadImage.ipUploadImage('getCropCoordinatesChanged') && ipUploadImage.ipUploadImage('getCurImage') != false) {
                return 'coordinatesChanged';
            }
        }
        
        var tmpData = $this.data('ipWidget_ipImageGallery_image');
        //status, set on creation. Usually 'new' or 'present'
        return tmpData.status;
    },
    
    setStatus : function(newStatus) {
        var $this = $(this);
        var tmpData = $this.data('ipWidget_ipImageGallery_image');
        tmpData.status = newStatus;
        $this.data('ipWidget_ipImageGallery_image', tmpData);
    }
    



    };

    $.fn.ipWidget_ipImageGallery_image = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);

/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpLogoGallery(widgetObject) {
    this.widgetObject = widgetObject;

    this.prepareData = prepareData;
    this.manageInit = manageInit;
    this.fileUploaded = fileUploaded;

    this.addError = addError;

    function manageInit() {
        var instanceData = this.widgetObject.data('ipWidget');

        this.widgetObject.find('.ipmBrowseButton').click(function(e){
            e.preventDefault();
            var repository = new ipRepository({preview: 'thumbnails', filter: 'image'});
            repository.bind('ipRepository.filesSelected', $.proxy(fileUploaded, widgetObject));
        });


        
        var container = this.widgetObject.find('.ipWidget_ipLogoGallery_container');
        var options = new Object;
        if (instanceData.data.logos) {
            options.logos = instanceData.data.logos;
        } else {
            options.logos = new Array();
        }
        options.logoWidth = this.widgetObject.find('input[name="logoWidth"]').val();
        options.logoHeight = this.widgetObject.find('input[name="logoHeight"]').val();
        options.logoTemplate = this.widgetObject.find('.ipaLogoTemplate');
        container.ipWidget_ipLogoGallery_container(options);
        
        
        this.widgetObject.bind('fileUploaded.ipUploadFile', this.fileUploaded);
        this.widgetObject.bind('error.ipUploadImage', {widgetController: this}, this.addError);
        this.widgetObject.bind('error.ipUploadFile', {widgetController: this}, this.addError);
        
        
    }

    function addError(event, errorMessage) {
        $(this).trigger('error.ipContentManagement', [errorMessage]);
    }    
    
    function fileUploaded(event, files) {
        var $this = $(this);

        var container = $this.find('.ipWidget_ipLogoGallery_container');
        for(var index in files) {
            container.ipWidget_ipLogoGallery_container('addLogo', files[index].fileName, '', '');
        }

    }
    

    
    function prepareData() {
        var data = Object();
        var container = this.widgetObject.find('.ipWidget_ipLogoGallery_container');
        
        data.logos = new Array();
        $logos = container.ipWidget_ipLogoGallery_container('getLogos');
        $logos.each(function(index) {
            var $this = $(this);
            var tmpLogo = new Object();
            tmpLogo.title = $this.ipWidget_ipLogoGallery_logo('getTitle');
            tmpLogo.link = $this.ipWidget_ipLogoGallery_logo('getLink');
            tmpLogo.fileName = $this.ipWidget_ipLogoGallery_logo('getFileName');
            tmpLogo.status = $this.ipWidget_ipLogoGallery_logo('getStatus');
            var tmpCropCoordinates = $this.ipWidget_ipLogoGallery_logo('getCropCoordinates');
            tmpLogo.cropX1 = tmpCropCoordinates.x1; 
            tmpLogo.cropY1 = tmpCropCoordinates.y1; 
            tmpLogo.cropX2 = tmpCropCoordinates.x2; 
            tmpLogo.cropY2 = tmpCropCoordinates.y2; 
            
            
            data.logos.push(tmpLogo);

        });


        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }


};




(function($) {

    var methods = {
            
    init : function(options) {

        return this.each(function() {

            var $this = $(this);

            var data = $this.data('ipWidget_ipLogoGallery_container');

            // If the plugin hasn't been initialized yet
            var logos = null;
            if (options.logos) {
                logos = options.logos;
            } else {
                logos = new Array();
            }

            
            if (!data) {
                $this.data('ipWidget_ipLogoGallery_container', {
                    logos : logos,
                    logoTemplate : options.logoTemplate,
                    logoWidth : options.logoWidth,
                    logoHeight : options.logoHeight
                });

                for (var i in logos) {
                    var coordinates = new Object();
                    coordinates.cropX1 = logos[i]['cropX1'];
                    coordinates.cropY1 = logos[i]['cropY1'];
                    coordinates.cropX2 = logos[i]['cropX2'];
                    coordinates.cropY2 = logos[i]['cropY2'];
                    $this.ipWidget_ipLogoGallery_container('addLogo', logos[i]['logoOriginal'], logos[i]['title'], logos[i]['link'], 'present', coordinates); 
                }
                $this.bind('removeLogo.ipWidget_ipLogoGallery', function(event, logoObject) {
                    var $logoObject = $(logoObject);
                    $logoObject.ipWidget_ipLogoGallery_container('removeLogo', $logoObject);
                });
                
                $( ".ipWidget_ipLogoGallery_container" ).sortable();
                $( ".ipWidget_ipLogoGallery_container" ).sortable('option', 'handle', '.ipaLogoMove');

            }
        });
    },
    
    addLogo : function (fileName, title, link, status, coordinates) {
        var $this = this;
        var data = $this.data('ipWidget_ipLogoGallery_container');
        var $newLogoRecord = $this.data('ipWidget_ipLogoGallery_container').logoTemplate.clone();
        $newLogoRecord.ipWidget_ipLogoGallery_logo({'logoWidth' : data.logoWidth, 'logoHeight' : data.logoHeight, 'status' : status, 'fileName' : fileName, 'title' : title, 'link' : link, 'coordinates' : coordinates});
        var $uploader = $this.find('.ipmBrowseButton');
        if ($uploader.length > 0) {
            $($uploader).before($newLogoRecord);
        } else {
            $this.append($newLogoRecord);
        }
    },
    
    removeLogo : function ($logoObject) {
        $logoObject.hide();
        $logoObject.ipWidget_ipLogoGallery_logo('setStatus', 'deleted');
        
    },
    
    getLogos : function () {
        var $this = this;
        return $this.find('.ipaLogoTemplate');
    }



    };

    $.fn.ipWidget_ipLogoGallery_container = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);





(function($) {

    var methods = {
    init : function(options) {

        return this.each(function() {

            var $this = $(this);

            var data = $this.data('ipWidget_ipLogoGallery_logo');

            var status = 'new';
            if (options.status) {
                status = options.status;
            }
            
            // If the plugin hasn't been initialized yet
            if (!data) {
                var data = {
                    title : '',
                    link : '',
                    fileName : '',
                    status : status,
                    logoWidth : options.logoWidth,
                    logoHeight : options.logoHeight
                };
                
                if (options.title) {
                    data.title = options.title;
                }
                if (options.link) {
                    data.link = options.link;
                }
                if (options.fileName) {
                    data.fileName = options.fileName;
                }
                if (options.status) {
                    data.status = options.status;
                }
                
                $this.data('ipWidget_ipLogoGallery_logo', {
                    title : data.title,
                    link : data.link,
                    fileName : data.fileName,
                    status : data.status
                });
                $this.find('.ipaLogoTitle').val(data.title);
            }
            
            
            
            //$this.find('.ipaLogo').attr('src', ipFileUrl(data.fileName));
            var logoOptions = new Object;
            logoOptions.image = data.fileName;
            if (options.coordinates) {
                logoOptions.cropX1 = options.coordinates.cropX1;
                logoOptions.cropY1 = options.coordinates.cropY1;
                logoOptions.cropX2 = options.coordinates.cropX2;
                logoOptions.cropY2 = options.coordinates.cropY2;
            }
            var ratio = options.logoWidth / options.logoHeight;
            logoOptions.windowWidth = 200;
            logoOptions.windowHeight = options.logoWidth / ratio;
            logoOptions.enableChangeWidth = false;
            logoOptions.enableChangeHeight = false;
            logoOptions.enableScale = false;
            logoOptions.enableFraming = false;
            logoOptions.enableUnderscale = true;
            logoOptions.autosizeType = 'fit';

            $this.find('.ipaLogo').ipUploadImage(logoOptions);
            
            

            
            
            $this.find('.ipaLogoRemove').bind('click', 
                function(event){
                    $this = $(this);
                    $this.trigger('removeClick.ipWidget_ipLogoGallery');
                    return false;
                }
            );
            $this.find('.ipaLogoLink').bind('click', 
                    function(event){
                        $this = $(this);
                        $this.trigger('linkClick.ipWidget_ipLogoGallery');
                        return false;
                    }
                );
            $this.bind('removeClick.ipWidget_ipLogoGallery', function(event) {
                $this.trigger('removeLogo.ipWidget_ipLogoGallery', this);
            });
            $this.bind('linkClick.ipWidget_ipLogoGallery', function(event) {
                $this = $(this);
                var data = $this.data('ipWidget_ipLogoGallery_logo');
                var newLink;
                newLink = prompt('Where this logo should link?', data.link)
                if (newLink !== null) {
                    data.link = newLink;
                    $this.data('ipWidget_ipLogoGallery_logo', data);
                }
            });
            return $this;
        });
    },
    
    getTitle : function() {
        var $this = this;
        return $this.find('.ipaLogoTitle').val();
    },
    
    
    getLink : function() {
        var $this = this;
        return $this.data('ipWidget_ipLogoGallery_logo').link;
    },
    
    getFileName : function() {
        var $this = this;
        var curImage = $this.find('.ipaLogo').ipUploadImage('getCurImage');
        return curImage;
    },
    
    getCropCoordinates : function() {
        var $this = this;
        var ipUploadLogo = $this.find('.ipaLogo');
        var cropCoordinates = ipUploadLogo.ipUploadImage('getCropCoordinates');
        return cropCoordinates;
    },
        
    getStatus : function() {
        var $this = this;
        
        var tmpData = $this.data('ipWidget_ipLogoGallery_logo');
        if (tmpData.status == 'deleted') {
            return tmpData.status;
        }
        
        var ipUploadLogo = $this.find('.ipaLogo');
        if (tmpData.status == 'new' || ipUploadLogo.ipUploadImage('getNewImageUploaded')) {
            return 'new';
        } else {
            if (ipUploadLogo.ipUploadImage('getCropCoordinatesChanged') && ipUploadLogo.ipUploadImage('getCurImage') != false) {
                return 'coordinatesChanged';
            }
        }
        
        var tmpData = $this.data('ipWidget_ipLogoGallery_logo');
        //status, set on creation. Usually 'new' or 'present'
        return tmpData.status;
    },
    
    setStatus : function(newStatus) {
        var $this = $(this);
        var tmpData = $this.data('ipWidget_ipLogoGallery_logo');
        tmpData.status = newStatus;
        $this.data('ipWidget_ipLogoGallery_logo', tmpData);
    }
    



    };

    $.fn.ipWidget_ipLogoGallery_logo = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);

/**
 * @package ImpressPages
 *
 *
 */
function IpWidget_IpTitle(widgetObject) {
    "use strict";
    this.widgetObject = null;
    this.data = null;

    this.init = function ($widgetObject, data, editMode) {
        this.widgetObject = $widgetObject;
        this.data = data;


        var customTinyMceConfig = ipTinyMceConfig();
        customTinyMceConfig.menubar = false;
        customTinyMceConfig.toolbar = false;
        customTinyMceConfig.setup = function(ed, l) {
            ed.on('change', function(e) {
                $widgetObject.save({title: $widgetObject.find('h1,h2,h3,h4,h5,h6').html()});
            });
        };
        customTinyMceConfig.paste_as_text = true;
        customTinyMceConfig.valid_elements = '';
            customTinyMceConfig.custom_shortcuts = false;

        $widgetObject.find('h1,h2,h3,h4,h5,h6').tinymce(customTinyMceConfig);


        //TODOX refactor this functionality
        var $self = this.widgetObject;
        $self.find('.ipsTitleOptionsButton').on('click', function (e) {
            $self.find('.ipsTitleOptions').toggle();
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        $self.find('.ipsAnchor').on('keydown', $.proxy(updateAnchor, this));
        $self.find('.ipsAnchor').on('change', $.proxy(updateAnchor, this));
        $self.find('.ipsAnchor').on('keyup', $.proxy(updateAnchor, this));

    };

    var updateAnchor = function () {
        var  $preview = this.widgetObject.find('.ipsAnchorPreview');
        var curText = $preview.text();
        var newText = curText.split('#')[0] + '#' + this.widgetObject.find('.ipsAnchor').val();
        $preview.text(newText);
    }

    this.prepareData = function () {
        var widgetInputs = this.widgetObject.find('.ipaBody').find(':input');
        var data = {};
        widgetInputs.each(function (index) {
            data[$(this).attr('name')] = $(this).val();
        });
        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }

};

/**
 * @package ImpressPages
 *
 *
 */

function IpWidget_IpFile(widgetObject) {
    this.widgetObject = widgetObject;

    this.prepareData = prepareData;
    this.manageInit = manageInit;
    this.fileUploaded = fileUploaded;

    this.addError = addError;

    function manageInit() {
        var instanceData = this.widgetObject.data('ipWidget');
        
        var uploader = this.widgetObject.find('.ipaUpload');
        var options = new Object;
        uploader.ipUploadFile(options);
        
        var container = this.widgetObject.find('.ipWidget_ipFile_container');
        var options = new Object;
        if (instanceData.data.files) {
            options.files = instanceData.data.files;
        } else {
            options.files = new Array();
        }
        options.fileTemplate = this.widgetObject.find('.ipaFileTemplate');
        container.ipWidget_ipFile_container(options);
        
        
        this.widgetObject.bind('fileUploaded.ipUploadFile', this.fileUploaded);
        this.widgetObject.bind('error.ipUploadFile', this.addError);

        var widgetObject = this.widgetObject;
        this.widgetObject.find('.ipmBrowseButton').click(function(e){
            e.preventDefault();
            var repository = new ipRepository({preview: 'list'});
            repository.bind('ipRepository.filesSelected', $.proxy(fileUploaded, widgetObject));
        });
        
    }
    
    function addError(event, errorMessage) {
        $(this).trigger('error.ipContentManagement', [errorMessage]);
    }

    
    function fileUploaded(event, files) {
        /* we are in widgetObject context */
        var $this = $(this);

        var container = $this.find('.ipWidget_ipFile_container');
        for(var index in files) {
            container.ipWidget_ipFile_container('addFile', files[index].fileName, files[index].fileName, 'new');
        }
    }
    

    
    function prepareData() {
        var data = Object();
        var container = this.widgetObject.find('.ipWidget_ipFile_container');
        
        data.files = new Array();
        var $files = container.ipWidget_ipFile_container('getFiles');
        $files.each(function(index) {
            var $this = $(this);
            var tmpFile = new Object();
            tmpFile.title = $this.ipWidget_ipFile_file('getTitle');
            tmpFile.fileName = $this.ipWidget_ipFile_file('getFileName');
            tmpFile.status = $this.ipWidget_ipFile_file('getStatus');
            data.files.push(tmpFile);

        });


        $(this.widgetObject).trigger('preparedWidgetData.ipWidget', [ data ]);
    }


};




(function($) {

    var methods = {
            
    init : function(options) {

        return this.each(function() {

            var $this = $(this);

            var data = $this.data('ipWidget_ipFile_container');

            // If the plugin hasn't been initialized yet
            var files = null;
            if (options.files) {
                files = options.files;
            } else {
                files = new Array();
            }
            
            if (!data) {
                $this.data('ipWidget_ipFile_container', {
                    files : files,
                    fileTemplate : options.fileTemplate
                });
                
                for (var i in files) {
                    $this.ipWidget_ipFile_container('addFile', files[i]['fileName'], files[i]['title'], 'present'); 
                }
                $this.bind('removeFile.ipWidget_ipFile', function(event, fileObject) {
                    var $fileObject = $(fileObject);
                    $fileObject.ipWidget_ipFile_container('removeFile', $fileObject);
                });
                
                $( ".ipWidget_ipFile_container" ).sortable();
                $( ".ipWidget_ipFile_container" ).sortable('option', 'handle', '.ipaFileMove');
                

            }
        });
    },
    
    addFile : function (fileName, title, status) {
        var $this = this;
        var $newFileRecord = $this.data('ipWidget_ipFile_container').fileTemplate.clone();
        $newFileRecord.ipWidget_ipFile_file({'status' : status, 'fileName' : fileName, 'title' : title});
        
        $this.append($newFileRecord);
        
    },
    
    removeFile : function ($fileObject) {
        $fileObject.hide();
        $fileObject.ipWidget_ipFile_file('setStatus', 'deleted');
        
    },
    
    getFiles : function () {
        var $this = this;
        return $this.find('.ipaFileTemplate');
    }



    };

    $.fn.ipWidget_ipFile_container = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);





(function($) {

    var methods = {
    init : function(options) {

        return this.each(function() {

            var $this = $(this);

            var data = $this.data('ipWidget_ipFile_file');

            
            // If the plugin hasn't been initialized yet
            if (!data) {
                var data = {
                    title : '',
                    fileName : '',
                    status : 'new'
                };
                
                if (options.title) {
                    data.title = options.title;
                }
                if (options.fileName) {
                    data.fileName = options.fileName;
                }
                if (options.status) {
                    data.status = options.status;
                }
                
                $this.data('ipWidget_ipFile_file', {
                    title : data.title,
                    fileName : data.fileName,
                    status : data.status
                });
                $this.find('.ipaFileTitle').val(data.title);
            }
            
            $this.find('.ipaFileLink').attr('href', ipFileUrl('file/repository/' + data.fileName));
            $this.find('.ipaFileRemove').bind('click', function(event){
                event.preventDefault();
                $this = $(this);
                $this.trigger('removeClick.ipWidget_ipFile');
            });
            $this.bind('removeClick.ipWidget_ipFile', function(event) {
                $this.trigger('removeFile.ipWidget_ipFile', this);
            });
            return $this;
        });
    },
    
    getTitle : function() {
        var $this = this;
        return $this.find('.ipaFileTitle').val();
    },
    
    getFileName : function() {
        var $this = this;
        var tmpData = $this.data('ipWidget_ipFile_file');
        return tmpData.fileName;
    },
        
    getStatus : function() {
        var $this = this;
        var tmpData = $this.data('ipWidget_ipFile_file');
        return tmpData.status;
    },
    
    setStatus : function(newStatus) {
        var $this = $(this);
        var tmpData = $this.data('ipWidget_ipFile_file');
        tmpData.status = newStatus;
        $this.data('ipWidget_ipFile_file', tmpData);
        
    }
    



    };

    $.fn.ipWidget_ipFile_file = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);

/**
 * @package ImpressPages
 *
 *
 */




/**
 * General Field
 */
(function($) {
    "use strict";
    var methods = {
        init : function(options) {
            if (typeof options !== 'object') {
                options = {};
            }

            return this.each(function() {

                var $this = $(this);

                var data = $this.data('ipWidget_ipForm_field');


                // If the plugin hasn't been initialized yet
                if (!data) {
                    var data = {
                        label : '',
                        type : 'IpText',
                        required : false,
                        status : 'new',
                        options : {}
                    };
                    if (options.label) {
                        data.label = options.label;
                    }
                    if (options.type) {
                        data.type = options.type;
                    }
                    if (options.required && options.required != '0' && options.required != 'false') {
                        data.required = 1;
                    } else {
                        data.required = 0;
                    }
                    if (options.status) {
                        data.status = options.status;
                    }
                    $this.data('ipWidget_ipForm_field', {
                        label : data.label,
                        type : data.type,
                        required : data.required,
                        status : data.status,
                        optionsPopup : options.optionsPopup
                    });

                    $this.find('.ipaFieldLabel').val(data.label);
                    $this.find('.ipaFieldType').val(data.type);
                    $this.find('.ipaFieldType').bind('change', function() {$(this).trigger('changeType.ipWidget_ipForm', [$(this).val()]);});
                    $this.bind('changeType.ipWidget_ipForm', function(e, type) {
                        $(this).ipWidget_ipForm_field('setType', type);
                    });

                    $(this).ipWidget_ipForm_field('setType', data.type);

                    if (options.options) {
                        $this.ipWidget_ipForm_field('setOptions', options.options);
                    }

                    if (options.required && options.required != 0) {
                        $this.find('.ipaFieldRequired').attr('checked', options.required);
                    }
                }

                var $thisForEvent = $this;
                $this.find('.ipaFieldRemove').bind('click', function(event){
                    $thisForEvent.ipWidget_ipForm_field('setStatus', 'deleted');
                    $thisForEvent.hide();
                    event.preventDefault();
                });
                return $this;
            });
        },

        openOptionsPopup : function () {
            var $this = this;
            var data = $this.data('ipWidget_ipForm_field');
            var $thisForEvent = $this;
            data.optionsPopup.bind('saveOptions.ipWidget_ipForm', function(e,options){
                $this = $(this); //we are in popup context
                $this.unbind('saveOptions.ipWidget_ipForm');
                $thisForEvent.ipWidget_ipForm_field('setOptions', options);
            });

            data.optionsPopup.ipWidget_ipForm_options('showOptions', data.type, $this.ipWidget_ipForm_field('getOptions'));
        },

        setOptions : function (options) {
            var $this = this;
            var data = $this.data('ipWidget_ipForm_field');
            if (!data.options) {
                data.options = {};
            }
            data.options[$this.ipWidget_ipForm_field('getType')] = options; //store separte options for each type. Just to avoid accidental removal of options on type change
            $this.data('ipWidget_ipForm_field', data);
        },

        getOptions : function () {
            var $this = $(this);
            var data = $this.data('ipWidget_ipForm_field');
            if (data.options && data.options[$this.ipWidget_ipForm_field('getType')]) {
                //store separte options for each type. Just to avoid accidental removal of options on type change
                //nevertheless only one type options will be stored to the database
                return data.options[$this.ipWidget_ipForm_field('getType')];
            } else {
                return null;
            }
        },

        getLabel : function() {
            var $this = this;
            return $this.find('.ipaFieldLabel').val();
        },

        getType : function() {
            var $this = this;
            return $this.find('.ipaFieldType').val();
        },

        setType : function(type) {
            var $this = this;
            var data = $this.data('ipWidget_ipForm_field');
            if (data.optionsPopup.ipWidget_ipForm_options('optionsAvailable', type)) {
                $this.find('.ipaFieldOptions').css('visibility', 'visible');
                $this.find('.ipaFieldOptions').bind('click', function() {$(this).trigger('optionsClick.ipWidget_ipForm'); return false;});
                $this.bind('optionsClick.ipWidget_ipForm', function() {$(this).ipWidget_ipForm_field('openOptionsPopup');});
            } else {
                $this.find('.ipaFieldOptions').css('visibility', 'hidden');
            }
            data.type = type;
            $this.data('ipWidget_ipForm_field', data);
        },

        getStatus : function() {
            var $this = this;
            var tmpData = $this.data('ipWidget_ipForm_field');
            return tmpData.status;
        },

        setStatus : function(newStatus) {
            var $this = this;
            var tmpData = $this.data('ipWidget_ipForm_field');
            tmpData.status = newStatus;
            $this.data('ipWidget_ipForm_field', tmpData);

        },

        getRequired : function () {
            var $this = $(this);
            return $this.find('.ipaFieldRequired').is(':checked');
        }




    };




    $.fn.ipWidget_ipForm_field = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);


/**
 * @package ImpressPages
 *
 *
 */


/**
 * Widget initialization
 */
function IpWidget_IpForm() {
    "use strict";
    this.data = null;
    this.modal = null;
    this.container = null;
    this.addButton = null;
    this.confirmButton = null;


    this.init = function($widgetObject, data) {
        this.data = data;
        this.widgetObject = $widgetObject;

        var $widgetOverlay = $('<div></div>')
            .css('position', 'absolute')
            .css('z-index', 5)
            .width(this.widgetObject.width())
            .height(this.widgetObject.height());
        this.widgetObject.prepend($widgetOverlay);
        $widgetOverlay.on('click', $.proxy(openPopup, this));
    };



    var openPopup = function ()
    {
        this.modal = $('#ipWidgetFormPopup');
        this.addButton = this.modal.find(".ipaFieldAdd");
        this.container = this.modal.find('.ipWidget_ipForm_container');
        this.confirmButton = this.modal.find('.ipsConfirm');
        this.modal.modal();

        this.modal.on('hidden.bs.modal', $.proxy(cleanup, this));
        this.modal.on('hidden.bs.modal', $.proxy(cleanup, this));
        this.confirmButton.on('click', $.proxy(save, this));

        var instanceData = this.data;

        var options = new Object;
        if (instanceData['fields']) {
            options.fields = instanceData.fields;
        } else {
            options.fields = new Array();
        }

        options.fieldTemplate = this.modal.find('.ipaFieldTemplate');

        options.optionsPopup = this.modal.find(".ipaFieldOptionsPopup").ipWidget_ipForm_options({fieldTypes : instanceData.fieldTypes});
        this.container.ipWidget_ipForm_container(options);


        this.addButton.on('click', $.proxy(addField, this));
//        var customTinyMceConfig = ipTinyMceConfig();
//        customTinyMceConfig.height = 100;
//        this.modal.find(".ipWidgetIpFormSuccess").tinymce(customTinyMceConfig);
    };


    var cleanup = function() {
        this.container.html('');
        this.container.ipWidget_ipForm_container('destroy');
        this.addButton.off();
        this.confirmButton.off();
    }
    
    var addField = function (e) {

        this.container.ipWidget_ipForm_container('addField');
    };
    

    var save = function(e) {console.log('save');
        var data = this.getData();
        this.widgetObject.save(data, 1);
        this.modal.modal('hide');
    };
    
    this.getData = function() {
        var data = Object();

        data.fields = new Array();
        var $fields = this.container.ipWidget_ipForm_container('getFields');
        $fields.each(function(index) {
            var $this = $(this);
            var tmpField = new Object();
            tmpField.label = $this.ipWidget_ipForm_field('getLabel');
            tmpField.type = $this.ipWidget_ipForm_field('getType');
            tmpField.options = $this.ipWidget_ipForm_field('getOptions');
            if ($this.ipWidget_ipForm_field('getRequired')) {
                tmpField.required = 1;
            } else {
                tmpField.required = 0;
            }
            var status = $this.ipWidget_ipForm_field('getStatus');
            if (status != 'deleted') {
                data.fields.push(tmpField);
            }

        });

        data.success = this.widgetObject.find('.ipWidgetIpFormSuccess').html();
        return data;
    };


};




/**
 * @package ImpressPages
 *
 *
 */



/**
 * Fields container
 */
(function($) {
    "use strict";
    var methods = {
        init : function(options) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('ipWidget_ipForm_container');
                // If the plugin hasn't been initialized yet
                var fields = null;
                if (options.fields) {
                    fields = options.fields;
                } else {
                    fields = new Array();
                }

                if (!data) {
                    $this.data('ipWidget_ipForm_container', {
                        fields : fields,
                        fieldTemplate : options.fieldTemplate,
                        optionsPopup : options.optionsPopup
                    });

                    if (! fields instanceof Array) {
                        fields = new Array();
                    }

                    for (var i in fields) {
                        $this.ipWidget_ipForm_container('addField', fields[i]);
                    }
                    $this.sortable();
                    $this.sortable('option', 'handle', '.ipaFieldMove');

                }
            });
        },

        addField : function (fieldData) {
            var $this = this;
            if (typeof fieldData !== 'object') {
                fieldData = {};
            }
            var data = fieldData;
            data.optionsPopup = $this.data('ipWidget_ipForm_container').optionsPopup;
            var $newFieldRecord = $this.data('ipWidget_ipForm_container').fieldTemplate.clone();
            $newFieldRecord.ipWidget_ipForm_field(data);

            $this.append($newFieldRecord);

        },



        getFields : function () {
            var $this = this;
            return $this.find('.ipaFieldTemplate');
        },

        destroy : function () {
            return this.each(function() {
                var $this = this;
                $.removeData($this, 'ipWidget_ipForm_container');
            });
        }

    };

    $.fn.ipWidget_ipForm_container = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);
/**
 * @package ImpressPages
 *
 *
 */


/**
 * Options popup
 */
(function($) {
    "use strict";

    var methods = {
        init : function(options) {
            if (!options) {
                options = {};
            }

            return this.each(function() {
                var $this = $(this);
                var data = $this.data('ipWidget_ipForm_options');
                // If the plugin hasn't been initialized yet
                if (!data) {
                    var data = {
                        fieldTypes : options.fieldTypes
                    };
                    $this.data('ipWidget_ipForm_options', data);
                }

                return $this;
            });
        },

        showOptions : function(fieldType, currentOptions) {
            var $this = this;
            var fieldType = $this.ipWidget_ipForm_options('getFieldType', fieldType);
            $this.html(fieldType.optionsHtml);
            $this.dialog({
                modal: true,
                buttons: {
                    "Save": function() {
                        var $this = $(this);
                        eval ('var options = ' + fieldType.optionsSaveFunction + '($this);');
                        $this.dialog( "close" );
                        $this.trigger('saveOptions.ipWidget_ipForm', [options]);
                    },
                    "Cancel": function() {
                        $( this ).dialog( "close" );
                    }
                }

            });
            eval ('' + fieldType.optionsInitFunction + '($this, currentOptions);');
        },



        getFieldType : function (fieldType) {
            var $this = this;
            var data = $this.data('ipWidget_ipForm_options');
            return data.fieldTypes[fieldType];
        },

        optionsAvailable : function (fieldTypeKey) {
            var $this = this;
            var fieldType = $this.ipWidget_ipForm_options('getFieldType', fieldTypeKey);
            return (fieldType && (fieldType.optionsInitFunction || fieldType.optionsHtml));

        }


    };



    $.fn.ipWidget_ipForm_options = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.ipAdminWidgetButton');
        }

    };

})(jQuery);

