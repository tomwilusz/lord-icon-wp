<?php
/**
* Plugin Name: Lordicon Animated Icons
* Plugin URI: https://github.com/tomwilusz/lord-icon-wp
* Description: Insert and customize interactive, animated icons (Lottie, json). Get access to hundreds of free animated icons from Lordicon’s animated icons library. You can also add your own Lottie animations.
* Version: 2.0.1
* Author: Lordicon
* Author URI: https://lordicon.com/
**/

// Exit if accessed directly.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require plugin_dir_path( __FILE__ ) . 'includes/class-wp-lord-icon.php';

/**
 * Begins execution of the plugin.
 */
function run_wp_loid_icon() {
	$plugin = new \LordIcon\WP_LordIcon();
	$plugin->run();
}
run_wp_loid_icon();

add_filter(
	'upload_mimes',
	function( $types ) {
		return array_merge( $types, [ 'json' => 'text/plain' ] );
	}
);

function load_wp_media_files() {
    wp_enqueue_media();
}

add_action( 'admin_enqueue_scripts', 'load_wp_media_files' );