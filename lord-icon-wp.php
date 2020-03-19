<?php
/**
* Plugin Name: Lordicon Interactive Icons
* Plugin URI: https://lordicon.com/wordpress-plugin
* Description: Insert and customize interactive, animated icons (Lottie, Bodymovin, json). Installing this plugin you are automatically given a free pack our 50 essential icons. Do you want more? Explore Lordicon’s animated icons library. You can also add your own Lottie files.
* Version: 1.6.0
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