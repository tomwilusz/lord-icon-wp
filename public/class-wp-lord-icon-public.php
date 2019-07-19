<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function icon_lists() {
    $dir = plugin_dir_path( __DIR__ ) . 'icons/';
    $icons = array();

    $dircontents = scandir($dir);
	
	foreach ($dircontents as $file) {
		$extension = pathinfo($file, PATHINFO_EXTENSION);
		if ($extension == 'json') {
            $icons[] = pathinfo($file, PATHINFO_FILENAME);
		}
	}

    return $icons;
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

function lord_icon_render( $attributes, $content = null ) {
    $icon = isset($attributes['icon']) ? $attributes['icon'] : '';

    if (strlen($icon) == 0) {
        return '';
    }

    if (!icon_exists($icon)) {
        return 'Invalid icon.';
    }

    $className = isset($attributes['className']) ? $attributes['className'] : '';
    $palette = isset($attributes['palette']) ? $attributes['palette'] : '';
    $animation = isset($attributes['animation']) ? $attributes['animation'] : '';
    $size = isset($attributes['size']) ? $attributes['size'] : 0;
    $src = plugins_url( '/icons/'.$icon.'.json', dirname( __FILE__ ) );

    $style = "";
    if ($size) {
        $style .= 'width:'.(int)$size.'px;height:'.(int)$size.'px;';
    }

    $result = '<lord-icon';
    $result .= ' src="'.$src.'"';
    if (strlen($style)) {
        $result .= ' style="'.$style.'"';
    }
    if (strlen($animation) && $animation !== 'none') {
        $result .= ' animation="'.$animation.'"';
    }
    if (strlen($palette)) {
        $result .= ' palette="'.$palette.'"';
    }
    if (strlen($className)) {
        $result .= ' class="'.$className.'"';
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
				'animation' => array(
					'type' => 'string',
				),
				'icon' => array(
					'type' => 'string',
				),
				'palette' => array(
					'type' => 'string',
				),
				'size' => array(
					'type' => 'number',
				),
				'resize' => array(
					'type' => 'boolean',
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
			'/icons',
			array(
				'methods'   => 'GET',
				'callback'  => array( $this, 'get_icons' ),
			)
		);
        register_rest_route(
			'lord-icon',
			'/icon-data',
			array(
				'methods'   => 'GET',
				'callback'  => array( $this, 'get_icon_data' ),
			)
		);
    }

    public function get_icons() {
        return icon_lists();
    }
    
    public function get_icon_data() {
        $icon = $_GET['icon'];
        if (!strlen($icon) || !icon_exists($icon)) {
            return false;
        }

        $dir = plugin_dir_path( __DIR__ ) . 'icons/';
        return json_decode(file_get_contents($dir . $icon . '.json'));
    }
}