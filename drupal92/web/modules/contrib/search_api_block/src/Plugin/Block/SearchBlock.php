<?php

namespace Drupal\search_api_block\Plugin\Block;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\search_api_block\Form\SearchApiForm;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Search API form' block.
 *
 * @Block(
 *   id = "search_api_form_block",
 *   admin_label = @Translation("Search API form"),
 *   category = @Translation("Forms")
 * )
 */
class SearchBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The form builder.
   *
   * @var \Drupal\Core\Form\FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * Constructs a new SearchLocalTask.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Form\FormBuilderInterface $form_builder
   *   The form builder.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, FormBuilderInterface $form_builder) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->formBuilder = $form_builder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($configuration, $plugin_id, $plugin_definition,
      $container->get('form_builder')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    return AccessResult::allowed();
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $page = $this->configuration['action_url'] ?? NULL;
    $input_name = $this->configuration['input_name'] ?? '';
    return $this->formBuilder->getForm(SearchApiForm::class, $page, $input_name);
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'action_url' => '',
      'input_name' => '',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {

    $form['action_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Search page'),
      '#description' => $this->t('The search page that the form submits to.'),
      '#default_value' => $this->configuration['action_url'],
    ];

    $form['input_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Input name'),
      '#description' => $this->t('The name of the search input. This should be the name of the exposed filter'),
      '#default_value' => $this->configuration['input_name'],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $this->configuration['action_url'] = $form_state->getValue('action_url');
    $this->configuration['input_name'] = $form_state->getValue('input_name');
  }

}
