<?php

namespace Drupal\responsive_menus\Plugin\ResponsiveMenus;

use Drupal\Core\Form\FormStateInterface;
use Drupal\responsive_menus\ResponsiveMenusPluginBase;
use Drupal\responsive_menus\ResponsiveMenusPluginInterface;

/**
 * Defines the "google_nexus" plugin.
 *
 * @ResponsiveMenus(
 *   id = "google_nexus",
 *   label = @Translation("Google Nexus (codrops)"),
 *   library = "responsive_menus/google_nexus"
 * )
 */
class CodropsGoogleNexus extends ResponsiveMenusPluginBase implements ResponsiveMenusPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSelectorInfo() {
    return t('The @ul.  Example: Given <code>@code</code> you would use @use', [
      '@ul'   => '<ul>',
      '@code' => '<div id="parent-div"> <ul class="menu"> </ul> </div>',
      '@use'  => '<strong>.menu</strong>',
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'responsive_menus_google_nexus_css_selectors' => '#main-menu',
      'responsive_menus_google_nexus_use_ecoicons'  => 1,
      'responsive_menus_google_nexus_icons'         => "\ue005\n\ue006",
      'responsive_menus_google_nexus_icon_fallback' => '&#57347;',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form['responsive_menus_google_nexus_css_selectors'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('CSS selectors for which menu to responsify'),
      '#default_value' => $this->getSetting('responsive_menus_google_nexus_css_selectors'),
      '#description'   => t('Enter CSS/jQuery selector of menus to responsify.'),
    ];

    $form['responsive_menus_google_nexus_use_ecoicons'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Use ecofonts font-family'),
      '#options'       => [
        1 => $this->t('Yes'),
        0 => $this->t('No'),
      ],
      '#default_value' => $this->getSetting('responsive_menus_google_nexus_use_ecoicons'),
      '#description'   => $this->t('Uses the ecofonts font-family included with GoogleNexusWebsiteMenu library for icons.'),
    ];

    $form['responsive_menus_google_nexus_icons'] = [
      '#type'          => 'textarea',
      '#title'         => $this->t('Icons for menu items'),
      '#default_value' => $this->getSetting('responsive_menus_google_nexus_icons'),
//      '#description' => t('Enter 1 per-line or comma-separated.  See !documentation for examples.', ['!documentation' => l(t('Unicode Character Table'), 'http://unicode-table.com/en/')]),
    ];

    $form['responsive_menus_google_nexus_icon_fallback'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Fallback icon for extra menu items'),
      '#default_value' => $this->getSetting('responsive_menus_google_nexus_icon_fallback'),
//      '#description' => t('This icon will be used for any number of menu items beyond the amount of icons you specified above.  See !documentation for examples.', ['!documentation' => l(t('Unicode Character Table'), 'http://unicode-table.com/en/')]),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getJsSettings() {
    $js_settings = [
      'selectors'     => $this->getSetting('responsive_menus_google_nexus_css_selectors'),
      'use_ecoicons'  => $this->getSetting('responsive_menus_google_nexus_use_ecoicons'),
      'icons'         => $this->getSettingArray('responsive_menus_google_nexus_icons'),
      'icon_fallback' => $this->getSetting('responsive_menus_google_nexus_icon_fallback'),

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
