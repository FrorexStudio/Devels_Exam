/**
 * @file
 * JavaScript behaviors for CodeMirror integration.
 */

(function ($, Drupal) {

  'use strict';

  // @see http://codemirror.net/doc/manual.html#config
  Drupal.webform = Drupal.webform || {};
  Drupal.webform.codeMirror = Drupal.webform.codeMirror || {};
  Drupal.webform.codeMirror.options = Drupal.webform.codeMirror.options || {};

  /**
   * Initialize CodeMirror editor.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformCodeMirror = {
    attach: function (context) {
      if (!window.CodeMirror) {
        return;
      }

      // Webform CodeMirror editor.
      $(context).find('textarea.js-webform-codemirror').once('webform-codemirror').each(function () {
        var $input = $(this);

        // Open all closed details, so that editor height is correctly calculated.
        var $details = $input.parents('details:not([open])');
        $details.attr('open', 'open');

        // #59 HTML5 required attribute breaks hack for webform submission.
        // https://github.com/marijnh/CodeMirror-old/issues/59
        $input.removeAttr('required');

        var options = $.extend({
          mode: $input.attr('data-webform-codemirror-mode'),
          lineNumbers: true,
          lineWrapping: ($input.attr('wrap') !== 'off'),
          viewportMargin: Infinity,
          readOnly: !!($input.prop('readonly') || $input.prop('disabled')),
          extraKeys: {
            // Setting for using spaces instead of tabs - https://github.com/codemirror/CodeMirror/issues/988
            Tab: function (cm) {
              var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
              cm.replaceSelection(spaces, 'end', '+element');
            },
            // On 'Escape' move to the next tabbable input.
            // @see http://bgrins.github.io/codemirror-accessible/
            Esc: function (cm) {
              // Must show and then textarea so that we can determine
              // its tabindex.
              var textarea = $(cm.getTextArea());
              $(textarea).show().addClass('visually-hidden');
              var $tabbable = $(':tabbable');
              var tabindex = $tabbable.index(textarea);
              $(textarea).hide().removeClass('visually-hidden');

              // Tabindex + 2 accounts for the CodeMirror's iframe.
              $tabbable.eq(tabindex + 2).trigger('focus');
            }

          }
        }, Drupal.webform.codeMirror.options);

        var editor = CodeMirror.fromTextArea(this, options);

        // Now, close details.
        $details.removeAttr('open');

        // Apply the textarea's min/max-height to the CodeMirror editor.
        if ($input.css('min-height')) {
          var minHeight = $input.css('min-height');
          $(editor.getWrapperElement())
            .css('min-height', minHeight)
            .find('.CodeMirror-scroll')
            .css('min-height', minHeight);
        }
        if ($input.css('max-height')) {
          var maxHeight = $input.css('max-height');
          $(editor.getWrapperElement())
            .css('max-height', maxHeight)
            .find('.CodeMirror-scroll')
            .css('max-height', maxHeight);
        }

        // Issue #2764443: CodeMirror is not setting submitted value when
        // rendered within a webform UI dialog or within an Ajaxified element.
        var changeTimer = null;
        editor.on('change', function () {
          if (changeTimer) {
            window.clearTimeout(changeTimer);
            changeTimer = null;
          }
          changeTimer = setTimeout(function () {editor.save();}, 500);
        });

        // Update CodeMirror when the textarea's value has changed.
        // @see webform.states.js
        $input.on('change', function () {
          editor.getDoc().setValue($input.val());
        });

        // Set CodeMirror to be readonly when the textarea is disabled.
        // @see webform.states.js
        $input.on('webform:disabled', function () {
          editor.setOption('readOnly', $input.is(':disabled'));
        });

        // Delay refreshing CodeMirror for 500 millisecond while the dialog is
        // still being rendered.
        // @see http://stackoverflow.com/questions/8349571/codemirror-editor-is-not-loading-content-until-clicked
        setTimeout(function () {
          // Show tab panel and open details.
          var $tabPanel = $input.parents('.ui-tabs-panel:hidden');
          var $details = $input.parents('details:not([open])');

          if (!$tabPanel.length && $details.length) {
            return;
          }

          $tabPanel.show();
          $details.attr('open', 'open');

          editor.refresh();

          // Hide tab panel and close details.
          $tabPanel.hide();
          $details.removeAttr('open');
        }, 500);
      });

      // Webform CodeMirror syntax coloring.
      if (window.CodeMirror.runMode) {
        $(context).find('.js-webform-codemirror-runmode').once('webform-codemirror-runmode').each(function () {
          // Mode Runner - http://codemirror.net/demo/runmode.html
          CodeMirror.runMode($(this).addClass('cm-s-default').text(), $(this).attr('data-webform-codemirror-mode'), this);
        });
      }

    }
  };

})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  Drupal.theme.progressBar = function (id) {
    return "<div id=\"".concat(id, "\" class=\"progress\" aria-live=\"polite\">") + '<div class="progress__label">&nbsp;</div>' + '<div class="progress__track"><div class="progress__bar"></div></div>' + '<div class="progress__percentage"></div>' + '<div class="progress__description">&nbsp;</div>' + '</div>';
  };

  Drupal.ProgressBar = function (id, updateCallback, method, errorCallback) {
    this.id = id;
    this.method = method || 'GET';
    this.updateCallback = updateCallback;
    this.errorCallback = errorCallback;
    this.element = $(Drupal.theme('progressBar', id));
  };

  $.extend(Drupal.ProgressBar.prototype, {
    setProgress: function setProgress(percentage, message, label) {
      if (percentage >= 0 && percentage <= 100) {
        $(this.element).find('div.progress__bar').css('width', "".concat(percentage, "%"));
        $(this.element).find('div.progress__percentage').html("".concat(percentage, "%"));
      }

      $('div.progress__description', this.element).html(message);
      $('div.progress__label', this.element).html(label);

      if (this.updateCallback) {
        this.updateCallback(percentage, message, this);
      }
    },
    startMonitoring: function startMonitoring(uri, delay) {
      this.delay = delay;
      this.uri = uri;
      this.sendPing();
    },
    stopMonitoring: function stopMonitoring() {
      clearTimeout(this.timer);
      this.uri = null;
    },
    sendPing: function sendPing() {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      if (this.uri) {
        var pb = this;
        var uri = this.uri;

        if (uri.indexOf('?') === -1) {
          uri += '?';
        } else {
          uri += '&';
        }

        uri += '_format=json';
        $.ajax({
          type: this.method,
          url: uri,
          data: '',
          dataType: 'json',
          success: function success(progress) {
            if (progress.status === 0) {
              pb.displayError(progress.data);
              return;
            }

            pb.setProgress(progress.percentage, progress.message, progress.label);
            pb.timer = setTimeout(function () {
              pb.sendPing();
            }, pb.delay);
          },
          error: function error(xmlhttp) {
            var e = new Drupal.AjaxError(xmlhttp, pb.uri);
            pb.displayError("<pre>".concat(e.message, "</pre>"));
          }
        });
      }
    },
    displayError: function displayError(string) {
      var error = $('<div class="messages messages--error"></div>').html(string);
      $(this.element).before(error).hide();

      if (this.errorCallback) {
        this.errorCallback(this);
      }
    }
  });
})(jQuery, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

(function ($, window, Drupal, drupalSettings, _ref) {
  var isFocusable = _ref.isFocusable,
      tabbable = _ref.tabbable;
  Drupal.behaviors.AJAX = {
    attach: function attach(context, settings) {
      function loadAjaxBehavior(base) {
        var elementSettings = settings.ajax[base];

        if (typeof elementSettings.selector === 'undefined') {
          elementSettings.selector = "#".concat(base);
        }

        $(elementSettings.selector).once('drupal-ajax').each(function () {
          elementSettings.element = this;
          elementSettings.base = base;
          Drupal.ajax(elementSettings);
        });
      }

      Object.keys(settings.ajax || {}).forEach(function (base) {
        return loadAjaxBehavior(base);
      });
      Drupal.ajax.bindAjaxLinks(document.body);
      $('.use-ajax-submit').once('ajax').each(function () {
        var elementSettings = {};
        elementSettings.url = $(this.form).attr('action');
        elementSettings.setClick = true;
        elementSettings.event = 'click';
        elementSettings.progress = {
          type: 'throbber'
        };
        elementSettings.base = $(this).attr('id');
        elementSettings.element = this;
        Drupal.ajax(elementSettings);
      });
    },
    detach: function detach(context, settings, trigger) {
      if (trigger === 'unload') {
        Drupal.ajax.expired().forEach(function (instance) {
          Drupal.ajax.instances[instance.instanceIndex] = null;
        });
      }
    }
  };

  Drupal.AjaxError = function (xmlhttp, uri, customMessage) {
    var statusCode;
    var statusText;
    var responseText;

    if (xmlhttp.status) {
      statusCode = "\n".concat(Drupal.t('An AJAX HTTP error occurred.'), "\n").concat(Drupal.t('HTTP Result Code: !status', {
        '!status': xmlhttp.status
      }));
    } else {
      statusCode = "\n".concat(Drupal.t('An AJAX HTTP request terminated abnormally.'));
    }

    statusCode += "\n".concat(Drupal.t('Debugging information follows.'));
    var pathText = "\n".concat(Drupal.t('Path: !uri', {
      '!uri': uri
    }));
    statusText = '';

    try {
      statusText = "\n".concat(Drupal.t('StatusText: !statusText', {
        '!statusText': $.trim(xmlhttp.statusText)
      }));
    } catch (e) {}

    responseText = '';

    try {
      responseText = "\n".concat(Drupal.t('ResponseText: !responseText', {
        '!responseText': $.trim(xmlhttp.responseText)
      }));
    } catch (e) {}

    responseText = responseText.replace(/<("[^"]*"|'[^']*'|[^'">])*>/gi, '');
    responseText = responseText.replace(/[\n]+\s+/g, '\n');
    var readyStateText = xmlhttp.status === 0 ? "\n".concat(Drupal.t('ReadyState: !readyState', {
      '!readyState': xmlhttp.readyState
    })) : '';
    customMessage = customMessage ? "\n".concat(Drupal.t('CustomMessage: !customMessage', {
      '!customMessage': customMessage
    })) : '';
    this.message = statusCode + pathText + statusText + customMessage + responseText + readyStateText;
    this.name = 'AjaxError';
  };

  Drupal.AjaxError.prototype = new Error();
  Drupal.AjaxError.prototype.constructor = Drupal.AjaxError;

  Drupal.ajax = function (settings) {
    if (arguments.length !== 1) {
      throw new Error('Drupal.ajax() function must be called with one configuration object only');
    }

    var base = settings.base || false;
    var element = settings.element || false;
    delete settings.base;
    delete settings.element;

    if (!settings.progress && !element) {
      settings.progress = false;
    }

    var ajax = new Drupal.Ajax(base, element, settings);
    ajax.instanceIndex = Drupal.ajax.instances.length;
    Drupal.ajax.instances.push(ajax);
    return ajax;
  };

  Drupal.ajax.instances = [];

  Drupal.ajax.expired = function () {
    return Drupal.ajax.instances.filter(function (instance) {
      return instance && instance.element !== false && !document.body.contains(instance.element);
    });
  };

  Drupal.ajax.bindAjaxLinks = function (element) {
    $(element).find('.use-ajax').once('ajax').each(function (i, ajaxLink) {
      var $linkElement = $(ajaxLink);
      var elementSettings = {
        progress: {
          type: 'throbber'
        },
        dialogType: $linkElement.data('dialog-type'),
        dialog: $linkElement.data('dialog-options'),
        dialogRenderer: $linkElement.data('dialog-renderer'),
        base: $linkElement.attr('id'),
        element: ajaxLink
      };
      var href = $linkElement.attr('href');

      if (href) {
        elementSettings.url = href;
        elementSettings.event = 'click';
      }

      Drupal.ajax(elementSettings);
    });
  };

  Drupal.Ajax = function (base, element, elementSettings) {
    var defaults = {
      event: element ? 'mousedown' : null,
      keypress: true,
      selector: base ? "#".concat(base) : null,
      effect: 'none',
      speed: 'none',
      method: 'replaceWith',
      progress: {
        type: 'throbber',
        message: Drupal.t('Please wait...')
      },
      submit: {
        js: true
      }
    };
    $.extend(this, defaults, elementSettings);
    this.commands = new Drupal.AjaxCommands();
    this.instanceIndex = false;

    if (this.wrapper) {
      this.wrapper = "#".concat(this.wrapper);
    }

    this.element = element;
    this.element_settings = elementSettings;
    this.elementSettings = elementSettings;

    if (this.element && this.element.form) {
      this.$form = $(this.element.form);
    }

    if (!this.url) {
      var $element = $(this.element);

      if ($element.is('a')) {
        this.url = $element.attr('href');
      } else if (this.element && element.form) {
        this.url = this.$form.attr('action');
      }
    }

    var originalUrl = this.url;
    this.url = this.url.replace(/\/nojs(\/|$|\?|#)/, '/ajax$1');

    if (drupalSettings.ajaxTrustedUrl[originalUrl]) {
      drupalSettings.ajaxTrustedUrl[this.url] = true;
    }

    var ajax = this;
    ajax.options = {
      url: ajax.url,
      data: ajax.submit,
      beforeSerialize: function beforeSerialize(elementSettings, options) {
        return ajax.beforeSerialize(elementSettings, options);
      },
      beforeSubmit: function beforeSubmit(formValues, elementSettings, options) {
        ajax.ajaxing = true;
        return ajax.beforeSubmit(formValues, elementSettings, options);
      },
      beforeSend: function beforeSend(xmlhttprequest, options) {
        ajax.ajaxing = true;
        return ajax.beforeSend(xmlhttprequest, options);
      },
      success: function success(response, status, xmlhttprequest) {
        if (typeof response === 'string') {
          response = $.parseJSON(response);
        }

        if (response !== null && !drupalSettings.ajaxTrustedUrl[ajax.url]) {
          if (xmlhttprequest.getResponseHeader('X-Drupal-Ajax-Token') !== '1') {
            var customMessage = Drupal.t('The response failed verification so will not be processed.');
            return ajax.error(xmlhttprequest, ajax.url, customMessage);
          }
        }

        return ajax.success(response, status);
      },
      complete: function complete(xmlhttprequest, status) {
        ajax.ajaxing = false;

        if (status === 'error' || status === 'parsererror') {
          return ajax.error(xmlhttprequest, ajax.url);
        }
      },
      dataType: 'json',
      jsonp: false,
      type: 'POST'
    };

    if (elementSettings.dialog) {
      ajax.options.data.dialogOptions = elementSettings.dialog;
    }

    if (ajax.options.url.indexOf('?') === -1) {
      ajax.options.url += '?';
    } else {
      ajax.options.url += '&';
    }

    var wrapper = "drupal_".concat(elementSettings.dialogType || 'ajax');

    if (elementSettings.dialogRenderer) {
      wrapper += ".".concat(elementSettings.dialogRenderer);
    }

    ajax.options.url += "".concat(Drupal.ajax.WRAPPER_FORMAT, "=").concat(wrapper);
    $(ajax.element).on(elementSettings.event, function (event) {
      if (!drupalSettings.ajaxTrustedUrl[ajax.url] && !Drupal.url.isLocal(ajax.url)) {
        throw new Error(Drupal.t('The callback URL is not local and not trusted: !url', {
          '!url': ajax.url
        }));
      }

      return ajax.eventResponse(this, event);
    });

    if (elementSettings.keypress) {
      $(ajax.element).on('keypress', function (event) {
        return ajax.keypressResponse(this, event);
      });
    }

    if (elementSettings.prevent) {
      $(ajax.element).on(elementSettings.prevent, false);
    }
  };

  Drupal.ajax.WRAPPER_FORMAT = '_wrapper_format';
  Drupal.Ajax.AJAX_REQUEST_PARAMETER = '_drupal_ajax';

  Drupal.Ajax.prototype.execute = function () {
    if (this.ajaxing) {
      return;
    }

    try {
      this.beforeSerialize(this.element, this.options);
      return $.ajax(this.options);
    } catch (e) {
      this.ajaxing = false;
      window.alert("An error occurred while attempting to process ".concat(this.options.url, ": ").concat(e.message));
      return $.Deferred().reject();
    }
  };

  Drupal.Ajax.prototype.keypressResponse = function (element, event) {
    var ajax = this;

    if (event.which === 13 || event.which === 32 && element.type !== 'text' && element.type !== 'textarea' && element.type !== 'tel' && element.type !== 'number') {
      event.preventDefault();
      event.stopPropagation();
      $(element).trigger(ajax.elementSettings.event);
    }
  };

  Drupal.Ajax.prototype.eventResponse = function (element, event) {
    event.preventDefault();
    event.stopPropagation();
    var ajax = this;

    if (ajax.ajaxing) {
      return;
    }

    try {
      if (ajax.$form) {
        if (ajax.setClick) {
          element.form.clk = element;
        }

        ajax.$form.ajaxSubmit(ajax.options);
      } else {
        ajax.beforeSerialize(ajax.element, ajax.options);
        $.ajax(ajax.options);
      }
    } catch (e) {
      ajax.ajaxing = false;
      window.alert("An error occurred while attempting to process ".concat(ajax.options.url, ": ").concat(e.message));
    }
  };

  Drupal.Ajax.prototype.beforeSerialize = function (element, options) {
    if (this.$form && document.body.contains(this.$form.get(0))) {
      var settings = this.settings || drupalSettings;
      Drupal.detachBehaviors(this.$form.get(0), settings, 'serialize');
    }

    options.data[Drupal.Ajax.AJAX_REQUEST_PARAMETER] = 1;
    var pageState = drupalSettings.ajaxPageState;
    options.data['ajax_page_state[theme]'] = pageState.theme;
    options.data['ajax_page_state[theme_token]'] = pageState.theme_token;
    options.data['ajax_page_state[libraries]'] = pageState.libraries;
  };

  Drupal.Ajax.prototype.beforeSubmit = function (formValues, element, options) {};

  Drupal.Ajax.prototype.beforeSend = function (xmlhttprequest, options) {
    if (this.$form) {
      options.extraData = options.extraData || {};
      options.extraData.ajax_iframe_upload = '1';
      var v = $.fieldValue(this.element);

      if (v !== null) {
        options.extraData[this.element.name] = v;
      }
    }

    $(this.element).prop('disabled', true);

    if (!this.progress || !this.progress.type) {
      return;
    }

    var progressIndicatorMethod = "setProgressIndicator".concat(this.progress.type.slice(0, 1).toUpperCase()).concat(this.progress.type.slice(1).toLowerCase());

    if (progressIndicatorMethod in this && typeof this[progressIndicatorMethod] === 'function') {
      this[progressIndicatorMethod].call(this);
    }
  };

  Drupal.theme.ajaxProgressThrobber = function (message) {
    var messageMarkup = typeof message === 'string' ? Drupal.theme('ajaxProgressMessage', message) : '';
    var throbber = '<div class="throbber">&nbsp;</div>';
    return "<div class=\"ajax-progress ajax-progress-throbber\">".concat(throbber).concat(messageMarkup, "</div>");
  };

  Drupal.theme.ajaxProgressIndicatorFullscreen = function () {
    return '<div class="ajax-progress ajax-progress-fullscreen">&nbsp;</div>';
  };

  Drupal.theme.ajaxProgressMessage = function (message) {
    return "<div class=\"message\">".concat(message, "</div>");
  };

  Drupal.theme.ajaxProgressBar = function ($element) {
    return $('<div class="ajax-progress ajax-progress-bar"></div>').append($element);
  };

  Drupal.Ajax.prototype.setProgressIndicatorBar = function () {
    var progressBar = new Drupal.ProgressBar("ajax-progress-".concat(this.element.id), $.noop, this.progress.method, $.noop);

    if (this.progress.message) {
      progressBar.setProgress(-1, this.progress.message);
    }

    if (this.progress.url) {
      progressBar.startMonitoring(this.progress.url, this.progress.interval || 1500);
    }

    this.progress.element = $(Drupal.theme('ajaxProgressBar', progressBar.element));
    this.progress.object = progressBar;
    $(this.element).after(this.progress.element);
  };

  Drupal.Ajax.prototype.setProgressIndicatorThrobber = function () {
    this.progress.element = $(Drupal.theme('ajaxProgressThrobber', this.progress.message));
    $(this.element).after(this.progress.element);
  };

  Drupal.Ajax.prototype.setProgressIndicatorFullscreen = function () {
    this.progress.element = $(Drupal.theme('ajaxProgressIndicatorFullscreen'));
    $('body').append(this.progress.element);
  };

  Drupal.Ajax.prototype.success = function (response, status) {
    var _this = this;

    if (this.progress.element) {
      $(this.progress.element).remove();
    }

    if (this.progress.object) {
      this.progress.object.stopMonitoring();
    }

    $(this.element).prop('disabled', false);
    var elementParents = $(this.element).parents('[data-drupal-selector]').addBack().toArray();
    var focusChanged = false;
    Object.keys(response || {}).forEach(function (i) {
      if (response[i].command && _this.commands[response[i].command]) {
        _this.commands[response[i].command](_this, response[i], status);

        if (response[i].command === 'invoke' && response[i].method === 'focus' || response[i].command === 'focusFirst') {
          focusChanged = true;
        }
      }
    });

    if (!focusChanged && this.element && !$(this.element).data('disable-refocus')) {
      var target = false;

      for (var n = elementParents.length - 1; !target && n >= 0; n--) {
        target = document.querySelector("[data-drupal-selector=\"".concat(elementParents[n].getAttribute('data-drupal-selector'), "\"]"));
      }

      if (target) {
        $(target).trigger('focus');
      }
    }

    if (this.$form && document.body.contains(this.$form.get(0))) {
      var settings = this.settings || drupalSettings;
      Drupal.attachBehaviors(this.$form.get(0), settings);
    }

    this.settings = null;
  };

  Drupal.Ajax.prototype.getEffect = function (response) {
    var type = response.effect || this.effect;
    var speed = response.speed || this.speed;
    var effect = {};

    if (type === 'none') {
      effect.showEffect = 'show';
      effect.hideEffect = 'hide';
      effect.showSpeed = '';
    } else if (type === 'fade') {
      effect.showEffect = 'fadeIn';
      effect.hideEffect = 'fadeOut';
      effect.showSpeed = speed;
    } else {
      effect.showEffect = "".concat(type, "Toggle");
      effect.hideEffect = "".concat(type, "Toggle");
      effect.showSpeed = speed;
    }

    return effect;
  };

  Drupal.Ajax.prototype.error = function (xmlhttprequest, uri, customMessage) {
    if (this.progress.element) {
      $(this.progress.element).remove();
    }

    if (this.progress.object) {
      this.progress.object.stopMonitoring();
    }

    $(this.wrapper).show();
    $(this.element).prop('disabled', false);

    if (this.$form && document.body.contains(this.$form.get(0))) {
      var settings = this.settings || drupalSettings;
      Drupal.attachBehaviors(this.$form.get(0), settings);
    }

    throw new Drupal.AjaxError(xmlhttprequest, uri, customMessage);
  };

  Drupal.theme.ajaxWrapperNewContent = function ($newContent, ajax, response) {
    return (response.effect || ajax.effect) !== 'none' && $newContent.filter(function (i) {
      return !($newContent[i].nodeName === '#comment' || $newContent[i].nodeName === '#text' && /^(\s|\n|\r)*$/.test($newContent[i].textContent));
    }).length > 1 ? Drupal.theme('ajaxWrapperMultipleRootElements', $newContent) : $newContent;
  };

  Drupal.theme.ajaxWrapperMultipleRootElements = function ($elements) {
    return $('<div></div>').append($elements);
  };

  Drupal.AjaxCommands = function () {};

  Drupal.AjaxCommands.prototype = {
    insert: function insert(ajax, response) {
      var $wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
      var method = response.method || ajax.method;
      var effect = ajax.getEffect(response);
      var settings = response.settings || ajax.settings || drupalSettings;
      var $newContent = $($.parseHTML(response.data, document, true));
      $newContent = Drupal.theme('ajaxWrapperNewContent', $newContent, ajax, response);

      switch (method) {
        case 'html':
        case 'replaceWith':
        case 'replaceAll':
        case 'empty':
        case 'remove':
          Drupal.detachBehaviors($wrapper.get(0), settings);
          break;

        default:
          break;
      }

      $wrapper[method]($newContent);

      if (effect.showEffect !== 'show') {
        $newContent.hide();
      }

      var $ajaxNewContent = $newContent.find('.ajax-new-content');

      if ($ajaxNewContent.length) {
        $ajaxNewContent.hide();
        $newContent.show();
        $ajaxNewContent[effect.showEffect](effect.showSpeed);
      } else if (effect.showEffect !== 'show') {
        $newContent[effect.showEffect](effect.showSpeed);
      }

      if ($newContent.parents('html').length) {
        $newContent.each(function (index, element) {
          if (element.nodeType === Node.ELEMENT_NODE) {
            Drupal.attachBehaviors(element, settings);
          }
        });
      }
    },
    remove: function remove(ajax, response, status) {
      var settings = response.settings || ajax.settings || drupalSettings;
      $(response.selector).each(function () {
        Drupal.detachBehaviors(this, settings);
      }).remove();
    },
    changed: function changed(ajax, response, status) {
      var $element = $(response.selector);

      if (!$element.hasClass('ajax-changed')) {
        $element.addClass('ajax-changed');

        if (response.asterisk) {
          $element.find(response.asterisk).append(" <abbr class=\"ajax-changed\" title=\"".concat(Drupal.t('Changed'), "\">*</abbr> "));
        }
      }
    },
    alert: function alert(ajax, response, status) {
      window.alert(response.text);
    },
    announce: function announce(ajax, response) {
      if (response.priority) {
        Drupal.announce(response.text, response.priority);
      } else {
        Drupal.announce(response.text);
      }
    },
    redirect: function redirect(ajax, response, status) {
      window.location = response.url;
    },
    css: function css(ajax, response, status) {
      $(response.selector).css(response.argument);
    },
    settings: function settings(ajax, response, status) {
      var ajaxSettings = drupalSettings.ajax;

      if (ajaxSettings) {
        Drupal.ajax.expired().forEach(function (instance) {
          if (instance.selector) {
            var selector = instance.selector.replace('#', '');

            if (selector in ajaxSettings) {
              delete ajaxSettings[selector];
            }
          }
        });
      }

      if (response.merge) {
        $.extend(true, drupalSettings, response.settings);
      } else {
        ajax.settings = response.settings;
      }
    },
    data: function data(ajax, response, status) {
      $(response.selector).data(response.name, response.value);
    },
    focusFirst: function focusFirst(ajax, response, status) {
      var focusChanged = false;
      var container = document.querySelector(response.selector);

      if (container) {
        var tabbableElements = tabbable(container);

        if (tabbableElements.length) {
          tabbableElements[0].focus();
          focusChanged = true;
        } else if (isFocusable(container)) {
          container.focus();
          focusChanged = true;
        }
      }

      if (ajax.hasOwnProperty('element') && !focusChanged) {
        ajax.element.focus();
      }
    },
    invoke: function invoke(ajax, response, status) {
      var $element = $(response.selector);
      $element[response.method].apply($element, _toConsumableArray(response.args));
    },
    restripe: function restripe(ajax, response, status) {
      $(response.selector).find('> tbody > tr:visible, > tr:visible').removeClass('odd even').filter(':even').addClass('odd').end().filter(':odd').addClass('even');
    },
    update_build_id: function update_build_id(ajax, response, status) {
      $("input[name=\"form_build_id\"][value=\"".concat(response.old, "\"]")).val(response.new);
    },
    add_css: function add_css(ajax, response, status) {
      $('head').prepend(response.data);
    },
    message: function message(ajax, response) {
      var messages = new Drupal.Message(document.querySelector(response.messageWrapperQuerySelector));

      if (response.clearPrevious) {
        messages.clear();
      }

      messages.add(response.message, response.messageOptions);
    }
  };
})(jQuery, window, Drupal, drupalSettings, window.tabbable);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal) {
  Drupal.theme.ajaxProgressIndicatorFullscreen = function () {
    return '<div class="ajax-progress ajax-progress--fullscreen"><div class="ajax-progress__throbber ajax-progress__throbber--fullscreen">&nbsp;</div></div>';
  };

  Drupal.theme.ajaxProgressThrobber = function (message) {
    var messageMarkup = typeof message === 'string' ? Drupal.theme('ajaxProgressMessage', message) : '';
    var throbber = '<div class="ajax-progress__throbber">&nbsp;</div>';
    return "<div class=\"ajax-progress ajax-progress--throbber\">".concat(throbber).concat(messageMarkup, "</div>");
  };

  Drupal.theme.ajaxProgressMessage = function (message) {
    return "<div class=\"ajax-progress__message\">".concat(message, "</div>");
  };
})(Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

Drupal.debounce = function (func, wait, immediate) {
  var timeout;
  var result;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var context = this;

    var later = function later() {
      timeout = null;

      if (!immediate) {
        result = func.apply(context, args);
      }
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      result = func.apply(context, args);
    }

    return result;
  };
};;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal, debounce) {
  var liveElement;
  var announcements = [];
  Drupal.behaviors.drupalAnnounce = {
    attach: function attach(context) {
      if (!liveElement) {
        liveElement = document.createElement('div');
        liveElement.id = 'drupal-live-announce';
        liveElement.className = 'visually-hidden';
        liveElement.setAttribute('aria-live', 'polite');
        liveElement.setAttribute('aria-busy', 'false');
        document.body.appendChild(liveElement);
      }
    }
  };

  function announce() {
    var text = [];
    var priority = 'polite';
    var announcement;
    var il = announcements.length;

    for (var i = 0; i < il; i++) {
      announcement = announcements.pop();
      text.unshift(announcement.text);

      if (announcement.priority === 'assertive') {
        priority = 'assertive';
      }
    }

    if (text.length) {
      liveElement.innerHTML = '';
      liveElement.setAttribute('aria-busy', 'true');
      liveElement.setAttribute('aria-live', priority);
      liveElement.innerHTML = text.join('\n');
      liveElement.setAttribute('aria-busy', 'false');
    }
  }

  Drupal.announce = function (text, priority) {
    announcements.push({
      text: text,
      priority: priority
    });
    return debounce(announce, 200)();
  };
})(Drupal, Drupal.debounce);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function (Drupal) {
  Drupal.Message = function () {
    function _class() {
      var messageWrapper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _classCallCheck(this, _class);

      if (!messageWrapper) {
        this.messageWrapper = Drupal.Message.defaultWrapper();
      } else {
        this.messageWrapper = messageWrapper;
      }
    }

    _createClass(_class, [{
      key: "add",
      value: function add(message) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (!options.hasOwnProperty('type')) {
          options.type = 'status';
        }

        if (typeof message !== 'string') {
          throw new Error('Message must be a string.');
        }

        Drupal.Message.announce(message, options);
        options.id = options.id ? String(options.id) : "".concat(options.type, "-").concat(Math.random().toFixed(15).replace('0.', ''));

        if (!Drupal.Message.getMessageTypeLabels().hasOwnProperty(options.type)) {
          var type = options.type;
          throw new Error("The message type, ".concat(type, ", is not present in Drupal.Message.getMessageTypeLabels()."));
        }

        this.messageWrapper.appendChild(Drupal.theme('message', {
          text: message
        }, options));
        return options.id;
      }
    }, {
      key: "select",
      value: function select(id) {
        return this.messageWrapper.querySelector("[data-drupal-message-id^=\"".concat(id, "\"]"));
      }
    }, {
      key: "remove",
      value: function remove(id) {
        return this.messageWrapper.removeChild(this.select(id));
      }
    }, {
      key: "clear",
      value: function clear() {
        var _this = this;

        Array.prototype.forEach.call(this.messageWrapper.querySelectorAll('[data-drupal-message-id]'), function (message) {
          _this.messageWrapper.removeChild(message);
        });
      }
    }], [{
      key: "defaultWrapper",
      value: function defaultWrapper() {
        var wrapper = document.querySelector('[data-drupal-messages]');

        if (!wrapper) {
          wrapper = document.querySelector('[data-drupal-messages-fallback]');
          wrapper.removeAttribute('data-drupal-messages-fallback');
          wrapper.setAttribute('data-drupal-messages', '');
          wrapper.classList.remove('hidden');
        }

        return wrapper.innerHTML === '' ? Drupal.Message.messageInternalWrapper(wrapper) : wrapper.firstElementChild;
      }
    }, {
      key: "getMessageTypeLabels",
      value: function getMessageTypeLabels() {
        return {
          status: Drupal.t('Status message'),
          error: Drupal.t('Error message'),
          warning: Drupal.t('Warning message')
        };
      }
    }, {
      key: "announce",
      value: function announce(message, options) {
        if (!options.priority && (options.type === 'warning' || options.type === 'error')) {
          options.priority = 'assertive';
        }

        if (options.announce !== '') {
          Drupal.announce(options.announce || message, options.priority);
        }
      }
    }, {
      key: "messageInternalWrapper",
      value: function messageInternalWrapper(messageWrapper) {
        var innerWrapper = document.createElement('div');
        innerWrapper.setAttribute('class', 'messages__wrapper');
        messageWrapper.insertAdjacentElement('afterbegin', innerWrapper);
        return innerWrapper;
      }
    }]);

    return _class;
  }();

  Drupal.theme.message = function (_ref, _ref2) {
    var text = _ref.text;
    var type = _ref2.type,
        id = _ref2.id;
    var messagesTypes = Drupal.Message.getMessageTypeLabels();
    var messageWrapper = document.createElement('div');
    messageWrapper.setAttribute('class', "messages messages--".concat(type));
    messageWrapper.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    messageWrapper.setAttribute('data-drupal-message-id', id);
    messageWrapper.setAttribute('data-drupal-message-type', type);
    messageWrapper.setAttribute('aria-label', messagesTypes[type]);
    messageWrapper.innerHTML = "".concat(text);
    return messageWrapper;
  };
})(Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal) {
  Drupal.theme.message = function (_ref, _ref2) {
    var text = _ref.text;
    var type = _ref2.type,
        id = _ref2.id;
    var messagesTypes = Drupal.Message.getMessageTypeLabels();
    var messageWrapper = document.createElement('div');
    messageWrapper.setAttribute('class', "messages messages--".concat(type));
    messageWrapper.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    messageWrapper.setAttribute('aria-labelledby', "".concat(id, "-title"));
    messageWrapper.setAttribute('data-drupal-message-id', id);
    messageWrapper.setAttribute('data-drupal-message-type', type);
    messageWrapper.innerHTML = "\n    <div class=\"messages__header\">\n      <h2 id=\"".concat(id, "-title\" class=\"messages__title\">\n        ").concat(messagesTypes[type], "\n      </h2>\n    </div>\n    <div class=\"messages__content\">\n      ").concat(text, "\n    </div>\n  ");
    return messageWrapper;
  };
})(Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal, drupalSettings) {
  Drupal.behaviors.activeLinks = {
    attach: function attach(context) {
      var path = drupalSettings.path;
      var queryString = JSON.stringify(path.currentQuery);
      var querySelector = path.currentQuery ? "[data-drupal-link-query='".concat(queryString, "']") : ':not([data-drupal-link-query])';
      var originalSelectors = ["[data-drupal-link-system-path=\"".concat(path.currentPath, "\"]")];
      var selectors;

      if (path.isFront) {
        originalSelectors.push('[data-drupal-link-system-path="<front>"]');
      }

      selectors = [].concat(originalSelectors.map(function (selector) {
        return "".concat(selector, ":not([hreflang])");
      }), originalSelectors.map(function (selector) {
        return "".concat(selector, "[hreflang=\"").concat(path.currentLanguage, "\"]");
      }));
      selectors = selectors.map(function (current) {
        return current + querySelector;
      });
      var activeLinks = context.querySelectorAll(selectors.join(','));
      var il = activeLinks.length;

      for (var i = 0; i < il; i++) {
        activeLinks[i].classList.add('is-active');
      }
    },
    detach: function detach(context, settings, trigger) {
      if (trigger === 'unload') {
        var activeLinks = context.querySelectorAll('[data-drupal-link-system-path].is-active');
        var il = activeLinks.length;

        for (var i = 0; i < il; i++) {
          activeLinks[i].classList.remove('is-active');
        }
      }
    }
  };
})(Drupal, drupalSettings);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, debounce) {
  $.fn.drupalGetSummary = function () {
    var callback = this.data('summaryCallback');
    return this[0] && callback ? $.trim(callback(this[0])) : '';
  };

  $.fn.drupalSetSummary = function (callback) {
    var self = this;

    if (typeof callback !== 'function') {
      var val = callback;

      callback = function callback() {
        return val;
      };
    }

    return this.data('summaryCallback', callback).off('formUpdated.summary').on('formUpdated.summary', function () {
      self.trigger('summaryUpdated');
    }).trigger('summaryUpdated');
  };

  Drupal.behaviors.formSingleSubmit = {
    attach: function attach() {
      function onFormSubmit(e) {
        var $form = $(e.currentTarget);
        var formValues = $form.serialize();
        var previousValues = $form.attr('data-drupal-form-submit-last');

        if (previousValues === formValues) {
          e.preventDefault();
        } else {
          $form.attr('data-drupal-form-submit-last', formValues);
        }
      }

      $('body').once('form-single-submit').on('submit.singleSubmit', 'form:not([method~="GET"])', onFormSubmit);
    }
  };

  function triggerFormUpdated(element) {
    $(element).trigger('formUpdated');
  }

  function fieldsList(form) {
    var $fieldList = $(form).find('[name]').map(function (index, element) {
      return element.getAttribute('id');
    });
    return $.makeArray($fieldList);
  }

  Drupal.behaviors.formUpdated = {
    attach: function attach(context) {
      var $context = $(context);
      var contextIsForm = $context.is('form');
      var $forms = (contextIsForm ? $context : $context.find('form')).once('form-updated');
      var formFields;

      if ($forms.length) {
        $.makeArray($forms).forEach(function (form) {
          var events = 'change.formUpdated input.formUpdated ';
          var eventHandler = debounce(function (event) {
            triggerFormUpdated(event.target);
          }, 300);
          formFields = fieldsList(form).join(',');
          form.setAttribute('data-drupal-form-fields', formFields);
          $(form).on(events, eventHandler);
        });
      }

      if (contextIsForm) {
        formFields = fieldsList(context).join(',');
        var currentFields = $(context).attr('data-drupal-form-fields');

        if (formFields !== currentFields) {
          triggerFormUpdated(context);
        }
      }
    },
    detach: function detach(context, settings, trigger) {
      var $context = $(context);
      var contextIsForm = $context.is('form');

      if (trigger === 'unload') {
        var $forms = (contextIsForm ? $context : $context.find('form')).removeOnce('form-updated');

        if ($forms.length) {
          $.makeArray($forms).forEach(function (form) {
            form.removeAttribute('data-drupal-form-fields');
            $(form).off('.formUpdated');
          });
        }
      }
    }
  };
  Drupal.behaviors.fillUserInfoFromBrowser = {
    attach: function attach(context, settings) {
      var userInfo = ['name', 'mail', 'homepage'];
      var $forms = $('[data-user-info-from-browser]').once('user-info-from-browser');

      if ($forms.length) {
        userInfo.forEach(function (info) {
          var $element = $forms.find("[name=".concat(info, "]"));
          var browserData = localStorage.getItem("Drupal.visitor.".concat(info));
          var emptyOrDefault = $element.val() === '' || $element.attr('data-drupal-default-value') === $element.val();

          if ($element.length && emptyOrDefault && browserData) {
            $element.val(browserData);
          }
        });
      }

      $forms.on('submit', function () {
        userInfo.forEach(function (info) {
          var $element = $forms.find("[name=".concat(info, "]"));

          if ($element.length) {
            localStorage.setItem("Drupal.visitor.".concat(info), $element.val());
          }
        });
      });
    }
  };

  var handleFragmentLinkClickOrHashChange = function handleFragmentLinkClickOrHashChange(e) {
    var url;

    if (e.type === 'click') {
      url = e.currentTarget.location ? e.currentTarget.location : e.currentTarget;
    } else {
      url = window.location;
    }

    var hash = url.hash.substr(1);

    if (hash) {
      var $target = $("#".concat(hash));
      $('body').trigger('formFragmentLinkClickOrHashChange', [$target]);
      setTimeout(function () {
        return $target.trigger('focus');
      }, 300);
    }
  };

  var debouncedHandleFragmentLinkClickOrHashChange = debounce(handleFragmentLinkClickOrHashChange, 300, true);
  $(window).on('hashchange.form-fragment', debouncedHandleFragmentLinkClickOrHashChange);
  $(document).on('click.form-fragment', 'a[href*="#"]', debouncedHandleFragmentLinkClickOrHashChange);
})(jQuery, Drupal, Drupal.debounce);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  Drupal.behaviors.entityContentDetailsSummaries = {
    attach: function attach(context) {
      var $context = $(context);
      $context.find('.entity-content-form-revision-information').drupalSetSummary(function (context) {
        var $revisionContext = $(context);
        var revisionCheckbox = $revisionContext.find('.js-form-item-revision input');

        if (revisionCheckbox.is(':checked') || !revisionCheckbox.length && $revisionContext.find('.js-form-item-revision-log textarea').length) {
          return Drupal.t('New revision');
        }

        return Drupal.t('No revision');
      });
      $context.find('details.entity-translation-options').drupalSetSummary(function (context) {
        var $translationContext = $(context);
        var translate;
        var $checkbox = $translationContext.find('.js-form-item-translation-translate input');

        if ($checkbox.length) {
          translate = $checkbox.is(':checked') ? Drupal.t('Needs to be updated') : Drupal.t('Does not need to be updated');
        } else {
          $checkbox = $translationContext.find('.js-form-item-translation-retranslate input');
          translate = $checkbox.is(':checked') ? Drupal.t('Flag other translations as outdated') : Drupal.t('Do not flag other translations as outdated');
        }

        return translate;
      });
    }
  };
})(jQuery, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.nodeDetailsSummaries = {
    attach: function attach(context) {
      var $context = $(context);
      $context.find('.node-form-author').drupalSetSummary(function (context) {
        var $authorContext = $(context);
        var name = $authorContext.find('.field--name-uid input').val();
        var date = $authorContext.find('.field--name-created input').val();

        if (name && date) {
          return Drupal.t('By @name on @date', {
            '@name': name,
            '@date': date
          });
        }

        if (name) {
          return Drupal.t('By @name', {
            '@name': name
          });
        }

        if (date) {
          return Drupal.t('Authored on @date', {
            '@date': date
          });
        }
      });
      $context.find('.node-form-options').drupalSetSummary(function (context) {
        var $optionsContext = $(context);
        var vals = [];

        if ($optionsContext.find('input').is(':checked')) {
          $optionsContext.find('input:checked').next('label').each(function () {
            vals.push(Drupal.checkPlain($.trim($(this).text())));
          });
          return vals.join(', ');
        }

        return Drupal.t('Not promoted');
      });
    }
  };
})(jQuery, Drupal, drupalSettings);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  function DetailsSummarizedContent(node) {
    this.$node = $(node);
    this.setupSummary();
  }

  $.extend(DetailsSummarizedContent, {
    instances: []
  });
  $.extend(DetailsSummarizedContent.prototype, {
    setupSummary: function setupSummary() {
      this.$detailsSummarizedContentWrapper = $(Drupal.theme('detailsSummarizedContentWrapper'));
      this.$node.on('summaryUpdated', $.proxy(this.onSummaryUpdated, this)).trigger('summaryUpdated').find('> summary').append(this.$detailsSummarizedContentWrapper);
    },
    onSummaryUpdated: function onSummaryUpdated() {
      var text = $.trim(this.$node.drupalGetSummary());
      this.$detailsSummarizedContentWrapper.html(Drupal.theme('detailsSummarizedContentText', text));
    }
  });
  Drupal.behaviors.detailsSummary = {
    attach: function attach(context) {
      var $detailsElements = $(context).find('details').once('details');
      DetailsSummarizedContent.instances = DetailsSummarizedContent.instances.concat($detailsElements.map(function (index, details) {
        return new DetailsSummarizedContent(details);
      }).get());
    }
  };
  Drupal.DetailsSummarizedContent = DetailsSummarizedContent;

  Drupal.theme.detailsSummarizedContentWrapper = function () {
    return "<span class=\"summary\"></span>";
  };

  Drupal.theme.detailsSummarizedContentText = function (text) {
    return text ? " (".concat(text, ")") : '';
  };
})(jQuery, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  Drupal.behaviors.detailsAria = {
    attach: function attach() {
      $('body').once('detailsAria').on('click.detailsAria', 'summary', function (event) {
        var $summary = $(event.currentTarget);
        var open = $(event.currentTarget.parentNode).attr('open') === 'open' ? 'false' : 'true';
        $summary.attr({
          'aria-expanded': open,
          'aria-pressed': open
        });
      });
    }
  };
})(jQuery, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Modernizr, Drupal) {
  function CollapsibleDetails(node) {
    this.$node = $(node);
    this.$node.data('details', this);
    var anchor = window.location.hash && window.location.hash !== '#' ? ", ".concat(window.location.hash) : '';

    if (this.$node.find(".error".concat(anchor)).length) {
      this.$node.attr('open', true);
    }

    this.setupSummaryPolyfill();
  }

  $.extend(CollapsibleDetails, {
    instances: []
  });
  $.extend(CollapsibleDetails.prototype, {
    setupSummaryPolyfill: function setupSummaryPolyfill() {
      var $summary = this.$node.find('> summary');
      $summary.attr('tabindex', '-1');
      $('<span class="details-summary-prefix visually-hidden"></span>').append(this.$node.attr('open') ? Drupal.t('Hide') : Drupal.t('Show')).prependTo($summary).after(document.createTextNode(' '));
      $('<a class="details-title"></a>').attr('href', "#".concat(this.$node.attr('id'))).prepend($summary.contents()).appendTo($summary);
      $summary.append(this.$summary).on('click', $.proxy(this.onSummaryClick, this));
    },
    onSummaryClick: function onSummaryClick(e) {
      this.toggle();
      e.preventDefault();
    },
    toggle: function toggle() {
      var _this = this;

      var isOpen = !!this.$node.attr('open');
      var $summaryPrefix = this.$node.find('> summary span.details-summary-prefix');

      if (isOpen) {
        $summaryPrefix.html(Drupal.t('Show'));
      } else {
        $summaryPrefix.html(Drupal.t('Hide'));
      }

      setTimeout(function () {
        _this.$node.attr('open', !isOpen);
      }, 0);
    }
  });
  Drupal.behaviors.collapse = {
    attach: function attach(context) {
      if (Modernizr.details) {
        return;
      }

      var $collapsibleDetails = $(context).find('details').once('collapse').addClass('collapse-processed');

      if ($collapsibleDetails.length) {
        for (var i = 0; i < $collapsibleDetails.length; i++) {
          CollapsibleDetails.instances.push(new CollapsibleDetails($collapsibleDetails[i]));
        }
      }
    }
  };

  var handleFragmentLinkClickOrHashChange = function handleFragmentLinkClickOrHashChange(e, $target) {
    $target.parents('details').not('[open]').find('> summary').trigger('click');
  };

  $('body').on('formFragmentLinkClickOrHashChange.details', handleFragmentLinkClickOrHashChange);
  Drupal.CollapsibleDetails = CollapsibleDetails;
})(jQuery, Modernizr, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Modernizr, Drupal) {
  Drupal.behaviors.claroDetails = {
    attach: function attach(context) {
      $(context).once('claroDetails').on('click', function (event) {
        if (event.target.nodeName === 'SUMMARY') {
          $(event.target).trigger('focus');
        }
      });
    }
  };
  Drupal.behaviors.claroDetailsToggleShim = {
    attach: function attach(context) {
      if (Modernizr.details || !Drupal.CollapsibleDetails.instances.length) {
        return;
      }

      $(context).find('details .details-title').once('claroDetailsToggleShim').on('keypress', function (event) {
        var keyCode = event.keyCode || event.charCode;

        if (keyCode === 32) {
          $(event.target).closest('summary').trigger('click');
          event.preventDefault();
        }
      });
    }
  };

  Drupal.theme.detailsSummarizedContentWrapper = function () {
    return "<span class=\"claro-details__summary-summary\"></span>";
  };

  Drupal.theme.detailsSummarizedContentText = function (text) {
    return text || '';
  };
})(jQuery, Modernizr, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function ($, Modernizr, Drupal, once) {
  Drupal.behaviors.date = {
    attach: function attach(context, settings) {
      if (Modernizr.inputtypes.date === false) {
        once('datepicker', '[data-drupal-field-elements="date-time"]').forEach(function (dateTime) {
          var dateInput = dateTime.querySelector('input[type="date"]');
          var timeInput = dateTime.querySelector('input[type="time"]');
          var help = Drupal.theme.dateTimeHelp({
            dateId: "".concat(dateInput.id, "--description"),
            dateDesc: dateInput.dataset.help,
            timeId: "".concat(timeInput.id, "--description"),
            timeDesc: timeInput.dataset.help
          });
          [dateInput, timeInput].forEach(function (input) {
            input.setAttribute('aria-describedby', "".concat(input.id, "--description"));
            input.setAttribute('type', 'text');
          });
          Drupal.DatepickerPolyfill.attachDescription(dateTime, help);
        });
        once('datepicker', '[data-drupal-field-elements="date"]').forEach(function (date) {
          var dateInput = date.querySelector('input[type="date"]');
          var help = Drupal.theme.dateHelp({
            dateDesc: dateInput.dataset.help
          });
          var id = "".concat(date.id, "--description");
          dateInput.setAttribute('aria-describedby', id);
          dateInput.setAttribute('type', 'text');
          Drupal.DatepickerPolyfill.attachDescription(date, help, id);
        });
      }
    }
  };

  Drupal.DatepickerPolyfill = function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _createClass(_class, null, [{
      key: "attachDescription",
      value: function attachDescription(element, help, id) {
        var description = element.nextElementSibling;

        if (!(description && description.getAttribute('data-drupal-field-elements') === 'description')) {
          description = Drupal.DatepickerPolyfill.descriptionWrapperElement(id);
          element.parentNode.insertBefore(description, element.nextSibling);
        }

        description.insertAdjacentHTML('beforeend', help);
      }
    }, {
      key: "descriptionWrapperElement",
      value: function descriptionWrapperElement(id) {
        var description = document.createElement('div');
        description.classList.add('description');
        description.setAttribute('data-drupal-field-elements', 'description');

        if (id) {
          description.setAttribute('id', id);
        }

        return description;
      }
    }]);

    return _class;
  }();

  Drupal.theme.dateHelp = function (_ref) {
    var dateDesc = _ref.dateDesc;
    return "<div class=\"no-native-datepicker-help\">".concat(dateDesc, "</div>");
  };

  Drupal.theme.dateTimeHelp = function (_ref2) {
    var dateId = _ref2.dateId,
        timeId = _ref2.timeId,
        dateDesc = _ref2.dateDesc,
        timeDesc = _ref2.timeDesc;
    return "<div class=\"no-native-datepicker-help\">\n       <span id=\"".concat(dateId, "\">").concat(dateDesc, "</span> <span id=\"").concat(timeId, "\">").concat(timeDesc, "</span>\n     </div>");
  };
})(jQuery, Modernizr, Drupal, once);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, _ref) {
  var isTabbable = _ref.isTabbable;
  $.extend($.expr[':'], {
    tabbable: function tabbable(element) {
      Drupal.deprecationError({
        message: 'The :tabbable selector is deprecated in Drupal 9.2.0 and will be removed in Drupal 10.0.0. Use the core/tabbable library instead. See https://www.drupal.org/node/3183730'
      });

      if (element.tagName === 'SUMMARY' || element.tagName === 'DETAILS') {
        var tabIndex = element.getAttribute('tabIndex');

        if (tabIndex === null || tabIndex < 0) {
          return false;
        }
      }

      return isTabbable(element);
    }
  });
})(jQuery, Drupal, window.tabbable);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($) {
  var cachedScrollbarWidth = null;
  var max = Math.max,
      abs = Math.abs;
  var regexHorizontal = /left|center|right/;
  var regexVertical = /top|center|bottom/;
  var regexOffset = /[+-]\d+(\.[\d]+)?%?/;
  var regexPosition = /^\w+/;
  var regexPercent = /%$/;
  var _position = $.fn.position;

  function getOffsets(offsets, width, height) {
    return [parseFloat(offsets[0]) * (regexPercent.test(offsets[0]) ? width / 100 : 1), parseFloat(offsets[1]) * (regexPercent.test(offsets[1]) ? height / 100 : 1)];
  }

  function parseCss(element, property) {
    return parseInt($.css(element, property), 10) || 0;
  }

  function getDimensions(elem) {
    var raw = elem[0];

    if (raw.nodeType === 9) {
      return {
        width: elem.width(),
        height: elem.height(),
        offset: {
          top: 0,
          left: 0
        }
      };
    }

    if ($.isWindow(raw)) {
      return {
        width: elem.width(),
        height: elem.height(),
        offset: {
          top: elem.scrollTop(),
          left: elem.scrollLeft()
        }
      };
    }

    if (raw.preventDefault) {
      return {
        width: 0,
        height: 0,
        offset: {
          top: raw.pageY,
          left: raw.pageX
        }
      };
    }

    return {
      width: elem.outerWidth(),
      height: elem.outerHeight(),
      offset: elem.offset()
    };
  }

  var collisions = {
    fit: {
      left: function left(position, data) {
        var within = data.within;
        var withinOffset = within.isWindow ? within.scrollLeft : within.offset.left;
        var outerWidth = within.width;
        var collisionPosLeft = position.left - data.collisionPosition.marginLeft;
        var overLeft = withinOffset - collisionPosLeft;
        var overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset;
        var newOverRight;

        if (data.collisionWidth > outerWidth) {
          if (overLeft > 0 && overRight <= 0) {
            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
            position.left += overLeft - newOverRight;
          } else if (overRight > 0 && overLeft <= 0) {
            position.left = withinOffset;
          } else if (overLeft > overRight) {
            position.left = withinOffset + outerWidth - data.collisionWidth;
          } else {
            position.left = withinOffset;
          }
        } else if (overLeft > 0) {
          position.left += overLeft;
        } else if (overRight > 0) {
          position.left -= overRight;
        } else {
          position.left = max(position.left - collisionPosLeft, position.left);
        }
      },
      top: function top(position, data) {
        var within = data.within;
        var withinOffset = within.isWindow ? within.scrollTop : within.offset.top;
        var outerHeight = data.within.height;
        var collisionPosTop = position.top - data.collisionPosition.marginTop;
        var overTop = withinOffset - collisionPosTop;
        var overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset;
        var newOverBottom;

        if (data.collisionHeight > outerHeight) {
          if (overTop > 0 && overBottom <= 0) {
            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
            position.top += overTop - newOverBottom;
          } else if (overBottom > 0 && overTop <= 0) {
            position.top = withinOffset;
          } else if (overTop > overBottom) {
            position.top = withinOffset + outerHeight - data.collisionHeight;
          } else {
            position.top = withinOffset;
          }
        } else if (overTop > 0) {
          position.top += overTop;
        } else if (overBottom > 0) {
          position.top -= overBottom;
        } else {
          position.top = max(position.top - collisionPosTop, position.top);
        }
      }
    },
    flip: {
      left: function left(position, data) {
        var within = data.within;
        var withinOffset = within.offset.left + within.scrollLeft;
        var outerWidth = within.width;
        var offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left;
        var collisionPosLeft = position.left - data.collisionPosition.marginLeft;
        var overLeft = collisionPosLeft - offsetLeft;
        var overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft;
        var myOffset = data.my[0] === 'left' ? -data.elemWidth : data.my[0] === 'right' ? data.elemWidth : 0;
        var atOffset = data.at[0] === 'left' ? data.targetWidth : data.at[0] === 'right' ? -data.targetWidth : 0;
        var offset = -2 * data.offset[0];
        var newOverRight;
        var newOverLeft;

        if (overLeft < 0) {
          newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;

          if (newOverRight < 0 || newOverRight < abs(overLeft)) {
            position.left += myOffset + atOffset + offset;
          }
        } else if (overRight > 0) {
          newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;

          if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
            position.left += myOffset + atOffset + offset;
          }
        }
      },
      top: function top(position, data) {
        var within = data.within;
        var withinOffset = within.offset.top + within.scrollTop;
        var outerHeight = within.height;
        var offsetTop = within.isWindow ? within.scrollTop : within.offset.top;
        var collisionPosTop = position.top - data.collisionPosition.marginTop;
        var overTop = collisionPosTop - offsetTop;
        var overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop;
        var top = data.my[1] === 'top';
        var myOffset = top ? -data.elemHeight : data.my[1] === 'bottom' ? data.elemHeight : 0;
        var atOffset = data.at[1] === 'top' ? data.targetHeight : data.at[1] === 'bottom' ? -data.targetHeight : 0;
        var offset = -2 * data.offset[1];
        var newOverTop;
        var newOverBottom;

        if (overTop < 0) {
          newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;

          if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
            position.top += myOffset + atOffset + offset;
          }
        } else if (overBottom > 0) {
          newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;

          if (newOverTop > 0 || abs(newOverTop) < overBottom) {
            position.top += myOffset + atOffset + offset;
          }
        }
      }
    },
    flipfit: {
      left: function left() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        collisions.flip.left.apply(this, args);
        collisions.fit.left.apply(this, args);
      },
      top: function top() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        collisions.flip.top.apply(this, args);
        collisions.fit.top.apply(this, args);
      }
    }
  };
  $.position = {
    scrollbarWidth: function scrollbarWidth() {
      if (cachedScrollbarWidth !== undefined) {
        return cachedScrollbarWidth;
      }

      var div = $('<div ' + "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" + "<div style='height:100px;width:auto;'></div></div>");
      var innerDiv = div.children()[0];
      $('body').append(div);
      var w1 = innerDiv.offsetWidth;
      div.css('overflow', 'scroll');
      var w2 = innerDiv.offsetWidth;

      if (w1 === w2) {
        w2 = div[0].clientWidth;
      }

      div.remove();
      cachedScrollbarWidth = w1 - w2;
      return cachedScrollbarWidth;
    },
    getScrollInfo: function getScrollInfo(within) {
      var overflowX = within.isWindow || within.isDocument ? '' : within.element.css('overflow-x');
      var overflowY = within.isWindow || within.isDocument ? '' : within.element.css('overflow-y');
      var hasOverflowX = overflowX === 'scroll' || overflowX === 'auto' && within.width < within.element[0].scrollWidth;
      var hasOverflowY = overflowY === 'scroll' || overflowY === 'auto' && within.height < within.element[0].scrollHeight;
      return {
        width: hasOverflowY ? $.position.scrollbarWidth() : 0,
        height: hasOverflowX ? $.position.scrollbarWidth() : 0
      };
    },
    getWithinInfo: function getWithinInfo(element) {
      var withinElement = $(element || window);
      var isWindow = $.isWindow(withinElement[0]);
      var isDocument = !!withinElement[0] && withinElement[0].nodeType === 9;
      var hasOffset = !isWindow && !isDocument;
      return {
        element: withinElement,
        isWindow: isWindow,
        isDocument: isDocument,
        offset: hasOffset ? $(element).offset() : {
          left: 0,
          top: 0
        },
        scrollLeft: withinElement.scrollLeft(),
        scrollTop: withinElement.scrollTop(),
        width: withinElement.outerWidth(),
        height: withinElement.outerHeight()
      };
    }
  };

  $.fn.position = function (options) {
    if (!options || !options.of) {
      return _position.apply(this, arguments);
    }

    options = $.extend({}, options);
    var within = $.position.getWithinInfo(options.within);
    var scrollInfo = $.position.getScrollInfo(within);
    var collision = (options.collision || 'flip').split(' ');
    var offsets = {};
    var target = $(options.of);
    var dimensions = getDimensions(target);
    var targetWidth = dimensions.width;
    var targetHeight = dimensions.height;
    var targetOffset = dimensions.offset;

    if (target[0].preventDefault) {
      options.at = 'left top';
    }

    var basePosition = $.extend({}, targetOffset);
    $.each(['my', 'at'], function () {
      var pos = (options[this] || '').split(' ');

      if (pos.length === 1) {
        pos = regexHorizontal.test(pos[0]) ? pos.concat(['center']) : regexVertical.test(pos[0]) ? ['center'].concat(pos) : ['center', 'center'];
      }

      pos[0] = regexHorizontal.test(pos[0]) ? pos[0] : 'center';
      pos[1] = regexVertical.test(pos[1]) ? pos[1] : 'center';
      var horizontalOffset = regexOffset.exec(pos[0]);
      var verticalOffset = regexOffset.exec(pos[1]);
      offsets[this] = [horizontalOffset ? horizontalOffset[0] : 0, verticalOffset ? verticalOffset[0] : 0];
      options[this] = [regexPosition.exec(pos[0])[0], regexPosition.exec(pos[1])[0]];
    });

    if (collision.length === 1) {
      collision[1] = collision[0];
    }

    if (options.at[0] === 'right') {
      basePosition.left += targetWidth;
    } else if (options.at[0] === 'center') {
      basePosition.left += targetWidth / 2;
    }

    if (options.at[1] === 'bottom') {
      basePosition.top += targetHeight;
    } else if (options.at[1] === 'center') {
      basePosition.top += targetHeight / 2;
    }

    var atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
    basePosition.left += atOffset[0];
    basePosition.top += atOffset[1];
    return this.each(function () {
      var using;
      var elem = $(this);
      var elemWidth = elem.outerWidth();
      var elemHeight = elem.outerHeight();
      var marginLeft = parseCss(this, 'marginLeft');
      var marginTop = parseCss(this, 'marginTop');
      var collisionWidth = elemWidth + marginLeft + parseCss(this, 'marginRight') + scrollInfo.width;
      var collisionHeight = elemHeight + marginTop + parseCss(this, 'marginBottom') + scrollInfo.height;
      var position = $.extend({}, basePosition);
      var myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());

      if (options.my[0] === 'right') {
        position.left -= elemWidth;
      } else if (options.my[0] === 'center') {
        position.left -= elemWidth / 2;
      }

      if (options.my[1] === 'bottom') {
        position.top -= elemHeight;
      } else if (options.my[1] === 'center') {
        position.top -= elemHeight / 2;
      }

      position.left += myOffset[0];
      position.top += myOffset[1];
      var collisionPosition = {
        marginLeft: marginLeft,
        marginTop: marginTop
      };
      $.each(['left', 'top'], function (i, dir) {
        if (collisions[collision[i]]) {
          collisions[collision[i]][dir](position, {
            targetWidth: targetWidth,
            targetHeight: targetHeight,
            elemWidth: elemWidth,
            elemHeight: elemHeight,
            collisionPosition: collisionPosition,
            collisionWidth: collisionWidth,
            collisionHeight: collisionHeight,
            offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
            my: options.my,
            at: options.at,
            within: within,
            elem: elem
          });
        }
      });

      if (options.using) {
        using = function using(props) {
          var left = targetOffset.left - position.left;
          var right = left + targetWidth - elemWidth;
          var top = targetOffset.top - position.top;
          var bottom = top + targetHeight - elemHeight;
          var feedback = {
            target: {
              element: target,
              left: targetOffset.left,
              top: targetOffset.top,
              width: targetWidth,
              height: targetHeight
            },
            element: {
              element: elem,
              left: position.left,
              top: position.top,
              width: elemWidth,
              height: elemHeight
            },
            horizontal: right < 0 ? 'left' : left > 0 ? 'right' : 'center',
            vertical: bottom < 0 ? 'top' : top > 0 ? 'bottom' : 'middle'
          };

          if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
            feedback.horizontal = 'center';
          }

          if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
            feedback.vertical = 'middle';
          }

          if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
            feedback.important = 'horizontal';
          } else {
            feedback.important = 'vertical';
          }

          options.using.call(this, props, feedback);
        };
      }

      elem.offset($.extend(position, {
        using: using
      }));
    });
  };

  if (!$.hasOwnProperty('ui')) {
    $.ui = {};
  }

  $.ui.position = collisions;
})(jQuery);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, once) {
  Drupal.behaviors.claroAutoCompete = {
    attach: function attach(context) {
      once('claroAutoComplete', 'input.form-autocomplete', context).forEach(function (value) {
        var $input = $(value);
        var timeout = 400;
        var classRemoveTimeout;

        var classRemove = function classRemove($autoCompleteElem) {
          $autoCompleteElem.removeClass('is-autocompleting');
          $autoCompleteElem.siblings('[data-drupal-selector="autocomplete-message"]').addClass('hidden');
        };

        $input.on('input autocompletesearch autocompleteresponses', function (event) {
          if (event && event.type && event.type === 'autocompletesearch') {
            $(event.target).addClass('is-autocompleting');
            $(event.target).siblings('[data-drupal-selector="autocomplete-message"]').removeClass('hidden');
          }

          clearTimeout(classRemoveTimeout);
          classRemoveTimeout = setTimeout(classRemove, timeout, $(event.target));
        });
      });
    }
  };
})(jQuery, Drupal, once);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  Drupal.behaviors.pathDetailsSummaries = {
    attach: function attach(context) {
      $(context).find('.path-form').drupalSetSummary(function (context) {
        var path = $('.js-form-item-path-0-alias input').val();
        return path ? Drupal.t('Alias: @alias', {
          '@alias': path
        }) : Drupal.t('No alias');
      });
    }
  };
})(jQuery, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  var states = {
    postponed: []
  };
  Drupal.states = states;

  function invert(a, invertState) {
    return invertState && typeof a !== 'undefined' ? !a : a;
  }

  function _compare2(a, b) {
    if (a === b) {
      return typeof a === 'undefined' ? a : true;
    }

    return typeof a === 'undefined' || typeof b === 'undefined';
  }

  function ternary(a, b) {
    if (typeof a === 'undefined') {
      return b;
    }

    if (typeof b === 'undefined') {
      return a;
    }

    return a && b;
  }

  Drupal.behaviors.states = {
    attach: function attach(context, settings) {
      var $states = $(context).find('[data-drupal-states]');
      var il = $states.length;

      var _loop = function _loop(i) {
        var config = JSON.parse($states[i].getAttribute('data-drupal-states'));
        Object.keys(config || {}).forEach(function (state) {
          new states.Dependent({
            element: $($states[i]),
            state: states.State.sanitize(state),
            constraints: config[state]
          });
        });
      };

      for (var i = 0; i < il; i++) {
        _loop(i);
      }

      while (states.postponed.length) {
        states.postponed.shift()();
      }
    }
  };

  states.Dependent = function (args) {
    var _this = this;

    $.extend(this, {
      values: {},
      oldValue: null
    }, args);
    this.dependees = this.getDependees();
    Object.keys(this.dependees || {}).forEach(function (selector) {
      _this.initializeDependee(selector, _this.dependees[selector]);
    });
  };

  states.Dependent.comparisons = {
    RegExp: function RegExp(reference, value) {
      return reference.test(value);
    },
    Function: function Function(reference, value) {
      return reference(value);
    },
    Number: function Number(reference, value) {
      return typeof value === 'string' ? _compare2(reference.toString(), value) : _compare2(reference, value);
    }
  };
  states.Dependent.prototype = {
    initializeDependee: function initializeDependee(selector, dependeeStates) {
      var _this2 = this;

      this.values[selector] = {};
      Object.keys(dependeeStates).forEach(function (i) {
        var state = dependeeStates[i];

        if ($.inArray(state, dependeeStates) === -1) {
          return;
        }

        state = states.State.sanitize(state);
        _this2.values[selector][state.name] = null;
        $(selector).on("state:".concat(state), {
          selector: selector,
          state: state
        }, function (e) {
          _this2.update(e.data.selector, e.data.state, e.value);
        });
        new states.Trigger({
          selector: selector,
          state: state
        });
      });
    },
    compare: function compare(reference, selector, state) {
      var value = this.values[selector][state.name];

      if (reference.constructor.name in states.Dependent.comparisons) {
        return states.Dependent.comparisons[reference.constructor.name](reference, value);
      }

      return _compare2(reference, value);
    },
    update: function update(selector, state, value) {
      if (value !== this.values[selector][state.name]) {
        this.values[selector][state.name] = value;
        this.reevaluate();
      }
    },
    reevaluate: function reevaluate() {
      var value = this.verifyConstraints(this.constraints);

      if (value !== this.oldValue) {
        this.oldValue = value;
        value = invert(value, this.state.invert);
        this.element.trigger({
          type: "state:".concat(this.state),
          value: value,
          trigger: true
        });
      }
    },
    verifyConstraints: function verifyConstraints(constraints, selector) {
      var result;

      if ($.isArray(constraints)) {
        var hasXor = $.inArray('xor', constraints) === -1;
        var len = constraints.length;

        for (var i = 0; i < len; i++) {
          if (constraints[i] !== 'xor') {
            var constraint = this.checkConstraints(constraints[i], selector, i);

            if (constraint && (hasXor || result)) {
              return hasXor;
            }

            result = result || constraint;
          }
        }
      } else if ($.isPlainObject(constraints)) {
          for (var n in constraints) {
            if (constraints.hasOwnProperty(n)) {
              result = ternary(result, this.checkConstraints(constraints[n], selector, n));

              if (result === false) {
                return false;
              }
            }
          }
        }

      return result;
    },
    checkConstraints: function checkConstraints(value, selector, state) {
      if (typeof state !== 'string' || /[0-9]/.test(state[0])) {
        state = null;
      } else if (typeof selector === 'undefined') {
        selector = state;
        state = null;
      }

      if (state !== null) {
        state = states.State.sanitize(state);
        return invert(this.compare(value, selector, state), state.invert);
      }

      return this.verifyConstraints(value, selector);
    },
    getDependees: function getDependees() {
      var cache = {};
      var _compare = this.compare;

      this.compare = function (reference, selector, state) {
        (cache[selector] || (cache[selector] = [])).push(state.name);
      };

      this.verifyConstraints(this.constraints);
      this.compare = _compare;
      return cache;
    }
  };

  states.Trigger = function (args) {
    $.extend(this, args);

    if (this.state in states.Trigger.states) {
      this.element = $(this.selector);

      if (!this.element.data("trigger:".concat(this.state))) {
        this.initialize();
      }
    }
  };

  states.Trigger.prototype = {
    initialize: function initialize() {
      var _this3 = this;

      var trigger = states.Trigger.states[this.state];

      if (typeof trigger === 'function') {
        trigger.call(window, this.element);
      } else {
        Object.keys(trigger || {}).forEach(function (event) {
          _this3.defaultTrigger(event, trigger[event]);
        });
      }

      this.element.data("trigger:".concat(this.state), true);
    },
    defaultTrigger: function defaultTrigger(event, valueFn) {
      var oldValue = valueFn.call(this.element);
      this.element.on(event, $.proxy(function (e) {
        var value = valueFn.call(this.element, e);

        if (oldValue !== value) {
          this.element.trigger({
            type: "state:".concat(this.state),
            value: value,
            oldValue: oldValue
          });
          oldValue = value;
        }
      }, this));
      states.postponed.push($.proxy(function () {
        this.element.trigger({
          type: "state:".concat(this.state),
          value: oldValue,
          oldValue: null
        });
      }, this));
    }
  };
  states.Trigger.states = {
    empty: {
      keyup: function keyup() {
        return this.val() === '';
      }
    },
    checked: {
      change: function change() {
        var checked = false;
        this.each(function () {
          checked = $(this).prop('checked');
          return !checked;
        });
        return checked;
      }
    },
    value: {
      keyup: function keyup() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }

        return this.val();
      },
      change: function change() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }

        return this.val();
      }
    },
    collapsed: {
      collapsed: function collapsed(e) {
        return typeof e !== 'undefined' && 'value' in e ? e.value : !this.is('[open]');
      }
    }
  };

  states.State = function (state) {
    this.pristine = state;
    this.name = state;
    var process = true;

    do {
      while (this.name.charAt(0) === '!') {
        this.name = this.name.substring(1);
        this.invert = !this.invert;
      }

      if (this.name in states.State.aliases) {
        this.name = states.State.aliases[this.name];
      } else {
        process = false;
      }
    } while (process);
  };

  states.State.sanitize = function (state) {
    if (state instanceof states.State) {
      return state;
    }

    return new states.State(state);
  };

  states.State.aliases = {
    enabled: '!disabled',
    invisible: '!visible',
    invalid: '!valid',
    untouched: '!touched',
    optional: '!required',
    filled: '!empty',
    unchecked: '!checked',
    irrelevant: '!relevant',
    expanded: '!collapsed',
    open: '!collapsed',
    closed: 'collapsed',
    readwrite: '!readonly'
  };
  states.State.prototype = {
    invert: false,
    toString: function toString() {
      return this.name;
    }
  };
  var $document = $(document);
  $document.on('state:disabled', function (e) {
    if (e.trigger) {
      $(e.target).prop('disabled', e.value).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value).find('select, input, textarea').prop('disabled', e.value);
    }
  });
  $document.on('state:required', function (e) {
    if (e.trigger) {
      if (e.value) {
        var label = "label".concat(e.target.id ? "[for=".concat(e.target.id, "]") : '');
        var $label = $(e.target).attr({
          required: 'required',
          'aria-required': 'true'
        }).closest('.js-form-item, .js-form-wrapper').find(label);

        if (!$label.hasClass('js-form-required').length) {
          $label.addClass('js-form-required form-required');
        }
      } else {
        $(e.target).removeAttr('required aria-required').closest('.js-form-item, .js-form-wrapper').find('label.js-form-required').removeClass('js-form-required form-required');
      }
    }
  });
  $document.on('state:visible', function (e) {
    if (e.trigger) {
      $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggle(e.value);
    }
  });
  $document.on('state:checked', function (e) {
    if (e.trigger) {
      $(e.target).prop('checked', e.value);
    }
  });
  $document.on('state:collapsed', function (e) {
    if (e.trigger) {
      if ($(e.target).is('[open]') === e.value) {
        $(e.target).find('> summary').trigger('click');
      }
    }
  });
})(jQuery, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, debounce) {
  var offsets = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  function getRawOffset(el, edge) {
    var $el = $(el);
    var documentElement = document.documentElement;
    var displacement = 0;
    var horizontal = edge === 'left' || edge === 'right';
    var placement = $el.offset()[horizontal ? 'left' : 'top'];
    placement -= window["scroll".concat(horizontal ? 'X' : 'Y')] || document.documentElement["scroll".concat(horizontal ? 'Left' : 'Top')] || 0;

    switch (edge) {
      case 'top':
        displacement = placement + $el.outerHeight();
        break;

      case 'left':
        displacement = placement + $el.outerWidth();
        break;

      case 'bottom':
        displacement = documentElement.clientHeight - placement;
        break;

      case 'right':
        displacement = documentElement.clientWidth - placement;
        break;

      default:
        displacement = 0;
    }

    return displacement;
  }

  function calculateOffset(edge) {
    var edgeOffset = 0;
    var displacingElements = document.querySelectorAll("[data-offset-".concat(edge, "]"));
    var n = displacingElements.length;

    for (var i = 0; i < n; i++) {
      var el = displacingElements[i];

      if (el.style.display === 'none') {
        continue;
      }

      var displacement = parseInt(el.getAttribute("data-offset-".concat(edge)), 10);

      if (isNaN(displacement)) {
        displacement = getRawOffset(el, edge);
      }

      edgeOffset = Math.max(edgeOffset, displacement);
    }

    return edgeOffset;
  }

  function calculateOffsets() {
    return {
      top: calculateOffset('top'),
      right: calculateOffset('right'),
      bottom: calculateOffset('bottom'),
      left: calculateOffset('left')
    };
  }

  function displace(broadcast) {
    offsets = calculateOffsets();
    Drupal.displace.offsets = offsets;

    if (typeof broadcast === 'undefined' || broadcast) {
      $(document).trigger('drupalViewportOffsetChange', offsets);
    }

    return offsets;
  }

  Drupal.behaviors.drupalDisplace = {
    attach: function attach() {
      if (this.displaceProcessed) {
        return;
      }

      this.displaceProcessed = true;
      $(window).on('resize.drupalDisplace', debounce(displace, 200));
    }
  };
  Drupal.displace = displace;
  $.extend(Drupal.displace, {
    offsets: offsets,
    calculateOffset: calculateOffset
  });
})(jQuery, Drupal, Drupal.debounce);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, drupalSettings) {
  drupalSettings.dialog = {
    autoOpen: true,
    dialogClass: '',
    buttonClass: 'button',
    buttonPrimaryClass: 'button--primary',
    close: function close(event) {
      Drupal.dialog(event.target).close();
      Drupal.detachBehaviors(event.target, null, 'unload');
    }
  };

  Drupal.dialog = function (element, options) {
    var undef;
    var $element = $(element);
    var dialog = {
      open: false,
      returnValue: undef
    };

    function openDialog(settings) {
      settings = $.extend({}, drupalSettings.dialog, options, settings);
      $(window).trigger('dialog:beforecreate', [dialog, $element, settings]);
      $element.dialog(settings);
      dialog.open = true;
      $(window).trigger('dialog:aftercreate', [dialog, $element, settings]);
    }

    function closeDialog(value) {
      $(window).trigger('dialog:beforeclose', [dialog, $element]);
      $element.dialog('close');
      dialog.returnValue = value;
      dialog.open = false;
      $(window).trigger('dialog:afterclose', [dialog, $element]);
    }

    dialog.show = function () {
      openDialog({
        modal: false
      });
    };

    dialog.showModal = function () {
      openDialog({
        modal: true
      });
    };

    dialog.close = closeDialog;
    return dialog;
  };
})(jQuery, Drupal, drupalSettings);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, drupalSettings, debounce, displace) {
  drupalSettings.dialog = $.extend({
    autoResize: true,
    maxHeight: '95%'
  }, drupalSettings.dialog);

  function resetPosition(options) {
    var offsets = displace.offsets;
    var left = offsets.left - offsets.right;
    var top = offsets.top - offsets.bottom;
    var leftString = "".concat((left > 0 ? '+' : '-') + Math.abs(Math.round(left / 2)), "px");
    var topString = "".concat((top > 0 ? '+' : '-') + Math.abs(Math.round(top / 2)), "px");
    options.position = {
      my: "center".concat(left !== 0 ? leftString : '', " center").concat(top !== 0 ? topString : ''),
      of: window
    };
    return options;
  }

  function resetSize(event) {
    var positionOptions = ['width', 'height', 'minWidth', 'minHeight', 'maxHeight', 'maxWidth', 'position'];
    var adjustedOptions = {};
    var windowHeight = $(window).height();
    var option;
    var optionValue;
    var adjustedValue;

    for (var n = 0; n < positionOptions.length; n++) {
      option = positionOptions[n];
      optionValue = event.data.settings[option];

      if (optionValue) {
        if (typeof optionValue === 'string' && /%$/.test(optionValue) && /height/i.test(option)) {
          windowHeight -= displace.offsets.top + displace.offsets.bottom;
          adjustedValue = parseInt(0.01 * parseInt(optionValue, 10) * windowHeight, 10);

          if (option === 'height' && event.data.$element.parent().outerHeight() < adjustedValue) {
            adjustedValue = 'auto';
          }

          adjustedOptions[option] = adjustedValue;
        }
      }
    }

    if (!event.data.settings.modal) {
      adjustedOptions = resetPosition(adjustedOptions);
    }

    event.data.$element.dialog('option', adjustedOptions).trigger('dialogContentResize');
  }

  $(window).on({
    'dialog:aftercreate': function dialogAftercreate(event, dialog, $element, settings) {
      var autoResize = debounce(resetSize, 20);
      var eventData = {
        settings: settings,
        $element: $element
      };

      if (settings.autoResize === true || settings.autoResize === 'true') {
        $element.dialog('option', {
          resizable: false,
          draggable: false
        }).dialog('widget').css('position', 'fixed');
        $(window).on('resize.dialogResize scroll.dialogResize', eventData, autoResize).trigger('resize.dialogResize');
        $(document).on('drupalViewportOffsetChange.dialogResize', eventData, autoResize);
      }
    },
    'dialog:beforeclose': function dialogBeforeclose(event, dialog, $element) {
      $(window).off('.dialogResize');
      $(document).off('.dialogResize');
    }
  });
})(jQuery, Drupal, drupalSettings, Drupal.debounce, Drupal.displace);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, _ref) {
  var tabbable = _ref.tabbable,
      isTabbable = _ref.isTabbable;
  $.widget('ui.dialog', $.ui.dialog, {
    options: {
      buttonClass: 'button',
      buttonPrimaryClass: 'button--primary'
    },
    _createButtons: function _createButtons() {
      var opts = this.options;
      var primaryIndex;
      var index;
      var il = opts.buttons.length;

      for (index = 0; index < il; index++) {
        if (opts.buttons[index].primary && opts.buttons[index].primary === true) {
          primaryIndex = index;
          delete opts.buttons[index].primary;
          break;
        }
      }

      this._super();

      var $buttons = this.uiButtonSet.children().addClass(opts.buttonClass);

      if (typeof primaryIndex !== 'undefined') {
        $buttons.eq(index).addClass(opts.buttonPrimaryClass);
      }
    },
    _focusTabbable: function _focusTabbable() {
      var hasFocus = this._focusedElement ? this._focusedElement.get(0) : null;

      if (!hasFocus) {
        hasFocus = this.element.find('[autofocus]').get(0);
      }

      if (!hasFocus) {
        var $elements = [this.element, this.uiDialogButtonPane];

        for (var i = 0; i < $elements.length; i++) {
          var element = $elements[i].get(0);

          if (element) {
            var elementTabbable = tabbable(element);
            hasFocus = elementTabbable.length ? elementTabbable[0] : null;
          }

          if (hasFocus) {
            break;
          }
        }
      }

      if (!hasFocus) {
        var closeBtn = this.uiDialogTitlebarClose.get(0);
        hasFocus = closeBtn && isTabbable(closeBtn) ? closeBtn : null;
      }

      if (!hasFocus) {
        hasFocus = this.uiDialog.get(0);
      }

      $(hasFocus).eq(0).trigger('focus');
    }
  });
})(jQuery, window.tabbable);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  Drupal.behaviors.dialog = {
    attach: function attach(context, settings) {
      var $context = $(context);

      if (!$('#drupal-modal').length) {
        $('<div id="drupal-modal" class="ui-front"></div>').hide().appendTo('body');
      }

      var $dialog = $context.closest('.ui-dialog-content');

      if ($dialog.length) {
        if ($dialog.dialog('option', 'drupalAutoButtons')) {
          $dialog.trigger('dialogButtonsChange');
        }

        $dialog.dialog('widget').trigger('focus');
      }

      var originalClose = settings.dialog.close;

      settings.dialog.close = function (event) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        originalClose.apply(settings.dialog, [event].concat(args));
        $(event.target).remove();
      };
    },
    prepareDialogButtons: function prepareDialogButtons($dialog) {
      var buttons = [];
      var $buttons = $dialog.find('.form-actions input[type=submit], .form-actions a.button');
      $buttons.each(function () {
        var $originalButton = $(this).css({
          display: 'none'
        });
        buttons.push({
          text: $originalButton.html() || $originalButton.attr('value'),
          class: $originalButton.attr('class'),
          click: function click(e) {
            if ($originalButton.is('a')) {
              $originalButton[0].click();
            } else {
              $originalButton.trigger('mousedown').trigger('mouseup').trigger('click');
              e.preventDefault();
            }
          }
        });
      });
      return buttons;
    }
  };

  Drupal.AjaxCommands.prototype.openDialog = function (ajax, response, status) {
    if (!response.selector) {
      return false;
    }

    var $dialog = $(response.selector);

    if (!$dialog.length) {
      $dialog = $("<div id=\"".concat(response.selector.replace(/^#/, ''), "\" class=\"ui-front\"></div>")).appendTo('body');
    }

    if (!ajax.wrapper) {
      ajax.wrapper = $dialog.attr('id');
    }

    response.command = 'insert';
    response.method = 'html';
    ajax.commands.insert(ajax, response, status);

    if (!response.dialogOptions.buttons) {
      response.dialogOptions.drupalAutoButtons = true;
      response.dialogOptions.buttons = Drupal.behaviors.dialog.prepareDialogButtons($dialog);
    }

    $dialog.on('dialogButtonsChange', function () {
      var buttons = Drupal.behaviors.dialog.prepareDialogButtons($dialog);
      $dialog.dialog('option', 'buttons', buttons);
    });
    response.dialogOptions = response.dialogOptions || {};
    var dialog = Drupal.dialog($dialog.get(0), response.dialogOptions);

    if (response.dialogOptions.modal) {
      dialog.showModal();
    } else {
      dialog.show();
    }

    $dialog.parent().find('.ui-dialog-buttonset').addClass('form-actions');
  };

  Drupal.AjaxCommands.prototype.closeDialog = function (ajax, response, status) {
    var $dialog = $(response.selector);

    if ($dialog.length) {
      Drupal.dialog($dialog.get(0)).close();

      if (!response.persist) {
        $dialog.remove();
      }
    }

    $dialog.off('dialogButtonsChange');
  };

  Drupal.AjaxCommands.prototype.setDialogOption = function (ajax, response, status) {
    var $dialog = $(response.selector);

    if ($dialog.length) {
      $dialog.dialog('option', response.optionName, response.optionValue);
    }
  };

  $(window).on('dialog:aftercreate', function (e, dialog, $element, settings) {
    $element.on('click.dialog', '.dialog-cancel', function (e) {
      dialog.close('cancel');
      e.preventDefault();
      e.stopPropagation();
    });
  });
  $(window).on('dialog:beforeclose', function (e, dialog, $element) {
    $element.off('.dialog');
  });
})(jQuery, Drupal);;
/*! Sortable 1.13.0 - MIT | git://github.com/SortableJS/Sortable.git */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Sortable=e()}(this,function(){"use strict";function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function a(){return(a=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t}).apply(this,arguments)}function I(i){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{},e=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(e=e.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),e.forEach(function(t){var e,n,o;e=i,o=r[n=t],n in e?Object.defineProperty(e,n,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[n]=o})}return i}function l(t,e){if(null==t)return{};var n,o,i=function(t,e){if(null==t)return{};var n,o,i={},r=Object.keys(t);for(o=0;o<r.length;o++)n=r[o],0<=e.indexOf(n)||(i[n]=t[n]);return i}(t,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);for(o=0;o<r.length;o++)n=r[o],0<=e.indexOf(n)||Object.prototype.propertyIsEnumerable.call(t,n)&&(i[n]=t[n])}return i}function e(t){return function(t){if(Array.isArray(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}(t)||function(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function t(t){if("undefined"!=typeof window&&window.navigator)return!!navigator.userAgent.match(t)}var w=t(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i),E=t(/Edge/i),c=t(/firefox/i),u=t(/safari/i)&&!t(/chrome/i)&&!t(/android/i),n=t(/iP(ad|od|hone)/i),i=t(/chrome/i)&&t(/android/i),r={capture:!1,passive:!1};function d(t,e,n){t.addEventListener(e,n,!w&&r)}function s(t,e,n){t.removeEventListener(e,n,!w&&r)}function h(t,e){if(e){if(">"===e[0]&&(e=e.substring(1)),t)try{if(t.matches)return t.matches(e);if(t.msMatchesSelector)return t.msMatchesSelector(e);if(t.webkitMatchesSelector)return t.webkitMatchesSelector(e)}catch(t){return!1}return!1}}function P(t,e,n,o){if(t){n=n||document;do{if(null!=e&&(">"===e[0]?t.parentNode===n&&h(t,e):h(t,e))||o&&t===n)return t;if(t===n)break}while(t=(i=t).host&&i!==document&&i.host.nodeType?i.host:i.parentNode)}var i;return null}var f,p=/\s+/g;function k(t,e,n){if(t&&e)if(t.classList)t.classList[n?"add":"remove"](e);else{var o=(" "+t.className+" ").replace(p," ").replace(" "+e+" "," ");t.className=(o+(n?" "+e:"")).replace(p," ")}}function R(t,e,n){var o=t&&t.style;if(o){if(void 0===n)return document.defaultView&&document.defaultView.getComputedStyle?n=document.defaultView.getComputedStyle(t,""):t.currentStyle&&(n=t.currentStyle),void 0===e?n:n[e];e in o||-1!==e.indexOf("webkit")||(e="-webkit-"+e),o[e]=n+("string"==typeof n?"":"px")}}function v(t,e){var n="";if("string"==typeof t)n=t;else do{var o=R(t,"transform");o&&"none"!==o&&(n=o+" "+n)}while(!e&&(t=t.parentNode));var i=window.DOMMatrix||window.WebKitCSSMatrix||window.CSSMatrix||window.MSCSSMatrix;return i&&new i(n)}function g(t,e,n){if(t){var o=t.getElementsByTagName(e),i=0,r=o.length;if(n)for(;i<r;i++)n(o[i],i);return o}return[]}function A(){var t=document.scrollingElement;return t||document.documentElement}function X(t,e,n,o,i){if(t.getBoundingClientRect||t===window){var r,a,l,s,c,u,d;if(d=t!==window&&t.parentNode&&t!==A()?(a=(r=t.getBoundingClientRect()).top,l=r.left,s=r.bottom,c=r.right,u=r.height,r.width):(l=a=0,s=window.innerHeight,c=window.innerWidth,u=window.innerHeight,window.innerWidth),(e||n)&&t!==window&&(i=i||t.parentNode,!w))do{if(i&&i.getBoundingClientRect&&("none"!==R(i,"transform")||n&&"static"!==R(i,"position"))){var h=i.getBoundingClientRect();a-=h.top+parseInt(R(i,"border-top-width")),l-=h.left+parseInt(R(i,"border-left-width")),s=a+r.height,c=l+r.width;break}}while(i=i.parentNode);if(o&&t!==window){var f=v(i||t),p=f&&f.a,g=f&&f.d;f&&(s=(a/=g)+(u/=g),c=(l/=p)+(d/=p))}return{top:a,left:l,bottom:s,right:c,width:d,height:u}}}function Y(t,e,n){for(var o=H(t,!0),i=X(t)[e];o;){var r=X(o)[n];if(!("top"===n||"left"===n?r<=i:i<=r))return o;if(o===A())break;o=H(o,!1)}return!1}function m(t,e,n){for(var o=0,i=0,r=t.children;i<r.length;){if("none"!==r[i].style.display&&r[i]!==Rt.ghost&&r[i]!==Rt.dragged&&P(r[i],n.draggable,t,!1)){if(o===e)return r[i];o++}i++}return null}function B(t,e){for(var n=t.lastElementChild;n&&(n===Rt.ghost||"none"===R(n,"display")||e&&!h(n,e));)n=n.previousElementSibling;return n||null}function F(t,e){var n=0;if(!t||!t.parentNode)return-1;for(;t=t.previousElementSibling;)"TEMPLATE"===t.nodeName.toUpperCase()||t===Rt.clone||e&&!h(t,e)||n++;return n}function b(t){var e=0,n=0,o=A();if(t)do{var i=v(t),r=i.a,a=i.d;e+=t.scrollLeft*r,n+=t.scrollTop*a}while(t!==o&&(t=t.parentNode));return[e,n]}function H(t,e){if(!t||!t.getBoundingClientRect)return A();var n=t,o=!1;do{if(n.clientWidth<n.scrollWidth||n.clientHeight<n.scrollHeight){var i=R(n);if(n.clientWidth<n.scrollWidth&&("auto"==i.overflowX||"scroll"==i.overflowX)||n.clientHeight<n.scrollHeight&&("auto"==i.overflowY||"scroll"==i.overflowY)){if(!n.getBoundingClientRect||n===document.body)return A();if(o||e)return n;o=!0}}}while(n=n.parentNode);return A()}function y(t,e){return Math.round(t.top)===Math.round(e.top)&&Math.round(t.left)===Math.round(e.left)&&Math.round(t.height)===Math.round(e.height)&&Math.round(t.width)===Math.round(e.width)}function D(e,n){return function(){if(!f){var t=arguments;1===t.length?e.call(this,t[0]):e.apply(this,t),f=setTimeout(function(){f=void 0},n)}}}function L(t,e,n){t.scrollLeft+=e,t.scrollTop+=n}function S(t){var e=window.Polymer,n=window.jQuery||window.Zepto;return e&&e.dom?e.dom(t).cloneNode(!0):n?n(t).clone(!0)[0]:t.cloneNode(!0)}function _(t,e){R(t,"position","absolute"),R(t,"top",e.top),R(t,"left",e.left),R(t,"width",e.width),R(t,"height",e.height)}function C(t){R(t,"position",""),R(t,"top",""),R(t,"left",""),R(t,"width",""),R(t,"height","")}var j="Sortable"+(new Date).getTime();function T(){var e,o=[];return{captureAnimationState:function(){o=[],this.options.animation&&[].slice.call(this.el.children).forEach(function(t){if("none"!==R(t,"display")&&t!==Rt.ghost){o.push({target:t,rect:X(t)});var e=I({},o[o.length-1].rect);if(t.thisAnimationDuration){var n=v(t,!0);n&&(e.top-=n.f,e.left-=n.e)}t.fromRect=e}})},addAnimationState:function(t){o.push(t)},removeAnimationState:function(t){o.splice(function(t,e){for(var n in t)if(t.hasOwnProperty(n))for(var o in e)if(e.hasOwnProperty(o)&&e[o]===t[n][o])return Number(n);return-1}(o,{target:t}),1)},animateAll:function(t){var c=this;if(!this.options.animation)return clearTimeout(e),void("function"==typeof t&&t());var u=!1,d=0;o.forEach(function(t){var e=0,n=t.target,o=n.fromRect,i=X(n),r=n.prevFromRect,a=n.prevToRect,l=t.rect,s=v(n,!0);s&&(i.top-=s.f,i.left-=s.e),n.toRect=i,n.thisAnimationDuration&&y(r,i)&&!y(o,i)&&(l.top-i.top)/(l.left-i.left)==(o.top-i.top)/(o.left-i.left)&&(e=function(t,e,n,o){return Math.sqrt(Math.pow(e.top-t.top,2)+Math.pow(e.left-t.left,2))/Math.sqrt(Math.pow(e.top-n.top,2)+Math.pow(e.left-n.left,2))*o.animation}(l,r,a,c.options)),y(i,o)||(n.prevFromRect=o,n.prevToRect=i,e||(e=c.options.animation),c.animate(n,l,i,e)),e&&(u=!0,d=Math.max(d,e),clearTimeout(n.animationResetTimer),n.animationResetTimer=setTimeout(function(){n.animationTime=0,n.prevFromRect=null,n.fromRect=null,n.prevToRect=null,n.thisAnimationDuration=null},e),n.thisAnimationDuration=e)}),clearTimeout(e),u?e=setTimeout(function(){"function"==typeof t&&t()},d):"function"==typeof t&&t(),o=[]},animate:function(t,e,n,o){if(o){R(t,"transition",""),R(t,"transform","");var i=v(this.el),r=i&&i.a,a=i&&i.d,l=(e.left-n.left)/(r||1),s=(e.top-n.top)/(a||1);t.animatingX=!!l,t.animatingY=!!s,R(t,"transform","translate3d("+l+"px,"+s+"px,0)"),this.forRepaintDummy=function(t){return t.offsetWidth}(t),R(t,"transition","transform "+o+"ms"+(this.options.easing?" "+this.options.easing:"")),R(t,"transform","translate3d(0,0,0)"),"number"==typeof t.animated&&clearTimeout(t.animated),t.animated=setTimeout(function(){R(t,"transition",""),R(t,"transform",""),t.animated=!1,t.animatingX=!1,t.animatingY=!1},o)}}}}var x=[],M={initializeByDefault:!0},O={mount:function(e){for(var t in M)!M.hasOwnProperty(t)||t in e||(e[t]=M[t]);x.forEach(function(t){if(t.pluginName===e.pluginName)throw"Sortable: Cannot mount plugin ".concat(e.pluginName," more than once")}),x.push(e)},pluginEvent:function(e,n,o){var t=this;this.eventCanceled=!1,o.cancel=function(){t.eventCanceled=!0};var i=e+"Global";x.forEach(function(t){n[t.pluginName]&&(n[t.pluginName][i]&&n[t.pluginName][i](I({sortable:n},o)),n.options[t.pluginName]&&n[t.pluginName][e]&&n[t.pluginName][e](I({sortable:n},o)))})},initializePlugins:function(o,i,r,t){for(var e in x.forEach(function(t){var e=t.pluginName;if(o.options[e]||t.initializeByDefault){var n=new t(o,i,o.options);n.sortable=o,n.options=o.options,o[e]=n,a(r,n.defaults)}}),o.options)if(o.options.hasOwnProperty(e)){var n=this.modifyOption(o,e,o.options[e]);void 0!==n&&(o.options[e]=n)}},getEventProperties:function(e,n){var o={};return x.forEach(function(t){"function"==typeof t.eventProperties&&a(o,t.eventProperties.call(n[t.pluginName],e))}),o},modifyOption:function(e,n,o){var i;return x.forEach(function(t){e[t.pluginName]&&t.optionListeners&&"function"==typeof t.optionListeners[n]&&(i=t.optionListeners[n].call(e[t.pluginName],o))}),i}};function N(t){var e=t.sortable,n=t.rootEl,o=t.name,i=t.targetEl,r=t.cloneEl,a=t.toEl,l=t.fromEl,s=t.oldIndex,c=t.newIndex,u=t.oldDraggableIndex,d=t.newDraggableIndex,h=t.originalEvent,f=t.putSortable,p=t.extraEventProperties;if(e=e||n&&n[j]){var g,v=e.options,m="on"+o.charAt(0).toUpperCase()+o.substr(1);!window.CustomEvent||w||E?(g=document.createEvent("Event")).initEvent(o,!0,!0):g=new CustomEvent(o,{bubbles:!0,cancelable:!0}),g.to=a||n,g.from=l||n,g.item=i||n,g.clone=r,g.oldIndex=s,g.newIndex=c,g.oldDraggableIndex=u,g.newDraggableIndex=d,g.originalEvent=h,g.pullMode=f?f.lastPutMode:void 0;var b=I({},p,O.getEventProperties(o,e));for(var y in b)g[y]=b[y];n&&n.dispatchEvent(g),v[m]&&v[m].call(e,g)}}function K(t,e,n){var o=2<arguments.length&&void 0!==n?n:{},i=o.evt,r=l(o,["evt"]);O.pluginEvent.bind(Rt)(t,e,I({dragEl:z,parentEl:G,ghostEl:U,rootEl:q,nextEl:V,lastDownEl:Z,cloneEl:Q,cloneHidden:$,dragStarted:dt,putSortable:it,activeSortable:Rt.active,originalEvent:i,oldIndex:J,oldDraggableIndex:et,newIndex:tt,newDraggableIndex:nt,hideGhostForTarget:At,unhideGhostForTarget:It,cloneNowHidden:function(){$=!0},cloneNowShown:function(){$=!1},dispatchSortableEvent:function(t){W({sortable:e,name:t,originalEvent:i})}},r))}function W(t){N(I({putSortable:it,cloneEl:Q,targetEl:z,rootEl:q,oldIndex:J,oldDraggableIndex:et,newIndex:tt,newDraggableIndex:nt},t))}var z,G,U,q,V,Z,Q,$,J,tt,et,nt,ot,it,rt,at,lt,st,ct,ut,dt,ht,ft,pt,gt,vt=!1,mt=!1,bt=[],yt=!1,wt=!1,Et=[],Dt=!1,St=[],_t="undefined"!=typeof document,Ct=n,Tt=E||w?"cssFloat":"float",xt=_t&&!i&&!n&&"draggable"in document.createElement("div"),Mt=function(){if(_t){if(w)return!1;var t=document.createElement("x");return t.style.cssText="pointer-events:auto","auto"===t.style.pointerEvents}}(),Ot=function(t,e){var n=R(t),o=parseInt(n.width)-parseInt(n.paddingLeft)-parseInt(n.paddingRight)-parseInt(n.borderLeftWidth)-parseInt(n.borderRightWidth),i=m(t,0,e),r=m(t,1,e),a=i&&R(i),l=r&&R(r),s=a&&parseInt(a.marginLeft)+parseInt(a.marginRight)+X(i).width,c=l&&parseInt(l.marginLeft)+parseInt(l.marginRight)+X(r).width;if("flex"===n.display)return"column"===n.flexDirection||"column-reverse"===n.flexDirection?"vertical":"horizontal";if("grid"===n.display)return n.gridTemplateColumns.split(" ").length<=1?"vertical":"horizontal";if(i&&a.float&&"none"!==a.float){var u="left"===a.float?"left":"right";return!r||"both"!==l.clear&&l.clear!==u?"horizontal":"vertical"}return i&&("block"===a.display||"flex"===a.display||"table"===a.display||"grid"===a.display||o<=s&&"none"===n[Tt]||r&&"none"===n[Tt]&&o<s+c)?"vertical":"horizontal"},Nt=function(t){function s(a,l){return function(t,e,n,o){var i=t.options.group.name&&e.options.group.name&&t.options.group.name===e.options.group.name;if(null==a&&(l||i))return!0;if(null==a||!1===a)return!1;if(l&&"clone"===a)return a;if("function"==typeof a)return s(a(t,e,n,o),l)(t,e,n,o);var r=(l?t:e).options.group.name;return!0===a||"string"==typeof a&&a===r||a.join&&-1<a.indexOf(r)}}var e={},n=t.group;n&&"object"==o(n)||(n={name:n}),e.name=n.name,e.checkPull=s(n.pull,!0),e.checkPut=s(n.put),e.revertClone=n.revertClone,t.group=e},At=function(){!Mt&&U&&R(U,"display","none")},It=function(){!Mt&&U&&R(U,"display","")};_t&&document.addEventListener("click",function(t){if(mt)return t.preventDefault(),t.stopPropagation&&t.stopPropagation(),t.stopImmediatePropagation&&t.stopImmediatePropagation(),mt=!1},!0);function Pt(t){if(z){var e=function(r,a){var l;return bt.some(function(t){if(!B(t)){var e=X(t),n=t[j].options.emptyInsertThreshold,o=r>=e.left-n&&r<=e.right+n,i=a>=e.top-n&&a<=e.bottom+n;return n&&o&&i?l=t:void 0}}),l}((t=t.touches?t.touches[0]:t).clientX,t.clientY);if(e){var n={};for(var o in t)t.hasOwnProperty(o)&&(n[o]=t[o]);n.target=n.rootEl=e,n.preventDefault=void 0,n.stopPropagation=void 0,e[j]._onDragOver(n)}}}function kt(t){z&&z.parentNode[j]._isOutsideThisEl(t.target)}function Rt(t,e){if(!t||!t.nodeType||1!==t.nodeType)throw"Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t));this.el=t,this.options=e=a({},e),t[j]=this;var n={group:null,sort:!0,disabled:!1,store:null,handle:null,draggable:/^[uo]l$/i.test(t.nodeName)?">li":">*",swapThreshold:1,invertSwap:!1,invertedSwapThreshold:null,removeCloneOnHide:!0,direction:function(){return Ot(t,this.options)},ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",dragClass:"sortable-drag",ignore:"a, img",filter:null,preventOnFilter:!0,animation:0,easing:null,setData:function(t,e){t.setData("Text",e.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:"data-id",delay:0,delayOnTouchOnly:!1,touchStartThreshold:(Number.parseInt?Number:window).parseInt(window.devicePixelRatio,10)||1,forceFallback:!1,fallbackClass:"sortable-fallback",fallbackOnBody:!1,fallbackTolerance:0,fallbackOffset:{x:0,y:0},supportPointer:!1!==Rt.supportPointer&&"PointerEvent"in window&&!u,emptyInsertThreshold:5};for(var o in O.initializePlugins(this,t,n),n)o in e||(e[o]=n[o]);for(var i in Nt(e),this)"_"===i.charAt(0)&&"function"==typeof this[i]&&(this[i]=this[i].bind(this));this.nativeDraggable=!e.forceFallback&&xt,this.nativeDraggable&&(this.options.touchStartThreshold=1),e.supportPointer?d(t,"pointerdown",this._onTapStart):(d(t,"mousedown",this._onTapStart),d(t,"touchstart",this._onTapStart)),this.nativeDraggable&&(d(t,"dragover",this),d(t,"dragenter",this)),bt.push(this.el),e.store&&e.store.get&&this.sort(e.store.get(this)||[]),a(this,T())}function Xt(t,e,n,o,i,r,a,l){var s,c,u=t[j],d=u.options.onMove;return!window.CustomEvent||w||E?(s=document.createEvent("Event")).initEvent("move",!0,!0):s=new CustomEvent("move",{bubbles:!0,cancelable:!0}),s.to=e,s.from=t,s.dragged=n,s.draggedRect=o,s.related=i||e,s.relatedRect=r||X(e),s.willInsertAfter=l,s.originalEvent=a,t.dispatchEvent(s),d&&(c=d.call(u,s,a)),c}function Yt(t){t.draggable=!1}function Bt(){Dt=!1}function Ft(t){for(var e=t.tagName+t.className+t.src+t.href+t.textContent,n=e.length,o=0;n--;)o+=e.charCodeAt(n);return o.toString(36)}function Ht(t){return setTimeout(t,0)}function Lt(t){return clearTimeout(t)}Rt.prototype={constructor:Rt,_isOutsideThisEl:function(t){this.el.contains(t)||t===this.el||(ht=null)},_getDirection:function(t,e){return"function"==typeof this.options.direction?this.options.direction.call(this,t,e,z):this.options.direction},_onTapStart:function(e){if(e.cancelable){var n=this,o=this.el,t=this.options,i=t.preventOnFilter,r=e.type,a=e.touches&&e.touches[0]||e.pointerType&&"touch"===e.pointerType&&e,l=(a||e).target,s=e.target.shadowRoot&&(e.path&&e.path[0]||e.composedPath&&e.composedPath()[0])||l,c=t.filter;if(function(t){St.length=0;var e=t.getElementsByTagName("input"),n=e.length;for(;n--;){var o=e[n];o.checked&&St.push(o)}}(o),!z&&!(/mousedown|pointerdown/.test(r)&&0!==e.button||t.disabled)&&!s.isContentEditable&&(this.nativeDraggable||!u||!l||"SELECT"!==l.tagName.toUpperCase())&&!((l=P(l,t.draggable,o,!1))&&l.animated||Z===l)){if(J=F(l),et=F(l,t.draggable),"function"==typeof c){if(c.call(this,e,l,this))return W({sortable:n,rootEl:s,name:"filter",targetEl:l,toEl:o,fromEl:o}),K("filter",n,{evt:e}),void(i&&e.cancelable&&e.preventDefault())}else if(c&&(c=c.split(",").some(function(t){if(t=P(s,t.trim(),o,!1))return W({sortable:n,rootEl:t,name:"filter",targetEl:l,fromEl:o,toEl:o}),K("filter",n,{evt:e}),!0})))return void(i&&e.cancelable&&e.preventDefault());t.handle&&!P(s,t.handle,o,!1)||this._prepareDragStart(e,a,l)}}},_prepareDragStart:function(t,e,n){var o,i=this,r=i.el,a=i.options,l=r.ownerDocument;if(n&&!z&&n.parentNode===r){var s=X(n);if(q=r,G=(z=n).parentNode,V=z.nextSibling,Z=n,ot=a.group,rt={target:Rt.dragged=z,clientX:(e||t).clientX,clientY:(e||t).clientY},ct=rt.clientX-s.left,ut=rt.clientY-s.top,this._lastX=(e||t).clientX,this._lastY=(e||t).clientY,z.style["will-change"]="all",o=function(){K("delayEnded",i,{evt:t}),Rt.eventCanceled?i._onDrop():(i._disableDelayedDragEvents(),!c&&i.nativeDraggable&&(z.draggable=!0),i._triggerDragStart(t,e),W({sortable:i,name:"choose",originalEvent:t}),k(z,a.chosenClass,!0))},a.ignore.split(",").forEach(function(t){g(z,t.trim(),Yt)}),d(l,"dragover",Pt),d(l,"mousemove",Pt),d(l,"touchmove",Pt),d(l,"mouseup",i._onDrop),d(l,"touchend",i._onDrop),d(l,"touchcancel",i._onDrop),c&&this.nativeDraggable&&(this.options.touchStartThreshold=4,z.draggable=!0),K("delayStart",this,{evt:t}),!a.delay||a.delayOnTouchOnly&&!e||this.nativeDraggable&&(E||w))o();else{if(Rt.eventCanceled)return void this._onDrop();d(l,"mouseup",i._disableDelayedDrag),d(l,"touchend",i._disableDelayedDrag),d(l,"touchcancel",i._disableDelayedDrag),d(l,"mousemove",i._delayedDragTouchMoveHandler),d(l,"touchmove",i._delayedDragTouchMoveHandler),a.supportPointer&&d(l,"pointermove",i._delayedDragTouchMoveHandler),i._dragStartTimer=setTimeout(o,a.delay)}}},_delayedDragTouchMoveHandler:function(t){var e=t.touches?t.touches[0]:t;Math.max(Math.abs(e.clientX-this._lastX),Math.abs(e.clientY-this._lastY))>=Math.floor(this.options.touchStartThreshold/(this.nativeDraggable&&window.devicePixelRatio||1))&&this._disableDelayedDrag()},_disableDelayedDrag:function(){z&&Yt(z),clearTimeout(this._dragStartTimer),this._disableDelayedDragEvents()},_disableDelayedDragEvents:function(){var t=this.el.ownerDocument;s(t,"mouseup",this._disableDelayedDrag),s(t,"touchend",this._disableDelayedDrag),s(t,"touchcancel",this._disableDelayedDrag),s(t,"mousemove",this._delayedDragTouchMoveHandler),s(t,"touchmove",this._delayedDragTouchMoveHandler),s(t,"pointermove",this._delayedDragTouchMoveHandler)},_triggerDragStart:function(t,e){e=e||"touch"==t.pointerType&&t,!this.nativeDraggable||e?this.options.supportPointer?d(document,"pointermove",this._onTouchMove):d(document,e?"touchmove":"mousemove",this._onTouchMove):(d(z,"dragend",this),d(q,"dragstart",this._onDragStart));try{document.selection?Ht(function(){document.selection.empty()}):window.getSelection().removeAllRanges()}catch(t){}},_dragStarted:function(t,e){if(vt=!1,q&&z){K("dragStarted",this,{evt:e}),this.nativeDraggable&&d(document,"dragover",kt);var n=this.options;t||k(z,n.dragClass,!1),k(z,n.ghostClass,!0),Rt.active=this,t&&this._appendGhost(),W({sortable:this,name:"start",originalEvent:e})}else this._nulling()},_emulateDragOver:function(){if(at){this._lastX=at.clientX,this._lastY=at.clientY,At();for(var t=document.elementFromPoint(at.clientX,at.clientY),e=t;t&&t.shadowRoot&&(t=t.shadowRoot.elementFromPoint(at.clientX,at.clientY))!==e;)e=t;if(z.parentNode[j]._isOutsideThisEl(t),e)do{if(e[j]){if(e[j]._onDragOver({clientX:at.clientX,clientY:at.clientY,target:t,rootEl:e})&&!this.options.dragoverBubble)break}t=e}while(e=e.parentNode);It()}},_onTouchMove:function(t){if(rt){var e=this.options,n=e.fallbackTolerance,o=e.fallbackOffset,i=t.touches?t.touches[0]:t,r=U&&v(U,!0),a=U&&r&&r.a,l=U&&r&&r.d,s=Ct&&gt&&b(gt),c=(i.clientX-rt.clientX+o.x)/(a||1)+(s?s[0]-Et[0]:0)/(a||1),u=(i.clientY-rt.clientY+o.y)/(l||1)+(s?s[1]-Et[1]:0)/(l||1);if(!Rt.active&&!vt){if(n&&Math.max(Math.abs(i.clientX-this._lastX),Math.abs(i.clientY-this._lastY))<n)return;this._onDragStart(t,!0)}if(U){r?(r.e+=c-(lt||0),r.f+=u-(st||0)):r={a:1,b:0,c:0,d:1,e:c,f:u};var d="matrix(".concat(r.a,",").concat(r.b,",").concat(r.c,",").concat(r.d,",").concat(r.e,",").concat(r.f,")");R(U,"webkitTransform",d),R(U,"mozTransform",d),R(U,"msTransform",d),R(U,"transform",d),lt=c,st=u,at=i}t.cancelable&&t.preventDefault()}},_appendGhost:function(){if(!U){var t=this.options.fallbackOnBody?document.body:q,e=X(z,!0,Ct,!0,t),n=this.options;if(Ct){for(gt=t;"static"===R(gt,"position")&&"none"===R(gt,"transform")&&gt!==document;)gt=gt.parentNode;gt!==document.body&&gt!==document.documentElement?(gt===document&&(gt=A()),e.top+=gt.scrollTop,e.left+=gt.scrollLeft):gt=A(),Et=b(gt)}k(U=z.cloneNode(!0),n.ghostClass,!1),k(U,n.fallbackClass,!0),k(U,n.dragClass,!0),R(U,"transition",""),R(U,"transform",""),R(U,"box-sizing","border-box"),R(U,"margin",0),R(U,"top",e.top),R(U,"left",e.left),R(U,"width",e.width),R(U,"height",e.height),R(U,"opacity","0.8"),R(U,"position",Ct?"absolute":"fixed"),R(U,"zIndex","100000"),R(U,"pointerEvents","none"),Rt.ghost=U,t.appendChild(U),R(U,"transform-origin",ct/parseInt(U.style.width)*100+"% "+ut/parseInt(U.style.height)*100+"%")}},_onDragStart:function(t,e){var n=this,o=t.dataTransfer,i=n.options;K("dragStart",this,{evt:t}),Rt.eventCanceled?this._onDrop():(K("setupClone",this),Rt.eventCanceled||((Q=S(z)).draggable=!1,Q.style["will-change"]="",this._hideClone(),k(Q,this.options.chosenClass,!1),Rt.clone=Q),n.cloneId=Ht(function(){K("clone",n),Rt.eventCanceled||(n.options.removeCloneOnHide||q.insertBefore(Q,z),n._hideClone(),W({sortable:n,name:"clone"}))}),e||k(z,i.dragClass,!0),e?(mt=!0,n._loopId=setInterval(n._emulateDragOver,50)):(s(document,"mouseup",n._onDrop),s(document,"touchend",n._onDrop),s(document,"touchcancel",n._onDrop),o&&(o.effectAllowed="move",i.setData&&i.setData.call(n,o,z)),d(document,"drop",n),R(z,"transform","translateZ(0)")),vt=!0,n._dragStartId=Ht(n._dragStarted.bind(n,e,t)),d(document,"selectstart",n),dt=!0,u&&R(document.body,"user-select","none"))},_onDragOver:function(n){var o,i,r,a,l=this.el,s=n.target,e=this.options,t=e.group,c=Rt.active,u=ot===t,d=e.sort,h=it||c,f=this,p=!1;if(!Dt){if(void 0!==n.preventDefault&&n.cancelable&&n.preventDefault(),s=P(s,e.draggable,l,!0),M("dragOver"),Rt.eventCanceled)return p;if(z.contains(n.target)||s.animated&&s.animatingX&&s.animatingY||f._ignoreWhileAnimating===s)return N(!1);if(mt=!1,c&&!e.disabled&&(u?d||(r=!q.contains(z)):it===this||(this.lastPutMode=ot.checkPull(this,c,z,n))&&t.checkPut(this,c,z,n))){if(a="vertical"===this._getDirection(n,s),o=X(z),M("dragOverValid"),Rt.eventCanceled)return p;if(r)return G=q,O(),this._hideClone(),M("revert"),Rt.eventCanceled||(V?q.insertBefore(z,V):q.appendChild(z)),N(!0);var g=B(l,e.draggable);if(!g||function(t,e,n){var o=X(B(n.el,n.options.draggable));return e?t.clientX>o.right+10||t.clientX<=o.right&&t.clientY>o.bottom&&t.clientX>=o.left:t.clientX>o.right&&t.clientY>o.top||t.clientX<=o.right&&t.clientY>o.bottom+10}(n,a,this)&&!g.animated){if(g===z)return N(!1);if(g&&l===n.target&&(s=g),s&&(i=X(s)),!1!==Xt(q,l,z,o,s,i,n,!!s))return O(),l.appendChild(z),G=l,A(),N(!0)}else if(s.parentNode===l){i=X(s);var v,m,b,y=z.parentNode!==l,w=!function(t,e,n){var o=n?t.left:t.top,i=n?t.right:t.bottom,r=n?t.width:t.height,a=n?e.left:e.top,l=n?e.right:e.bottom,s=n?e.width:e.height;return o===a||i===l||o+r/2===a+s/2}(z.animated&&z.toRect||o,s.animated&&s.toRect||i,a),E=a?"top":"left",D=Y(s,"top","top")||Y(z,"top","top"),S=D?D.scrollTop:void 0;if(ht!==s&&(m=i[E],yt=!1,wt=!w&&e.invertSwap||y),0!==(v=function(t,e,n,o,i,r,a,l){var s=o?t.clientY:t.clientX,c=o?n.height:n.width,u=o?n.top:n.left,d=o?n.bottom:n.right,h=!1;if(!a)if(l&&pt<c*i){if(!yt&&(1===ft?u+c*r/2<s:s<d-c*r/2)&&(yt=!0),yt)h=!0;else if(1===ft?s<u+pt:d-pt<s)return-ft}else if(u+c*(1-i)/2<s&&s<d-c*(1-i)/2)return function(t){return F(z)<F(t)?1:-1}(e);if((h=h||a)&&(s<u+c*r/2||d-c*r/2<s))return u+c/2<s?1:-1;return 0}(n,s,i,a,w?1:e.swapThreshold,null==e.invertedSwapThreshold?e.swapThreshold:e.invertedSwapThreshold,wt,ht===s)))for(var _=F(z);_-=v,(b=G.children[_])&&("none"===R(b,"display")||b===U););if(0===v||b===s)return N(!1);ft=v;var C=(ht=s).nextElementSibling,T=!1,x=Xt(q,l,z,o,s,i,n,T=1===v);if(!1!==x)return 1!==x&&-1!==x||(T=1===x),Dt=!0,setTimeout(Bt,30),O(),T&&!C?l.appendChild(z):s.parentNode.insertBefore(z,T?C:s),D&&L(D,0,S-D.scrollTop),G=z.parentNode,void 0===m||wt||(pt=Math.abs(m-X(s)[E])),A(),N(!0)}if(l.contains(z))return N(!1)}return!1}function M(t,e){K(t,f,I({evt:n,isOwner:u,axis:a?"vertical":"horizontal",revert:r,dragRect:o,targetRect:i,canSort:d,fromSortable:h,target:s,completed:N,onMove:function(t,e){return Xt(q,l,z,o,t,X(t),n,e)},changed:A},e))}function O(){M("dragOverAnimationCapture"),f.captureAnimationState(),f!==h&&h.captureAnimationState()}function N(t){return M("dragOverCompleted",{insertion:t}),t&&(u?c._hideClone():c._showClone(f),f!==h&&(k(z,it?it.options.ghostClass:c.options.ghostClass,!1),k(z,e.ghostClass,!0)),it!==f&&f!==Rt.active?it=f:f===Rt.active&&it&&(it=null),h===f&&(f._ignoreWhileAnimating=s),f.animateAll(function(){M("dragOverAnimationComplete"),f._ignoreWhileAnimating=null}),f!==h&&(h.animateAll(),h._ignoreWhileAnimating=null)),(s===z&&!z.animated||s===l&&!s.animated)&&(ht=null),e.dragoverBubble||n.rootEl||s===document||(z.parentNode[j]._isOutsideThisEl(n.target),t||Pt(n)),!e.dragoverBubble&&n.stopPropagation&&n.stopPropagation(),p=!0}function A(){tt=F(z),nt=F(z,e.draggable),W({sortable:f,name:"change",toEl:l,newIndex:tt,newDraggableIndex:nt,originalEvent:n})}},_ignoreWhileAnimating:null,_offMoveEvents:function(){s(document,"mousemove",this._onTouchMove),s(document,"touchmove",this._onTouchMove),s(document,"pointermove",this._onTouchMove),s(document,"dragover",Pt),s(document,"mousemove",Pt),s(document,"touchmove",Pt)},_offUpEvents:function(){var t=this.el.ownerDocument;s(t,"mouseup",this._onDrop),s(t,"touchend",this._onDrop),s(t,"pointerup",this._onDrop),s(t,"touchcancel",this._onDrop),s(document,"selectstart",this)},_onDrop:function(t){var e=this.el,n=this.options;tt=F(z),nt=F(z,n.draggable),K("drop",this,{evt:t}),G=z&&z.parentNode,tt=F(z),nt=F(z,n.draggable),Rt.eventCanceled||(yt=wt=vt=!1,clearInterval(this._loopId),clearTimeout(this._dragStartTimer),Lt(this.cloneId),Lt(this._dragStartId),this.nativeDraggable&&(s(document,"drop",this),s(e,"dragstart",this._onDragStart)),this._offMoveEvents(),this._offUpEvents(),u&&R(document.body,"user-select",""),R(z,"transform",""),t&&(dt&&(t.cancelable&&t.preventDefault(),n.dropBubble||t.stopPropagation()),U&&U.parentNode&&U.parentNode.removeChild(U),(q===G||it&&"clone"!==it.lastPutMode)&&Q&&Q.parentNode&&Q.parentNode.removeChild(Q),z&&(this.nativeDraggable&&s(z,"dragend",this),Yt(z),z.style["will-change"]="",dt&&!vt&&k(z,it?it.options.ghostClass:this.options.ghostClass,!1),k(z,this.options.chosenClass,!1),W({sortable:this,name:"unchoose",toEl:G,newIndex:null,newDraggableIndex:null,originalEvent:t}),q!==G?(0<=tt&&(W({rootEl:G,name:"add",toEl:G,fromEl:q,originalEvent:t}),W({sortable:this,name:"remove",toEl:G,originalEvent:t}),W({rootEl:G,name:"sort",toEl:G,fromEl:q,originalEvent:t}),W({sortable:this,name:"sort",toEl:G,originalEvent:t})),it&&it.save()):tt!==J&&0<=tt&&(W({sortable:this,name:"update",toEl:G,originalEvent:t}),W({sortable:this,name:"sort",toEl:G,originalEvent:t})),Rt.active&&(null!=tt&&-1!==tt||(tt=J,nt=et),W({sortable:this,name:"end",toEl:G,originalEvent:t}),this.save())))),this._nulling()},_nulling:function(){K("nulling",this),q=z=G=U=V=Q=Z=$=rt=at=dt=tt=nt=J=et=ht=ft=it=ot=Rt.dragged=Rt.ghost=Rt.clone=Rt.active=null,St.forEach(function(t){t.checked=!0}),St.length=lt=st=0},handleEvent:function(t){switch(t.type){case"drop":case"dragend":this._onDrop(t);break;case"dragenter":case"dragover":z&&(this._onDragOver(t),function(t){t.dataTransfer&&(t.dataTransfer.dropEffect="move");t.cancelable&&t.preventDefault()}(t));break;case"selectstart":t.preventDefault()}},toArray:function(){for(var t,e=[],n=this.el.children,o=0,i=n.length,r=this.options;o<i;o++)P(t=n[o],r.draggable,this.el,!1)&&e.push(t.getAttribute(r.dataIdAttr)||Ft(t));return e},sort:function(t,e){var o={},i=this.el;this.toArray().forEach(function(t,e){var n=i.children[e];P(n,this.options.draggable,i,!1)&&(o[t]=n)},this),e&&this.captureAnimationState(),t.forEach(function(t){o[t]&&(i.removeChild(o[t]),i.appendChild(o[t]))}),e&&this.animateAll()},save:function(){var t=this.options.store;t&&t.set&&t.set(this)},closest:function(t,e){return P(t,e||this.options.draggable,this.el,!1)},option:function(t,e){var n=this.options;if(void 0===e)return n[t];var o=O.modifyOption(this,t,e);n[t]=void 0!==o?o:e,"group"===t&&Nt(n)},destroy:function(){K("destroy",this);var t=this.el;t[j]=null,s(t,"mousedown",this._onTapStart),s(t,"touchstart",this._onTapStart),s(t,"pointerdown",this._onTapStart),this.nativeDraggable&&(s(t,"dragover",this),s(t,"dragenter",this)),Array.prototype.forEach.call(t.querySelectorAll("[draggable]"),function(t){t.removeAttribute("draggable")}),this._onDrop(),this._disableDelayedDragEvents(),bt.splice(bt.indexOf(this.el),1),this.el=t=null},_hideClone:function(){if(!$){if(K("hideClone",this),Rt.eventCanceled)return;R(Q,"display","none"),this.options.removeCloneOnHide&&Q.parentNode&&Q.parentNode.removeChild(Q),$=!0}},_showClone:function(t){if("clone"===t.lastPutMode){if($){if(K("showClone",this),Rt.eventCanceled)return;z.parentNode!=q||this.options.group.revertClone?V?q.insertBefore(Q,V):q.appendChild(Q):q.insertBefore(Q,z),this.options.group.revertClone&&this.animate(z,Q),R(Q,"display",""),$=!1}}else this._hideClone()}},_t&&d(document,"touchmove",function(t){(Rt.active||vt)&&t.cancelable&&t.preventDefault()}),Rt.utils={on:d,off:s,css:R,find:g,is:function(t,e){return!!P(t,e,t,!1)},extend:function(t,e){if(t&&e)for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t},throttle:D,closest:P,toggleClass:k,clone:S,index:F,nextTick:Ht,cancelNextTick:Lt,detectDirection:Ot,getChild:m},Rt.get=function(t){return t[j]},Rt.mount=function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];e[0].constructor===Array&&(e=e[0]),e.forEach(function(t){if(!t.prototype||!t.prototype.constructor)throw"Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(t));t.utils&&(Rt.utils=I({},Rt.utils,t.utils)),O.mount(t)})},Rt.create=function(t,e){return new Rt(t,e)};var jt,Kt,Wt,zt,Gt,Ut,qt=[],Vt=!(Rt.version="1.13.0");function Zt(){qt.forEach(function(t){clearInterval(t.pid)}),qt=[]}function Qt(){clearInterval(Ut)}function $t(t){var e=t.originalEvent,n=t.putSortable,o=t.dragEl,i=t.activeSortable,r=t.dispatchSortableEvent,a=t.hideGhostForTarget,l=t.unhideGhostForTarget;if(e){var s=n||i;a();var c=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:e,u=document.elementFromPoint(c.clientX,c.clientY);l(),s&&!s.el.contains(u)&&(r("spill"),this.onSpill({dragEl:o,putSortable:n}))}}var Jt,te=D(function(n,t,e,o){if(t.scroll){var i,r=(n.touches?n.touches[0]:n).clientX,a=(n.touches?n.touches[0]:n).clientY,l=t.scrollSensitivity,s=t.scrollSpeed,c=A(),u=!1;Kt!==e&&(Kt=e,Zt(),jt=t.scroll,i=t.scrollFn,!0===jt&&(jt=H(e,!0)));var d=0,h=jt;do{var f=h,p=X(f),g=p.top,v=p.bottom,m=p.left,b=p.right,y=p.width,w=p.height,E=void 0,D=void 0,S=f.scrollWidth,_=f.scrollHeight,C=R(f),T=f.scrollLeft,x=f.scrollTop;D=f===c?(E=y<S&&("auto"===C.overflowX||"scroll"===C.overflowX||"visible"===C.overflowX),w<_&&("auto"===C.overflowY||"scroll"===C.overflowY||"visible"===C.overflowY)):(E=y<S&&("auto"===C.overflowX||"scroll"===C.overflowX),w<_&&("auto"===C.overflowY||"scroll"===C.overflowY));var M=E&&(Math.abs(b-r)<=l&&T+y<S)-(Math.abs(m-r)<=l&&!!T),O=D&&(Math.abs(v-a)<=l&&x+w<_)-(Math.abs(g-a)<=l&&!!x);if(!qt[d])for(var N=0;N<=d;N++)qt[N]||(qt[N]={});qt[d].vx==M&&qt[d].vy==O&&qt[d].el===f||(qt[d].el=f,qt[d].vx=M,qt[d].vy=O,clearInterval(qt[d].pid),0==M&&0==O||(u=!0,qt[d].pid=setInterval(function(){o&&0===this.layer&&Rt.active._onTouchMove(Gt);var t=qt[this.layer].vy?qt[this.layer].vy*s:0,e=qt[this.layer].vx?qt[this.layer].vx*s:0;"function"==typeof i&&"continue"!==i.call(Rt.dragged.parentNode[j],e,t,n,Gt,qt[this.layer].el)||L(qt[this.layer].el,e,t)}.bind({layer:d}),24))),d++}while(t.bubbleScroll&&h!==c&&(h=H(h,!1)));Vt=u}},30);function ee(){}function ne(){}ee.prototype={startIndex:null,dragStart:function(t){var e=t.oldDraggableIndex;this.startIndex=e},onSpill:function(t){var e=t.dragEl,n=t.putSortable;this.sortable.captureAnimationState(),n&&n.captureAnimationState();var o=m(this.sortable.el,this.startIndex,this.options);o?this.sortable.el.insertBefore(e,o):this.sortable.el.appendChild(e),this.sortable.animateAll(),n&&n.animateAll()},drop:$t},a(ee,{pluginName:"revertOnSpill"}),ne.prototype={onSpill:function(t){var e=t.dragEl,n=t.putSortable||this.sortable;n.captureAnimationState(),e.parentNode&&e.parentNode.removeChild(e),n.animateAll()},drop:$t},a(ne,{pluginName:"removeOnSpill"});var oe,ie,re,ae,le,se=[],ce=[],ue=!1,de=!1,he=!1;function fe(o,i){ce.forEach(function(t,e){var n=i.children[t.sortableIndex+(o?Number(e):0)];n?i.insertBefore(t,n):i.appendChild(t)})}function pe(){se.forEach(function(t){t!==re&&t.parentNode&&t.parentNode.removeChild(t)})}return Rt.mount(new function(){function t(){for(var t in this.defaults={scroll:!0,scrollSensitivity:30,scrollSpeed:10,bubbleScroll:!0},this)"_"===t.charAt(0)&&"function"==typeof this[t]&&(this[t]=this[t].bind(this))}return t.prototype={dragStarted:function(t){var e=t.originalEvent;this.sortable.nativeDraggable?d(document,"dragover",this._handleAutoScroll):this.options.supportPointer?d(document,"pointermove",this._handleFallbackAutoScroll):e.touches?d(document,"touchmove",this._handleFallbackAutoScroll):d(document,"mousemove",this._handleFallbackAutoScroll)},dragOverCompleted:function(t){var e=t.originalEvent;this.options.dragOverBubble||e.rootEl||this._handleAutoScroll(e)},drop:function(){this.sortable.nativeDraggable?s(document,"dragover",this._handleAutoScroll):(s(document,"pointermove",this._handleFallbackAutoScroll),s(document,"touchmove",this._handleFallbackAutoScroll),s(document,"mousemove",this._handleFallbackAutoScroll)),Qt(),Zt(),clearTimeout(f),f=void 0},nulling:function(){Gt=Kt=jt=Vt=Ut=Wt=zt=null,qt.length=0},_handleFallbackAutoScroll:function(t){this._handleAutoScroll(t,!0)},_handleAutoScroll:function(e,n){var o=this,i=(e.touches?e.touches[0]:e).clientX,r=(e.touches?e.touches[0]:e).clientY,t=document.elementFromPoint(i,r);if(Gt=e,n||E||w||u){te(e,this.options,t,n);var a=H(t,!0);!Vt||Ut&&i===Wt&&r===zt||(Ut&&Qt(),Ut=setInterval(function(){var t=H(document.elementFromPoint(i,r),!0);t!==a&&(a=t,Zt()),te(e,o.options,t,n)},10),Wt=i,zt=r)}else{if(!this.options.bubbleScroll||H(t,!0)===A())return void Zt();te(e,this.options,H(t,!1),!1)}}},a(t,{pluginName:"scroll",initializeByDefault:!0})}),Rt.mount(ne,ee),Rt.mount(new function(){function t(){this.defaults={swapClass:"sortable-swap-highlight"}}return t.prototype={dragStart:function(t){var e=t.dragEl;Jt=e},dragOverValid:function(t){var e=t.completed,n=t.target,o=t.onMove,i=t.activeSortable,r=t.changed,a=t.cancel;if(i.options.swap){var l=this.sortable.el,s=this.options;if(n&&n!==l){var c=Jt;Jt=!1!==o(n)?(k(n,s.swapClass,!0),n):null,c&&c!==Jt&&k(c,s.swapClass,!1)}r(),e(!0),a()}},drop:function(t){var e=t.activeSortable,n=t.putSortable,o=t.dragEl,i=n||this.sortable,r=this.options;Jt&&k(Jt,r.swapClass,!1),Jt&&(r.swap||n&&n.options.swap)&&o!==Jt&&(i.captureAnimationState(),i!==e&&e.captureAnimationState(),function(t,e){var n,o,i=t.parentNode,r=e.parentNode;if(!i||!r||i.isEqualNode(e)||r.isEqualNode(t))return;n=F(t),o=F(e),i.isEqualNode(r)&&n<o&&o++;i.insertBefore(e,i.children[n]),r.insertBefore(t,r.children[o])}(o,Jt),i.animateAll(),i!==e&&e.animateAll())},nulling:function(){Jt=null}},a(t,{pluginName:"swap",eventProperties:function(){return{swapItem:Jt}}})}),Rt.mount(new function(){function t(o){for(var t in this)"_"===t.charAt(0)&&"function"==typeof this[t]&&(this[t]=this[t].bind(this));o.options.supportPointer?d(document,"pointerup",this._deselectMultiDrag):(d(document,"mouseup",this._deselectMultiDrag),d(document,"touchend",this._deselectMultiDrag)),d(document,"keydown",this._checkKeyDown),d(document,"keyup",this._checkKeyUp),this.defaults={selectedClass:"sortable-selected",multiDragKey:null,setData:function(t,e){var n="";se.length&&ie===o?se.forEach(function(t,e){n+=(e?", ":"")+t.textContent}):n=e.textContent,t.setData("Text",n)}}}return t.prototype={multiDragKeyDown:!1,isMultiDrag:!1,delayStartGlobal:function(t){var e=t.dragEl;re=e},delayEnded:function(){this.isMultiDrag=~se.indexOf(re)},setupClone:function(t){var e=t.sortable,n=t.cancel;if(this.isMultiDrag){for(var o=0;o<se.length;o++)ce.push(S(se[o])),ce[o].sortableIndex=se[o].sortableIndex,ce[o].draggable=!1,ce[o].style["will-change"]="",k(ce[o],this.options.selectedClass,!1),se[o]===re&&k(ce[o],this.options.chosenClass,!1);e._hideClone(),n()}},clone:function(t){var e=t.sortable,n=t.rootEl,o=t.dispatchSortableEvent,i=t.cancel;this.isMultiDrag&&(this.options.removeCloneOnHide||se.length&&ie===e&&(fe(!0,n),o("clone"),i()))},showClone:function(t){var e=t.cloneNowShown,n=t.rootEl,o=t.cancel;this.isMultiDrag&&(fe(!1,n),ce.forEach(function(t){R(t,"display","")}),e(),le=!1,o())},hideClone:function(t){var e=this,n=(t.sortable,t.cloneNowHidden),o=t.cancel;this.isMultiDrag&&(ce.forEach(function(t){R(t,"display","none"),e.options.removeCloneOnHide&&t.parentNode&&t.parentNode.removeChild(t)}),n(),le=!0,o())},dragStartGlobal:function(t){t.sortable;!this.isMultiDrag&&ie&&ie.multiDrag._deselectMultiDrag(),se.forEach(function(t){t.sortableIndex=F(t)}),se=se.sort(function(t,e){return t.sortableIndex-e.sortableIndex}),he=!0},dragStarted:function(t){var e=this,n=t.sortable;if(this.isMultiDrag){if(this.options.sort&&(n.captureAnimationState(),this.options.animation)){se.forEach(function(t){t!==re&&R(t,"position","absolute")});var o=X(re,!1,!0,!0);se.forEach(function(t){t!==re&&_(t,o)}),ue=de=!0}n.animateAll(function(){ue=de=!1,e.options.animation&&se.forEach(function(t){C(t)}),e.options.sort&&pe()})}},dragOver:function(t){var e=t.target,n=t.completed,o=t.cancel;de&&~se.indexOf(e)&&(n(!1),o())},revert:function(t){var e=t.fromSortable,n=t.rootEl,o=t.sortable,i=t.dragRect;1<se.length&&(se.forEach(function(t){o.addAnimationState({target:t,rect:de?X(t):i}),C(t),t.fromRect=i,e.removeAnimationState(t)}),de=!1,function(o,i){se.forEach(function(t,e){var n=i.children[t.sortableIndex+(o?Number(e):0)];n?i.insertBefore(t,n):i.appendChild(t)})}(!this.options.removeCloneOnHide,n))},dragOverCompleted:function(t){var e=t.sortable,n=t.isOwner,o=t.insertion,i=t.activeSortable,r=t.parentEl,a=t.putSortable,l=this.options;if(o){if(n&&i._hideClone(),ue=!1,l.animation&&1<se.length&&(de||!n&&!i.options.sort&&!a)){var s=X(re,!1,!0,!0);se.forEach(function(t){t!==re&&(_(t,s),r.appendChild(t))}),de=!0}if(!n)if(de||pe(),1<se.length){var c=le;i._showClone(e),i.options.animation&&!le&&c&&ce.forEach(function(t){i.addAnimationState({target:t,rect:ae}),t.fromRect=ae,t.thisAnimationDuration=null})}else i._showClone(e)}},dragOverAnimationCapture:function(t){var e=t.dragRect,n=t.isOwner,o=t.activeSortable;if(se.forEach(function(t){t.thisAnimationDuration=null}),o.options.animation&&!n&&o.multiDrag.isMultiDrag){ae=a({},e);var i=v(re,!0);ae.top-=i.f,ae.left-=i.e}},dragOverAnimationComplete:function(){de&&(de=!1,pe())},drop:function(t){var e=t.originalEvent,n=t.rootEl,o=t.parentEl,i=t.sortable,r=t.dispatchSortableEvent,a=t.oldIndex,l=t.putSortable,s=l||this.sortable;if(e){var c=this.options,u=o.children;if(!he)if(c.multiDragKey&&!this.multiDragKeyDown&&this._deselectMultiDrag(),k(re,c.selectedClass,!~se.indexOf(re)),~se.indexOf(re))se.splice(se.indexOf(re),1),oe=null,N({sortable:i,rootEl:n,name:"deselect",targetEl:re,originalEvt:e});else{if(se.push(re),N({sortable:i,rootEl:n,name:"select",targetEl:re,originalEvt:e}),e.shiftKey&&oe&&i.el.contains(oe)){var d,h,f=F(oe),p=F(re);if(~f&&~p&&f!==p)for(d=f<p?(h=f,p):(h=p,f+1);h<d;h++)~se.indexOf(u[h])||(k(u[h],c.selectedClass,!0),se.push(u[h]),N({sortable:i,rootEl:n,name:"select",targetEl:u[h],originalEvt:e}))}else oe=re;ie=s}if(he&&this.isMultiDrag){if((o[j].options.sort||o!==n)&&1<se.length){var g=X(re),v=F(re,":not(."+this.options.selectedClass+")");if(!ue&&c.animation&&(re.thisAnimationDuration=null),s.captureAnimationState(),!ue&&(c.animation&&(re.fromRect=g,se.forEach(function(t){if(t.thisAnimationDuration=null,t!==re){var e=de?X(t):g;t.fromRect=e,s.addAnimationState({target:t,rect:e})}})),pe(),se.forEach(function(t){u[v]?o.insertBefore(t,u[v]):o.appendChild(t),v++}),a===F(re))){var m=!1;se.forEach(function(t){t.sortableIndex===F(t)||(m=!0)}),m&&r("update")}se.forEach(function(t){C(t)}),s.animateAll()}ie=s}(n===o||l&&"clone"!==l.lastPutMode)&&ce.forEach(function(t){t.parentNode&&t.parentNode.removeChild(t)})}},nullingGlobal:function(){this.isMultiDrag=he=!1,ce.length=0},destroyGlobal:function(){this._deselectMultiDrag(),s(document,"pointerup",this._deselectMultiDrag),s(document,"mouseup",this._deselectMultiDrag),s(document,"touchend",this._deselectMultiDrag),s(document,"keydown",this._checkKeyDown),s(document,"keyup",this._checkKeyUp)},_deselectMultiDrag:function(t){if(!(void 0!==he&&he||ie!==this.sortable||t&&P(t.target,this.options.draggable,this.sortable.el,!1)||t&&0!==t.button))for(;se.length;){var e=se[0];k(e,this.options.selectedClass,!1),se.shift(),N({sortable:this.sortable,rootEl:this.sortable.el,name:"deselect",targetEl:e,originalEvt:t})}},_checkKeyDown:function(t){t.key===this.options.multiDragKey&&(this.multiDragKeyDown=!0)},_checkKeyUp:function(t){t.key===this.options.multiDragKey&&(this.multiDragKeyDown=!1)}},a(t,{pluginName:"multiDrag",utils:{select:function(t){var e=t.parentNode[j];e&&e.options.multiDrag&&!~se.indexOf(t)&&(ie&&ie!==e&&(ie.multiDrag._deselectMultiDrag(),ie=e),k(t,e.options.selectedClass,!0),se.push(t))},deselect:function(t){var e=t.parentNode[j],n=se.indexOf(t);e&&e.options.multiDrag&&~n&&(k(t,e.options.selectedClass,!1),se.splice(n,1))}},eventProperties:function(){var n=this,o=[],i=[];return se.forEach(function(t){var e;o.push({multiDragElement:t,index:t.sortableIndex}),e=de&&t!==re?-1:de?F(t,":not(."+n.options.selectedClass+")"):F(t),i.push({multiDragElement:t,index:e})}),{items:e(se),clones:[].concat(ce),oldIndicies:o,newIndicies:i}},optionListeners:{multiDragKey:function(t){return"ctrl"===(t=t.toLowerCase())?t="Control":1<t.length&&(t=t.charAt(0).toUpperCase()+t.substr(1)),t}}})}),Rt});;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, Sortable) {
  Drupal.behaviors.MediaLibraryWidgetSortable = {
    attach: function attach(context) {
      var selection = context.querySelectorAll('.js-media-library-selection');
      selection.forEach(function (widget) {
        Sortable.create(widget, {
          draggable: '.js-media-library-item',
          handle: '.js-media-library-item-preview',
          onEnd: function onEnd() {
            $(widget).children().each(function (index, child) {
              $(child).find('.js-media-library-item-weight').val(index);
            });
          }
        });
      });
    }
  };
  Drupal.behaviors.MediaLibraryWidgetToggleWeight = {
    attach: function attach(context) {
      var strings = {
        show: Drupal.t('Show media item weights'),
        hide: Drupal.t('Hide media item weights')
      };
      $('.js-media-library-widget-toggle-weight', context).once('media-library-toggle').on('click', function (e) {
        e.preventDefault();
        $(e.currentTarget).toggleClass('active').text($(e.currentTarget).hasClass('active') ? strings.hide : strings.show).closest('.js-media-library-widget').find('.js-media-library-item-weight').parent().toggle();
      }).text(strings.show);
      $('.js-media-library-item-weight', context).once('media-library-toggle').parent().hide();
    }
  };
  Drupal.behaviors.MediaLibraryWidgetDisableButton = {
    attach: function attach(context) {
      $('.js-media-library-open-button[data-disabled-focus="true"]', context).once('media-library-disable').each(function () {
        var _this = this;

        $(this).focus();
        setTimeout(function () {
          $(_this).attr('disabled', 'disabled');
        }, 50);
      });
    }
  };
})(jQuery, Drupal, Sortable);;
/*!
 * jQuery Form Plugin
 * version: 4.3.0
 * Requires jQuery v1.7.2 or later
 * Project repository: https://github.com/jquery-form/form

 * Copyright 2017 Kevin Morris
 * Copyright 2006 M. Alsup

 * Dual licensed under the LGPL-2.1+ or MIT licenses
 * https://github.com/jquery-form/form#license

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 */
!function(r){"function"==typeof define&&define.amd?define(["jquery"],r):"object"==typeof module&&module.exports?module.exports=function(e,t){return void 0===t&&(t="undefined"!=typeof window?require("jquery"):require("jquery")(e)),r(t),t}:r(jQuery)}(function(q){"use strict";var m=/\r?\n/g,S={};S.fileapi=void 0!==q('<input type="file">').get(0).files,S.formdata=void 0!==window.FormData;var _=!!q.fn.prop;function o(e){var t=e.data;e.isDefaultPrevented()||(e.preventDefault(),q(e.target).closest("form").ajaxSubmit(t))}function i(e){var t=e.target,r=q(t);if(!r.is("[type=submit],[type=image]")){var a=r.closest("[type=submit]");if(0===a.length)return;t=a[0]}var n,o=t.form;"image"===(o.clk=t).type&&(void 0!==e.offsetX?(o.clk_x=e.offsetX,o.clk_y=e.offsetY):"function"==typeof q.fn.offset?(n=r.offset(),o.clk_x=e.pageX-n.left,o.clk_y=e.pageY-n.top):(o.clk_x=e.pageX-t.offsetLeft,o.clk_y=e.pageY-t.offsetTop)),setTimeout(function(){o.clk=o.clk_x=o.clk_y=null},100)}function N(){var e;q.fn.ajaxSubmit.debug&&(e="[jquery.form] "+Array.prototype.join.call(arguments,""),window.console&&window.console.log?window.console.log(e):window.opera&&window.opera.postError&&window.opera.postError(e))}q.fn.attr2=function(){if(!_)return this.attr.apply(this,arguments);var e=this.prop.apply(this,arguments);return e&&e.jquery||"string"==typeof e?e:this.attr.apply(this,arguments)},q.fn.ajaxSubmit=function(M,e,t,r){if(!this.length)return N("ajaxSubmit: skipping submit process - no element selected"),this;var O,a,n,o,X=this;"function"==typeof M?M={success:M}:"string"==typeof M||!1===M&&0<arguments.length?(M={url:M,data:e,dataType:t},"function"==typeof r&&(M.success=r)):void 0===M&&(M={}),O=M.method||M.type||this.attr2("method"),n=(n=(n="string"==typeof(a=M.url||this.attr2("action"))?q.trim(a):"")||window.location.href||"")&&(n.match(/^([^#]+)/)||[])[1],o=/(MSIE|Trident)/.test(navigator.userAgent||"")&&/^https/i.test(window.location.href||"")?"javascript:false":"about:blank",M=q.extend(!0,{url:n,success:q.ajaxSettings.success,type:O||q.ajaxSettings.type,iframeSrc:o},M);var i={};if(this.trigger("form-pre-serialize",[this,M,i]),i.veto)return N("ajaxSubmit: submit vetoed via form-pre-serialize trigger"),this;if(M.beforeSerialize&&!1===M.beforeSerialize(this,M))return N("ajaxSubmit: submit aborted via beforeSerialize callback"),this;var s=M.traditional;void 0===s&&(s=q.ajaxSettings.traditional);var u,c,C=[],l=this.formToArray(M.semantic,C,M.filtering);if(M.data&&(c=q.isFunction(M.data)?M.data(l):M.data,M.extraData=c,u=q.param(c,s)),M.beforeSubmit&&!1===M.beforeSubmit(l,this,M))return N("ajaxSubmit: submit aborted via beforeSubmit callback"),this;if(this.trigger("form-submit-validate",[l,this,M,i]),i.veto)return N("ajaxSubmit: submit vetoed via form-submit-validate trigger"),this;var f=q.param(l,s);u&&(f=f?f+"&"+u:u),"GET"===M.type.toUpperCase()?(M.url+=(0<=M.url.indexOf("?")?"&":"?")+f,M.data=null):M.data=f;var d,m,p,h=[];M.resetForm&&h.push(function(){X.resetForm()}),M.clearForm&&h.push(function(){X.clearForm(M.includeHidden)}),!M.dataType&&M.target?(d=M.success||function(){},h.push(function(e,t,r){var a=arguments,n=M.replaceTarget?"replaceWith":"html";q(M.target)[n](e).each(function(){d.apply(this,a)})})):M.success&&(q.isArray(M.success)?q.merge(h,M.success):h.push(M.success)),M.success=function(e,t,r){for(var a=M.context||this,n=0,o=h.length;n<o;n++)h[n].apply(a,[e,t,r||X,X])},M.error&&(m=M.error,M.error=function(e,t,r){var a=M.context||this;m.apply(a,[e,t,r,X])}),M.complete&&(p=M.complete,M.complete=function(e,t){var r=M.context||this;p.apply(r,[e,t,X])});var v=0<q("input[type=file]:enabled",this).filter(function(){return""!==q(this).val()}).length,g="multipart/form-data",x=X.attr("enctype")===g||X.attr("encoding")===g,y=S.fileapi&&S.formdata;N("fileAPI :"+y);var b,T=(v||x)&&!y;!1!==M.iframe&&(M.iframe||T)?M.closeKeepAlive?q.get(M.closeKeepAlive,function(){b=w(l)}):b=w(l):b=(v||x)&&y?function(e){for(var r=new FormData,t=0;t<e.length;t++)r.append(e[t].name,e[t].value);if(M.extraData){var a=function(e){var t,r,a=q.param(e,M.traditional).split("&"),n=a.length,o=[];for(t=0;t<n;t++)a[t]=a[t].replace(/\+/g," "),r=a[t].split("="),o.push([decodeURIComponent(r[0]),decodeURIComponent(r[1])]);return o}(M.extraData);for(t=0;t<a.length;t++)a[t]&&r.append(a[t][0],a[t][1])}M.data=null;var n=q.extend(!0,{},q.ajaxSettings,M,{contentType:!1,processData:!1,cache:!1,type:O||"POST"});M.uploadProgress&&(n.xhr=function(){var e=q.ajaxSettings.xhr();return e.upload&&e.upload.addEventListener("progress",function(e){var t=0,r=e.loaded||e.position,a=e.total;e.lengthComputable&&(t=Math.ceil(r/a*100)),M.uploadProgress(e,r,a,t)},!1),e});n.data=null;var o=n.beforeSend;return n.beforeSend=function(e,t){M.formData?t.data=M.formData:t.data=r,o&&o.call(this,e,t)},q.ajax(n)}(l):q.ajax(M),X.removeData("jqxhr").data("jqxhr",b);for(var j=0;j<C.length;j++)C[j]=null;return this.trigger("form-submit-notify",[this,M]),this;function w(e){var t,r,l,f,o,d,m,p,a,n,h,v,i=X[0],g=q.Deferred();if(g.abort=function(e){p.abort(e)},e)for(r=0;r<C.length;r++)t=q(C[r]),_?t.prop("disabled",!1):t.removeAttr("disabled");(l=q.extend(!0,{},q.ajaxSettings,M)).context=l.context||l,o="jqFormIO"+(new Date).getTime();var s=i.ownerDocument,u=X.closest("body");if(l.iframeTarget?(n=(d=q(l.iframeTarget,s)).attr2("name"))?o=n:d.attr2("name",o):(d=q('<iframe name="'+o+'" src="'+l.iframeSrc+'" />',s)).css({position:"absolute",top:"-1000px",left:"-1000px"}),m=d[0],p={aborted:0,responseText:null,responseXML:null,status:0,statusText:"n/a",getAllResponseHeaders:function(){},getResponseHeader:function(){},setRequestHeader:function(){},abort:function(e){var t="timeout"===e?"timeout":"aborted";N("aborting upload... "+t),this.aborted=1;try{m.contentWindow.document.execCommand&&m.contentWindow.document.execCommand("Stop")}catch(e){}d.attr("src",l.iframeSrc),p.error=t,l.error&&l.error.call(l.context,p,t,e),f&&q.event.trigger("ajaxError",[p,l,t]),l.complete&&l.complete.call(l.context,p,t)}},(f=l.global)&&0==q.active++&&q.event.trigger("ajaxStart"),f&&q.event.trigger("ajaxSend",[p,l]),l.beforeSend&&!1===l.beforeSend.call(l.context,p,l))return l.global&&q.active--,g.reject(),g;if(p.aborted)return g.reject(),g;(a=i.clk)&&(n=a.name)&&!a.disabled&&(l.extraData=l.extraData||{},l.extraData[n]=a.value,"image"===a.type&&(l.extraData[n+".x"]=i.clk_x,l.extraData[n+".y"]=i.clk_y));var x=1,y=2;function b(t){var r=null;try{t.contentWindow&&(r=t.contentWindow.document)}catch(e){N("cannot get iframe.contentWindow document: "+e)}if(r)return r;try{r=t.contentDocument?t.contentDocument:t.document}catch(e){N("cannot get iframe.contentDocument: "+e),r=t.document}return r}var c=q("meta[name=csrf-token]").attr("content"),T=q("meta[name=csrf-param]").attr("content");function j(){var e=X.attr2("target"),t=X.attr2("action"),r=X.attr("enctype")||X.attr("encoding")||"multipart/form-data";i.setAttribute("target",o),O&&!/post/i.test(O)||i.setAttribute("method","POST"),t!==l.url&&i.setAttribute("action",l.url),l.skipEncodingOverride||O&&!/post/i.test(O)||X.attr({encoding:"multipart/form-data",enctype:"multipart/form-data"}),l.timeout&&(v=setTimeout(function(){h=!0,A(x)},l.timeout));var a=[];try{if(l.extraData)for(var n in l.extraData)l.extraData.hasOwnProperty(n)&&(q.isPlainObject(l.extraData[n])&&l.extraData[n].hasOwnProperty("name")&&l.extraData[n].hasOwnProperty("value")?a.push(q('<input type="hidden" name="'+l.extraData[n].name+'">',s).val(l.extraData[n].value).appendTo(i)[0]):a.push(q('<input type="hidden" name="'+n+'">',s).val(l.extraData[n]).appendTo(i)[0]));l.iframeTarget||d.appendTo(u),m.attachEvent?m.attachEvent("onload",A):m.addEventListener("load",A,!1),setTimeout(function e(){try{var t=b(m).readyState;N("state = "+t),t&&"uninitialized"===t.toLowerCase()&&setTimeout(e,50)}catch(e){N("Server abort: ",e," (",e.name,")"),A(y),v&&clearTimeout(v),v=void 0}},15);try{i.submit()}catch(e){document.createElement("form").submit.apply(i)}}finally{i.setAttribute("action",t),i.setAttribute("enctype",r),e?i.setAttribute("target",e):X.removeAttr("target"),q(a).remove()}}T&&c&&(l.extraData=l.extraData||{},l.extraData[T]=c),l.forceSync?j():setTimeout(j,10);var w,S,k,D=50;function A(e){if(!p.aborted&&!k){if((S=b(m))||(N("cannot access response document"),e=y),e===x&&p)return p.abort("timeout"),void g.reject(p,"timeout");if(e===y&&p)return p.abort("server abort"),void g.reject(p,"error","server abort");if(S&&S.location.href!==l.iframeSrc||h){m.detachEvent?m.detachEvent("onload",A):m.removeEventListener("load",A,!1);var t,r="success";try{if(h)throw"timeout";var a="xml"===l.dataType||S.XMLDocument||q.isXMLDoc(S);if(N("isXml="+a),!a&&window.opera&&(null===S.body||!S.body.innerHTML)&&--D)return N("requeing onLoad callback, DOM not available"),void setTimeout(A,250);var n=S.body?S.body:S.documentElement;p.responseText=n?n.innerHTML:null,p.responseXML=S.XMLDocument?S.XMLDocument:S,a&&(l.dataType="xml"),p.getResponseHeader=function(e){return{"content-type":l.dataType}[e.toLowerCase()]},n&&(p.status=Number(n.getAttribute("status"))||p.status,p.statusText=n.getAttribute("statusText")||p.statusText);var o,i,s,u=(l.dataType||"").toLowerCase(),c=/(json|script|text)/.test(u);c||l.textarea?(o=S.getElementsByTagName("textarea")[0])?(p.responseText=o.value,p.status=Number(o.getAttribute("status"))||p.status,p.statusText=o.getAttribute("statusText")||p.statusText):c&&(i=S.getElementsByTagName("pre")[0],s=S.getElementsByTagName("body")[0],i?p.responseText=i.textContent?i.textContent:i.innerText:s&&(p.responseText=s.textContent?s.textContent:s.innerText)):"xml"===u&&!p.responseXML&&p.responseText&&(p.responseXML=F(p.responseText));try{w=E(p,u,l)}catch(e){r="parsererror",p.error=t=e||r}}catch(e){N("error caught: ",e),r="error",p.error=t=e||r}p.aborted&&(N("upload aborted"),r=null),p.status&&(r=200<=p.status&&p.status<300||304===p.status?"success":"error"),"success"===r?(l.success&&l.success.call(l.context,w,"success",p),g.resolve(p.responseText,"success",p),f&&q.event.trigger("ajaxSuccess",[p,l])):r&&(void 0===t&&(t=p.statusText),l.error&&l.error.call(l.context,p,r,t),g.reject(p,"error",t),f&&q.event.trigger("ajaxError",[p,l,t])),f&&q.event.trigger("ajaxComplete",[p,l]),f&&!--q.active&&q.event.trigger("ajaxStop"),l.complete&&l.complete.call(l.context,p,r),k=!0,l.timeout&&clearTimeout(v),setTimeout(function(){l.iframeTarget?d.attr("src",l.iframeSrc):d.remove(),p.responseXML=null},100)}}}var F=q.parseXML||function(e,t){return window.ActiveXObject?((t=new ActiveXObject("Microsoft.XMLDOM")).async="false",t.loadXML(e)):t=(new DOMParser).parseFromString(e,"text/xml"),t&&t.documentElement&&"parsererror"!==t.documentElement.nodeName?t:null},L=q.parseJSON||function(e){return window.eval("("+e+")")},E=function(e,t,r){var a=e.getResponseHeader("content-type")||"",n=("xml"===t||!t)&&0<=a.indexOf("xml"),o=n?e.responseXML:e.responseText;return n&&"parsererror"===o.documentElement.nodeName&&q.error&&q.error("parsererror"),r&&r.dataFilter&&(o=r.dataFilter(o,t)),"string"==typeof o&&(("json"===t||!t)&&0<=a.indexOf("json")?o=L(o):("script"===t||!t)&&0<=a.indexOf("javascript")&&q.globalEval(o)),o};return g}},q.fn.ajaxForm=function(e,t,r,a){if(("string"==typeof e||!1===e&&0<arguments.length)&&(e={url:e,data:t,dataType:r},"function"==typeof a&&(e.success=a)),(e=e||{}).delegation=e.delegation&&q.isFunction(q.fn.on),e.delegation||0!==this.length)return e.delegation?(q(document).off("submit.form-plugin",this.selector,o).off("click.form-plugin",this.selector,i).on("submit.form-plugin",this.selector,e,o).on("click.form-plugin",this.selector,e,i),this):(e.beforeFormUnbind&&e.beforeFormUnbind(this,e),this.ajaxFormUnbind().on("submit.form-plugin",e,o).on("click.form-plugin",e,i));var n={s:this.selector,c:this.context};return!q.isReady&&n.s?(N("DOM not ready, queuing ajaxForm"),q(function(){q(n.s,n.c).ajaxForm(e)})):N("terminating; zero elements found by selector"+(q.isReady?"":" (DOM not ready)")),this},q.fn.ajaxFormUnbind=function(){return this.off("submit.form-plugin click.form-plugin")},q.fn.formToArray=function(e,t,r){var a=[];if(0===this.length)return a;var n,o,i,s,u,c,l,f,d,m,p=this[0],h=this.attr("id"),v=(v=e||void 0===p.elements?p.getElementsByTagName("*"):p.elements)&&q.makeArray(v);if(h&&(e||/(Edge|Trident)\//.test(navigator.userAgent))&&(n=q(':input[form="'+h+'"]').get()).length&&(v=(v||[]).concat(n)),!v||!v.length)return a;for(q.isFunction(r)&&(v=q.map(v,r)),o=0,c=v.length;o<c;o++)if((m=(u=v[o]).name)&&!u.disabled)if(e&&p.clk&&"image"===u.type)p.clk===u&&(a.push({name:m,value:q(u).val(),type:u.type}),a.push({name:m+".x",value:p.clk_x},{name:m+".y",value:p.clk_y}));else if((s=q.fieldValue(u,!0))&&s.constructor===Array)for(t&&t.push(u),i=0,l=s.length;i<l;i++)a.push({name:m,value:s[i]});else if(S.fileapi&&"file"===u.type){t&&t.push(u);var g=u.files;if(g.length)for(i=0;i<g.length;i++)a.push({name:m,value:g[i],type:u.type});else a.push({name:m,value:"",type:u.type})}else null!=s&&(t&&t.push(u),a.push({name:m,value:s,type:u.type,required:u.required}));return e||!p.clk||(m=(d=(f=q(p.clk))[0]).name)&&!d.disabled&&"image"===d.type&&(a.push({name:m,value:f.val()}),a.push({name:m+".x",value:p.clk_x},{name:m+".y",value:p.clk_y})),a},q.fn.formSerialize=function(e){return q.param(this.formToArray(e))},q.fn.fieldSerialize=function(n){var o=[];return this.each(function(){var e=this.name;if(e){var t=q.fieldValue(this,n);if(t&&t.constructor===Array)for(var r=0,a=t.length;r<a;r++)o.push({name:e,value:t[r]});else null!=t&&o.push({name:this.name,value:t})}}),q.param(o)},q.fn.fieldValue=function(e){for(var t=[],r=0,a=this.length;r<a;r++){var n=this[r],o=q.fieldValue(n,e);null==o||o.constructor===Array&&!o.length||(o.constructor===Array?q.merge(t,o):t.push(o))}return t},q.fieldValue=function(e,t){var r=e.name,a=e.type,n=e.tagName.toLowerCase();if(void 0===t&&(t=!0),t&&(!r||e.disabled||"reset"===a||"button"===a||("checkbox"===a||"radio"===a)&&!e.checked||("submit"===a||"image"===a)&&e.form&&e.form.clk!==e||"select"===n&&-1===e.selectedIndex))return null;if("select"!==n)return q(e).val().replace(m,"\r\n");var o=e.selectedIndex;if(o<0)return null;for(var i=[],s=e.options,u="select-one"===a,c=u?o+1:s.length,l=u?o:0;l<c;l++){var f=s[l];if(f.selected&&!f.disabled){var d=(d=f.value)||(f.attributes&&f.attributes.value&&!f.attributes.value.specified?f.text:f.value);if(u)return d;i.push(d)}}return i},q.fn.clearForm=function(e){return this.each(function(){q("input,select,textarea",this).clearFields(e)})},q.fn.clearFields=q.fn.clearInputs=function(r){var a=/^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i;return this.each(function(){var e=this.type,t=this.tagName.toLowerCase();a.test(e)||"textarea"===t?this.value="":"checkbox"===e||"radio"===e?this.checked=!1:"select"===t?this.selectedIndex=-1:"file"===e?/MSIE/.test(navigator.userAgent)?q(this).replaceWith(q(this).clone(!0)):q(this).val(""):r&&(!0===r&&/hidden/.test(e)||"string"==typeof r&&q(this).is(r))&&(this.value="")})},q.fn.resetForm=function(){return this.each(function(){var t=q(this),e=this.tagName.toLowerCase();switch(e){case"input":this.checked=this.defaultChecked;case"textarea":return this.value=this.defaultValue,!0;case"option":case"optgroup":var r=t.parents("select");return r.length&&r[0].multiple?"option"===e?this.selected=this.defaultSelected:t.find("option").resetForm():r.resetForm(),!0;case"select":return t.find("option").each(function(e){if(this.selected=this.defaultSelected,this.defaultSelected&&!t[0].multiple)return t[0].selectedIndex=e,!1}),!0;case"label":var a=q(t.attr("for")),n=t.find("input,select,textarea");return a[0]&&n.unshift(a[0]),n.resetForm(),!0;case"form":return"function"!=typeof this.reset&&("object"!=typeof this.reset||this.reset.nodeType)||this.reset(),!0;default:return t.find("form,input,label,select,textarea").resetForm(),!0}})},q.fn.enable=function(e){return void 0===e&&(e=!0),this.each(function(){this.disabled=!e})},q.fn.selected=function(r){return void 0===r&&(r=!0),this.each(function(){var e,t=this.type;"checkbox"===t||"radio"===t?this.checked=r:"option"===this.tagName.toLowerCase()&&(e=q(this).parent("select"),r&&e[0]&&"select-one"===e[0].type&&e.find("option").selected(!1),this.selected=r)})},q.fn.ajaxSubmit.debug=!1});

;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, window) {
  function TableResponsive(table) {
    this.table = table;
    this.$table = $(table);
    this.showText = Drupal.t('Show all columns');
    this.hideText = Drupal.t('Hide lower priority columns');
    this.$headers = this.$table.find('th');
    this.$link = $('<button type="button" class="link tableresponsive-toggle"></button>').attr('title', Drupal.t('Show table cells that were hidden to make the table fit within a small screen.')).on('click', $.proxy(this, 'eventhandlerToggleColumns'));
    this.$table.before($('<div class="tableresponsive-toggle-columns"></div>').append(this.$link));
    $(window).on('resize.tableresponsive', $.proxy(this, 'eventhandlerEvaluateColumnVisibility')).trigger('resize.tableresponsive');
  }

  Drupal.behaviors.tableResponsive = {
    attach: function attach(context, settings) {
      var $tables = $(context).find('table.responsive-enabled').once('tableresponsive');

      if ($tables.length) {
        var il = $tables.length;

        for (var i = 0; i < il; i++) {
          TableResponsive.tables.push(new TableResponsive($tables[i]));
        }
      }
    }
  };
  $.extend(TableResponsive, {
    tables: []
  });
  $.extend(TableResponsive.prototype, {
    eventhandlerEvaluateColumnVisibility: function eventhandlerEvaluateColumnVisibility(e) {
      var pegged = parseInt(this.$link.data('pegged'), 10);
      var hiddenLength = this.$headers.filter('.priority-medium:hidden, .priority-low:hidden').length;

      if (hiddenLength > 0) {
        this.$link.show().text(this.showText);
      }

      if (!pegged && hiddenLength === 0) {
        this.$link.hide().text(this.hideText);
      }
    },
    eventhandlerToggleColumns: function eventhandlerToggleColumns(e) {
      e.preventDefault();
      var self = this;
      var $hiddenHeaders = this.$headers.filter('.priority-medium:hidden, .priority-low:hidden');
      this.$revealedCells = this.$revealedCells || $();

      if ($hiddenHeaders.length > 0) {
        $hiddenHeaders.each(function (index, element) {
          var $header = $(this);
          var position = $header.prevAll('th').length;
          self.$table.find('tbody tr').each(function () {
            var $cells = $(this).find('td').eq(position);
            $cells.show();
            self.$revealedCells = $().add(self.$revealedCells).add($cells);
          });
          $header.show();
          self.$revealedCells = $().add(self.$revealedCells).add($header);
        });
        this.$link.text(this.hideText).data('pegged', 1);
      } else {
          this.$revealedCells.hide();
          this.$revealedCells.each(function (index, element) {
            var $cell = $(this);
            var properties = $cell.attr('style').split(';');
            var newProps = [];
            var match = /^display\s*:\s*none$/;

            for (var i = 0; i < properties.length; i++) {
              var prop = properties[i];
              prop.trim();
              var isDisplayNone = match.exec(prop);

              if (isDisplayNone) {
                continue;
              }

              newProps.push(prop);
            }

            $cell.attr('style', newProps.join(';'));
          });
          this.$link.text(this.showText).data('pegged', 0);
          $(window).trigger('resize.tableresponsive');
        }
    }
  });
  Drupal.TableResponsive = TableResponsive;
})(jQuery, Drupal, window);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  Drupal.behaviors.claroTableDrag = {
    attach: function attach(context, settings) {
      var createItemWrapBoundaries = function createItemWrapBoundaries(index, row) {
        var $row = $(row);
        var $firstCell = $row.find('td:first-of-type').eq(0).wrapInner(Drupal.theme('tableDragCellContentWrapper')).wrapInner($(Drupal.theme('tableDragCellItemsWrapper')).addClass('js-tabledrag-cell-content'));
        var $targetElem = $firstCell.find('.js-tabledrag-cell-content');
        $targetElem.eq(0).find('> .tabledrag-cell-content__item > .js-tabledrag-handle, > .tabledrag-cell-content__item > .js-indentation').prependTo($targetElem);
      };

      Object.keys(settings.tableDrag || {}).forEach(function (base) {
        $(context).find("#".concat(base)).find('> tr.draggable, > tbody > tr.draggable').once('claroTabledrag').each(createItemWrapBoundaries);
      });
    }
  };
  $.extend(Drupal.tableDrag.prototype.row.prototype, {
    markChanged: function markChanged() {
      var marker = $(Drupal.theme('tableDragChangedMarker')).addClass('js-tabledrag-changed-marker');
      var cell = $(this.element).find('td:first-of-type');

      if (cell.find('.js-tabledrag-changed-marker').length === 0) {
        cell.find('.js-tabledrag-handle').after(marker);
      }
    },
    onIndent: function onIndent() {
      $(this.table).find('.tabledrag-cell > .js-indentation').each(function (index, indentToMove) {
        var $indentToMove = $(indentToMove);
        var $cellContent = $indentToMove.siblings('.tabledrag-cell-content');
        $indentToMove.prependTo($cellContent);
      });
    }
  });
  $.extend(Drupal.theme, {
    tableDragIndentation: function tableDragIndentation() {
      return '<div class="js-indentation indentation"><svg xmlns="http://www.w3.org/2000/svg" class="tree" width="25" height="25" viewBox="0 0 25 25"><path class="tree__item tree__item-child-ltr tree__item-child-last-ltr tree__item-horizontal tree__item-horizontal-right" d="M12,12.5 H25" stroke="#888"/><path class="tree__item tree__item-child-rtl tree__item-child-last-rtl tree__item-horizontal tree__horizontal-left" d="M0,12.5 H13" stroke="#888"/><path class="tree__item tree__item-child-ltr tree__item-child-rtl tree__item-child-last-ltr tree__item-child-last-rtl tree__vertical tree__vertical-top" d="M12.5,12 v-99" stroke="#888"/><path class="tree__item tree__item-child-ltr tree__item-child-rtl tree__vertical tree__vertical-bottom" d="M12.5,12 v99" stroke="#888"/></svg></div>';
    },
    tableDragChangedWarning: function tableDragChangedWarning() {
      return "<div class=\"tabledrag-changed-warning messages messages--warning\" role=\"alert\">".concat(Drupal.theme('tableDragChangedMarker'), " ").concat(Drupal.t('You have unsaved changes.'), "</div>");
    },
    tableDragHandle: function tableDragHandle() {
      return "<a href=\"#\" title=\"".concat(Drupal.t('Drag to re-order'), "\" class=\"tabledrag-handle js-tabledrag-handle\"></a>");
    },
    tableDragToggle: function tableDragToggle() {
      return "<div class=\"tabledrag-toggle-weight-wrapper\" data-drupal-selector=\"tabledrag-toggle-weight-wrapper\">\n            <button type=\"button\" class=\"link action-link tabledrag-toggle-weight\" data-drupal-selector=\"tabledrag-toggle-weight\"></button>\n            </div>";
    },
    toggleButtonContent: function toggleButtonContent(show) {
      var classes = ['action-link', 'action-link--extrasmall', 'tabledrag-toggle-weight'];
      var text = '';

      if (show) {
        classes.push('action-link--icon-hide');
        text = Drupal.t('Hide row weights');
      } else {
        classes.push('action-link--icon-show');
        text = Drupal.t('Show row weights');
      }

      return "<span class=\"".concat(classes.join(' '), "\">").concat(text, "</a>");
    },
    tableDragCellContentWrapper: function tableDragCellContentWrapper() {
      return '<div class="tabledrag-cell-content__item"></div>';
    },
    tableDragCellItemsWrapper: function tableDragCellItemsWrapper() {
      return '<div class="tabledrag-cell-content"></div>';
    }
  });
})(jQuery, Drupal);;
