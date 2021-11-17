<?php

namespace Drupal\responsive_menus\Plugin\ResponsiveMenus;

use Drupal\Core\Form\FormStateInterface;
use Drupal\responsive_menus\ResponsiveMenusPluginBase;
use Drupal\responsive_menus\ResponsiveMenusPluginInterface;

/**
 * Defines the "responsive_menus_simple" plugin.
 *
 * @ResponsiveMenus(
 *   id = "responsive_menus_simple",
 *   label = @Translation("Simple expanding"),
 *   library = "responsive_menus/responsive_menus_simple"
 * )
 */
class ResponsiveMenusSimple extends ResponsiveMenusPluginBase implements ResponsiveMenusPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSelectorInfo() {
    return t('Anything.  Example: Given <code>@code</code> you could use @use', [
      '@ul'   => '<ul>',
      '@code' => '<div id="parent-div"> <ul class="menu"> </ul> </div>',
      '@use'  => '<strong>#parent-div or .menu</strong>',
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'responsive_menus_simple_absolute'      => 1,
      'responsive_menus_disable_mouse_events' => 0,
      'responsive_menus_remove_attributes'    => 1,
      'responsive_menus_css_selectors'        => '#main-menu',
      'responsive_menus_simple_text'          => '☰ Menu',
      'responsive_menus_media_size'           => 768,
      'responsive_menus_media_unit'           => 'px',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form['responsive_menus_simple_absolute'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Use absolute positioning?'),
      '#default_value' => $this->getSetting('responsive_menus_simple_absolute'),
      '#description'   => $this->t('Using absolute, the menu will open over the page rather than pushing it down.'),
    ];

    $form['responsive_menus_disable_mouse_events'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Disable other mouse events?'),
      '#default_value' => $this->getSetting('responsive_menus_disable_mouse_events'),
      '#description'   => $this->t('Disable things like drop-down menus on hover.'),
    ];

    $form['responsive_menus_remove_attributes'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Remove other classes & IDs when responded?'),
      '#default_value' => $this->getSetting('responsive_menus_remove_attributes'),
      '#description'   => $this->t('Helps to ensure styling of menu.'),
    ];

    $form['responsive_menus_css_selectors'] = [
      '#type'          => 'textarea',
      '#title'         => $this->t('Selectors for which menus to responsify'),
      '#default_value' => $this->getSetting('responsive_menus_css_selectors'),
      '#description'   => $this->t('Enter CSS/jQuery selectors of menus to responsify.  Comma separated or 1 per line'),
    ];

    $form['responsive_menus_simple_text'] = [
      '#type'          => 'textarea',
      '#title'         => $this->t('Text or HTML for the menu toggle button'),
      '#default_value' => $this->getSetting('responsive_menus_simple_text'),
    ];

    $form['responsive_menus_media_size'] = [
      '#type'          => 'number',
      '#title'         => $this->t('Screen width to respond to'),
      '#size'          => 5,
      '#default_value' => $this->getSetting('responsive_menus_media_size'),
      '#description'   => $this->t('Width when we swap out responsive menu e.g. 768'),
    ];

    $form['responsive_menus_media_unit'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Width unit'),
      '#default_value' => $this->getSetting('responsive_menus_media_unit'),
      '#options'       => ['px' => 'px', 'em' => 'em'],
      '#description'   => $this->t('Unit for the width above'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getJsSettings() {
    $js_settings = [
      'toggler_text'         => $this->getSetting('responsive_menus_simple_text'),
      'selectors'            => $this->getSettingArray('responsive_menus_css_selectors'),
      'media_size'           => $this->getSetting('responsive_menus_media_size'),
      'media_unit'           => $this->getSetting('responsive_menus_media_unit'),
      'absolute'             => $this->getSetting('responsive_menus_simple_absolute'),
      'disable_mouse_events' => $this->getSetting('responsive_menus_disable_mouse_events'),
      'remove_attributes'    => $this->getSetting('responsive_menus_remove_attributes'),
    ];

    return $js_settings;
  }

  /**
   * Gets this plugin's configuration.
   *
   * @return array
   *   An array of this plugin's configuration.
   */
  public function getConfiguration()
  {
    // TODO: Implement getConfiguration() method.
  }

  /**
   * Sets the configuration for this plugin instance.
   *
   * @param array $configuration
   *   An associative array containing the plugin's configuration.
   */
  public function setConfiguration(array $configuration)
  {
    // TODO: Implement setConfiguration() method.
  }

  /**
   * Gets default configuration for this plugin.
   *
   * @return array
   *   An associative array with the default configuration.
   */
  public function defaultConfiguration()
  {
    // TODO: Implement defaultConfiguration() method.
  }
}
