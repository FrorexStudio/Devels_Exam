<?php

namespace Drupal\search_api_block\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\RendererInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Builds the search form for the search block.
 *
 * @internal
 */
class SearchApiForm extends FormBase {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Constructs a new SearchApiForm.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   */
  public function __construct(ConfigFactoryInterface $config_factory, RendererInterface $renderer) {
    $this->configFactory = $config_factory;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('renderer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'search_api_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $action_url = NULL, $input_name = 'keys') {

    if (!$action_url) {
      $form['message'] = [
        '#markup' => $this->t('Search is currently disabled'),
      ];
      return $form;
    }

    $form['#action'] = $action_url;
    $form['#method'] = 'get';

    $form[$input_name] = [
      '#type' => 'search',
      '#title' => $this->t('Search'),
      '#title_display' => 'invisible',
      '#size' => 15,
      '#default_value' => '',
      '#attributes' => ['title' => $this->t('Enter the terms you wish to search for.')],
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Search'),
      // Prevent op from showing up in the query string.
      '#name' => '',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // This form submits to the search page, so processing happens there.
  }

}
