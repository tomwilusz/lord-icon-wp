<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_LordIcon {
    public function __construct() {
        $this->load_dependencies();

		$this->define_admin_hooks();
		$this->define_public_hooks();
    }


	private function load_dependencies() {
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-lord-icon-constants.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-lord-icon-loader.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-wp-lord-icon-category.php';
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-wp-lord-icon-admin.php';
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-wp-lord-icon-public.php';
        
		$this->loader = new WP_LordIcon_Loader();
    }

    private function define_admin_hooks() {
		$plugin_admin = new WP_LordIcon_Admin();
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );
		$this->loader->add_action( 'enqueue_block_editor_assets', $plugin_admin, 'enqueue_block_editor_assets' );
	}

    private function define_public_hooks() {
        $plugin_public = new WP_LordIcon_Public();
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
        $this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );
		$this->loader->add_action( 'enqueue_block_assets', $plugin_public, 'enqueue_block_assets' );
		$this->loader->add_action( 'init', $plugin_public, 'register_dynamic_blocks' );
		$this->loader->add_action( 'rest_api_init', $plugin_public, 'register_rest' );

		$this->loader->add_shortcode( 'lord-icon', $plugin_public, 'lord_icon_shortcode' );
	}

    public function run() {
		$this->loader->run();
	}
}