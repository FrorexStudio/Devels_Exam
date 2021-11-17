<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Extension\SandboxExtension;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* themes/custom/exam/templates/navigation/menu.html.twig */
class __TwigTemplate_51e8667c7a89bee0ad0d654490b39002f6eec129058b2ec00ec6362faeb58752 extends \Twig\Template
{
    private $source;
    private $macros = [];

    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->source = $this->getSourceContext();

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $this->checkSecurity();
    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        $macros = $this->macros;
        // line 1
        $macros["menus"] = $this->macros["menus"] = $this;
        // line 2
        echo "
";
        // line 3
        echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(twig_call_macro($macros["menus"], "macro_menu_links", [($context["items"] ?? null), ($context["attributes"] ?? null), 0], 3, $context, $this->getSourceContext()));
        echo "

";
    }

    // line 5
    public function macro_menu_links($__items__ = null, $__attributes__ = null, $__menu_level__ = null, ...$__varargs__)
    {
        $macros = $this->macros;
        $context = $this->env->mergeGlobals([
            "items" => $__items__,
            "attributes" => $__attributes__,
            "menu_level" => $__menu_level__,
            "varargs" => $__varargs__,
        ]);

        $blocks = [];

        ob_start(function () { return ''; });
        try {
            // line 6
            echo "  ";
            $macros["menus"] = $this;
            // line 7
            echo "  ";
            if (($context["items"] ?? null)) {
                // line 8
                echo "    ";
                if ((($context["menu_level"] ?? null) == 0)) {
                    // line 9
                    echo "      <ul";
                    echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, ($context["attributes"] ?? null), "addClass", [0 => "menu"], "method", false, false, true, 9), 9, $this->source), "html", null, true);
                    echo ">
    ";
                } else {
                    // line 11
                    echo "      <ul class=\"menu\">
    ";
                }
                // line 13
                echo "    ";
                $context['_parent'] = $context;
                $context['_seq'] = twig_ensure_traversable(($context["items"] ?? null));
                foreach ($context['_seq'] as $context["_key"] => $context["item"]) {
                    // line 14
                    echo "      ";
                    // line 15
                    $context["classes"] = [0 => "menu-item", 1 => ((twig_get_attribute($this->env, $this->source,                     // line 17
$context["item"], "is_expanded", [], "any", false, false, true, 17)) ? ("menu-item--expanded") : ("")), 2 => ((twig_get_attribute($this->env, $this->source,                     // line 18
$context["item"], "is_collapsed", [], "any", false, false, true, 18)) ? ("menu-item--collapsed") : ("")), 3 => ((twig_get_attribute($this->env, $this->source,                     // line 19
$context["item"], "in_active_trail", [], "any", false, false, true, 19)) ? ("menu-item--active-trail") : (""))];
                    // line 22
                    echo "      <li";
                    echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, twig_get_attribute($this->env, $this->source, $context["item"], "attributes", [], "any", false, false, true, 22), "addClass", [0 => ($context["classes"] ?? null)], "method", false, false, true, 22), 22, $this->source), "html", null, true);
                    echo ">
        ";
                    // line 23
                    echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->extensions['Drupal\Core\Template\TwigExtension']->getLink($this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["item"], "title", [], "any", false, false, true, 23), 23, $this->source), $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["item"], "url", [], "any", false, false, true, 23), 23, $this->source)), "html", null, true);
                    echo "
        ";
                    // line 24
                    if (twig_get_attribute($this->env, $this->source, $context["item"], "below", [], "any", false, false, true, 24)) {
                        // line 25
                        echo "          ";
                        echo $this->extensions['Drupal\Core\Template\TwigExtension']->renderVar(twig_call_macro($macros["menus"], "macro_menu_links", [twig_get_attribute($this->env, $this->source, $context["item"], "below", [], "any", false, false, true, 25), ($context["attributes"] ?? null), (($context["menu_level"] ?? null) + 1)], 25, $context, $this->getSourceContext()));
                        echo "
        ";
                    }
                    // line 27
                    echo "      </li>
    ";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['item'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 29
                echo "    </ul>
  ";
            }

            return ('' === $tmp = ob_get_contents()) ? '' : new Markup($tmp, $this->env->getCharset());
        } finally {
            ob_end_clean();
        }
    }

    public function getTemplateName()
    {
        return "themes/custom/exam/templates/navigation/menu.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  121 => 29,  114 => 27,  108 => 25,  106 => 24,  102 => 23,  97 => 22,  95 => 19,  94 => 18,  93 => 17,  92 => 15,  90 => 14,  85 => 13,  81 => 11,  75 => 9,  72 => 8,  69 => 7,  66 => 6,  51 => 5,  44 => 3,  41 => 2,  39 => 1,);
    }

    public function getSourceContext()
    {
        return new Source("", "themes/custom/exam/templates/navigation/menu.html.twig", "/var/www/drupal9/web/themes/custom/exam/templates/navigation/menu.html.twig");
    }
    
    public function checkSecurity()
    {
        static $tags = array("import" => 1, "macro" => 5, "if" => 7, "for" => 13, "set" => 15);
        static $filters = array("escape" => 9);
        static $functions = array("link" => 23);

        try {
            $this->sandbox->checkSecurity(
                ['import', 'macro', 'if', 'for', 'set'],
                ['escape'],
                ['link']
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->source);

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }
}
