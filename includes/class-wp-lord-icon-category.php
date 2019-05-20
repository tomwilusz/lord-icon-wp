<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_LordIcon_Category {
	private static $instance;

	public static function register() {
		if ( null === self::$instance ) {
			self::$instance = new WP_LordIcon_Category();
		}
	}

	private function __construct() {
		add_filter( 'block_categories', array( $this, 'block_categories' ) );
	}

	/**
	 * Register our custom block category.
	 *
	 * @access public
	 * @link https://wordpress.org/gutenberg/handbook/extensibility/extending-blocks/#managing-block-categories
	 */
	public function block_categories( $categories ) {
		return array_merge(
			$categories,
			array(
				array(
					'slug'  => 'lordicon',
					'title' => __( 'Lordicon', 'lord-icon' ),
				),
			)
		);
	}
}

WP_LordIcon_Category::register();