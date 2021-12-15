<?php


namespace Drupal\owlcarousel;


class OwlCarouselGlobal {

  /**
   * Default settings for owl.
   */
  public static function defaultSettings($key = NULL) {
    $settings = [
      'image_style' => '',
      'image_link' => '',
      'items' => 3,
      'itemsDesktop' => '[1199,4]',
      'itemsDesktopSmall' => '[979,3]',
      'itemsTablet' => '[768,2]',
      'itemsMobile' => '[479,1]',
      'singleItem' => FALSE,
      'itemsScaleUp' => FALSE,
      'slideSpeed' => 200,
      'paginationSpeed' => 800,
      'rewindSpeed' => 1000,
      'autoPlay' => FALSE,
      'stopOnHover' => FALSE,
      'navigation' => FALSE,
      'navigationText' => '["prev","next"]',
      'prevText' => t('prev')->render(),
      'nextText' => t('next')->render(),
      'rewindNav' => TRUE,
      'scrollPerPage' => FALSE,
      'pagination' => TRUE,
      'paginationNumbers' => FALSE,
      'responsive' => TRUE,
      'responsiveRefreshRate' => 200,
      'mouseDrag' => TRUE,
      'touchDrag' => TRUE,
      'transitionStyle' => 'fade',
    ];

    return isset($settings[$key]) ? $settings[$key] : $settings;
  }

  /**
   * Return formatted js array of settings.
   */
  public static function formatSettings($settings) {
    $settings['items'] = (int) $settings['items'];
    $settings['itemsDesktop'] = _owlcarousel_string_to_array($settings['itemsDesktop']);
    foreach ($settings['itemsDesktop'] as $k => $v) {
      $settings['itemsDesktop'][$k] = (int) $v;
    }
    $settings['itemsDesktopSmall'] = _owlcarousel_string_to_array($settings['itemsDesktopSmall']);
    foreach ($settings['itemsDesktopSmall'] as $k => $v) {
      $settings['itemsDesktopSmall'][$k] = (int) $v;
    }
    $settings['itemsTablet'] = _owlcarousel_string_to_array($settings['itemsTablet']);
    foreach ($settings['itemsTablet'] as $k => $v) {
      $settings['itemsTablet'][$k] = (int) $v;
    }
    $settings['itemsMobile'] = _owlcarousel_string_to_array($settings['itemsMobile']);
    foreach ($settings['itemsMobile'] as $k => $v) {
      $settings['itemsMobile'][$k] = (int) $v;
    }
    $settings['navigationText'] = [
      $settings['prevText'],
      $settings['nextText'],
    ];

    $settings['mouseDrag'] = (bool) $settings['mouseDrag'];
    $settings['pagination'] = (bool) $settings['pagination'];
    $settings['paginationNumbers'] = (bool) $settings['paginationNumbers'];
    $settings['responsive'] = (bool) $settings['responsive'];
    $settings['paginationSpeed'] = (int) $settings['paginationSpeed'];
    $settings['responsiveRefreshRate'] = (int) $settings['responsiveRefreshRate'];
    $settings['rewindNav'] = (bool) $settings['rewindNav'];
    $settings['rewindSpeed'] = (int) $settings['rewindSpeed'];
    $settings['scrollPerPage'] = (bool) $settings['scrollPerPage'];
    $settings['singleItem'] = (bool) $settings['singleItem'];
    $settings['slideSpeed'] = (int) $settings['slideSpeed'];
    $settings['stopOnHover'] = (bool) $settings['stopOnHover'];
    $settings['touchDrag'] = (bool) $settings['touchDrag'];
    $settings['itemsScaleUp'] = (bool) $settings['itemsScaleUp'];
    $settings['autoPlay'] = (bool) $settings['autoPlay'];
    $settings['navigation'] = (bool) $settings['navigation'];
    if (isset($settings['image_style'])) {
      unset($settings['image_style']);
    }
    if (isset($settings['image_link'])) {
      unset($settings['image_link']);
    }

    return $settings;
  }


}