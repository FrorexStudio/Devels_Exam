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

/* modules/contrib/social_media_links/templates/social-media-links-platforms.html.twig */
class __TwigTemplate_167d7968a066ac0b4eb56df7dbbf8ba7063a617832e29f1b5009a4294be2c9dd extends \Twig\Template
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
        // line 6
        echo "
";
        // line 8
        $context["classes"] = [0 => "social-media-links--platforms", 1 => "platforms", 2 => (((twig_get_attribute($this->env, $this->source,         // line 11
($context["appearance"] ?? null), "orientation", [], "any", false, false, true, 11) == "h")) ? ("inline horizontal") : ("vertical"))];
        // line 14
        echo "
<ul";
        // line 15
        echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, ($context["attributes"] ?? null), "addClass", [0 => ($context["classes"] ?? null)], "method", false, false, true, 15), 15, $this->source), "html", null, true);
        echo ">
  ";
        // line 16
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable(($context["platforms"] ?? null));
        foreach ($context['_seq'] as $context["_key"] => $context["platform"]) {
            // line 17
            echo "    <li>
      <a class=\"social-media-link-icon--";
            // line 18
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "id", [], "any", false, false, true, 18), 18, $this->source), "html", null, true);
            echo "\" href=\"";
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "url", [], "any", false, false, true, 18), 18, $this->source), "html", null, true);
            echo "\" ";
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "attributes", [], "any", false, false, true, 18), 18, $this->source), "html", null, true);
            echo " >
        ";
            // line 19
            echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "element", [], "any", false, false, true, 19), 19, $this->source), "html", null, true);
            echo "
      </a>

      ";
            // line 22
            if (twig_get_attribute($this->env, $this->source, ($context["appearance"] ?? null), "show_name", [], "any", false, false, true, 22)) {
                // line 23
                echo "        ";
                if ((twig_get_attribute($this->env, $this->source, ($context["appearance"] ?? null), "orientation", [], "any", false, false, true, 23) == "h")) {
                    // line 24
                    echo "          <br />
        ";
                }
                // line 26
                echo "
        <span><a class=\"social-media-link--";
                // line 27
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "id", [], "any", false, false, true, 27), 27, $this->source), "html", null, true);
                echo "\" href=\"";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "url", [], "any", false, false, true, 27), 27, $this->source), "html", null, true);
                echo "\" ";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "attributes", [], "any", false, false, true, 27), 27, $this->source), "html", null, true);
                echo ">";
                echo $this->extensions['Drupal\Core\Template\TwigExtension']->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(twig_get_attribute($this->env, $this->source, $context["platform"], "name", [], "any", false, false, true, 27), 27, $this->source), "html", null, true);
                echo "</a></span>
      ";
            }
            // line 29
            echo "    </li>
  ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['platform'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 31
        echo "</ul>
";
    }

    public function getTemplateName()
    {
        return "modules/contrib/social_media_links/templates/social-media-links-platforms.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  103 => 31,  96 => 29,  85 => 27,  82 => 26,  78 => 24,  75 => 23,  73 => 22,  67 => 19,  59 => 18,  56 => 17,  52 => 16,  48 => 15,  45 => 14,  43 => 11,  42 => 8,  39 => 6,);
    }

    public function getSourceContext()
    {
        return new Source("", "modules/contrib/social_media_links/templates/social-media-links-platforms.html.twig", "/var/www/drupal9/web/modules/contrib/social_media_links/templates/social-media-links-platforms.html.twig");
    }
    
    public function checkSecurity()
    {
        static $tags = array("set" => 8, "for" => 16, "if" => 22);
        static $filters = array("escape" => 15);
        static $functions = array();

        try {
            $this->sandbox->checkSecurity(
                ['set', 'for', 'if'],
                ['escape'],
                []
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
