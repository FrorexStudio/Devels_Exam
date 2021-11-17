<?php

namespace Drupal\responsive_menus\Plugin\ResponsiveMenus;

use Drupal\Core\Form\FormStateInterface;
use Drupal\responsive_menus\ResponsiveMenusPluginBase;
use Drupal\responsive_menus\ResponsiveMenusPluginInterface;

/**
 * Defines the "codrops_responsive_multi" plugin.
 *
 * @ResponsiveMenus(
 *   id = "codrops_responsive_multi",
 *   label = @Translation("ResponsiveMultiLevelMenu (codrops)"),
 *   library = "responsive_menus/codrops_responsive_multi"
 * )
 */
class CodropsResponsiveMulti extends ResponsiveMenusPluginBase implements ResponsiveMenusPluginInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSelectorInfo() {
    return t('Parent of the @ul.  Example: Given <code>@code</code> you would use @use', [
      '@ul'   => '<ul>',
      '@code' => '<div id="parent-div"> <ul class="menu"> </ul> </div>',
      '@use'  => '<strong>#parent-div</strong>',
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'responsive_menus_codrops_responsive_multi_css_selectors' => '#main-menu',
      'responsive_menus_codrops_responsive_multi_media_size'    => 768,
      'responsive_menus_codrops_responsive_multi_ani_in'        => 'dl-animate-in-1',
      'responsive_menus_codrops_responsive_multi_ani_out'       => 'dl-animate-out-1',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form['responsive_menus_codrops_responsive_multi_css_selectors'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('CSS selectors for which menu to responsify'),
      '#default_value' => $this->getSetting('responsive_menus_codrops_responsive_multi_css_selectors'),
      '#description'   => $this->t('Enter CSS/jQuery selector of menus to responsify.'),
    ];

    $form['responsive_menus_codrops_responsive_multi_media_size'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Screen width to respond to'),
      '#size'          => 5,
      '#default_value' => $this->getSetting('responsive_menus_codrops_responsive_multi_media_size'),
      '#description'   => $this->t('Width in pixels when we swap out responsive menu e.g. 768'),
    ];

    $form['responsive_menus_codrops_responsive_multi_ani_in'] = [
      '#type'          => 'select',
      '#title'         => $this->t('In-animation'),
      '#options'       => [
        'dl-animate-in-1' => $this->t('One'),
        'dl-animate-in-2' => $this->t('Two'),
        'dl-animate-in-3' => $this->t('Three'),
        'dl-animate-in-4' => $this->t('Four'),
        'dl-animate-in-5' => $this->t('Five'),
      ],
      '#default_value' => $this->getSetting('responsive_menus_codrops_responsive_multi_ani_in'),
    ];

    $form['responsive_menus_codrops_responsive_multi_ani_out'] = [
      '#type'          => 'select',
      '#title'         => $this->t('Out-animation'),
      '#options'       => [
        'dl-animate-out-1' => $this->t('One'),
        'dl-animate-out-2' => $this->t('Two'),
        'dl-animate-out-3' => $this->t('Three'),
        'dl-animate-out-4' => $this->t('Four'),
        'dl-animate-out-5' => $this->t('Five'),
      ],
      '#default_value' => $this->getSetting('responsive_menus_codrops_responsive_multi_ani_out'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getJsSettings() {
    $js_settings = [
      'selectors'     => $this->getSetting('responsive_menus_codrops_responsive_multi_css_selectors'),
      'media_size'    => $this->getSetting('responsive_menus_codrops_responsive_multi_media_size'),
      'animation_in'  => $this->getSetting('responsive_menus_codrops_responsive_multi_ani_in'),
      'animation_out' => $this->getSetting('responsive_menus_codrops_responsive_multi_ani_out'),
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
