<?php
namespace LordIcon;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WP_LordIcon_Constants {
    const PLUGIN_VERSION = '2.0.0';
	const PLUGIN_NAME = 'lord-icon';
	const PLUGIN_BASENAME = 'lord-icon-wp/lord-icon-wp.php';

	public static function plugin_version() {
		return self::PLUGIN_VERSION;
    }

	public static function plugin_name() {
		return self::PLUGIN_NAME;
	}

	public static function plugin_basename() {
		return self::PLUGIN_BASENAME;
	}
}