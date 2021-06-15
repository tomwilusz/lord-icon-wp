<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function icon_exists($icon) {
    if (strlen($icon) == 0) {
        return false;
    }

    $dir = plugin_dir_path( __DIR__ ) . 'icons/';
    if (!file_exists($dir.$icon.'.json')) {
        return false;
    }

    return true;
}

function icon_path($icon) {
    $dir = plugin_dir_path( __DIR__ ) . 'icons/';
    return $dir.$icon.'.json';
}

function lord_icon_render( $attributes, $content = null ) {
    $icon = isset($attributes['icon']) ? $attributes['icon'] : '';
    $src = isset($attributes['src']) ? $attributes['src'] : '';
    $className = isset($attributes['className']) ? $attributes['className'] : '';
    $colors = isset($attributes['colors']) ? $attributes['colors'] : '';
    $trigger = isset($attributes['trigger']) ? $attributes['trigger'] : '';
    $size = isset($attributes['size']) ? $attributes['size'] : 0;
    $stroke = isset($attributes['stroke']) ? $attributes['stroke'] : 0;
    $delay = isset($attributes['delay']) ? $attributes['delay'] : 0;
 
    $style = "";
    if ($size) {
        $style .= 'width:'.(int)$size.'px;height:'.(int)$size.'px;';
    }

    $result = '<lord-icon';
    
    if (strlen($src)) {        
        $result .= ' src="'.$src.'"';
    } else { 
        if (!strlen($icon) or !icon_exists($icon)) {
            $icon = 'placeholder';
        }
        $src = plugins_url( '/icons/'.$icon.'.json', dirname( __FILE__ ) );
        $result .= ' src="'.$src.'"';
    }
    
    if (strlen($trigger) && $trigger !== 'none') {
        $result .= ' trigger="'.$trigger.'"';
    }
    
    if ($stroke) {
        $result .= ' stroke="'.$stroke.'"';
    }

    if (strlen($colors)) {
        $result .= ' colors="'.$colors.'"';
    }
    
    if (strlen($style)) {
        $result .= ' style="'.$style.'"';
    }
    
    if (strlen($className)) {
        $result .= ' class="'.$className.'"';
    }
    
    if ($delay && ($trigger == 'loop' || $trigger == 'loop-on-hover')) {
        $result .= ' delay="'.$delay.'"';
    }

    $result .= '>';
    
    if ($content) {
        $result .= $content;
    }
    
    $result .= '</lord-icon>';

    return $result;
}

class WP_LordIcon_Public {
    public function enqueue_styles() {
    }

    public function enqueue_scripts() {
    }
    
    public function enqueue_block_assets() {
        wp_enqueue_script(
            'lordicon-element-js',
            plugins_url( '/dist/element.js', dirname( __FILE__ ) ),
            array(),
            WP_LordIcon_Constants::plugin_version()
        );

        wp_enqueue_style(
            'lordicon-element-css',
            plugins_url( 'dist/element.css', dirname( __FILE__ ) ),
            array(),
            WP_LordIcon_Constants::plugin_version()
        );
    }

    public function register_dynamic_blocks() {
        register_block_type( 'lord-icon/element', array(
            'attributes' => array(
				'className' => array(
					'type' => 'string',
				),
				'trigger' => array(
					'type' => 'string',
				),
				'icon' => array(
					'type' => 'string',
				),
				'src' => array(
					'type' => 'string',
				),
				'colors' => array(
					'type' => 'string',
				),
				'size' => array(
					'type' => 'number',
				),
				'resize' => array(
					'type' => 'boolean',
				),
                'stroke' => array(
					'type' => 'number',
				),
				'restroke' => array(
					'type' => 'boolean',
				),
                'delay' => array(
					'type' => 'number',
				),
				'colorize' => array(
					'type' => 'boolean',
				),
			),
			'render_callback' => array( $this, 'lord_icon_render' ),
        ));
    }

    public function lord_icon_render( $attributes ) {
        if (!isset($attributes['resize']) || !$attributes['resize']) {
            unset($attributes['size']);
        }
        if (!isset($attributes['restroke']) || !$attributes['restroke']) {
            unset($attributes['stroke']);
        }
        return lord_icon_render( $attributes );
    }

    public function lord_icon_shortcode( $attributes, $content = null ) {
        if (isset($attributes['class'])) {
            $attributes['className'] = $attributes['class'];
        }
        return lord_icon_render( $attributes, $content );
    }

    public function register_rest() {
        register_rest_route(
			'lord-icon',
			'/icon-data',
			array(
				'methods'   => 'GET',
				'callback'  => array( $this, 'get_icon_data' ),
			)
		);
    }
    
    public function get_icon_data() {
        $icon = 'placeholder';
        
        if (isset($_GET['icon'])) {
            $icon = $_GET['icon'];
        }
        
        if (icon_exists($icon)) {
            return json_decode(file_get_contents(icon_path($icon)));
        } else {
            return false;
        }
    }
}